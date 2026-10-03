import Link from 'next/link';
import { HiArrowRight, HiArrowUpRight, HiCheckCircle } from 'react-icons/hi2';
import type { Country, CountryId } from '../../lib/global-guide';
import { CountryFlag } from './CountryFlag';

export const cardGradients: Record<CountryId, string> = {
  eua: 'linear-gradient(130deg, #2d6579, #16374f)',
  canada: 'linear-gradient(130deg, #d97a68, #a54c48)',
  portugal: 'linear-gradient(130deg, #309a77, #12636b)',
  alemanha: 'linear-gradient(130deg, #627579, #273e4d)',
  espanha: 'linear-gradient(130deg, #e6a45a, #bd6d50)',
  italia: 'linear-gradient(130deg, #72a58b, #31685f)',
  paraguai: 'linear-gradient(130deg, #779cb8, #396783)',
};

export function CountryCard({ country, index, compact = false }: { country: Country; index: number; compact?: boolean }) {
  return <Link href={`/destinos/${country.id}`} className="guide-country-card group">
    <div className="guide-country-cover" style={{ '--card-gradient': cardGradients[country.id] } as React.CSSProperties}>
      <span className="guide-country-number">DESTINO {String(index + 1).padStart(2, '0')}</span>
    </div>
    <span className="guide-country-flag"><CountryFlag countryId={country.id} className="w-10" /></span>
    <div className="guide-country-content">
      <p className="!mt-0 !text-xs !font-bold !tracking-widest !uppercase !text-teal-700">{country.language}</p>
      <h3 className="mt-1">{country.name}</h3>
      <p>{compact ? country.introduction.split(';')[0] : country.introduction}</p>
      <span className="guide-link inline-flex items-center gap-1 mt-4 text-sm">Conhecer caminhos <HiArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></span>
    </div>
  </Link>;
}

export function HeroMap() {
  return <div className="guide-map" aria-label="Bandeiras dos Estados Unidos, Canadá, Portugal, Alemanha, Espanha, Itália e Paraguai" role="img">
    {(['eua', 'canada', 'portugal', 'alemanha', 'espanha', 'italia', 'paraguai'] as const).map((countryId) =>
      <span key={countryId} className={`guide-map-flag ${countryId}`}><CountryFlag countryId={countryId} className="w-full" /></span>
    )}
  </div>;
}

export function GuideFooter() {
  return <footer className="guide-footer"><div className="guide-container py-7 flex flex-wrap items-center justify-between gap-3"><span className="font-bold text-slate-800">MoveEasy <span className="text-teal-700">/</span> Guia de Imigração</span><span>Planeje com informação. Decida no seu tempo.</span><Link href="/privacy-policy" className="guide-link">Privacidade</Link></div></footer>;
}

export function GuideProof() {
  return <div className="guide-proof"><span><HiCheckCircle className="size-5" /> Diagnóstico gratuito</span><span><HiCheckCircle className="size-5" /> Fontes oficiais</span><span><HiCheckCircle className="size-5" /> No seu ritmo</span></div>;
}

export function Arrow() { return <HiArrowRight className="size-5" aria-hidden="true" />; }
