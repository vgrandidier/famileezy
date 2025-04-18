import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  updateUserProfile, 
  uploadProfilePicture, 
  updateUserPassword, 
  UserProfile
} from '@/services/authService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<UserProfile>) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Observer pour les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        // L'utilisateur est connecté
        try {
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await import('@/services/authService').then(
            module => module.getCurrentUser()
          );
          
          if (userDoc) {
            setUser(userDoc);
            setFirebaseUser(firebaseUser);
            setIsAuthenticated(true);
          } else {
            // Document utilisateur non trouvé, on déconnecte l'utilisateur
            await logoutUser();
            setUser(null);
            setFirebaseUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil:", error);
          setUser(null);
          setFirebaseUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // L'utilisateur n'est pas connecté
        setUser(null);
        setFirebaseUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    });
    
    // Nettoyer l'observer lors du démontage du composant
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userProfile = await loginUser(email, password);
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const userProfile = await registerUser(email, password, firstName, lastName);
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<UserProfile>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedProfile = await updateUserProfile(user.id, userData);
      setUser(updatedProfile);
    } catch (error) {
      console.error("Erreur de mise à jour du profil:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      await updateUserPassword(newPassword);
    } catch (error) {
      console.error("Erreur de mise à jour du mot de passe:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Dans la fonction handleUploadProfilePicture du AuthContext
  const handleUploadProfilePicture = async (file: File) => {
    if (!user) throw new Error("Utilisateur non connecté");
    
    setIsLoading(true);
    try {
      // Utiliser la version simplifiée à la place
      const photoURL = await uploadProfilePicture(user.id, file);
      
      // Mettre à jour l'état local directement
      setUser({
        ...user,
        profilePicture: photoURL
      });
      
      return photoURL;
    } catch (error) {
      console.error("Erreur lors du téléchargement de la photo:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        uploadProfilePicture: handleUploadProfilePicture,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};