import { HiLockClosed } from 'react-icons/hi2';

interface VisaResult {
  visa: string;
  percentage: number;
  color: string;
  bg: string;
  bar: string;
}

const VISA_RESULTS: VisaResult[] = [
  {
    visa: 'EB-2 NIW',
    percentage: 72,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-100',
    bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  {
    visa: 'Visto de Estudante (F-1)',
    percentage: 85,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-100',
    bar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
  },
  {
    visa: 'H-1B',
    percentage: 40,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-100',
    bar: 'bg-gradient-to-r from-amber-400 to-orange-400',
  },
];

function compatibilityLabel(pct: number): string {
  if (pct >= 70) return 'Alta compatibilidade';
  if (pct >= 50) return 'Média compatibilidade';
  return 'Baixa compatibilidade';
}

function compatibilityBadgeClass(pct: number): string {
  if (pct >= 70) return 'bg-emerald-100 text-emerald-700';
  if (pct >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-600';
}

export function ResultPreview() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white" id="resultado">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
            Exemplo de resultado
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Veja como é seu relatório
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto text-sm">
            Após responder o quiz, você recebe um relatório completo como este — adaptado ao seu
            perfil real.
          </p>
        </div>

        {/* Mock card */}
        <div className="relative max-w-lg mx-auto">
          {/* Blur overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl backdrop-blur-[2px] bg-white/40">
            <div className="flex flex-col items-center gap-3 bg-white/90 border border-slate-200 rounded-2xl shadow-xl px-8 py-5 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <HiLockClosed className="w-5 h-5 text-white" />
              </div>
              <p className="text-slate-900 font-bold text-base">
                Faça o teste para ver seu resultado
              </p>
              <p className="text-slate-500 text-xs max-w-[200px]">
                Análise 100% gratuita e personalizada para o seu perfil
              </p>
            </div>
          </div>

          {/* Card content (blurred mockup) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-5 select-none">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Perfil analisado
                </p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">João Silva</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5">
                <p className="text-emerald-700 text-xs font-bold">3 vistos compatíveis</p>
              </div>
            </div>

            {VISA_RESULTS.map((v) => (
              <div key={v.visa} className={`rounded-2xl border p-4 ${v.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`font-bold text-sm ${v.color}`}>{v.visa}</p>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${compatibilityBadgeClass(v.percentage)}`}
                  >
                    {compatibilityLabel(v.percentage)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${v.bar} transition-all duration-700`}
                    style={{ width: `${v.percentage}%` }}
                  />
                </div>
                <p className={`mt-1.5 text-right text-sm font-extrabold ${v.color}`}>
                  {v.percentage}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
