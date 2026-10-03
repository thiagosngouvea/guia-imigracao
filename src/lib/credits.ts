import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { authenticatedFetch } from './api-client';
import { FeatureKey } from './stripe';

export interface CreditTransaction {
  id?: string;
  userId: string;
  type: 'purchase' | 'spend' | 'bonus' | 'refund';
  amount: number;
  balanceAfter: number;
  feature?: FeatureKey;
  packageId?: string;
  stripeSessionId?: string;
  description: string;
  createdAt: unknown;
}
export async function getUserCredits(uid: string): Promise<number> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? Number(userDoc.data().credits) || 0 : 0;
  } catch (error) {
    console.error('Erro ao buscar créditos:', error);
    return 0;
  }
}

export async function spendCredits(
  _uid: string,
  feature: FeatureKey
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const response = await authenticatedFetch('/api/credits/spend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature }),
    });
    const data = await response.json();
    return {
      success: response.ok && data.success === true,
      newBalance: Number(data.newBalance) || 0,
      error: data.error,
    };
  } catch (error) {
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : 'Erro ao consumir créditos',
    };
  }
}
