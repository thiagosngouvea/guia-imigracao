import { useState, useEffect } from 'react';
import { InteractiveTraining } from './InteractiveTraining';
import { Button } from './ui/Button';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  isThinking?: boolean;
  audioData?: string;
}

interface InterviewScenario {
  id: string;
  name: string;
  description: string;
  visaType: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  questions: {
    pt: string[];
    en: string[];
  };
}

type InteractionMode = 'text' | 'voice' | 'realtime';

interface RealtimeTrainingProps {
  scenario: InterviewScenario;
  language: 'pt' | 'en';
  interactionMode: InteractionMode;
  currentQuestionIndex: number;
  currentSessionId: string | null;
  onMessageSaved: (message: Message) => Promise<void>;
  onQuestionIndexChange: (index: number) => void;
  onLanguageChange: (language: 'pt' | 'en') => void;
  onInteractionModeChange: (mode: InteractionMode) => void;
  onFinishTraining: () => void;
  isSavingSession: boolean;
}

export function RealtimeTraining({
  scenario,
  language,
  interactionMode,
  currentQuestionIndex,
  currentSessionId,
  onMessageSaved,
  onQuestionIndexChange,
  onLanguageChange,
  onInteractionModeChange,
  onFinishTraining,
  isSavingSession
}: RealtimeTrainingProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {scenario.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Pergunta {currentQuestionIndex + 1} de {scenario.questions[language].length}
                {currentSessionId && (
                  <span className="ml-2 text-xs text-green-600">
                    • Sessão sendo salva automaticamente
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Controles de idioma */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onLanguageChange('pt')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'pt' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  🇧🇷 PT
                </button>
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  🇺🇸 EN
                </button>
              </div>
              
              {/* Controles de modo */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onInteractionModeChange('text')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    interactionMode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  📝 Texto
                </button>
                <button
                  onClick={() => onInteractionModeChange('voice')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    interactionMode === 'voice' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  🎤 Voz
                </button>
                <button
                  onClick={() => onInteractionModeChange('realtime')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    interactionMode === 'realtime' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  ⚡ Tempo Real
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {isSavingSession && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Salvando...
                  </div>
                )}
                <Button variant="outline" onClick={onFinishTraining}>
                  Finalizar Treino
                </Button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / scenario.questions[language].length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Pergunta Atual */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {language === 'pt' ? 'Pergunta Atual:' : 'Current Question:'}
            </h3>
            <p className="text-blue-800">
              {scenario.questions[language][currentQuestionIndex] || 
               (language === 'pt' ? 'Entrevista concluída!' : 'Interview completed!')}
            </p>
          </div>

          {/* Informações do Modo */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${interactionMode === 'text' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100'} border`}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">📝</span>
                <div>
                  <h4 className="font-medium">Modo Texto</h4>
                  <p className="text-xs text-gray-600">Chat tradicional via teclado</p>
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${interactionMode === 'voice' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100'} border`}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎤</span>
                <div>
                  <h4 className="font-medium">Modo Voz</h4>
                  <p className="text-xs text-gray-600">Gravação + transcrição + síntese</p>
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${interactionMode === 'realtime' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100'} border`}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">⚡</span>
                <div>
                  <h4 className="font-medium">Tempo Real</h4>
                  <p className="text-xs text-gray-600">Conversação instantânea</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <InteractiveTraining
          scenario={scenario}
          language={language}
          interactionMode={interactionMode}
          currentQuestionIndex={currentQuestionIndex}
          onMessageSaved={onMessageSaved}
          onQuestionIndexChange={onQuestionIndexChange}
          onInteractionModeChange={onInteractionModeChange}
        />
      </div>
    </div>
  );
}
