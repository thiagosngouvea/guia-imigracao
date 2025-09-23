import { useState, useRef } from 'react';
import { Button } from './ui/Button';

interface CaseAnalysis {
  pdfLink: string;
  prong1Reason: string;
  prong2Reason: string;
  prong3Reason: string;
  prong1Verdict: string;
  prong2Verdict: string;
  prong3Verdict: string;
  finalVerdict: string;
  isNIW: boolean;
}

interface UserCase {
  prong1: string;
  prong2: string;
  prong3: string;
}

interface AnalysisProgress {
  processed: number;
  total: number;
  currentCase: string;
  isRunning: boolean;
}

interface EB2NIWAnalysisProps {
  onAnalysisComplete?: (results: CaseAnalysis[]) => void;
}

export function EB2NIWAnalysis({ onAnalysisComplete }: EB2NIWAnalysisProps) {
  const [userCase, setUserCase] = useState<UserCase>({
    prong1: '',
    prong2: '',
    prong3: ''
  });
  
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [analysisRange, setAnalysisRange] = useState({ start: 1, end: 10 });
  const [results, setResults] = useState<CaseAnalysis[]>([]);
  const [progress, setProgress] = useState<AnalysisProgress>({
    processed: 0,
    total: 0,
    currentCase: '',
    isRunning: false
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMasterFile(file);
      setError(null);
    }
  };

  const handleStartAnalysis = async () => {
    if (!masterFile) {
      setError('Por favor, faça upload do arquivo Master_file');
      return;
    }

    if (!userCase.prong1 || !userCase.prong2 || !userCase.prong3) {
      setError('Por favor, preencha todos os 3 prongs do seu caso');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults([]);
    setProgress({
      processed: 0,
      total: analysisRange.end - analysisRange.start + 1,
      currentCase: '',
      isRunning: true
    });

    try {
      // Ler arquivo master
      const masterFileContent = await masterFile.text();
      
      // Fazer análise via API
      const response = await fetch('/api/eb2-niw-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masterFileContent,
          userCase,
          startLine: analysisRange.start,
          endLine: analysisRange.end
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na análise');
      }

      // Stream de resultados
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Erro ao ler resposta');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'progress') {
                setProgress(prev => ({
                  ...prev,
                  processed: data.processed,
                  currentCase: data.currentCase
                }));
              } else if (data.type === 'result') {
                setResults(prev => [...prev, data.analysis]);
              }
            } catch (e) {
              console.error('Erro ao processar linha:', e);
            }
          }
        }
      }

      setProgress(prev => ({ ...prev, isRunning: false }));
      
      if (onAnalysisComplete && results.length > 0) {
        onAnalysisComplete(results);
      }

    } catch (error) {
      console.error('Erro na análise:', error);
      setError('Erro durante a análise. Tente novamente.');
      setProgress(prev => ({ ...prev, isRunning: false }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Your case stronger':
      case 'Your case much stronger':
        return 'text-green-600 bg-green-50';
      case 'Your case slightly stronger':
        return 'text-green-500 bg-green-50';
      case 'Mixed or equal':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getOverallStats = () => {
    if (results.length === 0) return null;

    const niwCases = results.filter(r => r.isNIW);
    const strongerCases = niwCases.filter(r => 
      r.finalVerdict.includes('stronger') || r.finalVerdict === 'Your case much stronger'
    );

    return {
      total: results.length,
      niwCases: niwCases.length,
      strongerCases: strongerCases.length,
      successRate: Math.round((strongerCases.length / niwCases.length) * 100)
    };
  };

  const stats = getOverallStats();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Análise EB2 NIW - Casos Negados
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Compare seu caso EB2 NIW com casos negados pelo USCIS para avaliar suas chances de sucesso
        </p>
      </div>

      {/* Setup Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuração da Análise</h2>
        
        {/* User Case Input */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900">Descreva seu caso NIW:</h3>
          
          <div className="grid md:grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prong 1 - Substantial Merit and National Importance
              </label>
              <textarea
                value={userCase.prong1}
                onChange={(e) => setUserCase(prev => ({ ...prev, prong1: e.target.value }))}
                placeholder="Descreva como seu trabalho tem mérito substancial e importância nacional..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prong 2 - Well Positioned to Advance Endeavor
              </label>
              <textarea
                value={userCase.prong2}
                onChange={(e) => setUserCase(prev => ({ ...prev, prong2: e.target.value }))}
                placeholder="Descreva sua experiência e posição para avançar sua área de trabalho..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prong 3 - Benefit to U.S. and PERM Waiver Justified
              </label>
              <textarea
                value={userCase.prong3}
                onChange={(e) => setUserCase(prev => ({ ...prev, prong3: e.target.value }))}
                placeholder="Descreva como seria benéfico para os EUA dispensar o teste do mercado de trabalho..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload do arquivo Master_file (lista de links dos PDFs)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {masterFile && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Arquivo carregado: {masterFile.name}
            </p>
          )}
        </div>

        {/* Analysis Range */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Linha inicial
            </label>
            <input
              type="number"
              min="1"
              value={analysisRange.start}
              onChange={(e) => setAnalysisRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Linha final
            </label>
            <input
              type="number"
              min="1"
              value={analysisRange.end}
              onChange={(e) => setAnalysisRange(prev => ({ ...prev, end: parseInt(e.target.value) || 10 }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Start Analysis Button */}
        <Button
          onClick={handleStartAnalysis}
          disabled={isAnalyzing || !masterFile || !userCase.prong1 || !userCase.prong2 || !userCase.prong3}
          className="w-full py-4 text-lg"
        >
          {isAnalyzing ? 'Analisando...' : 'Iniciar Análise'}
        </Button>
      </div>

      {/* Progress */}
      {progress.isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Análise em Progresso</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-blue-700">
              <span>Progresso: {progress.processed} de {progress.total} casos</span>
              <span>{Math.round((progress.processed / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.processed / progress.total) * 100}%` }}
              ></div>
            </div>
            {progress.currentCase && (
              <p className="text-sm text-blue-600">
                Analisando: {progress.currentCase}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {stats && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo dos Resultados</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Total de Casos</div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.niwCases}</div>
              <div className="text-sm text-purple-700">Casos NIW</div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{stats.strongerCases}</div>
              <div className="text-sm text-green-700">Seu Caso Mais Forte</div>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.successRate}%</div>
              <div className="text-sm text-yellow-700">Taxa de Sucesso</div>
            </div>
          </div>

          {/* Detailed Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">#</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Prong 1</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Prong 2</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Prong 3</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Veredito Final</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.isNIW ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {result.isNIW ? 'NIW' : 'Não NIW'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(result.prong1Verdict)}`}>
                        {result.prong1Verdict}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(result.prong2Verdict)}`}>
                        {result.prong2Verdict}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(result.prong3Verdict)}`}>
                        {result.prong3Verdict}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(result.finalVerdict)}`}>
                        {result.finalVerdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
