import type { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '../../../lib/server/auth';
import { adminDb } from '../../../lib/server/firebase-admin';
import { enforceRateLimit } from '../../../lib/server/rate-limit';
import { getStripeServer } from '../../../lib/server/stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;
  if (!await enforceRateLimit(res, {
    scope: 'stripe-cancel', key: user.uid, limit: 3, windowSeconds: 300,
  })) return;

  try {
    const userRef = adminDb.collection('users').doc(user.uid);
    const snapshot = await userRef.get();
    const subscriptionId = snapshot.data()?.subscriptionId;
    if (!snapshot.exists || typeof subscriptionId !== 'string') {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const subscription = await getStripeServer().subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    await userRef.update({
      subscriptionStatus: 'canceled',
      canceledAt: FieldValue.serverTimestamp(),
    });

    const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
    return res.status(200).json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ error: 'Could not cancel subscription' });
  }
}
