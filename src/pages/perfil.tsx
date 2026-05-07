import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { updateUserProfile } from '../lib/auth';
import { getQuestionnaire, QuestionnaireData } from '../lib/visa-service';
import { getUserTrainingStats, TrainingStats } from '../lib/training-history';
import {
  HiUser, HiMail, HiPencil, HiCheckCircle, HiAcademicCap,
  HiGlobeAlt, HiBriefcase, HiCalendar,
} from 'react-icons/hi';
import {
  HiArrowRight, HiSparkles, HiTrophy, HiMiniArrowTrendingUp,
  HiMiniClock, HiCheckBadge, HiXMark,
} from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';

const GOAL_LABELS: Record<string, string> = {
  work: 'Trabalho', study: 'Estudo', investment: 'Investimento',
  family: 'Reunificação Familiar', other: 'Outro',
};
const EDUCATION_LABELS: Record<string, string> = {
  'high-school': 'Ensino Médio', bachelor: 'Bacharelado',
  master: 'Mestrado', phd: 'Doutorado',
};
const ENGLISH_LABELS: Record<string, string> = {
  none: 'Nenhum', basic: 'Básico', intermediate: 'Intermediário',
  advanced: 'Avançado', fluent: 'Fluente',
};

export default function Perfil() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const { planTier, hasActiveSubscription } = useSubscription();
  const router = useRouter();

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [questData, setQuestData] = useState<QuestionnaireData | null>(null);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getQuestionnaire(user.uid),
      getUserTrainingStats(user.uid),
    ]).then(([quest, stats]) => {
      setQuestData(quest);
      setTrainingStats(stats);
      setDataLoading(false);
    });
  }, [user]);

  const displayName = userProfile?.displayName || userProfile?.fullName || userProfile?.name || user?.displayName || 'Usuário';
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  const daysSinceJoined = userProfile?.createdAt
    ? Math.floor((new Date().getTime() - new Date(userProfile.createdAt.toDate()).getTime()) / (1000 * 3600 * 24))
    : 0;

  const currentVisa = userProfile?.recommendedVisa || userProfile?.selectedVisa;

  const calculateProgress = () => {
    let p = 0;
    if (userProfile?.completedQuiz) p += 30;
    if (trainingStats && trainingStats.totalSessions > 0) p += 25;
    if (userProfile?.recommendedVisa) p += 25;
    if (trainingStats && trainingStats.totalSessions >= 3) p += 20;
    return Math.min(p, 100);
  };

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    try {
      await updateUserProfile(user.uid, { displayName: newName.trim(), name: newName.trim() });
      await refreshUserProfile();
      setNameSuccess(true);
      setEditingName(false);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch {
      alert('Erro ao salvar nome. Tente novamente.');
    } finally {
      setSavingName(false);
    }
  };

  const planInfo = {
    free: { label: 'Gratuito', emoji: '🆓', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    pro: { label: 'Pro', emoji: '⭐', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    expert: { label: 'Expert', emoji: '🚀', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  }[planTier];

  if (loading || !user) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const progress = calculateProgress();

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F8FAFC 50%, #EEF2FF 100%)' }}>
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Header card ───────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 80% 20%, #6366F1, transparent 55%), radial-gradient(circle at 20% 80%, #3B82F6, transparent 50%)'
            }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-3xl font-black shadow-lg shrink-0">
                {initials}
              </div>

              {/* Name + info */}
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                      className="bg-white/15 border border-white/30 rounded-xl px-4 py-2 text-white placeholder:text-white/50 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-white/30 w-full max-w-xs"
                      placeholder={displayName}
                    />
                    <button onClick={handleSaveName} disabled={savingName} className="p-2 bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-60">
                      <FiCheckCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditingName(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                      <HiXMark className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold truncate">{displayName}</h1>
                    <button
                      onClick={() => { setNewName(displayName); setEditingName(true); }}
                      className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors shrink-0"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    {nameSuccess && <span className="text-emerald-400 text-sm font-medium flex items-center gap-1"><FiCheckCircle className="w-3.5 h-3.5" /> Salvo!</span>}
                  </div>
                )}

                <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
                  <HiMail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${planInfo.bg} ${planInfo.color}`}>
                    {planInfo.emoji} {planInfo.label}
                  </span>
                  {currentVisa && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20">
                      <HiCheckBadge className="w-4 h-4 text-emerald-400" /> {currentVisa}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-200 font-medium">Progresso da jornada</span>
                <span className="text-sm font-bold text-white">{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Stats row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Dias na plataforma', value: daysSinceJoined, icon: <HiMiniClock className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', text: 'text-blue-600' },
              { label: 'Treinos realizados', value: trainingStats?.totalSessions || userProfile?.interviewsPracticed || 0, icon: <HiTrophy className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500', text: 'text-emerald-600' },
              { label: 'Progresso', value: `${progress}%`, icon: <HiMiniArrowTrendingUp className="w-5 h-5" />, color: 'from-violet-500 to-indigo-500', text: 'text-violet-600' },
              { label: 'Treinos completos', value: trainingStats?.completedSessions || 0, icon: <HiCheckCircle className="w-5 h-5" />, color: 'from-amber-400 to-orange-500', text: 'text-amber-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-3 shadow-sm`}>
                  {stat.icon}
                </div>
                <p className={`text-2xl font-bold ${stat.text} leading-none mb-1`}>{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Questionnaire summary ──────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <HiGlobeAlt className="w-5 h-5 text-blue-500" /> Perfil de Imigração
                  </h2>
                  <Link href="/questionario">
                    <span className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                      {userProfile?.completedQuiz ? 'Refazer' : 'Preencher'} <HiArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>

                {!userProfile?.completedQuiz ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <HiGlobeAlt className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm mb-4">Complete o questionário para descobrir seu visto ideal</p>
                    <Link href="/questionario">
                      <Button className="gap-2">
                        Fazer Questionário <HiArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Recommended visa highlight */}
                    {currentVisa && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shrink-0">
                          <HiSparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Visto Recomendado pela IA</p>
                          <p className="text-xl font-black text-blue-900">{currentVisa}</p>
                        </div>
                      </div>
                    )}

                    {/* Profile data grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Profissão', value: questData?.occupation || userProfile?.occupation, icon: <HiBriefcase className="w-4 h-4" /> },
                        { label: 'Educação', value: questData?.education ? EDUCATION_LABELS[questData.education] : null, icon: <HiAcademicCap className="w-4 h-4" /> },
                        { label: 'Inglês', value: questData?.englishLevel ? ENGLISH_LABELS[questData.englishLevel] : null, icon: <HiGlobeAlt className="w-4 h-4" /> },
                        { label: 'Objetivo', value: questData?.immigrationGoal ? GOAL_LABELS[questData.immigrationGoal] : (userProfile?.immigrationGoal ? GOAL_LABELS[userProfile.immigrationGoal] : null), icon: <HiSparkles className="w-4 h-4" /> },
                        { label: 'Prazo', value: questData?.timeframe?.replace('immediate', 'Imediato').replace('6-months', '6 meses').replace('1-year', '1 ano').replace('2-years', '2+ anos'), icon: <HiCalendar className="w-4 h-4" /> },
                        { label: 'Experiência', value: questData?.yearsOfExperience ? `${questData.yearsOfExperience} anos` : null, icon: <HiTrophy className="w-4 h-4" /> },
                      ].filter(item => item.value).map((item) => (
                        <div key={item.label} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
                          <div className="text-slate-400 mt-0.5 shrink-0">{item.icon}</div>
                          <div>
                            <p className="text-xs text-slate-400 font-medium mb-0.5">{item.label}</p>
                            <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Training summary */}
              {trainingStats && trainingStats.totalSessions > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <HiAcademicCap className="w-5 h-5 text-emerald-500" /> Histórico de Treinos
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Total', value: trainingStats.totalSessions, color: 'text-blue-600' },
                      { label: 'Completos', value: trainingStats.completedSessions, color: 'text-emerald-600' },
                      { label: 'Mensagens', value: trainingStats.totalMessages, color: 'text-violet-600' },
                      { label: 'Visto foco', value: trainingStats.favoriteVisaType || '—', color: 'text-amber-600' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 bg-slate-50 rounded-xl">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/treinamento">
                      <Button variant="outline" className="w-full gap-2" size="sm">
                        Novo Treino <HiArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ───────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Account info */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HiUser className="w-4 h-4 text-slate-400" /> Conta
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Email</p>
                    <p className="text-sm font-medium text-slate-700 break-all">{user.email}</p>
                  </div>
                  {userProfile?.createdAt && (
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">Membro desde</p>
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(userProfile.createdAt.toDate()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Plano</p>
                    <p className={`text-sm font-bold ${planInfo.color}`}>{planInfo.emoji} {planInfo.label}</p>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Link href="/dashboard">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <HiMiniArrowTrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Dashboard</span>
                      <HiArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500" />
                    </div>
                  </Link>
                  <Link href="/gerenciar-assinatura">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                        <HiSparkles className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Gerenciar Assinatura</span>
                      <HiArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500" />
                    </div>
                  </Link>
                  {planTier === 'free' && (
                    <Link href="/subscription">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <HiSparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-blue-700">Fazer Upgrade</span>
                        <HiArrowRight className="w-3.5 h-3.5 text-blue-400 ml-auto" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
