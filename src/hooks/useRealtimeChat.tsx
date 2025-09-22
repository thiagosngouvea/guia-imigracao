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
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Conectar via WebRTC
  const connect = useCallback(async () => {
    if (!scenario || isConnecting || isConnected) {
      console.log('Connect cancelado - condições não atendidas');
      return;
    }

    setIsConnecting(true);

    try {
      console.log('🚀 Iniciando conexão WebRTC...');

      // Limpar conexão anterior se existir
      if (peerConnectionRef.current) {
        console.log('Fechando conexão anterior...');
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
        await new Promise(resolve => setTimeout(resolve, 200)); // Aguardar limpeza
      }

      // Criar nova conexão
      console.log('Criando RTCPeerConnection...');
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // pc.setConfiguration({
      //   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      // });

      console.log('pc:', pc);
      
      peerConnectionRef.current = pc;
      console.log('RTCPeerConnection criado, estado inicial:', pc.signalingState);

      // Configurar handlers de conexão
      pc.onconnectionstatechange = () => {
        console.log('Estado da conexão:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setIsConnected(false);
          setIsConnecting(false);
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('Estado ICE:', pc.iceConnectionState);
      };

      pc.onsignalingstatechange = () => {
        console.log('Estado de sinalização:', pc.signalingState);
      };

      // Configurar áudio
      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement('audio');
        audioElementRef.current.autoplay = true;
        audioElementRef.current.style.display = 'none';
        document.body.appendChild(audioElementRef.current);
      }

      pc.ontrack = (event) => {
        console.log('🎵 Track recebido:', event.track.kind);
        if (audioElementRef.current && event.streams[0]) {
          audioElementRef.current.srcObject = event.streams[0];
          if (onAudioReceived) {
            setTimeout(() => onAudioReceived(new ArrayBuffer(1024)), 100);
          }
        }
      };

      // Tentar capturar áudio do usuário
      try {
        console.log('🎤 Capturando áudio...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        stream.getTracks().forEach(track => {
          console.log('Adicionando track:', track.kind);
          pc.addTrack(track, stream);
        });
      } catch (audioError) {
        console.warn('Erro ao capturar áudio, continuando sem áudio:', audioError);
      }

      // Criar data channel IMEDIATAMENTE após configurar tracks
      console.log('📡 Criando data channel...');
      // const dc = pc.createDataChannel('oai-events', { ordered: true });
      const dc = pc.createDataChannel('oai-events');

      dc.send(JSON.stringify({
        type: "response.create",
        response: { modalities: ["text"] }
      }))
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log('✅ Data channel aberto');
      };

      dc.onclose = () => {
        console.log('❌ Data channel fechado');
        setIsConnected(false);
      };

      dc.onerror = (error) => {
        console.error('Erro no data channel:', error);
        setIsConnected(false);
        setIsConnecting(false);
      };

      dc.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          console.log('📨 Mensagem recebida:', message.type);
          handleRealtimeMessage(message);
        } catch (error) {
          console.error('Erro ao processar mensagem:', error);
        }
      };

      // Criar oferta
      console.log('📄 Criando oferta...');
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      // Aguardar ICE gathering
      console.log('🧊 Aguardando ICE candidates...');
      if (pc.iceGatheringState !== 'complete') {
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 3000);
          pc.addEventListener('icegatheringstatechange', () => {
            if (pc.iceGatheringState === 'complete') {
              clearTimeout(timeout);
              resolve();
            }
          });
        });
      }

      // Enviar para servidor
      console.log('🚀 Enviando para servidor...');
      const response = await fetch('/api/realtime-webrtc-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: pc.localDescription!.sdp,
          scenario,
          language,
          questionIndex
        })
      });

      console.log('🚀 Response:', response);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Erro do servidor: ${error.message}`);
      }

      const answerSdp = await response.text();
      console.log('📄 Recebido SDP de resposta');

      // Definir resposta remota
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      });

      console.log('✅ Conexão WebRTC configurada com sucesso!');

    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      setIsConnecting(false);
      setIsConnected(false);

      // Cleanup
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Tentar reconectar após 5 segundos
      if (scenario) {
        console.log('🔄 Tentando reconectar em 5 segundos...');
        setTimeout(() => {
          if (!isConnected && scenario) {
            connect();
          }
        }, 5000);
      }
    }
  }, [scenario, language, questionIndex, isConnecting, isConnected]);

  // Processar mensagens
  const handleRealtimeMessage = useCallback((message: RealtimeMessage) => {
    switch (message.type) {
      case 'session.created':
      case 'session.updated':
        console.log('Sessão configurada:', message.type);
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        if (onTranscriptionReceived && message.transcript) {
          onTranscriptionReceived(message.transcript);
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
        console.error('Erro da API:', message);
        if (onMessage) {
          onMessage({ type: 'error', error: message });
        }
        break;
    }
    
    if (onMessage) {
      onMessage(message);
    }
  }, [onMessage, onTranscriptionReceived]);

  // Desconectar
  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando...');
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      if (audioElementRef.current.parentNode) {
        audioElementRef.current.parentNode.removeChild(audioElementRef.current);
      }
      audioElementRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Enviar mensagem de texto
  const sendTextMessage = useCallback((text: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.warn('Data channel não disponível');
      return;
    }

    try {
      const event = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }]
        }
      };

      dataChannelRef.current.send(JSON.stringify(event));
      
      setTimeout(() => {
        if (dataChannelRef.current?.readyState === 'open') {
          dataChannelRef.current.send(JSON.stringify({ type: 'response.create' }));
        }
      }, 100);
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }, []);

  // Enviar áudio (automático)
  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    console.log('Áudio transmitido via WebRTC');
  }, []);

  // Commit áudio
  const commitAudio = useCallback(() => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') return;

    try {
      dataChannelRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.commit'
      }));
      
      setTimeout(() => {
        if (dataChannelRef.current?.readyState === 'open') {
          dataChannelRef.current.send(JSON.stringify({ type: 'response.create' }));
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao fazer commit do áudio:', error);
    }
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => disconnect();
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