import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HiArrowUpRight, HiCheckCircle, HiClipboardDocumentList } from 'react-icons/hi2';
import { authenticatedFetch } from '../lib/api-client';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout/Layout';
import { Arrow, GuideFooter } from '../components/guide/GuideUI';
import { CountryFlag } from '../components/guide/CountryFlag';
import { findRoute, type ImmigrationPlan } from '../lib/global-guide';

export default function MyPlan() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<ImmigrationPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login?redirect=%2Fmeu-plano'); return; }
    authenticatedFetch('/api/immigration-plans').then(async (response) => {
      if (!response.ok) throw new Error('Não foi possível carregar seus roteiros');
      const data = await response.json();
      setPlans(data.plans);
    }).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  }, [user, authLoading, router]);
  const toggle = async (plan: ImmigrationPlan, stepId: string, completed: boolean) => {
    setError('');
    try {
      const response = await authenticatedFetch(`/api/immigration-plans/${plan.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stepId, completed }) });
      if (!response.ok) throw new Error('Não foi possível salvar o progresso');
      const data = await response.json();
      setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, steps: data.steps } : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao atualizar'); }
  };
  const selected = typeof router.query.id === 'string' ? plans.filter((plan) => plan.id === router.query.id) : plans;

  return <Layout headerTheme="light"><Head><title>Meus roteiros | MoveEasy</title></Head><div className="guide-page min-h-screen">
    <section className="guide-hero"><div className="guide-container py-14 sm:py-20 relative z-10"><p className="guide-kicker mb-5">Seu planejamento</p><h1 className="guide-display">Seu caminho,<br /><span className="guide-hero-accent">passo a passo.</span></h1><p className="guide-lead max-w-2xl mt-6">Acompanhe o que já fez e mantenha suas próximas ações organizadas. Reconfirme requisitos diretamente nas fontes oficiais.</p></div></section>
    <div className="guide-container py-12 sm:py-16"><div className="flex flex-wrap justify-between gap-5 items-end"><div><p className="guide-kicker mb-3">Área pessoal</p><h2 className="guide-section-title">Meus roteiros</h2></div><Link href="/diagnostico" className="guide-cta guide-cta-light text-sm">Explorar outro caminho <Arrow /></Link></div>
      {loading && <div className="guide-panel p-7 mt-8 text-slate-600" role="status">Carregando seus roteiros…</div>}
      {error && <p className="mt-6 rounded-xl bg-red-50 text-red-800 px-5 py-4 font-semibold" role="alert">{error}</p>}
      {!loading && selected.length === 0 && <div className="guide-panel p-8 sm:p-10 mt-8 max-w-2xl"><span className="size-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center"><HiClipboardDocumentList className="size-8" /></span><h3 className="font-extrabold text-2xl mt-5">Seu roteiro começa com uma escolha</h3><p className="text-slate-600 mt-3">Faça o diagnóstico gratuito, conheça as possibilidades e selecione um caminho para planejar.</p><Link href="/diagnostico" className="guide-cta guide-cta-primary mt-6">Fazer diagnóstico <Arrow /></Link></div>}
      <div className="space-y-8 mt-8">{selected.map((plan) => {
        const found = findRoute(plan.countryId, plan.routeId);
        if (!found) return null;
        const done = plan.steps.filter((step) => step.completed).length;
        return <article key={plan.id} className="guide-panel overflow-hidden"><div className="guide-dark p-6 sm:p-8"><span className="text-emerald-200 text-xs uppercase tracking-widest font-extrabold">Roteiro de imigração</span><div className="flex flex-wrap justify-between items-center gap-4 mt-4"><div className="flex items-center gap-4"><CountryFlag countryId={found.country.id} className="w-14" /><div><h3 className="text-2xl font-extrabold">{found.country.name}</h3><p className="text-emerald-100/80 text-sm mt-1">{found.route.title}</p></div></div><span className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">{done} de {plan.steps.length} etapas</span></div><div className="w-full bg-white/15 rounded-full h-2 mt-7"><div className="bg-[#80e2ba] h-2 rounded-full transition-all" style={{ width: `${100 * done / plan.steps.length}%` }} /></div></div><div className="p-6 sm:p-8"><h4 className="text-xl font-extrabold">Próximos passos</h4><div className="space-y-3 mt-5">{plan.steps.map((step, index) => <label key={step.id} className={`flex gap-4 rounded-2xl border p-4 sm:p-5 cursor-pointer transition-colors ${step.completed ? 'bg-emerald-50/60 border-emerald-100' : 'bg-white border-slate-200 hover:border-teal-300'}`}><input type="checkbox" checked={step.completed} onChange={(event) => toggle(plan, step.id, event.target.checked)} className="mt-1 size-5 accent-teal-700 shrink-0" /><span><span className="text-xs text-teal-700 font-extrabold tracking-widest">ETAPA {String(index + 1).padStart(2, '0')}</span><strong className="block text-slate-900 mt-1">{step.title}</strong><span className="text-slate-600 text-sm block mt-2 leading-relaxed break-words">{step.description}</span></span>{step.completed && <HiCheckCircle className="size-5 text-teal-700 ml-auto shrink-0" />}</label>)}</div><a href={found.route.source.url} target="_blank" rel="noopener noreferrer" className="guide-link inline-flex items-center gap-1 mt-7">Conferir fonte oficial <HiArrowUpRight className="size-4" /></a></div></article>;
      })}</div>
    </div><GuideFooter />
  </div></Layout>;
}
