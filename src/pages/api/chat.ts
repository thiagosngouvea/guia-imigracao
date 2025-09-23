import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

interface ChatRequest {
  message: string;
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
  context: Array<{
    role: 'user' | 'ai' | 'system';
    content: string;
    // Removido campos desnecessários como audioData, timestamp, etc.
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, scenario, language, questionIndex, context }: ChatRequest = req.body;

  try {
    // Construir o prompt do sistema baseado no cenário e idioma
    const systemPrompt = language === 'pt' 
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
         
         Current question (${questionIndex + 1}): ${scenario.questions.en[questionIndex] || 'Interview completed'}`;

    // Preparar mensagens para o ChatGPT
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Adicionar contexto das mensagens anteriores
    context.forEach(msg => {
      if (msg.role === 'user') {
        messages.push({
          role: 'user',
          content: msg.content
        });
      } else if (msg.role === 'ai') {
        messages.push({
          role: 'assistant',
          content: msg.content
        });
      }
    });

    // Adicionar a mensagem atual do usuário
    messages.push({
      role: 'user',
      content: message
    });

    // Chamar a API do OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua resposta.';

    // Determinar se há próxima pergunta
    let nextQuestionIndex = questionIndex;
    const questionsArray = scenario.questions[language];
    
    // Se a resposta indica que devemos prosseguir e há mais perguntas
    if (questionIndex < questionsArray.length - 1) {
      // Verificar se a IA sugeriu prosseguir (isso pode ser melhorado com análise mais sofisticada)
      const shouldProceed = aiResponse.toLowerCase().includes(language === 'pt' ? 'próxima' : 'next') ||
                           aiResponse.toLowerCase().includes(language === 'pt' ? 'continue' : 'move on');
      
      if (shouldProceed) {
        nextQuestionIndex = questionIndex + 1;
      }
    }

    res.status(200).json({
      response: aiResponse,
      nextQuestionIndex: nextQuestionIndex !== questionIndex ? nextQuestionIndex : undefined
    });

  } catch (error) {
    console.error('Erro na API do ChatGPT:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      response: language === 'pt' 
        ? 'Desculpe, houve um erro temporário. Tente novamente.'
        : 'Sorry, there was a temporary error. Please try again.'
    });
  }
}
