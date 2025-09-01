import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface InterviewScenario {
  id: string;
  name: string;
  description: string;
  visaType: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  questions: string[];
}

const scenarios: InterviewScenario[] = [
  {
    id: 'b1b2-tourism',
    name: 'Turismo - Primeira Vez',
    description: 'Simulação de entrevista para visto de turismo B1/B2 para quem nunca visitou os EUA.',
    visaType: 'B1/B2',
    difficulty: 'Iniciante',
    questions: [
      'What is the purpose of your trip to the United States?',
      'How long do you plan to stay?',
      'Where will you be staying?',
      'Who is paying for your trip?',
      'What do you do for work in Brazil?',
      'Do you have family or friends in the United States?',
      'Have you traveled to other countries before?',
      'What ties do you have to Brazil that will ensure your return?'
    ]
  },
  {
    id: 'f1-student',
    name: 'Estudante - Graduação',
    description: 'Entrevista para visto de estudante F1 para curso de graduação.',
    visaType: 'F1',
    difficulty: 'Intermediário',
    questions: [
      'Why do you want to study in the United States?',
      'Why did you choose this particular university?',
      'What will you study and why?',
      'How will you pay for your education?',
      'What are your plans after graduation?',
      'Why didn\'t you choose to study this in Brazil?',
      'How does this degree fit with your career goals?',
      'Do you have any relatives in the United States?'
    ]
  },
  {
    id: 'h1b-work',
    name: 'Trabalho - H1B',
    description: 'Entrevista para visto de trabalho H1B para profissional especializado.',
    visaType: 'H1B',
    difficulty: 'Avançado',
    questions: [
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
];

export default function Treinamento() {
  const [selectedScenario, setSelectedScenario] = useState<InterviewScenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const startInterview = (scenario: InterviewScenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        id: '1',
        role: 'system',
        content: `Iniciando simulação de entrevista para visto ${scenario.visaType}. Responda em inglês como se estivesse na entrevista real.`,
        timestamp: new Date()
      },
      {
        id: '2',
        role: 'ai',
        content: `Good morning! Please have a seat. I'll be conducting your visa interview today. Let's start with the first question: ${scenario.questions[0]}`,
        timestamp: new Date()
      }
    ]);
    setCurrentQuestionIndex(0);
    setInterviewStarted(true);
  };

  const sendMessage = async () => {
    if (!currentInput.trim() || !selectedScenario) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    // Simular resposta da IA
    setTimeout(() => {
      let aiResponse = '';
      
      // Feedback básico baseado na resposta
      if (currentInput.length < 20) {
        aiResponse = "Your answer seems quite brief. In a real interview, try to provide more detailed responses. ";
      } else if (currentInput.length > 200) {
        aiResponse = "Good detail, but try to be more concise. Consular officers appreciate clear, direct answers. ";
      } else {
        aiResponse = "Good response. ";
      }

      // Próxima pergunta ou finalização
      if (currentQuestionIndex < selectedScenario.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        aiResponse += `Let's move to the next question: ${selectedScenario.questions[nextIndex]}`;
      } else {
        aiResponse += "Thank you, that concludes our interview simulation. Here's your feedback: You provided answers to all questions. In a real interview, remember to be confident, honest, and concise. Practice speaking clearly and maintain eye contact.";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const resetInterview = () => {
    setSelectedScenario(null);
    setMessages([]);
    setCurrentInput('');
    setCurrentQuestionIndex(0);
    setInterviewStarted(false);
  };

  if (selectedScenario && interviewStarted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedScenario.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Pergunta {currentQuestionIndex + 1} de {selectedScenario.questions.length}
                  </p>
                </div>
                <Button variant="outline" onClick={resetInterview}>
                  Finalizar Treino
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / selectedScenario.questions.length) * 100}%` }}
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
                          <span className="text-xs text-gray-500">Consular Officer</span>
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
                        Consular Officer is typing...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your answer in English..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!currentInput.trim() || isLoading}
                  >
                    Send
                  </Button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  💡 Dica: Responda em inglês como se estivesse em uma entrevista real. Seja claro, conciso e honesto.
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
              Treinamento com IA
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pratique entrevistas de visto com nossa inteligência artificial. 
              Receba feedback personalizado e melhore suas chances de aprovação.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189 6.01 6.01 0 001.5.189 2.25 2.25 0 013.75 1.689 18.64 18.64 0 01-7.499 4.5 18.64 18.64 0 01-7.499-4.5 2.25 2.25 0 013.75-1.689V12.75a6.01 6.01 0 001.5.189z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">IA Avançada</h3>
              <p className="text-gray-600">
                Nossa IA simula entrevistas reais com perguntas personalizadas para cada tipo de visto.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback Instantâneo</h3>
              <p className="text-gray-600">
                Receba análise detalhada das suas respostas e dicas para melhorar sua performance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-2.25m2.25 0l.5 1.5m.5-1.5l1 1.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cenários Reais</h3>
              <p className="text-gray-600">
                Pratique com cenários baseados em entrevistas reais de diferentes tipos de visto.
              </p>
            </div>
          </div>

          {/* Scenarios */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Escolha seu Cenário de Treino
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {scenario.name}
                    </h3>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {scenario.visaType}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        scenario.difficulty === 'Iniciante' 
                          ? 'bg-green-100 text-green-800'
                          : scenario.difficulty === 'Intermediário'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {scenario.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {scenario.description}
                  </p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      {scenario.questions.length} perguntas
                    </p>
                    <div className="text-xs text-gray-400">
                      Duração estimada: {Math.ceil(scenario.questions.length * 2)} minutos
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => startInterview(scenario)}
                  >
                    Iniciar Treino
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Dicas para uma Entrevista de Sucesso
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Antes da Entrevista:</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Pratique suas respostas em inglês</li>
                  <li>• Organize todos os documentos necessários</li>
                  <li>• Vista-se profissionalmente</li>
                  <li>• Chegue com antecedência</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Durante a Entrevista:</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Seja honesto e direto</li>
                  <li>• Mantenha contato visual</li>
                  <li>• Responda apenas o que foi perguntado</li>
                  <li>• Demonstre confiança e calma</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
