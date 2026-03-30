import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { SUBSCRIPTION_PLANS, formatPrice, getStripe } from '../lib/stripe';
import { HiCheckCircle, HiShieldCheck } from 'react-icons/hi';
import { HiStar, HiArrowRight, HiSparkles } from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';

const FEATURES = [
  'Acesso completo ao sistema',
  'Questionários personalizados de visto',
  'Simulação de entrevistas com IA',
  'Documentação e checklists completos',
  'Assistente DS-160',
  'Análise de perfil EB2 NIW',
  'Suporte prioritário',
];

const FAQ = [
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim, você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento.' },
  { q: 'Há garantia de reembolso?', a: 'Oferecemos garantia de reembolso de 7 dias para novos usuários.' },
  { q: 'Posso mudar de plano?', a: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.' },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { hasActiveSubscription, isAdmin, subscriptionStatus, planType, subscriptionEndDate } = useSubscription();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribe = async (planId: 'monthly' | 'yearly') => {
    if (!user) { router.push('/login'); return; }
    setLoading(planId);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planId, userId: user.uid }),
      });
      const { sessionId } = await response.json();
      const stripe = await getStripe();
      if (stripe) await stripe.redirectToCheckout({ sessionId });
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
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
      <div className="py-16 px-4" style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1e3a8a 50%, #0F172A 100%)' }}>
        {/* Hero */}
        <div className="text-center mb-14 max-w-2xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <HiSparkles className="w-3.5 h-3.5" /> Planos MoveEasy
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Comece sua jornada<br />rumo aos EUA
          </h1>
          <p className="text-blue-200 text-lg">
            Acesso completo às ferramentas que vão te guiar em cada etapa do processo de imigração.
          </p>
        </div>

        {/* Active subscription banner */}
        {(hasActiveSubscription || isAdmin) && (
          <div className="max-w-3xl mx-auto mb-10 animate-fade-in">
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <HiShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-300 text-sm">
                    {isAdmin ? 'Acesso de Administrador' : 'Assinatura Ativa'}
                  </h3>
                  <div className="text-emerald-400/80 text-xs mt-1 space-y-0.5">
                    {isAdmin ? <p>Você tem acesso completo como administrador.</p> : (
                      <>
                        <p>Plano: {planType === 'yearly' ? 'Anual' : 'Mensal'} · Status: {subscriptionStatus}</p>
                        {subscriptionEndDate && <p>Válido até: {subscriptionEndDate.toLocaleDateString('pt-BR')}</p>}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {hasActiveSubscription && !isAdmin && (
                <Button variant="outline" size="sm" onClick={handleManageSubscription} isLoading={loading === 'manage'}
                  className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 shrink-0">
                  Gerenciar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16 stagger-children">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const isPopular = key === 'yearly';
            return (
              <div key={key} className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:-translate-y-1 duration-200 ${isPopular ? 'ring-2 ring-blue-500' : ''}`}>
                {isPopular && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 text-center flex items-center justify-center gap-1.5">
                    <HiStar className="w-3.5 h-3.5" /> Mais Popular — Economize 2 meses
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold text-slate-900">{formatPrice(plan.price)}</span>
                    <span className="text-slate-500 ml-2 text-sm">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {FEATURES.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                        <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe(key as 'monthly' | 'yearly')}
                    disabled={loading === key || (hasActiveSubscription && !isAdmin)}
                    isLoading={loading === key}
                    variant={isPopular ? 'primary' : 'secondary'}
                    className={`w-full gap-2 ${!isPopular ? 'bg-slate-900 text-white hover:bg-slate-800 border-none' : ''}`}
                  >
                    {hasActiveSubscription && !isAdmin ? 'Plano Ativo' : (
                      <>{loading !== key && 'Assinar Agora'} {loading !== key && <HiArrowRight className="w-4 h-4" />}</>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Perguntas Frequentes</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left p-5 flex items-center justify-between gap-4 text-white hover:bg-white/5 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-sm">{item.q}</span>
                  <span className={`text-blue-300 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-blue-200 text-sm leading-relaxed border-t border-white/10 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
