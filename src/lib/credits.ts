import {
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { FEATURE_COSTS, FeatureKey } from './stripe';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreditTransaction {
  id?: string;
  userId: string;
  type: 'purchase' | 'spend' | 'bonus' | 'refund';
  amount: number;           // positivo = ganhou, negativo = gastou
  balanceAfter: number;
  feature?: FeatureKey;     // qual funcionalidade consumiu (se spend)
  packageId?: string;       // qual pacote comprou (se purchase)
  stripeSessionId?: string; // referência do Stripe
  description: string;
  createdAt: any;
}

// ─── Read ────────────────────────────────────────────────────────────────────

/**
 * Retorna o saldo atual de créditos do usuário.
 */
export const getUserCredits = async (uid: string): Promise<number> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return 0;
    return (userDoc.data().credits as number) ?? 0;
  } catch (error) {
    console.error('Erro ao buscar créditos:', error);
    return 0;
  }
};

// ─── Write ───────────────────────────────────────────────────────────────────

/**
 * Adiciona créditos ao usuário (compra ou bônus).
 * Usa transação para garantir consistência do saldo.
 */
export const addCredits = async (
  uid: string,
  amount: number,
  options: {
    type: 'purchase' | 'bonus' | 'refund';
    packageId?: string;
    stripeSessionId?: string;
    description: string;
  }
): Promise<{ success: boolean; newBalance: number }> => {
  try {
    let newBalance = 0;

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', uid);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }

      const currentCredits = (userDoc.data().credits as number) ?? 0;
      newBalance = currentCredits + amount;

      transaction.update(userRef, {
        credits: newBalance,
        totalCreditsEarned: increment(amount),
        updatedAt: serverTimestamp(),
      });

      // Log da transação
      const txRef = doc(collection(db, 'users', uid, 'creditHistory'));
      transaction.set(txRef, {
        userId: uid,
        type: options.type,
        amount: amount,
        balanceAfter: newBalance,
        packageId: options.packageId ?? null,
        stripeSessionId: options.stripeSessionId ?? null,
        description: options.description,
        createdAt: serverTimestamp(),
      });
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    return { success: false, newBalance: 0 };
  }
};

/**
 * Consome créditos para uma funcionalidade.
 * Retorna { success, newBalance } ou { success: false } se saldo insuficiente.
 */
export const spendCredits = async (
  uid: string,
  feature: FeatureKey
): Promise<{ success: boolean; newBalance: number; error?: string }> => {
  const cost = FEATURE_COSTS[feature];

  try {
    let newBalance = 0;
    let succeeded = false;

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', uid);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }

      const currentCredits = (userDoc.data().credits as number) ?? 0;

      if (currentCredits < cost) {
        throw new Error(`Saldo insuficiente: ${currentCredits} créditos disponíveis, ${cost} necessários`);
      }

      newBalance = currentCredits - cost;

      transaction.update(userRef, {
        credits: newBalance,
        updatedAt: serverTimestamp(),
      });

      // Log da transação
      const txRef = doc(collection(db, 'users', uid, 'creditHistory'));
      transaction.set(txRef, {
        userId: uid,
        type: 'spend',
        amount: -cost,
        balanceAfter: newBalance,
        feature,
        description: getFeatureDescription(feature),
        createdAt: serverTimestamp(),
      });

      succeeded = true;
    });

    return { success: succeeded, newBalance };
  } catch (error: any) {
    console.error('Erro ao consumir créditos:', error);
    return {
      success: false,
      newBalance: 0,
      error: error?.message ?? 'Erro ao consumir créditos',
    };
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getFeatureDescription = (feature: FeatureKey): string => {
  const descriptions: Record<FeatureKey, string> = {
    training: 'Treinamento de entrevista de visto (texto)',
    training_voice: 'Treinamento de entrevista de visto (voz)',
    ds160: 'Sessão do Assistente DS-160',
    eb2niw: 'Análise EB2-NIW com IA',
  };
  return descriptions[feature];
};
