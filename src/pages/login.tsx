import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { signIn, signInWithGoogle } from '../lib/auth';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import { HiArrowRight } from 'react-icons/hi2';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsLoading(false); return; }
    try {
      await signIn(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ general: 'Email ou senha incorretos. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    try {
      await signInWithGoogle();
      router.push('/dashboard');
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
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex">
        {/* Left panel — branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, #3B82F6, transparent 50%), radial-gradient(circle at 80% 20%, #6366F1, transparent 40%)'
          }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2.5 mb-12">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-xs tracking-wider">ME</span>
              </div>
              <span className="text-xl font-bold">Move<span className="text-blue-300">Easy</span></span>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Sua jornada para<br />os EUA começa aqui
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Plataforma completa para guiar você em cada etapa do processo de imigração americano.
            </p>
          </div>
          <div className="relative space-y-4">
            {[
              { label: 'Questionário personalizado', desc: 'Descubra o visto ideal para seu perfil' },
              { label: 'Treino com IA', desc: 'Pratique sua entrevista de visto' },
              { label: 'Trilha de documentos', desc: 'Lista completa para cada tipo de visto' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/30 border border-blue-400/50 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{f.label}</p>
                  <p className="text-blue-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Bem-vindo de volta</h1>
              <p className="text-slate-500 text-sm">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  Cadastre-se grátis
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

            {/* Google */}
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
                <span className="px-3 bg-white text-xs text-slate-400 font-medium">ou entre com email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                required
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
                  <span className="text-slate-600">Lembrar de mim</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
                  Esqueceu a senha?
                </a>
              </div>
              <Button type="submit" className="w-full gap-2" size="lg" isLoading={isLoading}>
                Entrar <HiArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-8">
              Ao entrar, você concorda com nossos{' '}
              <Link href="/privacy-policy" className="text-slate-500 hover:text-slate-700 underline underline-offset-2">
                Termos de Uso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}