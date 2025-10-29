import React from 'react';
import { Layout } from '../components/layout/Layout';

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Política de Privacidade
            </h1>
            
            <div className="space-y-8">
              <p className="text-gray-600 mb-6">
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  1. Informações Gerais
                </h2>
                <p className="text-gray-700">
                  Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
                  suas informações pessoais quando você utiliza nosso sistema de orientação para imigração 
                  e processos de visto americano.
                </p>
                <p className="text-gray-700">
                  Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  2. Informações que Coletamos
                </h2>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">
                    2.1 Informações Pessoais
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Informações de contato</li>
                    <li>Dados relacionados ao processo de imigração</li>
                    <li>Informações profissionais e educacionais</li>
                    <li>Documentos e formulários relacionados ao visto</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">
                    2.2 Informações de Pagamento
                  </h3>
                  <p className="text-gray-700">
                    Utilizamos o Stripe para processar pagamentos. Não armazenamos informações de cartão 
                    de crédito em nossos servidores. Todas as transações são processadas de forma segura 
                    através da plataforma Stripe, que é certificada PCI DSS.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">
                    2.3 Informações Técnicas
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Endereço IP</li>
                    <li>Tipo de navegador e versão</li>
                    <li>Sistema operacional</li>
                    <li>Páginas visitadas e tempo de permanência</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  3. Como Usamos suas Informações
                </h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Fornecer orientação personalizada para processos de imigração</li>
                  <li>Processar pagamentos e gerenciar assinaturas</li>
                  <li>Melhorar nossos serviços e experiência do usuário</li>
                  <li>Enviar comunicações importantes sobre sua conta</li>
                  <li>Cumprir obrigações legais e regulamentares</li>
                  <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                  <li>Fornecer suporte técnico e atendimento ao cliente</li>
                </ul>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  4. Compartilhamento de Informações
                </h2>
                <p className="text-gray-700">
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                  exceto nas seguintes situações:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Provedores de Serviço:</strong> Stripe para processamento de pagamentos, 
                      Firebase para autenticação e armazenamento de dados</li>
                  <li><strong>Cumprimento Legal:</strong> Quando exigido por lei ou ordem judicial</li>
                  <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos legais ou 
                      a segurança dos usuários</li>
                  <li><strong>Consentimento:</strong> Com seu consentimento explícito</li>
                </ul>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  5. Segurança dos Dados
                </h2>
                <p className="text-gray-700">
                  Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
                  proteger suas informações pessoais contra acesso não autorizado, alteração, 
                  divulgação ou destruição:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Autenticação segura através do Firebase</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Acesso restrito aos dados por funcionários autorizados</li>
                  <li>Backups regulares e seguros</li>
                </ul>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  6. Retenção de Dados
                </h2>
                <p className="text-gray-700">
                  Mantemos suas informações pessoais pelo tempo necessário para cumprir os propósitos 
                  descritos nesta política, a menos que um período de retenção mais longo seja exigido 
                  ou permitido por lei. Dados de pagamento são retidos conforme as políticas do Stripe 
                  e requisitos regulamentares.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  7. Seus Direitos
                </h2>
                <p className="text-gray-700">
                  Você tem os seguintes direitos em relação às suas informações pessoais:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Acesso:</strong> Solicitar uma cópia das informações que temos sobre você</li>
                  <li><strong>Correção:</strong> Solicitar a correção de informações imprecisas</li>
                  <li><strong>Exclusão:</strong> Solicitar a exclusão de suas informações pessoais</li>
                  <li><strong>Portabilidade:</strong> Solicitar a transferência de seus dados</li>
                  <li><strong>Oposição:</strong> Opor-se ao processamento de suas informações</li>
                  <li><strong>Limitação:</strong> Solicitar a limitação do processamento</li>
                </ul>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  8. Cookies e Tecnologias Similares
                </h2>
                <p className="text-gray-700">
                  Utilizamos cookies e tecnologias similares para:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Manter você conectado à sua conta</li>
                  <li>Lembrar suas preferências</li>
                  <li>Analisar o uso da plataforma</li>
                  <li>Melhorar a funcionalidade do site</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  9. Transferências Internacionais
                </h2>
                <p className="text-gray-700">
                  Suas informações podem ser transferidas e processadas em países diferentes do seu país 
                  de residência. Garantimos que essas transferências sejam realizadas com proteções 
                  adequadas e em conformidade com as leis aplicáveis de proteção de dados.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  10. Menores de Idade
                </h2>
                <p className="text-gray-700">
                  Nossos serviços não são direcionados a menores de 18 anos. Não coletamos 
                  intencionalmente informações pessoais de menores de idade. Se tomarmos conhecimento 
                  de que coletamos informações de um menor, tomaremos medidas para excluir essas informações.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  11. Alterações nesta Política
                </h2>
                <p className="text-gray-700">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você 
                  sobre alterações significativas através do e-mail cadastrado ou através de um aviso 
                  em nossa plataforma. A data da última atualização será sempre indicada no topo desta página.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  12. Contato
                </h2>
                <p className="text-gray-700">
                  Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus 
                  direitos, entre em contato conosco:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-gray-700">
                    <strong>E-mail:</strong> thiagonunes026@gmail.com<br />
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  13. Lei Aplicável
                </h2>
                <p className="text-gray-700">
                  Esta Política de Privacidade é regida pelas leis brasileiras, incluindo a 
                  Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e demais 
                  regulamentações aplicáveis.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Esta política está em conformidade com a LGPD (Lei Geral de Proteção de Dados) 
                  e outras regulamentações de privacidade aplicáveis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;