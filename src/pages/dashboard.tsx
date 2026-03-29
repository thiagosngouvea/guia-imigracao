import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import {
  HiMap,
  HiClipboardList,
  HiQuestionMarkCircle,
  HiAcademicCap,
  HiDocumentText,
  HiCheckCircle,
} from 'react-icons/hi';
import {
  HiMapPin,
  HiMicrophone,
  HiStar,
  HiTrophy,
  HiSparkles,
  HiListBullet,
  HiArrowRight,
  HiCalendarDays,
  HiGlobeAmericas,
  HiMiniArrowTrendingUp,
  HiMiniClock,
} from 'react-icons/hi2';
import {
  MdOutlineVerified,
  MdSupportAgent,
} from 'react-icons/md';
import {
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import {
  getUserTrainingSessions,
  getUserTrainingStats,
  TrainingSession,
  TrainingStats
} from '../lib/training-history';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple';
  completed: boolean;
}

interface RecentActivity {
  id: number;
  type: 'quiz' | 'training' | 'info';
  title: string;
  description: string;
  date: string;
}

interface UpcomingTask {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

export default function Dashboard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [loadingTrainingData, setLoadingTrainingData] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const loadTrainingData = async () => {
      if (!user) return;
      setLoadingTrainingData(true);
      try {
        const [sessions, stats] = await Promise.all([
          getUserTrainingSessions(user.uid, 5),
          getUserTrainingStats(user.uid)
        ]);
        setTrainingSessions(sessions);
        setTrainingStats(stats);
      } catch (error) {
        console.error('Erro ao carregar dados de treinamento:', error);
      } finally {
        setLoadingTrainingData(false);
      }
    };
    if (user && isClient) loadTrainingData();
  }, [user, isClient]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const daysSinceJoined = userProfile?.createdAt
    ? Math.floor((new Date().getTime() - new Date(userProfile.createdAt.toDate()).getTime()) / (1000 * 3600 * 24))
    : 0;

  const calculateProgress = () => {
    let progress = 0;
    if (userProfile?.completedQuiz) progress += 30;
    if (userProfile?.interviewsPracticed && userProfile.interviewsPracticed > 0) progress += 25;
    if (userProfile?.recommendedVisa) progress += 25;
    if (userProfile?.interviewsPracticed && userProfile.interviewsPracticed >= 3) progress += 20;
    return Math.min(progress, 100);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'visa-path',
      title: 'Escolher Trilha',
      description: 'Veja os vistos e escolha sua trilha de imigração',
      icon: <HiMap className="w-5 h-5" />,
      href: '/visa-path',
      color: 'blue',
      completed: !!userProfile?.selectedVisaPath,
    },
    {
      id: 'minha-trilha',
      title: 'Minha Trilha',
      description: 'Acompanhe o progresso da sua trilha de visto',
      icon: <HiListBullet className="w-5 h-5" />,
      href: '/minha-trilha',
      color: 'green',
      completed: false,
    },
    {
      id: 'questionnaire',
      title: 'Questionário de Visto',
      description: 'Descubra qual visto é ideal para você',
      icon: <HiQuestionMarkCircle className="w-5 h-5" />,
      href: '/questionario',
      color: 'purple',
      completed: userProfile?.hasCompletedQuestionnaire || userProfile?.completedQuiz || false,
    },
    {
      id: 'training',
      title: 'Treino com IA',
      description: 'Pratique entrevistas de visto com inteligência artificial',
      icon: <HiAcademicCap className="w-5 h-5" />,
      href: '/treinamento',
      color: 'purple',
      completed: (userProfile?.interviewsPracticed || 0) > 0,
    },
    {
      id: 'ds160-helper',
      title: 'Assistente DS-160',
      description: 'Auxílio para preencher o formulário DS-160',
      icon: <HiDocumentText className="w-5 h-5" />,
      href: '/ds160',
      color: 'blue',
      completed: false,
    },
  ];

  const generateRecentActivities = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    if (userProfile?.completedQuiz && userProfile?.recommendedVisa) {
      activities.push({
        id: 1, type: 'quiz',
        title: 'Questionário Completado',
        description: `Visto recomendado: ${userProfile.recommendedVisa}`,
        date: userProfile.lastLoginAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    }
    if (userProfile?.interviewsPracticed && userProfile.interviewsPracticed > 0) {
      activities.push({
        id: 2, type: 'training',
        title: 'Treino de Entrevista',
        description: `${userProfile.interviewsPracticed} sessões de treino completadas`,
        date: userProfile.lastLoginAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    }
    if (activities.length === 0) {
      activities.push({
        id: 3, type: 'info',
        title: 'Bem-vindo à MoveEasy!',
        description: 'Comece preenchendo o questionário para descobrir seu visto ideal',
        date: userProfile?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    }
    return activities;
  };

  const generateUpcomingTasks = (): UpcomingTask[] => {
    const tasks: UpcomingTask[] = [];
    if (!userProfile?.completedQuiz) {
      tasks.push({ id: 1, title: 'Complete o questionário', description: 'Descubra qual visto é ideal para seu perfil', priority: 'high', action: 'Começar Agora' });
    } else if ((userProfile?.interviewsPracticed || 0) === 0) {
      tasks.push({ id: 2, title: 'Comece o treinamento', description: 'Pratique para a entrevista de visto com IA', priority: 'high', action: 'Iniciar Treinamento' });
    }
    if ((userProfile?.interviewsPracticed || 0) > 0 && (userProfile?.interviewsPracticed || 0) < 3) {
      tasks.push({ id: 3, title: 'Continue praticando', description: 'Recomendamos pelo menos 3 sessões de treino', priority: 'high', action: 'Continuar Treino' });
    }
    if (userProfile?.recommendedVisa) {
      tasks.push({ id: 4, title: 'Revisar documentos', description: `Lista para o visto ${userProfile.recommendedVisa}`, priority: 'medium', action: 'Ver Lista' });
    }
    if (tasks.length < 3) {
      tasks.push({ id: 5, title: 'Agendar consulta', description: 'Fale com um advogado de imigração', priority: 'low', action: 'Agendar' });
    }
    return tasks.slice(0, 3);
  };

  const getCurrentVisa = () => userProfile?.selectedVisa || userProfile?.recommendedVisa;
  const hasCustomVisa = () => userProfile?.selectedVisa && userProfile.selectedVisa !== userProfile.recommendedVisa;
  const getVisaId = (visaName: string) => {
    const map: Record<string, string> = { 'B1/B2': 'b1b2', 'F1': 'f1', 'H1B': 'h1b', 'EB5': 'eb5', 'O1': 'o1', 'EB2 NIW': 'eb2-niw' };
    return map[visaName] || visaName.toLowerCase();
  };

  if (loading || !isClient) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Carregando seu dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const recentActivities = generateRecentActivities();
  const upcomingTasks = generateUpcomingTasks();
  const progress = calculateProgress();
  const currentVisa = getCurrentVisa();
  const displayName = userProfile?.displayName || userProfile?.fullName || userProfile?.name || user.displayName || 'Usuário';

  const colorMap = {
    blue:   { icon: 'from-blue-500 to-blue-600',   border: 'border-blue-500',   text: 'text-blue-600',   bg: 'bg-blue-50' },
    green:  { icon: 'from-emerald-500 to-green-600', border: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    purple: { icon: 'from-violet-500 to-indigo-600', border: 'border-violet-500', text: 'text-violet-600',  bg: 'bg-violet-50' },
  };

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

          {/* ── Welcome ─────────────────────────────────────────── */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 tracking-wide uppercase">Dashboard</p>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Olá, {displayName.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-500 mt-1.5 text-sm">
                  Aqui está um resumo da sua jornada para os Estados Unidos.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <FiClock className="w-4 h-4" />
                <span>{daysSinceJoined} dias na plataforma</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Progresso geral</p>
                  <p className="text-xs text-slate-500">Complete as etapas para avançar sua jornada</p>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Stats Cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
            {[
              {
                label: hasCustomVisa() ? 'Visto Escolhido' : 'Visto Recomendado',
                value: currentVisa || 'Pendente',
                sub: hasCustomVisa() ? 'Personalizado' : currentVisa ? 'Recomendado' : 'Faça o questionário',
                icon: <MdOutlineVerified className="w-5 h-5" />,
                iconBg: 'from-blue-500 to-blue-600',
                valueCls: 'text-blue-600',
              },
              {
                label: 'Treinos Realizados',
                value: trainingStats?.totalSessions || userProfile?.interviewsPracticed || 0,
                sub: trainingStats?.completedSessions ? `${trainingStats.completedSessions} completos` : 'Nenhum ainda',
                icon: <HiTrophy className="w-5 h-5" />,
                iconBg: 'from-emerald-500 to-green-600',
                valueCls: 'text-emerald-600',
              },
              {
                label: 'Dias na Plataforma',
                value: daysSinceJoined,
                sub: daysSinceJoined === 0 ? 'Hoje!' : daysSinceJoined === 1 ? 'Há 1 dia' : `Há ${daysSinceJoined} dias`,
                icon: <HiMiniClock className="w-5 h-5" />,
                iconBg: 'from-violet-500 to-indigo-600',
                valueCls: 'text-violet-600',
              },
              {
                label: 'Progresso',
                value: `${progress}%`,
                sub: progress >= 80 ? 'Quase lá!' : progress >= 50 ? 'Bom ritmo' : 'Continue avançando',
                icon: <HiMiniArrowTrendingUp className="w-5 h-5" />,
                iconBg: 'from-amber-400 to-orange-500',
                valueCls: 'text-amber-600',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.iconBg} text-white shadow-sm`}>
                    {stat.icon}
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stat.valueCls} leading-none mb-1`}>{stat.value}</p>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Trilha Banner ────────────────────────────────────── */}
          {userProfile?.selectedVisaPath ? (
            <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-lg animate-fade-in">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #3B82F6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366F1 0%, transparent 40%)'
              }} />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shrink-0">
                    <HiMapPin className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Trilha Ativa</p>
                    <h2 className="text-2xl font-bold">{userProfile.selectedVisaPath.visaType}</h2>
                    <div className="flex items-center gap-1.5 text-slate-300 text-sm mt-1">
                      <HiGlobeAmericas className="w-4 h-4" />
                      <span>{userProfile.selectedVisaPath.country}</span>
                    </div>
                  </div>
                </div>
                <Link href="/minha-trilha">
                  <span className="shrink-0 bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors cursor-pointer inline-flex items-center gap-2">
                    Ver Progresso <HiArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-8 border-2 border-dashed border-slate-200 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-xl shrink-0">
                    <HiMapPin className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Trilha de Visto</p>
                    <h2 className="text-lg font-bold text-slate-700">Nenhuma trilha selecionada</h2>
                    <p className="text-slate-500 text-sm mt-1">Complete o questionário e escolha sua trilha de imigração</p>
                  </div>
                </div>
                <Link href="/questionario">
                  <span className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer inline-flex items-center gap-2 shadow-md shadow-blue-500/20">
                    Começar Agora <HiArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* ── Main content + Sidebar ───────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Quick Actions */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Ações Rápidas</h2>
                  <span className="text-xs text-slate-400">{quickActions.filter(a => a.completed).length}/{quickActions.length} concluídas</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
                  {quickActions.map((action) => {
                    const c = colorMap[action.color];
                    return (
                      <Link key={action.id} href={action.href} className="h-full">
                        <div className={`group relative bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer h-full flex flex-col min-h-[9rem]
                          hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
                          ${action.completed ? 'border-l-4 ' + c.border : ''}`}>
                          {/* Completed badge */}
                          {action.completed && (
                            <span className={`absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                              <FiCheckCircle className="w-3 h-3" />
                              Concluído
                            </span>
                          )}
                          {/* Icon */}
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${c.icon} text-white shadow-sm w-fit mb-3 group-hover:scale-110 transition-transform duration-200`}>
                            {action.icon}
                          </div>
                          {/* Text */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 text-sm mb-1">{action.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{action.description}</p>
                          </div>
                          {/* Arrow */}
                          <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            Acessar <HiArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Recent Activity */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Atividade Recente</h2>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {recentActivities.map((activity, i) => (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-4 p-5 ${i < recentActivities.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        activity.type === 'quiz'     ? 'bg-emerald-50 text-emerald-600' :
                        activity.type === 'training' ? 'bg-blue-50 text-blue-600' :
                                                       'bg-violet-50 text-violet-600'
                      }`}>
                        {activity.type === 'quiz'     && <HiCheckCircle className="w-5 h-5" />}
                        {activity.type === 'training' && <HiAcademicCap className="w-5 h-5" />}
                        {activity.type === 'info'     && <HiSparkles className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm">{activity.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {new Date(activity.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Training History */}
              {trainingSessions.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Histórico de Treinamento</h2>
                    <Link href="/treinamento">
                      <Button variant="outline" size="sm">Novo Treinamento</Button>
                    </Link>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Stats summary */}
                    {trainingStats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
                        {[
                          { label: 'Sessões', value: trainingStats.totalSessions, color: 'text-blue-600' },
                          { label: 'Tempo Total', value: `${Math.floor(trainingStats.totalDuration / 60)}min`, color: 'text-emerald-600' },
                          { label: 'Mensagens', value: trainingStats.totalMessages, color: 'text-violet-600' },
                          { label: 'Visto Favorito', value: trainingStats.favoriteVisaType || 'N/A', color: 'text-amber-600' },
                        ].map((s, i) => (
                          <div key={i} className="bg-white px-5 py-4 text-center">
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {loadingTrainingData ? (
                      <div className="flex items-center justify-center py-10 gap-3">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-500 text-sm">Carregando histórico...</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {trainingSessions.map((session) => (
                          <div key={session.id} className="p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-slate-900 text-sm">{session.scenarioName}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    session.difficulty === 'Iniciante' ? 'bg-emerald-50 text-emerald-700' :
                                    session.difficulty === 'Intermediário' ? 'bg-amber-50 text-amber-700' :
                                    'bg-red-50 text-red-700'
                                  }`}>{session.difficulty}</span>
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{session.visaType}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600 mb-3">
                                  <div><span className="font-medium text-slate-700">Duração</span><p>{session.duration ? `${Math.floor(session.duration / 60)}min ${session.duration % 60}s` : 'N/A'}</p></div>
                                  <div><span className="font-medium text-slate-700">Mensagens</span><p>{session.totalMessages}</p></div>
                                  <div><span className="font-medium text-slate-700">Perguntas</span><p>{session.questionsAnswered}/{session.totalQuestions}</p></div>
                                  <div><span className="font-medium text-slate-700">Status</span><p className={session.completed ? 'text-emerald-600' : 'text-amber-600'}>{session.completed ? 'Completo' : 'Incompleto'}</p></div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                  <span className="flex items-center gap-1"><HiGlobeAmericas className="w-3.5 h-3.5" />{session.language === 'pt' ? 'Português' : 'English'}</span>
                                  <span className="flex items-center gap-1">
                                    {session.interactionMode === 'voice' ? <><HiMicrophone className="w-3.5 h-3.5" /> Voz</> : <><HiClipboardList className="w-3.5 h-3.5" /> Texto</>}
                                  </span>
                                  <span className="flex items-center gap-1"><HiCalendarDays className="w-3.5 h-3.5" />{session.startTime?.toDate?.()?.toLocaleDateString('pt-BR') || 'N/D'}</span>
                                </div>
                              </div>
                              {session.completed && <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                            </div>
                          </div>
                        ))}
                        {trainingSessions.length >= 5 && (
                          <div className="p-4 text-center">
                            <Button variant="ghost" size="sm">Ver Mais Sessões</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Visa card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-lg">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 70% 30%, #6366F1, transparent 60%)'
                }} />
                <div className="relative">
                  <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-3">
                    {hasCustomVisa() ? 'Seu Visto Escolhido' : 'Seu Visto Recomendado'}
                  </p>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/10">
                    <h4 className="font-bold text-xl">{currentVisa || 'Pendente'}</h4>
                    <p className="text-blue-200 text-xs mt-1">
                      {currentVisa ? (hasCustomVisa() ? 'Selecionado por você' : 'Baseado no seu perfil') : 'Faça o questionário'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link href={currentVisa ? (userProfile?.interviewsPracticed === 0 ? '/treinamento' : '/vistos') : '/questionario'}>
                      <Button variant="secondary" size="sm" className="w-full justify-start gap-2 bg-white text-slate-900 hover:bg-blue-50">
                        {currentVisa
                          ? (userProfile?.interviewsPracticed === 0
                              ? <><HiAcademicCap className="w-4 h-4" /> Começar Treinamento</>
                              : <><MdOutlineVerified className="w-4 h-4" /> Ver Detalhes</>)
                          : <><HiQuestionMarkCircle className="w-4 h-4" /> Fazer Questionário</>}
                      </Button>
                    </Link>
                    {currentVisa && (
                      <>
                        <Link href={`/documentos/${getVisaId(currentVisa)}`}>
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-white/10">
                            <HiClipboardList className="w-4 h-4" /> Documentos Necessários
                          </Button>
                        </Link>
                        <Link href="/vistos">
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-white/10">
                            <HiMap className="w-4 h-4" /> {hasCustomVisa() ? 'Alterar Visto' : 'Explorar Vistos'}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Steps — timeline */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-4 text-sm">Próximos Passos</h3>
                <div className="relative">
                  <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-100" />
                  <div className="space-y-5">
                    {generateUpcomingTasks().map((task, i) => (
                      <div key={task.id} className="flex gap-3 relative">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                          task.priority === 'high'   ? 'bg-red-100 text-red-600' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                       'bg-emerald-100 text-emerald-600'
                        }`}>{i + 1}</div>
                        <div className="flex-1 pb-1">
                          <h4 className="font-semibold text-slate-900 text-sm">{task.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 mb-2">{task.description}</p>
                          <button
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            onClick={() => {
                              if (task.id === 1) router.push('/questionario');
                              else if (task.id === 2 || task.id === 3) router.push('/treinamento');
                              else if (task.id === 4) router.push('/vistos');
                            }}
                          >
                            {task.action} →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Help card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-100 rounded-xl">
                    <MdSupportAgent className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="font-bold text-amber-900 text-sm">Precisa de Ajuda?</h3>
                </div>
                <p className="text-amber-800 text-xs mb-4 leading-relaxed">
                  Nossa equipe de especialistas está pronta para te ajudar em qualquer etapa do processo de imigração.
                </p>
                <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100 gap-2">
                  <MdSupportAgent className="w-4 h-4" /> Falar com Especialista
                </Button>
              </div>

            </div>
          </div>
        </div>
      </Layout>
    </SubscriptionGuard>
  );
}