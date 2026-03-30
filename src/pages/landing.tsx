import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';

import { HeroSection } from '../components/landing/HeroSection';
import { TestimonialCard, Testimonial } from '../components/landing/TestimonialCard';
import { StepsSection } from '../components/landing/StepsSection';
import { ResultPreview } from '../components/landing/ResultPreview';
import { CTAButton } from '../components/landing/CTAButton';

import {
  HiUsers,
  HiShieldCheck,
  HiClock,
  HiCheckCircle,
  HiBanknotes,
  HiLightBulb,
} from 'react-icons/hi2';

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUIZ_ROUTE = '/teste-gratuito';

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Fernanda Oliveira',
    location: 'São Paulo, SP',
    text: 'Em 2 minutos descobri que meu perfil de engenheira com mestrado era perfeito para o EB-2 NIW. Economizei meses de pesquisa!',
    visa: 'EB-2 NIW',
    avatar: 'FO',
  },
  {
    name: 'Rodrigo Mendes',
    location: 'Belo Horizonte, MG',
    text: 'Eu ficava tentando o H-1B sem sucesso há 3 anos. A análise mostrou que meu perfil de professor se encaixava muito melhor no O-1.',
    visa: 'O-1',
    avatar: 'RM',
  },
  {
    name: 'Camila Torres',
    location: 'Rio de Janeiro, RJ',
    text: 'A clareza que o teste me deu foi incrível. Saí sem saber nada e entrei sabendo exatamente qual visto buscar e por quê.',
    visa: 'F-1',
    avatar: 'CT',
  },
];

const PAIN_POINTS = [
  {
    icon: HiBanknotes,
    title: 'Evite gastar dinheiro sem necessidade',
    description:
      'Advogados de imigração custam caro. Antes de contratar qualquer um, saiba qual visto faz sentido para o seu perfil.',
    accent: 'from-red-500 to-rose-600',
    shadow: 'shadow-red-100',
  },
  {
    icon: HiShieldCheck,
    title: 'Pare de tentar o visto errado',
    description:
      'Candidaturas rejeitadas além de custosas, podem comprometer futuras tentativas. Conheça suas reais chances antes de agir.',
    accent: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-100',
  },
  {
    icon: HiLightBulb,
    title: 'Tenha clareza em poucos minutos',
    description:
      'Chega de navegar por dezenas de sites contraditórios. Nossa IA analisa seu perfil e te dá uma resposta clara e objetiva.',
    accent: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-100',
  },
];

const STATS = [
  { value: '+3.000', label: 'perfis analisados', icon: HiUsers },
  { value: '2 min', label: 'tempo médio do teste', icon: HiClock },
  { value: '100%', label: 'gratuito e sem compromisso', icon: HiCheckCircle },
  { value: '8+', label: 'tipos de visto avaliados', icon: HiShieldCheck },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false);

  // Redirects authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show sticky CTA after scrolling 300px on mobile
  useEffect(() => {
    const onScroll = () => setShowMobileStickyCta(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (user) return null;

  return (
    <>
      <Head>
        <title>Descubra seu visto ideal | MoveEasy Immigration</title>
        <meta
          name="description"
          content="Faça um teste gratuito de 2 minutos e descubra qual visto americano você tem mais chances de conseguir. Análise personalizada com IA."
        />
      </Head>

      <Layout headerTheme="dark">
        {/* ── 1. Hero ───────────────────────────────────────── */}
        <HeroSection quizRoute={QUIZ_ROUTE} />

        {/* ── 2. Stats Bar ─────────────────────────────────── */}
        <div className="bg-slate-900 border-y border-slate-800">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y-0 divide-slate-700 sm:divide-x">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 justify-center">
                    <Icon className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-white font-extrabold text-lg leading-none">
                        {stat.value}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 3. Prova Social ──────────────────────────────── */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50" id="depoimentos">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
                Prova social
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Mais de 3.000 pessoas já analisaram seu perfil
              </h2>
              <p className="mt-4 text-slate-500 text-sm max-w-xl mx-auto">
                Veja o que quem já fez o teste está dizendo sobre a clareza que recebeu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <TestimonialCard key={t.name} testimonial={t} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Como Funciona ─────────────────────────────── */}
        <StepsSection />

        {/* ── 5. Preview de Resultado ──────────────────────── */}
        <ResultPreview />

        {/* ── 6. Dores do usuário ──────────────────────────── */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" id="dores">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">
                Por que fazer o teste agora
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Pare de perder tempo e dinheiro
              </h2>
              <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm">
                Imigrar é um processo caro e complexo. Mas a primeira etapa pode ser gratuita e
                levar 2 minutos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PAIN_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className={`bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-200 group`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${point.accent} flex items-center justify-center mb-5 shadow-xl ${point.shadow} group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-base mb-3">{point.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{point.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 7. CTA Final ─────────────────────────────────── */}
        <section className="py-24 bg-white" id="cta-final">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-blue-700 text-xs font-semibold tracking-wide uppercase">
                Gratuito • Resultado imediato
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Pronto para descobrir seu{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                caminho para os EUA?
              </span>
            </h2>

            <p className="mt-5 text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
              Mais de 3.000 pessoas já usaram nossa análise para tomar a decisão certa.
              Leva menos de 2 minutos e é 100% gratuito.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton
                href={QUIZ_ROUTE}
                label="Iniciar meu teste agora"
                id="cta-final-btn"
              />
              <Link href="/login">
                <button className="inline-flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 font-medium text-sm rounded-2xl px-6 py-4 transition-all duration-200 w-full sm:w-auto">
                  Já tenho conta →
                </button>
              </Link>
            </div>

            <p className="mt-5 text-xs text-slate-400">
              Sem compromisso. Sem cartão de crédito. Resultado imediato.
            </p>
          </div>
        </section>

        {/* ── 8. Footer ────────────────────────────────────── */}
        <footer className="bg-slate-900 border-t border-slate-800 py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Logo / brand */}
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl px-2 py-1 shadow-sm">
                  <img
                    src="/logo.png"
                    alt="MoveEasy Immigration"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <span className="text-slate-400 text-sm">MoveEasy Immigration</span>
              </div>

              {/* Disclaimer */}
              <p className="text-slate-500 text-xs text-center max-w-sm">
                ⚠️ Não somos advogados de imigração. As informações fornecidas são orientativas e
                não substituem aconselhamento jurídico profissional.
              </p>

              {/* Links */}
              <nav className="flex items-center gap-4 text-xs text-slate-500">
                <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
                  Privacidade
                </Link>
                <span className="text-slate-700">•</span>
                <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
                  Termos de Uso
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </Layout>

      {/* ── Mobile sticky CTA ─────────────────────────────── */}
      {showMobileStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-slate-200 shadow-2xl p-4">
          <CTAButton
            href={QUIZ_ROUTE}
            label="Iniciar teste grátis"
            id="sticky-mobile-cta"
            fullWidth
          />
        </div>
      )}
    </>
  );
}
