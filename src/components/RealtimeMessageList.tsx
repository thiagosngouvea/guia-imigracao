interface Message {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
    isVoice?: boolean;
    isThinking?: boolean;
    audioData?: string;
  }
  
  interface RealtimeMessageListProps {
    messages: Message[];
    language: 'pt' | 'en';
    isLoading: boolean;
    interactionMode: 'text' | 'voice';
  }
  
  export function RealtimeMessageList({
    messages,
    language,
    isLoading,
    interactionMode
  }: RealtimeMessageListProps) {
    const playAudioFromBase64 = async (audioBase64: string) => {
      try {
        const audioData = atob(audioBase64);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
        
      } catch (error) {
        console.error('Erro ao reproduzir áudio:', error);
      }
    };
  
    return (
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
                  : message.isThinking
                  ? 'bg-gray-200 text-gray-600 italic'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'ai' && !message.isThinking && (
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">CO</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {language === 'pt' ? 'Oficial Consular' : 'Consular Officer'}
                  </span>
                  <span className="ml-1 text-xs text-green-600">⚡</span>
                  {message.audioData && (
                    <button
                      onClick={() => playAudioFromBase64(message.audioData!)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      🔊
                    </button>
                  )}
                </div>
              )}
              
              {message.isThinking && (
                <div className="flex items-center mb-1">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-xs text-gray-500">
                    {language === 'pt' ? 'Oficial Consular' : 'Consular Officer'}
                  </span>
                  <span className="ml-1 text-xs text-blue-600">⚡</span>
                </div>
              )}
              
              {message.role === 'user' && message.isVoice && (
                <div className="flex items-center mb-1">
                  <span className="text-xs opacity-75">🎤 Mensagem de voz</span>
                  <span className="ml-1 text-xs text-green-400">⚡</span>
                </div>
              )}
              
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && interactionMode === 'text' && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                {language === 'pt' ? 'Oficial Consular está digitando...' : 'Consular Officer is typing...'}
                <span className="ml-1 text-xs text-blue-600">⚡</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }