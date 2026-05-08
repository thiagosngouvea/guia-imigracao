import { NextApiRequest, NextApiResponse } from 'next';

interface TranscriptEntry {
  role: 'user' | 'ai';
  text: string;
}

interface FeedbackRequest {
  transcript: TranscriptEntry[];
  visaType: string;
  scenarioName: string;
  language: 'pt' | 'en';
}

export interface FeedbackSection {
  score: number; // 0-10
  overall: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  verdict: 'aprovado' | 'improvavel' | 'reprovado';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, visaType, scenarioName, language } = req.body as FeedbackRequest;

  if (!transcript || transcript.length === 0) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  // Format transcript for the prompt
  const transcriptText = transcript
    .map((t) => `${t.role === 'user' ? 'CANDIDATO' : 'OFICIAL'}: ${t.text}`)
    .join('\n');

  const systemPrompt = language === 'pt'
    ? `Você é um especialista em imigração americana e avaliador de entrevistas consulares com 20 anos de experiência.
Sua tarefa é analisar a transcrição de uma entrevista simulada de visto ${visaType} e fornecer um feedback detalhado, honesto e construtivo.

Você deve responder EXCLUSIVAMENTE em JSON válido com esta estrutura exata:
{
  "score": <número de 0 a 10>,
  "overall": "<parágrafo de 2-3 frases resumindo o desempenho geral>",
  "strengths": ["<ponto forte 1>", "<ponto forte 2>", ...],
  "weaknesses": ["<ponto fraco 1>", "<ponto fraco 2>", ...],
  "tips": ["<dica específica para o visto ${visaType} 1>", "<dica 2>", ...],
  "verdict": "<'aprovado' se score >= 7, 'improvavel' se score entre 4-6, 'reprovado' se score <= 3>"
}

Critérios de avaliação para visto ${visaType}:
- Clareza e coerência nas respostas
- Consistência das informações fornecidas
- Credibilidade dos vínculos com o Brasil (intenção de retorno)
- Adequação do propósito da viagem ao tipo de visto
- Confiança e profissionalismo na comunicação
- Capacidade financeira demonstrada
- Detalhes específicos que fortalecem ou enfraquecem o caso`
    : `You are an American immigration expert and consular interview evaluator with 20 years of experience.
Your task is to analyze the transcript of a simulated ${visaType} visa interview and provide detailed, honest, and constructive feedback.

You MUST respond EXCLUSIVELY in valid JSON with this exact structure:
{
  "score": <number from 0 to 10>,
  "overall": "<2-3 sentence paragraph summarizing overall performance>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "tips": ["<specific tip for ${visaType} visa 1>", "<tip 2>", ...],
  "verdict": "<'aprovado' if score >= 7, 'improvavel' if score 4-6, 'reprovado' if score <= 3>"
}

Evaluation criteria for ${visaType} visa:
- Clarity and coherence of answers
- Consistency of provided information
- Credibility of ties to home country (intent to return)
- Appropriateness of travel purpose for visa type
- Confidence and professionalism in communication
- Demonstrated financial capacity
- Specific details that strengthen or weaken the case`;

  const userPrompt = language === 'pt'
    ? `Cenário: ${scenarioName} | Visto: ${visaType}\n\nTRANSCRIÇÃO DA ENTREVISTA:\n${transcriptText}\n\nAnalise esta entrevista e forneça o feedback em JSON.`
    : `Scenario: ${scenarioName} | Visa: ${visaType}\n\nINTERVIEW TRANSCRIPT:\n${transcriptText}\n\nAnalyze this interview and provide feedback in JSON.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any)?.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const feedback: FeedbackSection = JSON.parse(content);
    return res.status(200).json(feedback);

  } catch (error) {
    console.error('Error generating feedback:', error);
    return res.status(500).json({ error: 'Failed to generate feedback' });
  }
}
