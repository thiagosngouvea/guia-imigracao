import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { SUBSCRIPTION_PLANS, formatPrice, getStripe } from '../lib/stripe';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { hasActiveSubscription, isAdmin, subscriptionStatus, planType, subscriptionEndDate } = useSubscription();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  console.log('User:', user);

  const handleSubscribe = async (planId: 'monthly' | 'yearly') => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planId,
          userId: user.uid,
        }),
      });

      console.log('Response:', response);
      const { sessionId } = await response.json();
      const stripe = await getStripe();
      
      console.log('Stripe:', stripe);
      
      if (stripe) {
        console.log('Redirecting to checkout:', sessionId);
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading('manage');

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Erro ao acessar gerenciamento. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha seu Plano
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tenha acesso completo ao sistema de preparação para imigração com nossos planos flexíveis.
            </p>
          </div>

          {/* Current Subscription Status */}
          {(hasActiveSubscription || isAdmin) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {isAdmin ? 'Acesso de Administrador' : 'Assinatura Ativa'}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    {isAdmin ? (
                      <p>Você tem acesso completo como administrador.</p>
                    ) : (
                      <div>
                        <p>Plano: {planType === 'yearly' ? 'Anual' : 'Mensal'}</p>
                        <p>Status: {subscriptionStatus}</p>
                        {subscriptionEndDate && (
                          <p>Válido até: {subscriptionEndDate.toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {hasActiveSubscription && !isAdmin && (
                <div className="mt-4">
                  <Button
                    onClick={handleManageSubscription}
                    variant="outline"
                    disabled={loading === 'manage'}
                    className="text-green-700 border-green-300 hover:bg-green-100"
                  >
                    {loading === 'manage' ? 'Carregando...' : 'Gerenciar Assinatura'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  key === 'yearly' ? 'ring-2 ring-blue-500 relative' : ''
                }`}
              >
                {key === 'yearly' && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                    Mais Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-600">
                      /{plan.interval === 'month' ? 'mês' : 'ano'}
                    </span>
                    {key === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Economize 2 meses!
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Acesso completo ao sistema
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Questionários personalizados
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Simulação de entrevistas
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Documentação completa
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Suporte prioritário
                    </li>
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(key as 'monthly' | 'yearly')}
                    disabled={loading === key || (hasActiveSubscription && !isAdmin)}
                    className={`w-full ${
                      key === 'yearly' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                  >
                    {loading === key ? 'Processando...' : 
                     hasActiveSubscription && !isAdmin ? 'Plano Ativo' : 
                     'Assinar Agora'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Perguntas Frequentes
            </h2>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Posso cancelar a qualquer momento?
                </h3>
                <p className="text-gray-600">
                  Sim, você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Há garantia de reembolso?
                </h3>
                <p className="text-gray-600">
                  Oferecemos garantia de reembolso de 7 dias para novos usuários.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Posso mudar de plano?
                </h3>
                <p className="text-gray-600">
                  Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
