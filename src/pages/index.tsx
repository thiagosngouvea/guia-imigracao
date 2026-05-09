import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import {
  HiArrowRight,
  HiSparkles,
  HiShieldCheck,
  HiAcademicCap,
  HiRocketLaunch,
  HiDocumentText,
  HiCheckCircle,
  HiBolt,
} from 'react-icons/hi2';
import { HiCheckCircle as HiCheckCircleOld } from 'react-icons/hi';

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <HiSparkles className="w-6 h-6" />,
    title: 'Diagnóstico com IA',
    description:
      'Responda um questionário e descubra qual visto se encaixa no seu perfil — com recomendações personalizadas e fundamentadas.',
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
  },
  {
    icon: <HiAcademicCap className="w-6 h-6" />,
    title: 'Simulação de Entrevista',
    description:
      'Pratique com um consul americano virtual. Perguntas reais, feedback imediato e modos texto, voz e tempo real.',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    lightText: 'text-violet-600',
  },
  {
    icon: <HiDocumentText className="w-6 h-6" />,
    title: 'Assistente DS-160',
    description:
      'Preencha o formulário DS-160 sem erros. Nossa IA te guia campo a campo com dicas e explicações contextuais.',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-600',
  },
  {
    icon: <HiRocketLaunch className="w-6 h-6" />,
    title: 'Trilha de Imigração',
    description:
      'Acompanhe cada etapa do processo — de documentos a agendamentos — com um checklist interativo e personalizado.',
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-600',
  },
];

const VISA_CARDS = [
  {
    type: 'B1/B2',
    subtitle: 'Turismo & Negócios',
    description: 'O visto mais solicitado por brasileiros. Ideal para viagens de lazer, visitas familiares e eventos.',
    items: ['Estadias de até 6 meses', 'Turismo e lazer', 'Visitas a familiares', 'Eventos e conferências', 'Tratamentos médicos'],
    gradient: 'from-blue-600 to-indigo-700',
    badge: 'Mais popular',
  },
  {
    type: 'F1',
    subtitle: 'Estudante',
    description: 'Para quem quer estudar nos EUA, de cursos de inglês até pós-graduação nas melhores universidades.',
    items: ['Cursos de inglês', 'Graduação e pós-graduação', 'Cursos técnicos', 'Trabalho no campus permitido', 'Duração do curso'],
    gradient: 'from-violet-600 to-purple-700',
    badge: null,
  },
];

const BENEFITS = [
  { text: 'Sem mensalidades — pague apenas o que usar' },
  { text: 'Disponível 24h, 7 dias por semana' },
  { text: 'Respostas em português, do jeito brasileiro' },
  { text: 'Dados protegidos com criptografia de ponta' },
  { text: 'Pagamentos seguros via Stripe' },
  { text: 'Suporte da equipe em tempo real' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (user) return null;

  return (
    <Layout>
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          }}
        />
        {/* Glow orbs */}
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            transform: 'translate(-50%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            transform: 'translate(50%, 30%)',
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <HiBolt className="w-3.5 h-3.5 text-blue-400" />
              Inteligência artificial para sua imigração
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
              Seu visto americano,{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #818cf8, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                sem complicação
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10">
              Do diagnóstico ao treinamento de entrevista — tudo em português, com IA avançada, para você chegar ao consulado preparado e confiante.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/cadastro">
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                  Começar gratuitamente
                  <HiArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/login">
                <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200">
                  Já tenho conta
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <HiShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sem cartão de crédito para começar</span>
              </div>
              <div className="flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4 text-blue-400" />
                <span>Cadastro em menos de 1 minuto</span>
              </div>
              <div className="flex items-center gap-2">
                <HiSparkles className="w-4 h-4 text-violet-400" />
                <span>Powered by GPT-4o</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="max-w-xl mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Plataforma completa</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mt-4 text-slate-500 text-lg leading-relaxed">
              Cada funcionalidade foi pensada para reduzir o estresse do processo e aumentar suas chances de aprovação.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>

                {/* Bottom accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISA TYPES ──────────────────────────────────────────── */}
      <section className="py-28" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Especialização</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Foco total nos vistos mais solicitados
            </h2>
            <p className="mt-4 text-slate-500 text-lg">
              Cobertura completa para os tipos de visto mais procurados por brasileiros.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {VISA_CARDS.map((v, i) => (
              <div key={i} className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                {/* Header */}
                <div className={`relative bg-gradient-to-br ${v.gradient} p-8 text-white overflow-hidden`}>
                  {/* Glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent)' }} />

                  {v.badge && (
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                      <HiSparkles className="w-3 h-3" />
                      {v.badge}
                    </span>
                  )}
                  <h3 className="text-4xl font-black mb-1">{v.type}</h3>
                  <p className="text-white/80 font-semibold text-sm mb-3">{v.subtitle}</p>
                  <p className="text-white/70 text-sm leading-relaxed max-w-sm">{v.description}</p>
                </div>

                {/* Body */}
                <div className="p-8">
                  <ul className="space-y-3">
                    {v.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-slate-700 text-sm">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${v.gradient} text-white flex items-center justify-center shrink-0`}>
                          <HiCheckCircleOld className="w-3 h-3" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link href="/cadastro">
                      <button className={`w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r ${v.gradient} text-white hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2`}>
                        Começar com visto {v.type}
                        <HiArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming soon banner */}
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 text-sm">Em breve: H1B, O1, EB-2 NIW e mais</p>
              <p className="text-slate-500 text-xs mt-0.5">Cadastre-se agora e seja notificado assim que novos vistos estiverem disponíveis.</p>
            </div>
            <Link href="/cadastro">
              <button className="shrink-0 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Me avisar <HiArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── REALTIME TRAINING HIGHLIGHT ────────────────────────── */}
      <section className="py-28" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                <HiBolt className="w-3.5 h-3.5" />
                Treinamento em tempo real
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
                Treine como se já estivesse
                <br />
                na entrevista do consulado
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
                A experiência é igual ao modo realtime do sistema: conexão instantânea, IA ouvindo sua voz, resposta por áudio e transcrição sincronizada em cada turno.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Status ao vivo: conectando, ouvindo e IA falando',
                  'Transcrição automática do usuário e da IA em bolhas',
                  'Feedback final com score, veredito e recomendações',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shrink-0">
                      <HiCheckCircleOld className="w-3 h-3" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/cadastro">
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                  Testar treinamento realtime
                  <HiArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 blur-3xl rounded-[2rem] pointer-events-none" />
              <div className="relative bg-slate-950/95 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
                  <div className="flex items-center gap-2 text-slate-100 text-sm font-medium">
                    <HiSparkles className="w-4 h-4 text-indigo-400" />
                    Modo Realtime · Turismo B1/B2
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-amber-300 text-[11px] font-semibold bg-amber-500/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-amber-400 rt-pulse-dot" />
                      Conectando
                    </div>
                    <div className="inline-flex items-center gap-2 text-blue-300 text-[11px] font-semibold bg-blue-500/10 border border-blue-400/20 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-blue-400 rt-pulse-dot" />
                      Ouvindo
                    </div>
                    <div className="inline-flex items-center gap-2 text-violet-300 text-[11px] font-semibold bg-violet-500/10 border border-violet-400/20 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-violet-400 rt-pulse-dot" />
                      IA falando
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-slate-400">Áudio ao vivo</p>
                      <p className="text-[11px] text-slate-500 font-mono">00:47</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                        <p className="text-[11px] text-blue-200 mb-2">Você</p>
                        <div className="flex items-end gap-1 h-8">
                          {[10, 22, 16, 30, 18, 26, 14].map((h, i) => (
                            <span
                              key={i}
                              className="rt-voice-bar w-1.5 rounded-full bg-gradient-to-t from-blue-500 to-cyan-300"
                              style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
                        <p className="text-[11px] text-violet-200 mb-2">IA</p>
                        <div className="flex items-end gap-1 h-8">
                          {[8, 18, 12, 24, 14, 20, 10].map((h, i) => (
                            <span
                              key={i}
                              className="rt-voice-bar w-1.5 rounded-full bg-gradient-to-t from-violet-500 to-indigo-300"
                              style={{ height: `${h}px`, animationDelay: `${i * 0.09}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 mb-3">Transcrição em tempo real</p>
                    <div className="space-y-2.5 max-h-[180px] overflow-hidden">
                      <div className="flex justify-end gap-2">
                        <div className="bg-blue-600 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm max-w-[82%]">
                          Vou para Orlando por 10 dias com minha esposa e meus filhos.
                        </div>
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center shrink-0 mt-1">👤</div>
                      </div>
                      <div className="flex justify-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-violet-600 text-[10px] text-white flex items-center justify-center shrink-0 mt-1">🤖</div>
                        <div className="bg-slate-800 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-2xl rounded-tl-sm max-w-[82%]">
                          Ótimo. Qual é seu trabalho no Brasil e quem vai pagar essa viagem?
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <div className="bg-blue-600 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm max-w-[82%]">
                          Sou engenheiro civil e vou pagar com minhas economias...
                          <span className="inline-block ml-1 text-white/60 rt-caret">▌</span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center shrink-0 mt-1">👤</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-400/20 rounded-2xl p-4">
                    <p className="text-xs text-indigo-200 mb-2">Feedback final da IA</p>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-slate-900/70 rounded-lg py-2">
                        <p className="text-[10px] text-slate-400">Clareza</p>
                        <p className="text-sm font-bold text-emerald-300">8.8</p>
                      </div>
                      <div className="bg-slate-900/70 rounded-lg py-2">
                        <p className="text-[10px] text-slate-400">Fluidez</p>
                        <p className="text-sm font-bold text-amber-300">7.8</p>
                      </div>
                      <div className="bg-slate-900/70 rounded-lg py-2">
                        <p className="text-[10px] text-slate-400">Confiança</p>
                        <p className="text-sm font-bold text-emerald-300">8.5</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-semibold text-emerald-300">
                      Veredito: Aprovado provável
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Ponto de melhoria: reduzir pausas longas e reforçar vínculos no Brasil em até 2 frases objetivas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .rt-voice-bar {
            animation: wave 1.2s ease-in-out infinite;
            transform-origin: center bottom;
          }
          .rt-pulse-dot {
            animation: dotPulse 1.1s ease-in-out infinite;
          }
          .rt-caret {
            animation: caretBlink 1s step-end infinite;
          }
          @keyframes wave {
            0%,
            100% {
              transform: scaleY(0.45);
              opacity: 0.55;
            }
            50% {
              transform: scaleY(1);
              opacity: 1;
            }
          }
          @keyframes dotPulse {
            0% {
              opacity: 0.4;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes caretBlink {
            0%,
            50% {
              opacity: 1;
            }
            51%,
            100% {
              opacity: 0;
            }
          }
        `}</style>
      </section>

      {/* ── BENEFITS ────────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Por que a MoveEasy?</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
                Construído para quem leva a imigração a sério
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-10">
                Combinamos inteligência artificial de ponta com o conhecimento de especialistas em imigração para criar a preparação mais completa do mercado.
              </p>

              <ul className="space-y-4">
                {BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shrink-0">
                      <HiCheckCircleOld className="w-3 h-3" />
                    </div>
                    <span className="text-sm">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '24/7', label: 'Disponibilidade', sub: 'Sem horários limitados', gradient: 'from-blue-500 to-indigo-600' },
                { value: '100%', label: 'Personalizado', sub: 'Baseado no seu perfil', gradient: 'from-violet-500 to-purple-600' },
                { value: 'GPT-4o', label: 'Motor de IA', sub: 'Tecnologia de ponta', gradient: 'from-emerald-500 to-teal-600' },
                { value: 'B1/B2 · F1', label: 'Vistos cobertos', sub: 'Mais em breve', gradient: 'from-amber-500 to-orange-500' },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${s.gradient} shadow-md`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent)' }} />
                  <p className="text-2xl sm:text-3xl font-black mb-1">{s.value}</p>
                  <p className="font-semibold text-white/90 text-sm">{s.label}</p>
                  <p className="text-white/60 text-xs mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <HiSparkles className="w-3.5 h-3.5 text-blue-400" />
            Comece hoje, de graça
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Pronto para começar<br />
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              sua jornada?
            </span>
          </h2>

          <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Crie sua conta gratuita e descubra em minutos qual visto é o ideal para você.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/cadastro">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 text-base">
                Criar conta gratuita
                <HiArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Já tenho conta →
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
