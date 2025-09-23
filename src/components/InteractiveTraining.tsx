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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


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

    await onMessageSaved(userMessage);

    // Enviar via HTTP API tradicional
    await sendHttpMessage(messageToSend);
  };

  // Enviar mensagem via HTTP (fallback para texto e voz)
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
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'ai',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        await onMessageSaved(aiMessage);

        // Atualizar índice da pergunta se necessário
        if (data.nextQuestionIndex !== undefined) {
          onQuestionIndexChange(data.nextQuestionIndex);
        }

        // Se for modo voz, sintetizar resposta
        if (interactionMode === 'voice') {
          await synthesizeSpeech(data.response);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
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

  // Iniciar gravação de áudio
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

  // Parar gravação de áudio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Processar áudio gravado
  const processAudio = async () => {
    if (!audioBlob) return;

    setIsLoading(true);
    
    // Converter blob para base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Transcrever áudio via HTTP
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
          // Criar mensagem do usuário com transcrição
          const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: transcriptionData.transcription,
            timestamp: new Date(),
            isVoice: true
          };

          setMessages(prev => [...prev, userMessage]);
          await onMessageSaved(userMessage);

          // Enviar para processar resposta
          await sendHttpMessage(transcriptionData.transcription);
        }
      } catch (error) {
        console.error('Erro ao processar áudio:', error);
      } finally {
        setIsLoading(false);
        setAudioBlob(null);
      }
    };
    
    reader.readAsDataURL(audioBlob);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Botão para alternar modo */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-center space-x-2">
          <Button
            variant={(interactionMode as InteractionMode) === 'text' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onInteractionModeChange('text')}
          >
            📝 {language === 'pt' ? 'Texto' : 'Text'}
          </Button>
          <Button
            variant={(interactionMode as InteractionMode) === 'voice' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onInteractionModeChange('voice')}
          >
            🎤 {language === 'pt' ? 'Voz' : 'Voice'}
          </Button>
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isThinking
                  ? 'bg-gray-100 text-gray-600 italic'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.isVoice && (
                  <span className="text-xs opacity-70">🎤</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm italic">
                  {language === 'pt' ? 'Processando...' : 'Processing...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="border-t p-4">
        {interactionMode === 'text' ? (
          <div className="flex space-x-4">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder={language === 'pt' 
                ? "Digite sua resposta..." 
                : "Type your answer..."
              }
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isLoading}
            />
            <Button 
              onClick={sendTextMessage} 
              disabled={!currentInput.trim() || isLoading}
            >
              {language === 'pt' ? 'Enviar' : 'Send'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {audioBlob ? (
              <div className="flex items-center space-x-4">
                <Button onClick={processAudio} disabled={isLoading}>
                  {language === 'pt' ? 'Enviar Áudio' : 'Send Audio'}
                </Button>
                <Button variant="outline" onClick={() => setAudioBlob(null)}>
                  {language === 'pt' ? 'Cancelar' : 'Cancel'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-8 py-4 rounded-full ${
                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isLoading}
                >
                  {isRecording ? '⏹️' : '🎤'} {' '}
                  {isRecording 
                    ? (language === 'pt' ? 'Parar Gravação' : 'Stop Recording')
                    : (language === 'pt' ? 'Gravar Resposta' : 'Record Answer')
                  }
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500">
          💡 {language === 'pt' 
            ? `Modo ${interactionMode === 'text' ? 'Texto' : 'Voz'}: ${
                interactionMode === 'text' ? 'Digite suas respostas' :
                'Grave suas respostas em áudio'
              }`
            : `${interactionMode === 'text' ? 'Text' : 'Voice'} Mode: ${
                interactionMode === 'text' ? 'Type your answers' :
                'Record your audio answers'
              }`
          }
        </div>
      </div>
    </div>
  );
}