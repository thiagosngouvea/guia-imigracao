import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../lib/auth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';

interface Question {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    points: Record<string, number>; // pontos para cada tipo de visto
  }[];
}

const questions: Question[] = [
  {
    id: 'purpose',
    question: 'Qual é o principal motivo da sua viagem aos EUA?',
    options: [
      {
        value: 'tourism',
        label: 'Turismo/Lazer',
        points: { 'B1/B2': 10, 'F1': 0, 'H1B': 0, 'EB5': 0, 'O1': 0 }
      },
      {
        value: 'business',
        label: 'Negócios/Reuniões',
        points: { 'B1/B2': 10, 'F1': 0, 'H1B': 2, 'EB5': 3, 'O1': 1 }
      },
      {
        value: 'study',
        label: 'Estudar',
        points: { 'B1/B2': 0, 'F1': 10, 'H1B': 0, 'EB5': 0, 'O1': 0 }
      },
      {
        value: 'work',
        label: 'Trabalhar',
        points: { 'B1/B2': 0, 'F1': 0, 'H1B': 10, 'EB5': 2, 'O1': 8 }
      },
      {
        value: 'invest',
        label: 'Investir/Empreender',
        points: { 'B1/B2': 2, 'F1': 0, 'H1B': 0, 'EB5': 10, 'O1': 0 }
      }
    ]
  },
  {
    id: 'duration',
    question: 'Por quanto tempo você pretende ficar nos EUA?',
    options: [
      {
        value: 'short',
        label: 'Menos de 6 meses',
        points: { 'B1/B2': 8, 'F1': 2, 'H1B': 0, 'EB5': 0, 'O1': 2 }
      },
      {
        value: 'medium',
        label: '6 meses a 2 anos',
        points: { 'B1/B2': 3, 'F1': 8, 'H1B': 5, 'EB5': 2, 'O1': 6 }
      },
      {
        value: 'long',
        label: 'Mais de 2 anos',
        points: { 'B1/B2': 0, 'F1': 6, 'H1B': 8, 'EB5': 5, 'O1': 8 }
      },
      {
        value: 'permanent',
        label: 'Permanentemente',
        points: { 'B1/B2': 0, 'F1': 0, 'H1B': 3, 'EB5': 10, 'O1': 5 }
      }
    ]
  },
  {
    id: 'education',
    question: 'Qual é o seu nível de educação?',
    options: [
      {
        value: 'high_school',
        label: 'Ensino Médio',
        points: { 'B1/B2': 5, 'F1': 8, 'H1B': 1, 'EB5': 3, 'O1': 1 }
      },
      {
        value: 'bachelor',
        label: 'Graduação',
        points: { 'B1/B2': 3, 'F1': 5, 'H1B': 8, 'EB5': 5, 'O1': 6 }
      },
      {
        value: 'master',
        label: 'Pós-graduação/Mestrado',
        points: { 'B1/B2': 2, 'F1': 6, 'H1B': 9, 'EB5': 6, 'O1': 8 }
      },
      {
        value: 'phd',
        label: 'Doutorado',
        points: { 'B1/B2': 1, 'F1': 4, 'H1B': 7, 'EB5': 4, 'O1': 10 }
      }
    ]
  },
  {
    id: 'experience',
    question: 'Quantos anos de experiência profissional você tem?',
    options: [
      {
        value: 'none',
        label: 'Nenhuma ou menos de 1 ano',
        points: { 'B1/B2': 6, 'F1': 8, 'H1B': 1, 'EB5': 2, 'O1': 0 }
      },
      {
        value: 'junior',
        label: '1-3 anos',
        points: { 'B1/B2': 4, 'F1': 5, 'H1B': 6, 'EB5': 4, 'O1': 3 }
      },
      {
        value: 'mid',
        label: '4-7 anos',
        points: { 'B1/B2': 3, 'F1': 3, 'H1B': 8, 'EB5': 6, 'O1': 6 }
      },
      {
        value: 'senior',
        label: '8+ anos',
        points: { 'B1/B2': 2, 'F1': 1, 'H1B': 9, 'EB5': 8, 'O1': 9 }
      }
    ]
  },
  {
    id: 'investment',
    question: 'Você tem capacidade de investimento nos EUA?',
    options: [
      {
        value: 'none',
        label: 'Não tenho recursos para investir',
        points: { 'B1/B2': 5, 'F1': 6, 'H1B': 5, 'EB5': 0, 'O1': 4 }
      },
      {
        value: 'small',
        label: 'Até $100,000',
        points: { 'B1/B2': 4, 'F1': 5, 'H1B': 4, 'EB5': 2, 'O1': 3 }
      },
      {
        value: 'medium',
        label: '$100,000 - $500,000',
        points: { 'B1/B2': 3, 'F1': 3, 'H1B': 3, 'EB5': 6, 'O1': 2 }
      },
      {
        value: 'large',
        label: '$500,000+',
        points: { 'B1/B2': 2, 'F1': 2, 'H1B': 2, 'EB5': 10, 'O1': 1 }
      }
    ]
  }
];

const visaInfo = {
  'B1/B2': {
    name: 'Visto de Turismo/Negócios (B1/B2)',
    description: 'Ideal para viagens de turismo, visitas familiares ou negócios de curta duração.',
    duration: 'Até 6 meses por entrada',
    requirements: ['Comprovação de vínculos com o Brasil', 'Recursos financeiros', 'Propósito temporário']
  },
  'F1': {
    name: 'Visto de Estudante (F1)',
    description: 'Para estudantes que desejam cursar graduação, pós-graduação ou cursos de idioma.',
    duration: 'Duração do curso + período de treinamento prático',
    requirements: ['Aceitação em instituição aprovada', 'Comprovação financeira', 'Proficiência em inglês']
  },
  'H1B': {
    name: 'Visto de Trabalho (H1B)',
    description: 'Para profissionais especializados com oferta de emprego de empresa americana.',
    duration: 'Até 6 anos (renovável)',
    requirements: ['Oferta de emprego', 'Graduação ou experiência equivalente', 'Especialização na área']
  },
  'EB5': {
    name: 'Visto de Investidor (EB-5)',
    description: 'Para investidores que desejam obter residência permanente através de investimento.',
    duration: 'Residência permanente',
    requirements: ['Investimento mínimo de $800,000', 'Criação de empregos', 'Fonte legal dos recursos']
  },
  'O1': {
    name: 'Visto de Habilidade Extraordinária (O1)',
    description: 'Para indivíduos com habilidades extraordinárias em ciências, artes, educação, negócios ou atletismo.',
    duration: 'Até 3 anos (renovável)',
    requirements: ['Reconhecimento nacional/internacional', 'Prêmios ou conquistas significativas', 'Patrocinador americano']
  }
};

export default function Questionario() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [recommendedVisa, setRecommendedVisa] = useState<string>('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load existing quiz answers if available
  useEffect(() => {
    if (userProfile?.quizAnswers && Object.keys(answers).length === 0) {
      setAnswers(userProfile.quizAnswers);
    }
    if (userProfile?.recommendedVisa && !recommendedVisa) {
      setRecommendedVisa(userProfile.recommendedVisa);
    }
    // If user already completed the quiz, show the result by default
    if (userProfile?.completedQuiz && userProfile?.recommendedVisa && !showResult) {
      setShowResult(true);
    }
  }, [userProfile, answers, recommendedVisa, showResult]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    const scores: Record<string, number> = {
      'B1/B2': 0,
      'F1': 0,
      'H1B': 0,
      'EB5': 0,
      'O1': 0
    };

    // Calcular pontuação para cada tipo de visto
    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const selectedOption = question.options.find(opt => opt.value === answer);
        if (selectedOption) {
          Object.entries(selectedOption.points).forEach(([visa, points]) => {
            scores[visa] += points;
          });
        }
      }
    });

    // Encontrar o visto com maior pontuação
    const recommended = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    // Salvar resultado no perfil do usuário
    if (user) {
      try {
        await updateUserProfile(user.uid, {
          recommendedVisa: recommended,
          completedQuiz: true,
          quizAnswers: answers,
          quizScores: scores,
        });
        // Atualizar o perfil local
        await refreshUserProfile();
      } catch (error) {
        console.error('Erro ao salvar resultado do questionário:', error);
      }
    }

    setRecommendedVisa(recommended);
    setShowResult(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setRecommendedVisa('');
  };

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando questionário...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not authenticated (this shouldn't happen due to useEffect above)
  if (!user) {
    return null;
  }

  if (showResult) {
    const visa = visaInfo[recommendedVisa as keyof typeof visaInfo];
    
    return (
      <SubscriptionGuard>
        <Layout>
          <div className="min-h-screen bg-gray-50 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Resultado do Questionário</h2>
                <p className="mt-2 text-lg text-gray-600">
                  Com base nas suas respostas, recomendamos:
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">
                  {visa.name}
                </h3>
                <p className="text-blue-800 mb-4">
                  {visa.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Duração:</h4>
                    <p className="text-blue-800">{visa.duration}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Principais Requisitos:</h4>
                    <ul className="text-blue-800 space-y-1">
                      {visa.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6 mb-8">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Importante:</h4>
                <p className="text-yellow-700">
                  Este resultado é uma recomendação baseada nas suas respostas. Recomendamos consultar um advogado de imigração 
                  para uma análise mais detalhada do seu caso específico.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={resetQuiz} variant="outline">
                  Refazer Questionário
                </Button>
                <Button onClick={() => router.push('/treinamento')}>
                  Começar Treinamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
      </SubscriptionGuard>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
                <span>{Math.round(progress)}% completo</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {question.question}
              </h2>
              
              <div className="space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[question.id] === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-gray-900 font-medium">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Anterior
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!answers[question.id]}
              >
                {currentQuestion === questions.length - 1 ? 'Ver Resultado' : 'Próxima'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </SubscriptionGuard>
  );
}
