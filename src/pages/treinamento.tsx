import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs para Web APIs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para obter o visto atual (escolhido pelo usuário ou recomendado)
  const getCurrentVisa = () => {
    return userProfile?.selectedVisa || userProfile?.recommendedVisa;
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

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // Speech recognition está disponível
    }
  }, []);

  const startInterview = (scenario: InterviewScenario) => {
    setSelectedScenario(scenario);
    
    const systemMessage = language === 'pt' 
      ? `Iniciando simulação de entrevista para visto ${scenario.visaType}. Você pode responder em português ou inglês.`
      : `Starting visa interview simulation for ${scenario.visaType}. You can respond in Portuguese or English.`;
    
    const firstQuestion = scenario.questions[language][0];
    const aiGreeting = language === 'pt'
      ? `Bom dia! Por favor, sente-se. Eu conduzirei sua entrevista de visto hoje. Vamos começar com a primeira pergunta: ${firstQuestion}`
      : `Good morning! Please have a seat. I'll be conducting your visa interview today. Let's start with the first question: ${firstQuestion}`;

    setMessages([
      {
        id: '1',
        role: 'system',
        content: systemMessage,
        timestamp: new Date()
      },
      {
        id: '2',
        role: 'ai',
        content: aiGreeting,
        timestamp: new Date()
      }
    ]);
    setCurrentQuestionIndex(0);
    setInterviewStarted(true);

    // Falar a primeira pergunta se estiver no modo voz
    if (interactionMode === 'voice') {
      speakText(aiGreeting);
    }
  };

  // Função para converter texto em fala
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'pt' ? 'pt-BR' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  // Função para iniciar gravação de voz
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Processar entrada de voz (converter para texto)
  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      // Converter Blob para Base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBase64 = Buffer.from(arrayBuffer).toString('base64');

      // Enviar para API de transcrição
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioBase64 }),
      });

      if (!response.ok) {
        throw new Error('Erro na transcrição');
      }

      const data = await response.json();
      setCurrentInput(data.transcription);
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      alert('Erro ao transcrever áudio. Tente novamente.');
      
      // Fallback para texto simulado em caso de erro
      const simulatedText = language === 'pt' 
        ? "Erro na transcrição. Digite sua resposta manualmente."
        : "Transcription error. Please type your answer manually.";
      setCurrentInput(simulatedText);
    }
  };

  // Função para enviar mensagem (integração com ChatGPT)
  const sendMessage = async () => {
    if (!currentInput.trim() || !selectedScenario) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
      isVoice: interactionMode === 'voice'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Integração com ChatGPT API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          scenario: selectedScenario,
          language: language,
          questionIndex: currentQuestionIndex,
          context: messages.slice(-5) // Últimas 5 mensagens para contexto
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com a IA');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Se há próxima pergunta, atualizar índice
      if (data.nextQuestionIndex !== undefined) {
        setCurrentQuestionIndex(data.nextQuestionIndex);
      }

      // Falar resposta se estiver no modo voz
      if (interactionMode === 'voice') {
        speakText(data.response);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Fallback para resposta simulada
      let aiResponse = '';
      
      if (currentInput.length < 20) {
        aiResponse = language === 'pt' 
          ? "Sua resposta parece bem breve. Em uma entrevista real, tente fornecer respostas mais detalhadas. "
          : "Your answer seems quite brief. In a real interview, try to provide more detailed responses. ";
      } else if (currentInput.length > 200) {
        aiResponse = language === 'pt'
          ? "Boa resposta detalhada, mas tente ser mais conciso. Oficiais consulares apreciam respostas claras e diretas. "
          : "Good detail, but try to be more concise. Consular officers appreciate clear, direct answers. ";
      } else {
        aiResponse = language === 'pt' ? "Boa resposta. " : "Good response. ";
      }

      // Próxima pergunta ou finalização
      if (currentQuestionIndex < selectedScenario.questions[language].length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = selectedScenario.questions[language][nextIndex];
        aiResponse += language === 'pt'
          ? `Vamos para a próxima pergunta: ${nextQuestion}`
          : `Let's move to the next question: ${nextQuestion}`;
      } else {
        aiResponse += language === 'pt'
          ? "Obrigado, isso conclui nossa simulação de entrevista. Aqui está seu feedback: Você respondeu a todas as perguntas. Em uma entrevista real, lembre-se de ser confiante, honesto e conciso. Pratique falar claramente e mantenha contato visual."
          : "Thank you, that concludes our interview simulation. Here's your feedback: You provided answers to all questions. In a real interview, remember to be confident, honest, and concise. Practice speaking clearly and maintain eye contact.";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (interactionMode === 'voice') {
        speakText(aiResponse);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setSelectedScenario(null);
    setMessages([]);
    setCurrentInput('');
    setCurrentQuestionIndex(0);
    setInterviewStarted(false);
    
    // Parar qualquer reprodução de áudio
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
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
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedScenario.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Pergunta {currentQuestionIndex + 1} de {selectedScenario.questions[language].length}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Controles de idioma */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setLanguage('pt')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        language === 'pt' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      🇧🇷 PT
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      🇺🇸 EN
                    </button>
                  </div>
                  
                  {/* Controles de modo */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setInteractionMode('text')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        interactionMode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      ✍️ Texto
                    </button>
                    <button
                      onClick={() => setInteractionMode('voice')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        interactionMode === 'voice' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      🎤 Voz
                    </button>
                  </div>
                  
                  <Button variant="outline" onClick={resetInterview}>
                    Finalizar Treino
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / selectedScenario.questions[language].length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-lg shadow-sm">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.role === 'system'
                          ? 'bg-yellow-100 text-yellow-800 text-sm'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.role === 'ai' && (
                        <div className="flex items-center mb-1">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">CO</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {language === 'pt' ? 'Oficial Consular' : 'Consular Officer'}
                          </span>
                          {message.role === 'ai' && interactionMode === 'voice' && (
                            <button
                              onClick={() => speakText(message.content)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                              disabled={isPlaying}
                            >
                              {isPlaying ? '🔊' : '🔈'}
                            </button>
                          )}
                        </div>
                      )}
                      {message.role === 'user' && message.isVoice && (
                        <div className="flex items-center mb-1">
                          <span className="text-xs opacity-75">🎤 Mensagem de voz</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        {language === 'pt' ? 'Oficial Consular está digitando...' : 'Consular Officer is typing...'}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                {interactionMode === 'text' ? (
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={language === 'pt' 
                        ? "Digite sua resposta..." 
                        : "Type your answer..."
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!currentInput.trim() || isLoading}
                    >
                      {language === 'pt' ? 'Enviar' : 'Send'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {currentInput && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          {language === 'pt' ? 'Texto transcrito:' : 'Transcribed text:'}
                        </p>
                        <p className="text-gray-900">{currentInput}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 flex items-center justify-center">
                        {!isRecording ? (
                          <Button
                            onClick={startRecording}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full"
                            disabled={isLoading}
                          >
                            🎤 {language === 'pt' ? 'Pressione para Falar' : 'Press to Speak'}
                          </Button>
                        ) : (
                          <Button
                            onClick={stopRecording}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full animate-pulse"
                          >
                            ⏹️ {language === 'pt' ? 'Parar Gravação' : 'Stop Recording'}
                          </Button>
                        )}
                      </div>
                      
                      {currentInput && (
                        <Button 
                          onClick={sendMessage} 
                          disabled={isLoading}
                        >
                          {language === 'pt' ? 'Enviar' : 'Send'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  💡 {language === 'pt' 
                    ? 'Dica: Responda como se estivesse em uma entrevista real. Seja claro, conciso e honesto.'
                    : 'Tip: Answer as if you were in a real interview. Be clear, concise and honest.'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
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
                    ✍️ Texto
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
                  className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                    isRecommended ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => startInterview(scenario)}
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
  );
}
