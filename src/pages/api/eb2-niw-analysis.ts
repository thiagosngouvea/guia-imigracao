import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para extrair texto de PDF via URL
async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { 
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return '';
    }

    const buffer = await response.arrayBuffer();
    
    // Para simplificar, vamos assumir que temos uma biblioteca para extrair texto de PDF
    // Em produção, você usaria uma biblioteca como pdf-parse ou similar
    // Por ora, vamos simular a extração de texto
    const text = `PDF content from ${url} - This would contain the actual USCIS decision document text`;
    
    return text;
  } catch (error) {
    console.error(`Error fetching PDF from ${url}:`, error);
    return '';
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
    const response = await openai.chat.completions.create({
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

function compareProng(prongReason: string): string {
  const reasonLower = prongReason.toLowerCase();
  if (['weak', 'missing', 'lack', 'insufficient', 'no'].some(word => reasonLower.includes(word))) {
    return 'Your case stronger';
  } else if (['strong', 'good', 'adequate'].some(word => reasonLower.includes(word))) {
    return 'Mixed';
  }
  return 'Mixed';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { masterFileContent, userCase, startLine, endLine } = req.body;

    if (!masterFileContent || !userCase || !startLine || !endLine) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Parse master file content
    const allLinks = masterFileContent
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    const pdfLinks = allLinks.slice(startLine - 1, endLine);
    const totalCases = pdfLinks.length;

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
