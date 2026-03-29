import { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import {
  saveQuestionnaire,
  analyzeProfile,
  QuestionnaireData,
} from '../lib/visa-service';

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
  { value: 'immediate', label: 'Imediato' },
  { value: '6-months', label: '6 meses' },
  { value: '1-year', label: '1 ano' },
  { value: '2-years', label: '2 anos ou mais' },
];

export default function Questionario() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<QuestionnaireData>({
    fullName: '',
    age: 0,
    nationality: 'Brasil',
    education: 'bachelor',
    fieldOfStudy: '',
    occupation: '',
    yearsOfExperience: 0,
    currentSalary: 0,
    englishLevel: 'intermediate',
    otherLanguages: [],
    destinationCountries: ['Estados Unidos'],
    immigrationGoal: 'work',
    timeframe: '1-year',
    savings: 0,
    willingToInvest: 0,
    hasFamily: false,
    hasJobOffer: false,
    hasCriminalRecord: false,
  });

  const update = (field: keyof QuestionnaireData, value: unknown) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.fullName || !formData.fieldOfStudy || !formData.occupation) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await saveQuestionnaire(user.uid, formData);
      await refreshUserProfile();
      await analyzeProfile(user.uid, formData);
      setSuccess(true);
      setTimeout(() => router.push('/visa-path'), 1500);
    } catch (err: unknown) {
      console.error(err);
      setError('Erro ao processar questionário. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Progresso visual
  const steps = [
    { label: 'Pessoal', icon: '👤' },
    { label: 'Formação', icon: '🎓' },
    { label: 'Objetivos', icon: '🎯' },
    { label: 'Financeiro', icon: '💰' },
  ];

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition';
  const selectClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition';
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1';
  const fieldClass = 'mb-5';

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
          <div className="mx-auto max-w-2xl">

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Questionário de Imigração</h1>
              <p className="text-gray-500 mt-2">Vamos encontrar a melhor trilha para você</p>
            </div>

            {/* Progress Bar Steps */}
            <div className="flex items-center justify-center mb-8 gap-2">
              {steps.map((s, idx) => {
                const num = idx + 1;
                const isActive = num === step;
                const isDone = num < step;
                return (
                  <div key={num} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                          isDone
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : isActive
                            ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-200'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {isDone ? '✓' : s.icon}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-10 h-0.5 mx-1 mb-4 transition-colors ${num < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">

              {/* Etapa 1: Pessoal */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    👤 Informações Pessoais
                  </h2>
                  <div className={fieldClass}>
                    <label className={labelClass}>Nome Completo *</label>
                    <input className={inputClass} value={formData.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Seu nome completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className={labelClass}>Idade *</label>
                      <input className={inputClass} type="number" value={formData.age || ''} onChange={e => update('age', parseInt(e.target.value) || 0)} placeholder="Sua idade" />
                    </div>
                    <div>
                      <label className={labelClass}>Nacionalidade *</label>
                      <input className={inputClass} value={formData.nationality} onChange={e => update('nationality', e.target.value)} placeholder="Ex: Brasil" />
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 2: Formação e Profissão */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    🎓 Formação e Profissão
                  </h2>
                  <div className={fieldClass}>
                    <label className={labelClass}>Nível de Educação *</label>
                    <select className={selectClass} value={formData.education} onChange={e => update('education', e.target.value)}>
                      {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className={fieldClass}>
                    <label className={labelClass}>Área de Estudo *</label>
                    <input className={inputClass} value={formData.fieldOfStudy} onChange={e => update('fieldOfStudy', e.target.value)} placeholder="Ex: Engenharia, Medicina, TI" />
                  </div>
                  <div className={fieldClass}>
                    <label className={labelClass}>Profissão Atual *</label>
                    <input className={inputClass} value={formData.occupation} onChange={e => update('occupation', e.target.value)} placeholder="Ex: Desenvolvedor, Médico, Engenheiro" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Anos de Experiência</label>
                      <input className={inputClass} type="number" value={formData.yearsOfExperience || ''} onChange={e => update('yearsOfExperience', parseInt(e.target.value) || 0)} placeholder="Anos" />
                    </div>
                    <div>
                      <label className={labelClass}>Salário Atual (R$)</label>
                      <input className={inputClass} type="number" value={formData.currentSalary || ''} onChange={e => update('currentSalary', parseInt(e.target.value) || 0)} placeholder="Mensal" />
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 3: Idiomas e Objetivos */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    🎯 Idiomas e Objetivos
                  </h2>
                  <div className={fieldClass}>
                    <label className={labelClass}>Nível de Inglês *</label>
                    <select className={selectClass} value={formData.englishLevel} onChange={e => update('englishLevel', e.target.value)}>
                      {ENGLISH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className={fieldClass}>
                    <label className={labelClass}>Objetivo de Imigração *</label>
                    <select className={selectClass} value={formData.immigrationGoal} onChange={e => update('immigrationGoal', e.target.value)}>
                      {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className={fieldClass}>
                    <label className={labelClass}>Prazo Desejado</label>
                    <select className={selectClass} value={formData.timeframe} onChange={e => update('timeframe', e.target.value)}>
                      {TIMEFRAME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Etapa 4: Financeiro e Perguntas */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    💰 Situação Financeira
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className={labelClass}>Economias Disponíveis (R$)</label>
                      <input className={inputClass} type="number" value={formData.savings || ''} onChange={e => update('savings', parseInt(e.target.value) || 0)} placeholder="Total de economias" />
                    </div>
                    <div>
                      <label className={labelClass}>Disposto a Investir (R$)</label>
                      <input className={inputClass} type="number" value={formData.willingToInvest || ''} onChange={e => update('willingToInvest', parseInt(e.target.value) || 0)} placeholder="Valor máximo" />
                    </div>
                  </div>

                  <div className="border-t pt-5 mt-2">
                    <p className="font-semibold text-gray-700 mb-4">Perguntas Adicionais</p>
                    {[
                      { field: 'hasFamily', label: 'Tem família no país de destino' },
                      { field: 'hasJobOffer', label: 'Tem oferta de emprego nos EUA' },
                      { field: 'hasCriminalRecord', label: 'Possui antecedentes criminais' },
                    ].map(item => (
                      <label
                        key={item.field}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer mb-3 transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData[item.field as keyof QuestionnaireData] as boolean}
                          onChange={e => update(item.field as keyof QuestionnaireData, e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {error && (
                    <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
                      ⚠️ {error}
                    </div>
                  )}

                  {success && (
                    <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm">
                      ✅ Análise concluída! Redirecionando para sua trilha...
                    </div>
                  )}

                  {loading && (
                    <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-700 text-sm flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                      Analisando seu perfil com IA... Isso pode levar alguns instantes.
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1 || loading}
                  className={step === 1 ? 'invisible' : ''}
                >
                  ← Voltar
                </Button>

                {step < 4 ? (
                  <Button onClick={nextStep}>
                    Próximo →
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || success}
                    className="min-w-[160px]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Analisando...
                      </span>
                    ) : '🚀 Analisar Perfil'}
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
