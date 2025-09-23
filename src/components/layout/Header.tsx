import Link from 'next/link';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

export function Header() {
  const { user, userProfile, logout } = useAuth();
  const { hasActiveSubscription, isAdmin, subscriptionStatus } = useSubscription();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">US</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                MoveEasy
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              // Navigation for authenticated users
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/questionario" className="text-gray-600 hover:text-gray-900">
                  Questionário
                </Link>
                <Link href="/ds160" className="text-gray-600 hover:text-gray-900">
                  DS-160
                </Link>
                <Link href="/treinamento" className="text-gray-600 hover:text-gray-900">
                  Treino AI
                </Link>
                <Link href="/eb2-niw" className="text-gray-600 hover:text-gray-900">
                  EB2 NIW
                </Link>
                <Link href="/vistos" className="text-gray-600 hover:text-gray-900">
                  Tipos de Visto
                </Link>
                {!isAdmin && (
                  <Link href="/subscription" className="text-gray-600 hover:text-gray-900">
                    Assinatura
                  </Link>
                )}
              </>
            ) : (
              // Navigation for non-authenticated users
              <>
                <Link href="/#features" className="text-gray-600 hover:text-gray-900">
                  Funcionalidades
                </Link>
                <Link href="/#benefits" className="text-gray-600 hover:text-gray-900">
                  Vantagens
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Subscription Status Badge */}
                {!isAdmin && (
                  <div className="flex items-center space-x-2">
                    {hasActiveSubscription ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Ativo
                      </span>
                    ) : (
                      <Link href="/subscription">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer">
                          ⚠ Assinar
                        </span>
                      </Link>
                    )}
                  </div>
                )}
                
                <span className="text-sm text-gray-700">
                  Olá, {userProfile?.name || user.displayName || 'Usuário'}
                  {isAdmin && <span className="ml-1 text-blue-600 font-medium">(Admin)</span>}
                </span>
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button variant="primary" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
