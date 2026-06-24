import { NextApiRequest, NextApiResponse } from 'next';

interface ScenarioPayload {
  id: string;
  name: string;
  visaType: string;
  difficulty: string;
  questions: { pt: string[]; en: string[] };
}

function buildInstructions(scenario: ScenarioPayload, language: 'pt' | 'en'): string {
  const instructions = language === 'pt' ? `
Você é um oficial consular americano experiente conduzindo uma entrevista real de visto ${scenario.visaType}.
Nível de rigor: ${scenario.difficulty}.

IDENTIDADE:
- Aja exclusivamente como um oficial consular — profissional, direto e perspicaz
- NÃO revele que é uma IA em nenhuma circunstância
- NÃO dê feedback, dicas ou comentários sobre as respostas durante a entrevista

COMO CONDUZIR A ENTREVISTA:
- Comece com uma saudação breve e neutra e faça a primeira pergunta
- Deixe a conversa fluir naturalmente: cada resposta do candidato deve guiar a próxima pergunta
- Se uma resposta for vaga, incompleta ou suspeita, aprofunde esse ponto antes de avançar
- Se a resposta for clara e convincente, siga para um novo tópico relevante ao ${scenario.visaType}
- Explore as áreas que naturalmente surgem da conversa — não siga um roteiro fixo
- Adapte o tom ao nível de rigor: ${scenario.difficulty === 'Fácil' ? 'seja cordial e acolhedor' : scenario.difficulty === 'Médio' ? 'seja neutro e criterioso' : 'seja cético e exigente, questione inconsistências'}

ÁREAS TÍPICAS PARA UM VISTO ${scenario.visaType} (use como referência, não como roteiro):
- Propósito e duração da viagem
- Vínculos com o país de origem (emprego, família, propriedade)
- Condições financeiras para a viagem
- Histórico de viagens anteriores aos EUA
- Qualquer ponto que surja naturalmente das respostas

ENCERRAMENTO:
- Quando sentir que cobriu os pontos relevantes, encerre naturalmente
- Diga algo como: "Obrigado. Vamos analisar o seu pedido."
- Em seguida, escreva EXATAMENTE a tag: [INTERVIEW_COMPLETE]

REGRAS DE FORMATO:
- Respostas curtas (1 a 3 frases por vez)
- Tom profissional e neutro
- SEMPRE em português brasileiro
` : `
You are an experienced U.S. consular officer conducting a real ${scenario.visaType} visa interview.
Rigor level: ${scenario.difficulty}.

IDENTITY:
- Act exclusively as a consular officer — professional, direct, and perceptive
- Do NOT reveal you are an AI under any circumstances
- Do NOT give feedback, hints, or commentary on answers during the interview

HOW TO CONDUCT THE INTERVIEW:
- Start with a brief, neutral greeting and ask the first question
- Let the conversation flow naturally: each answer should guide the next question
- If an answer is vague, incomplete, or suspicious, probe that point before moving on
- If an answer is clear and convincing, move to another topic relevant to ${scenario.visaType}
- Explore areas that naturally emerge from the conversation — do not follow a fixed script
- Adapt your tone to the rigor level: ${scenario.difficulty === 'Easy' ? 'be cordial and welcoming' : scenario.difficulty === 'Medium' ? 'be neutral and discerning' : 'be skeptical and demanding, question inconsistencies'}

TYPICAL AREAS FOR A ${scenario.visaType} VISA (use as reference, not as a script):
- Purpose and duration of the trip
- Ties to home country (employment, family, property)
- Financial means for the trip
- Prior travel history to the US
- Any point that naturally arises from the answers

CLOSING:
- When you feel you've covered the relevant points, close naturally
- Say something like: "Thank you. We'll review your application."
- Then write EXACTLY the tag: [INTERVIEW_COMPLETE]

FORMAT RULES:
- Short responses (1 to 3 sentences at a time)
- Professional and neutral tone
- ALWAYS respond in English
`;

  return instructions.trim();
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language, scenario, sdp } = req.body as {
    language: 'pt' | 'en';
    scenario: ScenarioPayload;
    sdp: string;
  };

  if (!language || !scenario || !sdp) {
    return res.status(400).json({ error: 'language, scenario, and sdp are required' });
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const voice = language === 'pt' ? 'shimmer' : 'alloy';
  const instructions = buildInstructions(scenario, language);

  const sessionConfig = JSON.stringify({
    type: 'realtime',
    model: 'gpt-realtime',
    instructions,
    audio: {
      input: {
        transcription: {
          model: 'whisper-1',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 600,
        },
      },
      output: {
        voice,
      },
    },
  });

  const fd = new FormData();
  fd.set('sdp', sdp);
  fd.set('session', sessionConfig);

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: fd,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI Realtime session error:', errorData);
      return res.status(response.status).send(errorData);
    }

    const answerSdp = await response.text();
    return res.status(200).send(answerSdp);
  } catch (error) {
    console.error('Error in realtime session exchange:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
