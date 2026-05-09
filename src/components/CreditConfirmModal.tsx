import { HiCreditCard, HiSparkles, HiXMark } from 'react-icons/hi2';

interface CreditConfirmModalProps {
  open: boolean;
  featureLabel: string;
  cost: number;
  credits: number;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CreditConfirmModal({
  open,
  featureLabel,
  cost,
  credits,
  loading = false,
  onCancel,
  onConfirm,
}: CreditConfirmModalProps) {
  if (!open) return null;

  const remaining = Math.max(0, credits - cost);

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <HiCreditCard className="w-5 h-5" />
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar uso de créditos</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Para continuar em <span className="font-semibold text-slate-800">{featureLabel}</span>, serão descontados{' '}
          <span className="font-semibold text-amber-700">{cost} crédito{cost !== 1 ? 's' : ''}</span> da sua conta.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-5 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Saldo atual</span>
            <span className="font-semibold text-slate-800">{credits}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 mt-1">
            <span>Após confirmar</span>
            <span className="font-semibold text-slate-800">{remaining}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
          >
            <HiSparkles className="w-4 h-4" />
            {loading ? 'Processando...' : `Confirmar (${cost})`}
          </button>
        </div>
      </div>
    </div>
  );
}
