
import { UserProfile } from './auth';

// Interfaces para o sistema de análise preditiva
export interface PredictiveScore {
  overallScore: number; // 0-100
  category: 'Excelente' | 'Boa' | 'Moderada' | 'Baixa' | 'Crítica';
  color: 'green' | 'blue' | 'yellow' | 'orange' | 'red';
  factors: ScoreFactor[];
  recommendations: Recommendation[];
  riskFactors: RiskFactor[];
  historicalComparison: HistoricalComparison;
}

export interface ScoreFactor {
  id: string;
  name: string;
  description: string;
  score: number; // 0-100
  weight: number; // 0-1
  impact: 'positive' | 'negative' | 'neutral';
  category: 'profile' | 'documentation' | 'preparation' | 'external';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'immediate' | 'short_term' | 'long_term';
  estimatedImpact: number; // pontos que pode melhorar
  actionItems: string[];
}

export interface RiskFactor {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  likelihood: number; // 0-100
  mitigation: string[];
}

export interface HistoricalComparison {
  averageScore: number;
  percentile: number; // 0-100
  similarProfiles: number;
  successRate: number; // 0-100
  timeToApproval: string;
}

// Dados históricos simulados (em produção, viriam de uma base de dados real)
const HISTORICAL_DATA = {
  'B1/B2': {
    averageScore: 72,
    successRate: 85,
    averageTimeToApproval: '15 dias',
    commonFactors: ['financial_stability', 'ties_to_brazil', 'travel_history']
  },
  'F1': {
    averageScore: 68,
    successRate: 78,
    averageTimeToApproval: '25 dias',
    commonFactors: ['academic_record', 'financial_support', 'english_proficiency']
  },
  'H1B': {
    averageScore: 75,
    successRate: 65,
    averageTimeToApproval: '120 dias',
    commonFactors: ['education_level', 'work_experience', 'employer_reputation']
  },
  'EB5': {
    averageScore: 82,
    successRate: 90,
    averageTimeToApproval: '18 meses',
    commonFactors: ['investment_amount', 'source_of_funds', 'business_plan']
  },
  'O1': {
    averageScore: 85,
    successRate: 88,
    averageTimeToApproval: '60 dias',
    commonFactors: ['achievements', 'recognition', 'extraordinary_ability']
  }
};

// Função principal de análise preditiva
export function calculatePredictiveScore(userProfile: UserProfile): PredictiveScore {
  const visaType = userProfile.selectedVisa || userProfile.recommendedVisa || 'B1/B2';
  const factors = calculateScoreFactors(userProfile, visaType);
  const overallScore = calculateOverallScore(factors);
  const category = getScoreCategory(overallScore);
  const color = getScoreColor(category);
  const recommendations = generateRecommendations(factors, visaType);
  const riskFactors = identifyRiskFactors(factors, visaType);
  const historicalComparison = getHistoricalComparison(overallScore, visaType);

  return {
    overallScore,
    category,
    color,
    factors,
    recommendations,
    riskFactors,
    historicalComparison
  };
}

// Calcula fatores individuais baseado no perfil do usuário
function calculateScoreFactors(userProfile: UserProfile, visaType: string): ScoreFactor[] {
  const factors: ScoreFactor[] = [];

  // Fator: Completude do Perfil
  const profileCompleteness = calculateProfileCompleteness(userProfile);
  factors.push({
    id: 'profile_completeness',
    name: 'Completude do Perfil',
    description: 'Quão completo está seu perfil na plataforma',
    score: profileCompleteness,
    weight: 0.15,
    impact: profileCompleteness > 70 ? 'positive' : 'negative',
    category: 'profile'
  });

  // Fator: Preparação (baseado em treinos e questionário)
  const preparationScore = calculatePreparationScore(userProfile);
  factors.push({
    id: 'preparation',
    name: 'Nível de Preparação',
    description: 'Baseado em treinos realizados e questionário completado',
    score: preparationScore,
    weight: 0.25,
    impact: preparationScore > 60 ? 'positive' : 'negative',
    category: 'preparation'
  });

  // Fatores específicos por tipo de visto
  factors.push(...getVisaSpecificFactors(userProfile, visaType));

  // Fator: Consistência de Dados
  const consistencyScore = calculateDataConsistency(userProfile);
  factors.push({
    id: 'data_consistency',
    name: 'Consistência dos Dados',
    description: 'Coerência entre as respostas do questionário',
    score: consistencyScore,
    weight: 0.20,
    impact: consistencyScore > 80 ? 'positive' : 'negative',
    category: 'profile'
  });

  return factors;
}

// Calcula completude do perfil
function calculateProfileCompleteness(userProfile: UserProfile): number {
  let score = 0;
  let maxScore = 0;

  // Campos básicos
  if (userProfile.name) score += 10;
  if (userProfile.email) score += 10;
  maxScore += 20;

  // Questionário
  if (userProfile.completedQuiz) score += 30;
  maxScore += 30;

  // Visto recomendado/selecionado
  if (userProfile.recommendedVisa || userProfile.selectedVisa) score += 20;
  maxScore += 20;

  // Treinos
  if (userProfile.interviewsPracticed && userProfile.interviewsPracticed > 0) score += 20;
  if (userProfile.interviewsPracticed && userProfile.interviewsPracticed >= 3) score += 10;
  maxScore += 30;

  return Math.round((score / maxScore) * 100);
}

// Calcula score de preparação
function calculatePreparationScore(userProfile: UserProfile): number {
  let score = 0;

  // Questionário completado
  if (userProfile.completedQuiz) score += 40;

  // Treinos realizados
  const interviews = userProfile.interviewsPracticed || 0;
  if (interviews > 0) score += 20;
  if (interviews >= 3) score += 20;
  if (interviews >= 5) score += 20;

  return Math.min(score, 100);
}

// Fatores específicos por tipo de visto
function getVisaSpecificFactors(userProfile: UserProfile, visaType: string): ScoreFactor[] {
  const factors: ScoreFactor[] = [];

  switch (visaType) {
    case 'B1/B2':
      factors.push({
        id: 'tourism_profile',
        name: 'Perfil de Turista',
        description: 'Adequação do perfil para turismo/negócios',
        score: calculateTourismProfile(userProfile),
        weight: 0.30,
        impact: 'positive',
        category: 'profile'
      });
      break;

    case 'F1':
      factors.push({
        id: 'student_profile',
        name: 'Perfil de Estudante',
        description: 'Adequação do perfil para estudos',
        score: calculateStudentProfile(userProfile),
        weight: 0.35,
        impact: 'positive',
        category: 'profile'
      });
      break;

    case 'H1B':
      factors.push({
        id: 'professional_profile',
        name: 'Perfil Profissional',
        description: 'Adequação do perfil para trabalho especializado',
        score: calculateProfessionalProfile(userProfile),
        weight: 0.40,
        impact: 'positive',
        category: 'profile'
      });
      break;

    case 'EB5':
      factors.push({
        id: 'investor_profile',
        name: 'Perfil de Investidor',
        description: 'Adequação do perfil para investimento',
        score: calculateInvestorProfile(userProfile),
        weight: 0.45,
        impact: 'positive',
        category: 'profile'
      });
      break;

    case 'O1':
      factors.push({
        id: 'extraordinary_profile',
        name: 'Perfil de Habilidade Extraordinária',
        description: 'Adequação do perfil para habilidades extraordinárias',
        score: calculateExtraordinaryProfile(userProfile),
        weight: 0.40,
        impact: 'positive',
        category: 'profile'
      });
      break;
  }

  return factors;
}

// Cálculos específicos por tipo de visto (baseados nas respostas do questionário)
function calculateTourismProfile(userProfile: UserProfile): number {
  if (!userProfile.quizAnswers) return 50;

  let score = 50;
  const answers = userProfile.quizAnswers;

  // Propósito de turismo
  if (answers.purpose === 'tourism') score += 20;
  if (answers.purpose === 'business') score += 15;

  // Duração curta
  if (answers.duration === 'short') score += 20;

  // Menor nível educacional pode ser positivo para turismo
  if (answers.education === 'high_school' || answers.education === 'bachelor') score += 10;

  // Pouca experiência profissional pode ser ok para turismo
  if (answers.experience === 'none' || answers.experience === 'junior') score += 5;

  return Math.min(score, 100);
}

function calculateStudentProfile(userProfile: UserProfile): number {
  if (!userProfile.quizAnswers) return 50;

  let score = 50;
  const answers = userProfile.quizAnswers;

  // Propósito de estudo
  if (answers.purpose === 'study') score += 25;

  // Duração média/longa
  if (answers.duration === 'medium' || answers.duration === 'long') score += 15;

  // Educação adequada
  if (answers.education === 'high_school') score += 20;
  if (answers.education === 'bachelor') score += 15;

  // Pouca experiência é normal para estudantes
  if (answers.experience === 'none' || answers.experience === 'junior') score += 10;

  return Math.min(score, 100);
}

function calculateProfessionalProfile(userProfile: UserProfile): number {
  if (!userProfile.quizAnswers) return 50;

  let score = 50;
  const answers = userProfile.quizAnswers;

  // Propósito de trabalho
  if (answers.purpose === 'work') score += 25;

  // Duração longa
  if (answers.duration === 'long' || answers.duration === 'permanent') score += 15;

  // Educação superior
  if (answers.education === 'bachelor') score += 15;
  if (answers.education === 'master') score += 20;
  if (answers.education === 'phd') score += 15;

  // Experiência profissional
  if (answers.experience === 'mid') score += 15;
  if (answers.experience === 'senior') score += 20;

  return Math.min(score, 100);
}

function calculateInvestorProfile(userProfile: UserProfile): number {
  if (!userProfile.quizAnswers) return 50;

  let score = 50;
  const answers = userProfile.quizAnswers;

  // Propósito de investimento
  if (answers.purpose === 'invest') score += 30;

  // Permanente
  if (answers.duration === 'permanent') score += 20;

  // Capacidade de investimento
  if (answers.investment === 'large') score += 30;
  if (answers.investment === 'medium') score += 15;

  // Experiência profissional ajuda
  if (answers.experience === 'senior') score += 10;

  return Math.min(score, 100);
}

function calculateExtraordinaryProfile(userProfile: UserProfile): number {
  if (!userProfile.quizAnswers) return 50;

  let score = 50;
  const answers = userProfile.quizAnswers;

  // Propósito de trabalho especializado
  if (answers.purpose === 'work') score += 20;

  // Educação avançada
  if (answers.education === 'master') score += 15;
  if (answers.education === 'phd') score += 25;

  // Experiência sênior
  if (answers.experience === 'senior') score += 25;

  // Duração longa
  if (answers.duration === 'long') score += 10;

  return Math.min(score, 100);
}

// Calcula consistência dos dados
function calculateDataConsistency(userProfile: UserProfile): number {
  if (!userProfile.quizAnswers) return 70;

  let consistencyScore = 100;
  const answers = userProfile.quizAnswers;

  // Verifica inconsistências lógicas
  if (answers.purpose === 'study' && answers.education === 'phd') {
    consistencyScore -= 10; // PhD querendo estudar pode ser inconsistente
  }

  if (answers.purpose === 'work' && answers.experience === 'none') {
    consistencyScore -= 15; // Trabalhar sem experiência
  }

  if (answers.purpose === 'invest' && answers.investment === 'none') {
    consistencyScore -= 20; // Investir sem recursos
  }

  if (answers.duration === 'permanent' && answers.purpose === 'tourism') {
    consistencyScore -= 15; // Turismo permanente
  }

  return Math.max(consistencyScore, 0);
}

// Calcula score geral
function calculateOverallScore(factors: ScoreFactor[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  factors.forEach(factor => {
    weightedSum += factor.score * factor.weight;
    totalWeight += factor.weight;
  });

  return Math.round(weightedSum / totalWeight);
}

// Determina categoria do score
function getScoreCategory(score: number): PredictiveScore['category'] {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Boa';
  if (score >= 55) return 'Moderada';
  if (score >= 40) return 'Baixa';
  return 'Crítica';
}

// Determina cor do score
function getScoreColor(category: PredictiveScore['category']): PredictiveScore['color'] {
  switch (category) {
    case 'Excelente': return 'green';
    case 'Boa': return 'blue';
    case 'Moderada': return 'yellow';
    case 'Baixa': return 'orange';
    case 'Crítica': return 'red';
  }
}

// Gera recomendações baseadas nos fatores
function generateRecommendations(factors: ScoreFactor[], visaType: string): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Recomendações baseadas em fatores com score baixo
  factors.forEach(factor => {
    if (factor.score < 60) {
      recommendations.push(...getFactorRecommendations(factor, visaType));
    }
  });

  // Recomendações gerais
  recommendations.push(...getGeneralRecommendations(factors, visaType));

  // Ordena por prioridade e impacto
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.estimatedImpact - a.estimatedImpact;
    })
    .slice(0, 6); // Limita a 6 recomendações
}

// Recomendações específicas por fator
function getFactorRecommendations(factor: ScoreFactor, visaType: string): Recommendation[] {
  const recommendations: Recommendation[] = [];

  switch (factor.id) {
    case 'profile_completeness':
      recommendations.push({
        id: 'complete_profile',
        title: 'Complete seu Perfil',
        description: 'Preencha todas as informações do seu perfil para melhorar sua análise',
        priority: 'high',
        category: 'immediate',
        estimatedImpact: 15,
        actionItems: [
          'Complete o questionário de visto',
          'Adicione informações pessoais',
          'Defina seu visto alvo'
        ]
      });
      break;

    case 'preparation':
      recommendations.push({
        id: 'increase_training',
        title: 'Aumente seu Treinamento',
        description: 'Pratique mais entrevistas para melhorar sua preparação',
        priority: 'high',
        category: 'short_term',
        estimatedImpact: 20,
        actionItems: [
          'Realize pelo menos 3 sessões de treino',
          'Pratique em diferentes idiomas',
          'Foque nas perguntas mais difíceis'
        ]
      });
      break;

    case 'data_consistency':
      recommendations.push({
        id: 'review_answers',
        title: 'Revise suas Respostas',
        description: 'Algumas respostas podem estar inconsistentes',
        priority: 'medium',
        category: 'immediate',
        estimatedImpact: 10,
        actionItems: [
          'Refaça o questionário com cuidado',
          'Verifique coerência entre respostas',
          'Consulte um especialista se necessário'
        ]
      });
      break;
  }

  return recommendations;
}

// Recomendações gerais
function getGeneralRecommendations(factors: ScoreFactor[], visaType: string): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Recomendação de documentação
  recommendations.push({
    id: 'prepare_documents',
    title: 'Prepare sua Documentação',
    description: `Organize todos os documentos necessários para o visto ${visaType}`,
    priority: 'high',
    category: 'short_term',
    estimatedImpact: 25,
    actionItems: [
      'Consulte a lista de documentos necessários',
      'Organize documentos em ordem lógica',
      'Faça traduções juramentadas quando necessário',
      'Prepare cópias de segurança'
    ]
  });

  // Recomendação de consulta especializada
  const overallScore = calculateOverallScore(factors);
  if (overallScore < 70) {
    recommendations.push({
      id: 'specialist_consultation',
      title: 'Consulte um Especialista',
      description: 'Seu perfil pode se beneficiar de orientação profissional',
      priority: 'medium',
      category: 'short_term',
      estimatedImpact: 30,
      actionItems: [
        'Agende uma consulta com advogado de imigração',
        'Discuta estratégias específicas para seu caso',
        'Obtenha orientação sobre documentação',
        'Esclareça dúvidas sobre o processo'
      ]
    });
  }

  return recommendations;
}

// Identifica fatores de risco
function identifyRiskFactors(factors: ScoreFactor[], visaType: string): RiskFactor[] {
  const riskFactors: RiskFactor[] = [];

  // Riscos baseados em scores baixos
  factors.forEach(factor => {
    if (factor.score < 40 && factor.impact === 'negative') {
      riskFactors.push({
        id: `risk_${factor.id}`,
        title: `${factor.name} Inadequado`,
        description: `Seu ${factor.name.toLowerCase()} está abaixo do ideal`,
        severity: 'high',
        likelihood: 80,
        mitigation: [
          'Melhore este aspecto antes da aplicação',
          'Busque orientação especializada',
          'Considere adiar a aplicação se necessário'
        ]
      });
    }
  });

  // Riscos específicos por tipo de visto
  riskFactors.push(...getVisaSpecificRisks(factors, visaType));

  return riskFactors.slice(0, 4); // Limita a 4 riscos principais
}

// Riscos específicos por tipo de visto
function getVisaSpecificRisks(factors: ScoreFactor[], visaType: string): RiskFactor[] {
  const risks: RiskFactor[] = [];

  switch (visaType) {
    case 'B1/B2':
      risks.push({
        id: 'tourism_overstay_risk',
        title: 'Risco de Permanência Irregular',
        description: 'Perfil pode indicar intenção de permanência',
        severity: 'medium',
        likelihood: 30,
        mitigation: [
          'Demonstre vínculos fortes com o Brasil',
          'Tenha documentos de retorno preparados',
          'Seja claro sobre o propósito temporário'
        ]
      });
      break;

    case 'H1B':
      risks.push({
        id: 'lottery_risk',
        title: 'Risco da Loteria H1B',
        description: 'Sistema de loteria pode impedir aprovação mesmo com bom perfil',
        severity: 'high',
        likelihood: 70,
        mitigation: [
          'Considere alternativas como O1 ou L1',
          'Aplique através de múltiplas empresas',
          'Tenha plano B preparado'
        ]
      });
      break;
  }

  return risks;
}

// Comparação histórica
function getHistoricalComparison(score: number, visaType: string): HistoricalComparison {
  const historical = HISTORICAL_DATA[visaType as keyof typeof HISTORICAL_DATA] || HISTORICAL_DATA['B1/B2'];
  
  // Calcula percentil baseado no score
  let percentile = 50;
  if (score > historical.averageScore) {
    percentile = 50 + ((score - historical.averageScore) / (100 - historical.averageScore)) * 50;
  } else {
    percentile = (score / historical.averageScore) * 50;
  }

  return {
    averageScore: historical.averageScore,
    percentile: Math.round(percentile),
    similarProfiles: Math.floor(Math.random() * 500) + 100, // Simulado
    successRate: historical.successRate,
    timeToApproval: historical.averageTimeToApproval
  };
}

// Função para obter insights rápidos
export function getQuickInsights(userProfile: UserProfile): string[] {
  const score = calculatePredictiveScore(userProfile);
  const insights: string[] = [];

  if (score.overallScore >= 80) {
    insights.push('Seu perfil está muito bem preparado para o visto!');
  } else if (score.overallScore >= 60) {
    insights.push('Seu perfil está no caminho certo, mas há espaço para melhorias.');
  } else {
    insights.push('Seu perfil precisa de atenção antes da aplicação.');
  }

  // Insights baseados em fatores específicos
  const weakFactors = score.factors.filter(f => f.score < 60);
  if (weakFactors.length > 0) {
    insights.push(`Foque em melhorar: ${weakFactors[0].name.toLowerCase()}`);
  }

  const strongFactors = score.factors.filter(f => f.score >= 80);
  if (strongFactors.length > 0) {
    insights.push(`Seu ponto forte: ${strongFactors[0].name.toLowerCase()}`);
  }

  return insights.slice(0, 3);
}