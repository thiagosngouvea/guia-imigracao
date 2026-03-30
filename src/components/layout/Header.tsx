import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';

interface HeaderProps {
  theme?: 'dark' | 'light';
}

export function Header({ theme = 'dark' }: HeaderProps) {
  const { user, userProfile, logout } = useAuth();
  const { hasActiveSubscription, isAdmin } = useSubscription();
  const router = useRouter();

  const isDark = theme === 'dark';

  const navLinks = user ? [
    { href: '/dashboard',   label: 'Dashboard' },
    { href: '/questionario', label: 'Questionário' },
    { href: '/ds160',        label: 'DS-160' },
    { href: '/treinamento',  label: 'Treino IA' },
    { href: '/eb2-niw',      label: 'EB2 NIW' },
    { href: '/vistos',       label: 'Vistos' },
    ...(!isAdmin ? [{ href: '/subscription', label: 'Assinatura' }] : []),
  ] : [
    { href: '/#features', label: 'Funcionalidades' },
    { href: '/#benefits', label: 'Vantagens' },
  ];

  const displayName = userProfile?.displayName || userProfile?.fullName || userProfile?.name || user?.displayName || 'U';
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header
      className={`border-b sticky top-0 z-50 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center group">
            <div className="bg-white rounded-xl px-2 py-1 shadow-sm group-hover:shadow-md transition-shadow">
              <img
                src="/logo.png"
                alt="MoveEasy Immigration"
                className="h-9 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = router.pathname === href || router.pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isDark
                      ? isActive
                        ? 'text-white bg-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      : isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Subscription badge */}
                {!isAdmin && (
                  hasActiveSubscription ? (
                    <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <HiCheckCircle className="w-3.5 h-3.5" />
                      Ativo
                    </span>
                  ) : (
                    <Link href="/subscription">
                      <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        isDark
                          ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}>
                        <HiExclamationCircle className="w-3.5 h-3.5" />
                        Assinar
                      </span>
                    </Link>
                  )
                )}

                {/* User avatar */}
                <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {displayName.split(' ')[0]}
                    {isAdmin && <span className="ml-1 text-blue-400 text-xs">(Admin)</span>}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className={isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : ''}>
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button variant="primary" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
