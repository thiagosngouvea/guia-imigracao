import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';

interface DS160Section {
  id: string;
  title: string;
  description: string;
  fields: DS160Field[];
  completed: boolean;
}

interface DS160Field {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  value?: string;
}

interface DS160Data {
  [key: string]: string | boolean;
}

const ds160Sections: DS160Section[] = [
  {
    id: 'personal-info',
    title: 'Informações Pessoais',
    description: 'Dados básicos do requerente',
    completed: false,
    fields: [
      {
        id: 'surname',
        label: 'Sobrenome (como no passaporte)',
        type: 'text',
        required: true,
        placeholder: 'SILVA',
        help: 'Digite exatamente como aparece no seu passaporte'
      },
      {
        id: 'givenName',
        label: 'Nome (como no passaporte)',
        type: 'text',
        required: true,
        placeholder: 'JOAO CARLOS',
        help: 'Digite exatamente como aparece no seu passaporte'
      },
      {
        id: 'fullNameNative',
        label: 'Nome completo em alfabeto nativo',
        type: 'text',
        required: false,
        placeholder: 'João Carlos Silva',
        help: 'Se seu nome contém acentos ou caracteres especiais'
      },
      {
        id: 'otherNames',
        label: 'Outros nomes já utilizados',
        type: 'textarea',
        required: false,
        placeholder: 'Nome de solteira, apelidos, etc.',
        help: 'Liste qualquer outro nome que já tenha usado oficialmente'
      },
      {
        id: 'gender',
        label: 'Sexo',
        type: 'radio',
        required: true,
        options: ['Masculino', 'Feminino']
      },
      {
        id: 'maritalStatus',
        label: 'Estado Civil',
        type: 'select',
        required: true,
        options: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Separado(a)', 'União Estável']
      },
      {
        id: 'birthDate',
        label: 'Data de Nascimento',
        type: 'date',
        required: true,
        help: 'Formato: DD/MM/AAAA'
      },
      {
        id: 'birthCity',
        label: 'Cidade de Nascimento',
        type: 'text',
        required: true,
        placeholder: 'São Paulo'
      },
      {
        id: 'birthState',
        label: 'Estado de Nascimento',
        type: 'text',
        required: true,
        placeholder: 'São Paulo'
      },
      {
        id: 'birthCountry',
        label: 'País de Nascimento',
        type: 'text',
        required: true,
        placeholder: 'Brasil'
      }
    ]
  },
  {
    id: 'passport-info',
    title: 'Informações do Passaporte',
    description: 'Dados do passaporte brasileiro',
    completed: false,
    fields: [
      {
        id: 'passportNumber',
        label: 'Número do Passaporte',
        type: 'text',
        required: true,
        placeholder: 'AB1234567',
        help: 'Encontrado na primeira página do passaporte'
      },
      {
        id: 'passportBookNumber',
        label: 'Número do Livro do Passaporte',
        type: 'text',
        required: false,
        placeholder: 'Deixe em branco se não houver',
        help: 'Alguns passaportes têm um número adicional'
      },
      {
        id: 'passportIssueDate',
        label: 'Data de Emissão do Passaporte',
        type: 'date',
        required: true,
        help: 'Data em que o passaporte foi emitido'
      },
      {
        id: 'passportExpiryDate',
        label: 'Data de Expiração do Passaporte',
        type: 'date',
        required: true,
        help: 'Data de validade do passaporte'
      },
      {
        id: 'passportIssuingCountry',
        label: 'País Emissor',
        type: 'text',
        required: true,
        placeholder: 'Brasil'
      },
      {
        id: 'passportIssuingCity',
        label: 'Cidade de Emissão',
        type: 'text',
        required: true,
        placeholder: 'São Paulo',
        help: 'Cidade onde o passaporte foi emitido'
      }
    ]
  },
  {
    id: 'address-info',
    title: 'Endereço e Contato',
    description: 'Informações de endereço atual e contato',
    completed: false,
    fields: [
      {
        id: 'homeAddress',
        label: 'Endereço Residencial',
        type: 'textarea',
        required: true,
        placeholder: 'Rua das Flores, 123, Apt 45',
        help: 'Endereço completo onde você mora atualmente'
      },
      {
        id: 'homeCity',
        label: 'Cidade',
        type: 'text',
        required: true,
        placeholder: 'São Paulo'
      },
      {
        id: 'homeState',
        label: 'Estado/Província',
        type: 'text',
        required: true,
        placeholder: 'São Paulo'
      },
      {
        id: 'homePostalCode',
        label: 'CEP',
        type: 'text',
        required: true,
        placeholder: '01234-567'
      },
      {
        id: 'homeCountry',
        label: 'País',
        type: 'text',
        required: true,
        placeholder: 'Brasil'
      },
      {
        id: 'phoneNumber',
        label: 'Telefone',
        type: 'text',
        required: true,
        placeholder: '+55 11 99999-9999',
        help: 'Inclua código do país (+55 para Brasil)'
      },
      {
        id: 'email',
        label: 'E-mail',
        type: 'text',
        required: true,
        placeholder: 'seuemail@exemplo.com'
      }
    ]
  },
  {
    id: 'travel-info',
    title: 'Informações da Viagem',
    description: 'Detalhes sobre sua viagem aos EUA',
    completed: false,
    fields: [
      {
        id: 'travelPurpose',
        label: 'Propósito da Viagem',
        type: 'select',
        required: true,
        options: [
          'Turismo/Prazer',
          'Visita a Familiares/Amigos',
          'Negócios',
          'Tratamento Médico',
          'Participar de Conferência/Evento',
          'Outro'
        ]
      },
      {
        id: 'intendedArrivalDate',
        label: 'Data Pretendida de Chegada',
        type: 'date',
        required: true,
        help: 'Data aproximada quando pretende chegar aos EUA'
      },
      {
        id: 'intendedStayLength',
        label: 'Duração Pretendida da Estadia',
        type: 'text',
        required: true,
        placeholder: '15 dias',
        help: 'Quantos dias pretende ficar nos EUA'
      },
      {
        id: 'addressInUS',
        label: 'Endereço nos EUA',
        type: 'textarea',
        required: true,
        placeholder: 'Nome do hotel ou endereço onde ficará',
        help: 'Hotel, casa de amigos, ou outro endereço onde ficará'
      },
      {
        id: 'cityInUS',
        label: 'Cidade nos EUA',
        type: 'text',
        required: true,
        placeholder: 'New York'
      },
      {
        id: 'stateInUS',
        label: 'Estado nos EUA',
        type: 'text',
        required: true,
        placeholder: 'NY'
      },
      {
        id: 'contactPersonUS',
        label: 'Pessoa de Contato nos EUA',
        type: 'text',
        required: false,
        placeholder: 'Nome de amigo/familiar nos EUA',
        help: 'Se aplicável, nome de quem você visitará'
      },
      {
        id: 'contactPhoneUS',
        label: 'Telefone de Contato nos EUA',
        type: 'text',
        required: false,
        placeholder: '+1 (555) 123-4567'
      }
    ]
  },
  {
    id: 'work-education',
    title: 'Trabalho e Educação',
    description: 'Informações profissionais e educacionais',
    completed: false,
    fields: [
      {
        id: 'currentOccupation',
        label: 'Ocupação Atual',
        type: 'text',
        required: true,
        placeholder: 'Engenheiro de Software'
      },
      {
        id: 'employerName',
        label: 'Nome do Empregador',
        type: 'text',
        required: true,
        placeholder: 'Empresa XYZ Ltda'
      },
      {
        id: 'employerAddress',
        label: 'Endereço do Empregador',
        type: 'textarea',
        required: true,
        placeholder: 'Av. Paulista, 1000, São Paulo, SP'
      },
      {
        id: 'employerPhone',
        label: 'Telefone do Empregador',
        type: 'text',
        required: true,
        placeholder: '+55 11 3333-4444'
      },
      {
        id: 'monthlySalary',
        label: 'Salário Mensal (em Reais)',
        type: 'text',
        required: true,
        placeholder: 'R$ 8.000,00'
      },
      {
        id: 'workStartDate',
        label: 'Data de Início no Trabalho Atual',
        type: 'date',
        required: true
      },
      {
        id: 'educationLevel',
        label: 'Nível de Educação',
        type: 'select',
        required: true,
        options: [
          'Ensino Fundamental',
          'Ensino Médio',
          'Ensino Superior',
          'Pós-graduação',
          'Mestrado',
          'Doutorado'
        ]
      },
      {
        id: 'schoolName',
        label: 'Nome da Instituição de Ensino',
        type: 'text',
        required: true,
        placeholder: 'Universidade de São Paulo'
      },
      {
        id: 'fieldOfStudy',
        label: 'Área de Estudo',
        type: 'text',
        required: true,
        placeholder: 'Engenharia de Computação'
      },
      {
        id: 'graduationYear',
        label: 'Ano de Conclusão',
        type: 'text',
        required: true,
        placeholder: '2020'
      }
    ]
  }
];

export default function DS160Helper() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<DS160Data>({});
  const [sections, setSections] = useState(ds160Sections);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load saved data from localStorage
  useEffect(() => {
    if (isClient) {
      const savedData = localStorage.getItem('ds160-form-data');
      if (savedData) {
        try {
          setFormData(JSON.parse(savedData));
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    }
  }, [isClient]);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    if (isClient && Object.keys(formData).length > 0) {
      localStorage.setItem('ds160-form-data', JSON.stringify(formData));
    }
  }, [formData, isClient]);

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const isSectionComplete = (section: DS160Section) => {
    const requiredFields = section.fields.filter(field => field.required);
    return requiredFields.every(field => {
      const value = formData[field.id];
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const getCompletionPercentage = () => {
    const totalSections = sections.length;
    const completedSections = sections.filter(section => isSectionComplete(section)).length;
    return Math.round((completedSections / totalSections) * 100);
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ds160-dados.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      setFormData({});
      localStorage.removeItem('ds160-form-data');
    }
  };

  // Show loading state
  if (loading || !isClient) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando assistente DS-160...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  const currentSectionData = sections[currentSection];
  const completionPercentage = getCompletionPercentage();

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Assistente DS-160
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Preencha os dados aqui e depois transfira para o formulário oficial
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
                  <div className="text-sm text-gray-500">Completo</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              {/* Section Navigation */}
              <div className="mt-6 flex flex-wrap gap-2">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      index === currentSection
                        ? 'bg-blue-600 text-white'
                        : isSectionComplete(section)
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isSectionComplete(section) && (
                      <span className="mr-1">✓</span>
                    )}
                    {section.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentSectionData.title}
                </h2>
                <p className="text-gray-600">{currentSectionData.description}</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {currentSectionData.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.type === 'text' && (
                      <Input
                        type="text"
                        value={formData[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full"
                      />
                    )}

                    {field.type === 'date' && (
                      <Input
                        type="date"
                        value={formData[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full"
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        value={formData[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione uma opção</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'radio' && (
                      <div className="flex gap-4">
                        {field.options?.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name={field.id}
                              value={option}
                              checked={formData[field.id] === option}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="mr-2"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}

                    {field.help && (
                      <p className="text-sm text-gray-500 mt-1">{field.help}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={prevSection}
                  disabled={currentSection === 0}
                >
                  ← Anterior
                </Button>
                <Button
                  onClick={nextSection}
                  disabled={currentSection === sections.length - 1}
                >
                  Próximo →
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={exportData}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  📥 Exportar Dados
                </Button>
                <Button
                  variant="outline"
                  onClick={clearData}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  🗑️ Limpar Dados
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                📋 Como usar este assistente
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Preencha todas as seções com suas informações pessoais</li>
                <li>• Os dados são salvos automaticamente no seu navegador</li>
                <li>• Use o botão &quot;Exportar Dados&quot; para baixar um arquivo com suas informações</li>
                <li>• Acesse o site oficial do DS-160: <a href="https://ceac.state.gov/genniv" target="_blank" rel="noopener noreferrer" className="underline font-medium">ceac.state.gov/genniv</a></li>
                <li>• Transfira os dados daqui para o formulário oficial</li>
                <li>• Mantenha este assistente aberto em outra aba para consulta</li>
              </ul>
            </div>

            {/* Warning */}
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3">⚠️</div>
                <div>
                  <h4 className="font-medium text-yellow-800">Importante</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Este é apenas um assistente para organizar suas informações. 
                    O formulário oficial DS-160 deve ser preenchido no site do governo americano. 
                    Sempre verifique as informações antes de submeter o formulário oficial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </SubscriptionGuard>
  );
}
