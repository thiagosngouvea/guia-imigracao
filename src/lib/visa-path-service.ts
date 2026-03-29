import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// ============================================================
// Types (mesmos do App)
// ============================================================

export interface VisaPathSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface VisaPathStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  completed: boolean;
  subtasks: VisaPathSubtask[];
  resources: string[];
}

export interface VisaPathData {
  userId: string;
  visaType: string;
  country: string;
  selectedAt: Date;
  progress: {
    currentStep: number;
    completedSteps: string[];
    percentComplete: number;
  };
  steps: VisaPathStep[];
}

// ============================================================
// Templates de steps para cada tipo de visto
// (portado do visaPathService.ts do App React Native)
// ============================================================

const US_VISA_PATHS: { [key: string]: Omit<VisaPathStep, 'completed'>[] } = {
  'H-1B': [
    {
      id: 'step1', title: 'Encontrar Empregador Patrocinador',
      description: 'O visto H-1B requer que você tenha uma oferta de emprego de um empregador americano disposto a patrocinar seu visto.',
      estimatedTime: '1-3 meses',
      subtasks: [
        { id: 'subtask1', title: 'Atualizar currículo no formato americano', completed: false },
        { id: 'subtask2', title: 'Criar perfil no LinkedIn otimizado', completed: false },
        { id: 'subtask3', title: 'Candidatar-se a vagas com patrocínio H-1B', completed: false },
        { id: 'subtask4', title: 'Preparar-se para entrevistas técnicas', completed: false },
      ],
      resources: ['Sites de emprego que filtram por H-1B sponsorship (LinkedIn, Indeed, Glassdoor)', 'Lista de empresas que patrocinam H-1B', 'Guia de currículo americano'],
    },
    {
      id: 'step2', title: 'Verificar Qualificações e Documentação Acadêmica',
      description: 'Você precisa ter pelo menos um diploma de bacharel ou equivalente em uma área relacionada ao cargo.',
      estimatedTime: '2-4 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Solicitar histórico escolar autenticado', completed: false },
        { id: 'subtask2', title: 'Fazer avaliação de credenciais (credential evaluation)', completed: false },
        { id: 'subtask3', title: 'Reunir certificados profissionais', completed: false },
        { id: 'subtask4', title: 'Preparar cartas de recomendação de empregadores anteriores', completed: false },
      ],
      resources: ['Empresas de avaliação de credenciais (WES, ECE, NACES)', 'Lista de documentos necessários', 'Modelo de carta de recomendação'],
    },
    {
      id: 'step3', title: 'Empregador Submete LCA (Labor Condition Application)',
      description: 'Seu empregador deve submeter o LCA ao Departamento de Trabalho dos EUA.',
      estimatedTime: '1-2 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Confirmar que empregador iniciou processo de LCA', completed: false },
        { id: 'subtask2', title: 'Fornecer informações pessoais ao empregador', completed: false },
        { id: 'subtask3', title: 'Aguardar aprovação do LCA', completed: false },
      ],
      resources: ['Informações sobre o processo LCA', 'Checklist de informações necessárias', 'Site do Departamento de Trabalho dos EUA'],
    },
    {
      id: 'step4', title: 'Empregador Submete Petição I-129 ao USCIS',
      description: 'Após aprovação do LCA, o empregador deve submeter a petição Form I-129 ao USCIS.',
      estimatedTime: 'Processo regular: 3-6 meses | Premium Processing: 15 dias',
      subtasks: [
        { id: 'subtask1', title: 'Revisar draft da petição preparada pelo advogado', completed: false },
        { id: 'subtask2', title: 'Fornecer documentos adicionais se solicitado', completed: false },
        { id: 'subtask3', title: 'Acompanhar status da petição no site do USCIS', completed: false },
        { id: 'subtask4', title: 'Considerar Premium Processing se necessário', completed: false },
      ],
      resources: ['Guia do Form I-129', 'Como verificar status no USCIS', 'Informações sobre Premium Processing'],
    },
    {
      id: 'step5', title: 'Aguardar Aprovação e Receber I-797',
      description: 'Se aprovado, você receberá o Notice of Action (Form I-797).',
      estimatedTime: '1-2 semanas após decisão',
      subtasks: [
        { id: 'subtask1', title: 'Receber I-797 do empregador', completed: false },
        { id: 'subtask2', title: 'Verificar todas as informações no I-797', completed: false },
        { id: 'subtask3', title: 'Guardar cópias do I-797 em local seguro', completed: false },
      ],
      resources: ['Exemplo de Form I-797', 'O que verificar no I-797'],
    },
    {
      id: 'step6', title: 'Agendar Entrevista Consular',
      description: 'Se você está fora dos EUA, precisa agendar entrevista no consulado americano.',
      estimatedTime: '2-8 semanas (varia por localização)',
      subtasks: [
        { id: 'subtask1', title: 'Preencher o formulário DS-160 online', completed: false },
        { id: 'subtask2', title: 'Pagar a taxa do visto (MRV fee)', completed: false },
        { id: 'subtask3', title: 'Agendar entrevista no consulado', completed: false },
        { id: 'subtask4', title: 'Preparar documentos para entrevista', completed: false },
      ],
      resources: ['Link para DS-160', 'Site de agendamento consular', 'Lista de documentos para entrevista', 'Dicas para entrevista consular'],
    },
    {
      id: 'step7', title: 'Participar da Entrevista Consular',
      description: 'Compareça à entrevista com toda documentação necessária.',
      estimatedTime: '1 dia',
      subtasks: [
        { id: 'subtask1', title: 'Chegar 15 minutos antes do horário marcado', completed: false },
        { id: 'subtask2', title: 'Apresentar todos os documentos solicitados', completed: false },
        { id: 'subtask3', title: 'Responder perguntas do oficial consular com confiança', completed: false },
        { id: 'subtask4', title: 'Deixar passaporte para carimbo do visto', completed: false },
      ],
      resources: ['Perguntas comuns em entrevistas H-1B', 'O que levar no dia da entrevista'],
    },
    {
      id: 'step8', title: 'Receber Passaporte com Visto',
      description: 'Após aprovação, você receberá seu passaporte com o carimbo do visto H-1B.',
      estimatedTime: '1-2 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Acompanhar status de devolução do passaporte', completed: false },
        { id: 'subtask2', title: 'Receber passaporte via correio ou retirada', completed: false },
        { id: 'subtask3', title: 'Verificar informações no visto', completed: false },
        { id: 'subtask4', title: 'Fazer cópias do visto', completed: false },
      ],
      resources: ['Como rastrear passaporte', 'O que fazer se houver erro no visto'],
    },
    {
      id: 'step9', title: 'Preparar Mudança para os EUA',
      description: 'Com o visto aprovado, prepare sua mudança para os Estados Unidos.',
      estimatedTime: '2-4 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Comprar passagem aérea', completed: false },
        { id: 'subtask2', title: 'Procurar moradia nos EUA', completed: false },
        { id: 'subtask3', title: 'Providenciar documentos pessoais (certidões, diplomas)', completed: false },
        { id: 'subtask4', title: 'Preparar documentos para apresentar na imigração', completed: false },
      ],
      resources: ['Checklist de mudança internacional', 'Sites de busca de apartamentos nos EUA'],
    },
    {
      id: 'step10', title: 'Entrar nos EUA e Começar a Trabalhar',
      description: 'Você pode entrar nos EUA até 10 dias antes da data de início no I-797.',
      estimatedTime: 'Conforme data de início',
      subtasks: [
        { id: 'subtask1', title: 'Ter todos os documentos em mãos na chegada', completed: false },
        { id: 'subtask2', title: 'Passar pela imigração no aeroporto', completed: false },
        { id: 'subtask3', title: 'Solicitar SSN (Social Security Number)', completed: false },
        { id: 'subtask4', title: 'Iniciar trabalho na data especificada', completed: false },
      ],
      resources: ['Processo de entrada nos EUA com H-1B', 'Como solicitar SSN'],
    },
  ],
  'O-1': [
    {
      id: 'step1', title: 'Documentar Habilidades Extraordinárias',
      description: 'Compile evidências que demonstrem seu reconhecimento nacional ou internacional.',
      estimatedTime: '2-4 meses',
      subtasks: [
        { id: 'subtask1', title: 'Reunir prêmios e reconhecimentos', completed: false },
        { id: 'subtask2', title: 'Coletar publicações sobre seu trabalho', completed: false },
        { id: 'subtask3', title: 'Documentar membros em associações', completed: false },
        { id: 'subtask4', title: 'Reunir cartas de recomendação de experts', completed: false },
      ],
      resources: ['Critérios para O-1', 'Exemplos de evidências', 'Como obter cartas de recomendação'],
    },
    {
      id: 'step2', title: 'Encontrar Peticionário nos EUA',
      description: 'Você precisa de um agente ou empregador americano para peticionar em seu nome.',
      estimatedTime: '1-3 meses',
      subtasks: [
        { id: 'subtask1', title: 'Identificar potenciais agentes ou empregadores', completed: false },
        { id: 'subtask2', title: 'Negociar contrato ou acordo', completed: false },
        { id: 'subtask3', title: 'Formalizar relacionamento profissional', completed: false },
      ],
      resources: ['Como funcionam os agentes O-1', 'Tipos de peticionários', 'Modelo de contrato'],
    },
    {
      id: 'step3', title: 'Preparar e Submeter Petição I-129',
      description: 'O peticionário submete o Form I-129 ao USCIS com todas as evidências.',
      estimatedTime: 'Processo regular: 3-4 meses | Premium: 15 dias',
      subtasks: [
        { id: 'subtask1', title: 'Contratar advogado de imigração', completed: false },
        { id: 'subtask2', title: 'Revisar draft da petição', completed: false },
        { id: 'subtask3', title: 'Submeter petição ao USCIS', completed: false },
        { id: 'subtask4', title: 'Acompanhar status online', completed: false },
      ],
      resources: ['Guia do Form I-129', 'Como escolher advogado de imigração', 'Portal do USCIS'],
    },
    {
      id: 'step4', title: 'Aguardar Aprovação',
      description: 'USCIS analisará a petição e emitirá decisão.',
      estimatedTime: 'Conforme processing time',
      subtasks: [
        { id: 'subtask1', title: 'Responder a qualquer RFE (Request for Evidence)', completed: false },
        { id: 'subtask2', title: 'Receber I-797 Notice of Approval', completed: false },
        { id: 'subtask3', title: 'Verificar datas de validade', completed: false },
      ],
      resources: ['Como responder RFE', 'Interpretando o I-797'],
    },
    {
      id: 'step5', title: 'Solicitar Visto no Consulado',
      description: 'Se estiver fora dos EUA, agende entrevista consular.',
      estimatedTime: '2-8 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Preencher DS-160', completed: false },
        { id: 'subtask2', title: 'Agendar entrevista', completed: false },
        { id: 'subtask3', title: 'Preparar documentação', completed: false },
        { id: 'subtask4', title: 'Participar da entrevista', completed: false },
      ],
      resources: ['DS-160 online', 'Agendamento consular', 'Documentos necessários'],
    },
  ],
  'EB-2 NIW': [
    {
      id: 'step1', title: 'Avaliar Qualificações',
      description: 'Verifique se você atende aos requisitos de grau avançado ou habilidade excepcional.',
      estimatedTime: '2-4 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Confirmar mestrado ou equivalente', completed: false },
        { id: 'subtask2', title: 'Avaliar experiência profissional', completed: false },
        { id: 'subtask3', title: 'Verificar se trabalho beneficia interesse nacional', completed: false },
      ],
      resources: ['Requisitos EB-2', 'Teste de interesse nacional', 'Precedentes Matter of Dhanasar'],
    },
    {
      id: 'step2', title: 'Reunir Documentação',
      description: 'Compile evidências robustas do seu trabalho e impacto.',
      estimatedTime: '3-6 meses',
      subtasks: [
        { id: 'subtask1', title: 'Obter cartas de recomendação', completed: false },
        { id: 'subtask2', title: 'Reunir publicações e citações', completed: false },
        { id: 'subtask3', title: 'Documentar prêmios e reconhecimentos', completed: false },
        { id: 'subtask4', title: 'Demonstrar impacto nacional', completed: false },
      ],
      resources: ['Tipos de evidências EB-2 NIW', 'Como conseguir cartas fortes'],
    },
    {
      id: 'step3', title: 'Contratar Advogado de Imigração',
      description: 'Um advogado experiente em NIW é altamente recomendado.',
      estimatedTime: '1-2 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Pesquisar advogados especializados em NIW', completed: false },
        { id: 'subtask2', title: 'Agendar consultas', completed: false },
        { id: 'subtask3', title: 'Contratar advogado', completed: false },
      ],
      resources: ['Como escolher advogado NIW', 'Perguntas para fazer ao advogado'],
    },
    {
      id: 'step4', title: 'Submeter Petição I-140',
      description: 'Você mesmo pode peticionar (self-petition) o EB-2 NIW.',
      estimatedTime: 'Regular: 12-18 meses | Premium: 45 dias',
      subtasks: [
        { id: 'subtask1', title: 'Revisar draft da petição', completed: false },
        { id: 'subtask2', title: 'Pagar taxa de filing', completed: false },
        { id: 'subtask3', title: 'Submeter I-140 ao USCIS', completed: false },
        { id: 'subtask4', title: 'Considerar Premium Processing', completed: false },
      ],
      resources: ['Form I-140', 'Taxa e Premium Processing'],
    },
    {
      id: 'step5', title: 'Aguardar Aprovação do I-140',
      description: 'USCIS analisará se você qualifica para EB-2 NIW.',
      estimatedTime: 'Conforme processing time',
      subtasks: [
        { id: 'subtask1', title: 'Monitorar status online', completed: false },
        { id: 'subtask2', title: 'Responder a RFEs se houver', completed: false },
        { id: 'subtask3', title: 'Receber I-797 de aprovação', completed: false },
      ],
      resources: ['Portal USCIS', 'Como responder RFE NIW'],
    },
    {
      id: 'step6', title: 'Ajustar Status ou Consular Processing',
      description: 'Solicite o green card via ajuste de status (se nos EUA) ou processing consular.',
      estimatedTime: '12-24 meses (varia por país)',
      subtasks: [
        { id: 'subtask1', title: 'Verificar priority date', completed: false },
        { id: 'subtask2', title: 'Aguardar visa bulletin', completed: false },
        { id: 'subtask3', title: 'Submeter I-485 ou DS-260', completed: false },
        { id: 'subtask4', title: 'Fazer exames médicos', completed: false },
      ],
      resources: ['Visa Bulletin', 'Priority dates', 'Form I-485 vs DS-260'],
    },
  ],
  'EB-5': [
    {
      id: 'step1', title: 'Verificar Capacidade Financeira',
      description: 'Confirme que possui capital de investimento mínimo (US$ 800.000 ou US$ 1.050.000).',
      estimatedTime: '1-2 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Avaliar patrimônio líquido', completed: false },
        { id: 'subtask2', title: 'Consultar consultor financeiro', completed: false },
        { id: 'subtask3', title: 'Verificar origem lícita dos fundos', completed: false },
      ],
      resources: ['Requisitos de investimento EB-5', 'TEA vs não-TEA'],
    },
    {
      id: 'step2', title: 'Escolher Projeto Regional Center',
      description: 'Pesquise e selecione um Regional Center aprovado pelo USCIS.',
      estimatedTime: '2-4 meses',
      subtasks: [
        { id: 'subtask1', title: 'Pesquisar Regional Centers', completed: false },
        { id: 'subtask2', title: 'Avaliar projetos e histórico', completed: false },
        { id: 'subtask3', title: 'Realizar due diligence', completed: false },
        { id: 'subtask4', title: 'Assinar documentos de investimento', completed: false },
      ],
      resources: ['Lista de Regional Centers', 'Como avaliar projetos EB-5'],
    },
    {
      id: 'step3', title: 'Documentar Fonte de Fundos',
      description: 'Reúna documentação comprovando origem legal do capital.',
      estimatedTime: '2-6 meses',
      subtasks: [
        { id: 'subtask1', title: 'Obter declarações de impostos', completed: false },
        { id: 'subtask2', title: 'Documentar vendas de propriedades/negócios', completed: false },
        { id: 'subtask3', title: 'Apresentar histórico bancário', completed: false },
        { id: 'subtask4', title: 'Traduzir documentos estrangeiros', completed: false },
      ],
      resources: ['Documentação fonte de fundos', 'Tradução certificada'],
    },
    {
      id: 'step4', title: 'Submeter Petição I-526E',
      description: 'Petição para classificação de imigrante investidor.',
      estimatedTime: '29-61 meses (pode variar)',
      subtasks: [
        { id: 'subtask1', title: 'Contratar advogado EB-5', completed: false },
        { id: 'subtask2', title: 'Preparar I-526E', completed: false },
        { id: 'subtask3', title: 'Submeter ao USCIS', completed: false },
        { id: 'subtask4', title: 'Aguardar aprovação', completed: false },
      ],
      resources: ['Form I-526E', 'Processing times'],
    },
    {
      id: 'step5', title: 'Ajustar Status ou Visto de Imigrante',
      description: 'Após aprovação do I-526E, solicite green card condicional.',
      estimatedTime: '6-24 meses',
      subtasks: [
        { id: 'subtask1', title: 'Submeter DS-260 (consular) ou I-485 (ajuste)', completed: false },
        { id: 'subtask2', title: 'Fazer exame médico', completed: false },
        { id: 'subtask3', title: 'Participar de entrevista', completed: false },
        { id: 'subtask4', title: 'Receber green card condicional', completed: false },
      ],
      resources: ['DS-260 vs I-485', 'Entrevista EB-5'],
    },
    {
      id: 'step6', title: 'Remover Condições (I-829)',
      description: 'Após 2 anos, petição para remover condições do green card.',
      estimatedTime: 'Após 21 meses de residência',
      subtasks: [
        { id: 'subtask1', title: 'Documentar criação de empregos', completed: false },
        { id: 'subtask2', title: 'Preparar I-829', completed: false },
        { id: 'subtask3', title: 'Submeter 90 dias antes de completar 2 anos', completed: false },
        { id: 'subtask4', title: 'Receber green card permanente', completed: false },
      ],
      resources: ['Form I-829', 'Requisitos de criação de empregos'],
    },
  ],
  'F-1': [
    {
      id: 'step1', title: 'Escolher Instituição e Programa',
      description: 'Pesquise e escolha uma universidade ou college certificada pelo SEVP.',
      estimatedTime: '1-3 meses',
      subtasks: [
        { id: 'subtask1', title: 'Pesquisar instituições certificadas SEVP', completed: false },
        { id: 'subtask2', title: 'Comparar programas e custos', completed: false },
        { id: 'subtask3', title: 'Verificar requisitos de admissão', completed: false },
      ],
      resources: ['Lista de instituições certificadas SEVP', 'Rankings universitários'],
    },
    {
      id: 'step2', title: 'Aplicar para a Instituição',
      description: 'Submeta sua aplicação com toda documentação necessária.',
      estimatedTime: '4-8 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Preencher application forms', completed: false },
        { id: 'subtask2', title: 'Fazer provas exigidas (TOEFL, GRE, SAT)', completed: false },
        { id: 'subtask3', title: 'Enviar históricos acadêmicos traduzidos', completed: false },
        { id: 'subtask4', title: 'Pagar application fee', completed: false },
      ],
      resources: ['Guia de application', 'Sites de provas (TOEFL, GRE)'],
    },
    {
      id: 'step3', title: 'Receber I-20 da Instituição',
      description: 'Após aceite, a instituição emitirá o Form I-20, necessário para o visto.',
      estimatedTime: '2-4 semanas após aceite',
      subtasks: [
        { id: 'subtask1', title: 'Confirmar aceite na instituição', completed: false },
        { id: 'subtask2', title: 'Pagar taxa SEVIS (I-901)', completed: false },
        { id: 'subtask3', title: 'Receber I-20 por correio', completed: false },
        { id: 'subtask4', title: 'Verificar informações no I-20', completed: false },
      ],
      resources: ['Como pagar taxa SEVIS', 'Interpretando o I-20'],
    },
    {
      id: 'step4', title: 'Agendar e Fazer Entrevista Consular',
      description: 'Agende e compareça à entrevista no consulado americano.',
      estimatedTime: '2-8 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Preencher DS-160', completed: false },
        { id: 'subtask2', title: 'Pagar taxa do visto', completed: false },
        { id: 'subtask3', title: 'Agendar entrevista', completed: false },
        { id: 'subtask4', title: 'Participar da entrevista', completed: false },
      ],
      resources: ['DS-160 online', 'Agendamento consular', 'Perguntas comuns F-1'],
    },
    {
      id: 'step5', title: 'Preparar Mudança e Viajar',
      description: 'Com visto aprovado, prepare sua mudança para os EUA.',
      estimatedTime: '2-4 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Comprar passagem', completed: false },
        { id: 'subtask2', title: 'Procurar moradia/housing', completed: false },
        { id: 'subtask3', title: 'Preparar documentação', completed: false },
        { id: 'subtask4', title: 'Entrar nos EUA até 30 dias antes do início', completed: false },
      ],
      resources: ['Housing para estudantes', 'Checklist de mudança', 'Regras de entrada F-1'],
    },
  ],
  'L-1': [
    {
      id: 'step1', title: 'Verificar Elegibilidade',
      description: 'Confirme que você trabalhou pelo menos 1 ano na empresa fora dos EUA nos últimos 3 anos.',
      estimatedTime: '1-2 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Verificar tempo de emprego (mínimo 1 ano)', completed: false },
        { id: 'subtask2', title: 'Confirmar posição gerencial/especializada', completed: false },
        { id: 'subtask3', title: 'Verificar relacionamento entre empresas', completed: false },
      ],
      resources: ['Requisitos L-1A vs L-1B', 'Definições de cargo gerencial'],
    },
    {
      id: 'step2', title: 'Empresa nos EUA Prepara Petição',
      description: 'A empresa americana (matriz, filial ou subsidiária) deve preparar a petição.',
      estimatedTime: '2-4 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Reunir documentos da empresa', completed: false },
        { id: 'subtask2', title: 'Provar relacionamento corporativo', completed: false },
        { id: 'subtask3', title: 'Documentar sua posição e responsabilidades', completed: false },
        { id: 'subtask4', title: 'Contratar advogado de imigração', completed: false },
      ],
      resources: ['Documentos necessários da empresa', 'Organogramas corporativos'],
    },
    {
      id: 'step3', title: 'Submeter Form I-129',
      description: 'A empresa americana submete o Form I-129 ao USCIS.',
      estimatedTime: 'Regular: 3-6 meses | Premium: 15 dias',
      subtasks: [
        { id: 'subtask1', title: 'Revisar petição completa', completed: false },
        { id: 'subtask2', title: 'Pagar taxa de filing', completed: false },
        { id: 'subtask3', title: 'Submeter ao USCIS', completed: false },
        { id: 'subtask4', title: 'Considerar Premium Processing', completed: false },
      ],
      resources: ['Form I-129', 'Premium Processing L-1'],
    },
    {
      id: 'step4', title: 'Aguardar Aprovação',
      description: 'USCIS analisa a petição e emite decisão.',
      estimatedTime: 'Conforme processing time',
      subtasks: [
        { id: 'subtask1', title: 'Acompanhar status online', completed: false },
        { id: 'subtask2', title: 'Responder a RFEs se necessário', completed: false },
        { id: 'subtask3', title: 'Receber I-797 Notice of Approval', completed: false },
      ],
      resources: ['Portal do USCIS', 'Como responder RFE'],
    },
    {
      id: 'step5', title: 'Solicitar Visto no Consulado',
      description: 'Se estiver fora dos EUA, agende entrevista consular para carimbar o visto.',
      estimatedTime: '2-8 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Preencher DS-160', completed: false },
        { id: 'subtask2', title: 'Pagar taxa do visto', completed: false },
        { id: 'subtask3', title: 'Agendar entrevista', completed: false },
        { id: 'subtask4', title: 'Participar da entrevista', completed: false },
      ],
      resources: ['DS-160 online', 'Agendamento consular', 'Documentos para entrevista L-1'],
    },
    {
      id: 'step6', title: 'Preparar Mudança',
      description: 'Com visto aprovado, prepare sua relocação para os EUA.',
      estimatedTime: '2-4 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Coordenar relocação com empresa', completed: false },
        { id: 'subtask2', title: 'Procurar moradia', completed: false },
        { id: 'subtask3', title: 'Preparar documentação pessoal', completed: false },
        { id: 'subtask4', title: 'Entrar nos EUA', completed: false },
      ],
      resources: ['Pacotes de relocação', 'Moradia temporária'],
    },
  ],
  'E-2': [
    {
      id: 'step1', title: 'Verificar Elegibilidade de País',
      description: 'Confirme que seu país tem tratado E-2 com os EUA.',
      estimatedTime: '1 semana',
      subtasks: [
        { id: 'subtask1', title: 'Verificar lista de países com tratado E-2', completed: false },
        { id: 'subtask2', title: 'Confirmar sua nacionalidade', completed: false },
      ],
      resources: ['Lista de países com tratado E-2'],
    },
    {
      id: 'step2', title: 'Investimento Substancial',
      description: 'Prepare investimento substancial no negócio americano (mínimo US$ 100.000 recomendado).',
      estimatedTime: '1-3 meses',
      subtasks: [
        { id: 'subtask1', title: 'Definir valor de investimento', completed: false },
        { id: 'subtask2', title: 'Preparar capital', completed: false },
        { id: 'subtask3', title: 'Documentar origem lícita dos fundos', completed: false },
      ],
      resources: ['Requisitos de investimento E-2', 'Documentação de fundos'],
    },
    {
      id: 'step3', title: 'Estabelecer ou Adquirir Negócio',
      description: 'Crie um novo negócio ou compre empresa existente nos EUA.',
      estimatedTime: '2-6 meses',
      subtasks: [
        { id: 'subtask1', title: 'Desenvolver business plan', completed: false },
        { id: 'subtask2', title: 'Registrar empresa nos EUA', completed: false },
        { id: 'subtask3', title: 'Realizar investimento', completed: false },
        { id: 'subtask4', title: 'Começar operações', completed: false },
      ],
      resources: ['Como escrever business plan E-2', 'Registro de empresas nos EUA'],
    },
    {
      id: 'step4', title: 'Preparar Aplicação E-2',
      description: 'Compile documentação completa para aplicação do visto.',
      estimatedTime: '4-8 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Contratar advogado especializado em E-2', completed: false },
        { id: 'subtask2', title: 'Reunir documentos corporativos', completed: false },
        { id: 'subtask3', title: 'Preparar evidências de investimento', completed: false },
        { id: 'subtask4', title: 'Demonstrar criação de empregos', completed: false },
      ],
      resources: ['Checklist de documentos E-2'],
    },
    {
      id: 'step5', title: 'Solicitar Visto no Consulado',
      description: 'Agende e compareça à entrevista no consulado americano.',
      estimatedTime: '2-8 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Preencher DS-160', completed: false },
        { id: 'subtask2', title: 'Pagar taxa do visto', completed: false },
        { id: 'subtask3', title: 'Agendar entrevista', completed: false },
        { id: 'subtask4', title: 'Participar da entrevista com toda documentação', completed: false },
      ],
      resources: ['DS-160', 'Entrevista E-2 - o que esperar'],
    },
  ],
  'EB-1': [
    {
      id: 'step1', title: 'Avaliar Categoria EB-1',
      description: 'Determine se você se qualifica para EB-1A, EB-1B ou EB-1C.',
      estimatedTime: '2-4 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Avaliar EB-1A (habilidade extraordinária)', completed: false },
        { id: 'subtask2', title: 'Avaliar EB-1B (professor/pesquisador)', completed: false },
        { id: 'subtask3', title: 'Avaliar EB-1C (executivo/gerente multinacional)', completed: false },
      ],
      resources: ['Diferenças entre EB-1A, EB-1B e EB-1C'],
    },
    {
      id: 'step2', title: 'Documentar Conquistas',
      description: 'Compile evidências robustas de suas realizações extraordinárias.',
      estimatedTime: '3-6 meses',
      subtasks: [
        { id: 'subtask1', title: 'Reunir prêmios e reconhecimentos', completed: false },
        { id: 'subtask2', title: 'Coletar publicações e citações', completed: false },
        { id: 'subtask3', title: 'Obter cartas de recomendação', completed: false },
        { id: 'subtask4', title: 'Documentar mídia sobre seu trabalho', completed: false },
      ],
      resources: ['Critérios EB-1', 'Tipos de evidências'],
    },
    {
      id: 'step3', title: 'Contratar Advogado Especializado',
      description: 'EB-1 é complexo - advogado experiente é altamente recomendado.',
      estimatedTime: '1-2 semanas',
      subtasks: [
        { id: 'subtask1', title: 'Pesquisar advogados com histórico EB-1', completed: false },
        { id: 'subtask2', title: 'Agendar consultas', completed: false },
        { id: 'subtask3', title: 'Contratar advogado', completed: false },
      ],
      resources: ['Como escolher advogado EB-1'],
    },
    {
      id: 'step4', title: 'Submeter Petição I-140',
      description: 'Petição para classificação de imigrante (green card).',
      estimatedTime: 'Regular: 6-12 meses | Premium: 15-45 dias',
      subtasks: [
        { id: 'subtask1', title: 'Revisar draft completo da petição', completed: false },
        { id: 'subtask2', title: 'Pagar taxa de filing', completed: false },
        { id: 'subtask3', title: 'Submeter I-140', completed: false },
        { id: 'subtask4', title: 'Considerar Premium Processing', completed: false },
      ],
      resources: ['Form I-140', 'Premium Processing'],
    },
    {
      id: 'step5', title: 'Ajustar Status ou Consular Processing',
      description: 'Após aprovação do I-140, solicite o green card.',
      estimatedTime: '6-18 meses',
      subtasks: [
        { id: 'subtask1', title: 'Verificar se priority date está current', completed: false },
        { id: 'subtask2', title: 'Submeter I-485 ou DS-260', completed: false },
        { id: 'subtask3', title: 'Fazer exame médico', completed: false },
        { id: 'subtask4', title: 'Participar de entrevista', completed: false },
      ],
      resources: ['Visa Bulletin', 'I-485 vs DS-260'],
    },
  ],
};

// ============================================================
// Service functions
// ============================================================

/** Busca a trilha de visto do usuário */
export async function getVisaPath(userId: string): Promise<VisaPathData | null> {
  try {
    const snap = await getDoc(doc(db, 'visaPaths', userId));
    if (snap.exists()) return snap.data() as VisaPathData;
    return null;
  } catch (err) {
    console.error('Error getting visa path:', err);
    return null;
  }
}

/** Cria uma trilha de visto a partir do template */
export async function createVisaPath(userId: string, visaType: string): Promise<void> {
  const template = getVisaPathTemplate(visaType);
  if (template.length === 0) throw new Error('Template de visto não encontrado');

  const pathData: VisaPathData = {
    userId,
    visaType,
    country: 'Estados Unidos',
    selectedAt: new Date(),
    progress: { currentStep: 0, completedSteps: [], percentComplete: 0 },
    steps: template.map(step => ({
      ...step,
      completed: false,
      subtasks: step.subtasks.map(sub => ({ ...sub, completed: false })),
    })),
  };

  await setDoc(doc(db, 'visaPaths', userId), pathData, { merge: false });
}

/** Retorna os steps do template de um tipo de visto (para preview) */
export function getVisaPathSteps(visaType: string): Omit<VisaPathStep, 'completed'>[] {
  return getVisaPathTemplate(visaType);
}

/** Atualiza conclusão de uma etapa e recalcula progresso */
export async function updateStepCompletion(
  userId: string,
  stepId: string,
  completed: boolean
): Promise<void> {
  const snap = await getDoc(doc(db, 'visaPaths', userId));
  if (!snap.exists()) return;

  const pathData = snap.data() as VisaPathData;
  const updatedSteps = pathData.steps.map(step =>
    step.id === stepId ? { ...step, completed } : step
  );

  const completedSteps = updatedSteps.filter(s => s.completed).map(s => s.id);
  const percentComplete = Math.round((completedSteps.length / updatedSteps.length) * 100);

  await updateDoc(doc(db, 'visaPaths', userId), {
    steps: updatedSteps,
    'progress.completedSteps': completedSteps,
    'progress.percentComplete': percentComplete,
    'progress.currentStep': completedSteps.length,
  });
}

/** Atualiza conclusão de uma subtarefa */
export async function updateSubtaskCompletion(
  userId: string,
  stepId: string,
  subtaskId: string,
  completed: boolean
): Promise<void> {
  const snap = await getDoc(doc(db, 'visaPaths', userId));
  if (!snap.exists()) return;

  const pathData = snap.data() as VisaPathData;
  const updatedSteps = pathData.steps.map(step => {
    if (step.id === stepId) {
      return {
        ...step,
        subtasks: step.subtasks.map(sub =>
          sub.id === subtaskId ? { ...sub, completed } : sub
        ),
      };
    }
    return step;
  });

  await updateDoc(doc(db, 'visaPaths', userId), { steps: updatedSteps });
}

// ============================================================
// Template helper
// ============================================================

function getVisaPathTemplate(visaType: string): Omit<VisaPathStep, 'completed'>[] {
  const normalized = visaType.toUpperCase().trim();

  for (const key in US_VISA_PATHS) {
    if (normalized.includes(key.toUpperCase())) return US_VISA_PATHS[key];
  }

  if (normalized.includes('NIW') || normalized.includes('EB2')) return US_VISA_PATHS['EB-2 NIW'];
  if (normalized.includes('EB5')) return US_VISA_PATHS['EB-5'];
  if (normalized.includes('EB1')) return US_VISA_PATHS['EB-1'];
  if (normalized.includes('STUDENT') || normalized.includes('ESTUDANTE')) return US_VISA_PATHS['F-1'];
  if (normalized.includes('TRANSFER') || normalized.includes('INTRACOMPANY')) return US_VISA_PATHS['L-1'];

  // Default: H-1B
  return US_VISA_PATHS['H-1B'];
}
