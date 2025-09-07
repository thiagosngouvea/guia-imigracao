import { useState } from 'react';
import { ProcessStep } from '../../lib/visa-documents';

interface StepByStepProps {
  steps: ProcessStep[];
  totalEstimatedTime: string;
  averageCost: string;
}

interface StepItemProps {
  step: ProcessStep;
  stepNumber: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  isCompleted: boolean;
  onComplete: (id: string) => void;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil'
};

function StepItem({ step, stepNumber, isExpanded, onToggle, isCompleted, onComplete }: StepItemProps) {
  return (
    <div className={`border rounded-lg transition-all ${
      isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Step Number/Checkmark */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {isCompleted ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              stepNumber
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold text-lg ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                {step.title}
              </h3>
              
              <button
                onClick={() => onToggle(step.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg 
                  className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <p className={`text-sm mt-1 ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
              {step.description}
            </p>
            
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {step.estimatedTime}
              </div>
              
              <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[step.difficulty]}`}>
                {difficultyLabels[step.difficulty]}
              </span>
              
              {!isCompleted && (
                <button
                  onClick={() => onComplete(step.id)}
                  className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Marcar como Concluído
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 ml-12 space-y-4 border-t pt-4">
            {/* Substeps */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">📋 Passos Detalhados:</h4>
              <ol className="list-decimal list-inside space-y-2">
                {step.substeps.map((substep, index) => (
                  <li key={index} className="text-sm text-gray-700 leading-relaxed">
                    {substep}
                  </li>
                ))}
              </ol>
            </div>
            
            {/* Tips */}
            {step.tips.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">💡 Dicas Importantes:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Common Mistakes */}
            {step.commonMistakes && step.commonMistakes.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">⚠️ Erros Comuns a Evitar:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {step.commonMistakes.map((mistake, index) => (
                    <li key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function StepByStep({ steps, totalEstimatedTime, averageCost }: StepByStepProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newExpandedSteps = new Set(expandedSteps);
    if (newExpandedSteps.has(id)) {
      newExpandedSteps.delete(id);
    } else {
      newExpandedSteps.add(id);
    }
    setExpandedSteps(newExpandedSteps);
  };

  const handleComplete = (id: string) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(id)) {
      newCompletedSteps.delete(id);
    } else {
      newCompletedSteps.add(id);
    }
    setCompletedSteps(newCompletedSteps);
  };

  const progressPercentage = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Process Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Visão Geral do Processo</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{steps.length}</div>
            <div className="text-sm text-gray-600">Etapas Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalEstimatedTime}</div>
            <div className="text-sm text-gray-600">Tempo Estimado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{averageCost}</div>
            <div className="text-sm text-gray-600">Custo Médio</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{completedSteps.size} de {steps.length} etapas concluídas</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {completedSteps.size === steps.length && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-center">
            <span className="text-green-800 font-medium">
              🎉 Parabéns! Você completou todas as etapas do processo!
            </span>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            stepNumber={index + 1}
            isExpanded={expandedSteps.has(step.id)}
            onToggle={handleToggle}
            isCompleted={completedSteps.has(step.id)}
            onComplete={handleComplete}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <button
          onClick={() => setExpandedSteps(new Set(steps.map(s => s.id)))}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Expandir Todas as Etapas
        </button>
        <button
          onClick={() => setExpandedSteps(new Set())}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Recolher Todas as Etapas
        </button>
        <button
          onClick={() => setCompletedSteps(new Set())}
          className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Resetar Progresso
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Dicas para o Sucesso</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Siga as etapas na ordem apresentada para melhores resultados</li>
          <li>• Mantenha todos os documentos organizados e atualizados</li>
          <li>• Não hesite em buscar ajuda profissional quando necessário</li>
          <li>• Comece o processo com antecedência para evitar pressa</li>
        </ul>
      </div>
    </div>
  );
}
