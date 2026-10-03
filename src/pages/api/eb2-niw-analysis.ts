import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../../lib/server/auth';
import { spendUserCredits } from '../../lib/server/credits';
import { getOpenAI } from '../../lib/server/openai';
import { enforceRateLimit } from '../../lib/server/rate-limit';

interface UserCase {
  prong1: string;
  prong2: string;
  prong3: string;
}

interface CaseAnalysis {
  pdfLink: string;
  prong1Reason: string;
  prong2Reason: string;
  prong3Reason: string;
  prong1Verdict: string;
  prong2Verdict: string;
  prong3Verdict: string;
  finalVerdict: string;
  isNIW: boolean;
}

// Função para extrair texto de PDF via URL
async function extractTextFromUrl(url: string): Promise<string> {
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== 'https:' ||
      !(parsedUrl.hostname === 'uscis.gov' || parsedUrl.hostname.endsWith('.uscis.gov')) ||
      !parsedUrl.pathname.toLowerCase().endsWith('.pdf')) {
    throw new Error('PDF URL is not an approved USCIS URL');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      redirect: 'error',
      headers: {
        'User-Agent': 'MoveEasy/1.0 (+https://moveeasy.app)'
      }
    });
    if (!response.ok) throw new Error(`USCIS returned ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('pdf')) throw new Error('Remote file is not a PDF');

    const contentLength = Number(response.headers.get('content-length')) || 0;
    if (contentLength > 15 * 1024 * 1024) throw new Error('PDF is too large');

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length || buffer.length > 15 * 1024 * 1024) throw new Error('PDF is too large');

    const pdfParse = (await import('pdf-parse')).default;
    const parsed = await pdfParse(buffer, { max: 80 });
    return parsed.text.trim();
  } catch (error) {
    console.error(`Error fetching PDF from ${url}:`, error);
    return '';
  } finally {
    clearTimeout(timeoutId);
  }
}

// Função para analisar caso NIW com OpenAI
async function analyzeNIWCase(text: string, userCase: UserCase): Promise<CaseAnalysis | null> {
  const prompt = `
You are an immigration expert analyzing USCIS decision documents.

The following text is a USCIS decision document:
${text.substring(0, 12000)}

First:
- Determine if this case is an EB-2 NIW petition. Answer "Yes" or "No".

If Yes, then analyze the rejection reasons for each NIW prong:
1. Prong 1 (Substantial Merit and National Importance)
2. Prong 2 (Well Positioned to Advance Endeavor)  
3. Prong 3 (Benefit to U.S. and PERM Waiver justified)

For each prong, write 1-2 sentences explaining the failure reason.

Then compare each prong failure with the user's case described below:

User's Case:
- Prong 1: ${userCase.prong1}
- Prong 2: ${userCase.prong2}
- Prong 3: ${userCase.prong3}

For each prong comparison, determine if the user's case is:
- "Your case stronger" (if the rejection reason doesn't apply to user's case)
- "Mixed" (if unclear or similar strength)
- "Weaker" (if user's case has similar issues)

Format your response as:
NIW_CASE: Yes/No
PRONG1_REASON: [reason]
PRONG1_VERDICT: [verdict]
PRONG2_REASON: [reason]
PRONG2_VERDICT: [verdict]
PRONG3_REASON: [reason]
PRONG3_VERDICT: [verdict]

If No, just respond with: NIW_CASE: No
`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful immigration law expert assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    // Parse a resposta
    const lines = content.split('\n');
    const data: any = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        data[key.trim()] = value;
      }
    }

    if (data['NIW_CASE'] === 'No') {
      return {
        pdfLink: '',
        prong1Reason: 'Not NIW',
        prong2Reason: 'Not NIW', 
        prong3Reason: 'Not NIW',
        prong1Verdict: 'Not NIW',
        prong2Verdict: 'Not NIW',
        prong3Verdict: 'Not NIW',
        finalVerdict: 'Not NIW',
        isNIW: false
      };
    }

    // Determinar veredito final
    const verdicts = [
      data['PRONG1_VERDICT'] || 'Mixed',
      data['PRONG2_VERDICT'] || 'Mixed',
      data['PRONG3_VERDICT'] || 'Mixed'
    ];

    let finalVerdict = 'Mixed or equal';
    const strongerCount = verdicts.filter(v => v === 'Your case stronger').length;
    
    if (strongerCount === 3) {
      finalVerdict = 'Your case much stronger';
    } else if (strongerCount >= 1) {
      finalVerdict = 'Your case slightly stronger';
    }

    return {
      pdfLink: '',
      prong1Reason: data['PRONG1_REASON'] || 'Parse Error',
      prong2Reason: data['PRONG2_REASON'] || 'Parse Error',
      prong3Reason: data['PRONG3_REASON'] || 'Parse Error',
      prong1Verdict: data['PRONG1_VERDICT'] || 'Mixed',
      prong2Verdict: data['PRONG2_VERDICT'] || 'Mixed',
      prong3Verdict: data['PRONG3_VERDICT'] || 'Mixed',
      finalVerdict,
      isNIW: true
    };

  } catch (error) {
    console.error('Error during OpenAI API call:', error);
    return null;
  }
}

// Função removida - não está sendo utilizada

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;
  if (!await enforceRateLimit(res, {
    scope: 'eb2-niw-analysis', key: user.uid, limit: 2, windowSeconds: 3600,
  })) return;

  try {
    const { userCase, startLine, endLine } = req.body;

    const validCase = userCase && ['prong1', 'prong2', 'prong3'].every((key) =>
      typeof userCase[key] === 'string' && userCase[key].trim().length >= 20 && userCase[key].length <= 6000
    );
    const validRange = Number.isInteger(startLine) && Number.isInteger(endLine) &&
      startLine >= 1 && endLine >= startLine && endLine - startLine < 10;
    if (!validCase || !validRange) {
      return res.status(400).json({ error: 'Invalid analysis request' });
    }

    // Read Master_file from server
    const masterFilePath = path.join(process.cwd(), 'src', 'utils', 'Master_file');
    
    if (!fs.existsSync(masterFilePath)) {
      return res.status(404).json({ error: 'Master_file not found on server' });
    }

    const masterFileContent = fs.readFileSync(masterFilePath, 'utf-8');

    // Parse master file content
    const allLinks = masterFileContent
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    const pdfLinks = allLinks.slice(startLine - 1, endLine);
    const totalCases = pdfLinks.length;
    if (!totalCases) return res.status(400).json({ error: 'No cases found in requested range' });

    const creditResult = await spendUserCredits(user.uid, 'eb2niw');
    if (!creditResult.success) {
      return res.status(402).json({ error: creditResult.error, currentBalance: creditResult.newBalance });
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    let processedCount = 0;

    for (const [index, link] of pdfLinks.entries()) {
      try {
        // Send progress update
        const progressData = {
          type: 'progress',
          processed: processedCount,
          total: totalCases,
          currentCase: link
        };
        res.write(JSON.stringify(progressData) + '\n');

        // Extract text from PDF
        const text = await extractTextFromUrl(link);
        
        if (!text) {
          processedCount++;
          continue;
        }

        // Analyze with OpenAI
        const analysis = await analyzeNIWCase(text, userCase);
        
        if (analysis) {
          analysis.pdfLink = link;
          
          // Send result
          const resultData = {
            type: 'result',
            analysis
          };
          res.write(JSON.stringify(resultData) + '\n');
        }

        processedCount++;

        // Add delay to avoid rate limiting
        if (index < pdfLinks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`Error processing ${link}:`, error);
        processedCount++;
        continue;
      }
    }

    // Send final progress
    const finalProgress = {
      type: 'progress',
      processed: processedCount,
      total: totalCases,
      currentCase: 'Análise concluída'
    };
    res.write(JSON.stringify(finalProgress) + '\n');
    
    res.end();

  } catch (error) {
    console.error('Error in EB2 NIW analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
