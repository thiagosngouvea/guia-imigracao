import Head from 'next/head';
import Link from 'next/link';
import { HiArrowUpRight, HiClipboardDocumentList, HiGlobeAmericas, HiMapPin, HiSparkles } from 'react-icons/hi2';
import { Layout } from '../components/layout/Layout';
import { Arrow, CountryCard, GuideFooter, GuideProof, HeroMap } from '../components/guide/GuideUI';
import { COUNTRIES } from '../lib/global-guide';

export default function Home() {
  return <Layout headerTheme="light">
    <Head><title>Planeje sua vida em outro país | MoveEasy</title><meta name="description" content="Explore sete destinos, descubra caminhos de imigração e transforme sua vontade de mudar em um plano." /></Head>
    <div className="guide-page">
      <section className="guide-hero">
        <div className="guide-container guide-hero-grid">
          <div className="guide-hero-copy">
            <p className="guide-kicker mb-7">Seu futuro pode ter outro endereço</p>
            <h1 className="guide-display">O mundo é maior que o lugar onde você está<span className="guide-hero-accent">.</span></h1>
            <p className="guide-lead max-w-xl mt-7">Pensando em viver fora do Brasil? Descubra destinos, entenda caminhos possíveis e construa um plano para dar o próximo passo com clareza.</p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link className="guide-cta guide-cta-primary" href="/diagnostico">Descobrir minhas opções <Arrow /></Link>
              <Link className="guide-cta guide-cta-light" href="/destinos">Explorar destinos <HiArrowUpRight className="size-5" /></Link>
            </div>
            <GuideProof />
          </div>
          <HeroMap />
        </div>
      </section>

      <section className="guide-container pt-8 pb-20 sm:pb-28" id="destinos">
        <div className="flex flex-wrap items-end justify-between gap-5 mb-9">
          <div><p className="guide-kicker mb-4">Seu ponto de partida</p><h2 className="guide-section-title max-w-2xl">Sete destinos.<br />Novas possibilidades.</h2></div>
          <Link href="/destinos" className="guide-link inline-flex items-center gap-1 mb-1">Ver todos os destinos <Arrow /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COUNTRIES.map((country, index) => <CountryCard key={country.id} country={country} index={index} compact />)}
        </div>
      </section>

      <section className="guide-soft py-20 sm:py-28">
        <div className="guide-container grid lg:grid-cols-[.8fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div><p className="guide-kicker mb-5">Um caminho, passo a passo</p><h2 className="guide-section-title">Da vontade de mudar ao seu plano.</h2><p className="guide-lead mt-6">Você não precisa decidir tudo hoje. Comece entendendo o que existe, depois veja o que combina com seu perfil.</p><Link href="/diagnostico" className="guide-cta guide-cta-primary mt-8">Começar gratuitamente <Arrow /></Link></div>
          <div className="space-y-4">
            {[{ icon: HiGlobeAmericas, number: '01', title: 'Explore sem pressa', text: 'Compare idiomas, caminhos de residência, desafios e fontes oficiais dos destinos.' }, { icon: HiSparkles, number: '02', title: 'Entenda suas possibilidades', text: 'Responda um diagnóstico gratuito e receba caminhos para investigar conforme seu perfil.' }, { icon: HiClipboardDocumentList, number: '03', title: 'Organize a mudança', text: 'Escolha uma rota e crie um roteiro com etapas, documentos a verificar e progresso salvo.' }].map(({ icon: Icon, number, title, text }) => <div className="guide-panel p-5 sm:p-6 flex gap-5" key={number}><span className="size-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0"><Icon className="size-6" /></span><div><span className="text-xs font-extrabold tracking-widest text-teal-700">PASSO {number}</span><h3 className="font-bold text-xl mt-1">{title}</h3><p className="text-slate-600 mt-2 text-sm leading-relaxed">{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="guide-container py-20 sm:py-28">
        <div className="guide-dark rounded-[30px] px-7 py-10 sm:px-12 sm:py-14 grid md:grid-cols-[1fr_auto] gap-9 items-center relative overflow-hidden">
          <div className="absolute size-80 rounded-full border border-white/10 -right-20 -top-44 pointer-events-none" />
          <div className="relative"><span className="inline-flex items-center gap-2 text-sm text-emerald-200 font-bold"><HiMapPin className="size-5" /> Seu próximo destino</span><h2 className="guide-section-title mt-4 max-w-2xl">Não sabe por onde começar? Comece por você.</h2><p className="text-emerald-100/80 mt-4 max-w-xl">Em poucos minutos, organize o que importa para sua mudança e veja opções para pesquisar.</p></div>
          <Link href="/diagnostico" className="guide-cta bg-white text-slate-900 relative font-bold">Fazer diagnóstico <Arrow /></Link>
        </div>
        <div className="mt-9 flex flex-wrap justify-between gap-5 items-center"><div><p className="font-bold">Já decidiu pelos Estados Unidos?</p><p className="text-slate-600 text-sm mt-1">Continue com nossas ferramentas específicas para vistos e entrevistas.</p></div><Link href="/landing" className="guide-link inline-flex gap-1 items-center">Conhecer ferramentas dos EUA <HiArrowUpRight className="size-4" /></Link></div>
        <p className="text-xs text-slate-500 mt-12 max-w-3xl">Conteúdo educativo. Regras migratórias podem mudar; confirme requisitos, taxas e prazos com a autoridade oficial antes de enviar pedidos ou assumir compromissos financeiros.</p>
      </section>
      <GuideFooter />
    </div>
  </Layout>;
}
