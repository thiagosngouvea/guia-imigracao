import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/server/auth';
import { adminDb } from '../../../lib/server/firebase-admin';
import { enforceRateLimit } from '../../../lib/server/rate-limit';
import { getPublicBaseUrl, getStripeServer } from '../../../lib/server/stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;
  if (!await enforceRateLimit(res, {
    scope: 'stripe-portal', key: user.uid, limit: 5, windowSeconds: 60,
  })) return;

  try {
    const snapshot = await adminDb.collection('users').doc(user.uid).get();
    const customerId = snapshot.data()?.stripeCustomerId;
    if (!snapshot.exists || typeof customerId !== 'string') {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const portalSession = await getStripeServer().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getPublicBaseUrl()}/dashboard`,
    });
    return res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ error: 'Could not create portal session' });
  }
}
