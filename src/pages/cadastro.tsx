import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { signUp, signInWithGoogle } from '../lib/auth';
import { HiMail, HiLockClosed, HiUser } from 'react-icons/hi';
import { HiArrowRight, HiCheckBadge } from 'react-icons/hi2';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Cadastro() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    if (formData.password.length < 6) newErrors.password = 'Mínimo de 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsLoading(false); return; }
    try {
      await signUp(formData.email, formData.password, formData.name);
      router.push('/questionario');
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    try {
      await signInWithGoogle();
      router.push('/questionario');
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  return (
    <Layout showHeader={false}>
      <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-900 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 80% 20%, #6366F1, transparent 50%), radial-gradient(circle at 20% 80%, #3B82F6, transparent 40%)'
          }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2.5 mb-12">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-xs tracking-wider">ME</span>
              </div>
              <span className="text-xl font-bold">Move<span className="text-blue-300">Easy</span></span>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Comece sua jornada<br />rumo aos EUA
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Crie sua conta gratuita e receba um plano personalizado para o seu processo de imigração.
            </p>
          </div>
          <div className="relative">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">O que você ganha</p>
            <div className="space-y-3">
              {[
                'Questionário de visto personalizado',
                'Treino de entrevista com IA',
                'Trilha completa de documentos',
                'Assistente DS-160',
                'Análise de perfil EB2 NIW',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <HiCheckBadge className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-sm text-white/90">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Criar conta gratuita</h1>
              <p className="text-slate-500 text-sm">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  Faça login
                </Link>
              </p>
            </div>

            {errors.general && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mb-6"
              onClick={handleGoogleLogin}
              isLoading={isGoogleLoading}
              type="button"
            >
              <GoogleIcon /> Continuar com Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-slate-400 font-medium">ou cadastre com email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome completo"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Seu nome completo"
                prefixIcon={<HiUser className="w-4 h-4" />}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="seu@email.com"
                prefixIcon={<HiMail className="w-4 h-4" />}
                required
              />
              <Input
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                prefixIcon={<HiLockClosed className="w-4 h-4" />}
                hint="Mínimo de 6 caracteres"
                required
              />
              <Input
                label="Confirmar senha"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                prefixIcon={<HiLockClosed className="w-4 h-4" />}
                required
              />

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input type="checkbox" className="h-4 w-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" required />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Ao criar sua conta, você concorda com nossos{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">Termos de Uso</a>
                  {' '}e{' '}
                  <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">Política de Privacidade</Link>
                </span>
              </label>

              <Button type="submit" className="w-full gap-2" size="lg" isLoading={isLoading}>
                Criar conta grátis <HiArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
