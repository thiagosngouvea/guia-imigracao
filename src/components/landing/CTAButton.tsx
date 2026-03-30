import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';
import { clsx } from 'clsx';

interface CTAButtonProps {
  href: string;
  label?: string;
  size?: 'md' | 'lg';
  id?: string;
  className?: string;
  fullWidth?: boolean;
}

export function CTAButton({
  href,
  label = 'Iniciar teste grátis',
  size = 'lg',
  id,
  className,
  fullWidth = false,
}: CTAButtonProps) {
  return (
    <Link href={href} id={id} className={clsx(fullWidth ? 'block w-full' : 'inline-block')}>
      <button
        className={clsx(
          'group inline-flex items-center justify-center gap-3',
          'bg-gradient-to-r from-blue-600 to-indigo-600',
          'hover:from-blue-500 hover:to-indigo-500',
          'text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25',
          'transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]',
          size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm',
          fullWidth && 'w-full',
          className
        )}
      >
        🚀 {label}
        <HiArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </Link>
  );
}
