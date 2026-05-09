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

  const instructions = language === 'pt' ? `
Você é um oficial consular americano experiente e criterioso conduzindo uma entrevista real de visto ${scenario.visaType}.

Cenário: ${scenario.name} | Nível: ${scenario.difficulty}

COMPORTAMENTO:
- Conduza uma entrevista natural e fluida, como um oficial real faria
- Comece com uma saudação profissional e breve e faça a primeira pergunta
- Use as perguntas-guia abaixo como referência dos tópicos a cobrir, MAS:
  • Não precisa seguir a ordem exata
  • Pode fazer perguntas de acompanhamento quando a resposta levantar pontos importantes
  • Pode aprofundar em qualquer área que pareça inconsistente ou interessante
  • Pode fazer perguntas fora da lista se o contexto da conversa pedir
- Reaja genuinamente às respostas: se algo soar suspeito, questione; se soar convincente, avance
- Quando tiver coberto os principais tópicos, encerre a entrevista naturalmente dizendo que vai analisar o pedido

TÓPICOS-GUIA (cubra todos, mas de forma natural):
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

REGRAS:
- Respostas curtas (1-3 frases por vez), tom profissional e neutro
- SEMPRE em português brasileiro
- NÃO revele que é uma IA
- NÃO dê feedback durante a entrevista — apenas conduza-a
- Quando decidir encerrar a entrevista, diga algo como "Obrigado. Vamos analisar seu pedido." e em seguida escreva exatamente a tag: [INTERVIEW_COMPLETE]
` : `
You are an experienced and discerning U.S. consular officer conducting a real ${scenario.visaType} visa interview.

Scenario: ${scenario.name} | Level: ${scenario.difficulty}

BEHAVIOR:
- Conduct a natural, fluid interview as a real officer would
- Start with a brief professional greeting and ask the first question
- Use the guide questions below as topics to cover, BUT:
  • No need to follow the exact order
  • Ask follow-up questions when an answer raises important points
  • Probe deeper into any area that seems inconsistent or interesting
  • Ask off-script questions if the conversation calls for it
- React genuinely to answers: if something seems suspicious, probe it; if convincing, move on
- When you've covered the main topics, naturally close the interview by saying you'll review the application

GUIDE TOPICS (cover all, but naturally):
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

RULES:
- Short answers (1-3 sentences), professional and neutral tone
- ALWAYS respond in English
- Do NOT reveal you are an AI
- Do NOT give feedback during the interview — only conduct it
- When you decide to close the interview, say something like "Thank you. We'll review your application." and then write exactly the tag: [INTERVIEW_COMPLETE]
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
