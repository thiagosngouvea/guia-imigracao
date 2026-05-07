import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useCredits } from '../hooks/useCredits';
import { FEATURE_COSTS, FeatureKey, getFeatureLabel, formatPrice } from '../lib/stripe';
import { HiLockClosed, HiSparkles, HiArrowRight, HiCreditCard } from 'react-icons/hi2';

interface CreditGateProps {
  /** Funcionalidade que requer créditos */
  feature: FeatureKey;
  children: ReactNode;
  /** Mensagem customizada no overlay */
  message?: string;
  /** Label do botão CTA */
  ctaLabel?: string;
  /** Desfoca os filhos quando bloqueado (padrão: true) */
  blur?: boolean;
}

/**
 * Protege uma funcionalidade que requer créditos.
 * Se o usuário tiver saldo suficiente (ou for admin), renderiza os filhos normalmente.
 * Caso contrário, exibe overlay com CTA para comprar créditos.
 */
export const CreditGate = ({
  feature,
  children,
  message,
  ctaLabel,
  blur = true,
}: CreditGateProps) => {
  const { credits, isAdmin, canAfford, loading } = useCredits();
  const router = useRouter();
  const cost = FEATURE_COSTS[feature];

  // Admins e usuários com saldo suficiente passam direto
  if (isAdmin || (!loading && canAfford(feature))) {
    return <>{children}</>;
  }

  // Ainda carregando — não bloqueia prematuramente
  if (loading) return <>{children}</>;

  const defaultMessage =
    message ??
    `Use ${getFeatureLabel(feature)} comprando créditos. Você precisará de ${cost} crédito${cost > 1 ? 's' : ''} para usar esta funcionalidade.`;

  return (
    <div className="relative">
      {/* Filhos desfocados */}
      {blur && (
        <div
          className="pointer-events-none select-none"
          style={{ filter: 'blur(6px)', userSelect: 'none' }}
          aria-hidden="true"
        >
          {children}
        </div>
      )}

      {/* Overlay */}
      <div
        className={`${blur ? 'absolute inset-0' : ''} flex items-center justify-center`}
        style={blur ? { background: 'rgba(248,250,252,0.80)', backdropFilter: 'blur(2px)' } : {}}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full mx-4 text-center">
          {/* Ícone */}
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-400/30">
            <HiCreditCard className="w-7 h-7 text-white" />
          </div>

          {/* Badge de custo */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <HiSparkles className="w-3.5 h-3.5" />
            {cost} crédito{cost > 1 ? 's' : ''} por uso
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Créditos insuficientes
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-3">
            {defaultMessage}
          </p>

          {/* Saldo atual */}
          <p className="text-xs text-slate-400 mb-6">
            Seu saldo atual:{' '}
            <span className="font-semibold text-slate-600">
              {credits} crédito{credits !== 1 ? 's' : ''}
            </span>
          </p>

          <button
            onClick={() => router.push('/comprar-creditos')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md shadow-amber-400/25 flex items-center justify-center gap-2 text-sm"
          >
            <HiCreditCard className="w-4 h-4" />
            {ctaLabel ?? 'Comprar Créditos'}
            <HiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Versão inline — exibe o CTA sem desfocar os filhos.
 */
export const CreditGateInline = (props: Omit<CreditGateProps, 'blur'>) => (
  <CreditGate {...props} blur={false} />
);
