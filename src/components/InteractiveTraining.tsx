import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';

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

type InteractionMode = 'text' | 'voice';

interface InteractiveTrainingProps {
  scenario: InterviewScenario;
  language: 'pt' | 'en';
  interactionMode: InteractionMode;
  currentQuestionIndex: number;
  onMessageSaved: (message: Message) => Promise<void>;
  onQuestionIndexChange: (index: number) => void;
  onInteractionModeChange: (mode: InteractionMode) => void;
}

export function InteractiveTraining({
  scenario,
  language,
  interactionMode,
  currentQuestionIndex,
  onMessageSaved,
  onQuestionIndexChange,
  onInteractionModeChange
}: InteractiveTrainingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus no input quando mudar para modo texto
  useEffect(() => {
    if (interactionMode === 'text' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [interactionMode]);

  // Timer para gravação
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Enviar mensagem de texto
  const sendTextMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
      isVoice: false
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentInput;
    setCurrentInput('');
    setIsLoading(true);
    setIsTyping(true);

    await onMessageSaved(userMessage);
    await sendHttpMessage(messageToSend);
  };

  // Enviar mensagem via HTTP
  const sendHttpMessage = async (message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          scenario,
          language,
          questionIndex: currentQuestionIndex,
          context: messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        // Simular digitação da IA
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'ai',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        await onMessageSaved(aiMessage);

        if (data.nextQuestionIndex !== undefined) {
          onQuestionIndexChange(data.nextQuestionIndex);
        }

        if (interactionMode === 'voice') {
          await synthesizeSpeech(data.response);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Síntese de voz
  const synthesizeSpeech = async (text: string) => {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language
        }),
      });

      const data = await response.json();
      
      if (data.audio) {
        const audioData = `data:${data.mimeType};base64,${data.audio}`;
        const audio = new Audio(audioData);
        audio.play();
      }
    } catch (error) {
      console.error('Erro na síntese de voz:', error);
    }
  };

  // Iniciar gravação
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  }, []);

  // Parar gravação
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Processar áudio
  const processAudio = async () => {
    if (!audioBlob) return;

    setIsLoading(true);
    setIsTyping(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const transcriptionResponse = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioBase64: base64Audio
          }),
        });

        const transcriptionData = await transcriptionResponse.json();
        
        if (transcriptionData.transcription) {
          const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: transcriptionData.transcription,
            timestamp: new Date(),
            isVoice: true
          };

          setMessages(prev => [...prev, userMessage]);
          await onMessageSaved(userMessage);
          await sendHttpMessage(transcriptionData.transcription);
        }
      } catch (error) {
        console.error('Erro ao processar áudio:', error);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
        setAudioBlob(null);
      }
    };
    
    reader.readAsDataURL(audioBlob);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = () => {
    switch (scenario.difficulty) {
      case 'Iniciante': return 'from-green-400 to-emerald-500';
      case 'Intermediário': return 'from-yellow-400 to-orange-500';
      case 'Avançado': return 'from-red-400 to-pink-500';
      default: return 'from-blue-400 to-indigo-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com informações do cenário */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${getDifficultyColor()}`}></div>
          
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getDifficultyColor()} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {scenario.visaType.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{scenario.name}</h1>
                    <p className="text-gray-600">{scenario.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-white font-medium bg-gradient-to-r ${getDifficultyColor()}`}>
                    {scenario.difficulty}
                  </span>
                  <span className="text-blue-600 font-medium">{scenario.visaType}</span>
                  <span className="text-gray-500">
                    {currentQuestionIndex + 1} / {scenario.questions[language].length}
                  </span>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="bg-gray-100 rounded-2xl p-2 flex gap-2">
                <button
                  onClick={() => onInteractionModeChange('text')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    interactionMode === 'text'
                      ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">📝</span>
                  {language === 'pt' ? 'Texto' : 'Text'}
                </button>
                <button
                  onClick={() => onInteractionModeChange('voice')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    interactionMode === 'voice'
                      ? 'bg-white text-green-600 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🎤</span>
                  {language === 'pt' ? 'Voz' : 'Voice'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 lg:h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'pt' ? 'Vamos começar!' : "Let's begin!"}
                </h3>
                <p className="text-gray-600">
                  {language === 'pt' 
                    ? 'Responda às perguntas como se estivesse em uma entrevista real.'
                    : 'Answer the questions as if you were in a real interview.'
                  }
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div className={`max-w-xs lg:max-w-md relative group`}>
                  {message.role === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                  )}
                  
                  <div
                    className={`px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto'
                        : message.isThinking
                        ? 'bg-gray-100 text-gray-600 italic border border-gray-200'
                        : 'bg-white text-gray-900 border border-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.isVoice && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
                          <span className="text-xs opacity-70">🎤</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-xs lg:max-w-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div className="bg-white text-gray-600 px-6 py-4 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm italic">
                        {language === 'pt' ? 'Analisando resposta...' : 'Analyzing response...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-6">
            {interactionMode === 'text' ? (
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendTextMessage()}
                      placeholder={language === 'pt' 
                        ? "Digite sua resposta..." 
                        : "Type your answer..."
                      }
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
                      disabled={isLoading}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>
                  <Button 
                    onClick={sendTextMessage} 
                    disabled={!currentInput.trim() || isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="mr-2">✈️</span>
                        {language === 'pt' ? 'Enviar' : 'Send'}
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">💡</span>
                  {language === 'pt' 
                    ? 'Pressione Enter para enviar ou clique no botão'
                    : 'Press Enter to send or click the button'
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {audioBlob ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg">🎵</span>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="font-semibold text-green-800 mb-1">
                          {language === 'pt' ? 'Áudio gravado!' : 'Audio recorded!'}
                        </p>
                        <p className="text-sm text-green-600">
                          {language === 'pt' ? 'Clique para enviar ou grave novamente' : 'Click to send or record again'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-4 mt-4">
                      <Button 
                        onClick={processAudio} 
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span className="mr-2">🚀</span>
                            {language === 'pt' ? 'Enviar Áudio' : 'Send Audio'}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setAudioBlob(null)}
                        className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-medium transition-all duration-300"
                      >
                        <span className="mr-2">🗑️</span>
                        {language === 'pt' ? 'Cancelar' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-6">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isLoading}
                        className={`relative w-24 h-24 rounded-full font-bold text-white shadow-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isRecording 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                        }`}
                      >
                        <span className="text-3xl">
                          {isRecording ? '⏹️' : '🎤'}
                        </span>
                        
                        {isRecording && (
                          <div className="absolute -inset-2 border-4 border-red-300 rounded-full animate-ping"></div>
                        )}
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-900">
                        {isRecording 
                          ? (language === 'pt' ? 'Gravando...' : 'Recording...')
                          : (language === 'pt' ? 'Clique para gravar' : 'Click to record')
                        }
                      </p>
                      
                      {isRecording && (
                        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full inline-block font-mono text-lg">
                          {formatTime(recordingTime)}
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500">
                        {language === 'pt' 
                          ? 'Grave sua resposta em áudio e nossa IA irá processar'
                          : 'Record your audio response and our AI will process it'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// CSS personalizado para animações
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out;
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;