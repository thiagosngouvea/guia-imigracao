import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-red-700 to-blue-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white font-semibold">Carregando seu sonho americano...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <Layout>
      {/* Hero Section com fundo escuro para texto branco */}
      <section className="relative bg-gradient-to-br from-blue-900 via-red-700 to-blue-900 py-20 overflow-hidden">
        {/* Padrão de estrelas */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-8 p-8">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="text-white text-2xl text-center">⭐</div>
            ))}
          </div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* <div className="mb-8">
              <span className="text-6xl">🇺🇸</span>
            </div> */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Conquiste seu{' '}
              <span className="text-yellow-300 drop-shadow-lg">Visto Americano</span>
              <br />
              para Turismo ou Estudos
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              🗽 Especialistas em vistos B1/B2 (Turismo) e F1 (Estudante)! Com inteligência artificial avançada, 
              te preparamos para conquistar seu visto e realizar seu sonho de conhecer ou estudar nos Estados Unidos.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/cadastro">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl border-2 border-white">
                  🚀 Começar Agora
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold">
                  Já tenho conta
                </Button>
              </Link>
            </div>
            {/* <div className="mt-8 text-yellow-300 font-semibold">
              ⚡ Milhares de brasileiros já realizaram o sonho! ⚡
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-white to-blue-50"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
              🇺🇸 Especialistas em Vistos B1/B2 e F1 🇺🇸
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-700">
              Tudo que você precisa para conquistar seu visto de turismo ou estudante nos EUA
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col bg-gradient-to-br from-blue-50 to-red-50 p-8 rounded-xl border-l-4 border-blue-700 shadow-lg">
                <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-blue-900">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-red-600 shadow-lg">
                    <span className="text-white text-xl">🎯</span>
                  </div>
                  Diagnóstico de Visto
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-700">
                  <p className="flex-auto">
                    Descubra se você se qualifica melhor para o visto B1/B2 (turismo/negócios) ou F1 (estudante)! 
                    Nossa IA analisa seu perfil e indica a melhor estratégia.
                  </p>
                </dd>
              </div>
              
              <div className="flex flex-col bg-gradient-to-br from-red-50 to-blue-50 p-8 rounded-xl border-l-4 border-red-600 shadow-lg">
                <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-red-700">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-blue-700 shadow-lg">
                    <span className="text-white text-xl">🎓</span>
                  </div>
                  Simulação de Entrevista
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-700">
                  <p className="flex-auto">
                    Pratique entrevistas específicas para seu tipo de visto! Simulações reais para B1/B2 e F1 
                    com feedback personalizado para cada situação.
                  </p>
                </dd>
              </div>
              
              <div className="flex flex-col bg-gradient-to-br from-blue-50 to-red-50 p-8 rounded-xl border-l-4 border-yellow-500 shadow-lg">
                <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-yellow-700">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-red-600 shadow-lg">
                    <span className="text-white text-xl">📚</span>
                  </div>
                  Guias Especializados
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-700">
                  <p className="flex-auto">
                    🗽 Manuais completos para vistos B1/B2 e F1! Documentação necessária, dicas exclusivas 
                    e estratégias aprovadas por especialistas americanos.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Por que escolher nossa plataforma?
            </h2>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              <div className="flex items-start gap-x-4">
                <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-gray-900">Resultados Comprovados</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    Milhares de pessoas já conseguiram seus vistos americanos com nossa orientação especializada.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-x-4">
                <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-gray-900">Disponível 24/7</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    Acesse a plataforma e pratique suas entrevistas a qualquer hora, no seu próprio ritmo.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-x-4">
                <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-gray-900">Dados Seguros</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    Suas informações pessoais são protegidas com os mais altos padrões de segurança.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-x-4">
                <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 text-gray-900">Suporte Especializado</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    Equipe de advogados de imigração e especialistas prontos para te ajudar quando precisar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Números que falam por si
            </h2>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-4 gap-4">
              <div className="text-center bg-gradient-to-br from-blue-100 to-red-100 p-8 rounded-xl shadow-lg">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-red-600">AI</div>
                <div className="mt-2 text-sm font-bold text-blue-900">🤖 Treinamento com IA</div>
                <div className="mt-1 text-xs text-gray-700">Simulações inteligentes</div>
              </div>
              
              <div className="text-center bg-gradient-to-br from-red-100 to-yellow-100 p-8 rounded-xl shadow-lg">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">100%</div>
                <div className="mt-2 text-sm font-bold text-red-700">🎯 Personalizado</div>
                <div className="mt-1 text-xs text-gray-700">Baseado no seu perfil</div>
              </div>
              
              <div className="text-center bg-gradient-to-br from-yellow-100 to-blue-100 p-8 rounded-xl shadow-lg">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-blue-600">2</div>
                <div className="mt-2 text-sm font-bold text-yellow-700">📋 Especialidades</div>
                <div className="mt-1 text-xs text-gray-700">B1/B2 e F1 - Em breve mais!</div>
              </div>
              
              <div className="text-center bg-gradient-to-br from-blue-100 to-red-100 p-8 rounded-xl shadow-lg">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-red-600">24/7</div>
                <div className="mt-2 text-sm font-bold text-blue-700">⚡ Disponível</div>
                <div className="mt-1 text-xs text-gray-700">Acesso a qualquer hora</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção específica sobre os vistos */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-red-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
              🎯 Nossos Vistos Especializados
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-700">
              Foco total em B1/B2 e F1 - os vistos mais procurados por brasileiros
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Visto B1/B2 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-blue-600">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg mr-4">
                    <span className="text-white text-2xl">🏖️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900">Visto B1/B2</h3>
                    <p className="text-blue-700 font-semibold">Turismo • Negócios • Família</p>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Viagens de turismo e lazer
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Visitas a familiares e amigos
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Participação em eventos e conferências
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Tratamentos médicos
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Permanência até 6 meses
                  </li>
                </ul>
              </div>

              {/* Visto F1 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-red-600">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-800 shadow-lg mr-4">
                    <span className="text-white text-2xl">🎓</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-red-900">Visto F1</h3>
                    <p className="text-red-700 font-semibold">Estudante • Acadêmico</p>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Cursos de inglês e idiomas
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Graduação e pós-graduação
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Cursos técnicos e profissionalizantes
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Possibilidade de trabalho no campus
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✅</span>
                    Duração conforme o curso
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Banner de expansão futura */}
            <div className="mt-12 bg-gradient-to-r from-yellow-100 to-blue-100 p-6 rounded-xl border-l-4 border-yellow-500 text-center">
              <h4 className="text-xl font-bold text-blue-900 mb-2">🚀 Em breve: Mais tipos de visto!</h4>
              <p className="text-gray-700">
                Estamos expandindo nossa plataforma para incluir vistos H1B, O1, EB5 e muito mais. 
                Cadastre-se agora e seja o primeiro a saber quando estiverem disponíveis!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 via-red-700 to-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pronto para começar sua jornada?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Junte-se a milhares de pessoas que já conseguiram realizar o sonho americano com nossa ajuda.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/cadastro">
                <Button variant="secondary" size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl border-2 border-white">
                  Criar conta gratuita
                </Button>
              </Link>
              <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-100">
                Já tenho conta <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}