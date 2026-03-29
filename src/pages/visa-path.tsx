import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import { getAnalysisResult, VisaRecommendation } from '../lib/visa-service';
import { createVisaPath } from '../lib/visa-path-service';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Lista de todos os vistos disponíveis
const ALL_VISA_TYPES: Omit<VisaRecommendation, 'compatibility'>[] = [
  {
    visaType: 'H-1B',
    country: 'Estados Unidos',
    description: 'Visto para profissionais especializados com oferta de emprego de empresa americana.',
    processingTime: '6-12 meses',
    estimatedCost: 15000,
    requirements: ['Diploma de ensino superior', 'Oferta de emprego nos EUA', 'Empregador deve fazer petition', 'Aprovação no sistema de loteria'],
    pros: ['Permite trabalho legal', 'Caminho para green card', 'Família pode acompanhar'],
    cons: ['Sistema de loteria', 'Depende do empregador', 'Processamento longo'],
  },
  {
    visaType: 'O-1',
    country: 'Estados Unidos',
    description: 'Para indivíduos com habilidades extraordinárias em artes, ciências, negócios, educação ou atletismo.',
    processingTime: '2-4 meses',
    estimatedCost: 25000,
    requirements: ['Evidência de habilidades extraordinárias', 'Prêmios ou reconhecimento internacional', 'Publicações ou mídia sobre seu trabalho', 'Patrocinador nos EUA'],
    pros: ['Não tem loteria', 'Renovável indefinidamente', 'Prestígio'],
    cons: ['Requisitos muito altos', 'Custo elevado', 'Documentação extensa'],
  },
  {
    visaType: 'EB-2 NIW',
    country: 'Estados Unidos',
    description: 'Green card para profissionais com pós-graduação ou habilidades excepcionais de interesse nacional.',
    processingTime: '12-24 meses',
    estimatedCost: 30000,
    requirements: ['Mestrado ou Doutorado', 'Trabalho de interesse nacional dos EUA', 'Auto-petição (não precisa de empregador)', 'Evidências de contribuições significativas'],
    pros: ['Green card direto', 'Auto-petição', 'Sem necessidade de empregador'],
    cons: ['Processo longo', 'Alto custo', 'Requisitos rigorosos'],
  },
  {
    visaType: 'EB-5',
    country: 'Estados Unidos',
    description: 'Green card por investimento em negócio americano que crie empregos.',
    processingTime: '18-36 meses',
    estimatedCost: 800000,
    requirements: ['Investimento de US$ 800.000 a US$ 1.050.000', 'Criar 10 empregos em tempo integral', 'Investir em regional center ou negócio direto', 'Comprovar origem lícita dos fundos'],
    pros: ['Green card para toda família', 'Flexibilidade geográfica', 'Não precisa gerenciar negócio'],
    cons: ['Investimento muito alto', 'Risco financeiro', 'Processo complexo'],
  },
  {
    visaType: 'F-1',
    country: 'Estados Unidos',
    description: 'Visto de estudante para cursos acadêmicos ou de idiomas.',
    processingTime: '1-3 meses',
    estimatedCost: 50000,
    requirements: ['Admissão em instituição aprovada', 'Comprovação financeira', 'Vínculos com país de origem', 'I-20 da instituição'],
    pros: ['Caminho para trabalho (OPT/STEM)', 'Experiência americana', 'Oportunidade de networking'],
    cons: ['Trabalho limitado', 'Custo alto de tuition', 'Não é visto de imigrante'],
  },
  {
    visaType: 'L-1',
    country: 'Estados Unidos',
    description: 'Transferência intra-empresa para executivos ou gerentes.',
    processingTime: '2-6 meses',
    estimatedCost: 12000,
    requirements: ['Trabalhar há 1 ano em empresa no exterior', 'Empresa deve ter filial nos EUA', 'Posição de gerência ou conhecimento especializado', 'Empregador deve patrocinar'],
    pros: ['Processamento relativamente rápido', 'Cônjuge pode trabalhar', 'Caminho para green card'],
    cons: ['Depende do empregador', 'Limitado a empresas multinacionais', 'Válido por até 7 anos'],
  },
  {
    visaType: 'E-2',
    country: 'Estados Unidos',
    description: 'Visto para investidores de países com tratado comercial com os EUA.',
    processingTime: '3-6 meses',
    estimatedCost: 100000,
    requirements: ['Nacionalidade de país com tratado E-2', 'Investimento substancial (mínimo US$ 100.000)', 'Negócio ativo e operacional', 'Controle do investimento'],
    pros: ['Renovável indefinidamente', 'Cônjuge pode trabalhar', 'Sem limite de visitas'],
    cons: ['Não leva ao green card', 'Investimento em risco', 'Requer gestão ativa'],
  },
  {
    visaType: 'EB-1',
    country: 'Estados Unidos',
    description: 'Green card para pessoas com habilidades extraordinárias, professores/pesquisadores destacados, ou executivos multinacionais.',
    processingTime: '8-12 meses',
    estimatedCost: 25000,
    requirements: ['Evidência de reconhecimento internacional', 'Prêmios de prestígio nacional/internacional', 'Publicações ou contribuições significativas', 'Posição de destaque na área'],
    pros: ['Green card direto', 'Processamento mais rápido', 'Sem necessidade de PERM'],
    cons: ['Requisitos extremamente altos', 'Documentação extensa', 'Avaliação rigorosa'],
  },
];

function getCompatibilityColor(pct: number) {
  if (pct >= 80) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
  if (pct >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
  return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
}

export default function VisaPathPage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<VisaRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [selectedConfirm, setSelectedConfirm] = useState<VisaRecommendation | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    try {
      const result = await getAnalysisResult(user.uid);

      const allVisas: VisaRecommendation[] = ALL_VISA_TYPES.map(template => {
        const analyzed = result?.recommendations.find(r => r.visaType === template.visaType);
        return {
          ...template,
          compatibility: analyzed?.compatibility ?? 30,
        };
      });

      allVisas.sort((a, b) => b.compatibility - a.compatibility);
      setRecommendations(allVisas);
    } catch {
      const defaults = ALL_VISA_TYPES.map(t => ({ ...t, compatibility: 30 }));
      setRecommendations(defaults);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPath = async (visa: VisaRecommendation) => {
    if (!user) return;

    setSelecting(visa.visaType);
    setError('');
    try {
      // Salvar o visto selecionado no perfil do usuário
      await setDoc(doc(db, 'users', user.uid), {
        selectedVisaPath: {
          visaType: visa.visaType,
          country: visa.country,
          selectedAt: new Date(),
        },
        selectedVisa: visa.visaType, // compatibilidade legada
      }, { merge: true });

      // Criar a trilha com os steps no Firestore
      await createVisaPath(user.uid, visa.visaType);
      await refreshUserProfile();

      setSuccessMsg(`Trilha ${visa.visaType} selecionada! Redirecionando...`);
      setTimeout(() => router.push('/minha-trilha'), 1500);
    } catch (err) {
      console.error(err);
      setError('Erro ao selecionar trilha. Tente novamente.');
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando recomendações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
          <div className="mx-auto max-w-3xl">

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                <span className="text-4xl">🗺️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Escolha sua Trilha</h1>
              <p className="text-gray-500 mt-2 max-w-xl mx-auto">
                Vistos ordenados por compatibilidade com seu perfil. Você pode escolher qualquer um!
              </p>
              {!userProfile?.hasCompletedQuestionnaire && (
                <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-yellow-800 text-sm">
                  ⚠️ Você ainda não preencheu o questionário. As compatibilidades mostradas são padrão.{' '}
                  <Link href="/questionario" className="underline font-semibold">Preencher agora</Link>
                </div>
              )}
            </div>

            {successMsg && (
              <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-center font-medium">
                ✅ {successMsg}
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-center">
                ⚠️ {error}
              </div>
            )}

            {/* Visa Cards */}
            <div className="space-y-6">
              {recommendations.map((visa) => {
                const colors = getCompatibilityColor(visa.compatibility);
                const isSelecting = selecting === visa.visaType;

                return (
                  <div
                    key={visa.visaType}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{visa.visaType}</h2>
                          <p className="text-sm text-blue-600 font-medium">🇺🇸 {visa.country}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full border ${colors.bg} ${colors.border}`}>
                          <span className={`text-lg font-bold ${colors.text}`}>{visa.compatibility}%</span>
                          <span className={`text-xs ml-1 ${colors.text}`}>compatível</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed">{visa.description}</p>
                    </div>

                    {/* Details */}
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">⏱ Tempo de Processo</p>
                          <p className="text-sm font-semibold text-gray-800">{visa.processingTime}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">💰 Custo Estimado</p>
                          <p className="text-sm font-semibold text-gray-800">
                            R$ {visa.estimatedCost.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">📋 Principais Requisitos:</p>
                        <ul className="space-y-1">
                          {visa.requirements.slice(0, 3).map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-blue-500 mt-0.5">✓</span>
                              {req}
                            </li>
                          ))}
                          {visa.requirements.length > 3 && (
                            <li className="text-sm text-blue-600 italic ml-5">
                              +{visa.requirements.length - 3} requisito(s)
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Pros/Cons quick view */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-1">✅ Vantagens</p>
                          {visa.pros.slice(0, 2).map((p, i) => (
                            <p key={i} className="text-xs text-gray-600">• {p}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-600 mb-1">❌ Desvantagens</p>
                          {visa.cons.slice(0, 2).map((c, i) => (
                            <p key={i} className="text-xs text-gray-600">• {c}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Select Button */}
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => setSelectedConfirm(visa)}
                        disabled={!!selecting}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                          visa.compatibility >= 60
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
                            : 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-200'
                        } ${selecting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSelecting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Criando trilha...
                          </>
                        ) : (
                          <>
                            <span>Escolher esta Trilha</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-sm text-blue-800 leading-relaxed">
                ℹ️ Vistos com <strong>compatibilidade acima de 70%</strong> são mais adequados ao seu perfil.
                Você pode escolher <strong>qualquer trilha</strong>, independente da compatibilidade.
                Cada trilha inclui um guia <strong>passo a passo completo</strong>.
              </p>
            </div>

          </div>
        </div>
      </Layout>

      {/* Confirm Modal */}
      {selectedConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confirmar Escolha</h3>
            <p className="text-gray-600 mb-6">
              Deseja seguir a trilha do visto <strong>{selectedConfirm.visaType}</strong>?
              Você receberá um guia completo com todos os passos necessários.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedConfirm(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  const visa = selectedConfirm;
                  setSelectedConfirm(null);
                  handleSelectPath(visa);
                }}
                className="flex-1"
              >
                ✅ Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </SubscriptionGuard>
  );
}
