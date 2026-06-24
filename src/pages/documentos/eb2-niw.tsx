import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Checklist } from '../../components/ui/Checklist';
import Link from 'next/link';

interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  documents: {
    id: string;
    name: string;
    description: string;
    required: boolean;
    tips?: string[];
  }[];
}

const documentCategories: DocumentCategory[] = [
  {
    id: 'personal',
    title: 'Documentos Pessoais',
    description: 'Documentação básica de identificação e histórico',
    documents: [
      {
        id: 'passport',
        name: 'Passaporte válido',
        description: 'Passaporte com validade de pelo menos 6 meses',
        required: true
      },
      {
        id: 'birth-certificate',
        name: 'Certidão de nascimento',
        description: 'Certidão de nascimento traduzida e apostilada',
        required: true
      },
      {
        id: 'marriage-certificate',
        name: 'Certidão de casamento',
        description: 'Se aplicável, para incluir cônjuge na petição',
        required: false
      },
      {
        id: 'children-documents',
        name: 'Documentos dos filhos',
        description: 'Certidões de nascimento dos filhos menores de 21 anos',
        required: false
      }
    ]
  },
  {
    id: 'education',
    title: 'Documentos Educacionais',
    description: 'Comprovação de graduação avançada ou experiência equivalente',
    documents: [
      {
        id: 'degree',
        name: 'Diploma de graduação avançada',
        description: 'Mestrado, doutorado ou equivalente',
        required: true,
        tips: [
          'Diploma deve ser traduzido e avaliado por agência credenciada',
          'Se não tem graduação avançada, precisa de 5+ anos de experiência progressiva'
        ]
      },
      {
        id: 'transcripts',
        name: 'Histórico escolar',
        description: 'Histórico completo dos cursos realizados',
        required: true
      },
      {
        id: 'credential-evaluation',
        name: 'Avaliação de credenciais',
        description: 'Avaliação por agência como WES, ECE ou similar',
        required: true,
        tips: [
          'Necessário para diplomas estrangeiros',
          'Deve confirmar equivalência ao sistema educacional americano'
        ]
      }
    ]
  },
  {
    id: 'prong1',
    title: 'Prong 1 - Mérito Substancial e Importância Nacional',
    description: 'Evidências de que seu trabalho tem mérito substancial e importância nacional',
    documents: [
      {
        id: 'publications',
        name: 'Publicações acadêmicas',
        description: 'Artigos em revistas científicas, livros, capítulos',
        required: false,
        tips: [
          'Inclua fator de impacto das revistas',
          'Destaque citações recebidas',
          'Traduza resumos para inglês'
        ]
      },
      {
        id: 'patents',
        name: 'Patentes',
        description: 'Patentes registradas nos EUA ou internacionalmente',
        required: false
      },
      {
        id: 'media-coverage',
        name: 'Cobertura na mídia',
        description: 'Artigos de jornal, revista ou mídia online sobre seu trabalho',
        required: false
      },
      {
        id: 'government-recognition',
        name: 'Reconhecimento governamental',
        description: 'Cartas de agências governamentais sobre a importância do trabalho',
        required: false
      },
      {
        id: 'industry-impact',
        name: 'Impacto na indústria',
        description: 'Evidências de como seu trabalho impacta a área nacionalmente',
        required: true,
        tips: [
          'Cartas de especialistas explicando o impacto',
          'Dados quantitativos quando possível',
          'Conexão clara com interesses nacionais americanos'
        ]
      }
    ]
  },
  {
    id: 'prong2',
    title: 'Prong 2 - Bem Posicionado para Avançar',
    description: 'Evidências de que você está bem posicionado para avançar sua área de trabalho',
    documents: [
      {
        id: 'cv',
        name: 'Curriculum Vitae detalhado',
        description: 'CV completo com todas as qualificações e experiências',
        required: true,
        tips: [
          'Destaque experiência relevante',
          'Inclua todas as publicações e prêmios',
          'Organize cronologicamente'
        ]
      },
      {
        id: 'experience-letters',
        name: 'Cartas de experiência',
        description: 'Cartas detalhadas de empregadores anteriores',
        required: true
      },
      {
        id: 'recommendation-letters',
        name: 'Cartas de recomendação',
        description: 'Cartas de especialistas reconhecidos na área',
        required: true,
        tips: [
          'Mínimo 5-8 cartas de diferentes especialistas',
          'Autores devem ter credenciais impressionantes',
          'Cartas devem ser específicas sobre suas qualificações'
        ]
      },
      {
        id: 'awards',
        name: 'Prêmios e reconhecimentos',
        description: 'Certificados de prêmios nacionais ou internacionais',
        required: false
      },
      {
        id: 'memberships',
        name: 'Membros de organizações',
        description: 'Membros de associações profissionais prestigiosas',
        required: false
      },
      {
        id: 'judging-evidence',
        name: 'Participação em julgamentos',
        description: 'Evidências de participação em painéis de revisão',
        required: false
      }
    ]
  },
  {
    id: 'prong3',
    title: 'Prong 3 - Benefício aos EUA',
    description: 'Evidências de que seria benéfico aos EUA dispensar o teste do mercado de trabalho',
    documents: [
      {
        id: 'job-offer',
        name: 'Oferta de emprego (opcional)',
        description: 'Carta de oferta de emprego nos EUA',
        required: false,
        tips: [
          'Não é obrigatório para NIW',
          'Pode fortalecer o caso se houver',
          'Deve destacar importância do trabalho'
        ]
      },
      {
        id: 'business-plan',
        name: 'Plano de negócios',
        description: 'Se planeja iniciar empresa nos EUA',
        required: false
      },
      {
        id: 'national-benefit-evidence',
        name: 'Evidências de benefício nacional',
        description: 'Documentos provando benefício aos EUA',
        required: true,
        tips: [
          'Cartas de especialistas explicando o benefício',
          'Evidências de urgência nacional na área',
          'Comparação com outros profissionais disponíveis'
        ]
      },
      {
        id: 'economic-impact',
        name: 'Impacto econômico',
        description: 'Evidências de potencial impacto econômico positivo',
        required: false
      }
    ]
  },
  {
    id: 'supporting',
    title: 'Documentos de Apoio',
    description: 'Documentação adicional para fortalecer a petição',
    documents: [
      {
        id: 'expert-opinion',
        name: 'Opinião de especialista',
        description: 'Carta de advogado especializado ou consultor',
        required: false
      },
      {
        id: 'comparable-cases',
        name: 'Casos comparáveis',
        description: 'Exemplos de casos NIW aprovados similares',
        required: false
      },
      {
        id: 'citation-report',
        name: 'Relatório de citações',
        description: 'Relatório do Google Scholar ou Web of Science',
        required: false
      },
      {
        id: 'h-index',
        name: 'Índice H',
        description: 'Comprovação do índice H e outras métricas',
        required: false
      }
    ]
  }
];

export default function EB2NIWDocuments() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedCategory, setExpandedCategory] = useState<string>('personal');

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const getCategoryProgress = (category: DocumentCategory) => {
    const totalItems = category.documents.length;
    const checkedItems_ = category.documents.filter(doc => checkedItems[doc.id]).length;
    return Math.round((checkedItems_ / totalItems) * 100);
  };

  const getOverallProgress = () => {
    const totalItems = documentCategories.reduce((sum, cat) => sum + cat.documents.length, 0);
    const checkedItems_ = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedItems_ / totalItems) * 100);
  };

  const getRequiredItemsProgress = () => {
    const requiredItems = documentCategories.flatMap(cat => 
      cat.documents.filter(doc => doc.required)
    );
    const checkedRequired = requiredItems.filter(doc => checkedItems[doc.id]).length;
    return {
      checked: checkedRequired,
      total: requiredItems.length,
      percentage: Math.round((checkedRequired / requiredItems.length) * 100)
    };
  };

  const requiredProgress = getRequiredItemsProgress();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6">
              <span className="text-2xl">📋</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Documentos EB2 NIW
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Lista completa de documentos necessários para sua petição EB2 National Interest Waiver. 
              Organize sua documentação seguindo os três prongs estabelecidos no caso Dhanasar.
            </p>
          </div>

          {/* Progress Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progresso Geral</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getOverallProgress()}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {getOverallProgress()}%
                </span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentos Obrigatórios</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${requiredProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {requiredProgress.checked}/{requiredProgress.total}
                </span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                requiredProgress.percentage === 100 
                  ? 'bg-green-100 text-green-800' 
                  : requiredProgress.percentage >= 50
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {requiredProgress.percentage === 100 
                  ? '✓ Pronto para submeter' 
                  : requiredProgress.percentage >= 50
                  ? '⚠ Em progresso'
                  : '❌ Documentação incompleta'
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-12">
            <Link href="/eb2-niw">
              <Button className="px-8 py-3">
                🎯 Analisar Casos Negados
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-3">
              💾 Salvar Progresso
            </Button>
          </div>

          {/* Document Categories */}
          <div className="space-y-6">
            {documentCategories.map((category) => (
              <div key={category.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? '' : category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {category.description}
                      </p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 max-w-xs">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getCategoryProgress(category)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {getCategoryProgress(category)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <div className={`transform transition-transform duration-200 ${
                        expandedCategory === category.id ? 'rotate-180' : ''
                      }`}>
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedCategory === category.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50/50">
                    <Checklist
                      documents={category.documents.map(doc => ({
                        id: doc.id,
                        name: doc.name,
                        description: doc.description,
                        required: doc.required,
                        category: 'professional' as const,
                        howToObtain: doc.tips || ['Consulte especialista para orientações específicas'],
                        tips: doc.tips
                      }))}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div className="mt-12 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 mb-4">
                  Notas Importantes sobre EB2 NIW
                </h3>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li>• <strong>Três Prongs:</strong> Todos os três critérios do caso Dhanasar devem ser atendidos</li>
                  <li>• <strong>Qualidade sobre Quantidade:</strong> Evidências fortes e relevantes são mais importantes que volume</li>
                  <li>• <strong>Cartas de Recomendação:</strong> Essenciais - busque especialistas reconhecidos na sua área</li>
                  <li>• <strong>Interesse Nacional:</strong> Demonstre claramente como seu trabalho beneficia os EUA</li>
                  <li>• <strong>Timeline:</strong> Processo pode levar 12-18 meses total</li>
                  <li>• <strong>Advogado:</strong> Altamente recomendado ter representação legal especializada</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
