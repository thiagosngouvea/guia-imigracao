import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import {
  getVisaPath, createVisaPath, updateStepCompletion, updateSubtaskCompletion,
  VisaPathData, VisaPathStep,
} from '../lib/visa-path-service';
import { HiMapPin, HiGlobeAmericas, HiArrowRight, HiCheckCircle as HiCheck2 } from 'react-icons/hi2';
import { HiCheckCircle, HiClock, HiChevronDown, HiChevronRight, HiClipboardList, HiBookOpen } from 'react-icons/hi';
import { FiCheckCircle } from 'react-icons/fi';

export default function MinhaTrilhaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [visaPath, setVisaPath] = useState<VisaPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => { if (!user) return; loadVisaPath(); }, [user]);

  const loadVisaPath = async () => {
    if (!user) return;
    try {
      let path = await getVisaPath(user.uid);
      if (path && (!path.steps || path.steps.length === 0)) {
        await createVisaPath(user.uid, path.visaType || 'H-1B');
        path = await getVisaPath(user.uid);
      }
      setVisaPath(path);
      if (path?.steps) {
        const first = path.steps.find(s => !s.completed);
        if (first) setExpandedSteps({ [first.id]: true });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleStep = (id: string) => setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));

  const handleStepCompletion = async (stepId: string, completed: boolean) => {
    if (!user || !visaPath) return;
    setUpdating(true);
    try {
      await updateStepCompletion(user.uid, stepId, completed);
      await loadVisaPath();
      if (completed) {
        setFeedback({ type: 'success', msg: 'Etapa marcada como concluída!' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao atualizar etapa.' });
      setTimeout(() => setFeedback(null), 3000);
    } finally { setUpdating(false); }
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
      <div key={step.id} className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
        step.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
      } shadow-sm hover:shadow-md`}>
        <button className="w-full text-left p-5 flex items-center gap-4" onClick={() => toggleStep(step.id)}>
          {/* Step number/check */}
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
            step.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            {step.completed ? <FiCheckCircle className="w-5 h-5" /> : <span className="font-bold">{index + 1}</span>}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm leading-snug ${step.completed ? 'text-emerald-700 line-through' : 'text-slate-900'}`}>
              {step.title}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <HiClock className="w-3.5 h-3.5" /> {step.estimatedTime}
              </span>
              {totalSubs > 0 && (
                <span className="text-xs font-medium text-blue-600">
                  {completedSubs}/{totalSubs} tarefas
                </span>
              )}
            </div>
          </div>
          {isExpanded
            ? <HiChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
            : <HiChevronRight className="w-5 h-5 text-slate-400 shrink-0" />}
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 border-t border-slate-100">
            <p className="text-slate-600 text-sm leading-relaxed mt-4 mb-5">{step.description}</p>

            {step.subtasks && step.subtasks.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HiClipboardList className="w-4 h-4" /> Tarefas
                </p>
                <div className="space-y-2">
                  {step.subtasks.map(subtask => (
                    <label key={subtask.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={e => handleSubtaskCompletion(step.id, subtask.id, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                      />
                      <span className={`text-sm ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {subtask.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step.resources && step.resources.length > 0 && (
              <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <HiBookOpen className="w-4 h-4" /> Recursos Úteis
                </p>
                <ul className="space-y-1.5">
                  {step.resources.map((res, i) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 shrink-0">•</span>{res}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => handleStepCompletion(step.id, !step.completed)}
              disabled={updating}
              className={`w-full py-3 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 ${
                step.completed
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } disabled:opacity-60`}
            >
              {updating
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : step.completed
                  ? <><FiCheckCircle className="w-4 h-4" /> Concluída — Desmarcar</>
                  : <>Marcar como Concluída <HiArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Carregando sua trilha...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!visaPath) {
    return (
      <SubscriptionGuard>
        <Layout>
          <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md animate-fade-in">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HiMapPin className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Nenhuma trilha selecionada</h2>
              <p className="text-slate-500 text-sm mb-6">
                Complete o questionário e escolha uma trilha para começar sua jornada de imigração.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/questionario">
                  <Button className="gap-2">Fazer Questionário <HiArrowRight className="w-4 h-4" /></Button>
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
        {/* Toast */}
        {feedback && (
          <div className={`fixed top-5 right-5 z-50 rounded-2xl shadow-xl px-5 py-4 text-white text-sm font-medium flex items-center gap-2 animate-slide-in ${
            feedback.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
            {feedback.type === 'success' ? <FiCheckCircle className="w-4 h-4" /> : null}
            {feedback.msg}
          </div>
        )}

        <div className="py-10 px-4" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F8FAFC 60%, #F5F0FF 100%)' }}>
          <div className="mx-auto max-w-2xl">

            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3 bg-blue-50 px-3 py-1.5 rounded-full">
                <HiGlobeAmericas className="w-4 h-4" /> {visaPath.country}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{visaPath.visaType}</h1>
              <p className="text-slate-500 text-sm mt-1">Sua trilha de imigração personalizada</p>
            </div>

            {/* Progress */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">Progresso Geral</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{completedCount} de {totalCount} etapas concluídas</p>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{percentComplete}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="mb-6 stagger-children">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Passo a Passo</h2>
                <span className="text-xs text-slate-400">{completedCount}/{totalCount} concluídas</span>
              </div>
              <div className="space-y-3">
                {visaPath.steps?.map((step, idx) => renderStep(step, idx))}
              </div>
            </div>

            {/* Completion */}
            {percentComplete === 100 && (
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center shadow-lg mb-6 animate-scale-in">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, white, transparent 60%)' }} />
                <FiCheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-200" />
                <h3 className="text-2xl font-bold mb-2">Parabéns!</h3>
                <p className="text-emerald-100 text-sm">
                  Você completou todas as etapas! Prepare-se para sua mudança aos EUA!
                </p>
              </div>
            )}

            <div className="text-center">
              <Link href="/visa-path">
                <Button variant="outline" className="gap-2">
                  Mudar Trilha <HiArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </Layout>
    </SubscriptionGuard>
  );
}
