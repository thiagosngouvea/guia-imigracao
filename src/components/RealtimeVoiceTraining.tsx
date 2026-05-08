import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type RealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'ai-speaking'
  | 'error'
  | 'ended';

interface TranscriptLine {
  id: string;
  role: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
}

interface InterviewScenario {
  id: string;
  name: string;
  description: string;
  visaType: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  questions: { pt: string[]; en: string[] };
}

interface RealtimeVoiceTrainingProps {
  scenario: InterviewScenario;
  language: 'pt' | 'en';
  onEnd: () => void;
  onTranscriptLine?: (role: 'user' | 'ai', text: string) => void;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RealtimeStatus, { label: string; color: string; pulse: boolean }> = {
  idle:        { label: 'Pronto',         color: '#64748b', pulse: false },
  connecting:  { label: 'Conectando…',    color: '#f59e0b', pulse: true  },
  connected:   { label: 'Conectado',      color: '#10b981', pulse: false },
  listening:   { label: 'Ouvindo…',       color: '#3b82f6', pulse: true  },
  'ai-speaking': { label: 'IA falando…', color: '#8b5cf6', pulse: true  },
  error:       { label: 'Erro',           color: '#ef4444', pulse: false },
  ended:       { label: 'Encerrado',      color: '#64748b', pulse: false },
};

// ─── Animated Orb ─────────────────────────────────────────────────────────────

function VoiceOrb({ status }: { status: RealtimeStatus }) {
  const isActive = status === 'listening' || status === 'ai-speaking';
  const isConnecting = status === 'connecting';

  const colors = {
    idle:          ['#334155', '#1e293b'],
    connecting:    ['#f59e0b', '#d97706'],
    connected:     ['#10b981', '#059669'],
    listening:     ['#3b82f6', '#2563eb'],
    'ai-speaking': ['#8b5cf6', '#7c3aed'],
    error:         ['#ef4444', '#dc2626'],
    ended:         ['#334155', '#1e293b'],
  };

  const [c1, c2] = colors[status];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Outer rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 200 + i * 40,
            height: 200 + i * 40,
            borderColor: c1,
            opacity: isActive ? 0.15 / i : isConnecting ? 0.1 / i : 0.04,
            animation: isActive ? `ping ${0.8 + i * 0.3}s cubic-bezier(0,0,0.2,1) infinite` : 'none',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}

      {/* Inner glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          background: `radial-gradient(circle, ${c1}22 0%, transparent 70%)`,
          animation: isActive ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
      />

      {/* Main orb */}
      <div
        className="relative flex items-center justify-center rounded-full shadow-2xl"
        style={{
          width: 160,
          height: 160,
          background: `radial-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
          boxShadow: `0 0 60px ${c1}55, 0 0 120px ${c1}22`,
          transition: 'background 0.5s ease, box-shadow 0.5s ease',
        }}
      >
        {/* Waveform bars inside orb */}
        {status === 'listening' && (
          <div className="flex items-center gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="rounded-full bg-white"
                style={{
                  width: 4,
                  animation: `waveBar 0.6s ease-in-out infinite`,
                  animationDelay: `${i * 0.08}s`,
                  minHeight: 6,
                }}
              />
            ))}
          </div>
        )}

        {status === 'ai-speaking' && (
          <div className="flex items-center gap-1">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="rounded-full bg-white"
                style={{
                  width: 3,
                  animation: `waveBar ${0.4 + (i % 3) * 0.1}s ease-in-out infinite`,
                  animationDelay: `${i * 0.06}s`,
                  minHeight: 4,
                }}
              />
            ))}
          </div>
        )}

        {status === 'connecting' && (
          <div
            className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        )}

        {(status === 'connected' || status === 'idle' || status === 'ended') && (
          <span className="text-5xl select-none">
            {status === 'ended' ? '✅' : '🎙️'}
          </span>
        )}

        {status === 'error' && <span className="text-5xl">⚠️</span>}
      </div>
    </div>
  );
}

// ─── Transcript Panel ─────────────────────────────────────────────────────────

function TranscriptPanel({
  lines,
  language,
}: {
  lines: TranscriptLine[];
  language: 'pt' | 'en';
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  if (lines.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
        {language === 'pt'
          ? 'A transcrição aparecerá aqui enquanto você conversa…'
          : 'Transcript will appear here as you speak…'}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      {lines.map((line) => (
        <div
          key={line.id}
          className={`flex gap-2 ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}
          style={{ animation: 'fadeInUp 0.3s ease-out' }}
        >
          {line.role === 'ai' && (
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs text-white shrink-0 mt-0.5">
              🤖
            </div>
          )}
          <div
            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              line.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700'
            }`}
          >
            {line.text}
            {line.isStreaming && (
              <span className="inline-block ml-1 animate-pulse text-white/50">▌</span>
            )}
          </div>
          {line.role === 'user' && (
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white shrink-0 mt-0.5">
              👤
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RealtimeVoiceTraining({
  scenario,
  language,
  onEnd,
  onTranscriptLine,
}: RealtimeVoiceTrainingProps) {
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiTranscriptIdRef = useRef<string | null>(null);

  // ── Session timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'connected' || status === 'listening' || status === 'ai-speaking') {
      timerRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ── DataChannel event handler ──────────────────────────────────────────────
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    let msg: Record<string, unknown>;
    try { msg = JSON.parse(event.data); } catch { return; }

    const type = msg.type as string;

    switch (type) {
      case 'session.created':
      case 'session.updated':
        setStatus('connected');
        break;

      case 'input_audio_buffer.speech_started':
        setStatus('listening');
        break;

      case 'input_audio_buffer.speech_stopped':
      case 'input_audio_buffer.committed':
        setStatus('connected');
        break;

      case 'response.created':
      case 'response.audio.delta':
        setStatus('ai-speaking');
        break;

      case 'response.audio.done':
      case 'response.done':
        setStatus('connected');
        // Finalize AI streaming transcript
        if (aiTranscriptIdRef.current) {
          setTranscript((prev) =>
            prev.map((l) =>
              l.id === aiTranscriptIdRef.current ? { ...l, isStreaming: false } : l
            )
          );
          aiTranscriptIdRef.current = null;
        }
        break;

      case 'response.audio_transcript.delta': {
        const delta = (msg.delta as string) || '';
        if (!aiTranscriptIdRef.current) {
          const id = `ai-${Date.now()}`;
          aiTranscriptIdRef.current = id;
          setTranscript((prev) => [
            ...prev,
            { id, role: 'ai', text: delta, isStreaming: true },
          ]);
        } else {
          setTranscript((prev) =>
            prev.map((l) =>
              l.id === aiTranscriptIdRef.current
                ? { ...l, text: l.text + delta }
                : l
            )
          );
        }
        break;
      }

      case 'response.audio_transcript.done': {
        const finalText = (msg.transcript as string) || '';
        if (finalText && onTranscriptLine) onTranscriptLine('ai', finalText);
        break;
      }

      case 'conversation.item.input_audio_transcription.completed': {
        const userText = (msg.transcript as string)?.trim() || '';
        if (userText) {
          setTranscript((prev) => [
            ...prev,
            { id: `user-${Date.now()}`, role: 'user', text: userText },
          ]);
          if (onTranscriptLine) onTranscriptLine('user', userText);
        }
        break;
      }

      case 'error': {
        const errMsg = ((msg.error as Record<string,unknown>)?.message as string) || 'Unknown error';
        console.error('Realtime API error:', errMsg);
        setErrorMsg(errMsg);
        setStatus('error');
        break;
      }
    }
  }, [onTranscriptLine]);

  // ── Connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    setStatus('connecting');
    setErrorMsg('');
    setTranscript([]);

    try {
      // 1. Get ephemeral token from our server
      const tokenRes = await fetch('/api/realtime-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, scenario }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.error || 'Failed to get session token');
      }

      const { clientSecret } = await tokenRes.json() as { clientSecret: string };

      // 2. Create peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3. Audio element for AI voice
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioEl.volume = 1;
      audioElRef.current = audioEl;
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };

      // 4. Capture microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 5. Data channel for events
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onmessage = handleDataChannelMessage;

      // 6. Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 7. Exchange SDP with OpenAI Realtime
      const sdpRes = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpRes.ok) {
        throw new Error(`SDP exchange failed: ${sdpRes.status}`);
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setErrorMsg(message);
      setStatus('error');
      cleanup();
    }
  }, [language, scenario, handleDataChannelMessage]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
      audioElRef.current = null;
    }
    dcRef.current = null;
    pcRef.current = null;
    localStreamRef.current = null;
  }, []);

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    cleanup();
    setStatus('ended');
    if (timerRef.current) clearInterval(timerRef.current);
  }, [cleanup]);

  // ── Auto-connect on mount ──────────────────────────────────────────────────
  useEffect(() => {
    connect();
    return () => { cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mute toggle ────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => { t.enabled = isMuted; });
    setIsMuted((m) => !m);
  }, [isMuted]);

  const cfg = STATUS_CONFIG[status];

  return (
    <>
      {/* ── CSS keyframes ── */}
      <style>{`
        @keyframes waveBar {
          0%, 100% { height: 8px; }
          50% { height: 40px; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Modo Realtime</p>
            <h1 className="text-white font-bold text-lg">{scenario.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Status pill */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: cfg.color,
                  animation: cfg.pulse ? 'pulse 1s ease-in-out infinite' : 'none',
                }}
              />
              <span className="text-xs font-semibold text-white/80">{cfg.label}</span>
            </div>
            {/* Timer */}
            {(status === 'connected' || status === 'listening' || status === 'ai-speaking') && (
              <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 font-mono text-xs text-white/70">
                {formatTime(sessionTime)}
              </div>
            )}
            {/* Visa badge */}
            <span className="bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
              {scenario.visaType}
            </span>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">

          {/* Left: Orb + Controls */}
          <div className="flex flex-col items-center justify-center gap-8 p-8 lg:w-1/2 border-r border-white/10">
            {/* Orb */}
            <VoiceOrb status={status} />

            {/* Status label */}
            <p
              className="text-lg font-semibold transition-all duration-500"
              style={{ color: cfg.color }}
            >
              {status === 'ended'
                ? (language === 'pt' ? 'Sessão encerrada' : 'Session ended')
                : status === 'error'
                ? (language === 'pt' ? 'Erro de conexão' : 'Connection error')
                : cfg.label}
            </p>

            {/* Error message */}
            {status === 'error' && errorMsg && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm px-5 py-3 rounded-xl max-w-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* Instruction */}
            {(status === 'connected' || status === 'listening' || status === 'ai-speaking') && (
              <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed">
                {status === 'listening'
                  ? (language === 'pt' ? 'Fale agora. A IA vai ouvir e responder automaticamente.' : 'Speak now. The AI will listen and respond automatically.')
                  : status === 'ai-speaking'
                  ? (language === 'pt' ? 'A IA está falando. Você pode interromper a qualquer momento.' : 'The AI is speaking. You can interrupt at any time.')
                  : (language === 'pt' ? 'Aguardando você falar…' : 'Waiting for you to speak…')
                }
              </p>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Mute button */}
              {(status === 'connected' || status === 'listening' || status === 'ai-speaking') && (
                <button
                  onClick={toggleMute}
                  className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border transition-all duration-200 ${
                    isMuted
                      ? 'bg-red-900/40 border-red-500/40 text-red-300 hover:bg-red-900/60'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{isMuted ? '🔇' : '🎤'}</span>
                  <span className="text-xs font-medium">
                    {isMuted
                      ? (language === 'pt' ? 'Mutar' : 'Muted')
                      : (language === 'pt' ? 'Microfone' : 'Mic on')
                    }
                  </span>
                </button>
              )}

              {/* End/Retry button */}
              {status === 'error' ? (
                <button
                  onClick={connect}
                  className="flex flex-col items-center gap-1.5 px-6 py-3 rounded-2xl bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:bg-amber-600/50 transition-all"
                >
                  <span className="text-xl">🔄</span>
                  <span className="text-xs font-medium">{language === 'pt' ? 'Tentar novamente' : 'Retry'}</span>
                </button>
              ) : status === 'ended' ? (
                <button
                  onClick={onEnd}
                  className="flex flex-col items-center gap-1.5 px-6 py-3 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:bg-blue-600/50 transition-all"
                >
                  <span className="text-xl">🏠</span>
                  <span className="text-xs font-medium">{language === 'pt' ? 'Voltar' : 'Back'}</span>
                </button>
              ) : (
                <button
                  onClick={() => { disconnect(); }}
                  className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl bg-red-900/30 border border-red-500/30 text-red-300 hover:bg-red-900/50 transition-all duration-200"
                >
                  <span className="text-xl">⏹️</span>
                  <span className="text-xs font-medium">{language === 'pt' ? 'Encerrar' : 'End'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Transcript */}
          <div className="flex flex-col lg:w-1/2 p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📝</span>
              <h2 className="text-white font-bold text-sm">
                {language === 'pt' ? 'Transcrição em Tempo Real' : 'Live Transcript'}
              </h2>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col bg-white/5 border border-white/10 rounded-2xl p-4">
              <TranscriptPanel lines={transcript} language={language} />
            </div>

            {/* Interview questions guide */}
            <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                {language === 'pt' ? 'Perguntas esperadas' : 'Expected questions'}
              </p>
              <div className="space-y-1.5">
                {scenario.questions[language].map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="shrink-0 text-slate-600 font-mono mt-0.5">{i + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
