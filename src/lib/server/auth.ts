import type { DecodedIdToken } from 'firebase-admin/auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from './firebase-admin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  token: DecodedIdToken;
}

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthenticatedUser | null> {
  const authorization = req.headers.authorization;
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  try {
    const token = await adminAuth.verifyIdToken(match[1], true);
    return { uid: token.uid, email: token.email, token };
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
    return null;
  }
}

