import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { getUserTrainingSessions, TrainingSession } from '../lib/training-history';
import type { FeedbackSection } from './api/realtime-feedback';

// ── helpers ─────────────────────────────────────────────────────────────────

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
}

function formatDate(ts: any): string {
  if (!ts) return '—';
  const d: Date =
    ts && typeof ts.toDate === 'function' ? ts.toDate() :
      ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const VERDICT_LABEL: Record<string, string> = {
  aprovado: 'Aprovado',
  improvavel: 'Improvável',
  reprovado: 'Reprovado',
};
const VERDICT_COLOR: Record<string, string> = {
  aprovado: '#10b981',
  improvavel: '#f59e0b',
  reprovado: '#ef4444',
};

// ── Feedback Modal ────────────────────────────────────────────────────────────

function FeedbackModal({ session, onClose }: { session: TrainingSession; onClose: () => void }) {
  const [view, setView] = useState<'feedback' | 'transcript'>(session.feedback ? 'feedback' : 'transcript');

  const fb = session.feedback as FeedbackSection | undefined;
  const scoreColor = fb ? (fb.score >= 7 ? '#10b981' : fb.score >= 4 ? '#f59e0b' : '#ef4444') : '#334155';
  const circumference = 2 * Math.PI * 52;
  const dash = fb ? (fb.score / 10) * circumference : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }
          .no-print { display: none !important; }
          @page { margin: 20mm; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto no-print"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="relative w-full max-w-2xl my-8 mx-4 rounded-3xl border border-white/10 p-6 space-y-5"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Detalhes da Sessão</p>
              <h2 className="text-white font-bold text-lg">{session.scenarioName}</h2>
              <p className="text-slate-500 text-xs mt-0.5">{formatDate(session.createdAt)} · Visto {session.visaType}</p>
            </div>
            <div className="flex items-center gap-2 no-print self-end sm:self-auto">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-white/10 transition-all"
              >
                🖨️ PDF / Imprimir
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-fit no-print">
            <button
              onClick={() => setView('feedback')}
              disabled={!fb}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'feedback' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                } ${!fb ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Avaliação
            </button>
            <button
              onClick={() => setView('transcript')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'transcript' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
              Transcrição
            </button>
          </div>

          {/* Feedback View */}
          {view === 'feedback' && fb && (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
                  <svg width="100" height="100" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={scoreColor} strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeDashoffset={circumference / 4}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{fb.score}</span>
                    <span className="text-xs text-slate-400">/10</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2"
                    style={{
                      color: VERDICT_COLOR[fb.verdict] ?? '#f59e0b',
                      borderColor: (VERDICT_COLOR[fb.verdict] ?? '#f59e0b') + '55',
                      background: (VERDICT_COLOR[fb.verdict] ?? '#f59e0b') + '22',
                    }}
                  >
                    {VERDICT_LABEL[fb.verdict] ?? fb.verdict}
                  </span>
                  <p className="text-slate-300 text-sm leading-relaxed">{fb.overall}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-4">
                  <h3 className="text-emerald-400 font-bold text-sm mb-3">✅ Pontos Fortes</h3>
                  <ul className="space-y-1.5">
                    {fb.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-500 shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Weaknesses */}
                <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-4">
                  <h3 className="text-red-400 font-bold text-sm mb-3">⚠️ Pontos a Melhorar</h3>
                  <ul className="space-y-1.5">
                    {fb.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-red-500 shrink-0">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4">
                <h3 className="text-blue-300 font-bold text-sm mb-3">💡 Dicas Específicas — Visto {session.visaType}</h3>
                <ul className="space-y-1.5">
                  {fb.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-blue-400 font-mono shrink-0">{i + 1}.</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Transcript View */}
          {view === 'transcript' && (
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 max-h-[500px] overflow-y-auto space-y-4">
              {(!session.messages || session.messages.length === 0) ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  Nenhuma mensagem gravada nesta sessão.
                </div>
              ) : (
                session.messages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id || i} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white/10 text-slate-200 border border-white/5 rounded-bl-none'
                        }`}>
                        <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                          <span>{isUser ? 'Você' : 'Oficial Consular'}</span>
                          <span>•</span>
                          <span>{formatDate(msg.timestamp).split(' ')[1]}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Print-only version */}
      <div id="print-root" style={{ display: 'none', fontFamily: 'sans-serif', padding: '20px', color: '#000' }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Feedback da Entrevista — {session.scenarioName}</h1>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>{formatDate(session.createdAt)} · Visto {session.visaType}</p>
        {fb && (
          <>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Pontuação: {fb.score}/10 — {VERDICT_LABEL[fb.verdict] ?? fb.verdict}</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{fb.overall}</p>
            <h2 style={{ fontSize: 15, marginBottom: 6 }}>✅ Pontos Fortes</h2>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              {fb.strengths.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
            </ul>
            <h2 style={{ fontSize: 15, marginBottom: 6 }}>⚠️ Pontos a Melhorar</h2>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              {fb.weaknesses.map((w, i) => <li key={i} style={{ marginBottom: 4 }}>{w}</li>)}
            </ul>
            <h2 style={{ fontSize: 15, marginBottom: 6 }}>💡 Dicas para Visto {session.visaType}</h2>
            <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
              {fb.tips.map((t, i) => <li key={i} style={{ marginBottom: 4 }}>{t}</li>)}
            </ol>
          </>
        )}

        <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #ccc' }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Transcrição da Entrevista</h2>
          {(!session.messages || session.messages.length === 0) ? (
            <p style={{ fontSize: 13, color: '#666' }}>Nenhuma transcrição disponível.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {session.messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={i} style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: isUser ? '#f0f7ff' : '#f8f9fa',
                    borderLeft: isUser ? '4px solid #3b82f6' : '4px solid #64748b',
                    marginLeft: isUser ? '20px' : '0',
                    marginRight: isUser ? '0' : '20px',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#555', marginBottom: 4 }}>
                      {isUser ? 'Você' : 'Oficial Consular'}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.4, color: '#222' }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HistoricoTreinamento() {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TrainingSession | null>(null);
  const [filter, setFilter] = useState<'all' | 'realtime' | 'text' | 'voice'>('all');

  const load = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    setLoadError(null);
    try {
      const data = await getUserTrainingSessions(user.uid, 50);
      setSessions(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar histórico:', err);
      setLoadError('Não foi possível carregar o histórico. Verifique o console para detalhes.');
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!user) return null;

  const filtered = sessions.filter(s => filter === 'all' || s.interactionMode === filter);

  return (
    <Layout>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-blue-500">Histórico de Treinamentos</h1>
          <p className="text-slate-400 text-sm mt-1">Todas as suas sessões de simulação de entrevista — com feedback gerado por IA.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'realtime', 'voice', 'text'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
            >
              {{ all: 'Todos', realtime: '🎙️ Realtime', voice: '🔊 Voz', text: '💬 Texto' }[f]}
            </button>
          ))}
        </div>

        {/* Sessions list */}
        {fetching ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          <div className="bg-red-900/30 border border-red-500/30 rounded-2xl px-5 py-6 text-center">
            <p className="text-red-400 font-semibold mb-1">⚠️ Erro ao carregar</p>
            <p className="text-red-300 text-sm">{loadError}</p>
            <button
              onClick={load}
              className="mt-4 px-4 py-2 rounded-xl bg-red-900/40 border border-red-500/30 text-red-300 text-xs hover:bg-red-900/60 transition-all"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-4xl mb-3">📂</p>
            <p className="font-semibold">Nenhuma sessão encontrada</p>
            <p className="text-sm mt-1">Complete um treinamento para ver o histórico aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="group flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/[0.08] transition-all"
                style={{ animation: 'fadeInUp 0.3s ease-out' }}
              >
                {/* Mode icon */}
                <div className="text-2xl shrink-0">
                  {{ realtime: '🎙️', voice: '🔊', text: '💬' }[s.interactionMode] ?? '📝'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{s.scenarioName}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {formatDate(s.createdAt)} · Visto {s.visaType}
                    {s.duration ? ` · ${formatDuration(s.duration)}` : ''}
                    {` · ${s.userMessages ?? 0} respostas`}
                  </p>
                </div>

                {/* Feedback score badge */}
                {s.feedback && (
                  <div
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                    style={{
                      color: VERDICT_COLOR[s.feedback.verdict] ?? '#f59e0b',
                      borderColor: (VERDICT_COLOR[s.feedback.verdict] ?? '#f59e0b') + '55',
                      background: (VERDICT_COLOR[s.feedback.verdict] ?? '#f59e0b') + '22',
                    }}
                  >
                    <span>{s.feedback.score}/10</span>
                    <span>·</span>
                    <span>{VERDICT_LABEL[s.feedback.verdict] ?? s.feedback.verdict}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => setSelected(s)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-500 text-xs font-medium hover:bg-blue-600/50 transition-all"
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Modal */}
      {selected && (
        <FeedbackModal session={selected} onClose={() => setSelected(null)} />
      )}
    </Layout>
  );
}
