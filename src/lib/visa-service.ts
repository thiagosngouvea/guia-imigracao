import { doc, setDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

// ============================================================
// Types
// ============================================================

export interface QuestionnaireData {
  // Informações pessoais
  fullName: string;
  age: number;
  nationality: string;

  // Formação
  education: 'high-school' | 'bachelor' | 'master' | 'phd';
  fieldOfStudy: string;

  // Profissão
  occupation: string;
  yearsOfExperience: number;
  currentSalary: number;

  // Idiomas
  englishLevel: 'none' | 'basic' | 'intermediate' | 'advanced' | 'fluent';
  otherLanguages: string[];

  // Objetivos
  destinationCountries: string[];
  immigrationGoal: 'work' | 'study' | 'investment' | 'family' | 'other';
  timeframe: 'immediate' | '6-months' | '1-year' | '2-years';

  // Situação financeira
  savings: number;
  willingToInvest: number;

  // Outros
  hasFamily: boolean;
  hasJobOffer: boolean;
  hasCriminalRecord: boolean;
}

export interface VisaRecommendation {
  visaType: string;
  country: string;
  compatibility: number;
  processingTime: string;
  estimatedCost: number;
  requirements: string[];
  pros: string[];
  cons: string[];
  description: string;
}

export interface VisaAnalysisResult {
  recommendations: VisaRecommendation[];
  profileSummary: string;
  generatedAt: Date;
}

// ============================================================
// Serviços
// ============================================================

/**
 * Salva o questionário no Firestore e atualiza o perfil do usuário.
 * O documento é salvo em questionnaires/{userId} (mesmo schema do App).
 */
export async function saveQuestionnaire(userId: string, data: QuestionnaireData): Promise<void> {
  await setDoc(doc(db, 'questionnaires', userId), {
    ...data,
    submittedAt: serverTimestamp(),
  });

  // Atualiza perfil do usuário com campos básicos do questionário
  await setDoc(doc(db, 'users', userId), {
    hasCompletedQuestionnaire: true,
    fullName: data.fullName,
    age: data.age,
    nationality: data.nationality,
    occupation: data.occupation,
    immigrationGoal: data.immigrationGoal,
    questionnaireCompletedAt: serverTimestamp(),
    // Compatibilidade com campo legado
    completedQuiz: true,
  }, { merge: true });
}

/**
 * Busca o questionário salvo de um usuário.
 */
export async function getQuestionnaire(userId: string): Promise<QuestionnaireData | null> {
  try {
    const snap = await getDoc(doc(db, 'questionnaires', userId));
    if (snap.exists()) return snap.data() as QuestionnaireData;
    return null;
  } catch {
    return null;
  }
}

/**
 * Chama a Cloud Function "analyzeVisaProfile" (mesma do App) para análise com OpenAI.
 */
export async function analyzeProfile(
  userId: string,
  questionnaireData: QuestionnaireData
): Promise<VisaAnalysisResult> {
  const analyzeProfileFn = httpsCallable(functions, 'analyzeVisaProfile');
  const result = await analyzeProfileFn({ userId, questionnaireData });
  const analysisResult = result.data as VisaAnalysisResult;

  // Salva o resultado da análise
  await saveAnalysisResult(userId, analysisResult);
  return analysisResult;
}

/**
 * Salva o resultado da análise em analysisResults/{userId}.
 * Usamos setDoc com o userId como ID para facilitar a leitura depois.
 */
async function saveAnalysisResult(userId: string, result: VisaAnalysisResult): Promise<void> {
  try {
    // Salva com o userId como doc ID (facilita leitura)
    await setDoc(doc(db, 'analysisResults', userId), {
      userId,
      ...result,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error saving analysis result:', err);
    // Fallback: salva com addDoc (ID automático)
    try {
      await addDoc(collection(db, 'analysisResults'), {
        userId,
        ...result,
        createdAt: serverTimestamp(),
      });
    } catch (err2) {
      console.error('Error saving analysis result (fallback):', err2);
    }
  }
}

/**
 * Busca o resultado de análise de um usuário.
 */
export async function getAnalysisResult(userId: string): Promise<VisaAnalysisResult | null> {
  try {
    const snap = await getDoc(doc(db, 'analysisResults', userId));
    if (snap.exists()) return snap.data() as VisaAnalysisResult;
    return null;
  } catch {
    return null;
  }
}
