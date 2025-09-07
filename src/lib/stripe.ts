import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Plano Mensal',
    description: 'Acesso completo ao sistema por 1 mês',
    price: 2990, // R$ 29,90 em centavos
    currency: 'brl',
    interval: 'month' as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
  },
  yearly: {
    id: 'yearly',
    name: 'Plano Anual',
    description: 'Acesso completo ao sistema por 1 ano (2 meses grátis)',
    price: 29900, // R$ 299,00 em centavos (equivale a 10 meses)
    currency: 'brl',
    interval: 'year' as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Helper functions
export const formatPrice = (price: number, currency: string = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(price / 100);
};

export const isSubscriptionActive = (
  subscriptionStatus?: string,
  subscriptionEndDate?: any
): boolean => {
  if (!subscriptionStatus) return false;
  
  const activeStatuses = ['active', 'trialing'];
  const isStatusActive = activeStatuses.includes(subscriptionStatus);
  
  if (!isStatusActive) return false;
  
  // Check if subscription hasn't expired
  if (subscriptionEndDate) {
    const endDate = subscriptionEndDate.toDate ? subscriptionEndDate.toDate() : new Date(subscriptionEndDate);
    return endDate > new Date();
  }
  
  return true;
};
