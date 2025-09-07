# Configuração do Sistema de Pagamentos com Stripe

Este documento explica como configurar o sistema de pagamentos e assinaturas usando o Stripe.

## 1. Configuração do Stripe

### 1.1 Criar Conta no Stripe
1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Ative o modo de teste para desenvolvimento
3. Acesse o Dashboard do Stripe

### 1.2 Obter Chaves da API
1. No Dashboard, vá para **Developers > API keys**
2. Copie a **Publishable key** e **Secret key** do modo de teste
3. Adicione as chaves no arquivo `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica
```

### 1.3 Criar Produtos e Preços
1. No Dashboard, vá para **Products**
2. Crie um produto chamado "Assinatura MoveEasy"
3. Adicione dois preços:
   - **Mensal**: R$ 29,90/mês (recorrente)
   - **Anual**: R$ 299,00/ano (recorrente)
4. Copie os IDs dos preços e adicione no `.env.local`:

```env
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_id_mensal
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_id_anual
```

### 1.4 Configurar Webhooks
1. No Dashboard, vá para **Developers > Webhooks**
2. Clique em **Add endpoint**
3. URL do endpoint: `https://seu-dominio.com/api/stripe/webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copie o **Signing secret** e adicione no `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret
```

## 2. Configuração da Aplicação

### 2.1 Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com todas as variáveis necessárias:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_id_mensal
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_id_anual

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2.2 Configurar Administradores
Para marcar um usuário como administrador:

1. Acesse o Firebase Console
2. Vá para **Firestore Database**
3. Encontre o documento do usuário na coleção `users`
4. Adicione o campo `isAdmin: true`

Administradores têm acesso completo sem necessidade de assinatura.

## 3. Funcionalidades Implementadas

### 3.1 Controle de Acesso
- ✅ Usuários não-admin precisam de assinatura ativa
- ✅ Verificação automática em todas as páginas protegidas
- ✅ Redirecionamento para página de assinatura quando necessário

### 3.2 Processamento de Pagamentos
- ✅ Checkout seguro via Stripe
- ✅ Suporte a pagamentos recorrentes (mensal/anual)
- ✅ Processamento automático via webhooks

### 3.3 Gerenciamento de Assinaturas
- ✅ Portal do cliente para gerenciar assinatura
- ✅ Cancelamento e alteração de planos
- ✅ Histórico de pagamentos

### 3.4 Interface do Usuário
- ✅ Página de planos de assinatura
- ✅ Status da assinatura no header
- ✅ Componente de proteção de rotas

## 4. Fluxo de Pagamento

1. **Usuário acessa página protegida** → Verifica assinatura
2. **Sem assinatura ativa** → Redireciona para `/subscription`
3. **Escolhe plano** → Cria sessão de checkout no Stripe
4. **Pagamento aprovado** → Webhook atualiza status no Firebase
5. **Acesso liberado** → Usuário pode usar o sistema

## 5. Testes

### 5.1 Cartões de Teste
Use estes cartões para testar pagamentos:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### 5.2 Testando Webhooks Localmente
1. Instale o Stripe CLI: `stripe login`
2. Execute: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Use a chave do webhook fornecida pelo CLI

## 6. Deploy em Produção

### 6.1 Configurações Necessárias
1. Altere para chaves de produção do Stripe
2. Configure webhook para URL de produção
3. Atualize `NEXT_PUBLIC_BASE_URL` para domínio real
4. Configure variáveis de ambiente no provedor de hosting

### 6.2 Segurança
- ✅ Chaves secretas apenas no servidor
- ✅ Verificação de assinatura dos webhooks
- ✅ Validação de dados no backend
- ✅ Proteção contra ataques CSRF

## 7. Monitoramento

### 7.1 Logs Importantes
- Webhooks processados com sucesso/erro
- Tentativas de acesso sem assinatura
- Criação e cancelamento de assinaturas

### 7.2 Métricas Sugeridas
- Taxa de conversão de visitantes para assinantes
- Taxa de cancelamento (churn)
- Receita recorrente mensal (MRR)

## 8. Suporte

Para problemas relacionados ao Stripe:
1. Verifique os logs no Dashboard do Stripe
2. Confirme se os webhooks estão sendo entregues
3. Valide as chaves da API e IDs dos preços
4. Teste com cartões de teste antes de usar cartões reais
