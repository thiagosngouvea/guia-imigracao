import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// IMPORTANTE: desabilitar o bodyParser para ler o raw body
// necessário para verificar a assinatura do Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

// Lê o body como Buffer (necessário para stripe.webhooks.constructEvent)
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const planTierFromMeta = session.metadata?.planTier as string | undefined;
  const planTypeFromMeta = session.metadata?.planType as string | undefined;
  
  await updateUserSubscription(userId, subscription, planTypeFromMeta, planTierFromMeta);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;
  
  const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  
  const userId = customer.metadata?.firebaseUid;
  if (!userId) return;
  
  await updateUserSubscription(userId, subscription);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;
  
  const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  
  const userId = customer.metadata?.firebaseUid;
  if (!userId) return;
  
  await updateDoc(doc(db, 'users', userId), {
    subscriptionStatus: 'past_due',
    updatedAt: serverTimestamp(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata?.firebaseUid;
  if (!userId) return;
  
  await updateUserSubscription(userId, subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata?.firebaseUid;
  if (!userId) return;
  
  await updateDoc(doc(db, 'users', userId), {
    subscriptionStatus: 'canceled',
    planTier: 'free',
    subscriptionEndDate: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  planTypeOverride?: string,
  planTierOverride?: string,
) {
  const priceId = subscription.items.data[0]?.price.id;
  
  // Resolve planType from price ID → env var mapping
  const PRICE_MAP: Record<string, { planType: string; planTier: string }> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!]: { planType: 'pro_monthly', planTier: 'pro' },
    [process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!]: { planType: 'pro_yearly', planTier: 'pro' },
    [process.env.NEXT_PUBLIC_STRIPE_EXPERT_MONTHLY_PRICE_ID!]: { planType: 'expert_monthly', planTier: 'expert' },
    [process.env.NEXT_PUBLIC_STRIPE_EXPERT_YEARLY_PRICE_ID!]: { planType: 'expert_yearly', planTier: 'expert' },
    // Legacy price IDs
    [process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!]: { planType: 'monthly', planTier: 'pro' },
    [process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!]: { planType: 'yearly', planTier: 'pro' },
  };

  const resolved = priceId ? PRICE_MAP[priceId] : undefined;
  const planType = planTypeOverride || resolved?.planType || 'monthly';
  const planTier = planTierOverride || resolved?.planTier || 'pro';
  
  await updateDoc(doc(db, 'users', userId), {
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionEndDate: new Date((subscription as any).current_period_end * 1000),
    planType,
    planTier,
    updatedAt: serverTimestamp(),
  });
}
