interface RealtimeConnectionStatusProps {
    isConnected: boolean;
    isConnecting: boolean;
    language: 'pt' | 'en';
  }
  
  export function RealtimeConnectionStatus({
    isConnected,
    isConnecting,
    language
  }: RealtimeConnectionStatusProps) {
    if (isConnecting) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
            <p className="text-yellow-700 text-sm">
              {language === 'pt' 
                ? 'Conectando à IA em tempo real...' 
                : 'Connecting to real-time AI...'
              }
            </p>
          </div>
        </div>
      );
    }
  
    if (isConnected) {
      return (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex items-center">
            <div className="text-green-400 mr-3">⚡</div>
            <p className="text-green-700 text-sm font-medium">
              {language === 'pt' 
                ? 'IA em tempo real conectada - Conversação instantânea ativa' 
                : 'Real-time AI connected - Instant conversation active'
              }
            </p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex items-center">
          <div className="text-red-400 mr-3">⚠️</div>
          <p className="text-red-700 text-sm">
            {language === 'pt' 
              ? 'Conexão com IA em tempo real perdida - Usando modo texto como backup' 
              : 'Real-time AI connection lost - Using text mode as backup'
            }
          </p>
        </div>
      </div>
    );
  }