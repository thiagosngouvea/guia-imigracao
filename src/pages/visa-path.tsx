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
import { HiMap, HiClock, HiQuestionMarkCircle } from 'react-icons/hi';
import { HiCheckBadge, HiArrowRight, HiGlobeAmericas, HiCurrencyDollar, HiExclamationTriangle } from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';

const ALL_VISA_TYPES: Omit<VisaRecommendation, 'compatibility'>[] = [
  { visaType: 'H-1B', country: 'Estados Unidos', description: 'Visto para profissionais especializados com oferta de emprego de empresa americana.', processingTime: '6-12 meses', estimatedCost: 15000, requirements: ['Diploma de ensino superior', 'Oferta de emprego nos EUA', 'Empregador deve fazer petition', 'Aprovação no sistema de loteria'], pros: ['Permite trabalho legal', 'Caminho para green card', 'Família pode acompanhar'], cons: ['Sistema de loteria', 'Depende do empregador', 'Processamento longo'] },
  { visaType: 'O-1', country: 'Estados Unidos', description: 'Para indivíduos com habilidades extraordinárias em artes, ciências, negócios, educação ou atletismo.', processingTime: '2-4 meses', estimatedCost: 25000, requirements: ['Evidência de habilidades extraordinárias', 'Prêmios ou reconhecimento internacional', 'Publicações ou mídia sobre seu trabalho', 'Patrocinador nos EUA'], pros: ['Não tem loteria', 'Renovável indefinidamente', 'Prestígio'], cons: ['Requisitos muito altos', 'Custo elevado', 'Documentação extensa'] },
  { visaType: 'EB-2 NIW', country: 'Estados Unidos', description: 'Green card para profissionais com pós-graduação ou habilidades excepcionais de interesse nacional.', processingTime: '12-24 meses', estimatedCost: 30000, requirements: ['Mestrado ou Doutorado', 'Trabalho de interesse nacional dos EUA', 'Auto-petição (não precisa de empregador)', 'Evidências de contribuições significativas'], pros: ['Green card direto', 'Auto-petição', 'Sem necessidade de empregador'], cons: ['Processo longo', 'Alto custo', 'Requisitos rigorosos'] },
  { visaType: 'EB-5', country: 'Estados Unidos', description: 'Green card por investimento em negócio americano que crie empregos.', processingTime: '18-36 meses', estimatedCost: 800000, requirements: ['Investimento de US$ 800.000 a US$ 1.050.000', 'Criar 10 empregos em tempo integral', 'Investir em regional center ou negócio direto', 'Comprovar origem lícita dos fundos'], pros: ['Green card para toda família', 'Flexibilidade geográfica', 'Não precisa gerenciar negócio'], cons: ['Investimento muito alto', 'Risco financeiro', 'Processo complexo'] },
  { visaType: 'F-1', country: 'Estados Unidos', description: 'Visto de estudante para cursos acadêmicos ou de idiomas.', processingTime: '1-3 meses', estimatedCost: 50000, requirements: ['Admissão em instituição aprovada', 'Comprovação financeira', 'Vínculos com país de origem', 'I-20 da instituição'], pros: ['Caminho para trabalho (OPT/STEM)', 'Experiência americana', 'Oportunidade de networking'], cons: ['Trabalho limitado', 'Custo alto de tuition', 'Não é visto de imigrante'] },
  { visaType: 'L-1', country: 'Estados Unidos', description: 'Transferência intra-empresa para executivos ou gerentes.', processingTime: '2-6 meses', estimatedCost: 12000, requirements: ['Trabalhar há 1 ano em empresa no exterior', 'Empresa deve ter filial nos EUA', 'Posição de gerência ou conhecimento especializado', 'Empregador deve patrocinar'], pros: ['Processamento relativamente rápido', 'Cônjuge pode trabalhar', 'Caminho para green card'], cons: ['Depende do empregador', 'Limitado a empresas multinacionais', 'Válido por até 7 anos'] },
  { visaType: 'E-2', country: 'Estados Unidos', description: 'Visto para investidores de países com tratado comercial com os EUA.', processingTime: '3-6 meses', estimatedCost: 100000, requirements: ['Nacionalidade de país com tratado E-2', 'Investimento substancial (mínimo US$ 100.000)', 'Negócio ativo e operacional', 'Controle do investimento'], pros: ['Renovável indefinidamente', 'Cônjuge pode trabalhar', 'Sem limite de visitas'], cons: ['Não leva ao green card', 'Investimento em risco', 'Requer gestão ativa'] },
  { visaType: 'EB-1', country: 'Estados Unidos', description: 'Green card para pessoas com habilidades extraordinárias, professores/pesquisadores destacados, ou executivos multinacionais.', processingTime: '8-12 meses', estimatedCost: 25000, requirements: ['Evidência de reconhecimento internacional', 'Prêmios de prestígio nacional/internacional', 'Publicações ou contribuições significativas', 'Posição de destaque na área'], pros: ['Green card direto', 'Processamento mais rápido', 'Sem necessidade de PERM'], cons: ['Requisitos extremamente altos', 'Documentação extensa', 'Avaliação rigorosa'] },
];

function CompatibilityBadge({ pct }: { pct: number }) {
  const cls = pct >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              pct >= 60 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-red-100 text-red-600 border-red-200';
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold ${cls}`}>
      <div className={`w-2 h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} />
      {pct}% compatível
    </div>
  );
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

  useEffect(() => { if (!user) return; loadRecommendations(); }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    try {
      const result = await getAnalysisResult(user.uid);
      const allVisas: VisaRecommendation[] = ALL_VISA_TYPES.map(template => {
        const analyzed = result?.recommendations.find(r => r.visaType === template.visaType);
        return { ...template, compatibility: analyzed?.compatibility ?? 30 };
      });
      allVisas.sort((a, b) => b.compatibility - a.compatibility);
      setRecommendations(allVisas);
    } catch {
      setRecommendations(ALL_VISA_TYPES.map(t => ({ ...t, compatibility: 30 })));
    } finally { setLoading(false); }
  };

  const handleSelectPath = async (visa: VisaRecommendation) => {
    if (!user) return;
    setSelecting(visa.visaType);
    setError('');
    try {
      await setDoc(doc(db, 'users', user.uid), {
        selectedVisaPath: { visaType: visa.visaType, country: visa.country, selectedAt: new Date() },
        selectedVisa: visa.visaType,
      }, { merge: true });
      await createVisaPath(user.uid, visa.visaType);
      await refreshUserProfile();
      setSuccessMsg(`Trilha ${visa.visaType} selecionada! Redirecionando...`);
      setTimeout(() => router.push('/minha-trilha'), 1500);
    } catch (err) {
      console.error(err);
      setError('Erro ao selecionar trilha. Tente novamente.');
    } finally { setSelecting(null); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Carregando recomendações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="py-10 px-4" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F8FAFC 50%, #F5F0FF 100%)' }}>
          <div className="mx-auto max-w-3xl">

            {/* Header */}
            <div className="text-center mb-10 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-5">
                <HiMap className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Escolha sua Trilha</h1>
              <p className="text-slate-500 mt-2 max-w-xl mx-auto text-sm">
                Vistos ordenados por compatibilidade com seu perfil. Você pode escolher qualquer um!
              </p>
              {!userProfile?.hasCompletedQuestionnaire && (
                <div className="mt-5 inline-flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm">
                  <HiExclamationTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>Você não preencheu o questionário. As compatibilidades são padrão.{' '}
                    <Link href="/questionario" className="underline font-semibold">Preencher agora</Link>
                  </span>
                </div>
              )}
            </div>

            {/* Alerts */}
            {successMsg && (
              <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-700 text-sm font-medium">
                <FiCheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
              </div>
            )}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">{error}</div>
            )}

            {/* Cards */}
            <div className="space-y-4 stagger-children">
              {recommendations.map((visa) => {
                const isSelecting = selecting === visa.visaType;
                return (
                  <div key={visa.visaType} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{visa.visaType}</h2>
                          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium mt-0.5">
                            <HiGlobeAmericas className="w-3.5 h-3.5" /> {visa.country}
                          </div>
                        </div>
                        <CompatibilityBadge pct={visa.compatibility} />
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{visa.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><HiClock className="w-3.5 h-3.5" /> Tempo de Processo</p>
                          <p className="text-sm font-semibold text-slate-800">{visa.processingTime}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><HiCurrencyDollar className="w-3.5 h-3.5" /> Custo Estimado</p>
                          <p className="text-sm font-semibold text-slate-800">R$ {visa.estimatedCost.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">Requisitos</p>
                        <ul className="space-y-1.5">
                          {visa.requirements.slice(0, 3).map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <FiCheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />{req}
                            </li>
                          ))}
                          {visa.requirements.length > 3 && (
                            <li className="text-xs text-blue-600 font-medium ml-5">+{visa.requirements.length - 3} mais</li>
                          )}
                        </ul>
                      </div>

                      {/* Pros/Cons */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                          <p className="text-xs font-semibold text-emerald-700 mb-2">Vantagens</p>
                          {visa.pros.slice(0, 2).map((p, i) => <p key={i} className="text-xs text-emerald-700/80">• {p}</p>)}
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                          <p className="text-xs font-semibold text-red-600 mb-2">Desvantagens</p>
                          {visa.cons.slice(0, 2).map((c, i) => <p key={i} className="text-xs text-red-600/80">• {c}</p>)}
                        </div>
                      </div>
                    </div>

                    {/* Select */}
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => setSelectedConfirm(visa)}
                        disabled={!!selecting}
                        className={`w-full py-3 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2
                          ${visa.compatibility >= 60
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'}
                          ${selecting ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {isSelecting
                          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Criando trilha...</>
                          : <>Escolher esta Trilha <HiArrowRight className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
              <HiQuestionMarkCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 leading-relaxed">
                Vistos com <strong>compatibilidade acima de 70%</strong> são mais adequados ao seu perfil.
                Você pode escolher <strong>qualquer trilha</strong>, independente da compatibilidade.
                Cada trilha inclui um guia <strong>passo a passo completo</strong>.
              </p>
            </div>

          </div>
        </div>

        {/* Confirm Modal */}
        {selectedConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <HiMap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Confirmar Escolha</h3>
              </div>
              <p className="text-slate-600 text-sm mb-6">
                Deseja seguir a trilha do visto <strong className="text-slate-900">{selectedConfirm.visaType}</strong>?
                Você receberá um guia completo com todos os passos necessários.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedConfirm(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={() => { const v = selectedConfirm; setSelectedConfirm(null); handleSelectPath(v); }}
                  className="flex-1 gap-2"
                >
                  <FiCheckCircle className="w-4 h-4" /> Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </SubscriptionGuard>
  );
}
