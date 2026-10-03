import type { NextApiRequest, NextApiResponse } from 'next';
import { FEATURE_COSTS, FeatureKey } from '../../../lib/stripe';
import { requireAuth } from '../../../lib/server/auth';
import { spendUserCredits } from '../../../lib/server/credits';
import { enforceRateLimit } from '../../../lib/server/rate-limit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  if (!await enforceRateLimit(res, {
    scope: 'credits-spend',
    key: user.uid,
    limit: 30,
    windowSeconds: 60,
  })) return;

  const { feature } = req.body as { feature?: FeatureKey };
  if (!feature || !(feature in FEATURE_COSTS)) {
    return res.status(400).json({ error: 'Invalid feature' });
  }

  const result = await spendUserCredits(user.uid, feature);
  if (!result.success) {
    const status = result.error === 'User not found' ? 404 : 402;
    return res.status(status).json({
      error: result.error,
      currentBalance: result.newBalance,
      required: FEATURE_COSTS[feature],
    });
  }

  return res.status(200).json(result);
}
