import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import {
  saveQuestionnaire,
  analyzeProfile,
  getQuestionnaire,
  QuestionnaireData,
} from '../lib/visa-service';
import { HiUser, HiAcademicCap, HiGlobeAlt, HiCurrencyDollar } from 'react-icons/hi';
import {
  HiArrowRight,
  HiArrowLeft,
  HiCheckBadge,
  HiRocketLaunch,
  HiSparkles,
  HiArrowPath,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';

const EDUCATION_OPTIONS = [
  { value: 'high-school', label: 'Ensino Médio' },
  { value: 'bachelor', label: 'Bacharelado' },
  { value: 'master', label: 'Mestrado' },
  { value: 'phd', label: 'Doutorado' },
];
const ENGLISH_OPTIONS = [
  { value: 'none', label: 'Nenhum' },
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'fluent', label: 'Fluente' },
];
const GOAL_OPTIONS = [
  { value: 'work', label: 'Trabalho' },
  { value: 'study', label: 'Estudo' },
  { value: 'investment', label: 'Investimento' },
  { value: 'family', label: 'Reunificação Familiar' },
  { value: 'other', label: 'Outro' },
];
const TIMEFRAME_OPTIONS = [
  { value: 'immediate', label: 'Imediato (< 6 meses)' },
  { value: '6-months', label: '6 meses' },
  { value: '1-year', label: '1 ano' },
  { value: '2-years', label: '2 anos ou mais' },
];

const EDUCATION_LABELS: Record<string, string> = {
  'high-school': 'Ensino Médio',
  bachelor: 'Bacharelado',
  master: 'Mestrado',
  phd: 'Doutorado',
};
const ENGLISH_LABELS: Record<string, string> = {
  none: 'Nenhum',
  basic: 'Básico',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  fluent: 'Fluente',
};
const GOAL_LABELS: Record<string, string> = {
  work: 'Trabalho',
  study: 'Estudo',
  investment: 'Investimento',
  family: 'Reunificação Familiar',
  other: 'Outro',
};
const TIMEFRAME_LABELS: Record<string, string> = {
  immediate: 'Imediato (< 6 meses)',
  '6-months': '6 meses',
  '1-year': '1 ano',
  '2-years': '2 anos ou mais',
};

const steps = [
  { label: 'Pessoal', icon: <HiUser className="w-4 h-4" /> },
  { label: 'Formação', icon: <HiAcademicCap className="w-4 h-4" /> },
  { label: 'Objetivos', icon: <HiGlobeAlt className="w-4 h-4" /> },
  { label: 'Financeiro', icon: <HiCurrencyDollar className="w-4 h-4" /> },
];

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 placeholder:text-slate-400';
const selectCls = inputCls + ' appearance-none cursor-pointer';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';
const fieldCls = 'mb-5';

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
  userProfile,
  savedData,
  onRedo,
}: {
  userProfile: any;
  savedData: QuestionnaireData | null;
  onRedo: () => void;
}) {
  const router = useRouter();
  const [confirmRedo, setConfirmRedo] = useState(false);

  const visa = userProfile?.recommendedVisa || userProfile?.selectedVisa || '—';
  const name = savedData?.fullName || userProfile?.fullName || userProfile?.displayName || userProfile?.name || '';
  const education = savedData?.education ? EDUCATION_LABELS[savedData.education] : '—';
  const english = savedData?.englishLevel ? ENGLISH_LABELS[savedData.englishLevel] : '—';
  const goal = savedData?.immigrationGoal ? GOAL_LABELS[savedData.immigrationGoal] : (userProfile?.immigrationGoal ? GOAL_LABELS[userProfile.immigrationGoal] : '—');
  const timeframe = savedData?.timeframe ? TIMEFRAME_LABELS[savedData.timeframe] : '—';
  const occupation = savedData?.occupation || userProfile?.occupation || '—';

  return (
    <div className="py-10 px-4 min-h-[calc(100vh-4rem)]" style={{ background: 'linear-gradient(135deg, #F0FFF4 0%, #F8FAFC 50%, #EEF2FF 100%)' }}>
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
            <FiCheckCircle className="w-4 h-4" /> Questionário concluído
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Seu Perfil de Imigração</h1>
          <p className="text-slate-500 mt-2 text-sm">
            {name ? `Olá, ${name.split(' ')[0]}! ` : ''}Veja abaixo a análise do seu perfil.
          </p>
        </div>

        {/* Visa recommendation card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-8 text-white shadow-xl mb-6 animate-scale-in">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 70% 30%, #6366F1, transparent 60%)'
          }} />
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <HiSparkles className="w-3.5 h-3.5" /> Visto Recomendado pela IA
              </p>
              <h2 className="text-5xl font-black mb-2 tracking-tight">{visa}</h2>
              <p className="text-blue-200 text-sm">Baseado nas suas respostas e análise de perfil</p>
            </div>
            <div className="shrink-0 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <HiCheckBadge className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <div className="relative mt-6">
            <Button
              onClick={() => router.push('/visa-path')}
              className="gap-2 bg-white text-slate-900 hover:bg-blue-50 font-semibold"
            >
              Ver minha trilha <HiArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Profile summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <HiUser className="w-4 h-4 text-blue-500" /> Resumo do Seu Perfil
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Profissão', value: occupation },
              { label: 'Educação', value: education },
              { label: 'Inglês', value: english },
              { label: 'Objetivo', value: goal },
              { label: 'Prazo', value: timeframe },
              { label: 'Experiência', value: savedData?.yearsOfExperience ? `${savedData.yearsOfExperience} anos` : '—' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 font-medium mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
          {savedData?.hasJobOffer && (
            <div className="mt-3 flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 text-sm">
              <FiCheckCircle className="w-4 h-4 shrink-0" /> Possui oferta de emprego nos EUA
            </div>
          )}
          {savedData?.hasFamily && (
            <div className="mt-3 flex items-center gap-2 text-blue-700 bg-blue-50 rounded-xl px-4 py-3 text-sm">
              <FiCheckCircle className="w-4 h-4 shrink-0" /> Tem família no país de destino
            </div>
          )}
        </div>

        {/* Redo section */}
        {!confirmRedo ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Suas respostas mudaram?</p>
              <p className="text-xs text-slate-400 mt-0.5">Você pode refazer o questionário a qualquer momento.</p>
            </div>
            <button
              onClick={() => setConfirmRedo(true)}
              className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all"
            >
              <HiArrowPath className="w-4 h-4" /> Refazer
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <HiExclamationTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm font-semibold text-amber-800">Tem certeza?</p>
            </div>
            <p className="text-xs text-amber-700 mb-4 leading-relaxed">
              Ao refazer, sua análise atual será substituída ao salvar o novo questionário.
            </p>
            <div className="flex gap-3">
              <Button onClick={onRedo} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white border-0">
                <HiArrowPath className="w-4 h-4" /> Sim, refazer
              </Button>
              <Button variant="ghost" onClick={() => setConfirmRedo(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Questionario() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [savedData, setSavedData] = useState<QuestionnaireData | null>(null);
  const [showForm, setShowForm] = useState(false); // true = mostra form | false = mostra resultado (se já respondeu)
  const [justCompleted, setJustCompleted] = useState(false); // acabou de preencher agora

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<QuestionnaireData>({
    fullName: '', age: 0, nationality: 'Brasil', education: 'bachelor',
    fieldOfStudy: '', occupation: '', yearsOfExperience: 0, currentSalary: 0,
    englishLevel: 'intermediate', otherLanguages: [],
    destinationCountries: ['Estados Unidos'], immigrationGoal: 'work',
    timeframe: '1-year', savings: 0, willingToInvest: 0,
    hasFamily: false, hasJobOffer: false, hasCriminalRecord: false,
  });

  const update = (field: keyof QuestionnaireData, value: unknown) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // Check if user already completed the questionnaire
  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }

    const alreadyDone = userProfile?.completedQuiz || userProfile?.hasCompletedQuestionnaire;

    if (alreadyDone) {
      // Fetch detailed questionnaire data from Firestore
      getQuestionnaire(user.uid).then((data) => {
        setSavedData(data);
        setShowForm(false);
        setPageLoading(false);
      });
    } else {
      setShowForm(true);
      setPageLoading(false);
    }
  }, [loading, user, userProfile, router]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.fullName || !formData.fieldOfStudy || !formData.occupation) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await saveQuestionnaire(user.uid, formData);
      await refreshUserProfile();
      await analyzeProfile(user.uid, formData);
      setSavedData(formData);
      setJustCompleted(true);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao processar questionário. Verifique sua conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedo = () => {
    setShowForm(true);
    setStep(1);
    setError('');
    setJustCompleted(false);
    setFormData({
      fullName: '', age: 0, nationality: 'Brasil', education: 'bachelor',
      fieldOfStudy: '', occupation: '', yearsOfExperience: 0, currentSalary: 0,
      englishLevel: 'intermediate', otherLanguages: [],
      destinationCountries: ['Estados Unidos'], immigrationGoal: 'work',
      timeframe: '1-year', savings: 0, willingToInvest: 0,
      hasFamily: false, hasJobOffer: false, hasCriminalRecord: false,
    });
  };

  // ── Loading spinner ──────────────────────────────────────────────────────────
  if (pageLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  // ── Already completed → show result ─────────────────────────────────────────
  if (!showForm) {
    return (
      <SubscriptionGuard>
        <Layout>
          <ResultScreen
            userProfile={userProfile}
            savedData={savedData}
            onRedo={handleRedo}
          />
        </Layout>
      </SubscriptionGuard>
    );
  }

  // ── Multi-step form ──────────────────────────────────────────────────────────
  return (
    <SubscriptionGuard>
      <Layout>
        <div className="py-10 px-4 min-h-[calc(100vh-4rem)]" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F8FAFC 50%, #F5F0FF 100%)' }}>
          <div className="mx-auto max-w-2xl">

            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">Passo a passo</p>
              <h1 className="text-3xl font-bold text-slate-900">Questionário de Imigração</h1>
              <p className="text-slate-500 mt-2 text-sm">Vamos encontrar a melhor trilha para o seu perfil</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center mb-8 gap-0 animate-fade-in">
              {steps.map((s, idx) => {
                const num = idx + 1;
                const isActive = num === step;
                const isDone = num < step;
                return (
                  <div key={num} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isDone ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                        isActive ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300 scale-110' :
                        'bg-white text-slate-400 border-2 border-slate-200'
                      }`}>
                        {isDone ? <FiCheckCircle className="w-5 h-5" /> : s.icon}
                      </div>
                      <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-blue-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-1 mb-4 transition-colors duration-500 ${num < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 animate-scale-in">

              {/* Step 1 — Pessoal */}
              {step === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
                      <HiUser className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Informações Pessoais</h2>
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>Nome Completo <span className="text-red-500">*</span></label>
                    <input className={inputCls} value={formData.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Seu nome completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className={labelCls}>Idade <span className="text-red-500">*</span></label>
                      <input className={inputCls} type="number" value={formData.age || ''} onChange={e => update('age', parseInt(e.target.value) || 0)} placeholder="Ex: 30" />
                    </div>
                    <div>
                      <label className={labelCls}>Nacionalidade <span className="text-red-500">*</span></label>
                      <input className={inputCls} value={formData.nationality} onChange={e => update('nationality', e.target.value)} placeholder="Ex: Brasil" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Formação */}
              {step === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl">
                      <HiAcademicCap className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Formação e Profissão</h2>
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>Nível de Educação <span className="text-red-500">*</span></label>
                    <select className={selectCls} value={formData.education} onChange={e => update('education', e.target.value)}>
                      {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>Área de Estudo <span className="text-red-500">*</span></label>
                    <input className={inputCls} value={formData.fieldOfStudy} onChange={e => update('fieldOfStudy', e.target.value)} placeholder="Ex: Engenharia, Medicina, TI" />
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>Profissão Atual <span className="text-red-500">*</span></label>
                    <input className={inputCls} value={formData.occupation} onChange={e => update('occupation', e.target.value)} placeholder="Ex: Desenvolvedor, Médico" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Anos de Experiência</label>
                      <input className={inputCls} type="number" value={formData.yearsOfExperience || ''} onChange={e => update('yearsOfExperience', parseInt(e.target.value) || 0)} placeholder="Anos" />
                    </div>
                    <div>
                      <label className={labelCls}>Salário (R$/mês)</label>
                      <input className={inputCls} type="number" value={formData.currentSalary || ''} onChange={e => update('currentSalary', parseInt(e.target.value) || 0)} placeholder="Mensal" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Objetivos */}
              {step === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl">
                      <HiGlobeAlt className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Idiomas e Objetivos</h2>
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>Nível de Inglês <span className="text-red-500">*</span></label>
                    <select className={selectCls} value={formData.englishLevel} onChange={e => update('englishLevel', e.target.value)}>
                      {ENGLISH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>Objetivo de Imigração <span className="text-red-500">*</span></label>
                    <select className={selectCls} value={formData.immigrationGoal} onChange={e => update('immigrationGoal', e.target.value)}>
                      {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>Prazo Desejado</label>
                    <select className={selectCls} value={formData.timeframe} onChange={e => update('timeframe', e.target.value)}>
                      {TIMEFRAME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 4 — Financeiro */}
              {step === 4 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl">
                      <HiCurrencyDollar className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Situação Financeira</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className={labelCls}>Economias Disponíveis (R$)</label>
                      <input className={inputCls} type="number" value={formData.savings || ''} onChange={e => update('savings', parseInt(e.target.value) || 0)} placeholder="Total" />
                    </div>
                    <div>
                      <label className={labelCls}>Disposto a Investir (R$)</label>
                      <input className={inputCls} type="number" value={formData.willingToInvest || ''} onChange={e => update('willingToInvest', parseInt(e.target.value) || 0)} placeholder="Máximo" />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Perguntas Adicionais</p>
                    <div className="space-y-3">
                      {[
                        { field: 'hasFamily', label: 'Tem família no país de destino' },
                        { field: 'hasJobOffer', label: 'Tem oferta de emprego nos EUA' },
                        { field: 'hasCriminalRecord', label: 'Possui antecedentes criminais' },
                      ].map(item => (
                        <label key={item.field} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200">
                          <input
                            type="checkbox"
                            checked={formData[item.field as keyof QuestionnaireData] as boolean}
                            onChange={e => update(item.field as keyof QuestionnaireData, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                          />
                          <span className="text-sm text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                      {error}
                    </div>
                  )}
                  {submitting && (
                    <div className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      Analisando seu perfil com IA... Isso pode levar alguns instantes.
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={() => setStep(s => Math.max(s - 1, 1))}
                  disabled={step === 1 || submitting}
                  className={`gap-2 ${step === 1 ? 'invisible' : ''}`}
                >
                  <HiArrowLeft className="w-4 h-4" /> Voltar
                </Button>

                {step < 4 ? (
                  <Button onClick={() => setStep(s => Math.min(s + 1, 4))} className="gap-2">
                    Próximo <HiArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    isLoading={submitting}
                    className="gap-2 min-w-[160px]"
                  >
                    {!submitting && <HiRocketLaunch className="w-4 h-4" />}
                    {submitting ? 'Analisando...' : 'Analisar Perfil'}
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </Layout>
    </SubscriptionGuard>
  );
}
