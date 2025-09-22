import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/Button';

interface RealtimeAudioRecorderProps {
  isConnected: boolean;
  language: 'pt' | 'en';
  onAudioData: (audioData: ArrayBuffer) => void;
  onCommitAudio: () => void;
  currentInput: string;
  onSendMessage: () => void;
  isLoading: boolean;
}

export function RealtimeAudioRecorder({
  isConnected,
  language,
  onAudioData,
  onCommitAudio,
  currentInput,
  onSendMessage,
  isLoading
}: RealtimeAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    if (!isConnected) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000, // OpenAI Realtime requer 24kHz
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      streamRef.current = stream;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        if (isConnected && isRecording) {
          const inputData = event.inputBuffer.getChannelData(0);
          
          // Converter para PCM16
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          
          // Enviar para WebSocket
          onAudioData(pcm16.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      setIsRecording(true);
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  }, [isConnected, isRecording, onAudioData]);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Finalizar entrada de áudio no WebSocket
    if (isConnected) {
      onCommitAudio();
    }
    
    setIsRecording(false);
  }, [isConnected, onCommitAudio]);

  return (
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
              disabled={isLoading || !isConnected}
            >
              🎤 {language === 'pt' ? 'Pressione para Falar' : 'Press to Speak'}
              {isConnected && <span className="ml-1">⚡</span>}
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full animate-pulse"
            >
              ⏹️ {language === 'pt' ? 'Parar Gravação' : 'Stop Recording'}
              <span className="ml-1">⚡</span>
            </Button>
          )}
        </div>
        
        {currentInput && (
          <Button 
            onClick={onSendMessage} 
            disabled={isLoading || !isConnected}
          >
            {language === 'pt' ? 'Enviar' : 'Send'}
          </Button>
        )}
      </div>

      {!isConnected && (
        <div className="text-center text-sm text-red-600">
          {language === 'pt' 
            ? '⚠️ Aguardando conexão com IA em tempo real...'
            : '⚠️ Waiting for real-time AI connection...'
          }
        </div>
      )}
    </div>
  );
}