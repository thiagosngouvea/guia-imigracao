import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import { HiUser, HiIdentification, HiLocationMarker, HiPaperAirplane, HiBriefcase } from 'react-icons/hi';
import { HiArrowLeft, HiArrowRight, HiExclamationTriangle, HiInformationCircle } from 'react-icons/hi2';
import { FiDownload, FiTrash2, FiCheckCircle } from 'react-icons/fi';

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

  const SECTION_ICONS = [
    <HiUser key="user" className="w-4 h-4" />,
    <HiIdentification key="id" className="w-4 h-4" />,
    <HiLocationMarker key="loc" className="w-4 h-4" />,
    <HiPaperAirplane key="plane" className="w-4 h-4" />,
    <HiBriefcase key="brief" className="w-4 h-4" />,
  ];

  return (
    <SubscriptionGuard>
      <Layout>
        <div className="py-10 px-4" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F8FAFC 50%, #F0F4FF 100%)' }}>
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Formulário Oficial</p>
                  <h1 className="text-2xl font-bold text-slate-900">Assistente DS-160</h1>
                  <p className="text-slate-500 text-sm mt-1">Preencha aqui e transfira para o formulário oficial</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{completionPercentage}%</div>
                  <div className="text-xs text-slate-500">Completo</div>
                </div>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
              </div>
              {/* Section tabs */}
              <div className="mt-5 flex flex-wrap gap-2">
                {sections.map((section, index) => {
                  const done = isSectionComplete(section);
                  return (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(index)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                        index === currentSection
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : done
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {done && index !== currentSection
                        ? <FiCheckCircle className="w-3.5 h-3.5" />
                        : SECTION_ICONS[index]}
                      {section.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current section form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl">
                  {SECTION_ICONS[currentSection]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{currentSectionData.title}</h2>
                  <p className="text-sm text-slate-500">{currentSectionData.description}</p>
                </div>
              </div>

              <div className="space-y-5">
                {currentSectionData.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.type === 'text' && (
                      <Input type="text" value={formData[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder} className="w-full" />
                    )}
                    {field.type === 'date' && (
                      <Input type="date" value={formData[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full" />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder} rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 placeholder:text-slate-400 resize-none"
                      />
                    )}
                    {field.type === 'select' && (
                      <select value={formData[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 appearance-none">
                        <option value="">Selecione uma opção</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'radio' && (
                      <div className="flex gap-3">
                        {field.options?.map((option) => (
                          <label key={option} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                            <input type="radio" name={field.id} value={option}
                              checked={formData[field.id] === option}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="text-blue-600 focus:ring-blue-500/30" />
                            <span className="text-sm text-slate-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {field.help && (
                      <p className="text-xs text-slate-500 mt-1.5">{field.help}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={prevSection} disabled={currentSection === 0} className="gap-2">
                  <HiArrowLeft className="w-4 h-4" /> Anterior
                </Button>
                <Button onClick={nextSection} disabled={currentSection === sections.length - 1} className="gap-2">
                  Próximo <HiArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportData} className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                  <FiDownload className="w-4 h-4" /> Exportar
                </Button>
                <Button variant="outline" onClick={clearData} className="gap-2 text-red-600 border-red-300 hover:bg-red-50">
                  <FiTrash2 className="w-4 h-4" /> Limpar
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <HiInformationCircle className="w-4 h-4 text-blue-600" /> Como usar este assistente
              </h3>
              <ul className="space-y-1.5 text-blue-800 text-sm">
                <li className="flex items-start gap-2"><FiCheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /> Preencha todas as seções com suas informações pessoais</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /> Os dados são salvos automaticamente no seu navegador</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /> Use &quot;Exportar&quot; para baixar um arquivo com suas informações</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /> Acesse o site oficial: <a href="https://ceac.state.gov/genniv" target="_blank" rel="noopener noreferrer" className="underline font-medium">ceac.state.gov/genniv</a></li>
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <HiExclamationTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Importante</h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Este é apenas um assistente para organizar suas informações.
                  O formulário oficial DS-160 deve ser preenchido no site do governo americano.
                  Sempre verifique as informações antes de submeter o formulário oficial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </SubscriptionGuard>
  );
}
