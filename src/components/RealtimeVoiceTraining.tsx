import { useState, useEffect, useRef, useCallback } from 'react';
import type { FeedbackSection } from '../pages/api/realtime-feedback';

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
  idle:          { label: 'Pronto',       color: '#64748b', pulse: false },
  connecting:    { label: 'Conectando…',  color: '#f59e0b', pulse: true  },
  connected:     { label: 'Conectado',    color: '#10b981', pulse: false },
  listening:     { label: 'Ouvindo…',     color: '#3b82f6', pulse: true  },
  'ai-speaking': { label: 'IA falando…',  color: '#8b5cf6', pulse: true  },
  error:         { label: 'Erro',         color: '#ef4444', pulse: false },
  ended:         { label: 'Encerrado',    color: '#64748b', pulse: false },
};

// ─── Animated Orb ─────────────────────────────────────────────────────────────

function VoiceOrb({ status }: { status: RealtimeStatus }) {
  const isActive = status === 'listening' || status === 'ai-speaking';
  const isConnecting = status === 'connecting';

  const colors: Record<RealtimeStatus, [string, string]> = {
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

      <div
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          background: `radial-gradient(circle, ${c1}22 0%, transparent 70%)`,
          animation: isActive ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
      />

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
  const [feedback, setFeedback] = useState<FeedbackSection | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  // Keep a ref copy of transcript so disconnect() can read the latest value
  const transcriptRef = useRef<TranscriptLine[]>([]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiTranscriptIdRef = useRef<string | null>(null);

  // ── StrictMode guard ───────────────────────────────────────────────────────
  // Once set to true this ref is NEVER reset (not even by cleanup).
  // React 18 StrictMode mounts → unmounts → remounts in dev; without this
  // guard the second mount creates a second RTCPeerConnection causing duplicates.
  const hasConnectedRef = useRef(false);

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

      case 'input_audio_buffer.speech_started': {
        setStatus('listening');
        // Create a placeholder keyed by item_id so we can fill it in reliably
        // when Whisper finishes — keeping user text BEFORE the AI reply.
        const startItemId = msg.item_id as string;
        if (startItemId) {
          setTranscript((prev) => [
            ...prev,
            { id: `user-${startItemId}`, role: 'user', text: '', isStreaming: true },
          ]);
        }
        break;
      }

      case 'input_audio_buffer.speech_stopped':
      case 'input_audio_buffer.committed': {
        setStatus('connected');
        // While Whisper is working, show ellipsis so the bubble isn't empty.
        const stopItemId = msg.item_id as string;
        if (stopItemId) {
          setTranscript((prev) =>
            prev.map((l) =>
              l.id === `user-${stopItemId}` && l.text === ''
                ? { ...l, text: '…' }
                : l
            )
          );
        }
        break;
      }

      case 'response.created':
      case 'response.audio.delta':
        setStatus('ai-speaking');
        break;

      case 'response.audio.done':
      case 'response.done':
        setStatus('connected');
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
        const doneItemId = msg.item_id as string;
        if (userText) {
          const placeholderId = `user-${doneItemId}`;
          setTranscript((prev) => {
            const hasPlaceholder = prev.some((l) => l.id === placeholderId);
            if (hasPlaceholder) {
              // Update in-place — order stays correct (user before AI).
              return prev.map((l) =>
                l.id === placeholderId
                  ? { ...l, text: userText, isStreaming: false }
                  : l
              );
            }
            // Fallback: no placeholder (item_id missing), append.
            return [...prev, { id: `user-${Date.now()}`, role: 'user', text: userText }];
          });
          if (onTranscriptLine) onTranscriptLine('user', userText);
        }
        break;
      }

      case 'error': {
        const errMsg = ((msg.error as Record<string, unknown>)?.message as string) || 'Unknown error';
        console.error('Realtime API error:', errMsg);
        setErrorMsg(errMsg);
        setStatus('error');
        break;
      }
    }
  }, [onTranscriptLine]);

  // Keep transcriptRef in sync so disconnect() always sees latest lines
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

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

  // ── Connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    // One-shot guard: never connect more than once per component instance.
    // hasConnectedRef is never reset so StrictMode's second mount is blocked.
    if (hasConnectedRef.current) return;
    hasConnectedRef.current = true;

    setStatus('connecting');
    setErrorMsg('');
    setTranscript([]);

    try {
      // 1. Get ephemeral token
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

      // When the channel opens, trigger the AI to start the interview.
      // The session instructions already tell it to greet and ask the first question.
      dc.onopen = () => {
        dc.send(JSON.stringify({
          type: 'response.create',
          response: { modalities: ['text', 'audio'] },
        }));
      };

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

  // ── Disconnect + generate feedback ────────────────────────────────────────
  const disconnect = useCallback(async () => {
    const finalTranscript = transcriptRef.current;
    cleanup();
    setStatus('ended');
    if (timerRef.current) clearInterval(timerRef.current);

    // Generate feedback if there's enough conversation
    const meaningful = finalTranscript.filter((l) => l.text && l.text !== '…');
    if (meaningful.length < 2) return;

    setFeedbackLoading(true);
    try {
      const res = await fetch('/api/realtime-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: meaningful.map((l) => ({ role: l.role, text: l.text })),
          visaType: scenario.visaType,
          scenarioName: scenario.name,
          language,
        }),
      });
      if (res.ok) {
        const data = await res.json() as FeedbackSection;
        setFeedback(data);
      }
    } catch (e) {
      console.error('Feedback error:', e);
    } finally {
      setFeedbackLoading(false);
    }
  }, [cleanup, scenario, language]);

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

  // ── Verdict helpers ────────────────────────────────────────────────────────
  const verdictConfig = {
    aprovado:   { label: language === 'pt' ? 'Aprovado ✅' : 'Approved ✅',   bg: 'bg-emerald-900/40', border: 'border-emerald-500/40', text: 'text-emerald-300' },
    improvavel: { label: language === 'pt' ? 'Incerto ⚠️' : 'Uncertain ⚠️',  bg: 'bg-amber-900/40',   border: 'border-amber-500/40',   text: 'text-amber-300'   },
    reprovado:  { label: language === 'pt' ? 'Reprovado ❌' : 'Denied ❌',    bg: 'bg-red-900/40',     border: 'border-red-500/40',     text: 'text-red-300'     },
  };

  return (
    <>
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Modo Realtime</p>
            <h1 className="text-white font-bold text-lg">{scenario.name}</h1>
          </div>
          <div className="flex items-center gap-4">
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
            {(status === 'connected' || status === 'listening' || status === 'ai-speaking') && (
              <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 font-mono text-xs text-white/70">
                {formatTime(sessionTime)}
              </div>
            )}
            <span className="bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
              {scenario.visaType}
            </span>
          </div>
        </div>

        {/* ── Feedback Panel (shown after session ends) ── */}
        {status === 'ended' && (
          <div className="flex-1 overflow-y-auto p-6" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            {feedbackLoading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-400 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                <p className="text-slate-400 text-sm">{language === 'pt' ? 'Analisando sua entrevista…' : 'Analyzing your interview…'}</p>
              </div>
            )}

            {!feedbackLoading && !feedback && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <span className="text-6xl">✅</span>
                <p className="text-white font-bold text-xl">{language === 'pt' ? 'Sessão encerrada' : 'Session ended'}</p>
                <button onClick={onEnd} className="px-6 py-3 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:bg-blue-600/50 transition-all font-medium">
                  {language === 'pt' ? '← Voltar' : '← Back'}
                </button>
              </div>
            )}

            {!feedbackLoading && feedback && (() => {
              const vc = verdictConfig[feedback.verdict] ?? verdictConfig.improvavel;
              const scoreColor = feedback.score >= 7 ? '#10b981' : feedback.score >= 4 ? '#f59e0b' : '#ef4444';
              const circumference = 2 * Math.PI * 52;
              const dash = (feedback.score / 10) * circumference;
              return (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Score + Verdict */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 border border-white/10 rounded-3xl p-6">
                    {/* SVG Score Ring */}
                    <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                        <circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke={scoreColor} strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${circumference}`}
                          strokeDashoffset={circumference / 4}
                          style={{ transition: 'stroke-dasharray 1s ease-out' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{feedback.score}</span>
                        <span className="text-xs text-slate-400">/10</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border mb-3 ${vc.bg} ${vc.border} ${vc.text}`}>
                        {vc.label}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{feedback.overall}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-5">
                      <h3 className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-2">
                        <span>✅</span> {language === 'pt' ? 'Pontos Fortes' : 'Strengths'}
                      </h3>
                      <ul className="space-y-2">
                        {feedback.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-5">
                      <h3 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                        <span>⚠️</span> {language === 'pt' ? 'Pontos a Melhorar' : 'Areas to Improve'}
                      </h3>
                      <ul className="space-y-2">
                        {feedback.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-red-500 mt-0.5 shrink-0">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5">
                    <h3 className="text-indigo-300 font-bold text-sm mb-3 flex items-center gap-2">
                      <span>💡</span> {language === 'pt' ? `Dicas Específicas para Visto ${scenario.visaType}` : `Specific Tips for ${scenario.visaType} Visa`}
                    </h3>
                    <ul className="space-y-2">
                      {feedback.tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-indigo-400 font-mono mt-0.5 shrink-0">{i + 1}.</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Back button */}
                  <div className="flex justify-center pt-2 pb-6">
                    <button
                      onClick={onEnd}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg"
                    >
                      {language === 'pt' ? '← Voltar ao Treinamento' : '← Back to Training'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Main Content (active session) ── */}
        {status !== 'ended' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
            {/* Left: Orb + Controls */}
            <div className="flex flex-col items-center justify-center gap-8 p-8 lg:w-1/2 border-r border-white/10">
              <VoiceOrb status={status} />

              <p className="text-lg font-semibold transition-all duration-500" style={{ color: cfg.color }}>
                {status === 'error'
                  ? (language === 'pt' ? 'Erro de conexão' : 'Connection error')
                  : cfg.label}
              </p>

              {status === 'error' && errorMsg && (
                <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm px-5 py-3 rounded-xl max-w-xs text-center">
                  {errorMsg}
                </div>
              )}

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

              <div className="flex items-center gap-4">
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

                {status === 'error' ? (
                  <button
                    onClick={connect}
                    className="flex flex-col items-center gap-1.5 px-6 py-3 rounded-2xl bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:bg-amber-600/50 transition-all"
                  >
                    <span className="text-xl">🔄</span>
                    <span className="text-xs font-medium">{language === 'pt' ? 'Tentar novamente' : 'Retry'}</span>
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
        )}
      </div>
    </>
  );
}

