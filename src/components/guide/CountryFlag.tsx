import Image from 'next/image';
import type { CountryId } from '../../lib/global-guide';

const flagCodes: Record<CountryId, string> = {
  eua: 'us',
  canada: 'ca',
  portugal: 'pt',
  alemanha: 'de',
  espanha: 'es',
  italia: 'it',
  paraguai: 'py',
};

export function CountryFlag({ countryId, className = 'w-10' }: { countryId: CountryId; className?: string }) {
  return <span className={`inline-flex aspect-[4/3] shrink-0 overflow-hidden rounded-[4px] border border-black/10 shadow-sm ${className}`} aria-hidden="true">
    <Image src={`/flags/${flagCodes[countryId]}.svg`} alt="" width={64} height={48} unoptimized className="block h-full w-full object-cover" />
  </span>;
}
