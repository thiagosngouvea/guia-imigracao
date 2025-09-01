export const VISA_TYPES = {
  'B1/B2': {
    name: 'Turismo/Negócios',
    category: 'Não-Imigrante',
    color: 'blue'
  },
  'F1': {
    name: 'Estudante',
    category: 'Não-Imigrante',
    color: 'green'
  },
  'H1B': {
    name: 'Trabalhador Especializado',
    category: 'Não-Imigrante',
    color: 'purple'
  },
  'EB5': {
    name: 'Investidor',
    category: 'Imigrante',
    color: 'yellow'
  },
  'O1': {
    name: 'Habilidade Extraordinária',
    category: 'Não-Imigrante',
    color: 'red'
  }
} as const;

export const DIFFICULTY_LEVELS = {
  'Iniciante': {
    color: 'green',
    description: 'Para quem está começando'
  },
  'Intermediário': {
    color: 'yellow',
    description: 'Para quem já tem alguma experiência'
  },
  'Avançado': {
    color: 'red',
    description: 'Para casos mais complexos'
  }
} as const;

export const NAVIGATION_ITEMS = [
  {
    name: 'Início',
    href: '/',
    icon: 'home'
  },
  {
    name: 'Questionário',
    href: '/questionario',
    icon: 'question'
  },
  {
    name: 'Tipos de Visto',
    href: '/vistos',
    icon: 'document'
  },
  {
    name: 'Treino IA',
    href: '/treinamento',
    icon: 'brain'
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard'
  }
] as const;
