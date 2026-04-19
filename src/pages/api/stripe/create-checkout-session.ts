import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS, PlanType } from '../../../lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planType, userId, email, name } = req.body as {
      planType: PlanType;
      userId: string;
      email?: string;
      name?: string;
    };

    if (!planType || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const plan = SUBSCRIPTION_PLANS[planType];

    if (!plan.stripePriceId) {
      return res.status(500).json({ error: 'Price ID not configured. Check NEXT_PUBLIC_STRIPE_*_PRICE_ID env vars.' });
    }

    // Busca ou cria o customer no Stripe usando o email
    let customerId: string | undefined;

    if (email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        // Garante que o metadata do Stripe tem o UID correto
        if (!existing.data[0].metadata?.firebaseUid) {
          await stripe.customers.update(customerId, {
            metadata: { firebaseUid: userId },
          });
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        name: name || undefined,
        metadata: { firebaseUid: userId },
      });
      customerId = customer.id;
    }

    // Cria a sessao de checkout
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      mode: 'subscription',
      locale: 'pt-BR',
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
      metadata: { userId, planType, planTier: plan.tier },
      // Pre-preenche o email na pagina do Stripe
      customer_update: { address: 'auto' },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Internal server error',
    });
  }
}
