import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * SubscriptionGuard now only redirects unauthenticated users.
 * Feature-level access control is handled by <PlanGate> components.
 * All authenticated users (including free tier) can access the app.
 */
export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  // All authenticated users can access the app
  // Feature gates are handled by <PlanGate> components on each page
  return <>{children}</>;
};
