import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile,
    updateEmail,
    updatePassword,
    sendPasswordResetEmail,
    User as FirebaseUser,
    UserCredential
  } from "firebase/auth";
  import { auth, db, storage } from "@/lib/firebase";
  import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  
  export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }
  
  /**
   * Crée un nouvel utilisateur avec email et mot de passe
   */
  export const registerUser = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<UserProfile> => {
    try {
      // Création du compte utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Mise à jour du profil avec le nom d'affichage
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Création du document utilisateur dans Firestore
      const userProfile = {
        id: user.uid,
        email: user.email || email,
        firstName,
        lastName,
        profilePicture: user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", user.uid), userProfile);
      
      return {
        id: user.uid,
        email: user.email || email,
        firstName,
        lastName,
        profilePicture: user.photoURL || ''
      };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  };
  
  /**
   * Connecte un utilisateur avec email et mot de passe
   */
  export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Récupération des données utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserProfile, 'id'>;
        return {
          id: user.uid,
          ...userData
        };
      } else {
        // Si le document n'existe pas, on crée un profil basique
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const userProfile = {
          id: user.uid,
          email: user.email || email,
          firstName,
          lastName,
          profilePicture: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "users", user.uid), userProfile);
        
        return {
          id: user.uid,
          email: user.email || email,
          firstName,
          lastName,
          profilePicture: user.photoURL || ''
        };
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };
  
  /**
   * Déconnecte l'utilisateur courant
   */
  export const logoutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  };
  
  /**
   * Met à jour le profil utilisateur
   */
  export const updateUserProfile = async (
    userId: string, 
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Utilisateur non connecté");
      
      const updates: Partial<UserProfile & { updatedAt: string }> = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      // Mise à jour du document Firestore
      await updateDoc(doc(db, "users", userId), updates);
      
      // Mise à jour du profil Firebase Auth si nécessaire
      if (profileData.firstName || profileData.lastName) {
        const firstName = profileData.firstName || '';
        const lastName = profileData.lastName || '';
        const currentDoc = await getDoc(doc(db, "users", userId));
        const currentData = currentDoc.data() as any;
        
        await updateProfile(user, {
          displayName: `${profileData.firstName || currentData.firstName} ${profileData.lastName || currentData.lastName}`
        });
      }
      
      // Mise à jour de l'email si fourni
      if (profileData.email && profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
      }
      
      // Récupération du profil mis à jour
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.data() as Omit<UserProfile, 'id'>;
      
      return {
        id: userId,
        ...userData
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  };
  
  /**
   * Met à jour le mot de passe de l'utilisateur
   */
  export const updateUserPassword = async (newPassword: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Utilisateur non connecté");
      
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      throw error;
    }
  };
  
  /**
   * Télécharge une photo de profil et met à jour le profil utilisateur
   */
  export const uploadProfilePicture = async (
    userId: string, 
  file: File
): Promise<string> => {
  try {
    // 1. Créer une référence de stockage
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile_pictures/${userId}/${fileName}`);
    
    // 2. Télécharger le fichier
    const snapshot = await uploadBytes(storageRef, file);
    
    // 3. Obtenir l'URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // 4. Mettre à jour uniquement Firestore (pas Firebase Auth)
    await updateDoc(doc(db, "users", userId), {
      profilePicture: downloadURL,
      updatedAt: new Date().toISOString()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Erreur de téléchargement:", error);
    throw error;
  }
};
  
  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  export const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de réinitialisation:", error);
      throw error;
    }
  };
  
  /**
   * Récupère le profil utilisateur courant
   */
  export const getCurrentUser = async (): Promise<UserProfile | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserProfile, 'id'>;
        return {
          id: user.uid,
          ...userData
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil utilisateur:", error);
      throw error;
    }
  };