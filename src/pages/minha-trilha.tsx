import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import {
  getVisaPath,
  createVisaPath,
  updateStepCompletion,
  updateSubtaskCompletion,
  VisaPathData,
  VisaPathStep,
} from '../lib/visa-path-service';

export default function MinhaTrilhaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [visaPath, setVisaPath] = useState<VisaPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadVisaPath();
  }, [user]);

  const loadVisaPath = async () => {
    if (!user) return;
    try {
      let path = await getVisaPath(user.uid);

      // Se o path existe mas não tem steps, recria com steps
      if (path && (!path.steps || path.steps.length === 0)) {
        await createVisaPath(user.uid, path.visaType || 'H-1B');
        path = await getVisaPath(user.uid);
      }

      setVisaPath(path);

      // Expandir primeiro step incompleto por padrão
      if (path?.steps) {
        const first = path.steps.find(s => !s.completed);
        if (first) setExpandedSteps({ [first.id]: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId: string) =>
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));

  const handleStepCompletion = async (stepId: string, completed: boolean) => {
    if (!user || !visaPath) return;
    setUpdating(true);
    try {
      await updateStepCompletion(user.uid, stepId, completed);
      await loadVisaPath();
      if (completed) {
        setFeedback({ type: 'success', msg: 'Etapa marcada como concluída! 🎉' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao atualizar etapa.' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleSubtaskCompletion = async (stepId: string, subtaskId: string, completed: boolean) => {
    if (!user) return;
    try {
      await updateSubtaskCompletion(user.uid, stepId, subtaskId, completed);
      await loadVisaPath();
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao atualizar subtarefa.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const renderStep = (step: VisaPathStep, index: number) => {
    const isExpanded = !!expandedSteps[step.id];
    const completedSubs = step.subtasks?.filter(s => s.completed).length ?? 0;
    const totalSubs = step.subtasks?.length ?? 0;

    return (
      <div
        key={step.id}
        className={`rounded-xl border transition-all overflow-hidden ${
          step.completed
            ? 'border-green-200 bg-green-50/50'
            : 'border-gray-200 bg-white'
        } shadow-sm hover:shadow-md`}
      >
        {/* Step Header */}
        <button
          className="w-full text-left p-5 flex items-center gap-4"
          onClick={() => toggleStep(step.id)}
        >
          {/* Number/Check */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
              step.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-gray-300 text-gray-500'
            }`}
          >
            {step.completed ? '✓' : index + 1}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-base leading-tight ${
                step.completed ? 'text-green-700 line-through' : 'text-gray-900'
              }`}
            >
              {step.title}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500">⏱ {step.estimatedTime}</span>
              {totalSubs > 0 && (
                <span className="text-xs text-blue-600 font-medium">
                  {completedSubs}/{totalSubs} subtarefas
                </span>
              )}
            </div>
          </div>

          {/* Expand Icon */}
          <span className="text-gray-400 text-lg flex-shrink-0">
            {isExpanded ? '▼' : '▶'}
          </span>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-5">{step.description}</p>

            {/* Subtasks */}
            {step.subtasks && step.subtasks.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">📋 Tarefas:</p>
                <div className="space-y-2">
                  {step.subtasks.map(subtask => (
                    <label
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={e => handleSubtaskCompletion(step.id, subtask.id, e.target.checked)}
                        className="w-4 h-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`text-sm ${
                          subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {step.resources && step.resources.length > 0 && (
              <div className="mb-5 bg-blue-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-2">📚 Recursos Úteis:</p>
                <ul className="space-y-1">
                  {step.resources.map((res, i) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      {res}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Complete Step Button */}
            <button
              onClick={() => handleStepCompletion(step.id, !step.completed)}
              disabled={updating}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                step.completed
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-60`}
            >
              {updating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : step.completed ? (
                '✓ Etapa Concluída — Desmarcar'
              ) : (
                'Marcar como Concluída'
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando sua trilha...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // No path state
  if (!visaPath) {
    return (
      <SubscriptionGuard>
        <Layout>
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Nenhuma trilha selecionada</h2>
              <p className="text-gray-600 mb-6">
                Complete o questionário e escolha uma trilha para começar sua jornada.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/questionario">
                  <Button>Fazer Questionário</Button>
                </Link>
                <Link href="/visa-path">
                  <Button variant="outline">Escolher Trilha</Button>
                </Link>
              </div>
            </div>
          </div>
        </Layout>
      </SubscriptionGuard>
    );
  }

  const percentComplete = visaPath.progress?.percentComplete ?? 0;
  const completedCount = visaPath.progress?.completedSteps?.length ?? 0;
  const totalCount = visaPath.steps?.length ?? 0;

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
          <div className="mx-auto max-w-2xl">

            {/* Feedback Toast */}
            {feedback && (
              <div
                className={`fixed top-5 right-5 z-50 rounded-xl shadow-xl px-5 py-4 text-white font-medium transition-all ${
                  feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {feedback.msg}
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🗽</div>
              <h1 className="text-3xl font-bold text-gray-900">{visaPath.visaType}</h1>
              <p className="text-blue-600 font-medium mt-1">🇺🇸 {visaPath.country}</p>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-700">Seu Progresso</h2>
                <span className="text-2xl font-bold text-blue-600">{percentComplete}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                {completedCount} de {totalCount} etapas concluídas
              </p>
            </div>

            {/* Steps */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Passo a Passo</h2>
              <div className="space-y-4">
                {visaPath.steps?.map((step, idx) => renderStep(step, idx))}
              </div>
            </div>

            {/* Completion card */}
            {percentComplete === 100 && (
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 text-white text-center shadow-lg shadow-green-200 mb-8">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2">Parabéns!</h3>
                <p className="text-green-100">
                  Você completou todas as etapas! Continue acompanhando atualizações e prepare-se para sua mudança aos EUA!
                </p>
              </div>
            )}

            {/* Change path link */}
            <div className="text-center">
              <Link href="/visa-path">
                <Button variant="outline" className="gap-2">
                  🔄 Mudar Trilha
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </Layout>
    </SubscriptionGuard>
  );
}
