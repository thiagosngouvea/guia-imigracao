import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { CREDIT_PACKAGES, FEATURE_COSTS, formatPrice, getStripe, CreditPackageId } from '../lib/stripe';
import {
  HiCreditCard,
  HiSparkles,
  HiShieldCheck,
  HiCheckCircle,
} from 'react-icons/hi';
import {
  HiArrowRight,
  HiBolt,
  HiRocketLaunch,
  HiAcademicCap,
  HiDocumentText,
  HiMicrophone,
  HiGlobeAlt,
} from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';

const FEATURE_LIST = [
  { icon: <HiAcademicCap className="w-5 h-5 text-blue-500" />, label: 'Treinamento de Entrevista (texto)', cost: FEATURE_COSTS.training, color: 'bg-blue-50' },
  { icon: <HiMicrophone className="w-5 h-5 text-emerald-500" />, label: 'Treinamento com Modo Voz', cost: FEATURE_COSTS.training_voice, color: 'bg-emerald-50' },
  { icon: <HiDocumentText className="w-5 h-5 text-violet-500" />, label: 'Assistente DS-160', cost: FEATURE_COSTS.ds160, color: 'bg-violet-50' },
  { icon: <HiGlobeAlt className="w-5 h-5 text-amber-500" />, label: 'Análise EB2-NIW com IA', cost: FEATURE_COSTS.eb2niw, color: 'bg-amber-50' },
];

const FREE_FEATURES = [
  'Questionário de visto personalizado',
  'Recomendação de visto por IA',
  'Explorar tipos de visto',
  'Trilha de imigração',
  'Minha Trilha (acompanhamento)',
];

export default function ComprarCreditos() {
  const { user } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const router = useRouter();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  const { success, canceled, package: purchasedPkg } = router.query;

  const handleBuyPackage = async (packageId: CreditPackageId) => {
    if (!user) {
      router.push('/login?next=/comprar-creditos');
      return;
    }

    setLoadingPackage(packageId);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          userId: user.uid,
          email: user.email,
          name: user.displayName,
        }),
      });

      const data = await response.json();
      if (data.sessionId) {
        const stripe = await getStripe();
        await stripe?.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPackage(null);
    }
  };

  const packages = Object.values(CREDIT_PACKAGES);

  return (
    <Layout>
      <div
        className="min-h-screen pb-24"
        style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #F8FAFC 40%, #EFF6FF 100%)' }}
      >
        {/* ── Success / canceled banners ─────────────────── */}
        {success === 'true' && (
          <div className="bg-emerald-600 text-white text-center py-3 px-4 text-sm font-medium flex items-center justify-center gap-2">
            <FiCheckCircle className="w-4 h-4" />
            Compra realizada com sucesso! Seus créditos já estão disponíveis.
          </div>
        )}
        {canceled === 'true' && (
          <div className="bg-amber-500 text-white text-center py-3 px-4 text-sm font-medium">
            Pagamento cancelado. Seus créditos não foram alterados.
          </div>
        )}

        {/* ── Hero ──────────────────────────────────────── */}
        <div className="text-center pt-14 pb-10 px-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <HiSparkles className="w-4 h-4" />
            Compre uma vez, use quando quiser. Sem assinatura.
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Comprar{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Créditos
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-6">
            Sem mensalidades. Compre créditos e use nas funcionalidades que precisar,
            no seu ritmo, sem prazo de validade.
          </p>

          {/* Saldo atual */}
          {user && !creditsLoading && (
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-700">
              <HiCreditCard className="w-4 h-4 text-amber-500" />
              Seu saldo atual:{' '}
              <span className="text-amber-600 font-bold text-base">{credits} crédito{credits !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* ── Pacotes ───────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {packages.map((pkg) => {
            const isLoading = loadingPackage === pkg.id;
            const isHighlighted = pkg.highlight;

            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-3xl border-2 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  isHighlighted
                    ? 'border-blue-400 ring-4 ring-blue-400/20 shadow-xl scale-[1.03]'
                    : 'border-slate-200 shadow-md'
                }`}
              >
                {/* Badge mais vendido */}
                {isHighlighted && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-b-xl shadow">
                      ⭐ Mais Vendido
                    </span>
                  </div>
                )}

                {/* Header do card */}
                <div className={`px-4 pt-${isHighlighted ? '8' : '5'} pb-4 bg-gradient-to-br ${pkg.color} text-white`}>
                  <div className="text-xl mb-1">{pkg.emoji}</div>
                  <h2 className="text-lg font-bold mb-0.5">{pkg.name}</h2>
                  <p className="text-white/75 text-xs mb-3">{pkg.tagline}</p>

                  {/* Preço */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-black">{formatPrice(pkg.price)}</span>
                  </div>
                  <p className="text-white/70 text-xs">
                    {formatPrice(pkg.pricePerCredit)}/crédito
                  </p>
                </div>

                {/* Créditos */}
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-2xl font-black text-slate-900">{pkg.credits}</p>
                      <p className="text-xs text-slate-500">créditos</p>
                    </div>
                    {pkg.bonusCredits > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-2 py-1.5 text-center">
                        <p className="text-base font-bold text-emerald-600">+{pkg.bonusCredits}</p>
                        <p className="text-xs text-emerald-500 font-medium">bônus</p>
                      </div>
                    )}
                  </div>

                  {pkg.bonusCredits > 0 && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1.5 mb-3">
                      <HiSparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                      <p className="text-xs text-emerald-700 font-medium">
                        Total: <span className="font-bold">{pkg.totalCredits} créd.</span>
                      </p>
                    </div>
                  )}

                  {/* Equivalência em treinos */}
                  <p className="text-xs text-slate-400 mb-4">
                    ≈ {Math.floor(pkg.totalCredits / FEATURE_COSTS.training)} treino{Math.floor(pkg.totalCredits / FEATURE_COSTS.training) !== 1 ? 's' : ''}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={() => handleBuyPackage(pkg.id as CreditPackageId)}
                    disabled={!!loadingPackage}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60 ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                        : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <HiBolt className="w-3.5 h-3.5" />
                        Comprar {pkg.totalCredits} créd.
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Custo por funcionalidade ───────────────────── */}
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
            Quanto custa cada funcionalidade?
          </h2>
          <p className="text-slate-500 text-center text-sm mb-8">
            Pague apenas pelo que usar. Sem surpresas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURE_LIST.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center shrink-0`}>
                  {f.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{f.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-slate-900">{f.cost}</p>
                  <p className="text-xs text-slate-400">crédito{f.cost > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Funcionalidades gratuitas ──────────────────── */}
        <div className="max-w-3xl mx-auto px-4 mb-16">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🆓</span> Sempre gratuito — sem créditos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ ────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Os créditos expiram?',
                a: 'Não! Seus créditos são válidos para sempre. Compre com calma e use quando precisar.',
              },
              {
                q: 'Posso comprar mais créditos depois?',
                a: 'Sim! Você pode comprar quantos pacotes quiser, a qualquer momento. Os créditos se acumulam.',
              },
              {
                q: 'O que acontece se eu não terminar o treinamento?',
                a: 'Os créditos são descontados ao iniciar a sessão, não ao finalizar. Aproveite ao máximo cada sessão!',
              },
              {
                q: 'O pagamento é seguro?',
                a: 'Sim. Processamos pagamentos via Stripe, líder mundial em pagamentos seguros. Nunca armazenamos dados do cartão.',
              },
              {
                q: 'Posso pedir reembolso?',
                a: 'Créditos já utilizados não são reembolsáveis. Créditos não utilizados podem ser reembolsados em até 7 dias após a compra. Entre em contato pelo suporte.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{item.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust badges ──────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: <HiShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-2" />, text: 'Pagamento seguro via Stripe' },
              { icon: <HiCreditCard className="w-6 h-6 text-blue-500 mx-auto mb-2" />, text: 'Sem assinatura recorrente' },
              { icon: <FiCheckCircle className="w-6 h-6 text-violet-500 mx-auto mb-2" />, text: 'Créditos sem prazo de validade' },
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
