import { NextApiRequest, NextApiResponse } from 'next';

interface ScenarioPayload {
  id: string;
  name: string;
  visaType: string;
  difficulty: string;
  questions: { pt: string[]; en: string[] };
}

function buildInstructions(scenario: ScenarioPayload, language: 'pt' | 'en'): string {
  const questions = scenario.questions[language];
  const lang = language === 'pt' ? 'português brasileiro' : 'English';
  const officerIntro = language === 'pt'
    ? `Você é um oficial consular americano experiente conduzindo uma entrevista de visto ${scenario.visaType}.`
    : `You are an experienced U.S. consular officer conducting a ${scenario.visaType} visa interview.`;

  const instructions = language === 'pt' ? `
${officerIntro}

Cenário: ${scenario.name}
Nível de dificuldade: ${scenario.difficulty}
Idioma: ${lang}

Suas responsabilidades:
1. Cumprimente o candidato brevemente e conduza a entrevista de forma profissional
2. Faça as perguntas da lista abaixo, uma de cada vez
3. Após cada resposta, faça perguntas de acompanhamento quando necessário (máximo 1-2)
4. Se a resposta for incompleta ou problemática, sinalize educadamente e dê a chance de complementar
5. Avance para a próxima pergunta quando satisfeito com a resposta
6. Ao final das perguntas, dê um feedback breve e objetivo sobre o desempenho geral

Perguntas da entrevista (guie a conversa por elas em ordem):
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Regras importantes:
- Seja profissional, neutro e objetivo como um oficial consular real
- Respostas curtas e diretas (máximo 2-3 frases por vez)
- SEMPRE responda em português brasileiro
- NÃO revele que é uma IA ou que está simulando
- Mantenha o ritmo de uma entrevista real (não se prolongue)
` : `
${officerIntro}

Scenario: ${scenario.name}
Difficulty: ${scenario.difficulty}
Language: ${lang}

Your responsibilities:
1. Greet the applicant briefly and conduct the interview professionally
2. Ask the questions from the list below, one at a time
3. After each answer, ask follow-up questions when necessary (max 1-2)
4. If an answer is incomplete or problematic, politely indicate and give them a chance to elaborate
5. Move to the next question when satisfied with the answer
6. At the end, give brief and objective feedback on overall performance

Interview questions (guide the conversation through them in order):
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Important rules:
- Be professional, neutral, and objective like a real consular officer
- Keep responses short and direct (max 2-3 sentences at a time)
- ALWAYS respond in English
- Do NOT reveal you are an AI or that you are simulating
- Maintain the pace of a real interview (don't drag on)
`;

  return instructions.trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language, scenario } = req.body as {
    language: 'pt' | 'en';
    scenario: ScenarioPayload;
  };

  if (!language || !scenario) {
    return res.status(400).json({ error: 'language and scenario are required' });
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const voice = language === 'pt' ? 'shimmer' : 'alloy';
  const instructions = buildInstructions(scenario, language);

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice,
        instructions,
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 600,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = (errorData as any)?.error?.message || 'Failed to create realtime session';
      console.error('OpenAI Realtime session error:', message);
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json() as {
      client_secret: { value: string; expires_at: number };
    };

    return res.status(200).json({
      clientSecret: data.client_secret.value,
      expiresAt: data.client_secret.expires_at,
    });
  } catch (error) {
    console.error('Error creating realtime session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
