export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'personal' | 'financial' | 'educational' | 'professional' | 'legal' | 'travel';
  howToObtain: string[];
  howToFill?: string[];
  tips?: string[];
  examples?: string[];
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  substeps: string[];
  tips: string[];
  commonMistakes?: string[];
}

export interface VisaDocuments {
  visaId: string;
  visaName: string;
  documents: DocumentItem[];
  processSteps: ProcessStep[];
  totalEstimatedTime: string;
  averageCost: string;
  successTips: string[];
}

export const visaDocumentsData: Record<string, VisaDocuments> = {
  'b1b2': {
    visaId: 'b1b2',
    visaName: 'B1/B2 - Turismo e Negócios',
    totalEstimatedTime: '2-4 semanas',
    averageCost: '$185 - $300',
    successTips: [
      'Demonstre vínculos fortes com o Brasil',
      'Seja claro sobre o propósito da viagem',
      'Tenha documentos financeiros organizados',
      'Pratique as respostas da entrevista',
      'Vista-se adequadamente para a entrevista'
    ],
    documents: [
      {
        id: 'passport',
        name: 'Passaporte Brasileiro',
        description: 'Passaporte válido por pelo menos 6 meses além da data planejada de retorno',
        required: true,
        category: 'personal',
        howToObtain: [
          'Acesse o site da Polícia Federal (pf.gov.br)',
          'Agende atendimento online',
          'Compareça ao posto com documentos originais',
          'Pague a taxa de R$ 257,25',
          'Aguarde 6 dias úteis para retirada'
        ],
        tips: [
          'Verifique se há páginas em branco suficientes',
          'Confira se não há danos no passaporte',
          'Faça cópias coloridas de todas as páginas'
        ]
      },
      {
        id: 'ds160',
        name: 'Formulário DS-160',
        description: 'Formulário de solicitação de visto preenchido online',
        required: true,
        category: 'legal',
        howToObtain: [
          'Acesse ceac.state.gov/genniv',
          'Selecione o consulado onde fará a entrevista',
          'Preencha todas as seções obrigatórias',
          'Faça upload da foto no formato exigido',
          'Imprima a página de confirmação'
        ],
        howToFill: [
          'Use apenas informações verdadeiras',
          'Seja consistente com outros documentos',
          'Preencha em inglês, exceto nomes próprios',
          'Salve frequentemente durante o preenchimento',
          'Revise todas as informações antes de submeter'
        ],
        tips: [
          'Guarde o número de confirmação',
          'Imprima a página de confirmação',
          'Não deixe campos obrigatórios em branco'
        ]
      },
      {
        id: 'photo',
        name: 'Foto 5x5cm',
        description: 'Foto recente no padrão americano (5x5cm, fundo branco)',
        required: true,
        category: 'personal',
        howToObtain: [
          'Procure um fotógrafo especializado em fotos para visto',
          'Use roupas formais e cores neutras',
          'Mantenha expressão neutra',
          'Certifique-se do fundo branco uniforme',
          'Solicite versão digital e impressa'
        ],
        tips: [
          'Não use óculos escuros ou chapéus',
          'Evite sorrir ou fazer expressões',
          'Cabelo não deve cobrir o rosto',
          'Foto deve ter menos de 6 meses'
        ]
      },
      {
        id: 'financial_proof',
        name: 'Comprovação Financeira',
        description: 'Documentos que comprovem capacidade financeira para a viagem',
        required: true,
        category: 'financial',
        howToObtain: [
          'Solicite extratos bancários dos últimos 3 meses',
          'Obtenha declaração de Imposto de Renda',
          'Colete comprovantes de renda (holerites, pró-labore)',
          'Reúna comprovantes de bens (imóveis, veículos)',
          'Organize em ordem cronológica'
        ],
        tips: [
          'Mantenha saldo consistente nos extratos',
          'Evite depósitos grandes próximos à entrevista',
          'Inclua diferentes tipos de comprovação',
          'Traduza documentos se necessário'
        ]
      },
      {
        id: 'employment_letter',
        name: 'Carta do Empregador',
        description: 'Declaração do empregador confirmando vínculo empregatício',
        required: false,
        category: 'professional',
        howToObtain: [
          'Solicite ao RH ou supervisor direto',
          'Inclua cargo, salário e tempo de empresa',
          'Mencione período de férias aprovado',
          'Use papel timbrado da empresa',
          'Obtenha assinatura e carimbo'
        ],
        howToFill: [
          'Data da carta recente (máximo 30 dias)',
          'Informações completas do funcionário',
          'Confirmação de retorno ao trabalho',
          'Dados de contato da empresa'
        ],
        tips: [
          'Carta deve estar em inglês ou com tradução',
          'Inclua informações de contato do RH',
          'Mantenha tom formal e profissional'
        ]
      },
      {
        id: 'travel_itinerary',
        name: 'Roteiro de Viagem',
        description: 'Planejamento detalhado da viagem incluindo hospedagem e atividades',
        required: false,
        category: 'travel',
        howToObtain: [
          'Reserve hotéis (reservas canceláveis)',
          'Planeje roteiro de cidades e atividades',
          'Pesquise passagens aéreas (não precisa comprar)',
          'Organize cronograma dia a dia',
          'Imprima confirmações de reservas'
        ],
        tips: [
          'Seja realista com o tempo disponível',
          'Inclua atividades turísticas conhecidas',
          'Mantenha coerência com o propósito da viagem',
          'Tenha reservas flexíveis até obter o visto'
        ]
      }
    ],
    processSteps: [
      {
        id: 'step1',
        title: 'Preparação de Documentos',
        description: 'Reúna e organize todos os documentos necessários',
        estimatedTime: '1-2 semanas',
        difficulty: 'medium',
        substeps: [
          'Verifique validade do passaporte',
          'Tire foto no padrão americano',
          'Colete comprovantes financeiros',
          'Solicite carta do empregador',
          'Organize documentos em pasta'
        ],
        tips: [
          'Faça cópias de todos os documentos',
          'Organize em ordem lógica',
          'Traduza documentos quando necessário'
        ],
        commonMistakes: [
          'Passaporte com validade insuficiente',
          'Foto fora do padrão exigido',
          'Documentos financeiros desatualizados'
        ]
      },
      {
        id: 'step2',
        title: 'Preenchimento do DS-160',
        description: 'Complete o formulário online de solicitação de visto',
        estimatedTime: '2-3 horas',
        difficulty: 'medium',
        substeps: [
          'Acesse o site oficial ceac.state.gov',
          'Selecione o consulado correto',
          'Preencha todas as seções obrigatórias',
          'Faça upload da foto digital',
          'Revise e submeta o formulário',
          'Imprima a página de confirmação'
        ],
        tips: [
          'Salve o progresso frequentemente',
          'Use informações consistentes com outros documentos',
          'Seja honesto em todas as respostas'
        ],
        commonMistakes: [
          'Informações inconsistentes',
          'Foto no formato incorreto',
          'Não salvar o número de confirmação'
        ]
      },
      {
        id: 'step3',
        title: 'Pagamento da Taxa',
        description: 'Pague a taxa consular de $185',
        estimatedTime: '30 minutos',
        difficulty: 'easy',
        substeps: [
          'Acesse o site do consulado americano',
          'Crie conta no sistema de agendamento',
          'Selecione tipo de visto B1/B2',
          'Efetue pagamento via cartão ou boleto',
          'Guarde comprovante de pagamento'
        ],
        tips: [
          'Taxa não é reembolsável',
          'Pagamento é válido por 1 ano',
          'Guarde o recibo para o agendamento'
        ]
      },
      {
        id: 'step4',
        title: 'Agendamento da Entrevista',
        description: 'Agende sua entrevista no consulado americano',
        estimatedTime: '30 minutos',
        difficulty: 'easy',
        substeps: [
          'Faça login no sistema de agendamento',
          'Selecione data e horário disponível',
          'Confirme o agendamento',
          'Imprima carta de agendamento',
          'Anote endereço e instruções do consulado'
        ],
        tips: [
          'Agende com antecedência (datas limitadas)',
          'Chegue 15 minutos antes do horário',
          'Leve apenas documentos necessários'
        ]
      },
      {
        id: 'step5',
        title: 'Entrevista Consular',
        description: 'Compareça à entrevista no consulado americano',
        estimatedTime: '2-4 horas (incluindo espera)',
        difficulty: 'hard',
        substeps: [
          'Chegue ao consulado no horário',
          'Passe pela segurança',
          'Aguarde ser chamado',
          'Apresente documentos ao oficial',
          'Responda perguntas da entrevista',
          'Aguarde decisão'
        ],
        tips: [
          'Vista-se formalmente',
          'Seja honesto e direto',
          'Mantenha calma e confiança',
          'Leve apenas documentos necessários'
        ],
        commonMistakes: [
          'Chegar atrasado',
          'Respostas inconsistentes',
          'Nervosismo excessivo',
          'Documentos desorganizados'
        ]
      }
    ]
  },
  'f1': {
    visaId: 'f1',
    visaName: 'F1 - Estudante',
    totalEstimatedTime: '3-6 meses',
    averageCost: '$535 - $1000',
    successTips: [
      'Demonstre intenção genuína de estudar',
      'Comprove capacidade financeira suficiente',
      'Mostre vínculos com o Brasil para retorno',
      'Conheça bem o programa e a instituição',
      'Pratique inglês para a entrevista'
    ],
    documents: [
      {
        id: 'i20',
        name: 'Formulário I-20',
        description: 'Certificado de elegibilidade emitido pela instituição americana',
        required: true,
        category: 'educational',
        howToObtain: [
          'Seja aceito em instituição aprovada pelo SEVP',
          'Submeta documentos financeiros à escola',
          'Aguarde processamento pela escola',
          'Receba I-20 por correio ou email',
          'Assine o formulário I-20'
        ],
        tips: [
          'Verifique se todas as informações estão corretas',
          'Guarde o original em local seguro',
          'Faça cópias para seus arquivos'
        ]
      },
      {
        id: 'sevis_fee',
        name: 'Comprovante Taxa SEVIS',
        description: 'Recibo de pagamento da taxa SEVIS de $350',
        required: true,
        category: 'financial',
        howToObtain: [
          'Acesse fmjfee.com',
          'Insira informações do I-20',
          'Pague taxa de $350 via cartão',
          'Imprima recibo de pagamento',
          'Guarde comprovante'
        ],
        tips: [
          'Pague pelo menos 3 dias antes da entrevista',
          'Use cartão de crédito internacional',
          'Mantenha recibo original'
        ]
      },
      {
        id: 'financial_support',
        name: 'Comprovação Financeira',
        description: 'Documentos provando capacidade de custear estudos e vida nos EUA',
        required: true,
        category: 'financial',
        howToObtain: [
          'Colete extratos bancários (últimos 3-6 meses)',
          'Obtenha declaração de IR dos pais/patrocinador',
          'Reúna comprovantes de renda familiar',
          'Documente bens e investimentos',
          'Organize carta de patrocínio se aplicável'
        ],
        tips: [
          'Valor deve cobrir pelo menos 1 ano de estudos',
          'Inclua tuition + living expenses',
          'Mantenha consistência nos valores'
        ]
      },
      {
        id: 'academic_records',
        name: 'Histórico Escolar',
        description: 'Históricos escolares traduzidos e autenticados',
        required: true,
        category: 'educational',
        howToObtain: [
          'Solicite históricos na instituição de origem',
          'Traduza por tradutor juramentado',
          'Autentique em cartório se necessário',
          'Organize em ordem cronológica',
          'Inclua diplomas e certificados'
        ],
        tips: [
          'Traduções devem ser juramentadas',
          'Inclua notas e conceitos',
          'Mantenha originais e cópias'
        ]
      },
      {
        id: 'english_proficiency',
        name: 'Comprovação de Inglês',
        description: 'Resultados de testes como TOEFL, IELTS ou equivalente',
        required: false,
        category: 'educational',
        howToObtain: [
          'Registre-se para TOEFL ou IELTS',
          'Estude e pratique para o teste',
          'Realize o exame',
          'Solicite envio de scores para a escola',
          'Obtenha cópia oficial dos resultados'
        ],
        tips: [
          'Alguns programas dispensam se inglês for língua nativa',
          'Scores devem ser válidos (geralmente 2 anos)',
          'Verifique requisitos mínimos da instituição'
        ]
      },
      {
        id: 'statement_purpose',
        name: 'Carta de Intenção',
        description: 'Declaração explicando objetivos acadêmicos e profissionais',
        required: false,
        category: 'educational',
        howToObtain: [
          'Redija carta explicando motivações',
          'Descreva objetivos acadêmicos',
          'Explique planos pós-graduação',
          'Demonstre intenção de retorno ao Brasil',
          'Revise gramática e ortografia'
        ],
        howToFill: [
          'Seja específico sobre o programa escolhido',
          'Conecte estudos com objetivos profissionais',
          'Mencione vínculos com o Brasil',
          'Mantenha tom profissional'
        ],
        tips: [
          'Limite a 1-2 páginas',
          'Use inglês claro e correto',
          'Seja genuíno e específico'
        ]
      }
    ],
    processSteps: [
      {
        id: 'step1',
        title: 'Aplicação para Universidade',
        description: 'Candidate-se e seja aceito em instituição americana aprovada',
        estimatedTime: '2-6 meses',
        difficulty: 'hard',
        substeps: [
          'Pesquise universidades e programas',
          'Prepare documentos acadêmicos',
          'Realize testes de proficiência',
          'Submeta aplicações',
          'Aguarde cartas de aceitação'
        ],
        tips: [
          'Aplique para múltiplas instituições',
          'Verifique deadlines de aplicação',
          'Prepare-se para testes padronizados'
        ]
      },
      {
        id: 'step2',
        title: 'Obtenção do I-20',
        description: 'Receba o formulário I-20 da instituição',
        estimatedTime: '2-4 semanas',
        difficulty: 'medium',
        substeps: [
          'Confirme aceitação na universidade',
          'Submeta documentos financeiros',
          'Aguarde processamento',
          'Receba I-20 por correio',
          'Assine o formulário'
        ],
        tips: [
          'Responda rapidamente às solicitações da escola',
          'Mantenha comunicação ativa',
          'Verifique informações no I-20'
        ]
      },
      {
        id: 'step3',
        title: 'Pagamento da Taxa SEVIS',
        description: 'Pague a taxa SEVIS de $350',
        estimatedTime: '30 minutos',
        difficulty: 'easy',
        substeps: [
          'Acesse site oficial SEVIS',
          'Insira dados do I-20',
          'Efetue pagamento',
          'Imprima recibo',
          'Guarde comprovante'
        ],
        tips: [
          'Pague antes de agendar entrevista',
          'Use cartão internacional',
          'Mantenha recibo original'
        ]
      },
      {
        id: 'step4',
        title: 'Solicitação de Visto',
        description: 'Complete DS-160 e agende entrevista',
        estimatedTime: '1-2 semanas',
        difficulty: 'medium',
        substeps: [
          'Preencha formulário DS-160',
          'Pague taxa consular ($185)',
          'Agende entrevista',
          'Prepare documentos',
          'Organize pasta de documentos'
        ],
        tips: [
          'Seja consistente com informações do I-20',
          'Agende com antecedência',
          'Organize documentos logicamente'
        ]
      },
      {
        id: 'step5',
        title: 'Entrevista Consular',
        description: 'Compareça à entrevista no consulado',
        estimatedTime: '2-4 horas',
        difficulty: 'hard',
        substeps: [
          'Chegue cedo ao consulado',
          'Passe pela segurança',
          'Apresente documentos',
          'Responda perguntas sobre estudos',
          'Aguarde decisão'
        ],
        tips: [
          'Demonstre conhecimento sobre o programa',
          'Explique planos de retorno ao Brasil',
          'Mantenha confiança e honestidade'
        ]
      }
    ]
  },
  'h1b': {
    visaId: 'h1b',
    visaName: 'H1B - Trabalhador Especializado',
    totalEstimatedTime: '6-12 meses',
    averageCost: '$2000 - $5000',
    successTips: [
      'Tenha graduação ou experiência equivalente',
      'Encontre empregador disposto a patrocinar',
      'Prepare-se para processo de loteria',
      'Mantenha documentos acadêmicos organizados',
      'Demonstre especialização na área'
    ],
    documents: [
      {
        id: 'job_offer',
        name: 'Oferta de Emprego',
        description: 'Carta oficial de oferta de trabalho da empresa americana',
        required: true,
        category: 'professional',
        howToObtain: [
          'Candidate-se a vagas em empresas americanas',
          'Passe por processo seletivo',
          'Negocie termos de contratação',
          'Receba oferta formal por escrito',
          'Confirme disposição da empresa em patrocinar H1B'
        ],
        tips: [
          'Empresa deve estar registrada nos EUA',
          'Salário deve atender requisitos LCA',
          'Posição deve exigir graduação superior'
        ]
      },
      {
        id: 'degree_certificate',
        name: 'Diploma Universitário',
        description: 'Diploma de graduação ou pós-graduação traduzido e avaliado',
        required: true,
        category: 'educational',
        howToObtain: [
          'Obtenha cópia autenticada do diploma',
          'Traduza por tradutor juramentado',
          'Faça avaliação de credenciais (WES, ECE, etc.)',
          'Solicite histórico escolar traduzido',
          'Organize certificados adicionais'
        ],
        tips: [
          'Avaliação deve ser de agência reconhecida',
          'Diploma deve ser relacionado à posição',
          'Inclua certificações profissionais relevantes'
        ]
      },
      {
        id: 'experience_letters',
        name: 'Cartas de Experiência',
        description: 'Documentos comprovando experiência profissional relevante',
        required: false,
        category: 'professional',
        howToObtain: [
          'Solicite cartas de empregadores anteriores',
          'Inclua descrição detalhada das funções',
          'Documente período de trabalho',
          'Obtenha em papel timbrado',
          'Traduza para inglês se necessário'
        ],
        tips: [
          'Experiência pode substituir educação formal',
          'Cada ano de experiência = parte da graduação',
          'Inclua projetos e responsabilidades específicas'
        ]
      },
      {
        id: 'resume',
        name: 'Currículo Atualizado',
        description: 'CV detalhado em formato americano',
        required: true,
        category: 'professional',
        howToObtain: [
          'Adapte CV para padrão americano',
          'Destaque experiência relevante',
          'Inclua educação e certificações',
          'Liste habilidades técnicas',
          'Revise gramática e formatação'
        ],
        howToFill: [
          'Use formato cronológico reverso',
          'Inclua números e resultados específicos',
          'Adapte para a posição oferecida',
          'Mantenha entre 1-2 páginas'
        ],
        tips: [
          'Não inclua foto ou informações pessoais',
          'Use verbos de ação',
          'Quantifique conquistas quando possível'
        ]
      },
      {
        id: 'lca_approval',
        name: 'Aprovação LCA',
        description: 'Labor Condition Application aprovada pelo Departamento do Trabalho',
        required: true,
        category: 'legal',
        howToObtain: [
          'Empregador submete LCA ao DOL',
          'Aguarda aprovação (geralmente 7 dias)',
          'Recebe certificação LCA',
          'Empresa arquiva cópia no local de trabalho',
          'Obtém cópia para processo de visto'
        ],
        tips: [
          'LCA deve ser aprovada antes da petição I-129',
          'Salário deve atender wage level exigido',
          'Válida por 3 anos'
        ]
      }
    ],
    processSteps: [
      {
        id: 'step1',
        title: 'Busca por Empregador',
        description: 'Encontre empresa americana disposta a patrocinar H1B',
        estimatedTime: '3-12 meses',
        difficulty: 'hard',
        substeps: [
          'Pesquise empresas que patrocinam H1B',
          'Adapte currículo para mercado americano',
          'Candidate-se a posições relevantes',
          'Participe de entrevistas',
          'Negocie oferta incluindo patrocínio H1B'
        ],
        tips: [
          'Use sites como MyVisaJobs.com para pesquisar',
          'Network com profissionais da área',
          'Considere empresas de consultoria'
        ]
      },
      {
        id: 'step2',
        title: 'Registro na Loteria',
        description: 'Empresa registra candidato no sistema de loteria H1B',
        estimatedTime: '1 semana (março)',
        difficulty: 'medium',
        substeps: [
          'Empresa prepara documentos básicos',
          'Registra no sistema USCIS em março',
          'Paga taxa de registro ($10)',
          'Aguarda resultado da loteria',
          'Recebe notificação se selecionado'
        ],
        tips: [
          'Registro acontece apenas em março',
          'Múltiplas empresas podem registrar mesmo candidato',
          'Taxa não é reembolsável'
        ]
      },
      {
        id: 'step3',
        title: 'Petição I-129',
        description: 'Empresa submete petição completa se selecionado na loteria',
        estimatedTime: '3-6 meses',
        difficulty: 'hard',
        substeps: [
          'Empresa prepara petição I-129',
          'Inclui todos os documentos de apoio',
          'Paga taxas governamentais',
          'Submete ao USCIS',
          'Aguarda decisão da petição'
        ],
        tips: [
          'Processo pode ser acelerado com Premium Processing',
          'Empresa é responsável por taxas e documentação',
          'Mantenha cópias de todos os documentos'
        ]
      },
      {
        id: 'step4',
        title: 'Solicitação de Visto',
        description: 'Aplique para visto H1B no consulado após aprovação da petição',
        estimatedTime: '2-4 semanas',
        difficulty: 'medium',
        substeps: [
          'Preencha formulário DS-160',
          'Pague taxa consular ($190)',
          'Agende entrevista no consulado',
          'Prepare documentos pessoais',
          'Compareça à entrevista'
        ],
        tips: [
          'Aguarde aprovação da petição antes de aplicar',
          'Leve cópia da aprovação I-797',
          'Demonstre intenção temporária'
        ]
      },
      {
        id: 'step5',
        title: 'Entrada nos EUA',
        description: 'Viaje para os EUA e inicie trabalho',
        estimatedTime: '1 dia',
        difficulty: 'easy',
        substeps: [
          'Receba visto no passaporte',
          'Viaje para os EUA',
          'Passe pela imigração no aeroporto',
          'Receba I-94 de entrada',
          'Inicie trabalho na data acordada'
        ],
        tips: [
          'Não pode iniciar trabalho antes da data no I-797',
          'Mantenha documentos organizados para entrada',
          'Trabalho limitado ao empregador peticionário'
        ]
      }
    ]
  },
  'eb5': {
    visaId: 'eb5',
    visaName: 'EB-5 - Investidor',
    totalEstimatedTime: '3-5 anos',
    averageCost: '$800,000 - $1,050,000+',
    successTips: [
      'Comprove origem legal dos recursos',
      'Escolha projeto EB-5 confiável',
      'Mantenha documentação financeira detalhada',
      'Considere contratar advogado especializado',
      'Entenda riscos do investimento'
    ],
    documents: [
      {
        id: 'investment_funds',
        name: 'Comprovação de Recursos',
        description: 'Documentos provando origem legal dos fundos de investimento',
        required: true,
        category: 'financial',
        howToObtain: [
          'Colete extratos bancários históricos',
          'Reúna declarações de IR de vários anos',
          'Documente vendas de bens e investimentos',
          'Obtenha cartas de bancos e contadores',
          'Organize trilha completa dos recursos'
        ],
        tips: [
          'Documentação deve cobrir vários anos',
          'Inclua todas as fontes de renda',
          'Traduza documentos para inglês'
        ]
      },
      {
        id: 'business_plan',
        name: 'Plano de Negócios',
        description: 'Plano detalhado do projeto EB-5 ou negócio próprio',
        required: true,
        category: 'professional',
        howToObtain: [
          'Contrate consultor especializado em EB-5',
          'Desenvolva análise de mercado',
          'Projete criação de empregos',
          'Inclua análises financeiras',
          'Revise com advogado de imigração'
        ],
        tips: [
          'Deve demonstrar criação de 10+ empregos',
          'Inclua cronograma realista',
          'Use dados de mercado confiáveis'
        ]
      },
      {
        id: 'project_documents',
        name: 'Documentos do Projeto',
        description: 'Contratos e documentos do projeto EB-5 escolhido',
        required: true,
        category: 'legal',
        howToObtain: [
          'Pesquise projetos EB-5 aprovados',
          'Analise documentos de oferta',
          'Revise contratos com advogado',
          'Assine acordos de investimento',
          'Obtenha cópias de todos os documentos'
        ],
        tips: [
          'Escolha projetos com histórico comprovado',
          'Entenda riscos do investimento',
          'Verifique aprovação prévia do USCIS'
        ]
      },
      {
        id: 'medical_exam',
        name: 'Exame Médico',
        description: 'Exame médico realizado por médico aprovado pelo consulado',
        required: true,
        category: 'personal',
        howToObtain: [
          'Encontre médico aprovado pelo consulado',
          'Agende exame médico',
          'Complete vacinações necessárias',
          'Realize exames laboratoriais',
          'Obtenha relatório médico selado'
        ],
        tips: [
          'Exame deve ser recente (6 meses)',
          'Inclua histórico de vacinações',
          'Alguns exames podem ser repetidos'
        ]
      }
    ],
    processSteps: [
      {
        id: 'step1',
        title: 'Escolha do Projeto',
        description: 'Selecione projeto EB-5 ou desenvolva negócio próprio',
        estimatedTime: '2-6 meses',
        difficulty: 'hard',
        substeps: [
          'Pesquise projetos EB-5 disponíveis',
          'Analise histórico e credibilidade',
          'Revise documentos de oferta',
          'Consulte advogado especializado',
          'Tome decisão de investimento'
        ],
        tips: [
          'Due diligence é crucial',
          'Considere localização do projeto',
          'Avalie experiência dos desenvolvedores'
        ]
      },
      {
        id: 'step2',
        title: 'Preparação de Documentos',
        description: 'Reúna toda documentação necessária para I-526E',
        estimatedTime: '3-6 meses',
        difficulty: 'hard',
        substeps: [
          'Compile histórico financeiro completo',
          'Prepare documentos de origem dos fundos',
          'Desenvolva plano de negócios',
          'Traduza documentos para inglês',
          'Organize dossiê completo'
        ],
        tips: [
          'Documentação deve ser muito detalhada',
          'Use tradutor juramentado',
          'Mantenha originais seguros'
        ]
      },
      {
        id: 'step3',
        title: 'Petição I-526E',
        description: 'Submeta petição de investidor imigrante',
        estimatedTime: '18-36 meses',
        difficulty: 'medium',
        substeps: [
          'Finalize documentação com advogado',
          'Pague taxas governamentais ($3,675)',
          'Submeta petição ao USCIS',
          'Aguarde processamento',
          'Responda a eventuais RFEs'
        ],
        tips: [
          'Processo pode ser longo',
          'Mantenha investimento durante processamento',
          'Acompanhe status regularmente'
        ]
      },
      {
        id: 'step4',
        title: 'Processamento Consular',
        description: 'Aplique para visto de imigrante após aprovação I-526E',
        estimatedTime: '6-12 meses',
        difficulty: 'medium',
        substeps: [
          'Receba aprovação da petição I-526E',
          'Complete formulários consulares',
          'Realize exame médico',
          'Agende entrevista no consulado',
          'Compareça à entrevista'
        ],
        tips: [
          'Processo similar a outros vistos de imigrante',
          'Família pode ser incluída',
          'Prepare-se para perguntas sobre investimento'
        ]
      },
      {
        id: 'step5',
        title: 'Entrada e I-829',
        description: 'Entre nos EUA e posteriormente remova condições',
        estimatedTime: '2+ anos',
        difficulty: 'medium',
        substeps: [
          'Entre nos EUA como residente condicional',
          'Receba green card condicional',
          'Mantenha investimento por 2 anos',
          'Submeta I-829 para remover condições',
          'Obtenha residência permanente definitiva'
        ],
        tips: [
          'Green card inicial é condicional',
          'Deve manter investimento e empregos',
          'I-829 deve ser submetido dentro de 90 dias'
        ]
      }
    ]
  },
  'o1': {
    visaId: 'o1',
    visaName: 'O1 - Habilidade Extraordinária',
    totalEstimatedTime: '3-6 meses',
    averageCost: '$1000 - $3000',
    successTips: [
      'Documente reconhecimento nacional/internacional',
      'Colete evidências de habilidade extraordinária',
      'Encontre patrocinador americano qualificado',
      'Organize portfólio impressionante',
      'Demonstre contribuições significativas na área'
    ],
    documents: [
      {
        id: 'awards_recognition',
        name: 'Prêmios e Reconhecimentos',
        description: 'Documentação de prêmios nacionais ou internacionais',
        required: true,
        category: 'professional',
        howToObtain: [
          'Colete certificados de prêmios recebidos',
          'Obtenha cartas de organizações premiadoras',
          'Documente critérios de seleção dos prêmios',
          'Inclua cobertura de mídia sobre prêmios',
          'Traduza documentos para inglês'
        ],
        tips: [
          'Prêmios devem ser de reconhecimento nacional/internacional',
          'Inclua contexto sobre importância dos prêmios',
          'Documente processo seletivo rigoroso'
        ]
      },
      {
        id: 'media_coverage',
        name: 'Cobertura de Mídia',
        description: 'Artigos e reportagens sobre seu trabalho',
        required: true,
        category: 'professional',
        howToObtain: [
          'Colete artigos de jornais e revistas',
          'Inclua reportagens de TV e rádio',
          'Documente entrevistas e perfis',
          'Organize por data e relevância',
          'Traduza conteúdo principal'
        ],
        tips: [
          'Mídia deve ser de circulação significativa',
          'Inclua tanto mídia nacional quanto internacional',
          'Destaque menções ao seu trabalho específico'
        ]
      },
      {
        id: 'publications',
        name: 'Publicações Acadêmicas',
        description: 'Artigos acadêmicos e publicações profissionais',
        required: false,
        category: 'professional',
        howToObtain: [
          'Liste publicações em periódicos relevantes',
          'Inclua fator de impacto das revistas',
          'Documente citações por outros autores',
          'Organize cronologicamente',
          'Inclua resumos em inglês'
        ],
        tips: [
          'Qualidade é mais importante que quantidade',
          'Inclua métricas de impacto',
          'Destaque colaborações internacionais'
        ]
      },
      {
        id: 'judging_participation',
        name: 'Participação em Júris',
        description: 'Evidência de participação como juiz em competições ou avaliações',
        required: false,
        category: 'professional',
        howToObtain: [
          'Colete convites para ser juiz',
          'Documente participação em painéis',
          'Inclua cartas de organizadores',
          'Liste competições e eventos',
          'Organize por importância'
        ],
        tips: [
          'Demonstra reconhecimento pelos pares',
          'Inclua eventos de prestígio nacional/internacional',
          'Documente critérios de seleção de juízes'
        ]
      },
      {
        id: 'original_contributions',
        name: 'Contribuições Originais',
        description: 'Documentação de contribuições significativas para a área',
        required: true,
        category: 'professional',
        howToObtain: [
          'Documente inovações e descobertas',
          'Inclua patentes e propriedade intelectual',
          'Colete cartas de especialistas',
          'Organize portfólio de trabalhos',
          'Demonstre impacto das contribuições'
        ],
        tips: [
          'Contribuições devem ser de importância significativa',
          'Inclua evidência de adoção por outros',
          'Documente impacto na indústria/área'
        ]
      },
      {
        id: 'sponsor_petition',
        name: 'Petição do Patrocinador',
        description: 'Documentos do patrocinador americano (empregador ou agente)',
        required: true,
        category: 'legal',
        howToObtain: [
          'Encontre patrocinador qualificado nos EUA',
          'Obtenha carta de apoio detalhada',
          'Documente capacidade financeira do patrocinador',
          'Inclua contratos de trabalho ou serviços',
          'Organize documentos corporativos'
        ],
        tips: [
          'Patrocinador pode ser empregador ou agente',
          'Deve demonstrar necessidade dos seus serviços',
          'Inclua detalhes do trabalho a ser realizado'
        ]
      }
    ],
    processSteps: [
      {
        id: 'step1',
        title: 'Avaliação de Elegibilidade',
        description: 'Determine se você atende aos critérios de habilidade extraordinária',
        estimatedTime: '2-4 semanas',
        difficulty: 'medium',
        substeps: [
          'Revise critérios do USCIS para O1',
          'Avalie suas conquistas e reconhecimentos',
          'Consulte advogado especializado',
          'Identifique pontos fortes do caso',
          'Desenvolva estratégia de petição'
        ],
        tips: [
          'Deve atender pelo menos 3 dos 8 critérios',
          'Qualidade das evidências é crucial',
          'Considere consulta com especialista'
        ]
      },
      {
        id: 'step2',
        title: 'Busca por Patrocinador',
        description: 'Encontre empregador ou agente americano para patrocinar',
        estimatedTime: '1-3 meses',
        difficulty: 'hard',
        substeps: [
          'Identifique potenciais patrocinadores',
          'Prepare apresentação de suas qualificações',
          'Negocie termos de trabalho ou serviços',
          'Obtenha compromisso formal de patrocínio',
          'Finalize contratos necessários'
        ],
        tips: [
          'Patrocinador pode ser empresa ou agente',
          'Agente pode representar múltiplos empregadores',
          'Documente relacionamento com patrocinador'
        ]
      },
      {
        id: 'step3',
        title: 'Compilação de Evidências',
        description: 'Reúna todas as evidências de habilidade extraordinária',
        estimatedTime: '2-3 meses',
        difficulty: 'hard',
        substeps: [
          'Colete documentos de prêmios e reconhecimentos',
          'Organize cobertura de mídia',
          'Compile publicações e citações',
          'Obtenha cartas de especialistas',
          'Organize portfólio impressionante'
        ],
        tips: [
          'Organize evidências por critério do USCIS',
          'Qualidade supera quantidade',
          'Inclua contexto para cada evidência'
        ]
      },
      {
        id: 'step4',
        title: 'Petição I-129',
        description: 'Patrocinador submete petição O1 ao USCIS',
        estimatedTime: '2-4 meses',
        difficulty: 'medium',
        substeps: [
          'Finalize petição com advogado',
          'Organize todas as evidências',
          'Pague taxas governamentais',
          'Submeta petição ao USCIS',
          'Aguarde decisão ou RFE'
        ],
        tips: [
          'Premium Processing disponível (15 dias)',
          'Petição deve ser bem organizada',
          'Inclua carta de apoio detalhada'
        ]
      },
      {
        id: 'step5',
        title: 'Solicitação de Visto',
        description: 'Aplique para visto O1 no consulado após aprovação',
        estimatedTime: '2-4 semanas',
        difficulty: 'medium',
        substeps: [
          'Receba aprovação da petição I-797',
          'Preencha formulário DS-160',
          'Pague taxa consular ($190)',
          'Agende entrevista no consulado',
          'Compareça à entrevista com documentos'
        ],
        tips: [
          'Leve cópia da aprovação I-797',
          'Prepare-se para perguntas sobre seu trabalho',
          'Demonstre conhecimento de sua área'
        ]
      }
    ]
  }
};
