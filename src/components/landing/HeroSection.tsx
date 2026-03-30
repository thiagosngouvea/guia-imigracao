import Link from 'next/link';
import { Button } from '../ui/Button';
import { HiArrowRight, HiShieldCheck, HiStar } from 'react-icons/hi2';

interface HeroSectionProps {
  quizRoute?: string;
}

export function HeroSection({ quizRoute = '/teste-gratuito' }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 sm:py-28">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.35) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 100% 20%, rgba(37,99,235,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Floating stat chips */}
      <div className="absolute top-16 left-6 hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 shadow-lg">
        <HiStar className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-white text-xs font-medium">+3.000 perfis analisados</span>
      </div>
      <div className="absolute bottom-20 right-6 hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 shadow-lg">
        <HiShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-white text-xs font-medium">100% gratuito</span>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-blue-200 text-xs font-semibold tracking-wide uppercase">
            Análise de perfil com IA • Grátis
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
          Descubra qual visto você tem{' '}
          <span
            className="relative"
            style={{
              background: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            mais chances de conseguir
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Faça um teste gratuito de 2 minutos com base no seu perfil, experiência e
          objetivos — e receba recomendações personalizadas de visto.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={quizRoute} id="hero-cta-primary">
            <button
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-base rounded-2xl px-8 py-4 shadow-xl shadow-blue-900/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
            >
              🚀 Iniciar teste grátis
              <HiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <Link href="/login" id="hero-cta-login">
            <button className="inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 font-medium text-sm rounded-2xl px-6 py-4 transition-all duration-200 w-full sm:w-auto">
              Já tenho conta →
            </button>
          </Link>
        </div>

        {/* Trust text */}
        <p className="mt-5 text-sm text-slate-400 tracking-wide">
          Sem compromisso. Resultado imediato.
        </p>
      </div>
    </section>
  );
}
