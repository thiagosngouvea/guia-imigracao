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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scenario, language, questionIndex }: RealtimeRequest = req.body;

  try {
    // Criar token ephemeral para WebRTC
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-10-01',
        voice: 'alloy',
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
        modalities: ['text', 'audio'],
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        },
        tools: [],
        tool_choice: 'none',
        temperature: 0.7,
        max_response_output_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const sessionData = await response.json();

    res.status(200).json({
      success: true,
      client_secret: {
        value: sessionData.client_secret?.value,
        expires_at: sessionData.client_secret?.expires_at
      },
      session_id: sessionData.id,
      expires_at: sessionData.expires_at
    });

  } catch (error) {
    console.error('Erro ao criar sessão WebRTC:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: language === 'pt' 
        ? 'Desculpe, houve um erro ao configurar a conexão em tempo real.'
        : 'Sorry, there was an error setting up the realtime connection.'
    });
  }
}