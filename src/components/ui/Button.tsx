import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={clsx(
          // Base
          'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          // Variants
          variant === 'primary' && [
            'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
            'hover:from-blue-700 hover:to-indigo-700 hover:shadow-md hover:shadow-blue-500/25',
            'active:scale-[0.98]',
          ],
          variant === 'secondary' && [
            'bg-slate-100 text-slate-800 border border-slate-200',
            'hover:bg-slate-200 hover:border-slate-300',
            'active:scale-[0.98]',
          ],
          variant === 'outline' && [
            'border border-slate-200 bg-white text-slate-700',
            'hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900',
            'active:scale-[0.98]',
          ],
          variant === 'ghost' && [
            'text-slate-600 bg-transparent',
            'hover:bg-slate-100 hover:text-slate-900',
            'active:scale-[0.98]',
          ],
          variant === 'destructive' && [
            'bg-red-50 text-red-600 border border-red-200',
            'hover:bg-red-100 hover:border-red-300',
            'active:scale-[0.98]',
          ],
          // Sizes
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-11 px-6 text-sm',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
