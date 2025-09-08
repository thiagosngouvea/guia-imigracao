import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { PredictiveAnalysis } from '../components/PredictiveAnalysis';
import { UserProfile } from '../lib/auth';

// Dados de exemplo para demonstração
const sampleUserProfiles: Record<string, UserProfile> = {
  excellent: {
    uid: 'demo1',
    email: 'demo@example.com',
    name: 'João Silva',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    completedQuiz: true,
    interviewsPracticed: 5,
    recommendedVisa: 'H1B',
    selectedVisa: 'H1B',
    quizAnswers: {
      purpose: 'work',
      duration: 'long',
      education: 'master',
      experience: 'senior',
      investment: 'small'
    },
    quizScores: {
      'B1/B2': 20,
      'F1': 30,
      'H1B': 85,
      'EB5': 40,
      'O1': 70
    }
  },
  good: {
    uid: 'demo2',
    email: 'demo2@example.com',
    name: 'Maria Santos',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    completedQuiz: true,
    interviewsPracticed: 2,
    recommendedVisa: 'F1',
    quizAnswers: {
      purpose: 'study',
      duration: 'medium',
      education: 'bachelor',
      experience: 'junior',
      investment: 'none'
    },
    quizScores: {
      'B1/B2': 40,
      'F1': 75,
      'H1B': 35,
      'EB5': 10,
      'O1': 25
    }
  },
  poor: {
    uid: 'demo3',
    email: 'demo3@example.com',
    name: 'Carlos Oliveira',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    completedQuiz: false,
    interviewsPracticed: 0,
    quizAnswers: {
      purpose: 'tourism',
      duration: 'permanent',
      education: 'high_school',
      experience: 'none',
      investment: 'none'
    }
  }
};

export default function PredictiveDemo() {
  const [selectedProfile, setSelectedProfile] = useState<string>('excellent');

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🤖 Demonstração: Sistema de Análise Preditiva
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Veja como nossa IA analisa diferentes perfis de usuários e calcula a probabilidade de aprovação do visto.
            </p>
          </div>

          {/* Profile Selector */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecione um Perfil de Exemplo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedProfile('excellent')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedProfile === 'excellent'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <h3 className="font-semibold text-gray-900">Perfil Excelente</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Profissional experiente, questionário completo, múltiplos treinos realizados
                </p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  Score esperado: 85-95%
                </div>
              </button>

              <button
                onClick={() => setSelectedProfile('good')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedProfile === 'good'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <h3 className="font-semibold text-gray-900">Perfil Bom</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Estudante preparado, questionário completo, alguns treinos realizados
                </p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Score esperado: 65-80%
                </div>
              </button>

              <button
                onClick={() => setSelectedProfile('poor')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedProfile === 'poor'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <h3 className="font-semibold text-gray-900">Perfil Crítico</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Perfil incompleto, sem treinos, respostas inconsistentes
                </p>
                <div className="mt-2 text-xs text-red-600 font-medium">
                  Score esperado: 30-50%
                </div>
              </button>
            </div>
          </div>

          {/* Analysis Component */}
          <PredictiveAnalysis userProfile={sampleUserProfiles[selectedProfile]} />

          {/* Features Explanation */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🚀 Funcionalidades do Sistema de Análise Preditiva
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-purple-600 text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Score Personalizado</h3>
                <p className="text-gray-600 text-sm">
                  Algoritmo proprietário que analisa múltiplos fatores do perfil do usuário para calcular probabilidade de aprovação.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-purple-600 text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Análise Detalhada</h3>
                <p className="text-gray-600 text-sm">
                  Breakdown completo dos fatores que influenciam o score, com pesos específicos por tipo de visto.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-purple-600 text-2xl mb-2">💡</div>
                <h3 className="font-semibold text-gray-900 mb-2">Recomendações IA</h3>
                <p className="text-gray-600 text-sm">
                  Sugestões personalizadas e priorizadas para melhorar as chances de aprovação do visto.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-purple-600 text-2xl mb-2">⚠️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Identificação de Riscos</h3>
                <p className="text-gray-600 text-sm">
                  Sistema identifica automaticamente fatores de risco e sugere estratégias de mitigação.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-purple-600 text-2xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900 mb-2">Comparação Histórica</h3>
                <p className="text-gray-600 text-sm">
                  Benchmarking com dados históricos de aprovações para contextualizar o score do usuário.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-purple-600 text-2xl mb-2">🔄</div>
                <h3 className="font-semibold text-gray-900 mb-2">Atualização Dinâmica</h3>
                <p className="text-gray-600 text-sm">
                  Score é recalculado automaticamente conforme o usuário completa atividades na plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Detalhes Técnicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Fatores Analisados</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Completude do perfil (15% do peso)</li>
                  <li>• Nível de preparação (25% do peso)</li>
                  <li>• Adequação ao tipo de visto (30-45% do peso)</li>
                  <li>• Consistência dos dados (20% do peso)</li>
                  <li>• Fatores externos e históricos</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Algoritmo de Score</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Soma ponderada de todos os fatores</li>
                  <li>• Normalização para escala 0-100</li>
                  <li>• Categorização em 5 níveis</li>
                  <li>• Comparação com dados históricos</li>
                  <li>• Geração automática de insights</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
