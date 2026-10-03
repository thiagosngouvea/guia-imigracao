import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');

  if (!stripe) {
    stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' });
  }
  return stripe;
}

export function getPublicBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not configured');
  return baseUrl.replace(/\/$/, '');
}

