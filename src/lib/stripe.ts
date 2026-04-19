import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Plan limits by tier
export const PLAN_LIMITS = {
  free: {
    monthlyTrainingSessions: 0,      // Bloqueado
    canAccessTraining: false,
    canAccessDS160: false,
    canAccessEB2NIW: false,
    canAccessVisaPath: false,
    canAccessMinhaTrilha: false,
    canAccessVisaDetails: false,     // Só ver lista, detalhes bloqueados
    canAccessVoiceMode: false,
    canAccessAdvancedScenarios: false,
  },
  pro: {
    monthlyTrainingSessions: 5,
    canAccessTraining: true,
    canAccessDS160: true,
    canAccessEB2NIW: false,          // Expert only
    canAccessVisaPath: true,
    canAccessMinhaTrilha: true,
    canAccessVisaDetails: true,
    canAccessVoiceMode: false,       // Expert only
    canAccessAdvancedScenarios: false, // Expert only
  },
  expert: {
    monthlyTrainingSessions: 20,
    canAccessTraining: true,
    canAccessDS160: true,
    canAccessEB2NIW: true,
    canAccessVisaPath: true,
    canAccessMinhaTrilha: true,
    canAccessVisaDetails: true,
    canAccessVoiceMode: true,
    canAccessAdvancedScenarios: true,
  },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

// Subscription plans for Stripe
export const SUBSCRIPTION_PLANS = {
  // Pro plans
  pro_monthly: {
    id: 'pro_monthly',
    tier: 'pro' as PlanTier,
    name: 'Plano Pro',
    description: 'Acesso completo com 5 treinamentos por mês',
    price: 4990, // R$ 49,90 em centavos
    currency: 'brl',
    interval: 'month' as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
  },
  pro_yearly: {
    id: 'pro_yearly',
    tier: 'pro' as PlanTier,
    name: 'Plano Pro Anual',
    description: 'Acesso completo com 5 treinamentos por mês (2 meses grátis)',
    price: 44900, // R$ 449,00 em centavos (~R$37,40/mês)
    currency: 'brl',
    interval: 'year' as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!,
  },
  // Expert plans
  expert_monthly: {
    id: 'expert_monthly',
    tier: 'expert' as PlanTier,
    name: 'Plano Expert',
    description: 'Acesso total com 20 treinamentos/mês, voz, EB2-NIW e mais',
    price: 8990, // R$ 89,90 em centavos
    currency: 'brl',
    interval: 'month' as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_EXPERT_MONTHLY_PRICE_ID!,
  },
  expert_yearly: {
    id: 'expert_yearly',
    tier: 'expert' as PlanTier,
    name: 'Plano Expert Anual',
    description: 'Acesso total com 20 treinamentos/mês e todas as funcionalidades (2 meses grátis)',
    price: 79900, // R$ 799,00 em centavos (~R$66,60/mês)
    currency: 'brl',
    interval: 'year' as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_EXPERT_YEARLY_PRICE_ID!,
  },
  // Legacy plans (backward compat)
  monthly: {
    id: 'monthly',
    tier: 'pro' as PlanTier,
    name: 'Plano Mensal (Legado)',
    description: 'Acesso completo ao sistema por 1 mês',
    price: 2990,
    currency: 'brl',
    interval: 'month' as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
  },
  yearly: {
    id: 'yearly',
    tier: 'pro' as PlanTier,
    name: 'Plano Anual (Legado)',
    description: 'Acesso completo ao sistema por 1 ano (2 meses grátis)',
    price: 29900,
    currency: 'brl',
    interval: 'year' as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Resolve plan tier from planType string stored in Firestore
export const resolvePlanTier = (planType?: string | null): PlanTier => {
  if (!planType) return 'free';
  const plan = SUBSCRIPTION_PLANS[planType as PlanType];
  if (plan) return plan.tier;
  // Handle direct tier strings
  if (planType === 'pro' || planType === 'expert') return planType;
  return 'free';
};

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
