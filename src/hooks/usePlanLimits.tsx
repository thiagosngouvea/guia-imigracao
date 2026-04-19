import { useAuth } from './useAuth';
import { isSubscriptionActive, PLAN_LIMITS, resolvePlanTier, PlanTier } from '../lib/stripe';
import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UsePlanLimitsReturn {
  planTier: PlanTier;
  limits: typeof PLAN_LIMITS[PlanTier];
  monthlyTrainingUsed: number;
  monthlyTrainingLeft: number;
  canStartTraining: boolean;
  isAdmin: boolean;
  loading: boolean;
  incrementTrainingCount: () => Promise<void>;
}

/**
 * Returns the current user's plan limits and usage stats.
 * Handles monthly reset automatically.
 */
export const usePlanLimits = (): UsePlanLimitsReturn => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Detect if monthly counter needs reset
  const needsMonthlyReset = (): boolean => {
    if (!userProfile?.lastTrainingReset) return true;
    const lastReset = userProfile.lastTrainingReset?.toDate
      ? userProfile.lastTrainingReset.toDate()
      : new Date(userProfile.lastTrainingReset);
    const now = new Date();
    return (
      lastReset.getMonth() !== now.getMonth() ||
      lastReset.getFullYear() !== now.getFullYear()
    );
  };

  const isAdmin =
    userProfile?.isAdmin === true ||
    userProfile?.isPremium === true ||
    userProfile?.role === 'admin' ||
    userProfile?.role === 'super_admin';

  const hasActiveSubscription = isSubscriptionActive(
    userProfile?.subscriptionStatus,
    userProfile?.subscriptionEndDate
  );

  // Resolve tier: admins get expert, subscribers get their plan, others are free
  let planTier: PlanTier = 'free';
  if (isAdmin) {
    planTier = 'expert';
  } else if (hasActiveSubscription) {
    planTier = resolvePlanTier(userProfile?.planType);
    // Fallback: if planType is not set but subscription is active, default to pro
    if (planTier === 'free') planTier = 'pro';
  }

  const limits = PLAN_LIMITS[planTier];

  const monthlyTrainingUsed = needsMonthlyReset()
    ? 0
    : (userProfile?.monthlyTrainingCount ?? 0);

  const monthlyTrainingLeft = isAdmin
    ? Infinity
    : Math.max(0, limits.monthlyTrainingSessions - monthlyTrainingUsed);

  const canStartTraining =
    limits.canAccessTraining && (isAdmin || monthlyTrainingLeft > 0);

  /**
   * Increments the monthly training counter in Firestore.
   * Resets counter if it's a new month.
   */
  const incrementTrainingCount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const shouldReset = needsMonthlyReset();
      const newCount = shouldReset ? 1 : (userProfile?.monthlyTrainingCount ?? 0) + 1;

      await updateDoc(doc(db, 'users', user.uid), {
        monthlyTrainingCount: newCount,
        ...(shouldReset ? { lastTrainingReset: serverTimestamp() } : {}),
      });
    } catch (error) {
      console.error('Erro ao incrementar contador de treinamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    planTier,
    limits,
    monthlyTrainingUsed,
    monthlyTrainingLeft,
    canStartTraining,
    isAdmin,
    loading,
    incrementTrainingCount,
  };
};
