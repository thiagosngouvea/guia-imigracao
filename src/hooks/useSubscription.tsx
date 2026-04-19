import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { isSubscriptionActive, PLAN_LIMITS, resolvePlanTier, PlanTier } from '../lib/stripe';

interface UseSubscriptionReturn {
  hasActiveSubscription: boolean;
  isAdmin: boolean;
  canAccessSystem: boolean;  // true for free tier too (free can log in)
  subscriptionStatus?: string;
  planType?: string;
  planTier: PlanTier;
  limits: typeof PLAN_LIMITS[PlanTier];
  subscriptionEndDate?: Date;
  loading: boolean;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  const hasActiveSubscription = isSubscriptionActive(
    userProfile?.subscriptionStatus,
    userProfile?.subscriptionEndDate
  );

  // Admin se qualquer campo indicar privilégio
  const isAdmin =
    userProfile?.isAdmin === true ||
    userProfile?.isPremium === true ||
    userProfile?.role === 'admin' ||
    userProfile?.role === 'super_admin';

  // Resolve plan tier
  let planTier: PlanTier = 'free';
  if (isAdmin) {
    planTier = 'expert';
  } else if (hasActiveSubscription) {
    planTier = resolvePlanTier(userProfile?.planType);
    if (planTier === 'free') planTier = 'pro'; // default to pro if subscription active but no planType
  }

  const limits = PLAN_LIMITS[planTier];

  // canAccessSystem is true even for free users (they can log in and see the app)
  // Feature gates are handled by PlanGate components
  const canAccessSystem = true;

  const subscriptionEndDate = userProfile?.subscriptionEndDate?.toDate
    ? userProfile.subscriptionEndDate.toDate()
    : userProfile?.subscriptionEndDate
    ? new Date(userProfile.subscriptionEndDate)
    : undefined;

  return {
    hasActiveSubscription,
    isAdmin,
    canAccessSystem,
    subscriptionStatus: userProfile?.subscriptionStatus,
    planType: userProfile?.planType,
    planTier,
    limits,
    subscriptionEndDate,
    loading,
  };
};
