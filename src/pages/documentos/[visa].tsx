import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Checklist } from '../../components/ui/Checklist';
import { StepByStep } from '../../components/ui/StepByStep';
import { useAuth } from '../../hooks/useAuth';
import { visaDocumentsData } from '../../lib/visa-documents';

export default function DocumentosVisto() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { visa } = router.query;
  const [activeTab, setActiveTab] = useState<'checklist' | 'processo'>('checklist');
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0 });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando documentos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  // Get visa data
  const visaData = visa ? visaDocumentsData[visa as string] : null;

  // If visa not found, show error
  if (!visaData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Tipo de Visto Não Encontrado
              </h1>
              <p className="text-gray-600 mb-6">
                O tipo de visto solicitado não foi encontrado ou não está disponível.
              </p>
              <Button onClick={() => router.push('/vistos')}>
                Voltar para Tipos de Visto
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleProgressChange = (completed: number, total: number) => {
    setChecklistProgress({ completed, total });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/vistos')}
              className="mb-4"
            >
              ← Voltar para Tipos de Visto
            </Button>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Documentos para {visaData.visaName}
                  </h1>
                  <p className="text-gray-600">
                    Checklist completo e passo a passo para obter seu visto
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                    <div className="font-semibold text-blue-900">Tempo Total</div>
                    <div className="text-blue-700">{visaData.totalEstimatedTime}</div>
                  </div>
                  <div className="bg-green-50 px-4 py-2 rounded-lg text-center">
                    <div className="font-semibold text-green-900">Custo Médio</div>
                    <div className="text-green-700">{visaData.averageCost}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          {activeTab === 'checklist' && checklistProgress.total > 0 && (
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Progresso Geral</h3>
                    <p className="text-sm text-gray-600">
                      {checklistProgress.completed} de {checklistProgress.total} documentos preparados
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {checklistProgress.total > 0 
                        ? Math.round((checklistProgress.completed / checklistProgress.total) * 100)
                        : 0
                      }%
                    </div>
                    <div className="text-xs text-gray-500">Completo</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'checklist'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 Checklist de Documentos
                </button>
                <button
                  onClick={() => setActiveTab('processo')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'processo'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🚀 Passo a Passo
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              {activeTab === 'checklist' ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Checklist de Documentos
                    </h2>
                    <p className="text-gray-600">
                      Marque os documentos conforme você os obtém. Clique em cada item para ver instruções detalhadas.
                    </p>
                  </div>
                  
                  <Checklist 
                    documents={visaData.documents}
                    onProgressChange={handleProgressChange}
                  />
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Processo Passo a Passo
                    </h2>
                    <p className="text-gray-600">
                      Siga estas etapas em ordem para completar seu processo de visto com sucesso.
                    </p>
                  </div>
                  
                  <StepByStep 
                    steps={visaData.processSteps}
                    totalEstimatedTime={visaData.totalEstimatedTime}
                    averageCost={visaData.averageCost}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Success Tips */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🎯 Dicas para o Sucesso
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {visaData.successTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => router.push('/treinamento')}
              className="flex-1"
            >
              🤖 Treinar com IA
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              📊 Ver Dashboard
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
            >
              💬 Falar com Especialista
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Precisa de Ajuda?</h4>
                <p className="text-sm text-yellow-700">
                  Este guia fornece informações gerais. Para casos específicos ou dúvidas complexas, 
                  recomendamos consultar um advogado de imigração ou especialista em vistos americanos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
