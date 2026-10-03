import { createHash } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from './firebase-admin';

interface RateLimitOptions {
  scope: string;
  key: string;
  limit: number;
  windowSeconds: number;
}

export function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

export async function enforceRateLimit(
  res: NextApiResponse,
  options: RateLimitOptions
): Promise<boolean> {
  const id = createHash('sha256')
    .update(`${options.scope}:${options.key}`)
    .digest('hex');
  const ref = adminDb.collection('_rateLimits').doc(id);
  const now = Date.now();
  const resetAt = now + options.windowSeconds * 1000;

  const result = await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const existingResetAt = data?.resetAt instanceof Timestamp
      ? data.resetAt.toMillis()
      : 0;

    if (!snapshot.exists || existingResetAt <= now) {
      transaction.set(ref, {
        scope: options.scope,
        count: 1,
        resetAt: Timestamp.fromMillis(resetAt),
        updatedAt: Timestamp.now(),
      });
      return { allowed: true, remaining: options.limit - 1, resetAt };
    }

    const count = typeof data?.count === 'number' ? data.count : 0;
    if (count >= options.limit) {
      return { allowed: false, remaining: 0, resetAt: existingResetAt };
    }

    transaction.update(ref, {
      count: count + 1,
      updatedAt: Timestamp.now(),
    });
    return {
      allowed: true,
      remaining: Math.max(0, options.limit - count - 1),
      resetAt: existingResetAt,
    };
  });

  res.setHeader('X-RateLimit-Limit', String(options.limit));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

  if (!result.allowed) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((result.resetAt - now) / 1000))));
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return false;
  }

  return true;
}

