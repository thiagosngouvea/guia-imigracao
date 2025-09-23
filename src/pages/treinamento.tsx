import { useState, useEffect, useRef } from 'react';
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

const scenarios: InterviewScenario[] = [
  {
    id: 'b1b2-tourism',
    name: 'Turismo - Primeira Vez',
    description: 'Simulação de entrevista para visto de turismo B1/B2 para quem nunca visitou os EUA.',
    visaType: 'B1/B2',
    difficulty: 'Iniciante',
    icon: '🏖️',
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
    icon: '🎓',
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
    icon: '💼',
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

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-indigo-400 animate-pulse mx-auto"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Preparando seu treinamento...</p>
            <p className="text-gray-400 text-sm mt-2">Carregando cenários personalizados</p>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                {/* Animated header */}
                <div className="mb-8 animate-fade-in-up">
                  <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    <span className="text-6xl mr-4">🎯</span>
                    <span className="text-5xl font-bold">IA Training</span>
                  </div>
                  <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Treinamento de
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Entrevista</span>
                  </h1>
                  <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                    Pratique sua entrevista de visto com nossa IA especializada powered by 
                    <span className="font-semibold text-green-600"> ChatGPT</span>. 
                    Receba feedback personalizado e melhore suas chances de aprovação com tecnologia de ponta.
                  </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                    <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                    <div className="text-gray-600">Taxa de Aprovação</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                    <div className="text-3xl font-bold text-green-600 mb-2">10k+</div>
                    <div className="text-gray-600">Usuários Treinados</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                    <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                    <div className="text-gray-600">Disponibilidade</div>
                  </div>
                </div>

                {/* Interactive Settings */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
                  {/* Language Selector */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🌍</span> Idioma de Treinamento
                    </h3>
                    <div className="flex bg-gray-100 rounded-xl p-2 space-x-2">
                      <button
                        onClick={() => setLanguage('pt')}
                        className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          language === 'pt' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <span className="text-lg mr-2">🇧🇷</span>
                        Português
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          language === 'en' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <span className="text-lg mr-2">🇺🇸</span>
                        English
                      </button>
                    </div>
                  </div>
                  
                  {/* Interaction Mode Selector */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">⚡</span> Modo de Interação
                    </h3>
                    <div className="flex bg-gray-100 rounded-xl p-2 space-x-2">
                      <button
                        onClick={() => setInteractionMode('text')}
                        className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          interactionMode === 'text' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <span className="text-lg mr-2">📝</span>
                        Texto
                      </button>
                      <button
                        onClick={() => setInteractionMode('voice')}
                        className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          interactionMode === 'voice' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <span className="text-lg mr-2">🎤</span>
                        Voz
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Current Visa Status */}
                {currentVisa && (
                  <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-8">
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Treinando para: {currentVisa}</span>
                    {hasCustomVisa && (
                      <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full">(Personalizado)</span>
                    )}
                  </div>
                )}
                
                {!currentVisa && (
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-2xl p-6 max-w-md mx-auto mb-8 shadow-lg">
                    <div className="text-4xl mb-3">⚠️</div>
                    <p className="text-yellow-800 font-medium mb-4">
                      Complete o questionário primeiro para treinar com cenários personalizados.
                    </p>
                    <Button 
                      variant="outline" 
                      className="bg-white hover:bg-yellow-50 border-yellow-300 text-yellow-800 font-semibold"
                      onClick={() => router.push('/questionario')}
                    >
                      <span className="mr-2">📋</span>
                      Fazer Questionário
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scenarios Section */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Escolha seu <span className="text-blue-600">Cenário</span>
              </h2>
              <p className="text-xl text-gray-600">
                Selecione o tipo de entrevista que melhor se adapta ao seu perfil
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relevantScenarios.map((scenario, index) => {
                const isRecommended = currentVisa && scenario.visaType === currentVisa;
                const isHovered = hoveredScenario === scenario.id;
                
                return (
                  <div
                    key={scenario.id}
                    className={`group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                      isSavingSession ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${isRecommended ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeInUp 0.8s ease-out forwards'
                    }}
                    onClick={() => !isSavingSession && startInterview(scenario)}
                    onMouseEnter={() => setHoveredScenario(scenario.id)}
                    onMouseLeave={() => setHoveredScenario(null)}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${scenario.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm font-bold rounded-bl-2xl shadow-lg z-10">
                        <span className="mr-1">⭐</span>
                        Recomendado
                      </div>
                    )}
                    
                    {/* Card Header */}
                    <div className="relative p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${scenario.color} flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {scenario.icon}
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {scenario.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          scenario.difficulty === 'Iniciante' ? 'bg-green-100 text-green-700' :
                          scenario.difficulty === 'Intermediário' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {scenario.description}
                      </p>
                      
                      {/* Card Stats */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {scenario.visaType}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">
                          {scenario.questions[language].length} perguntas
                        </span>
                      </div>
                      
                      {/* Features */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>🤖</span>
                          <span>ChatGPT</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🎤</span>
                          <span>Voz</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🌐</span>
                          <span>Multilíngue</span>
                        </div>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${scenario.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                    </div>
                    
                    {/* Loading State */}
                    {isSavingSession && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features Showcase */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Tecnologia de <span className="text-blue-600">Última Geração</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Recursos avançados para uma experiência de treinamento completa e eficaz
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: '🤖',
                    title: 'IA ChatGPT',
                    description: 'Conversas naturais e feedback inteligente powered by OpenAI GPT-4.',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: '🎤',
                    title: 'Conversação por Voz',
                    description: 'Pratique falando e ouvindo como em uma entrevista real com síntese de voz.',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: '🌐',
                    title: 'Multilíngue',
                    description: 'Treine em português ou inglês com tradução automática e contextual.',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: '📊',
                    title: 'Análise Inteligente',
                    description: 'Receba análises detalhadas e dicas específicas baseadas em IA.',
                    color: 'from-orange-500 to-red-500'
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
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

// Add custom CSS animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out;
  }
`;
