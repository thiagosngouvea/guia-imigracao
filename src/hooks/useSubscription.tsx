import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { isSubscriptionActive } from '../lib/stripe';

interface UseSubscriptionReturn {
  hasActiveSubscription: boolean;
  isAdmin: boolean;
  canAccessSystem: boolean;
  subscriptionStatus?: string;
  planType?: string;
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

  // Admin se qualquer campo indicar privilégio: isAdmin, role admin/super_admin, ou isPremium
  const isAdmin =
    userProfile?.isAdmin === true ||
    userProfile?.isPremium === true ||
    userProfile?.role === 'admin' ||
    userProfile?.role === 'super_admin';

  const canAccessSystem = isAdmin || hasActiveSubscription;

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
    subscriptionEndDate,
    loading,
  };
};
