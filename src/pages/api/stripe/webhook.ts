import type { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';
import type Stripe from 'stripe';
import { CREDIT_PACKAGES, CreditPackageId } from '../../../lib/stripe';
import { adminDb } from '../../../lib/server/firebase-admin';
import { getStripeServer } from '../../../lib/server/stripe';

export const config = { api: { bodyParser: false } };

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (typeof signature !== 'string' || !webhookSecret) {
    return res.status(503).json({ error: 'Webhook is not configured' });
  }

  let event: Stripe.Event;
  try {
    event = getStripeServer().webhooks.constructEvent(
      await getRawBody(req),
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const result = await creditCompletedCheckout(event, event.data.object);
      return res.status(200).json({ received: true, duplicate: result.duplicate });
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function creditCompletedCheckout(
  event: Stripe.Event,
  session: Stripe.Checkout.Session
): Promise<{ duplicate: boolean }> {
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    throw new Error(`Checkout session ${session.id} is not paid`);
  }

  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId as CreditPackageId | undefined;
  const pkg = packageId ? CREDIT_PACKAGES[packageId] : undefined;
  if (!userId || !packageId || !pkg) throw new Error('Invalid checkout metadata');

  // A checkout session can occasionally be delivered in more than one Stripe
  // event. Keying by session ID prevents crediting the same purchase twice.
  const eventRef = adminDb.collection('_stripeCheckouts').doc(session.id);
  const userRef = adminDb.collection('users').doc(userId);
  const historyRef = userRef.collection('creditHistory').doc(session.id);

  return adminDb.runTransaction(async (transaction) => {
    const [processedEvent, userSnapshot] = await Promise.all([
      transaction.get(eventRef),
      transaction.get(userRef),
    ]);

    if (processedEvent.exists) return { duplicate: true };
    if (!userSnapshot.exists) throw new Error(`User ${userId} not found`);

    const currentBalance = Number(userSnapshot.data()?.credits) || 0;
    const newBalance = currentBalance + pkg.totalCredits;

    transaction.update(userRef, {
      credits: newBalance,
      totalCreditsEarned: FieldValue.increment(pkg.totalCredits),
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
      lastPurchaseAt: FieldValue.serverTimestamp(),
      lastPackageId: packageId,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.set(historyRef, {
      userId,
      type: 'purchase',
      amount: pkg.totalCredits,
      balanceAfter: newBalance,
      packageId,
      stripeSessionId: session.id,
      description: `Compra de ${pkg.totalCredits} créditos (${pkg.name})`,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.set(eventRef, {
      eventId: event.id,
      type: event.type,
      stripeSessionId: session.id,
      userId,
      processedAt: FieldValue.serverTimestamp(),
    });

    return { duplicate: false };
  });
}
