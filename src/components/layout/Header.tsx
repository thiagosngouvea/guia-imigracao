import Link from 'next/link';
import Image from 'next/image';
import { HiGlobeAmericas } from 'react-icons/hi2';
import { useRouter } from 'next/router';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { CreditBadge } from './CreditBadge';

interface HeaderProps {
  theme?: 'dark' | 'light';
}

export function Header({ theme = 'dark' }: HeaderProps) {
  const { user, userProfile, logout } = useAuth();
  const { isAdmin } = useCredits();
  const router = useRouter();

  const isDark = theme === 'dark';

  const navLinks = user ? [
    { href: '/dashboard',              label: 'Dashboard' },
    { href: '/destinos',               label: 'Destinos' },
    { href: '/diagnostico',            label: 'Diagnóstico' },
    { href: '/meu-plano',              label: 'Meus roteiros' },
    { href: '/treinamento',            label: 'Treino IA' },
    { href: '/historico-treinamento',  label: 'Histórico' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ] : [
    { href: '/destinos', label: 'Destinos' },
    { href: '/diagnostico', label: 'Diagnóstico' },
    { href: '/landing', label: 'Ferramentas EUA' },
  ];

  const displayName = userProfile?.displayName || userProfile?.fullName || userProfile?.name || user?.displayName || 'U';
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header
      className={`border-b sticky top-0 z-50 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-[#f8faf7]/95 backdrop-blur-xl border-[#e3ebe5] shadow-[0_3px_20px_rgba(18,58,54,0.04)]'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-3">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group shrink-0" aria-label="MoveEasy, página inicial">
            {isDark ? <div className="bg-white rounded-xl px-2 py-1 shadow-sm group-hover:shadow-md transition-shadow"><Image src="/logo.png" alt="MoveEasy Immigration" width={40} height={40} className="h-9 w-9 object-contain" /></div> : <><span className="size-10 rounded-[13px] bg-[#0d706b] text-white flex items-center justify-center shadow-md shadow-teal-700/15"><HiGlobeAmericas className="size-6" /></span><span className="font-extrabold tracking-[-.06em] text-[1.32rem] text-[#173a40]">move<span className="text-[#0b827a]">easy</span><span className="text-[#f2a563]">.</span></span></>}
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-1">
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
                        ? 'text-teal-800 bg-teal-50'
                        : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${isDark ? 'bg-blue-500' : 'bg-teal-600'}`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Badge de créditos */}
                <CreditBadge theme={theme} />

                {/* User avatar — links to profile */}
                <Link href="/perfil">
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {displayName.split(' ')[0]}
                      {isAdmin && <span className="ml-1 text-blue-400 text-xs">(Admin)</span>}
                    </span>
                  </div>
                </Link>

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
                {isDark ? <Link href="/cadastro"><Button variant="primary" size="sm">Cadastrar</Button></Link> : <Link href="/diagnostico" className="hidden sm:inline-flex rounded-xl bg-[#0d706b] px-4 py-2.5 text-white text-sm font-bold hover:bg-[#095d59] transition-colors">Começar grátis</Link>}
              </>
            )}
          </div>
        </div>
        <nav className="lg:hidden flex gap-2 overflow-x-auto pb-2" aria-label="Navegação principal">
          {navLinks.map(({ href, label }) => <Link key={href} href={href} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border ${isDark ? 'bg-white/10 text-slate-200 border-white/10' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
