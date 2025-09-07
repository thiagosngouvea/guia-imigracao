import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

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
  icon: string;
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Calculate days since user joined
  const daysSinceJoined = userProfile?.createdAt 
    ? Math.floor((new Date().getTime() - new Date(userProfile.createdAt.toDate()).getTime()) / (1000 * 3600 * 24))
    : 0;

  // Calculate progress percentage
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
      id: 'questionnaire',
      title: 'Questionário de Visto',
      description: 'Descubra qual visto é ideal para você',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
      href: '/questionario',
      color: 'blue',
      completed: userProfile?.completedQuiz || false
    },
    {
      id: 'training',
      title: 'Treino com IA',
      description: 'Pratique entrevistas de visto',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189 6.01 6.01 0 001.5.189 2.25 2.25 0 013.75 1.689 18.64 18.64 0 01-7.499 4.5 18.64 18.64 0 01-7.499-4.5 2.25 2.25 0 013.75-1.689V12.75a6.01 6.01 0 001.5.189z" />
        </svg>
      ),
      href: '/treinamento',
      color: 'green',
      completed: (userProfile?.interviewsPracticed || 0) > 0
    },
    {
      id: 'visa-info',
      title: 'Informações de Vistos',
      description: 'Guia completo sobre tipos de visto',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      href: '/vistos',
      color: 'purple',
      completed: false
    }
  ];

  // Generate recent activities based on user data
  const generateRecentActivities = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    if (userProfile?.completedQuiz && userProfile?.recommendedVisa) {
      activities.push({
        id: 1,
        type: 'quiz',
        title: 'Questionário de Visto Completado',
        description: `Visto recomendado: ${userProfile.recommendedVisa}`,
        date: userProfile.lastLoginAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        icon: '✅'
      });
    }

    if (userProfile?.interviewsPracticed && userProfile.interviewsPracticed > 0) {
      activities.push({
        id: 2,
        type: 'training',
        title: 'Treino de Entrevista',
        description: `${userProfile.interviewsPracticed} sessões de treino completadas`,
        date: userProfile.lastLoginAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        icon: '🎯'
      });
    }

    if (activities.length === 0) {
      activities.push({
        id: 3,
        type: 'info',
        title: 'Bem-vindo a MoveEasy!',
        description: 'Comece preenchendo o questionário para descobrir seu visto ideal',
        date: userProfile?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        icon: '🎉'
      });
    }

    return activities;
  };

  const generateUpcomingTasks = (): UpcomingTask[] => {
    const tasks: UpcomingTask[] = [];

    if (!userProfile?.completedQuiz) {
      tasks.push({
        id: 1,
        title: 'Complete o questionário',
        description: 'Descubra qual visto é ideal para seu perfil',
        priority: 'high',
        action: 'Começar Agora'
      });
    } else if ((userProfile?.interviewsPracticed || 0) === 0) {
      // Se completou o quiz mas ainda não praticou, priorizar o treinamento
      tasks.push({
        id: 2,
        title: 'Comece o treinamento de entrevista',
        description: 'Agora que você descobriu seu visto ideal, pratique para a entrevista',
        priority: 'high',
        action: 'Iniciar Treinamento'
      });
    }

    if ((userProfile?.interviewsPracticed || 0) > 0 && (userProfile?.interviewsPracticed || 0) < 3) {
      tasks.push({
        id: 3,
        title: 'Continue praticando entrevistas',
        description: 'Recomendamos pelo menos 3 sessões de treino',
        priority: 'high',
        action: 'Continuar Treino'
      });
    }

    if (userProfile?.recommendedVisa) {
      tasks.push({
        id: 4,
        title: 'Revisar documentos necessários',
        description: `Confira a lista de documentos para o visto ${userProfile.recommendedVisa}`,
        priority: 'medium',
        action: 'Ver Lista'
      });
    }

    if (tasks.length < 3) {
      tasks.push({
        id: 5,
        title: 'Agendar consulta com especialista',
        description: 'Fale com um advogado de imigração',
        priority: 'low',
        action: 'Agendar'
      });
    }

    return tasks.slice(0, 3);
  };

  // Função para obter o visto atual (escolhido pelo usuário ou recomendado)
  const getCurrentVisa = () => {
    return userProfile?.selectedVisa || userProfile?.recommendedVisa;
  };

  // Função para verificar se o usuário escolheu um visto diferente do recomendado
  const hasCustomVisa = () => {
    return userProfile?.selectedVisa && userProfile.selectedVisa !== userProfile.recommendedVisa;
  };

  // Função para mapear nome do visto para ID usado na URL
  const getVisaId = (visaName: string) => {
    const visaMapping: Record<string, string> = {
      'B1/B2': 'b1b2',
      'F1': 'f1',
      'H1B': 'h1b',
      'EB5': 'eb5',
      'O1': 'o1'
    };
    return visaMapping[visaName] || visaName.toLowerCase();
  };

  // Show loading state
  if (loading || !isClient) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando seu dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not authenticated (this shouldn't happen due to useEffect above)
  if (!user) {
    return null;
  }

  const recentActivities = generateRecentActivities();
  const upcomingTasks = generateUpcomingTasks();
  const progress = calculateProgress();
  const currentVisa = getCurrentVisa();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Bem-vindo, {userProfile?.name || user.displayName || 'Usuário'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Aqui está um resumo do seu progresso na jornada para os EUA.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {hasCustomVisa() ? 'Visto Escolhido' : 'Visto Recomendado'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentVisa || 'Pendente'}
                  </p>
                  {hasCustomVisa() && (
                    <p className="text-xs text-blue-600">Personalizado por você</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189 6.01 6.01 0 001.5.189 2.25 2.25 0 013.75 1.689 18.64 18.64 0 01-7.499 4.5 18.64 18.64 0 01-7.499-4.5 2.25 2.25 0 013.75-1.689V12.75a6.01 6.01 0 001.5.189z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Treinos Realizados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userProfile?.interviewsPracticed || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Dias na Plataforma</p>
                  <p className="text-2xl font-bold text-gray-900">{daysSinceJoined}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progresso</p>
                  <p className="text-2xl font-bold text-gray-900">{progress}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {quickActions.map((action) => (
                  <Link key={action.id} href={action.href}>
                    <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border-l-4 h-40 flex flex-col ${
                      action.color === 'blue' ? 'border-blue-500' :
                      action.color === 'green' ? 'border-green-500' :
                      'border-purple-500'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${
                          action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          action.color === 'green' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {action.icon}
                        </div>
                        {action.completed && (
                          <div className="text-green-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                        <p className="text-sm text-gray-600 flex-1">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Recent Activity */}
              <h2 className="text-xl font-bold text-gray-900 mb-6">Atividade Recente</h2>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recommended/Selected Visa Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white p-6">
                <h3 className="font-bold text-lg mb-2">
                  {hasCustomVisa() ? 'Seu Visto Escolhido' : 'Seu Visto Recomendado'}
                </h3>
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-xl">
                    {currentVisa || 'Complete o questionário'}
                  </h4>
                  <p className="text-blue-100 text-sm">
                    {currentVisa 
                      ? (hasCustomVisa() ? 'Selecionado por você' : 'Baseado no seu perfil')
                      : 'Para descobrir seu visto ideal'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Link href={
                    currentVisa 
                      ? (userProfile?.interviewsPracticed === 0 ? '/treinamento' : '/vistos')
                      : '/questionario'
                  }>
                    <Button variant="secondary" size="sm" className="w-full">
                      {currentVisa 
                        ? (userProfile?.interviewsPracticed === 0 ? 'Começar Treinamento' : 'Ver Detalhes')
                        : 'Fazer Questionário'
                      }
                    </Button>
                  </Link>
                  
                  {currentVisa && (
                    <>
                      <Link href={`/documentos/${getVisaId(currentVisa)}`}>
                        <Button variant="ghost" size="sm" className="w-full text-white hover:bg-white/20">
                          📋 Ver Documentos Necessários
                        </Button>
                      </Link>
                      <Link href="/vistos">
                        <Button variant="ghost" size="sm" className="w-full text-white hover:bg-white/20">
                          {hasCustomVisa() ? 'Alterar Visto' : 'Escolher Outro Visto'}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Próximos Passos</h3>
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="border-l-4 border-gray-200 pl-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                          </div>
                          <span className={`inline-block w-2 h-2 rounded-full ml-2 mt-2 ${
                            task.priority === 'high' ? 'bg-red-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 text-xs"
                          onClick={() => {
                            if (task.id === 1) router.push('/questionario');
                            else if (task.id === 2 || task.id === 3) router.push('/treinamento');
                            else if (task.id === 4) router.push('/vistos');
                          }}
                        >
                          {task.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="font-bold text-yellow-800 mb-2">Precisa de Ajuda?</h3>
                <p className="text-yellow-700 text-sm mb-4">
                  Nossa equipe de especialistas está pronta para te ajudar em qualquer etapa do processo.
                </p>
                <Button variant="outline" size="sm" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Falar com Especialista
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}