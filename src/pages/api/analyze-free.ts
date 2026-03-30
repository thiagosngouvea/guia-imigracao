import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface FreeQuizData {
  // Dados pessoais
  fullName: string;
  email: string;
  whatsapp: string;
  age: number;
  timeframe: string; // previsão de imigração

  // Questionário
  education: string;
  fieldOfStudy: string;
  occupation: string;
  yearsOfExperience: number;
  englishLevel: string;
  immigrationGoal: string;
  savings: string;
  hasJobOffer: boolean;
  hasFamily: boolean;
}

export interface FreeVisaResult {
  topVisa: string;
  topVisaScore: number;
  secondVisa: string;
  secondVisaScore: number;
  thirdVisa: string;
  thirdVisaScore: number;
  profileSummary: string;
  topVisaReason: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data: FreeQuizData = req.body;

  const prompt = `Você é um especialista sênior em imigração americana. Analise o perfil abaixo e determine os 3 vistos americanos mais adequados, com porcentagem de compatibilidade.

PERFIL:
- Nome: ${data.fullName}
- Idade: ${data.age} anos
- Educação: ${data.education} em ${data.fieldOfStudy}
- Profissão: ${data.occupation} (${data.yearsOfExperience} anos de experiência)
- Inglês: ${data.englishLevel}
- Objetivo: ${data.immigrationGoal}
- Prazo pretendido: ${data.timeframe}
- Economia disponível: ${data.savings}
- Tem oferta de emprego nos EUA: ${data.hasJobOffer ? 'Sim' : 'Não'}
- Tem família nos EUA: ${data.hasFamily ? 'Sim' : 'Não'}

TIPOS DE VISTO AMERICANO (escolha apenas os mais relevantes):
- H-1B: Trabalhador especializado com oferta de emprego
- O-1: Habilidades extraordinárias (artistas, cientistas, atletas)
- EB-2 NIW: Green card para profissionais com pós-grad ou interesse nacional
- EB-1: Green card para habilidades extraordinárias
- EB-5: Green card por investimento
- F-1: Estudante
- L-1: Transferência intraempresarial
- E-2: Investidor com tratado comercial
- B1/B2: Turismo/negócios (não-imigrante)

Responda SOMENTE no seguinte formato JSON (sem markdown, sem explicações fora do JSON):
{
  "topVisa": "NOME_DO_VISTO",
  "topVisaScore": NUMERO_DE_0_A_100,
  "secondVisa": "NOME_DO_VISTO",
  "secondVisaScore": NUMERO_DE_0_A_100,
  "thirdVisa": "NOME_DO_VISTO",
  "thirdVisaScore": NUMERO_DE_0_A_100,
  "profileSummary": "Resumo do perfil em 1 frase curta em português",
  "topVisaReason": "Motivo principal pelo qual o primeiro visto é o mais indicado, em 1 frase curta em português"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const result: FreeVisaResult = JSON.parse(jsonMatch[0]);

    // Clamp scores between 10 and 95
    result.topVisaScore = Math.min(95, Math.max(10, result.topVisaScore));
    result.secondVisaScore = Math.min(85, Math.max(10, result.secondVisaScore));
    result.thirdVisaScore = Math.min(75, Math.max(10, result.thirdVisaScore));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in analyze-free:', error);
    // Fallback deterministic result  
    return res.status(200).json({
      topVisa: 'EB-2 NIW',
      topVisaScore: 68,
      secondVisa: 'H-1B',
      secondVisaScore: 52,
      thirdVisa: 'F-1',
      thirdVisaScore: 44,
      profileSummary: 'Perfil com boa formação acadêmica e experiência profissional.',
      topVisaReason: 'Seu nível de educação e experiência se encaixam bem nos critérios do EB-2 NIW.',
    } as FreeVisaResult);
  }
}
