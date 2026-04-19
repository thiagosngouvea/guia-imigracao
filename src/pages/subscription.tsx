import { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS, formatPrice, getStripe } from '../lib/stripe';
import {
  HiCheckCircle,
  HiXCircle,
  HiAcademicCap,
  HiDocumentText,
  HiMap,
  HiMicrophone,
  HiSparkles,
  HiShieldCheck,
} from 'react-icons/hi';
import { HiArrowRight, HiLockClosed, HiBolt, HiRocketLaunch } from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';

type BillingInterval = 'month' | 'year';

interface PlanConfig {
  id: string;
  stripeId: string;
  tier: 'free' | 'pro' | 'expert';
  name: string;
  emoji: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyStripePlan: keyof typeof SUBSCRIPTION_PLANS;
  yearlyStripePlan: keyof typeof SUBSCRIPTION_PLANS;
  color: string;
  bgGradient: string;
  borderColor: string;
  badge?: string;
  features: Array<{ label: string; included: boolean; note?: string }>;
}

const PLANS: PlanConfig[] = [
  {
    id: 'free',
    stripeId: '',
    tier: 'free',
    name: 'Gratuito',
    emoji: '🆓',
    tagline: 'Comece sua jornada',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyStripePlan: 'monthly',
    yearlyStripePlan: 'yearly',
    color: 'text-slate-700',
    bgGradient: 'from-slate-50 to-slate-100',
    borderColor: 'border-slate-200',
    features: [
      { label: 'Criar conta', included: true },
      { label: 'Questionário de visto', included: true },
      { label: 'Visto recomendado por IA', included: true },
      { label: 'Explorar tipos de visto', included: true },
      { label: 'Treinos de entrevista com IA', included: false },
      { label: 'Trilha de imigração', included: false },
      { label: 'Assistente DS-160', included: false },
      { label: 'Modo voz', included: false },
      { label: 'Análise EB2-NIW', included: false },
    ],
  },
  {
    id: 'pro',
    stripeId: 'pro',
    tier: 'pro',
    name: 'Pro',
    emoji: '⭐',
    tagline: 'Prepare-se para o consulado',
    monthlyPrice: 4990,
    yearlyPrice: 44900,
    monthlyStripePlan: 'pro_monthly',
    yearlyStripePlan: 'pro_yearly',
    color: 'text-blue-700',
    bgGradient: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-400',
    badge: 'Mais Popular',
    features: [
      { label: 'Tudo do plano Gratuito', included: true },
      { label: '5 treinos de entrevista por mês', included: true, note: 'com IA GPT-4o-mini' },
      { label: 'Trilha de imigração completa', included: true },
      { label: 'Assistente DS-160', included: true },
      { label: 'Histórico de treinamentos', included: true },
      { label: 'Cenários B1/B2, F1 e H1B', included: true },
      { label: 'Modo voz', included: false, note: 'Expert only' },
      { label: 'Cenários avançados (O1, EB5)', included: false, note: 'Expert only' },
      { label: 'Análise EB2-NIW', included: false, note: 'Expert only' },
    ],
  },
  {
    id: 'expert',
    stripeId: 'expert',
    tier: 'expert',
    name: 'Expert',
    emoji: '🚀',
    tagline: 'Máxima preparação',
    monthlyPrice: 8990,
    yearlyPrice: 79900,
    monthlyStripePlan: 'expert_monthly',
    yearlyStripePlan: 'expert_yearly',
    color: 'text-violet-700',
    bgGradient: 'from-violet-600 to-purple-600',
    borderColor: 'border-violet-400',
    features: [
      { label: 'Tudo do plano Pro', included: true },
      { label: '20 treinos de entrevista por mês', included: true, note: 'com IA GPT-4o-mini' },
      { label: 'Modo voz — simule a entrevista real', included: true },
      { label: 'Todos os cenários (O1, EB5, EB2-NIW)', included: true },
      { label: 'Análise EB2-NIW com IA', included: true },
      { label: 'Cenários de dificuldade avançada', included: true },
      { label: 'Relatório detalhado de performance', included: true },
      { label: 'Acesso antecipado a novidades', included: true },
    ],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { planTier, hasActiveSubscription } = useSubscription();
  const router = useRouter();
  const [billing, setBilling] = useState<BillingInterval>('month');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: PlanConfig) => {
    if (plan.tier === 'free') return;
    if (!user) {
      router.push('/login');
      return;
    }

    const selectedStripeId =
      billing === 'month' ? plan.monthlyStripePlan : plan.yearlyStripePlan;

    setLoadingPlan(plan.id);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedStripeId,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.sessionId) {
        const stripe = await getStripe();
        await stripe?.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const yearlyDiscount = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const saved = monthlyTotal - yearlyPrice;
    const pct = Math.round((saved / monthlyTotal) * 100);
    return { saved, pct };
  };

  return (
    <Layout>
      <div
        className="min-h-screen pb-20"
        style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F0F4FF 100%)' }}
      >
        {/* ── Hero ───────────────────────────────────────── */}
        <div className="text-center pt-16 pb-10 px-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <HiSparkles className="w-4 h-4" />
            Planos para todos os momentos da sua jornada
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Escolha seu <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Plano</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10">
            Do questionário gratuito à preparação completa com IA. Comece de graça e faça upgrade quando precisar.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-2">
            <button
              onClick={() => setBilling('month')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                billing === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBilling('year')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                billing === 'year'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Anual
              <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
                -17%
              </span>
            </button>
          </div>
          {billing === 'year' && (
            <p className="text-sm text-emerald-600 font-medium">
              🎉 Economize 2 meses no plano anual!
            </p>
          )}
        </div>

        {/* ── Plan cards ─────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.tier === planTier;
            const isPro = plan.tier === 'pro';
            const isExpert = plan.tier === 'expert';
            const isFree = plan.tier === 'free';
            const price = billing === 'month' ? plan.monthlyPrice : plan.yearlyPrice;
            const perMonth =
              billing === 'year' && !isFree
                ? Math.round(plan.yearlyPrice / 12)
                : plan.monthlyPrice;
            const { saved, pct } = yearlyDiscount(plan.monthlyPrice, plan.yearlyPrice);

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl shadow-lg border-2 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.borderColor
                } ${isPro ? 'ring-2 ring-blue-400/40 scale-[1.02]' : ''}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-b-xl shadow">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div
                  className={`px-6 pt-${plan.badge ? '8' : '6'} pb-6 ${
                    isFree ? 'bg-slate-50' : `bg-gradient-to-br ${plan.bgGradient}`
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{plan.emoji}</span>
                    <h2 className={`text-xl font-bold ${isFree ? 'text-slate-800' : 'text-white'}`}>
                      {plan.name}
                    </h2>
                  </div>
                  <p className={`text-sm mb-5 ${isFree ? 'text-slate-500' : 'text-white/80'}`}>
                    {plan.tagline}
                  </p>

                  {isFree ? (
                    <div>
                      <span className="text-4xl font-bold text-slate-800">Grátis</span>
                      <p className="text-slate-400 text-sm mt-1">Para sempre</p>
                    </div>
                  ) : (
                    <div>
                      {billing === 'year' && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-white/60 line-through">
                            R${(plan.monthlyPrice / 100).toFixed(0).replace('.', ',')}/mês
                          </span>
                          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                            -{pct}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          {formatPrice(perMonth)}
                        </span>
                        <span className="text-white/70 text-sm">/mês</span>
                      </div>
                      {billing === 'year' && (
                        <p className="text-white/70 text-xs mt-1">
                          {formatPrice(price)} cobrado anualmente · Economia de {formatPrice(saved)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="px-6 py-5 space-y-3">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {f.included ? (
                        <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <HiXCircle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm leading-snug ${f.included ? 'text-slate-700' : 'text-slate-400'}`}>
                        {f.label}
                        {f.note && (
                          <span className="ml-1.5 text-xs font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                            {f.note}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  {isFree ? (
                    isCurrentPlan && !hasActiveSubscription ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm cursor-default"
                      >
                        ✓ Seu plano atual
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(user ? '/dashboard' : '/cadastro')}
                        className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        {user ? 'Ir ao Dashboard' : 'Criar conta grátis'}
                        <HiArrowRight className="w-4 h-4" />
                      </button>
                    )
                  ) : isCurrentPlan ? (
                    <button
                      disabled
                      className={`w-full py-3 rounded-xl font-semibold text-sm cursor-default ${
                        isPro
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-violet-50 text-violet-600'
                      }`}
                    >
                      ✓ Seu plano atual
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={!!loadingPlan}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                        isPro
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                          : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-violet-500/20'
                      } disabled:opacity-60`}
                    >
                      {loadingPlan === plan.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {isExpert ? <HiRocketLaunch className="w-4 h-4" /> : <HiBolt className="w-4 h-4" />}
                          Assinar {plan.name}
                          {billing === 'year' ? ' Anual' : ''}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Feature comparison table ────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Comparativo completo
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-slate-500 font-medium">Funcionalidade</th>
                  <th className="text-center px-4 py-4 text-slate-700 font-semibold">🆓 Gratuito</th>
                  <th className="text-center px-4 py-4 text-blue-700 font-bold bg-blue-50">⭐ Pro</th>
                  <th className="text-center px-4 py-4 text-violet-700 font-bold">🚀 Expert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { feature: 'Questionário de visto', free: true, pro: true, expert: true },
                  { feature: 'Visto recomendado por IA', free: true, pro: true, expert: true },
                  { feature: 'Explorar tipos de visto', free: true, pro: true, expert: true },
                  { feature: 'Trilha de imigração', free: false, pro: true, expert: true },
                  { feature: 'Assistente DS-160', free: false, pro: true, expert: true },
                  { feature: 'Treinos de entrevista com IA', free: false, pro: '5/mês', expert: '20/mês' },
                  { feature: 'Modo voz', free: false, pro: false, expert: true },
                  { feature: 'Cenários avançados (O1, EB5)', free: false, pro: false, expert: true },
                  { feature: 'Análise EB2-NIW com IA', free: false, pro: false, expert: true },
                  { feature: 'Histórico de treinamentos', free: false, pro: true, expert: true },
                  { feature: 'Relatório de performance', free: false, pro: 'Básico', expert: 'Completo' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center">
                      {row.free === true ? (
                        <FiCheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : row.free === false ? (
                        <HiXCircle className="w-4 h-4 text-slate-200 mx-auto" />
                      ) : (
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{row.free}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center bg-blue-50/50">
                      {row.pro === true ? (
                        <FiCheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : row.pro === false ? (
                        <HiXCircle className="w-4 h-4 text-slate-200 mx-auto" />
                      ) : (
                        <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{row.pro}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.expert === true ? (
                        <FiCheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : row.expert === false ? (
                        <HiXCircle className="w-4 h-4 text-slate-200 mx-auto" />
                      ) : (
                        <span className="text-xs font-medium text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">{row.expert}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ ────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim! Você pode cancelar sua assinatura a qualquer momento. O acesso continua até o fim do período pago.',
              },
              {
                q: 'O que acontece quando atinjo o limite de treinamentos?',
                a: 'Quando você usa todos os treinos do mês, o contador reseta automaticamente no mês seguinte. Ou você pode fazer upgrade para um plano com mais sessões.',
              },
              {
                q: 'Os treinos usam IA de verdade?',
                a: 'Sim! Usamos o GPT-4o-mini da OpenAI para gerar feedbacks personalizados e simular o comportamento de um cônsul americano.',
              },
              {
                q: 'Como funciona o plano anual?',
                a: 'No plano anual você paga 10 meses pelo preço de 12. O desconto é aplicado automaticamente e você economiza cerca de 2 meses de assinatura.',
              },
              {
                q: 'Posso mudar de plano depois?',
                a: 'Sim! Você pode fazer upgrade do Pro para o Expert a qualquer momento pelo painel de assinaturas.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{item.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust badges ────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 mt-12">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: <HiShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-2" />, text: 'Pagamento seguro via Stripe' },
              { icon: <HiLockClosed className="w-6 h-6 text-blue-500 mx-auto mb-2" />, text: 'Seus dados são protegidos' },
              { icon: <FiCheckCircle className="w-6 h-6 text-violet-500 mx-auto mb-2" />, text: 'Cancele quando quiser' },
            ].map((b, i) => (
              <div key={i}>
                {b.icon}
                <p className="text-slate-600 text-xs font-medium">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
