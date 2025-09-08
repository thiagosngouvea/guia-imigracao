import { useState, useEffect } from 'react';
import { UserProfile } from '../lib/auth';
import { calculatePredictiveScore, PredictiveScore, getQuickInsights } from '../lib/predictive-analysis';
import { Button } from './ui/Button';

interface PredictiveAnalysisProps {
  userProfile: UserProfile;
}

export function PredictiveAnalysis({ userProfile }: PredictiveAnalysisProps) {
  const [analysis, setAnalysis] = useState<PredictiveScore | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateAnalysis = async () => {
      setLoading(true);
      try {
        // Simula um pequeno delay para mostrar loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = calculatePredictiveScore(userProfile);
        setAnalysis(result);
      } catch (error) {
        console.error('Erro ao calcular análise preditiva:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateAnalysis();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>Não foi possível calcular a análise preditiva.</p>
          <p className="text-sm mt-1">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  const getScoreColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressBarColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const insights = getQuickInsights(userProfile);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Análise Preditiva de Aprovação</h3>
              <p className="text-sm text-gray-600">Baseada em IA e dados históricos</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Recolher' : 'Ver Detalhes'}
          </Button>
        </div>
      </div>

      {/* Score Principal */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="text-4xl font-bold text-gray-900 mr-4">
              {analysis.overallScore}%
            </div>
            <div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColorClasses(analysis.color)}`}>
                {analysis.category}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Probabilidade de Aprovação
              </p>
            </div>
          </div>
          
          {/* Comparação Histórica */}
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Percentil: <span className="font-semibold">{analysis.historicalComparison.percentile}º</span>
            </div>
            <div className="text-sm text-gray-600">
              Taxa de sucesso: <span className="font-semibold">{analysis.historicalComparison.successRate}%</span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pontuação Geral</span>
            <span>{analysis.overallScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${getProgressBarColor(analysis.color)}`}
              style={{ width: `${analysis.overallScore}%` }}
            ></div>
          </div>
        </div>

        {/* Insights Rápidos */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">💡 Insights Principais</h4>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <span className="text-blue-500 mr-2">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Detalhes Expandidos */}
        {isExpanded && (
          <div className="space-y-6 border-t border-gray-200 pt-6">
            {/* Fatores de Score */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">📊 Fatores de Análise</h4>
              <div className="space-y-3">
                {analysis.factors.map((factor) => (
                  <div key={factor.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-gray-900">{factor.name}</h5>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        factor.score >= 70 ? 'bg-green-100 text-green-800' :
                        factor.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {factor.score}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          factor.score >= 70 ? 'bg-green-500' :
                          factor.score >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendações */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">🎯 Recomendações Personalizadas</h4>
              <div className="space-y-3">
                {analysis.recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{rec.title}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="text-xs text-gray-500">
                      Impacto estimado: +{rec.estimatedImpact} pontos
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fatores de Risco */}
            {analysis.riskFactors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">⚠️ Fatores de Risco</h4>
                <div className="space-y-3">
                  {analysis.riskFactors.slice(0, 2).map((risk) => (
                    <div key={risk.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-orange-900">{risk.title}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                          risk.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {risk.severity === 'high' ? 'Alto' : risk.severity === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                      </div>
                      <p className="text-sm text-orange-800 mb-2">{risk.description}</p>
                      <div className="text-xs text-orange-700">
                        Probabilidade: {risk.likelihood}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparação Histórica Detalhada */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">📈 Comparação Histórica</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analysis.historicalComparison.percentile}º</div>
                    <div className="text-sm text-blue-800">Percentil</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analysis.historicalComparison.successRate}%</div>
                    <div className="text-sm text-blue-800">Taxa de Sucesso</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analysis.historicalComparison.similarProfiles}</div>
                    <div className="text-sm text-blue-800">Perfis Similares</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analysis.historicalComparison.timeToApproval}</div>
                    <div className="text-sm text-blue-800">Tempo Médio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
