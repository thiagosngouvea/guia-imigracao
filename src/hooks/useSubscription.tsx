/**
 * useSubscription — DEPRECADO
 * 
 * Este hook foi substituído pelo sistema de créditos.
 * Use `useCredits` de '../hooks/useCredits' para verificar saldo e consumir créditos.
 * 
 * Este arquivo é mantido para evitar erros de importação em código legado que ainda
 * referencie `hasActiveSubscription`, `planTier`, etc.
 */
import { useCredits } from './useCredits';

export const useSubscription = () => {
  const { credits, isAdmin } = useCredits();

  return {
    hasActiveSubscription: credits > 0 || isAdmin,
    isAdmin,
    canAccessSystem: true,
    subscriptionStatus: undefined as string | undefined,
    planType: undefined as string | undefined,
    planTier: 'free' as const,
    limits: {
      monthlyTrainingSessions: Infinity,
      canAccessTraining: true,
      canAccessDS160: true,
      canAccessEB2NIW: true,
      canAccessVisaPath: true,
      canAccessMinhaTrilha: true,
      canAccessVisaDetails: true,
      canAccessVoiceMode: true,
      canAccessAdvancedScenarios: true,
    },
    subscriptionEndDate: undefined as Date | undefined,
    loading: false,
  };
};
