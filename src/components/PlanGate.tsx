import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { PlanTier, PLAN_LIMITS } from '../lib/stripe';
import { HiLockClosed, HiSparkles, HiArrowRight } from 'react-icons/hi2';

interface PlanGateProps {
  /** The feature key to check against PLAN_LIMITS */
  feature: keyof typeof PLAN_LIMITS['free'];
  /** Required plan tier */
  requiredTier?: PlanTier;
  children: ReactNode;
  /** Custom message to show in the paywall overlay */
  message?: string;
  /** Label for the CTA button */
  ctaLabel?: string;
  /** Whether to blur the children (default: true) */
  blur?: boolean;
}

const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  expert: 'Expert',
};

const PLAN_ICONS: Record<PlanTier, string> = {
  free: '🆓',
  pro: '⭐',
  expert: '🚀',
};

const FEATURE_MESSAGES: Partial<Record<keyof typeof PLAN_LIMITS['free'], string>> = {
  canAccessTraining: 'Treine sua entrevista de visto com IA e aumente suas chances de aprovação.',
  canAccessDS160: 'Preencha o formulário DS-160 com nosso assistente inteligente.',
  canAccessEB2NIW: 'Analise seu caso EB2-NIW comparando com casos reais do USCIS.',
  canAccessVisaPath: 'Monte sua trilha de imigração personalizada passo a passo.',
  canAccessMinhaTrilha: 'Acompanhe o progresso de todas as etapas da sua imigração.',
  canAccessVisaDetails: 'Acesse detalhes completos de cada tipo de visto americano.',
  canAccessVoiceMode: 'Pratique sua entrevista em voz para simular o ambiente real.',
  canAccessAdvancedScenarios: 'Acesse cenários avançados para H1B, O1, EB5 e EB2-NIW.',
};

/**
 * Wraps a feature with a plan gate.
 * If the user's plan doesn't allow the feature, shows a blurred overlay with upgrade CTA.
 */
export const PlanGate = ({
  feature,
  requiredTier,
  children,
  message,
  ctaLabel,
  blur = true,
}: PlanGateProps) => {
  const { planTier, limits, isAdmin } = usePlanLimits();
  const router = useRouter();

  // Admins bypass all gates
  if (isAdmin) return <>{children}</>;

  const hasAccess = limits[feature] as boolean;

  if (hasAccess) return <>{children}</>;

  // Determine which plan to point the user to
  const targetPlan: PlanTier = requiredTier ?? (() => {
    if (PLAN_LIMITS.pro[feature]) return 'pro';
    return 'expert';
  })();

  const defaultMessage = FEATURE_MESSAGES[feature] ?? 'Esta funcionalidade requer um plano superior.';
  const displayMessage = message ?? defaultMessage;

  return (
    <div className="relative">
      {/* Blurred children */}
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
        style={blur ? { background: 'rgba(248,250,252,0.75)', backdropFilter: 'blur(2px)' } : {}}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full mx-4 text-center animate-scale-in">
          {/* Lock icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25">
            <HiLockClosed className="w-7 h-7 text-white" />
          </div>

          {/* Plan badge */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <HiSparkles className="w-3.5 h-3.5" />
            Disponível no Plano {PLAN_ICONS[targetPlan]} {PLAN_LABELS[targetPlan]}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Funcionalidade Bloqueada
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {displayMessage}
          </p>

          <button
            onClick={() => router.push('/subscription')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
          >
            {ctaLabel ?? `Ver Planos e Fazer Upgrade`}
            <HiArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-slate-400 mt-3">
            Você está no plano{' '}
            <span className="font-semibold text-slate-500">
              {PLAN_ICONS[planTier]} {PLAN_LABELS[planTier]}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline version — just shows the CTA without blurring children.
 * Useful for buttons and small elements.
 */
export const PlanGateInline = ({
  feature,
  requiredTier,
  children,
  message,
  ctaLabel,
}: Omit<PlanGateProps, 'blur'>) => {
  return (
    <PlanGate feature={feature} requiredTier={requiredTier} message={message} ctaLabel={ctaLabel} blur={false}>
      {children}
    </PlanGate>
  );
};
