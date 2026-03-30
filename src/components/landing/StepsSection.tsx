import { HiChatBubbleLeftRight, HiCpuChip, HiChartBar } from 'react-icons/hi2';

const STEPS = [
  {
    number: '01',
    icon: HiChatBubbleLeftRight,
    title: 'Responda algumas perguntas',
    description:
      'Compartilhe seu perfil, formação, experiência profissional e objetivos de imigração em menos de 2 minutos.',
    color: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-200',
  },
  {
    number: '02',
    icon: HiCpuChip,
    title: 'Analisamos seu perfil',
    description:
      'Nossa IA processa mais de 50 critérios do seu perfil e compara com os requisitos dos principais vistos americanos.',
    color: 'from-indigo-500 to-violet-600',
    glow: 'shadow-indigo-200',
  },
  {
    number: '03',
    icon: HiChartBar,
    title: 'Veja os vistos com maior chance',
    description:
      'Receba um relatório personalizado com os vistos mais compatíveis, a porcentagem de elegibilidade e os próximos passos.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-200',
  },
];

export function StepsSection() {
  return (
    <section className="py-20 bg-white" id="como-funciona">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
            Simples e rápido
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Como funciona
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto text-sm">
            Em 3 passos simples, você descobre quais vistos têm a maior chance de aprovação para o
            seu perfil.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
          {/* Connector lines - desktop only */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-14 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200"
          />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Icon bubble */}
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl ${step.glow} mb-6 group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="w-9 h-9 text-white" />
                </div>

                {/* Step number */}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 border-2 border-white text-slate-500 text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                  {step.number}
                </span>

                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
