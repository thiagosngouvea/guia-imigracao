import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../lib/server/auth';
import { getOpenAI } from '../../lib/server/openai';
import { enforceRateLimit } from '../../lib/server/rate-limit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;
  if (!await enforceRateLimit(res, {
    scope: 'text-to-speech', key: user.uid, limit: 20, windowSeconds: 60,
  })) return;

  const { text, language } = req.body as { text?: string; language?: string };
  if (!text?.trim() || text.length > 4000) {
    return res.status(400).json({ error: 'Text must contain between 1 and 4000 characters' });
  }

  try {
    const mp3 = await getOpenAI().audio.speech.create({
      model: 'tts-1-hd',
      voice: language === 'pt' ? 'nova' : 'alloy',
      input: text,
      response_format: 'mp3',
      speed: 0.9,
    });
    const audio = Buffer.from(await mp3.arrayBuffer()).toString('base64');
    return res.status(200).json({ audio, mimeType: 'audio/mpeg' });
  } catch (error) {
    console.error('Error generating speech:', error);
    return res.status(502).json({ error: 'Failed to generate speech' });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '64kb' } } };
