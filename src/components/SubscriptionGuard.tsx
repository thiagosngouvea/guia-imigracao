import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Button } from './ui/Button';

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SubscriptionGuard = ({ children, fallback }: SubscriptionGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { canAccessSystem, isAdmin, hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();

  // Show loading while checking auth and subscription
  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  // Allow access if user can access system (admin or has active subscription)
  if (canAccessSystem) {
    return <>{children}</>;
  }

  // Show subscription required message
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-8V7m0 0V5m0 2h2m-2 0H10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Assinatura Necessária
          </h2>
          <p className="text-gray-600">
            Para acessar o sistema completo, você precisa de uma assinatura ativa.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/subscription')}
            className="w-full"
          >
            Ver Planos de Assinatura
          </Button>
          
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="w-full"
          >
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Já tem uma assinatura?{' '}
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Recarregar página
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
