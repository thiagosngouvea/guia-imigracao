export type Goal = 'work' | 'study' | 'family' | 'business';
export type CountryId = 'eua' | 'canada' | 'portugal' | 'alemanha' | 'espanha' | 'italia' | 'paraguai';
export interface GuideSource { label: string; url: string }
export interface Route { id: string; title: string; goal: Goal; summary: string; requirements: string[]; source: GuideSource }
export interface Country { id: CountryId; name: string; flag: string; language: string; introduction: string; advantages: string[]; challenges: string[]; cost: string; timing: string; reviewedAt: string; routes: Route[] }
export interface DiagnosticProfile { goal: Goal; education: 'school' | 'degree' | 'postgraduate'; occupation: string; languages: string[]; savings: 'limited' | 'moderate' | 'comfortable'; familyCountry: CountryId | ''; timeframe: 'soon' | 'year' | 'flexible' }
export interface Suggestion { countryId: CountryId; routeId: string; reasons: string[]; verify: string[]; priority: number }
export interface PlanStep { id: string; title: string; description: string; completed: boolean }
export interface ImmigrationPlan { id: string; countryId: CountryId; routeId: string; profile: DiagnosticProfile; steps: PlanStep[]; createdAt?: string; updatedAt?: string }

const source = (label: string, url: string): GuideSource => ({ label, url });
export const COUNTRIES: Country[] = [
  { id: 'eua', name: 'Estados Unidos', flag: '🇺🇸', language: 'Inglês', introduction: 'Caminhos distintos para trabalho, estudo e família; cada categoria tem regras próprias.', advantages: ['Diversidade de setores e instituições', 'Ferramentas específicas já disponíveis no site'], challenges: ['Categorias e critérios complexos', 'Custos e espera variam muito por processo'], cost: 'Taxas oficiais, documentação e mudança: consultar a categoria escolhida.', timing: 'Varia por categoria, consulado e disponibilidade.', reviewedAt: '2026-10-03', routes: [
    { id: 'us-work', title: 'Trabalho qualificado', goal: 'work', summary: 'Investigue as categorias de trabalho temporário ou permanente e a necessidade de empregador.', requirements: ['Categoria compatível com a atividade', 'Qualificações e eventual petição de empregador'], source: source('Department of State — trabalho nos EUA', 'https://travel.state.gov/content/travel/en/us-visas/employment.html') },
    { id: 'us-study', title: 'Estudo', goal: 'study', summary: 'Comece por uma instituição habilitada e confira o visto apropriado.', requirements: ['Admissão em instituição elegível', 'Recursos para estudo e manutenção'], source: source('Department of State — vistos de estudante', 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html') },
    { id: 'us-family', title: 'Família', goal: 'family', summary: 'O vínculo e a condição migratória do familiar definem a categoria.', requirements: ['Vínculo familiar elegível', 'Documentação e petição aplicável'], source: source('USCIS — imigração por família', 'https://www.uscis.gov/family') },
  ] },
  { id: 'canada', name: 'Canadá', flag: '🇨🇦', language: 'Inglês e francês', introduction: 'Programas federais e provinciais têm critérios próprios para trabalho e residência.', advantages: ['Programas oficiais com critérios publicados', 'Opções de trabalho e estudo'], challenges: ['Idiomas e comprovação financeira', 'Seleção e regras podem mudar'], cost: 'Taxas, exames, avaliação de formação e instalação: confirmar no IRCC.', timing: 'Depende do programa e da data de envio.', reviewedAt: '2026-10-03', routes: [
    { id: 'ca-work', title: 'Imigração qualificada', goal: 'work', summary: 'Explore os programas geridos pelo Express Entry e opções provinciais.', requirements: ['Experiência elegível', 'Teste de idioma e, conforme o programa, avaliação acadêmica e fundos'], source: source('IRCC — Express Entry', 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html') },
    { id: 'ca-study', title: 'Estudo', goal: 'study', summary: 'Verifique instituição, permissão de estudo e condições específicas.', requirements: ['Aceite em instituição elegível', 'Fundos e documentos exigidos pelo IRCC'], source: source('IRCC — estudar no Canadá', 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html') },
    { id: 'ca-family', title: 'Reunificação familiar', goal: 'family', summary: 'Confira se o familiar pode patrocinar sua solicitação.', requirements: ['Patrocinador e vínculo elegíveis', 'Documentos de identidade e parentesco'], source: source('IRCC — patrocínio familiar', 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship.html') },
  ] },
  { id: 'portugal', name: 'Portugal', flag: '🇵🇹', language: 'Português', introduction: 'Residência para trabalho, estudo e família conforme o motivo e o tipo de visto.', advantages: ['Idioma familiar', 'Diversos fundamentos de residência'], challenges: ['Procedimentos e agendamentos sujeitos a mudanças', 'Comprovação de meios e moradia'], cost: 'Visto, residência, documentos e instalação: confirmar em órgãos oficiais.', timing: 'Varia conforme visto e atendimento disponível.', reviewedAt: '2026-10-03', routes: [
    { id: 'pt-work', title: 'Trabalho', goal: 'work', summary: 'Compare as modalidades de residência ligadas ao exercício profissional.', requirements: ['Base legal e visto adequados', 'Provas da atividade e meios conforme a modalidade'], source: source('AIMA — trabalhar', 'https://aima.gov.pt/pt/trabalhar') },
    { id: 'pt-study', title: 'Estudo', goal: 'study', summary: 'Confira admissão, visto e autorização de residência para o curso.', requirements: ['Admissão em programa elegível', 'Documentos e meios de subsistência'], source: source('AIMA — estudar', 'https://aima.gov.pt/pt/estudar') },
    { id: 'pt-family', title: 'Família', goal: 'family', summary: 'O reagrupamento depende do vínculo e da situação do residente.', requirements: ['Vínculo comprovado', 'Condições exigidas para reagrupamento'], source: source('AIMA — reagrupamento familiar', 'https://aima.gov.pt/pt/viver/reagrupamento-familiar-com-familiar-em-territorio-nacional-art-98-o-n-o-2') },
  ] },
  { id: 'alemanha', name: 'Alemanha', flag: '🇩🇪', language: 'Alemão; inglês em alguns contextos', introduction: 'Há caminhos para profissionais qualificados, procura de emprego e estudo.', advantages: ['Rotas para profissionais qualificados', 'Portal oficial com orientação prática'], challenges: ['Reconhecimento profissional pode ser necessário', 'Idioma exigido varia por rota e profissão'], cost: 'Visto, reconhecimento, seguro e manutenção: conferir por rota.', timing: 'Depende de reconhecimento e representação consular.', reviewedAt: '2026-10-03', routes: [
    { id: 'de-work', title: 'Trabalho ou procura de emprego', goal: 'work', summary: 'Avalie visto de trabalho qualificado ou Cartão de Oportunidades.', requirements: ['Qualificação e reconhecimento quando aplicável', 'Idioma e recursos conforme a rota'], source: source('Make it in Germany — vistos', 'https://www.make-it-in-germany.com/en/visa-residence/types') },
    { id: 'de-study', title: 'Estudo', goal: 'study', summary: 'Confira admissão, recursos e autorização para estudar.', requirements: ['Admissão em curso', 'Comprovação financeira e idioma do curso'], source: source('Make it in Germany — visto de estudo', 'https://www.make-it-in-germany.com/en/visa-residence/types/studying') },
    { id: 'de-family', title: 'Família', goal: 'family', summary: 'O vínculo e a autorização do familiar determinam as condições.', requirements: ['Vínculo comprovado', 'Condições de reunião familiar'], source: source('Make it in Germany — reunião familiar', 'https://www.make-it-in-germany.com/en/visa-residence/family-reunification/spouses-joining-citizens-non-eu') },
  ] },
  { id: 'espanha', name: 'Espanha', flag: '🇪🇸', language: 'Espanhol', introduction: 'Vistos nacionais cobrem trabalho, estudo, família e outros motivos de residência.', advantages: ['Proximidade linguística', 'Modalidades distintas de residência'], challenges: ['Exigências dependem do visto e do consulado', 'Autorização prévia pode ser exigida para trabalho'], cost: 'Taxas consulares, documentos e instalação: consultar o consulado.', timing: 'Varia por categoria e repartição consular.', reviewedAt: '2026-10-03', routes: [
    { id: 'es-work', title: 'Trabalho', goal: 'work', summary: 'Confira a autorização de trabalho e o visto nacional aplicável.', requirements: ['Autorização ou fundamento adequado', 'Documentos exigidos pelo consulado'], source: source('Consulado da Espanha — visto de trabalho', 'https://www.exteriores.gob.es/Consulados/saopaulo/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=Brasil&scd=263&scs=Visados+Nacionales+-+Visado+de+trabajo+por+cuenta+ajena') },
    { id: 'es-study', title: 'Estudo', goal: 'study', summary: 'Verifique os requisitos do visto de estudos no consulado competente.', requirements: ['Aceite em curso', 'Recursos e cobertura de saúde conforme exigência'], source: source('Consulado da Espanha — serviços consulares', 'https://www.exteriores.gob.es/Consulados/saopaulo/es/ServiciosConsulares/Paginas/index.aspx') },
    { id: 'es-family', title: 'Família', goal: 'family', summary: 'Confira a modalidade de reunião familiar correspondente ao vínculo.', requirements: ['Vínculo comprovado', 'Condições do familiar residente'], source: source('Consulado da Espanha — serviços consulares', 'https://www.exteriores.gob.es/Consulados/saopaulo/es/ServiciosConsulares/Paginas/index.aspx') },
  ] },
  { id: 'italia', name: 'Itália', flag: '🇮🇹', language: 'Italiano', introduction: 'O motivo da permanência define o visto e a autorização de residência.', advantages: ['Rotas de estudo, trabalho e família', 'Portal oficial para identificar o visto'], challenges: ['Trabalho sujeito a regras e autorizações específicas', 'Procedimento consular e documentos variam'], cost: 'Visto, permesso, traduções e instalação: verificar no portal oficial.', timing: 'Depende do motivo, autorização e consulado.', reviewedAt: '2026-10-03', routes: [
    { id: 'it-work', title: 'Trabalho', goal: 'work', summary: 'Verifique as condições para ingresso e residência por trabalho.', requirements: ['Autorização e categoria aplicáveis', 'Documentação do empregador quando exigida'], source: source('Ministério italiano — visto de entrada', 'https://www.esteri.it/it/servizi-opportunita/ingressosoggiornoinitalia/visto_ingresso/') },
    { id: 'it-study', title: 'Estudo', goal: 'study', summary: 'Confira admissão, visto e permissão de residência para estudo.', requirements: ['Admissão e requisitos do curso', 'Recursos e documentação consular'], source: source('Study in Italy — visto', 'https://studyinitaly.esteri.it/Static/Visto') },
    { id: 'it-family', title: 'Família', goal: 'family', summary: 'Verifique o direito de reunião familiar conforme o vínculo.', requirements: ['Vínculo comprovado', 'Condições de residência do familiar'], source: source('Portal oficial de vistos da Itália', 'https://vistoperitalia.esteri.it/home.aspx') },
  ] },
  { id: 'paraguai', name: 'Paraguai', flag: '🇵🇾', language: 'Espanhol e guarani', introduction: 'Brasileiros podem investigar a residência temporária pelo Acordo do Mercosul.', advantages: ['Caminho de residência Mercosul para brasileiros', 'Proximidade geográfica'], challenges: ['Documentos podem exigir apostila e antecedentes', 'Residência permanente é um procedimento posterior'], cost: 'Taxas migratórias, documentação e instalação: confirmar na DNM.', timing: 'Depende de documentação e atendimento da DNM.', reviewedAt: '2026-10-03', routes: [
    { id: 'py-mercosur', title: 'Residência temporária Mercosul', goal: 'work', summary: 'Rota inicial de residência para brasileiros que pretendem se estabelecer no Paraguai.', requirements: ['Nacionalidade brasileira', 'Documentos de identidade e antecedentes conforme a DNM'], source: source('DNM — residência temporária Mercosul', 'https://migraciones.gov.py/residencia-temporaria-mercosur/') },
    { id: 'py-study', title: 'Estudo com residência', goal: 'study', summary: 'Investigue matrícula e residência aplicável à sua permanência.', requirements: ['Matrícula ou plano de estudos', 'Residência e documentos conforme a DNM'], source: source('DNM — residências temporárias', 'https://migraciones.gov.py/residencias-temporales/') },
    { id: 'py-family', title: 'Residência por vínculo familiar', goal: 'family', summary: 'Confirme a categoria de residência segundo o vínculo familiar.', requirements: ['Vínculo e documentos comprobatórios', 'Regras atuais da DNM'], source: source('DNM — residências temporárias', 'https://migraciones.gov.py/residencias-temporales/') },
  ] },
];

export function findRoute(countryId: string, routeId: string) {
  const country = COUNTRIES.find((item) => item.id === countryId);
  const route = country?.routes.find((item) => item.id === routeId);
  return country && route ? { country, route } : null;
}

export function isProfile(value: unknown): value is DiagnosticProfile {
  if (!value || typeof value !== 'object') return false;
  const p = value as Partial<DiagnosticProfile>;
  return ['work', 'study', 'family', 'business'].includes(p.goal || '') &&
    ['school', 'degree', 'postgraduate'].includes(p.education || '') &&
    typeof p.occupation === 'string' && p.occupation.length <= 120 &&
    Array.isArray(p.languages) && p.languages.length <= 5 && p.languages.every((x) => typeof x === 'string' && x.length <= 30) &&
    ['limited', 'moderate', 'comfortable'].includes(p.savings || '') &&
    (p.familyCountry === '' || COUNTRIES.some((c) => c.id === p.familyCountry)) &&
    ['soon', 'year', 'flexible'].includes(p.timeframe || '');
}

export function analyzeDestinations(profile: DiagnosticProfile): Suggestion[] {
  if (profile.goal === 'business') return [];
  const suggestions = COUNTRIES.flatMap((country) => country.routes
    .filter((route) => route.goal === profile.goal)
    .map((route) => {
      const reasons = [`Há uma rota de ${profile.goal === 'work' ? 'trabalho' : profile.goal === 'study' ? 'estudo' : 'família'} para pesquisar em ${country.name}.`];
      const verify = [...route.requirements];
      let priority = 0;
      if (profile.goal === 'family') {
        if (profile.familyCountry !== country.id) return null;
        priority += 4;
        reasons.push('Você informou vínculo familiar neste destino.');
      }
      if (country.id === 'paraguai' && profile.goal === 'work') { priority += 2; reasons.push('A nacionalidade brasileira permite investigar a residência Mercosul.'); }
      if (country.id === 'portugal') { priority += 1; reasons.push('O idioma português pode facilitar sua preparação.'); }
      if (profile.languages.some((language) => country.language.toLowerCase().includes(language.toLowerCase()))) { priority += 1; reasons.push('Você informou conhecer um idioma usado no destino.'); }
      if (profile.savings === 'limited') verify.push('Planeje recursos para taxas, manutenção e mudança antes de iniciar.');
      if (profile.timeframe === 'soon') verify.push('Confirme o prazo atual de processamento antes de assumir uma data de viagem.');
      if (profile.goal === 'work' && profile.occupation.trim()) verify.push(`Confira se sua área (${profile.occupation.trim()}) exige licença ou reconhecimento profissional no destino.`);
      if (profile.goal === 'work' && profile.education === 'school' && country.id !== 'paraguai') verify.push('Confirme se sua formação e experiência atendem à categoria de trabalho.');
      if (profile.goal === 'study') verify.push(`Confira se sua formação atual (${profile.education === 'school' ? 'ensino médio ou técnico' : profile.education === 'degree' ? 'graduação' : 'pós-graduação'}) atende à admissão no curso desejado.`);
      return { countryId: country.id, routeId: route.id, reasons, verify, priority };
    }).filter((item): item is Suggestion => item !== null));
  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 7);
}

export function createPlanSteps(countryId: CountryId, routeId: string, profile: DiagnosticProfile): PlanStep[] {
  const found = findRoute(countryId, routeId);
  if (!found) throw new Error('Rota inválida');
  const { country, route } = found;
  return [
    { id: 'verify', title: 'Confirmar a rota oficial', description: `Leia ${route.source.label} e confirme se ${route.title.toLowerCase()} corresponde ao seu objetivo. Fonte: ${route.source.url}`, completed: false },
    { id: 'criteria', title: 'Verificar os critérios', description: route.requirements.join('; ') + '. Anote exigências que ainda precisam ser comprovadas.', completed: false },
    { id: 'language', title: 'Conferir idioma e formação', description: `Idiomas informados: ${profile.languages.join(', ') || 'nenhum'}. Confira os requisitos de idioma e eventual reconhecimento de formação em ${country.name}.`, completed: false },
    { id: 'documents', title: 'Organizar documentos', description: 'Confira passaporte, identidade, certidões, comprovantes de formação, experiência e vínculo aplicáveis na fonte oficial; confirme tradução e apostila quando exigidas.', completed: false },
    { id: 'budget', title: 'Montar orçamento', description: `${country.cost} Inclua deslocamento, moradia inicial e reserva financeira. Recursos informados: ${profile.savings === 'limited' ? 'limitados' : profile.savings === 'moderate' ? 'moderados' : 'confortáveis'}.`, completed: false },
    { id: 'timeline', title: 'Validar prazo e solicitação', description: `${country.timing} Prazo desejado: ${profile.timeframe === 'soon' ? 'até 6 meses' : profile.timeframe === 'year' ? 'até 1 ano' : 'flexível'}. Verifique o órgão competente e envie somente após conferir os requisitos atuais.`, completed: false },
  ];
}
