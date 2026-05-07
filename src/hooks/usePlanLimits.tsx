/**
 * usePlanLimits — DEPRECADO
 * 
 * Este hook foi substituído pelo sistema de créditos.
 * Use `useCredits` de '../hooks/useCredits' para verificar saldo e consumir créditos.
 * 
 * Este arquivo é mantido para evitar erros de importação em código legado.
 */
export const usePlanLimits = () => {
  // Retorna valores de compatibilidade — não bloqueia nenhuma funcionalidade
  return {
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
    monthlyTrainingUsed: 0,
    monthlyTrainingLeft: Infinity,
    canStartTraining: true,
    isAdmin: false,
    loading: false,
    incrementTrainingCount: async () => {},
  };
};
