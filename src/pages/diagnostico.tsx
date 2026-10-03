import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { HiArrowRight, HiArrowUpRight, HiCheckCircle, HiInformationCircle, HiLockClosed, HiSparkles } from 'react-icons/hi2';
import { db } from '../lib/firebase';
import { authenticatedFetch } from '../lib/api-client';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout/Layout';
import { Arrow, GuideFooter } from '../components/guide/GuideUI';
import { CountryFlag } from '../components/guide/CountryFlag';
import { analyzeDestinations, COUNTRIES, findRoute, isProfile, type CountryId, type DiagnosticProfile, type Goal, type Suggestion } from '../lib/global-guide';

const initial: DiagnosticProfile = { goal: 'work', education: 'degree', occupation: '', languages: [], savings: 'moderate', familyCountry: '', timeframe: 'year' };

export default function Diagnostic() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<DiagnosticProfile>(initial);
  const [results, setResults] = useState<Suggestion[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('globalDiagnostic') || 'null');
      if (isProfile(stored)) { setProfile(stored); setResults(analyzeDestinations(stored)); }
    } catch { /* ignore invalid local draft */ }
  }, []);
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'globalDiagnoses', user.uid)).then((snap) => {
      if (sessionStorage.getItem('globalDiagnostic')) return;
      if (snap.exists() && isProfile(snap.data().profile)) {
        const saved = snap.data().profile as DiagnosticProfile;
        setProfile(saved);
        setResults(analyzeDestinations(saved));
      }
    }).catch(() => {});
  }, [user]);

  const update = <K extends keyof DiagnosticProfile>(key: K, value: DiagnosticProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setResults(null); setRequestId(''); setError('');
  };
  const run = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isProfile(profile)) return;
    const found = analyzeDestinations(profile);
    setResults(found);
    sessionStorage.setItem('globalDiagnostic', JSON.stringify(profile));
    if (user) {
      try { await setDoc(doc(db, 'globalDiagnoses', user.uid), { profile, results: found, updatedAt: serverTimestamp() }); }
      catch { setError('Resultado disponível nesta sessão, mas não foi possível salvá-lo na conta.'); }
    }
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const generate = async (suggestion: Suggestion) => {
    if (!user) { sessionStorage.setItem('globalDiagnostic', JSON.stringify(profile)); router.push('/login?redirect=%2Fdiagnostico'); return; }
    setBusy(true); setError('');
    const id = requestId || crypto.randomUUID(); setRequestId(id);
    try {
      const response = await authenticatedFetch('/api/immigration-plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: id, countryId: suggestion.countryId, routeId: suggestion.routeId, profile }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível gerar o roteiro');
      router.push(`/meu-plano?id=${id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível gerar o roteiro'); }
    finally { setBusy(false); }
  };

  return <Layout headerTheme="light"><Head><title>Descubra possibilidades | MoveEasy</title><meta name="description" content="Faça um diagnóstico gratuito para descobrir destinos e caminhos de imigração que vale investigar." /></Head><div className="guide-page">
    <section className="guide-hero"><div className="guide-container py-14 sm:py-20 relative z-10"><p className="guide-kicker mb-5">Diagnóstico gratuito</p><h1 className="guide-display max-w-4xl">A mudança começa com uma boa pergunta<span className="guide-hero-accent">.</span></h1><p className="guide-lead max-w-2xl mt-6">Conte um pouco sobre seus objetivos. Vamos organizar destinos e caminhos para você investigar com mais clareza.</p><div className="flex flex-wrap gap-4 mt-7 text-sm text-slate-600 font-semibold"><span className="inline-flex gap-2 items-center"><HiCheckCircle className="size-5 text-teal-700" /> Sem custo para comparar</span><span className="inline-flex gap-2 items-center"><HiLockClosed className="size-5 text-teal-700" /> Suas respostas ficam na sua conta ao entrar</span></div></div></section>

    <section className="guide-container py-12 sm:py-16 grid lg:grid-cols-[.68fr_1.32fr] gap-8 lg:gap-12 items-start">
      <div className="lg:sticky lg:top-24"><p className="guide-kicker mb-4">Seu perfil</p><h2 className="guide-section-title">Um ponto de partida para decidir melhor.</h2><p className="guide-lead mt-5">O resultado mostra opções para pesquisar e o que você ainda precisa confirmar. A escolha é sempre sua.</p><div className="guide-dark rounded-3xl p-6 mt-8"><HiInformationCircle className="size-7 text-emerald-200" /><h3 className="font-bold text-lg mt-4">Informação, não promessa</h3><p className="text-emerald-100/80 text-sm leading-relaxed mt-2">O diagnóstico não verifica elegibilidade nem garante aprovação. Consulte os requisitos oficiais antes de agir.</p></div></div>

      <form onSubmit={run} className="guide-panel p-6 sm:p-8"><div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100"><div><span className="text-xs font-extrabold tracking-widest text-teal-700 uppercase">Etapa inicial</span><h2 className="text-2xl font-extrabold tracking-tight mt-1">Conte sobre você</h2></div><span className="size-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center"><HiSparkles className="size-6" /></span></div>
        <div className="grid sm:grid-cols-2 gap-5 mt-7">
          <div><label className="guide-field-label" htmlFor="goal">O que você busca?</label><select id="goal" className="guide-field" value={profile.goal} onChange={(e) => update('goal', e.target.value as Goal)}><option value="work">Trabalhar e morar</option><option value="study">Estudar</option><option value="family">Reunir-se à família</option><option value="business">Empreender ou investir</option></select></div>
          <div><label className="guide-field-label" htmlFor="education">Sua formação</label><select id="education" className="guide-field" value={profile.education} onChange={(e) => update('education', e.target.value as DiagnosticProfile['education'])}><option value="school">Ensino médio ou técnico</option><option value="degree">Graduação</option><option value="postgraduate">Pós-graduação</option></select></div>
          <div><label className="guide-field-label" htmlFor="occupation">Profissão ou área</label><input id="occupation" className="guide-field" maxLength={120} value={profile.occupation} onChange={(e) => update('occupation', e.target.value)} placeholder="Ex.: tecnologia, saúde" /></div>
          <div><label className="guide-field-label" htmlFor="languages">Idioma que você usa</label><select id="languages" className="guide-field" value={profile.languages[0] || ''} onChange={(e) => update('languages', e.target.value ? [e.target.value] : [])}><option value="">Prefiro não informar</option><option value="Português">Português</option><option value="Inglês">Inglês</option><option value="Espanhol">Espanhol</option><option value="Alemão">Alemão</option><option value="Italiano">Italiano</option><option value="Francês">Francês</option></select></div>
          <div><label className="guide-field-label" htmlFor="savings">Reserva para mudança</label><select id="savings" className="guide-field" value={profile.savings} onChange={(e) => update('savings', e.target.value as DiagnosticProfile['savings'])}><option value="limited">Ainda preciso formar reserva</option><option value="moderate">Tenho alguma reserva</option><option value="comfortable">Tenho reserva confortável</option></select></div>
          <div><label className="guide-field-label" htmlFor="timeframe">Quando gostaria de ir?</label><select id="timeframe" className="guide-field" value={profile.timeframe} onChange={(e) => update('timeframe', e.target.value as DiagnosticProfile['timeframe'])}><option value="soon">Até 6 meses</option><option value="year">Até 1 ano</option><option value="flexible">Sem prazo definido</option></select></div>
          <div className="sm:col-span-2"><label className="guide-field-label" htmlFor="family">Tem familiar próximo em algum destino?</label><select id="family" className="guide-field" value={profile.familyCountry} onChange={(e) => update('familyCountry', e.target.value as CountryId | '')}><option value="">Não ou prefiro não informar</option>{COUNTRIES.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</select></div>
        </div>
        <button type="submit" className="guide-cta guide-cta-primary w-full mt-7">Ver minhas possibilidades <Arrow /></button><p className="text-slate-500 text-xs text-center mt-4">Comparação gratuita. Você decide se quer gerar um roteiro depois.</p>
      </form>
    </section>

    {results && <section id="resultados" className="guide-soft py-14 sm:py-20 scroll-mt-20" aria-live="polite"><div className="guide-container"><p className="guide-kicker mb-4">Resultado do diagnóstico</p><h2 className="guide-section-title">Possibilidades para investigar</h2><p className="guide-lead max-w-3xl mt-4">Uma ordem de pesquisa sugerida a partir das suas respostas, sem pontuação de elegibilidade.</p>
      {results.length === 0 ? <div className="guide-panel p-7 mt-8 max-w-3xl"><HiInformationCircle className="size-7 text-amber-600" /><h3 className="font-bold text-xl mt-4">Ainda não há uma indicação segura</h3><p className="text-slate-600 mt-2">Com estes dados, não encontramos um caminho específico para sugerir. Você pode <Link href="/destinos" className="guide-link">explorar os destinos</Link> e consultar os requisitos oficiais.</p></div> : <div className="grid lg:grid-cols-2 gap-5 mt-9">{results.map((suggestion, index) => { const found = findRoute(suggestion.countryId, suggestion.routeId)!; return <article key={suggestion.routeId} className="guide-result p-6 sm:p-7 flex flex-col"><div className="flex items-center justify-between gap-3"><span className="text-xs font-extrabold tracking-widest text-teal-700">OPÇÃO {String(index + 1).padStart(2, '0')}</span><CountryFlag countryId={found.country.id} className="w-11" /></div><h3 className="font-extrabold text-xl mt-3">{found.country.name}</h3><p className="text-teal-800 font-semibold text-sm mt-1">{found.route.title}</p><p className="text-slate-600 text-sm mt-4 leading-relaxed">{found.route.summary}</p><div className="border-t border-slate-100 mt-5 pt-5"><h4 className="font-bold text-sm">Por que vale pesquisar</h4><ul className="text-slate-600 text-sm list-disc pl-5 mt-2 space-y-1">{suggestion.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><h4 className="font-bold text-sm mt-4">Confirme antes de decidir</h4><ul className="text-slate-600 text-sm list-disc pl-5 mt-2 space-y-1">{suggestion.verify.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="flex flex-wrap gap-3 items-center mt-auto pt-7"><button type="button" disabled={busy} onClick={() => generate(suggestion)} className="guide-cta guide-cta-primary text-sm">{busy ? 'Gerando…' : 'Gerar roteiro · 3 créditos'} <HiArrowRight className="size-4" /></button><Link href={`/destinos/${found.country.id}#${found.route.id}`} className="guide-link inline-flex items-center gap-1 text-sm">Ver fonte oficial <HiArrowUpRight className="size-4" /></Link></div></article> })}</div>}
      {error && <p role="alert" className="text-red-800 font-semibold mt-6">{error} {error.includes('insuficiente') && <Link href="/comprar-creditos" className="underline">Comprar créditos</Link>}</p>}
    </div></section>}
    <GuideFooter />
  </div></Layout>;
}
