import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { CREDIT_PACKAGES, CreditPackageId } from '../../../lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { packageId, userId, email, name } = req.body as {
      packageId: CreditPackageId;
      userId: string;
      email?: string;
      name?: string;
    };

    if (!packageId || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const pkg = CREDIT_PACKAGES[packageId];
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package ID' });
    }

    if (!pkg.stripePriceId) {
      return res.status(500).json({
        error: 'Price ID not configured. Check NEXT_PUBLIC_STRIPE_CREDITS_*_PRICE_ID env vars.',
      });
    }

    // Busca ou cria o customer no Stripe pelo email
    let customerId: string | undefined;

    if (email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        // Garante que o metadata tem o UID correto
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000';

    // Cria sessão de pagamento único (não subscription)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      mode: 'payment',            // ← pagamento único, não recorrente
      locale: 'pt-BR',
      success_url: `${baseUrl}/comprar-creditos?success=true&package=${packageId}`,
      cancel_url: `${baseUrl}/comprar-creditos?canceled=true`,
      metadata: {
        userId,
        packageId,
        creditsAmount: String(pkg.totalCredits),
        bonusCredits: String(pkg.bonusCredits),
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Internal server error',
    });
  }
}
