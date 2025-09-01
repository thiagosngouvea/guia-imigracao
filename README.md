# Guia Imigração - SaaS para Imigração aos EUA

Uma plataforma completa com inteligência artificial para ajudar brasileiros em todo o processo de imigração para os Estados Unidos.

## 🚀 Funcionalidades

### ✅ Implementadas

- **Landing Page Atrativa**: Página inicial moderna com informações sobre o produto
- **Sistema de Autenticação**: Páginas de login e cadastro com validação
- **Questionário Inteligente**: Sistema que recomenda o melhor tipo de visto baseado no perfil do usuário
- **Informações de Vistos**: Guia completo com detalhes sobre todos os tipos de visto americano
- **Treino com IA**: Simulador de entrevistas de visto com feedback personalizado
- **Dashboard**: Painel principal com estatísticas e ações rápidas
- **Design Responsivo**: Interface otimizada para desktop e mobile

### 🔄 Principais Seções

1. **Questionário de Visto**
   - 5 perguntas estratégicas
   - Sistema de pontuação inteligente
   - Recomendação personalizada de visto
   - Interface intuitiva com barra de progresso

2. **Treino com IA**
   - Cenários realistas de entrevista
   - 3 níveis de dificuldade
   - Feedback instantâneo
   - Perguntas baseadas em casos reais

3. **Informações de Vistos**
   - B1/B2 (Turismo/Negócios)
   - F1 (Estudante)
   - H1B (Trabalhador Especializado)
   - EB-5 (Investidor)
   - O1 (Habilidade Extraordinária)

4. **Dashboard**
   - Estatísticas de progresso
   - Atividades recentes
   - Próximos passos recomendados
   - Ações rápidas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Componentes**: Componentes customizados com Headless UI
- **Ícones**: Heroicons (via SVG)
- **Utilitários**: clsx, tailwind-merge

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd guia-imigracao
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🎯 Próximos Passos

### Para Produção
- [ ] Configurar banco de dados (Prisma + PostgreSQL)
- [ ] Implementar autenticação real (NextAuth.js)
- [ ] Integrar IA real para entrevistas (OpenAI API)
- [ ] Sistema de pagamentos (Stripe)
- [ ] Dashboard de administração
- [ ] Sistema de notificações
- [ ] Testes automatizados

### Melhorias
- [ ] PWA (Progressive Web App)
- [ ] Modo escuro
- [ ] Internacionalização (i18n)
- [ ] Analytics e métricas
- [ ] Chat de suporte
- [ ] Blog/Artigos educativos

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/           # Componentes base (Button, Input, etc.)
│   └── layout/       # Componentes de layout (Header, Layout)
├── pages/            # Páginas da aplicação
│   ├── index.tsx     # Landing page
│   ├── login.tsx     # Página de login
│   ├── cadastro.tsx  # Página de cadastro
│   ├── questionario.tsx # Questionário de visto
│   ├── vistos.tsx    # Informações de vistos
│   ├── treinamento.tsx # Treino com IA
│   └── dashboard.tsx # Dashboard principal
├── lib/              # Utilitários e constantes
└── styles/           # Estilos globais
```

## 🎨 Design System

### Cores Principais
- **Azul**: #2563eb (Primary)
- **Verde**: #059669 (Success)
- **Amarelo**: #d97706 (Warning)
- **Vermelho**: #dc2626 (Error)
- **Cinza**: #6b7280 (Neutral)

### Componentes
- **Button**: 4 variantes (primary, secondary, outline, ghost)
- **Input**: Com label e validação de erro
- **Layout**: Header responsivo + conteúdo principal

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
npx vercel --prod
```

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request para sugestões e melhorias.

---

**Desenvolvido com ❤️ para ajudar brasileiros a realizarem o sonho americano.**