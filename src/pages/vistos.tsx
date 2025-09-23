import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../lib/auth';

interface VisaType {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  requirements: string[];
  process: string[];
  fees: string;
  processingTime: string;
  advantages: string[];
  disadvantages: string[];
}

const visaTypes: VisaType[] = [
  {
    id: 'b1b2',
    name: 'B1/B2 - Turismo e Negócios',
    category: 'Não-Imigrante',
    description: 'Visto para turismo, visitas familiares, tratamento médico ou negócios temporários.',
    duration: 'Até 6 meses por entrada (múltiplas entradas por 10 anos)',
    requirements: [
      'Passaporte válido por pelo menos 6 meses',
      'Formulário DS-160 preenchido',
      'Foto 5x5cm recente',
      'Comprovante de renda e vínculos com o Brasil',
      'Seguro viagem (recomendado)',
      'Roteiro de viagem e reservas'
    ],
    process: [
      'Preencher formulário DS-160 online',
      'Pagar taxa consular ($185)',
      'Agendar entrevista no consulado',
      'Comparecer à entrevista com documentos',
      'Aguardar processamento (3-5 dias úteis)'
    ],
    fees: '$185 USD',
    processingTime: '3-5 dias úteis após a entrevista',
    advantages: [
      'Processo relativamente simples',
      'Válido por 10 anos',
      'Múltiplas entradas permitidas',
      'Não requer patrocinador'
    ],
    disadvantages: [
      'Não permite trabalho',
      'Não permite estudo formal',
      'Permanência limitada a 6 meses',
      'Sujeito à aprovação na entrada'
    ]
  },
  {
    id: 'f1',
    name: 'F1 - Estudante',
    category: 'Não-Imigrante',
    description: 'Visto para estudantes que desejam cursar graduação, pós-graduação ou cursos de idioma em instituições aprovadas.',
    duration: 'Duração do curso + 60 dias de graça + OPT (até 3 anos para STEM)',
    requirements: [
      'Aceitação em instituição aprovada pelo SEVP',
      'Formulário I-20 da instituição',
      'Comprovação financeira (I-134 ou extratos)',
      'TOEFL/IELTS (se exigido pela instituição)',
      'Histórico escolar traduzido',
      'Carta de intenção de retorno ao Brasil'
    ],
    process: [
      'Ser aceito em instituição americana',
      'Receber formulário I-20',
      'Pagar taxa SEVIS ($350)',
      'Preencher DS-160 e agendar entrevista',
      'Comparecer à entrevista consular',
      'Receber visto e viajar'
    ],
    fees: '$185 USD (visto) + $350 USD (SEVIS)',
    processingTime: '3-5 dias úteis após a entrevista',
    advantages: [
      'Permite trabalho no campus (20h/semana)',
      'OPT permite trabalho após formatura',
      'Possibilidade de mudança para H1B',
      'Cônjuge pode acompanhar (F2)'
    ],
    disadvantages: [
      'Trabalho limitado durante os estudos',
      'Custos educacionais elevados',
      'Necessidade de manter status de estudante',
      'Intenção de retorno ao país de origem'
    ]
  },
  {
    id: 'h1b',
    name: 'H1B - Trabalhador Especializado',
    category: 'Não-Imigrante',
    description: 'Visto para profissionais especializados com oferta de emprego de empresa americana.',
    duration: 'Até 6 anos (3 anos iniciais + renovação de 3 anos)',
    requirements: [
      'Oferta de emprego de empresa americana',
      'Graduação ou experiência equivalente',
      'Especialização na área de trabalho',
      'Salário compatível com o mercado (LCA)',
      'Empresa deve fazer petição I-129',
      'Aprovação no sistema de loteria (se aplicável)'
    ],
    process: [
      'Empresa registra no sistema de loteria (março)',
      'Se selecionado, empresa submete petição I-129',
      'Aguardar aprovação da petição (3-6 meses)',
      'Aplicar para visto no consulado',
      'Entrevista consular',
      'Receber visto e iniciar trabalho'
    ],
    fees: '$190 USD (visto) + taxas da petição (pagas pela empresa)',
    processingTime: '3-6 meses para petição + 3-5 dias para visto',
    advantages: [
      'Permite trabalho em tempo integral',
      'Salários competitivos',
      'Possibilidade de green card',
      'Cônjuge pode trabalhar (H4 EAD)'
    ],
    disadvantages: [
      'Sistema de loteria competitivo',
      'Dependente do empregador',
      'Processo longo e custoso',
      'Limitado a 6 anos total'
    ]
  },
  {
    id: 'eb5',
    name: 'EB-5 - Investidor',
    category: 'Imigrante',
    description: 'Visto de residência permanente para investidores que criam empregos nos EUA.',
    duration: 'Residência permanente (Green Card)',
    requirements: [
      'Investimento mínimo de $800,000 (TEA) ou $1,050,000',
      'Criação de pelo menos 10 empregos diretos',
      'Fonte legal dos recursos comprovada',
      'Investimento em projeto aprovado pelo USCIS',
      'Plano de negócios detalhado',
      'Experiência empresarial (preferível)'
    ],
    process: [
      'Escolher projeto EB-5 ou criar próprio negócio',
      'Submeter petição I-526E',
      'Aguardar aprovação (18-36 meses)',
      'Aplicar para visto de imigrante',
      'Entrar nos EUA como residente condicional',
      'Submeter I-829 para remover condições (após 2 anos)'
    ],
    fees: '$3,675 USD (I-526E) + $4,465 USD (I-829) + taxas do projeto',
    processingTime: '3-5 anos para processo completo',
    advantages: [
      'Residência permanente imediata',
      'Família incluída no processo',
      'Não requer patrocinador',
      'Caminho para cidadania americana'
    ],
    disadvantages: [
      'Investimento muito alto',
      'Risco de perda do investimento',
      'Processo longo e complexo',
      'Necessidade de manter investimento por 5+ anos'
    ]
  },
  {
    id: 'o1',
    name: 'O1 - Habilidade Extraordinária',
    category: 'Não-Imigrante',
    description: 'Visto para indivíduos com habilidades extraordinárias em ciências, artes, educação, negócios ou atletismo.',
    duration: 'Até 3 anos iniciais (renovações de 1 ano)',
    requirements: [
      'Reconhecimento nacional ou internacional na área',
      'Prêmios ou conquistas significativas',
      'Publicações ou mídia sobre o trabalho',
      'Participação em painéis de julgamento',
      'Contribuições originais de importância',
      'Patrocinador americano (empregador ou agente)'
    ],
    process: [
      'Reunir evidências de habilidade extraordinária',
      'Encontrar patrocinador americano',
      'Submeter petição I-129 com evidências',
      'Aguardar aprovação da petição',
      'Aplicar para visto no consulado',
      'Entrevista consular e recebimento do visto'
    ],
    fees: '$190 USD (visto) + taxas da petição (pagas pelo patrocinador)',
    processingTime: '2-4 meses para petição + 3-5 dias para visto',
    advantages: [
      'Não há limite anual de vistos',
      'Renovações relativamente fáceis',
      'Cônjuge pode acompanhar (O3)',
      'Possibilidade de green card'
    ],
    disadvantages: [
      'Critérios muito rigorosos',
      'Necessidade de patrocinador',
      'Documentação extensa necessária',
      'Limitado a área de especialização'
    ]
  },
  {
    id: 'eb2-niw',
    name: 'EB2 NIW - National Interest Waiver',
    category: 'Imigrante',
    description: 'Green card para profissionais com trabalho de interesse nacional, sem necessidade de empregador patrocinador.',
    duration: 'Residência permanente (Green Card)',
    requirements: [
      'Graduação avançada ou experiência equivalente',
      'Trabalho de mérito substancial e importância nacional',
      'Estar bem posicionado para avançar a área',
      'Benefício aos EUA justifica dispensa do PERM',
      'Evidências de reconhecimento na área',
      'Publicações, citações ou prêmios relevantes'
    ],
    process: [
      'Reunir evidências dos três prongs NIW',
      'Preparar petição I-140 detalhada',
      'Submeter petição ao USCIS',
      'Aguardar aprovação (8-12 meses)',
      'Aplicar para ajuste de status ou visto de imigrante',
      'Receber green card condicional ou definitivo'
    ],
    fees: '$700 USD (I-140) + $220 USD (biometria) + taxas de ajuste',
    processingTime: '8-12 meses para I-140 + 6-12 meses para ajuste',
    advantages: [
      'Não precisa de empregador patrocinador',
      'Residência permanente imediata',
      'Família incluída no processo',
      'Flexibilidade para mudar de emprego',
      'Caminho direto para cidadania'
    ],
    disadvantages: [
      'Critérios muito específicos (3 prongs)',
      'Processo longo e complexo',
      'Alta taxa de negação se mal preparado',
      'Necessidade de evidências substanciais',
      'Competição com outros casos similares'
    ]
  }
];

const categories = ['Todos', 'Não-Imigrante', 'Imigrante'];

export default function Vistos() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [isSelectingVisa, setIsSelectingVisa] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const filteredVisas = selectedCategory === 'Todos' 
    ? visaTypes 
    : visaTypes.filter(visa => visa.category === selectedCategory);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando informações de vistos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not authenticated (this shouldn't happen due to useEffect above)
  if (!user) {
    return null;
  }

  // Função para selecionar um visto como preferido
  const handleSelectVisa = async (visaId: string) => {
    if (!user) return;
    
    setIsSelectingVisa(true);
    try {
      // Mapear o ID do visto para o formato usado no sistema
      const visaMapping: Record<string, string> = {
        'b1b2': 'B1/B2',
        'f1': 'F1',
        'h1b': 'H1B',
        'eb5': 'EB5',
        'o1': 'O1',
        'eb2-niw': 'EB2 NIW'
      };

      const mappedVisaId = visaMapping[visaId] || visaId;
      
      await updateUserProfile(user.uid, {
        selectedVisa: mappedVisaId
      });
      
      await refreshUserProfile();
      
      // Mostrar feedback de sucesso
      alert('Visto selecionado com sucesso! Agora você pode treinar especificamente para este tipo de visto.');
      
    } catch (error) {
      console.error('Erro ao selecionar visto:', error);
      alert('Erro ao selecionar visto. Tente novamente.');
    } finally {
      setIsSelectingVisa(false);
    }
  };

  // Função para obter o visto atual do usuário (escolhido ou recomendado)
  const getCurrentVisa = () => {
    return userProfile?.selectedVisa || userProfile?.recommendedVisa;
  };

  // Função para verificar se o usuário escolheu um visto diferente do recomendado
  const hasCustomVisa = () => {
    return userProfile?.selectedVisa && userProfile.selectedVisa !== userProfile.recommendedVisa;
  };

  if (selectedVisa) {
    const currentVisa = getCurrentVisa();
    const isCurrentVisa = selectedVisa.id === 'b1b2' && currentVisa === 'B1/B2' ||
                         selectedVisa.id === 'f1' && currentVisa === 'F1' ||
                         selectedVisa.id === 'h1b' && currentVisa === 'H1B' ||
                         selectedVisa.id === 'eb5' && currentVisa === 'EB5' ||
                         selectedVisa.id === 'o1' && currentVisa === 'O1' ||
                         selectedVisa.id === 'eb2-niw' && currentVisa === 'EB2 NIW';

    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedVisa(null)}
                className="mb-4"
              >
                ← Voltar para lista de vistos
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 px-6 py-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold">{selectedVisa.name}</h1>
                    <p className="mt-2 text-blue-100">{selectedVisa.description}</p>
                    <div className="mt-4 inline-block bg-blue-500 px-3 py-1 rounded-full text-sm">
                      {selectedVisa.category}
                    </div>
                  </div>
                  
                  {/* Status do visto */}
                  {isCurrentVisa && (
                    <div className="bg-green-500 px-3 py-1 rounded-full text-sm font-medium">
                      {userProfile?.selectedVisa ? 'Visto Escolhido' : 'Visto Recomendado'}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Informações Básicas */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Duração</h3>
                    <p className="text-gray-700">{selectedVisa.duration}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Taxa Consular</h3>
                    <p className="text-gray-700">{selectedVisa.fees}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Tempo de Processamento</h3>
                    <p className="text-gray-700">{selectedVisa.processingTime}</p>
                  </div>
                </div>

                {/* Requisitos */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Requisitos</h3>
                  <ul className="space-y-2">
                    {selectedVisa.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Processo */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Processo de Aplicação</h3>
                  <ol className="space-y-3">
                    {selectedVisa.process.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Vantagens e Desvantagens */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Vantagens</h3>
                    <ul className="space-y-2">
                      {selectedVisa.advantages.map((advantage, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2 mt-1">+</span>
                          <span className="text-gray-700">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Desvantagens</h3>
                    <ul className="space-y-2">
                      {selectedVisa.disadvantages.map((disadvantage, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-600 mr-2 mt-1">-</span>
                          <span className="text-gray-700">{disadvantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">
                      Quer focar neste tipo de visto?
                    </h4>
                    <p className="text-blue-700 mb-4">
                      Selecione este visto para personalizar seu treinamento e preparação.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!isCurrentVisa && (
                      <Button 
                        onClick={() => handleSelectVisa(selectedVisa.id)}
                        disabled={isSelectingVisa}
                        className="flex-1 sm:flex-none"
                      >
                        {isSelectingVisa ? 'Selecionando...' : 'Escolher Este Visto'}
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => router.push(`/documentos/${selectedVisa.id}`)}
                      className="flex-1 sm:flex-none"
                    >
                      Ver Documentos
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/treinamento')}
                      className="flex-1 sm:flex-none"
                    >
                      Treinar com IA
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      Falar com Especialista
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tipos de Visto para os EUA
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça os principais tipos de visto americano, seus requisitos e processos. 
              Encontre o visto ideal para sua situação.
            </p>
            
            {/* Mostrar visto atual se houver */}
            {getCurrentVisa() && (
              <div className="mt-6 inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Seu visto atual: {getCurrentVisa()}
                {userProfile?.selectedVisa && userProfile.selectedVisa !== userProfile.recommendedVisa && (
                  <span className="ml-2 text-xs">(Escolhido por você)</span>
                )}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Visa Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVisas.map((visa) => {
              const currentVisa = getCurrentVisa();
              const isCurrentVisa = visa.id === 'b1b2' && currentVisa === 'B1/B2' ||
                                   visa.id === 'f1' && currentVisa === 'F1' ||
                                   visa.id === 'h1b' && currentVisa === 'H1B' ||
                                   visa.id === 'eb5' && currentVisa === 'EB5' ||
                                   visa.id === 'o1' && currentVisa === 'O1' ||
                                   visa.id === 'eb2-niw' && currentVisa === 'EB2 NIW';
              
              return (
                <div
                  key={visa.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer relative ${
                    isCurrentVisa ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => setSelectedVisa(visa)}
                >
                  {isCurrentVisa && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {userProfile?.selectedVisa ? 'Escolhido' : 'Recomendado'}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {visa.name}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {visa.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {visa.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {visa.duration}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {visa.fees}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVisa(visa);
                      }}>
                        Ver Detalhes
                      </Button>
                      <Button className="flex-1" onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/documentos/${visa.id}`);
                      }}>
                        Documentos
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-blue-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Não sabe qual visto é ideal para você?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Faça nosso questionário inteligente e descubra qual tipo de visto americano 
              é mais adequado para seu perfil e objetivos.
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => router.push('/questionario')}
            >
              Fazer Questionário Gratuito
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
