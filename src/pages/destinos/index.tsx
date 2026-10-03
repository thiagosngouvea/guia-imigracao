import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { HiGlobeAmericas, HiMagnifyingGlass } from 'react-icons/hi2';
import { Layout } from '../../components/layout/Layout';
import { Arrow, CountryCard, GuideFooter } from '../../components/guide/GuideUI';
import { COUNTRIES, type CountryId } from '../../lib/global-guide';

type Filter = 'todos' | 'americas' | 'europa';
const EUROPE = new Set<CountryId>(['portugal', 'alemanha', 'espanha', 'italia']);

export default function Destinations() {
  const [filter, setFilter] = useState<Filter>('todos');
  const visible = COUNTRIES.filter((country) => filter === 'todos' || (filter === 'europa' ? EUROPE.has(country.id) : !EUROPE.has(country.id)));
  return <Layout headerTheme="light"><Head><title>Explore destinos | MoveEasy</title><meta name="description" content="Compare sete países e conheça caminhos possíveis para viver fora do Brasil." /></Head><div className="guide-page">
    <section className="guide-hero"><div className="guide-container py-16 sm:py-20 grid lg:grid-cols-[1.25fr_.75fr] gap-10 items-center relative z-10">
      <div><p className="guide-kicker mb-6">Explore o mundo</p><h1 className="guide-display max-w-3xl">Seu próximo lugar pode estar aqui<span className="guide-hero-accent">.</span></h1><p className="guide-lead max-w-2xl mt-6">Sete países para conhecer com calma. Encontre os caminhos disponíveis e veja o que precisa confirmar antes de escolher.</p></div>
      <div className="guide-dark rounded-[28px] p-7 sm:p-9 relative overflow-hidden"><div className="absolute rounded-full size-60 border border-white/10 -right-24 -top-24" /><HiGlobeAmericas className="size-11 text-emerald-200 relative" /><strong className="block text-5xl font-black tracking-tight mt-6 relative">07</strong><span className="block text-emerald-100 text-lg font-semibold mt-1 relative">destinos para começar</span><p className="text-emerald-100/75 text-sm mt-5 relative">Cada caminho tem exigências diferentes. A decisão começa com informação confiável.</p></div>
    </div></section>

    <section className="guide-container py-16 sm:py-20"><div className="flex flex-wrap justify-between items-end gap-6 mb-8"><div><p className="guide-kicker mb-4">Escolha sua direção</p><h2 className="guide-section-title">Conheça os destinos</h2></div><p className="text-slate-500 text-sm max-w-xs">Selecione uma região para explorar. Nenhum destino é uma promessa de visto.</p></div>
      <div className="flex flex-wrap gap-2 mb-8" aria-label="Filtrar destinos por região">{([['todos', 'Todos os destinos'], ['americas', 'Américas'], ['europa', 'Europa']] as const).map(([id, title]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${filter === id ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/15' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-500'}`}>{title}</button>)}</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{visible.map((country) => <CountryCard key={country.id} country={country} index={COUNTRIES.indexOf(country)} />)}</div>
    </section>

    <section className="guide-container pb-20"><div className="guide-panel p-8 sm:p-10 grid md:grid-cols-[auto_1fr_auto] gap-6 items-center"><div className="size-14 rounded-2xl bg-emerald-100 text-teal-700 flex items-center justify-center"><HiMagnifyingGlass className="size-7" /></div><div><h2 className="text-2xl font-extrabold tracking-tight">Ainda não sabe qual combina com você?</h2><p className="text-slate-600 mt-2">O diagnóstico gratuito transforma suas respostas em opções para investigar, com pontos que precisam ser confirmados.</p></div><Link href="/diagnostico" className="guide-cta guide-cta-primary">Fazer diagnóstico <Arrow /></Link></div><p className="text-xs text-slate-500 mt-8">Requisitos, taxas e prazos podem mudar. Consulte sempre a fonte oficial indicada em cada destino.</p></section>
    <GuideFooter />
  </div></Layout>;
}
