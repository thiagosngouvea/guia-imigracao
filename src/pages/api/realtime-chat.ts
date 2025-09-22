import { NextApiRequest, NextApiResponse } from 'next';

// Esta API foi migrada para WebRTC
// Use /api/realtime-webrtc-token em vez disso

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({ 
    error: 'Esta API foi descontinuada',
    message: 'Use /api/realtime-webrtc-token para conexões WebRTC',
    migration: 'WebSocket foi substituído por WebRTC para melhor performance'
  });
}
