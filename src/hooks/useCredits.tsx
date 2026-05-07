import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { spendCredits } from '../lib/credits';
import { FEATURE_COSTS, FeatureKey, isAdminUser } from '../lib/stripe';

interface UseCreditsReturn {
  /** Saldo atual de créditos */
  credits: number;
  /** true enquanto carrega o saldo inicial */
  loading: boolean;
  /** true se o usuário é admin (bypassa créditos) */
  isAdmin: boolean;
  /** Verifica se o usuário pode usar uma funcionalidade */
  canAfford: (feature: FeatureKey) => boolean;
  /** Consome créditos para uma funcionalidade. Retorna sucesso. */
  spend: (feature: FeatureKey) => Promise<boolean>;
  /** Custo de uma funcionalidade */
  getCost: (feature: FeatureKey) => number;
}

/**
 * Hook para gerenciar créditos do usuário em tempo real.
 * Usa onSnapshot para atualização em tempo real do saldo.
 * Admins não gastam créditos.
 */
export const useCredits = (): UseCreditsReturn => {
  const { user, userProfile } = useAuth();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdmin = isAdminUser(userProfile);

  // Listener em tempo real do saldo de créditos
  useEffect(() => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCredits((data.credits as number) ?? 0);
        } else {
          setCredits(0);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao ouvir créditos:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const canAfford = useCallback(
    (feature: FeatureKey): boolean => {
      if (isAdmin) return true;
      return credits >= FEATURE_COSTS[feature];
    },
    [credits, isAdmin]
  );

  const spend = useCallback(
    async (feature: FeatureKey): Promise<boolean> => {
      if (!user) return false;
      // Admins não gastam créditos
      if (isAdmin) return true;

      const result = await spendCredits(user.uid, feature);
      return result.success;
    },
    [user, isAdmin]
  );

  const getCost = useCallback(
    (feature: FeatureKey): number => {
      if (isAdmin) return 0;
      return FEATURE_COSTS[feature];
    },
    [isAdmin]
  );

  return {
    credits,
    loading,
    isAdmin,
    canAfford,
    spend,
    getCost,
  };
};
