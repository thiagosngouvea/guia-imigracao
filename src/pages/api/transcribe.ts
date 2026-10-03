import type { NextApiRequest, NextApiResponse } from 'next';
import { toFile } from 'openai';
import { requireAuth } from '../../lib/server/auth';
import { getOpenAI } from '../../lib/server/openai';
import { enforceRateLimit } from '../../lib/server/rate-limit';

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;
  if (!await enforceRateLimit(res, {
    scope: 'transcribe', key: user.uid, limit: 10, windowSeconds: 60,
  })) return;

  const { audioBase64 } = req.body as { audioBase64?: string };
  if (!audioBase64) return res.status(400).json({ error: 'Audio data is required' });

  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    if (!audioBuffer.length || audioBuffer.length > MAX_AUDIO_BYTES) {
      return res.status(413).json({ error: 'Audio must be smaller than 15 MB' });
    }

    const transcription = await getOpenAI().audio.transcriptions.create({
      model: 'whisper-1',
      file: await toFile(audioBuffer, 'interview-audio.wav', { type: 'audio/wav' }),
      response_format: 'json',
    });
    return res.status(200).json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error processing audio:', error);
    return res.status(502).json({ error: 'Failed to process audio' });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '21mb' } } };
