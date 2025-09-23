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
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando treinamento...</p>
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
        <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Treinamento de Entrevista com IA
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pratique sua entrevista de visto com nossa IA especializada powered by ChatGPT. 
              Receba feedback personalizado e melhore suas chances de aprovação.
            </p>
            
            {/* Configurações globais */}
            <div className="mt-8 flex justify-center space-x-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Idioma Padrão</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setLanguage('pt')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      language === 'pt' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    🇧🇷 Português
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Modo de Interação</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setInteractionMode('text')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      interactionMode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    📝 Texto
                  </button>
                  <button
                    onClick={() => setInteractionMode('voice')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      interactionMode === 'voice' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    🎤 Voz
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mostrar visto atual */}
            {currentVisa && (
              <div className="mt-6 inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Treinando para: {currentVisa}
                {hasCustomVisa && (
                  <span className="ml-2 text-xs">(Escolhido por você)</span>
                )}
              </div>
            )}
            
            {!currentVisa && (
              <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-yellow-800 text-sm">
                  Complete o questionário primeiro para treinar com cenários personalizados.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => router.push('/questionario')}
                >
                  Fazer Questionário
                </Button>
              </div>
            )}
          </div>

          {/* Scenarios Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {relevantScenarios.map((scenario) => {
              const isRecommended = currentVisa && scenario.visaType === currentVisa;
              
              return (
                <div
                  key={scenario.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                    isSavingSession ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  } ${isRecommended ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => !isSavingSession && startInterview(scenario)}
                >
                  {isRecommended && (
                    <div className="bg-blue-500 text-white px-4 py-2 text-sm font-medium">
                      ⭐ Recomendado para você
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {scenario.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        scenario.difficulty === 'Iniciante' ? 'bg-green-100 text-green-800' :
                        scenario.difficulty === 'Intermediário' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {scenario.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {scenario.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-blue-600 font-medium">
                        {scenario.visaType}
                      </span>
                      <span className="text-sm text-gray-500">
                        {scenario.questions[language].length} perguntas
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>🤖 ChatGPT</span>
                      <span>•</span>
                      <span>🎤 Voz</span>
                      <span>•</span>
                      <span>🌐 Multilíngue</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Recursos Avançados do Treinamento
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600 text-2xl mb-2">🤖</div>
                <h3 className="font-semibold text-gray-900 mb-2">IA ChatGPT</h3>
                <p className="text-gray-600 text-sm">
                  Conversas naturais e feedback inteligente powered by OpenAI.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600 text-2xl mb-2">🎤</div>
                <h3 className="font-semibold text-gray-900 mb-2">Conversação por Voz</h3>
                <p className="text-gray-600 text-sm">
                  Pratique falando e ouvindo como em uma entrevista real.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600 text-2xl mb-2">🌐</div>
                <h3 className="font-semibold text-gray-900 mb-2">Multilíngue</h3>
                <p className="text-gray-600 text-sm">
                  Treine em português ou inglês, conforme sua preferência.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600 text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Feedback Personalizado</h3>
                <p className="text-gray-600 text-sm">
                  Receba análises detalhadas e dicas específicas para melhorar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </SubscriptionGuard>
  );
}
