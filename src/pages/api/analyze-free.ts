import type { NextApiRequest, NextApiResponse } from 'next';
import { getOpenAI } from '../../lib/server/openai';
import { enforceRateLimit, getClientIp } from '../../lib/server/rate-limit';

export interface FreeQuizData {
  fullName: string;
  email: string;
  whatsapp: string;
  age: number;
  timeframe: string;
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

function isValidQuiz(data: FreeQuizData): boolean {
  return Boolean(
    data?.fullName?.trim() &&
    data?.education?.trim() &&
    data?.occupation?.trim() &&
    data?.immigrationGoal?.trim() &&
    Number.isFinite(data.age) && data.age >= 18 && data.age <= 100 &&
    Number.isFinite(data.yearsOfExperience) && data.yearsOfExperience >= 0
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!await enforceRateLimit(res, {
    scope: 'analyze-free', key: getClientIp(req), limit: 5, windowSeconds: 3600,
  })) return;

  const data = req.body as FreeQuizData;
  if (!isValidQuiz(data)) return res.status(400).json({ error: 'Invalid questionnaire data' });

  const prompt = `Você é um especialista em imigração americana. Analise o perfil e indique os três vistos mais compatíveis. O resultado é apenas educacional e não substitui aconselhamento jurídico.

PERFIL:
- Idade: ${data.age}
- Educação: ${data.education} em ${data.fieldOfStudy}
- Profissão: ${data.occupation} (${data.yearsOfExperience} anos)
- Inglês: ${data.englishLevel}
- Objetivo: ${data.immigrationGoal}
- Prazo: ${data.timeframe}
- Recursos: ${data.savings}
- Oferta de emprego nos EUA: ${data.hasJobOffer ? 'Sim' : 'Não'}
- Família nos EUA: ${data.hasFamily ? 'Sim' : 'Não'}

Considere H-1B, O-1, EB-2 NIW, EB-1, EB-5, F-1, L-1, E-2 e B1/B2.
Responda somente em JSON válido:
{"topVisa":"","topVisaScore":0,"secondVisa":"","secondVisaScore":0,"thirdVisa":"","thirdVisaScore":0,"profileSummary":"","topVisaReason":""}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty AI response');

    const result = JSON.parse(raw) as FreeVisaResult;
    if (!result.topVisa || !result.secondVisa || !result.thirdVisa ||
        !Number.isFinite(result.topVisaScore) ||
        !Number.isFinite(result.secondVisaScore) ||
        !Number.isFinite(result.thirdVisaScore)) {
      throw new Error('Incomplete AI response');
    }

    result.topVisaScore = Math.min(95, Math.max(10, result.topVisaScore));
    result.secondVisaScore = Math.min(85, Math.max(10, result.secondVisaScore));
    result.thirdVisaScore = Math.min(75, Math.max(10, result.thirdVisaScore));
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in analyze-free:', error);
    return res.status(502).json({
      error: 'Não foi possível concluir a análise agora. Tente novamente em alguns minutos.',
    });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '32kb' } } };
