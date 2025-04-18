import { 
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    Timestamp
  } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  
  // Types pour les permissions de modules
  export type ModulePermissions = {
    'pocket-money': boolean;
    'budget': boolean;
    'recipes': boolean;
    'solar': boolean;
    'calendar': boolean;
    'tasks': boolean;
  };
  
  // Type pour un membre de famille
  export interface FamilyMember {
    id: string;
    familyId: string;  // ID de la famille à laquelle appartient ce membre
    firstName: string;
    lastName: string;
    email?: string;
    profilePicture?: string;
    profile: 'parent' | 'child';
    pocketMoney?: string;
    pocketMoneyFrequency?: 'weekly' | 'monthly';
    modulePermissions?: ModulePermissions;
    createdAt: Timestamp | string;
    updatedAt: Timestamp | string;
    invitationSent?: boolean;
    invitationAccepted?: boolean;
  }
  
  // Type pour une famille
  export interface Family {
    id: string;
    name: string;
    ownerId: string;  // ID de l'utilisateur qui a créé la famille
    createdAt: Timestamp | string;
    updatedAt: Timestamp | string;
  }
  
  /**
   * Crée une nouvelle famille
   */
  export const createFamily = async (userId: string, familyName: string): Promise<Family> => {
    try {
      const familyData = {
        name: familyName,
        ownerId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "families"), familyData);
      
      return {
        id: docRef.id,
        name: familyName,
        ownerId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erreur lors de la création de la famille:", error);
      throw error;
    }
  };
  
  /**
   * Récupère une famille par son ID
   */
  export const getFamilyById = async (familyId: string): Promise<Family | null> => {
    try {
      const docRef = doc(db, "families", familyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          ownerId: data.ownerId,
          createdAt: data.createdAt?.toDate?.() 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt
        };
      }
      
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de la famille:", error);
      throw error;
    }
  };
  
  /**
   * Récupère toutes les familles dont l'utilisateur est membre
   */
  export const getUserFamilies = async (userId: string): Promise<Family[]> => {
    try {
      // Trouver les familles dont l'utilisateur est propriétaire
      const ownedFamiliesQuery = query(
        collection(db, "families"),
        where("ownerId", "==", userId)
      );
      
      const ownedFamiliesSnapshot = await getDocs(ownedFamiliesQuery);
      const ownedFamilies = ownedFamiliesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() 
          ? doc.data().createdAt.toDate().toISOString() 
          : doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() 
          ? doc.data().updatedAt.toDate().toISOString() 
          : doc.data().updatedAt
      })) as Family[];
      
      // Trouver les membres de famille associés à l'utilisateur (via email)
      const userDoc = await getDoc(doc(db, "users", userId));
      const userEmail = userDoc.exists() ? userDoc.data().email : null;
      
      if (!userEmail) return ownedFamilies;
      
      // Rechercher les membres de famille avec cet email
      const membershipQuery = query(
        collection(db, "familyMembers"),
        where("email", "==", userEmail),
        where("invitationAccepted", "==", true)
      );
      
      const membershipSnapshot = await getDocs(membershipQuery);
      
      // Récupérer les IDs des familles
      const familyIds = membershipSnapshot.docs.map(doc => doc.data().familyId);
      
      // Si l'utilisateur n'est membre d'aucune autre famille
      if (familyIds.length === 0) return ownedFamilies;
      
      // Récupérer les détails des familles dont l'utilisateur est membre
      const memberFamilies: Family[] = [];
      
      for (const familyId of familyIds) {
        const familyDoc = await getDoc(doc(db, "families", familyId));
        
        if (familyDoc.exists()) {
          const data = familyDoc.data();
          memberFamilies.push({
            id: familyDoc.id,
            name: data.name,
            ownerId: data.ownerId,
            createdAt: data.createdAt?.toDate?.() 
              ? data.createdAt.toDate().toISOString() 
              : data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() 
              ? data.updatedAt.toDate().toISOString() 
              : data.updatedAt
          });
        }
      }
      
      // Combiner et dédupliquer les familles
      const allFamilies = [...ownedFamilies, ...memberFamilies];
      const uniqueFamilies = Array.from(new Map(allFamilies.map(family => [family.id, family])).values());
      
      return uniqueFamilies;
    } catch (error) {
      console.error("Erreur lors de la récupération des familles de l'utilisateur:", error);
      throw error;
    }
  };
  
  /**
   * Ajoute un membre à une famille
   */
  export const addFamilyMember = async (
    familyId: string,
    memberData: Omit<FamilyMember, 'id' | 'familyId' | 'createdAt' | 'updatedAt'>
  ): Promise<FamilyMember> => {
    try {
      const newMember = {
        ...memberData,
        familyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        invitationSent: false,
        invitationAccepted: false
      };
      
      // Si c'est le propriétaire qui s'ajoute lui-même comme membre parent
      if (memberData.profile === 'parent') {
        const familyDoc = await getDoc(doc(db, "families", familyId));
        if (familyDoc.exists() && familyDoc.data().ownerId === memberData.email) {
          newMember.invitationAccepted = true;
        }
      }
      
      const docRef = await addDoc(collection(db, "familyMembers"), newMember);
      
      return {
        id: docRef.id,
        familyId,
        ...memberData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout du membre à la famille:", error);
      throw error;
    }
  };
  
  /**
   * Met à jour un membre de famille
   */
  export const updateFamilyMember = async (
    memberId: string,
    updates: Partial<Omit<FamilyMember, 'id' | 'familyId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    try {
      const memberRef = doc(db, "familyMembers", memberId);
      
      await updateDoc(memberRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du membre de famille:", error);
      throw error;
    }
  };
  
  /**
   * Supprime un membre de famille
   */
  export const deleteFamilyMember = async (memberId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "familyMembers", memberId));
    } catch (error) {
      console.error("Erreur lors de la suppression du membre de famille:", error);
      throw error;
    }
  };
  
  /**
   * Récupère tous les membres d'une famille
   */
  export const getFamilyMembers = async (familyId: string): Promise<FamilyMember[]> => {
    try {
      const q = query(
        collection(db, "familyMembers"),
        where("familyId", "==", familyId)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          familyId: data.familyId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          profilePicture: data.profilePicture,
          profile: data.profile,
          pocketMoney: data.pocketMoney,
          pocketMoneyFrequency: data.pocketMoneyFrequency,
          modulePermissions: data.modulePermissions,
          createdAt: data.createdAt?.toDate?.() 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt,
          invitationSent: data.invitationSent,
          invitationAccepted: data.invitationAccepted
        };
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des membres de la famille:", error);
      throw error;
    }
  };
  
  /**
   * Marque une invitation comme envoyée
   */
  export const sendMemberInvitation = async (memberId: string): Promise<void> => {
    try {
      const memberRef = doc(db, "familyMembers", memberId);
      
      await updateDoc(memberRef, {
        invitationSent: true,
        updatedAt: serverTimestamp()
      });
      
      // Note: Dans une implémentation réelle, envoyez un email d'invitation ici
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error);
      throw error;
    }
  };
  
  /**
   * Accepte une invitation à rejoindre une famille
   */
  export const acceptFamilyInvitation = async (
    memberId: string,
    userId: string
  ): Promise<void> => {
    try {
      const memberRef = doc(db, "familyMembers", memberId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error("Invitation non trouvée");
      }
      
      // Vérifier que l'invitation a bien été envoyée
      const memberData = memberDoc.data();
      if (!memberData.invitationSent) {
        throw new Error("L'invitation n'a pas encore été envoyée");
      }
      
      // Lier ce membre au compte utilisateur
      await updateDoc(memberRef, {
        userId: userId,
        invitationAccepted: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error);
      throw error;
    }
  };