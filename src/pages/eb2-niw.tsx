import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { EB2NIWAnalysis } from '../components/EB2NIWAnalysis';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import { HiChartBar, HiDocumentReport } from 'react-icons/hi';
import { HiExclamationTriangle, HiLightBulb, HiCpuChip, HiSparkles, HiClipboardDocument, HiDocumentCheck } from 'react-icons/hi2';

interface CaseAnalysis {
  pdfLink: string;
  prong1Reason: string;
  prong2Reason: string;
  prong3Reason: string;
  prong1Verdict: string;
  prong2Verdict: string;
  prong3Verdict: string;
  finalVerdict: string;
  isNIW: boolean;
}

export default function EB2NIWPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analysisResults, setAnalysisResults] = useState<CaseAnalysis[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleAnalysisComplete = (results: CaseAnalysis[]) => {
    setAnalysisResults(results);
    // Salvar resultados no localStorage para persistência
    localStorage.setItem('eb2-niw-analysis-results', JSON.stringify(results));
  };

  // Carregar resultados salvos no localStorage
  useEffect(() => {
    const savedResults = localStorage.getItem('eb2-niw-analysis-results');
    if (savedResults) {
      try {
        setAnalysisResults(JSON.parse(savedResults));
      } catch (error) {
        console.error('Erro ao carregar resultados salvos:', error);
      }
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando módulo EB2 NIW...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not authenticated (this shouldn't happen due to useEffect above)
  if (!user) {
    return null;
  }

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-5">
                <HiLightBulb className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Análise EB2 NIW
              </h1>
              
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Compare seu caso EB2 NIW com milhares de casos negados pelo USCIS. 
                Nossa IA analisa os três prongs do seu caso e fornece insights valiosos 
                sobre suas chances de aprovação.
              </p>
            </div>

            {/* Features Overview */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <div className="w-11 h-11 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                  <HiChartBar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Análise Comparativa</h3>
                <p className="text-gray-600">
                  Compare os três prongs do seu caso NIW com casos reais negados pelo USCIS, 
                  identificando pontos fortes e fracos.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <div className="w-11 h-11 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                  <HiCpuChip className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">IA Especializada</h3>
                <p className="text-gray-600">
                  Utiliza GPT-4 para analisar documentos oficiais do USCIS e fornecer 
                  insights precisos sobre os motivos de negação.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <div className="w-11 h-11 bg-gradient-to-r from-violet-400 to-purple-500 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                  <HiDocumentReport className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Relatório Detalhado</h3>
                <p className="text-gray-600">
                  Receba um relatório completo com estatísticas, taxa de sucesso estimada 
                  e recomendações específicas para seu caso.
                </p>
              </div>
            </div>

            {/* What is EB2 NIW */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                O que é EB2 NIW?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    O <strong>EB2 National Interest Waiver (NIW)</strong> é uma categoria de green card 
                    que permite que profissionais qualificados obtenham residência permanente nos EUA 
                    sem necessidade de um empregador patrocinador ou certificação trabalhista.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed">
                    Para ser aprovado, o candidato deve demonstrar que sua presença nos EUA seria de 
                    interesse nacional, atendendo aos três critérios estabelecidos no caso Dhanasar (2016).
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h4 className="font-bold text-gray-900 mb-2">Prong 1</h4>
                    <p className="text-gray-700">
                      <strong>Substantial Merit and National Importance:</strong> O trabalho deve ter 
                      mérito substancial e importância nacional.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-6">
                    <h4 className="font-bold text-gray-900 mb-2">Prong 2</h4>
                    <p className="text-gray-700">
                      <strong>Well Positioned:</strong> O candidato deve estar bem posicionado 
                      para avançar o empreendimento proposto.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-6">
                    <h4 className="font-bold text-gray-900 mb-2">Prong 3</h4>
                    <p className="text-gray-700">
                      <strong>Balance of Factors:</strong> Seria benéfico para os EUA dispensar 
                      os requisitos de oferta de emprego e certificação trabalhista.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Analysis Component */}
            <EB2NIWAnalysis onAnalysisComplete={handleAnalysisComplete} />

            {/* How it Works */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mt-12">
              <h2 className="text-3xl font-bold mb-8 text-center">Como Funciona</h2>
              
              <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">1</div>
                    <h4 className="font-bold mb-1 text-sm">Descreva seu Caso</h4>
                  <p className="text-blue-100 text-sm">
                    Forneça detalhes sobre os três prongs do seu caso NIW
                  </p>
                </div>
                                <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">2</div>
                    <h4 className="font-bold mb-1 text-sm">Base de Dados</h4>
                  <p className="text-blue-100 text-sm">
                    Sistema acessa automaticamente nossa base com casos negados do USCIS
                  </p>
                </div>
                                <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">3</div>
                    <h4 className="font-bold mb-1 text-sm">Análise com IA</h4>
                  <p className="text-blue-100 text-sm">
                    Nossa IA processa os documentos e compara com seu caso
                  </p>
                </div>
                                <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">4</div>
                    <h4 className="font-bold mb-1 text-sm">Relatório Final</h4>
                  <p className="text-blue-100 text-sm">
                    Receba insights detalhados e sua taxa de sucesso estimada
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-8 flex items-start gap-3">
              <HiExclamationTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-1">Disclaimer Legal</h3>
                <p className="text-amber-700 text-xs leading-relaxed mb-2">
                  Esta ferramenta fornece análise educacional baseada em casos históricos e não
                  constitui aconselhamento jurídico. Os resultados são estimativas baseadas em
                  padrões identificados pela IA e não garantem aprovação ou negação do seu caso.
                </p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Recomendamos sempre consultar um advogado especializado em imigração para
                  orientação específica sobre seu caso NIW.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </SubscriptionGuard>
  );
}
