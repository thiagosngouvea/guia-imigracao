import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import { RealtimeAudioRecorder } from './RealtimeAudioRecorder';
import { RealtimeMessageList } from './RealtimeMessageList';
import { RealtimeConnectionStatus } from './RealtimeConnectionStatus';

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

interface RealtimeChatProps {
  scenario: InterviewScenario;
  language: 'pt' | 'en';
  interactionMode: 'text' | 'voice';
  currentQuestionIndex: number;
  onMessageSaved: (message: Message) => Promise<void>;
  onQuestionIndexChange: (index: number) => void;
}

export function RealtimeChat({
  scenario,
  language,
  interactionMode,
  currentQuestionIndex,
  onMessageSaved,
  onQuestionIndexChange
}: RealtimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook para WebSocket Realtime
  const {
    isConnected: isRealtimeConnected,
    isConnecting: isRealtimeConnecting,
    connect: connectRealtime,
    disconnect: disconnectRealtime,
    sendTextMessage: sendRealtimeText,
    sendAudio: sendRealtimeAudio,
    commitAudio: commitRealtimeAudio
  } = useRealtimeChat({
    scenario,
    language,
    questionIndex: currentQuestionIndex,
    onMessage: handleRealtimeMessage,
    onAudioReceived: handleRealtimeAudio,
    onTranscriptionReceived: handleRealtimeTranscription
  });

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Conectar automaticamente quando o componente monta
  useEffect(() => {
    connectRealtime();
    
    return () => {
      disconnectRealtime();
    };
  }, [connectRealtime, disconnectRealtime]);

  // Handlers para WebSocket Realtime
  function handleRealtimeMessage(message: any) {
    console.log('Realtime message:', message);
    
    if (message.type === 'text_delta') {
      // Atualizar mensagem em tempo real
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'ai' && lastMessage.isThinking) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: (lastMessage.content || '') + message.content,
              isThinking: false
            }
          ];
        } else {
          // Criar nova mensagem da IA
          const newMessage: Message = {
            id: Date.now().toString(),
            role: 'ai',
            content: message.content,
            timestamp: new Date(),
            isThinking: false
          };
          return [...prev, newMessage];
        }
      });
    }
    
    if (message.type === 'response_done') {
      setIsLoading(false);
      // Salvar mensagem final
      const finalMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: message.response?.output?.[0]?.content?.[0]?.text || '',
        timestamp: new Date()
      };
      onMessageSaved(finalMessage);
    }
  }

  function handleRealtimeAudio(audioData: ArrayBuffer) {
    // Este será tratado pelo componente RealtimeAudioRecorder
  }

  function handleRealtimeTranscription(text: string) {
    // Mostrar transcrição em tempo real
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      isVoice: true
    };

    setMessages(prev => [...prev, userMessage]);
    onMessageSaved(userMessage);
    
    // Mostrar que a IA está processando
    const thinkingMessage: Message = {
      id: 'thinking-' + Date.now().toString(),
      role: 'ai',
      content: language === 'pt' 
        ? 'O oficial consular está analisando sua resposta...' 
        : 'The consular officer is analyzing your response...',
      timestamp: new Date(),
      isThinking: true
    };

    setMessages(prev => [...prev, thinkingMessage]);
    setIsLoading(true);
  }

  // Enviar mensagem de texto
  const sendMessage = async () => {
    if (!currentInput.trim() || !isRealtimeConnected) return;

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
    
    // Salvar mensagem do usuário
    await onMessageSaved(userMessage);
    
    // Enviar via WebSocket
    sendRealtimeText(messageToSend);
    
    // Mostrar que a IA está processando
    const thinkingMessage: Message = {
      id: 'thinking-' + Date.now().toString(),
      role: 'ai',
      content: language === 'pt' 
        ? 'O oficial consular está analisando sua resposta...' 
        : 'The consular officer is analyzing your response...',
      timestamp: new Date(),
      isThinking: true
    };

    setMessages(prev => [...prev, thinkingMessage]);
    setIsLoading(true);
  };

  // Inicializar chat com mensagens iniciais
  const initializeChat = (initialMessages: Message[]) => {
    setMessages(initialMessages);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Status da Conexão */}
      <RealtimeConnectionStatus
        isConnected={isRealtimeConnected}
        isConnecting={isRealtimeConnecting}
        language={language}
      />

      {/* Lista de Mensagens */}
      <RealtimeMessageList
        messages={messages}
        language={language}
        isLoading={isLoading}
        interactionMode={interactionMode}
      />
      
      <div ref={messagesEndRef} />

      {/* Input de Mensagem */}
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
              disabled={isLoading || !isRealtimeConnected}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!currentInput.trim() || isLoading || !isRealtimeConnected}
            >
              {language === 'pt' ? 'Enviar' : 'Send'}
            </Button>
          </div>
        ) : (
          <RealtimeAudioRecorder
            isConnected={isRealtimeConnected}
            language={language}
            onAudioData={sendRealtimeAudio}
            onCommitAudio={commitRealtimeAudio}
            currentInput={currentInput}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        )}
        
        <div className="mt-2 text-xs text-gray-500">
          💡 {language === 'pt' 
            ? 'Dica: Responda como se estivesse em uma entrevista real. Seja claro, conciso e honesto.'
            : 'Tip: Answer as if you were in a real interview. Be clear, concise and honest.'
          }
          {!isRealtimeConnected && (
            <span className="text-red-500 ml-2">
              {language === 'pt' 
                ? '⚠️ Conexão perdida - reconectando...'
                : '⚠️ Connection lost - reconnecting...'
              }
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
