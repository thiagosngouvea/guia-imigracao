import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { addCredits } from '../../../lib/credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Desabilitar bodyParser para verificar assinatura do Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

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
  const packageId = session.metadata?.packageId;
  const creditsAmountStr = session.metadata?.creditsAmount;

  if (!userId || !creditsAmountStr) {
    console.error('Missing userId or creditsAmount in session metadata');
    return;
  }

  const creditsAmount = parseInt(creditsAmountStr, 10);
  if (isNaN(creditsAmount) || creditsAmount <= 0) {
    console.error('Invalid creditsAmount in metadata:', creditsAmountStr);
    return;
  }

  // Credita os créditos ao usuário
  const result = await addCredits(userId, creditsAmount, {
    type: 'purchase',
    packageId: packageId ?? undefined,
    stripeSessionId: session.id,
    description: `Compra de ${creditsAmount} créditos (pacote ${packageId ?? 'desconhecido'})`,
  });

  if (!result.success) {
    console.error('Falha ao creditar créditos para userId:', userId);
    return;
  }

  // Atualiza metadados de compra no perfil do usuário (opcional)
  try {
    await updateDoc(doc(db, 'users', userId), {
      stripeCustomerId: session.customer as string,
      lastPurchaseAt: serverTimestamp(),
      lastPackageId: packageId ?? null,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    // Não critico — os créditos já foram creditados com sucesso
    console.warn('Erro ao atualizar metadados do usuário:', err);
  }

  console.log(`✅ ${creditsAmount} créditos creditados para userId: ${userId} (pacote: ${packageId})`);
}
