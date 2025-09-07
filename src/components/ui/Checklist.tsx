import { useState } from 'react';
import { DocumentItem } from '../../lib/visa-documents';

interface ChecklistProps {
  documents: DocumentItem[];
  onProgressChange?: (completed: number, total: number) => void;
}

interface ChecklistItemProps {
  document: DocumentItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
  onExpand: (id: string) => void;
  isExpanded: boolean;
}

const categoryIcons = {
  personal: '👤',
  financial: '💰',
  educational: '🎓',
  professional: '💼',
  legal: '📋',
  travel: '✈️'
};

const categoryNames = {
  personal: 'Pessoal',
  financial: 'Financeiro',
  educational: 'Educacional',
  professional: 'Profissional',
  legal: 'Legal',
  travel: 'Viagem'
};

function ChecklistItem({ document, isChecked, onToggle, onExpand, isExpanded }: ChecklistItemProps) {
  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isChecked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(document.id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isChecked 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {isChecked && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{categoryIcons[document.category]}</span>
              <h3 className={`font-medium ${isChecked ? 'text-green-800' : 'text-gray-900'}`}>
                {document.name}
                {document.required && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Obrigatório
                  </span>
                )}
              </h3>
            </div>
            
            <button
              onClick={() => onExpand(document.id)}
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
          
          <p className={`text-sm mt-1 ${isChecked ? 'text-green-700' : 'text-gray-600'}`}>
            {document.description}
          </p>
          
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {categoryNames[document.category]}
            </span>
          </div>
          
          {isExpanded && (
            <div className="mt-4 space-y-4 border-t pt-4">
              {/* Como Obter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📋 Como Obter:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  {document.howToObtain.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              
              {/* Como Preencher */}
              {document.howToFill && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">✍️ Como Preencher:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {document.howToFill.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Dicas */}
              {document.tips && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">💡 Dicas Importantes:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {document.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Exemplos */}
              {document.examples && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📄 Exemplos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {document.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Checklist({ documents, onProgressChange }: ChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(id)) {
      newCheckedItems.delete(id);
    } else {
      newCheckedItems.add(id);
    }
    setCheckedItems(newCheckedItems);
    
    if (onProgressChange) {
      onProgressChange(newCheckedItems.size, documents.length);
    }
  };

  const handleExpand = (id: string) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(id)) {
      newExpandedItems.delete(id);
    } else {
      newExpandedItems.add(id);
    }
    setExpandedItems(newExpandedItems);
  };

  const requiredDocuments = documents.filter(doc => doc.required);
  const optionalDocuments = documents.filter(doc => !doc.required);
  
  const completedRequired = requiredDocuments.filter(doc => checkedItems.has(doc.id)).length;
  const completedOptional = optionalDocuments.filter(doc => checkedItems.has(doc.id)).length;
  
  const progressPercentage = documents.length > 0 ? (checkedItems.size / documents.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-blue-900">Progresso dos Documentos</h3>
          <span className="text-sm text-blue-700">
            {checkedItems.size} de {documents.length} completos
          </span>
        </div>
        
        <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Obrigatórios:</span>
            <span className={`ml-2 font-medium ${
              completedRequired === requiredDocuments.length ? 'text-green-600' : 'text-blue-900'
            }`}>
              {completedRequired}/{requiredDocuments.length}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Opcionais:</span>
            <span className="ml-2 font-medium text-blue-900">
              {completedOptional}/{optionalDocuments.length}
            </span>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      {requiredDocuments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-red-500 mr-2">*</span>
            Documentos Obrigatórios
          </h3>
          <div className="space-y-3">
            {requiredDocuments.map((document) => (
              <ChecklistItem
                key={document.id}
                document={document}
                isChecked={checkedItems.has(document.id)}
                onToggle={handleToggle}
                onExpand={handleExpand}
                isExpanded={expandedItems.has(document.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Documents */}
      {optionalDocuments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Documentos Opcionais
          </h3>
          <div className="space-y-3">
            {optionalDocuments.map((document) => (
              <ChecklistItem
                key={document.id}
                document={document}
                isChecked={checkedItems.has(document.id)}
                onToggle={handleToggle}
                onExpand={handleExpand}
                isExpanded={expandedItems.has(document.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <button
          onClick={() => setExpandedItems(new Set(documents.map(d => d.id)))}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Expandir Todos
        </button>
        <button
          onClick={() => setExpandedItems(new Set())}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Recolher Todos
        </button>
        <button
          onClick={() => setCheckedItems(new Set())}
          className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Limpar Seleção
        </button>
      </div>
    </div>
  );
}
