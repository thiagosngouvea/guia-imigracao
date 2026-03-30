import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FreeQuizData, FreeVisaResult } from './api/analyze-free';
import { SUBSCRIPTION_PLANS, formatPrice, getStripe } from '../lib/stripe';
import {
  HiUser,
  HiAcademicCap,
  HiGlobeAlt,
  HiCheckCircle,
} from 'react-icons/hi';
import {
  HiArrowRight,
  HiArrowLeft,
  HiSparkles,
  HiChartBar,
  HiRocketLaunch,
  HiCheckBadge,
  HiLockClosed,
  HiStar,
  HiShieldCheck,
  HiBriefcase,
  HiCpuChip,
  HiDocumentText,
  HiChatBubbleLeftRight,
  HiMicrophone,
} from 'react-icons/hi2';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'lead' | 'quiz' | 'analyzing' | 'result';

interface LeadData {
  fullName: string;
  email: string;
  whatsapp: string;
  age: string;
  timeframe: string;
}

interface QuizAnswers {
  education: string;
  fieldOfStudy: string;
  occupation: string;
  yearsOfExperience: string;
  englishLevel: string;
  immigrationGoal: string;
  savings: string;
  hasJobOffer: boolean;
  hasFamily: boolean;
}

// ─── Quiz Questions Config ────────────────────────────────────────────────────

const QUIZ_STEPS = [
  {
    id: 'education',
    label: 'Formação',
    icon: HiAcademicCap,
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'occupation',
    label: 'Carreira',
    icon: HiBriefcase,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'goals',
    label: 'Objetivos',
    icon: HiGlobeAlt,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'financial',
    label: 'Situação',
    icon: HiCheckCircle,
    gradient: 'from-amber-500 to-orange-500',
  },
];

const PLATFORM_FEATURES = [
  {
    icon: HiChartBar,
    title: 'Trilha personalizada de visto',
    description: 'Plano passo a passo baseado no seu perfil e no visto ideal para você.',
  },
  {
    icon: HiChatBubbleLeftRight,
    title: 'Simulação de entrevista com IA',
    description: 'Pratique a entrevista consular com um oficial virtual treinado com IA.',
  },
  {
    icon: HiDocumentText,
    title: 'Assistente DS-160',
    description: 'Preencha o formulário DS-160 com orientação guiada e sem erros.',
  },
  {
    icon: HiMicrophone,
    title: 'Treino de voz e pronúncia',
    description: 'Melhore seu inglês para a entrevista com exercícios focados em vistos.',
  },
  {
    icon: HiCpuChip,
    title: 'Análise EB-2 NIW',
    description: 'Avaliação completa da sua elegibilidade para o green card por mérito.',
  },
  {
    icon: HiDocumentText,
    title: 'Checklists e documentação',
    description: 'Listas de documentos atualizadas para cada tipo de visto.',
  },
];

const TIMEFRAME_OPTIONS = [
  { value: 'menos de 6 meses', label: 'Menos de 6 meses' },
  { value: '6 a 12 meses', label: '6 a 12 meses' },
  { value: '1 a 2 anos', label: '1 a 2 anos' },
  { value: 'mais de 2 anos', label: 'Mais de 2 anos' },
  { value: 'ainda explorando', label: 'Ainda explorando' },
];

const EDUCATION_OPTIONS = [
  { value: 'Ensino Médio', label: 'Ensino Médio' },
  { value: 'Bacharelado', label: 'Bacharelado (Graduação)' },
  { value: 'Mestrado', label: 'Mestrado (MBA incluso)' },
  { value: 'Doutorado', label: 'Doutorado / PhD' },
];

const ENGLISH_OPTIONS = [
  { value: 'Nenhum', label: 'Nenhum' },
  { value: 'Básico', label: 'Básico' },
  { value: 'Intermediário', label: 'Intermediário (consigo me comunicar)' },
  { value: 'Avançado', label: 'Avançado (fluente em situações profissionais)' },
  { value: 'Fluente', label: 'Fluente / Bilíngue' },
];

const GOAL_OPTIONS = [
  { value: 'Trabalho', label: '💼 Trabalho / Carreira' },
  { value: 'Estudo', label: '🎓 Estudo / Pesquisa' },
  { value: 'Investimento / Negócio', label: '💰 Investimento / Negócio' },
  { value: 'Reunificação Familiar', label: '👨‍👩‍👧 Reunificação Familiar' },
  { value: 'Residência Permanente (Green Card)', label: '🏡 Residência Permanente (Green Card)' },
  { value: 'Turismo / Intercâmbio', label: '✈️ Turismo / Intercâmbio' },
];

const SAVINGS_OPTIONS = [
  { value: 'Menos de R$ 10 mil', label: 'Menos de R$ 10 mil' },
  { value: 'R$ 10 mil a R$ 50 mil', label: 'R$ 10 mil a R$ 50 mil' },
  { value: 'R$ 50 mil a R$ 200 mil', label: 'R$ 50 mil a R$ 200 mil' },
  { value: 'Mais de R$ 200 mil', label: 'Mais de R$ 200 mil' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400';

const labelCls = 'block text-sm font-semibold text-slate-700 mb-2';

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-1000`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function VisaBadge({ pct }: { pct: number }) {
  if (pct >= 70)
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
        Alta chance
      </span>
    );
  if (pct >= 50)
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
        Média chance
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
      Baixa chance
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TesteGratuitoPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('lead');
  const [quizStep, setQuizStep] = useState(0); // 0–3 within quiz
  const [loadingSubscribe, setLoadingSubscribe] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [lead, setLead] = useState<LeadData>({
    fullName: '',
    email: '',
    whatsapp: '',
    age: '',
    timeframe: '',
  });

  const [quiz, setQuiz] = useState<QuizAnswers>({
    education: '',
    fieldOfStudy: '',
    occupation: '',
    yearsOfExperience: '',
    englishLevel: '',
    immigrationGoal: '',
    savings: '',
    hasJobOffer: false,
    hasFamily: false,
  });

  const [result, setResult] = useState<FreeVisaResult | null>(null);
  const [leadErrors, setLeadErrors] = useState<Partial<LeadData>>({});

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, quizStep]);

  // ── Validation ──────────────────────────────────────────────────────────────

  function validateLead(): boolean {
    const errs: Partial<LeadData> = {};
    if (!lead.fullName.trim()) errs.fullName = 'Campo obrigatório';
    if (!lead.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email))
      errs.email = 'E-mail inválido';
    if (!lead.whatsapp.trim() || lead.whatsapp.replace(/\D/g, '').length < 10)
      errs.whatsapp = 'WhatsApp inválido';
    if (!lead.age || isNaN(Number(lead.age)) || Number(lead.age) < 16 || Number(lead.age) > 80)
      errs.age = 'Idade inválida (16–80)';
    if (!lead.timeframe) errs.timeframe = 'Selecione uma opção';
    setLeadErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function isQuizStepValid(): boolean {
    if (quizStep === 0) return !!quiz.education && !!quiz.fieldOfStudy;
    if (quizStep === 1) return !!quiz.occupation && !!quiz.yearsOfExperience && !!quiz.englishLevel;
    if (quizStep === 2) return !!quiz.immigrationGoal;
    if (quizStep === 3) return !!quiz.savings;
    return true;
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleLeadSubmit() {
    if (!validateLead()) return;
    setStep('quiz');
  }

  async function handleQuizFinish() {
    setStep('analyzing');

    const payload: FreeQuizData = {
      fullName: lead.fullName,
      email: lead.email,
      whatsapp: lead.whatsapp,
      age: Number(lead.age),
      timeframe: lead.timeframe,
      education: quiz.education,
      fieldOfStudy: quiz.fieldOfStudy,
      occupation: quiz.occupation,
      yearsOfExperience: Number(quiz.yearsOfExperience) || 0,
      englishLevel: quiz.englishLevel,
      immigrationGoal: quiz.immigrationGoal,
      savings: quiz.savings,
      hasJobOffer: quiz.hasJobOffer,
      hasFamily: quiz.hasFamily,
    };

    try {
      const res = await fetch('/api/analyze-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: FreeVisaResult = await res.json();
      setResult(data);
    } catch {
      // Fallback
      setResult({
        topVisa: 'EB-2 NIW',
        topVisaScore: 68,
        secondVisa: 'H-1B',
        secondVisaScore: 51,
        thirdVisa: 'F-1',
        thirdVisaScore: 40,
        profileSummary: 'Perfil com boa formação acadêmica e experiência profissional.',
        topVisaReason:
          'Seu nível de educação e experiência se encaixam bem nos critérios do EB-2 NIW.',
      });
    }

    setStep('result');
  }

  async function handleSubscribe(planId: 'monthly' | 'yearly') {
    setLoadingSubscribe(planId);
    // Redirect to register page with plan pre-selected in query
    router.push(`/cadastro?plan=${planId}&from=quiz&name=${encodeURIComponent(lead.fullName)}&email=${encodeURIComponent(lead.email)}`);
  }

  // ── Render steps ────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>Teste Gratuito de Visto | MoveEasy Immigration</title>
        <meta
          name="description"
          content="Faça o teste gratuito e descubra qual visto americano tem mais chances para o seu perfil. Análise com IA em menos de 2 minutos."
        />
      </Head>

      {/* ── Minimal header ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="bg-white rounded-lg px-2 py-0.5 shadow-sm">
              <img src="/logo.png" alt="MoveEasy" className="h-7 w-auto object-contain" />
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-xs font-medium">Análise gratuita com IA</span>
          </div>
        </div>
      </header>

      <main className="min-h-screen" style={{ background: 'linear-gradient(160deg, #F0F7FF 0%, #F8FAFC 60%, #EEF2FF 100%)' }}>

        {/* ════════════════════════════════════════════════════
            STEP 1 — LEAD CAPTURE
        ════════════════════════════════════════════════════ */}
        {step === 'lead' && (
          <div className="mx-auto max-w-lg px-4 py-12 animate-fade-in">
            {/* Top badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-blue-500/30">
                <HiSparkles className="w-3.5 h-3.5" />
                Análise Gratuita com IA
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                Antes de começar, nos conte um pouco sobre você
              </h1>
              <p className="mt-3 text-slate-500 text-sm">
                Leva menos de 30 segundos — prometemos não spammar 🙂
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-5">
              {/* Full name */}
              <div>
                <label className={labelCls}>
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="lead-name"
                  type="text"
                  className={inputCls}
                  placeholder="Ex: João da Silva"
                  value={lead.fullName}
                  onChange={(e) => setLead((p) => ({ ...p, fullName: e.target.value }))}
                />
                {leadErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{leadErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  id="lead-email"
                  type="email"
                  className={inputCls}
                  placeholder="seu@email.com"
                  value={lead.email}
                  onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
                />
                {leadErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{leadErrors.email}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className={labelCls}>
                  WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="lead-whatsapp"
                  type="tel"
                  className={inputCls}
                  placeholder="(11) 99999-9999"
                  value={lead.whatsapp}
                  onChange={(e) => setLead((p) => ({ ...p, whatsapp: e.target.value }))}
                />
                {leadErrors.whatsapp && (
                  <p className="text-red-500 text-xs mt-1">{leadErrors.whatsapp}</p>
                )}
              </div>

              {/* Age + Timeframe grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Idade <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lead-age"
                    type="number"
                    className={inputCls}
                    placeholder="Ex: 28"
                    value={lead.age}
                    onChange={(e) => setLead((p) => ({ ...p, age: e.target.value }))}
                  />
                  {leadErrors.age && (
                    <p className="text-red-500 text-xs mt-1">{leadErrors.age}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>
                    Previsão <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="lead-timeframe"
                    className={inputCls + ' cursor-pointer'}
                    value={lead.timeframe}
                    onChange={(e) => setLead((p) => ({ ...p, timeframe: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {TIMEFRAME_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {leadErrors.timeframe && (
                    <p className="text-red-500 text-xs mt-1">{leadErrors.timeframe}</p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <button
                id="lead-submit-btn"
                onClick={handleLeadSubmit}
                className="w-full mt-2 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base rounded-xl px-6 py-4 shadow-xl shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                Iniciar meu teste grátis
                <HiArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-xs text-slate-400 mt-2">
                🔒 Seus dados são protegidos. Não compartilhamos com terceiros.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 2 — QUIZ
        ════════════════════════════════════════════════════ */}
        {step === 'quiz' && (
          <div className="mx-auto max-w-lg px-4 py-10 animate-fade-in">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
                  Etapa {quizStep + 1} de {QUIZ_STEPS.length}
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(((quizStep + 1) / QUIZ_STEPS.length) * 100)}% concluído
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${((quizStep + 1) / QUIZ_STEPS.length) * 100}%` }}
                />
              </div>
              {/* Step dots */}
              <div className="flex gap-2 mt-3 justify-center">
                {QUIZ_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const done = i < quizStep;
                  const active = i === quizStep;
                  return (
                    <div
                      key={s.id}
                      className={`flex flex-col items-center ${i < quizStep - 1 ? 'opacity-60' : ''}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          done
                            ? 'bg-emerald-500 text-white shadow-md'
                            : active
                            ? `bg-gradient-to-br ${s.gradient} text-white shadow-lg scale-110`
                            : 'bg-white text-slate-300 border-2 border-slate-200'
                        }`}
                      >
                        {done ? <HiCheckBadge className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-medium ${
                          active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 animate-scale-in">
              {/* ── Quiz Step 0 — Formação ───── */}
              {quizStep === 0 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl">
                      <HiAcademicCap className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Formação Acadêmica</h2>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Nível de educação <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {EDUCATION_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setQuiz((p) => ({ ...p, education: o.value }))}
                          className={`px-3 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all duration-150 ${
                            quiz.education === o.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Área de estudo / especialidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Ex: Engenharia de Software, Medicina, Direito..."
                      value={quiz.fieldOfStudy}
                      onChange={(e) => setQuiz((p) => ({ ...p, fieldOfStudy: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* ── Quiz Step 1 — Carreira ───── */}
              {quizStep === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl">
                      <HiBriefcase className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Carreira Profissional</h2>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Profissão atual <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Ex: Engenheiro, Médico, Professor, Designer..."
                      value={quiz.occupation}
                      onChange={(e) => setQuiz((p) => ({ ...p, occupation: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Anos de experiência <span className="text-red-500">*</span></label>
                      <select
                        className={inputCls + ' cursor-pointer'}
                        value={quiz.yearsOfExperience}
                        onChange={(e) => setQuiz((p) => ({ ...p, yearsOfExperience: e.target.value }))}
                      >
                        <option value="">Selecione</option>
                        {['Menos de 1', '1 a 3', '3 a 5', '5 a 10', 'Mais de 10'].map((v) => (
                          <option key={v} value={v}>{v} anos</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Nível de inglês <span className="text-red-500">*</span></label>
                      <select
                        className={inputCls + ' cursor-pointer'}
                        value={quiz.englishLevel}
                        onChange={(e) => setQuiz((p) => ({ ...p, englishLevel: e.target.value }))}
                      >
                        <option value="">Selecione</option>
                        {ENGLISH_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Quiz Step 2 — Objetivos ───── */}
              {quizStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl">
                      <HiGlobeAlt className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Objetivo de Imigração</h2>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Qual é o seu principal objetivo? <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {GOAL_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setQuiz((p) => ({ ...p, immigrationGoal: o.value }))}
                          className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all duration-150 ${
                            quiz.immigrationGoal === o.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Quiz Step 3 — Situação ───── */}
              {quizStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl">
                      <HiCheckCircle className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Situação Atual</h2>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Reservas financeiras disponíveis <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SAVINGS_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setQuiz((p) => ({ ...p, savings: o.value }))}
                          className={`px-3 py-3 rounded-xl border-2 text-xs font-medium text-left transition-all duration-150 ${
                            quiz.savings === o.value
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <p className="text-sm font-semibold text-slate-700">Mais sobre sua situação:</p>
                    {[
                      { field: 'hasJobOffer', label: '💼 Tenho oferta de emprego nos EUA' },
                      { field: 'hasFamily', label: '👨‍👩‍👧 Tenho familiar residente nos EUA' },
                    ].map((item) => (
                      <label
                        key={item.field}
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={quiz[item.field as keyof QuizAnswers] as boolean}
                          onChange={(e) =>
                            setQuiz((p) => ({ ...p, [item.field]: e.target.checked }))
                          }
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (quizStep === 0) setStep('lead');
                    else setQuizStep((s) => s - 1);
                  }}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
                >
                  <HiArrowLeft className="w-4 h-4" /> Voltar
                </button>

                {quizStep < QUIZ_STEPS.length - 1 ? (
                  <button
                    onClick={() => {
                      if (isQuizStepValid()) setQuizStep((s) => s + 1);
                    }}
                    disabled={!isQuizStepValid()}
                    className={`inline-flex items-center gap-2 font-bold text-sm rounded-xl px-6 py-3 transition-all duration-200 ${
                      isQuizStepValid()
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 hover:scale-[1.02]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Próximo
                    <HiArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleQuizFinish}
                    disabled={!isQuizStepValid()}
                    className={`inline-flex items-center gap-2 font-bold text-sm rounded-xl px-6 py-3 transition-all duration-200 ${
                      isQuizStepValid()
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <HiRocketLaunch className="w-4 h-4" />
                    Ver meu resultado
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 3 — ANALYZING
        ════════════════════════════════════════════════════ */}
        {step === 'analyzing' && (
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center px-4 animate-fade-in">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 animate-ping opacity-20" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <HiCpuChip className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
                Analisando seu perfil com IA...
              </h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                Nossa IA está comparando mais de 50 critérios do seu perfil com os requisitos dos principais vistos americanos.
              </p>
              <div className="mt-8 flex justify-center gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400"
                    style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 4 — RESULT + SUBSCRIPTION CTA
        ════════════════════════════════════════════════════ */}
        {step === 'result' && result && (
          <div ref={resultRef} className="animate-fade-in">
            {/* ── Result hero ───────────────────────────────── */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4">
              <div className="mx-auto max-w-2xl text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                  <HiCheckBadge className="w-4 h-4" />
                  Análise Concluída
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                  {lead.fullName.split(' ')[0]}, veja seus resultados!
                </h1>
                <p className="text-slate-400 text-sm max-w-md mx-auto">{result.profileSummary}</p>
              </div>
            </div>

            {/* ── Visa Result Cards ─────────────────────────── */}
            <div className="mx-auto max-w-2xl px-4 py-10">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                {/* Top visa — highlighted */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                        🏆 Melhor visto para você
                      </p>
                      <h2 className="text-2xl font-extrabold text-white">{result.topVisa}</h2>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-4xl font-black text-white">{result.topVisaScore}%</p>
                      <p className="text-blue-200 text-xs font-medium">compatível</p>
                    </div>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${result.topVisaScore}%` }}
                    />
                  </div>
                  <p className="text-blue-100 text-xs mt-3 leading-relaxed">
                    💡 {result.topVisaReason}
                  </p>
                </div>

                {/* 2nd and 3rd visas */}
                <div className="p-6 space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Outras opções compatíveis
                  </p>
                  {[
                    { visa: result.secondVisa, score: result.secondVisaScore, color: 'bg-gradient-to-r from-indigo-400 to-blue-500' },
                    { visa: result.thirdVisa, score: result.thirdVisaScore, color: 'bg-gradient-to-r from-slate-400 to-slate-500' },
                  ].map(({ visa, score, color }) => (
                    <div key={visa}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800 text-sm">{visa}</span>
                          <VisaBadge pct={score} />
                        </div>
                        <span className="font-extrabold text-slate-600 text-sm">{score}%</span>
                      </div>
                      <ProgressBar pct={score} color={color} />
                    </div>
                  ))}

                  {/* Locked section teaser */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="relative">
                      {/* Blurred content */}
                      <div className="space-y-3 blur-sm pointer-events-none select-none">
                        <div className="h-4 bg-slate-200 rounded-full w-3/4" />
                        <div className="h-4 bg-slate-200 rounded-full w-1/2" />
                        <div className="h-4 bg-slate-200 rounded-full w-2/3" />
                      </div>
                      {/* Lock overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                          <HiLockClosed className="w-3.5 h-3.5 text-amber-400" />
                          Detalhes completos com a assinatura
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nudge message */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-amber-500 text-xl shrink-0">⚡</span>
                <p className="text-amber-800 text-sm leading-relaxed">
                  <strong>Próximo passo:</strong> Com a assinatura, você acessa o plano completo
                  para o {result.topVisa}, simulação de entrevista, checklist de documentos e muito mais.
                </p>
              </div>
            </div>

            {/* ── Subscription CTA ──────────────────────────── */}
            <div
              className="py-16 px-4"
              style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1e3a8a 50%, #0F172A 100%)' }}
            >
              <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                    <HiSparkles className="w-3.5 h-3.5" />
                    Continue sua jornada
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                    Desbloqueie seu plano completo<br />
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      rumo ao {result.topVisa}
                    </span>
                  </h2>
                  <p className="text-blue-300 text-sm mt-4 max-w-lg mx-auto">
                    Acesso completo a todas as ferramentas que vão te guiar em cada etapa —
                    do preenchimento do formulário até a entrevista consular.
                  </p>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                  {PLATFORM_FEATURES.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.title}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
                      >
                        <Icon className="w-6 h-6 text-blue-400 mb-3" />
                        <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">{f.description}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing cards */}
                <div className="grid md:grid-cols-2 gap-5 mb-8">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
                    const isPopular = key === 'yearly';
                    return (
                      <div
                        key={key}
                        className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-transform hover:-translate-y-1 duration-200 ${
                          isPopular ? 'ring-2 ring-blue-400' : ''
                        }`}
                      >
                        {isPopular && (
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 text-center flex items-center justify-center gap-1.5">
                            <HiStar className="w-3.5 h-3.5" />
                            Mais Popular — Economize 2 meses
                          </div>
                        )}
                        <div className="p-7">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                          <p className="text-slate-500 text-sm mb-5">{plan.description}</p>
                          <div className="mb-5">
                            <span className="text-4xl font-extrabold text-slate-900">
                              {formatPrice(plan.price)}
                            </span>
                            <span className="text-slate-500 ml-1 text-sm">
                              /{plan.interval === 'month' ? 'mês' : 'ano'}
                            </span>
                          </div>
                          <ul className="space-y-2.5 mb-7">
                            {[
                              'Trilha personalizada de visto',
                              'Simulação de entrevista com IA',
                              'Assistente DS-160',
                              'Análise EB-2 NIW',
                              'Checklists e documentação',
                              'Suporte prioritário',
                            ].map((f) => (
                              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                                <HiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <button
                            id={`subscribe-${key}-btn`}
                            onClick={() => handleSubscribe(key as 'monthly' | 'yearly')}
                            disabled={!!loadingSubscribe}
                            className={`w-full inline-flex items-center justify-center gap-2 font-bold text-sm rounded-xl px-5 py-3.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${
                              isPopular
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {loadingSubscribe === key ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                Assinar agora
                                <HiArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs">
                  <span className="flex items-center gap-2">
                    <HiShieldCheck className="w-4 h-4 text-emerald-400" />
                    Garantia de 7 dias
                  </span>
                  <span className="flex items-center gap-2">
                    <HiLockClosed className="w-4 h-4 text-blue-400" />
                    Pagamento seguro
                  </span>
                  <span className="flex items-center gap-2">
                    <HiCheckBadge className="w-4 h-4 text-amber-400" />
                    Cancele quando quiser
                  </span>
                </div>
              </div>
            </div>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4">
              <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>
                  ⚠️ Não somos advogados de imigração. As informações são orientativas e não
                  substituem aconselhamento jurídico.
                </p>
                <nav className="flex gap-3">
                  <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
                    Privacidade
                  </Link>
                  <span>•</span>
                  <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
                    Termos
                  </Link>
                </nav>
              </div>
            </footer>
          </div>
        )}
      </main>
    </>
  );
}
