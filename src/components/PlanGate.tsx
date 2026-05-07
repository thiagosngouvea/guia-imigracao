import { ReactNode } from 'react';
import { CreditGate, CreditGateInline } from './CreditGate';
import { FeatureKey } from '../lib/stripe';

/**
 * PlanGate — Alias de compatibilidade para CreditGate.
 * 
 * O sistema de planos foi substituído pelo sistema de créditos.
 * Este componente mapeia as antigas features de plano para as novas features de crédito.
 * Novos componentes devem usar <CreditGate> diretamente.
 */

type LegacyFeature =
  | 'canAccessTraining'
  | 'canAccessDS160'
  | 'canAccessEB2NIW'
  | 'canAccessVisaPath'
  | 'canAccessMinhaTrilha'
  | 'canAccessVisaDetails'
  | 'canAccessVoiceMode'
  | 'canAccessAdvancedScenarios';

const LEGACY_FEATURE_MAP: Partial<Record<LegacyFeature, FeatureKey>> = {
  canAccessTraining: 'training',
  canAccessDS160: 'ds160',
  canAccessEB2NIW: 'eb2niw',
  canAccessVoiceMode: 'training_voice',
};

interface PlanGateProps {
  feature: LegacyFeature;
  requiredTier?: string;
  children: ReactNode;
  message?: string;
  ctaLabel?: string;
  blur?: boolean;
}

export const PlanGate = ({
  feature,
  children,
  message,
  ctaLabel,
  blur = true,
}: PlanGateProps) => {
  const creditFeature = LEGACY_FEATURE_MAP[feature];

  // Funcionalidades sem custo de créditos são sempre liberadas
  if (!creditFeature) {
    return <>{children}</>;
  }

  return (
    <CreditGate feature={creditFeature} message={message} ctaLabel={ctaLabel} blur={blur}>
      {children}
    </CreditGate>
  );
};

export const PlanGateInline = (props: Omit<PlanGateProps, 'blur'>) => (
  <PlanGate {...props} blur={false}>
    {props.children}
  </PlanGate>
);
