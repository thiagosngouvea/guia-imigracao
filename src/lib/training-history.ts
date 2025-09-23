import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  updateDoc,
  addDoc 
} from 'firebase/firestore';
import { db } from './firebase';

// Função utilitária para remover campos undefined
const cleanObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }
  
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, cleanObject(value)])
    );
  }
  
  return obj;
};

// Types para o histórico de treinamento
export interface TrainingMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: any;
  isVoice?: boolean;
  isThinking?: boolean;
  // Não salvamos audioData no Firebase para economizar espaço
}

export interface TrainingSession {
  id: string;
  userId: string;
  scenarioId: string;
  scenarioName: string;
  visaType: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  language: 'pt' | 'en';
  interactionMode: 'text' | 'voice';
  startTime: any;
  endTime?: any;
  duration?: number; // em segundos
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  questionsAnswered: number;
  totalQuestions: number;
  completed: boolean;
  messages: TrainingMessage[];
  createdAt: any;
  updatedAt: any;
}

export interface TrainingStats {
  userId: string;
  totalSessions: number;
  totalDuration: number; // em segundos
  totalMessages: number;
  favoriteScenario?: string;
  favoriteVisaType?: string;
  averageSessionDuration: number;
  completedSessions: number;
  lastTrainingDate?: any;
  createdAt: any;
  updatedAt: any;
}

// Função para criar uma nova sessão de treinamento
export const createTrainingSession = async (
  userId: string,
  scenarioId: string,
  scenarioName: string,
  visaType: string,
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado',
  language: 'pt' | 'en',
  interactionMode: 'text' | 'voice'
): Promise<string> => {
  try {
    const sessionData: Omit<TrainingSession, 'id'> = {
      userId,
      scenarioId,
      scenarioName,
      visaType,
      difficulty,
      language,
      interactionMode,
      startTime: serverTimestamp(),
      totalMessages: 0,
      userMessages: 0,
      aiMessages: 0,
      questionsAnswered: 0,
      totalQuestions: 0,
      completed: false,
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'training_sessions'), cleanObject(sessionData));
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar sessão de treinamento:', error);
    throw new Error('Erro ao criar sessão de treinamento');
  }
};

// Função para adicionar uma mensagem à sessão
export const addMessageToSession = async (
  sessionId: string,
  message: Omit<TrainingMessage, 'id'>
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'training_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error('Sessão não encontrada');
    }

    const sessionData = sessionDoc.data() as TrainingSession;
    
    // Limpar campos undefined da mensagem
    const cleanMessage = cleanObject(message);
    
    const newMessage: TrainingMessage = {
      ...cleanMessage,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const updatedMessages = [...(sessionData.messages || []), newMessage];
    const totalMessages = updatedMessages.length;
    const userMessages = updatedMessages.filter(m => m.role === 'user').length;
    const aiMessages = updatedMessages.filter(m => m.role === 'ai' && !m.isThinking).length;

    const updateData = {
      messages: updatedMessages,
      totalMessages,
      userMessages,
      aiMessages,
      updatedAt: serverTimestamp()
    };

    await updateDoc(sessionRef, cleanObject(updateData));
  } catch (error) {
    console.error('Erro ao adicionar mensagem à sessão:', error);
    throw new Error('Erro ao adicionar mensagem à sessão');
  }
};

// Função para finalizar uma sessão de treinamento
export const finishTrainingSession = async (
  sessionId: string,
  questionsAnswered: number,
  totalQuestions: number,
  completed: boolean = true
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'training_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error('Sessão não encontrada');
    }

    const sessionData = sessionDoc.data() as TrainingSession;
    const endTime = new Date();
    const startTime = sessionData.startTime?.toDate() || endTime;
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const updateData = {
      endTime: serverTimestamp(),
      duration,
      questionsAnswered,
      totalQuestions,
      completed,
      updatedAt: serverTimestamp()
    };

    await updateDoc(sessionRef, cleanObject(updateData));

    // Atualizar estatísticas do usuário
    const updatedSessionData = { ...sessionData, duration, questionsAnswered, totalQuestions, completed };
    await updateUserTrainingStats(sessionData.userId, updatedSessionData);
  } catch (error) {
    console.error('Erro ao finalizar sessão de treinamento:', error);
    throw new Error('Erro ao finalizar sessão de treinamento');
  }
};

// Função para atualizar estatísticas do usuário
export const updateUserTrainingStats = async (
  userId: string,
  session: TrainingSession
): Promise<void> => {
  try {
    const statsRef = doc(db, 'training_stats', userId);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      const currentStats = statsDoc.data() as TrainingStats;
      
      const updatedStats: Partial<TrainingStats> = {
        totalSessions: currentStats.totalSessions + 1,
        totalDuration: currentStats.totalDuration + (session.duration || 0),
        totalMessages: currentStats.totalMessages + (session.totalMessages || 0),
        completedSessions: currentStats.completedSessions + (session.completed ? 1 : 0),
        averageSessionDuration: Math.floor(
          (currentStats.totalDuration + (session.duration || 0)) / 
          (currentStats.totalSessions + 1)
        ),
        lastTrainingDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Atualizar cenário favorito (mais usado)
      const userSessions = await getUserTrainingSessions(userId, 50);
      const scenarioCounts = userSessions.reduce((acc, s) => {
        if (s.scenarioId) {
          acc[s.scenarioId] = (acc[s.scenarioId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const favoriteScenario = Object.entries(scenarioCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      
      if (favoriteScenario) {
        updatedStats.favoriteScenario = favoriteScenario;
      }

      // Atualizar tipo de visto favorito
      const visaTypeCounts = userSessions.reduce((acc, s) => {
        if (s.visaType) {
          acc[s.visaType] = (acc[s.visaType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const favoriteVisaType = Object.entries(visaTypeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      
      if (favoriteVisaType) {
        updatedStats.favoriteVisaType = favoriteVisaType;
      }

      await updateDoc(statsRef, cleanObject(updatedStats));
    } else {
      // Criar novas estatísticas
      const newStats: TrainingStats = {
        userId,
        totalSessions: 1,
        totalDuration: session.duration || 0,
        totalMessages: session.totalMessages,
        favoriteScenario: session.scenarioId,
        favoriteVisaType: session.visaType,
        averageSessionDuration: session.duration || 0,
        completedSessions: session.completed ? 1 : 0,
        lastTrainingDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(statsRef, cleanObject(newStats));
    }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do usuário:', error);
    throw new Error('Erro ao atualizar estatísticas do usuário');
  }
};

// Função para obter sessões de treinamento do usuário
export const getUserTrainingSessions = async (
  userId: string,
  limitCount: number = 20
): Promise<TrainingSession[]> => {
  try {
    const q = query(
      collection(db, 'training_sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const sessions: TrainingSession[] = [];

    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      } as TrainingSession);
    });

    return sessions;
  } catch (error) {
    console.error('Erro ao obter sessões de treinamento:', error);
    throw new Error('Erro ao obter sessões de treinamento');
  }
};

// Função para obter uma sessão específica
export const getTrainingSession = async (sessionId: string): Promise<TrainingSession | null> => {
  try {
    const sessionDoc = await getDoc(doc(db, 'training_sessions', sessionId));
    
    if (sessionDoc.exists()) {
      return {
        id: sessionDoc.id,
        ...sessionDoc.data()
      } as TrainingSession;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter sessão de treinamento:', error);
    return null;
  }
};

// Função para obter estatísticas do usuário
export const getUserTrainingStats = async (userId: string): Promise<TrainingStats | null> => {
  try {
    const statsDoc = await getDoc(doc(db, 'training_stats', userId));
    
    if (statsDoc.exists()) {
      return statsDoc.data() as TrainingStats;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter estatísticas de treinamento:', error);
    return null;
  }
};

// Função para obter sessões por tipo de visto
export const getSessionsByVisaType = async (
  userId: string,
  visaType: string,
  limitCount: number = 10
): Promise<TrainingSession[]> => {
  try {
    const q = query(
      collection(db, 'training_sessions'),
      where('userId', '==', userId),
      where('visaType', '==', visaType),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const sessions: TrainingSession[] = [];

    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      } as TrainingSession);
    });

    return sessions;
  } catch (error) {
    console.error('Erro ao obter sessões por tipo de visto:', error);
    throw new Error('Erro ao obter sessões por tipo de visto');
  }
};

// Função para deletar uma sessão (se necessário)
export const deleteTrainingSession = async (sessionId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'training_sessions', sessionId), {
      deleted: true,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao deletar sessão de treinamento:', error);
    throw new Error('Erro ao deletar sessão de treinamento');
  }
};
