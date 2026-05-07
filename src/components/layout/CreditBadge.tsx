import Link from 'next/link';
import { useCredits } from '../../hooks/useCredits';
import { HiCreditCard } from 'react-icons/hi2';

interface CreditBadgeProps {
  theme?: 'dark' | 'light';
}

/**
 * Badge do saldo de créditos para exibir no Header.
 * Ao clicar, direciona para /comprar-creditos.
 */
export function CreditBadge({ theme = 'dark' }: CreditBadgeProps) {
  const { credits, loading, isAdmin } = useCredits();
  const isDark = theme === 'dark';

  if (loading) return null;

  // Admins não mostram saldo de créditos
  if (isAdmin) return null;

  const isLow = credits <= 5;
  const isEmpty = credits === 0;

  return (
    <Link href="/comprar-creditos" className="group">
      <span
        className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${
          isEmpty
            ? isDark
              ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
            : isLow
            ? isDark
              ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            : isDark
            ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
      >
        <HiCreditCard className="w-3.5 h-3.5" />
        {isEmpty ? 'Sem créditos' : `${credits} crédito${credits !== 1 ? 's' : ''}`}
      </span>
    </Link>
  );
}
