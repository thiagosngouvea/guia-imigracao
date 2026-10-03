import type { NextApiRequest, NextApiResponse } from 'next';
import { CREDIT_PACKAGES, CreditPackageId } from '../../../lib/stripe';
import { requireAuth } from '../../../lib/server/auth';
import { adminDb } from '../../../lib/server/firebase-admin';
import { enforceRateLimit } from '../../../lib/server/rate-limit';
import { getPublicBaseUrl, getStripeServer } from '../../../lib/server/stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  if (!await enforceRateLimit(res, {
    scope: 'stripe-checkout',
    key: user.uid,
    limit: 5,
    windowSeconds: 60,
  })) return;

  try {
    const { packageId } = req.body as { packageId?: CreditPackageId };
    const pkg = packageId ? CREDIT_PACKAGES[packageId] : undefined;
    if (!pkg) return res.status(400).json({ error: 'Invalid package ID' });
    if (!pkg.stripePriceId) return res.status(503).json({ error: 'Package is not configured' });
    const validatedPackageId = packageId as CreditPackageId;

    const stripe = getStripeServer();
    const userRef = adminDb.collection('users').doc(user.uid);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) return res.status(404).json({ error: 'User not found' });

    const profile = userSnapshot.data() || {};
    let customerId = typeof profile.stripeCustomerId === 'string'
      ? profile.stripeCustomerId
      : undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.displayName || profile.name || undefined,
        metadata: { firebaseUid: user.uid },
      });
      customerId = customer.id;
      await userRef.update({ stripeCustomerId: customerId });
    }

    const baseUrl = getPublicBaseUrl();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      mode: 'payment',
      locale: 'pt-BR',
      success_url: `${baseUrl}/comprar-creditos?success=true&package=${validatedPackageId}`,
      cancel_url: `${baseUrl}/comprar-creditos?canceled=true`,
      metadata: { userId: user.uid, packageId: validatedPackageId },
    }, {
      idempotencyKey: `checkout:${user.uid}:${validatedPackageId}:${Math.floor(Date.now() / 30000)}`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Could not create checkout session' });
  }
}
