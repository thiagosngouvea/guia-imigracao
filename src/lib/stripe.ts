import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// ─── Custo de cada funcionalidade em créditos ───────────────────────────────
export const FEATURE_COSTS = {
  training: 5,           // Sessão de treinamento de entrevista
  training_voice: 7,     // Sessão de treinamento com modo voz (+2)
  training_realtime: 15, // Sessão de treinamento com voz em tempo real (WebRTC)
  ds160: 3,              // Sessão do assistente DS-160
  eb2niw: 10,            // Análise EB2-NIW com IA
} as const;

export type FeatureKey = keyof typeof FEATURE_COSTS;

// ─── Pacotes de créditos (compra única, sem recorrência) ─────────────────────
export const CREDIT_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter',
    emoji: '🌱',
    credits: 10,
    bonusCredits: 0,
    totalCredits: 10,
    price: 1990,             // R$ 19,90 em centavos
    currency: 'brl',
    pricePerCredit: 199,     // R$ 1,99 por crédito
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_10_PRICE_ID!,
    tagline: 'Para começar',
    color: 'from-emerald-500 to-teal-600',
    highlight: false,
  },
  popular: {
    id: 'popular',
    name: 'Popular',
    emoji: '⭐',
    credits: 30,
    bonusCredits: 3,
    totalCredits: 33,
    price: 4990,             // R$ 49,90 em centavos
    currency: 'brl',
    pricePerCredit: 151,     // R$ 1,51 por crédito
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_30_PRICE_ID!,
    tagline: 'Mais vendido',
    color: 'from-blue-500 to-indigo-600',
    highlight: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    emoji: '🚀',
    credits: 60,
    bonusCredits: 10,
    totalCredits: 70,
    price: 8990,             // R$ 89,90 em centavos
    currency: 'brl',
    pricePerCredit: 128,     // R$ 1,28 por crédito
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_60_PRICE_ID!,
    tagline: 'Melhor custo-benefício',
    color: 'from-violet-500 to-purple-600',
    highlight: false,
  },
  expert: {
    id: 'expert',
    name: 'Expert',
    emoji: '💎',
    credits: 120,
    bonusCredits: 20,
    totalCredits: 140,
    price: 14990,            // R$ 149,90 em centavos
    currency: 'brl',
    pricePerCredit: 107,     // R$ 1,07 por crédito
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_120_PRICE_ID!,
    tagline: 'Para uso intenso',
    color: 'from-amber-500 to-orange-600',
    highlight: false,
  },
} as const;

export type CreditPackageId = keyof typeof CREDIT_PACKAGES;

// ─── Helper functions ────────────────────────────────────────────────────────
export const formatPrice = (price: number, currency: string = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(price / 100);
};

export const getFeatureLabel = (feature: FeatureKey): string => {
  const labels: Record<FeatureKey, string> = {
    training: 'Treinamento de Entrevista',
    training_voice: 'Treinamento com Modo Voz',
    training_realtime: 'Treinamento Voz em Tempo Real',
    ds160: 'Assistente DS-160',
    eb2niw: 'Análise EB2-NIW',
  };
  return labels[feature];
};

// ─── Admin check helper ──────────────────────────────────────────────────────
export const isAdminUser = (userProfile: {
  isAdmin?: boolean;
  isPremium?: boolean;
  role?: string;
} | null): boolean => {
  if (!userProfile) return false;
  return (
    userProfile.isAdmin === true ||
    userProfile.isPremium === true ||
    userProfile.role === 'admin' ||
    userProfile.role === 'super_admin'
  );
};
