import { NextApiRequest, NextApiResponse } from 'next';

interface RealtimeRequest {
  scenario: {
    id: string;
    name: string;
    visaType: string;
    difficulty: string;
    questions: {
      pt: string[];
      en: string[];
    };
  };
  language: 'pt' | 'en';
  questionIndex: number;
  sdp: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse do body - pode ser SDP direto ou JSON com SDP e configuração
    let sdp: string;
    let scenario, language, questionIndex;

    if (req.headers['content-type']?.includes('application/sdp')) {
      // SDP direto do cliente
      sdp = req.body;
      // Usar configuração padrão se não fornecida
      scenario = null;
      language = 'en';
      questionIndex = 0;
    } else {
      // JSON com SDP e configuração
      const data: RealtimeRequest = req.body;
      sdp = data.sdp;
      scenario = data.scenario;
      language = data.language;
      questionIndex = data.questionIndex;
    }

    // Configuração da sessão
    const sessionConfig = JSON.stringify({
      session: {
        type: "realtime",
        model: "gpt-4o-realtime-preview-2024-10-01",
        instructions: scenario && language === 'pt' 
          ? `Você é um oficial consular americano experiente conduzindo uma entrevista de visto ${scenario.visaType}. 
             Seu objetivo é avaliar se o candidato é elegível para o visto.
             
             Cenário: ${scenario.name}
             Nível: ${scenario.difficulty}
             
             Instruções:
             - Seja profissional mas amigável
             - Faça perguntas de acompanhamento quando necessário
             - Forneça feedback construtivo sobre as respostas
             - Se a resposta for inadequada, oriente como melhorar
             - Mantenha o foco no tipo de visto específico
             - Responda em português brasileiro
             - Seja conciso mas informativo
             
             Pergunta atual (${questionIndex + 1}): ${scenario.questions.pt[questionIndex] || 'Entrevista concluída'}`
          : scenario && language === 'en'
          ? `You are an experienced U.S. consular officer conducting a ${scenario.visaType} visa interview.
             Your goal is to assess if the applicant is eligible for the visa.
             
             Scenario: ${scenario.name}
             Level: ${scenario.difficulty}
             
             Instructions:
             - Be professional but friendly
             - Ask follow-up questions when necessary
             - Provide constructive feedback on answers
             - If an answer is inadequate, guide how to improve
             - Stay focused on the specific visa type
             - Respond in English
             - Be concise but informative
             
             Current question (${questionIndex + 1}): ${scenario.questions.en[questionIndex] || 'Interview completed'}`
          : "You are a helpful AI assistant conducting a practice interview.",
        audio: {
          output: {
            voice: "alloy"
          }
        },
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        },
        temperature: 0.7,
        max_response_output_tokens: 500
      }
    });

    // Criar FormData para enviar SDP e configuração
    const formData = new FormData();
    formData.set('sdp', sdp);
    formData.set('session', sessionConfig);

    // Fazer solicitação para OpenAI Realtime API
    const response = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da OpenAI:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    // Retornar SDP de resposta
    const answerSdp = await response.text();
    
    res.setHeader('Content-Type', 'application/sdp');
    res.send(answerSdp);

  } catch (error) {
    console.error('Erro ao criar sessão WebRTC:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
