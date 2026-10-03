import { FieldValue } from 'firebase-admin/firestore';
import { FEATURE_COSTS, FeatureKey } from '../stripe';
import { adminDb } from './firebase-admin';

export interface SpendResult {
  success: boolean;
  newBalance: number;
  isAdmin?: boolean;
  error?: string;
}

const descriptions: Record<FeatureKey, string> = {
  training: 'Treinamento de entrevista de visto (texto)',
  training_voice: 'Treinamento de entrevista de visto (voz)',
  training_realtime: 'Treinamento de entrevista de visto (voz em tempo real)',
  ds160: 'Sessão do Assistente DS-160',
  eb2niw: 'Análise EB2-NIW com IA',
};

export async function spendUserCredits(uid: string, feature: FeatureKey): Promise<SpendResult> {
  const cost = FEATURE_COSTS[feature];

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection('users').doc(uid);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) return { success: false, newBalance: 0, error: 'User not found' };

      const userData = userDoc.data() || {};
      const isAdmin = userData.isAdmin === true ||
        userData.role === 'admin' ||
        userData.role === 'super_admin';

      if (isAdmin) {
        return { success: true, newBalance: Number(userData.credits) || 0, isAdmin: true };
      }

      const currentBalance = Number(userData.credits) || 0;
      if (currentBalance < cost) {
        return {
          success: false,
          newBalance: currentBalance,
          error: 'Saldo de créditos insuficiente',
        };
      }

      const newBalance = currentBalance - cost;
      const historyRef = userRef.collection('creditHistory').doc();
      transaction.update(userRef, {
        credits: newBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(historyRef, {
        userId: uid,
        type: 'spend',
        amount: -cost,
        balanceAfter: newBalance,
        feature,
        description: descriptions[feature],
        createdAt: FieldValue.serverTimestamp(),
      });

      return { success: true, newBalance };
    });
  } catch (error) {
    console.error('Failed to spend credits:', error);
    return { success: false, newBalance: 0, error: 'Não foi possível processar os créditos' };
  }
}

