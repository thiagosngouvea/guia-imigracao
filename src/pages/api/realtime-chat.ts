import { NextApiRequest, NextApiResponse } from 'next';
import WebSocket from 'ws';

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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scenario, language, questionIndex }: RealtimeRequest = req.body;

  try {
    // Configurar conexão WebSocket com OpenAI Realtime API
    const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
    const ws = new WebSocket(url, {
      headers: {
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        "OpenAI-Beta": "realtime=v1"
      },
    });

    // Configurar o sistema quando a conexão abrir
    ws.on("open", function open() {
      console.log("Connected to OpenAI Realtime API");
      
      // Configurar a sessão
      const sessionConfig = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: language === 'pt' 
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
            : `You are an experienced U.S. consular officer conducting a ${scenario.visaType} visa interview.
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
               
               Current question (${questionIndex + 1}): ${scenario.questions.en[questionIndex] || 'Interview completed'}`,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 200
          },
          tools: [],
          tool_choice: "none",
          temperature: 0.7,
          max_response_output_tokens: 500
        }
      };

      ws.send(JSON.stringify(sessionConfig));
    });

    // Retornar informações da conexão para o frontend
    res.status(200).json({
      success: true,
      message: "Realtime connection configured",
      connectionUrl: url
    });

  } catch (error) {
    console.error('Erro ao configurar Realtime API:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: language === 'pt' 
        ? 'Desculpe, houve um erro ao configurar a conexão em tempo real.'
        : 'Sorry, there was an error setting up the realtime connection.'
    });
  }
}
