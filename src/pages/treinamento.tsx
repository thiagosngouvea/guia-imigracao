import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import { InteractiveTraining } from '../components/InteractiveTraining';
import { 
  createTrainingSession, 
  addMessageToSession, 
  finishTrainingSession,
  TrainingMessage 
} from '../lib/training-history';
import { HiAcademicCap, HiGlobeAlt, HiDocumentText } from 'react-icons/hi';
import { HiMicrophone, HiCpuChip, HiLanguage, HiChartBar, HiCheckBadge, HiExclamationTriangle } from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  isThinking?: boolean;
  audioData?: string;
}

interface InterviewScenario {
  id: string;
  name: string;
  description: string;
  visaType: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  icon: string;
  color: string;
  questions: {
    pt: string[];
    en: string[];
  };
}

type Language = 'pt' | 'en';
type InteractionMode = 'text' | 'voice';

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  'b1b2-tourism': <HiGlobeAlt className="w-6 h-6" />,
  'f1-student': <HiAcademicCap className="w-6 h-6" />,
  'h1b-work': <HiDocumentText className="w-6 h-6" />,
};

const scenarios: InterviewScenario[] = [
  {
    id: 'b1b2-tourism',
    name: 'Turismo - Primeira Vez',
    description: 'Simulação de entrevista para visto de turismo B1/B2 para quem nunca visitou os EUA.',
    visaType: 'B1/B2',
    difficulty: 'Iniciante',
    icon: 'globe',
    color: 'from-emerald-400 to-teal-500',
    questions: {
      pt: [
        'Qual é o propósito da sua viagem aos Estados Unidos?',
        'Por quanto tempo você planeja ficar?',
        'Onde você vai se hospedar?',
        'Quem está pagando pela sua viagem?',
        'O que você faz no Brasil?',
        'Você tem família ou amigos nos Estados Unidos?',
        'Você já viajou para outros países antes?',
        'Que vínculos você tem com o Brasil que garantem seu retorno?'
      ],
      en: [
        'What is the purpose of your trip to the United States?',
        'How long do you plan to stay?',
        'Where will you be staying?',
        'Who is paying for your trip?',
        'What do you do for work in Brazil?',
        'Do you have family or friends in the United States?',
        'Have you traveled to other countries before?',
        'What ties do you have to Brazil that will ensure your return?'
      ]
    }
  },
  {
    id: 'f1-student',
    name: 'Estudante - Graduação',
    description: 'Entrevista para visto de estudante F1 para curso de graduação.',
    visaType: 'F1',
    difficulty: 'Intermediário',
    icon: 'academic',
    color: 'from-blue-400 to-indigo-500',
    questions: {
      pt: [
        'Por que você quer estudar nos Estados Unidos?',
        'Por que escolheu esta universidade específica?',
        'O que você vai estudar e por quê?',
        'Como você vai pagar pela sua educação?',
        'Quais são seus planos após a graduação?',
        'Por que não escolheu estudar isso no Brasil?',
        'Como este curso se encaixa nos seus objetivos de carreira?',
        'Você tem parentes nos Estados Unidos?'
      ],
      en: [
        'Why do you want to study in the United States?',
        'Why did you choose this particular university?',
        'What will you study and why?',
        'How will you pay for your education?',
        'What are your plans after graduation?',
        'Why didn\'t you choose to study this in Brazil?',
        'How does this degree fit with your career goals?',
        'Do you have any relatives in the United States?'
      ]
    }
  },
  {
    id: 'h1b-work',
    name: 'Trabalho - H1B',
    description: 'Entrevista para visto de trabalho H1B para profissional especializado.',
    visaType: 'H1B',
    difficulty: 'Avançado',
    icon: 'document',
    color: 'from-purple-400 to-pink-500',
    questions: {
      pt: [
        'Conte-me sobre sua formação educacional.',
        'Qual é seu trabalho atual no Brasil?',
        'Descreva o trabalho que você fará nos Estados Unidos.',
        'Como sua experiência te qualifica para esta posição?',
        'Qual será seu salário?',
        'Conte-me sobre a empresa que está te contratando.',
        'Por quanto tempo você planeja trabalhar nos Estados Unidos?',
        'Quais são seus planos de carreira a longo prazo?'
      ],
      en: [
        'Tell me about your educational background.',
        'What is your current job in Brazil?',
        'Describe the job you will be doing in the United States.',
        'How does your experience qualify you for this position?',
        'What is your salary going to be?',
        'Tell me about the company that is hiring you.',
        'How long do you plan to work in the United States?',
        'What are your long-term career plans?'
      ]
    }
  }
];

export default function Treinamento() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<InterviewScenario | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('text');
  const [hoveredScenario, setHoveredScenario] = useState<string | null>(null);
  
  // Estado para controlar a sessão de treinamento
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSavingSession, setIsSavingSession] = useState(false);

  // Função para obter o visto atual (escolhido pelo usuário ou recomendado)
  const getCurrentVisa = () => {
    return userProfile?.selectedVisa || userProfile?.recommendedVisa;
  };

  // Função para salvar mensagem na sessão atual
  const saveMessageToSession = async (message: Message) => {
    if (!currentSessionId || !user) return;
    
    try {
      // Criar objeto base com campos obrigatórios
      const trainingMessage: Omit<TrainingMessage, 'id'> = {
        role: message.role,
        content: message.content,
        timestamp: message.timestamp
      };
      
      // Adicionar campos opcionais apenas se não forem undefined
      if (message.isVoice !== undefined) {
        trainingMessage.isVoice = message.isVoice;
      }
      
      if (message.isThinking !== undefined) {
        trainingMessage.isThinking = message.isThinking;
      }
      
      await addMessageToSession(currentSessionId, trainingMessage);
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      // Não interrompe o fluxo se houver erro ao salvar
    }
  };

  // Função para filtrar cenários baseado no visto atual
  const getRelevantScenarios = () => {
    const currentVisa = getCurrentVisa();
    if (!currentVisa) return scenarios;
    
    const relevantScenarios = scenarios.filter(scenario => {
      const visaMapping: Record<string, string[]> = {
        'B1/B2': ['B1/B2'],
        'F1': ['F1'],
        'H1B': ['H1B'],
        'EB5': ['EB5'],
        'O1': ['O1']
      };
      
      const allowedTypes = visaMapping[currentVisa] || [];
      return allowedTypes.includes(scenario.visaType);
    });
    
    return relevantScenarios.length > 0 ? relevantScenarios : scenarios;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const startInterview = async (scenario: InterviewScenario) => {
    if (!user) return;
    
    setIsSavingSession(true);
    
    try {
      // Criar nova sessão no Firebase
      const sessionId = await createTrainingSession(
        user.uid,
        scenario.id,
        scenario.name,
        scenario.visaType,
        scenario.difficulty,
        language,
        interactionMode
      );
      
      setCurrentSessionId(sessionId);
      setSelectedScenario(scenario);
      setCurrentQuestionIndex(0);
      setInterviewStarted(true);

    } catch (error) {
      console.error('Erro ao iniciar sessão de treinamento:', error);
      alert('Erro ao iniciar treinamento. Tente novamente.');
    } finally {
      setIsSavingSession(false);
    }
  };

  const resetInterview = async () => {
    // Finalizar sessão atual se existir
    if (currentSessionId && selectedScenario) {
      try {
        const completed = currentQuestionIndex >= selectedScenario.questions[language].length - 1;
        
        await finishTrainingSession(
          currentSessionId, 
          currentQuestionIndex + 1, 
          selectedScenario.questions[language].length, 
          completed
        );
      } catch (error) {
        console.error('Erro ao finalizar sessão:', error);
      }
    }
    
    setSelectedScenario(null);
    setCurrentQuestionIndex(0);
    setInterviewStarted(false);
    setCurrentSessionId(null);
  };

  // Show loading
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Carregando cenários...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  const currentVisa = getCurrentVisa();
  const relevantScenarios = getRelevantScenarios();
  const hasCustomVisa = userProfile?.selectedVisa && userProfile.selectedVisa !== userProfile.recommendedVisa;

  if (selectedScenario && interviewStarted) {
    return (
      <SubscriptionGuard>
        <Layout>
          <InteractiveTraining
            scenario={selectedScenario}
            language={language}
            interactionMode={interactionMode}
            currentQuestionIndex={currentQuestionIndex}
            onMessageSaved={saveMessageToSession}
            onQuestionIndexChange={setCurrentQuestionIndex}
            onInteractionModeChange={setInteractionMode}
          />
        </Layout>
      </SubscriptionGuard>
    );
  }

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F8FAFC 50%, #EEF2FF 100%)' }}>
          {/* Hero */}
          <div className="relative overflow-hidden">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center">
                <div className="mb-8 animate-fade-in">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                      <HiAcademicCap className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">IA Treinamento</span>
                  </div>
                  <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    Treinamento de
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Entrevista</span>
                  </h1>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    Pratique sua entrevista de visto com IA especializada.
                    Receba feedback personalizado e melhore suas chances de aprovação.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto stagger-children">
                  {[
                    { value: '95%', label: 'Taxa de Aprovação', color: 'text-blue-600' },
                    { value: '10k+', label: 'Usuários Treinados', color: 'text-emerald-600' },
                    { value: '24/7', label: 'Disponibilidade', color: 'text-violet-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md transition-shadow">
                      <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                      <div className="text-slate-500 text-xs font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Settings */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <HiLanguage className="w-4 h-4 text-blue-500" /> Idioma
                    </h3>
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                      {(['pt', 'en'] as const).map(lang => (
                        <button key={lang} onClick={() => setLanguage(lang)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            language === lang
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md scale-105'
                              : 'text-slate-600 hover:bg-white'
                          }`}>
                          {lang === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <HiCpuChip className="w-4 h-4 text-emerald-500" /> Modo
                    </h3>
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                      {(['text', 'voice'] as const).map(mode => (
                        <button key={mode} onClick={() => setInteractionMode(mode)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            interactionMode === mode
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-105'
                              : 'text-slate-600 hover:bg-white'
                          }`}>
                          {mode === 'text'
                            ? <><HiDocumentText className="w-4 h-4" /> Texto</>
                            : <><HiMicrophone className="w-4 h-4" /> Voz</>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Current Visa Status */}
                {currentVisa && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg mb-8 text-sm font-semibold">
                    <FiCheckCircle className="w-4 h-4" />
                    Treinando para: {currentVisa}
                    {hasCustomVisa && (
                      <span className="ml-2 text-xs bg-white/20 px-2.5 py-0.5 rounded-full">Personalizado</span>
                    )}
                  </div>
                )}
                
                {!currentVisa && (
                  <div className="inline-flex flex-col items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-sm mx-auto mb-8">
                    <HiExclamationTriangle className="w-8 h-8 text-amber-500" />
                    <p className="text-amber-800 font-medium text-sm text-center">
                      Complete o questionário para treinar com cenários personalizados.
                    </p>
                    <Button variant="outline" size="sm" className="border-amber-300 text-amber-800 hover:bg-amber-100"
                      onClick={() => router.push('/questionario')}>
                      Fazer Questionário
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scenarios */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Escolha seu <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Cenário</span>
              </h2>
              <p className="text-slate-500 text-sm">
                Selecione o tipo de entrevista que melhor se adapta ao seu perfil
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {relevantScenarios.map((scenario) => {
                const isRecommended = currentVisa && scenario.visaType === currentVisa;
                return (
                  <div
                    key={scenario.id}
                    className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                      isSavingSession ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${isRecommended ? 'border-blue-400 ring-2 ring-blue-400/30' : 'border-slate-200'}`}
                    onClick={() => !isSavingSession && startInterview(scenario)}
                  >
                    {/* Gradient hover bg */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${scenario.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold z-10">
                        <HiCheckBadge className="w-3.5 h-3.5" /> Recomendado
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${scenario.color} flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                        {SCENARIO_ICONS[scenario.id]}
                      </div>
                      
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {scenario.name}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          scenario.difficulty === 'Iniciante' ? 'bg-emerald-100 text-emerald-700' :
                          scenario.difficulty === 'Intermediário' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{scenario.difficulty}</span>
                      </div>
                      
                      <p className="text-slate-500 text-sm mb-5 leading-relaxed">{scenario.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{scenario.visaType}</span>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><HiCpuChip className="w-3.5 h-3.5" /> IA</span>
                          <span className="flex items-center gap-1"><HiMicrophone className="w-3.5 h-3.5" /> Voz</span>
                          <span className="flex items-center gap-1"><HiLanguage className="w-3.5 h-3.5" /> {scenario.questions[language].length}p</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom gradient bar */}
                    <div className={`h-1 bg-gradient-to-r ${scenario.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                    
                    {isSavingSession && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white/60 border-t border-slate-100 py-14">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Tecnologia de Ponta</h2>
                <p className="text-slate-500 text-sm">Recursos avançados para uma experiência completa</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
                {[
                  { icon: <HiCpuChip className="w-6 h-6" />, title: 'IA ChatGPT', description: 'Feedback inteligente powered by OpenAI GPT-4.', color: 'from-blue-500 to-cyan-500' },
                  { icon: <HiMicrophone className="w-6 h-6" />, title: 'Modo Voz', description: 'Pratique falando como em uma entrevista real.', color: 'from-emerald-500 to-teal-500' },
                  { icon: <HiLanguage className="w-6 h-6" />, title: 'Multilíngue', description: 'Treine em português ou inglês.', color: 'from-violet-500 to-purple-500' },
                  { icon: <HiChartBar className="w-6 h-6" />, title: 'Análise', description: 'Relatório com dicas específicas para seu caso.', color: 'from-amber-500 to-orange-500' },
                ].map((f, i) => (
                  <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 hover:-translate-y-0.5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                      {f.icon}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </SubscriptionGuard>
  );
}

// CSS animations moved to globals.css
