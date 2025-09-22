import { useState, useRef, useCallback, useEffect } from 'react';

interface RealtimeMessage {
  type: string;
  [key: string]: any;
}

interface UseRealtimeChatProps {
  scenario: {
    id: string;
    name: string;
    visaType: string;
    difficulty: string;
    questions: {
      pt: string[];
      en: string[];
    };
  } | null;
  language: 'pt' | 'en';
  questionIndex: number;
  onMessage?: (message: any) => void;
  onAudioReceived?: (audioData: ArrayBuffer) => void;
  onTranscriptionReceived?: (text: string) => void;
}

export function useRealtimeChat({
  scenario,
  language,
  questionIndex,
  onMessage,
  onAudioReceived,
  onTranscriptionReceived
}: UseRealtimeChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Conectar ao WebSocket
  const connect = useCallback(async () => {
    if (!scenario || isConnecting || isConnected) return;

    setIsConnecting(true);

    try {
      // Usar WebSocket através do servidor Next.js
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/api/realtime-websocket`;
      
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Realtime proxy");
        setIsConnected(true);
        setIsConnecting(false);

        // Enviar configuração da sessão
        const sessionConfig = {
          type: "init_session",
          scenario,
          language,
          questionIndex
        };

        ws.send(JSON.stringify(sessionConfig));
      };

      ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          
          // Processar diferentes tipos de mensagem
          switch (message.type) {
            case 'session.created':
              console.log('Session created:', message);
              break;
              
            case 'session.updated':
              console.log('Session updated:', message);
              break;
              
            case 'conversation.item.input_audio_transcription.completed':
              if (onTranscriptionReceived && message.transcript) {
                onTranscriptionReceived(message.transcript);
              }
              break;
              
            case 'response.audio.delta':
              if (onAudioReceived && message.delta) {
                // Converter base64 para ArrayBuffer
                const binaryString = atob(message.delta);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                onAudioReceived(bytes.buffer);
              }
              break;
              
            case 'response.text.delta':
              if (onMessage && message.delta) {
                onMessage({
                  type: 'text_delta',
                  content: message.delta
                });
              }
              break;
              
            case 'response.done':
              if (onMessage) {
                onMessage({
                  type: 'response_done',
                  response: message.response
                });
              }
              break;
              
            case 'error':
              console.error('Realtime API error:', message);
              break;
              
            default:
              console.log('Unhandled message type:', message.type, message);
          }
          
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Error connecting to Realtime API:', error);
      setIsConnecting(false);
    }
  }, [scenario, language, questionIndex, onMessage, onAudioReceived, onTranscriptionReceived, isConnecting, isConnected]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Enviar mensagem de texto
  const sendTextMessage = useCallback((text: string) => {
    if (!wsRef.current || !isConnected) return;

    const message = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: text
          }
        ]
      }
    };

    wsRef.current.send(JSON.stringify(message));

    // Solicitar resposta
    const responseMessage = {
      type: "response.create"
    };

    wsRef.current.send(JSON.stringify(responseMessage));
  }, [isConnected]);

  // Enviar áudio
  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (!wsRef.current || !isConnected) return;

    // Converter ArrayBuffer para base64
    const bytes = new Uint8Array(audioData);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);

    const message = {
      type: "input_audio_buffer.append",
      audio: base64Audio
    };

    wsRef.current.send(JSON.stringify(message));
  }, [isConnected]);

  // Finalizar entrada de áudio
  const commitAudio = useCallback(() => {
    if (!wsRef.current || !isConnected) return;

    const message = {
      type: "input_audio_buffer.commit"
    };

    wsRef.current.send(JSON.stringify(message));

    // Solicitar resposta
    const responseMessage = {
      type: "response.create"
    };

    wsRef.current.send(JSON.stringify(responseMessage));
  }, [isConnected]);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendTextMessage,
    sendAudio,
    commitAudio
  };
}