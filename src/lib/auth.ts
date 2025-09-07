import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    FacebookAuthProvider,
    sendPasswordResetEmail,
    onAuthStateChanged,
    NextOrObserver,
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
  import { auth, db } from './firebase';
  
// Types
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  createdAt: any;
  lastLoginAt: any;
  recommendedVisa?: string;
  selectedVisa?: string; // Novo campo para o visto escolhido pelo usuário
  completedQuiz?: boolean;
  interviewsPracticed?: number;
  photoURL?: string;
  quizAnswers?: Record<string, string>;
  quizScores?: Record<string, number>;
  // Subscription fields
  isAdmin?: boolean;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  subscriptionEndDate?: any;
  planType?: 'monthly' | 'yearly';
}
  
  export interface AuthError {
    code: string;
    message: string;
  }
  
  // Auth functions
  export const signUp = async (email: string, password: string, name: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Update the user's display name
      await updateProfile(user, { displayName: name });
  
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name: name,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        completedQuiz: false,
        interviewsPracticed: 0,
      };
  
      await setDoc(doc(db, 'users', user.uid), userProfile);
  
      return user;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };
  
  export const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
      });
  
      return user;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };
  
  export const signInWithGoogle = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
  
      // Check if user profile exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          name: user.displayName || 'Usuário',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          completedQuiz: false,
          interviewsPracticed: 0,
          photoURL: user.photoURL || undefined,
        };
        await setDoc(doc(db, 'users', user.uid), userProfile);
      } else {
        // Update last login time
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp(),
        });
      }
  
      return user;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };
  
  export const signInWithFacebook = async (): Promise<User> => {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
  
      // Check if user profile exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          name: user.displayName || 'Usuário',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          completedQuiz: false,
          interviewsPracticed: 0,
          photoURL: user.photoURL || undefined,
        };
        await setDoc(doc(db, 'users', user.uid), userProfile);
      } else {
        // Update last login time
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp(),
        });
      }
  
      return user;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };
  
  export const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch {
      throw new Error('Erro ao fazer logout');
    }
  };
  
  export const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };
  
  // Get user profile from Firestore
  export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };
  
  // Update user profile
  export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Erro ao atualizar perfil');
    }
  };
  
  // Auth state observer
  export const onAuthStateChange = (callback: NextOrObserver<User>) => {
    return onAuthStateChanged(auth, callback);
  };
  
  // Error message helper
  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/email-already-in-use':
        return 'Este email já está sendo usado';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet';
      case 'auth/popup-closed-by-user':
        return 'Login cancelado';
      case 'auth/cancelled-popup-request':
        return 'Login cancelado';
      case 'auth/account-exists-with-different-credential':
        return 'Conta já existe com credencial diferente';
      case 'auth/auth-domain-config-required':
        return 'Erro de configuração';
      case 'auth/credential-already-in-use':
        return 'Credencial já está em uso';
      case 'auth/operation-not-supported-in-this-environment':
        return 'Operação não suportada neste ambiente';
      case 'auth/timeout':
        return 'Tempo limite excedido';
      case 'auth/missing-android-pkg-name':
        return 'Erro de configuração Android';
      case 'auth/missing-continue-uri':
        return 'URL de continuação necessária';
      case 'auth/missing-ios-bundle-id':
        return 'Erro de configuração iOS';
      case 'auth/invalid-continue-uri':
        return 'URL de continuação inválida';
      case 'auth/unauthorized-continue-uri':
        return 'URL de continuação não autorizada';
      default:
        return 'Erro inesperado. Tente novamente';
    }
  };