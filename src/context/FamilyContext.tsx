import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  Family, 
  FamilyMember,
  createFamily, 
  getUserFamilies, 
  getFamilyMembers, 
  addFamilyMember, 
  updateFamilyMember, 
  deleteFamilyMember,
  sendMemberInvitation
} from '@/services/familyService';
import { useToast } from "@/hooks/use-toast";

interface FamilyContextType {
  currentFamily: Family | null;
  families: Family[];
  familyMembers: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  setCurrentFamily: (family: Family | null) => void;
  createNewFamily: (name: string) => Promise<Family>;
  addMember: (memberData: Omit<FamilyMember, 'id' | 'familyId' | 'createdAt' | 'updatedAt'>) => Promise<FamilyMember>;
  updateMember: (memberId: string, updates: Partial<FamilyMember>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  sendInvitation: (memberId: string) => Promise<void>;
  refreshFamilyMembers: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les familles de l'utilisateur
  useEffect(() => {
    const loadFamilies = async () => {
      if (!isAuthenticated || !user) {
        setFamilies([]);
        setCurrentFamily(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userFamilies = await getUserFamilies(user.id);
        setFamilies(userFamilies);

        // S'il y a des familles mais aucune n'est sélectionnée, sélectionner la première
        if (userFamilies.length > 0 && !currentFamily) {
          setCurrentFamily(userFamilies[0]);
        }
        // Si la famille actuelle n'existe plus dans la liste, réinitialiser
        else if (currentFamily && !userFamilies.find(f => f.id === currentFamily.id)) {
          setCurrentFamily(userFamilies.length > 0 ? userFamilies[0] : null);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des familles:', err);
        setError('Impossible de charger vos familles. Veuillez réessayer.');
        toast({
          title: "Erreur",
          description: "Impossible de charger vos familles. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilies();
  }, [isAuthenticated, user]);

  // Charger les membres de la famille actuelle
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (!currentFamily) {
        setFamilyMembers([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const members = await getFamilyMembers(currentFamily.id);
        setFamilyMembers(members);
      } catch (err) {
        console.error('Erreur lors du chargement des membres de la famille:', err);
        setError('Impossible de charger les membres de la famille. Veuillez réessayer.');
        toast({
          title: "Erreur",
          description: "Impossible de charger les membres de la famille. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilyMembers();
  }, [currentFamily]);

  // Fonction pour créer une nouvelle famille
  const createNewFamily = async (name: string): Promise<Family> => {
    if (!user) {
      throw new Error('Vous devez être connecté pour créer une famille.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const newFamily = await createFamily(user.id, name);
      setFamilies([...families, newFamily]);
      setCurrentFamily(newFamily);
      
      // Ajouter automatiquement l'utilisateur comme parent
      await addFamilyMember(newFamily.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        profile: 'parent',
      });
      
      toast({
        title: "Famille créée",
        description: `La famille "${name}" a été créée avec succès.`,
      });
      
      return newFamily;
    } catch (err) {
      console.error('Erreur lors de la création de la famille:', err);
      const errorMessage = 'Impossible de créer la famille. Veuillez réessayer.';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour ajouter un membre à la famille
  const addMember = async (
    memberData: Omit<FamilyMember, 'id' | 'familyId' | 'createdAt' | 'updatedAt'>
  ): Promise<FamilyMember> => {
    if (!currentFamily) {
      throw new Error('Aucune famille sélectionnée.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const newMember = await addFamilyMember(currentFamily.id, memberData);
      setFamilyMembers([...familyMembers, newMember]);
      
      toast({
        title: "Membre ajouté",
        description: `${newMember.firstName} ${newMember.lastName} a été ajouté à la famille.`,
      });
      
      return newMember;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du membre:', err);
      const errorMessage = 'Impossible d\'ajouter le membre à la famille. Veuillez réessayer.';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour mettre à jour un membre
  const updateMember = async (
    memberId: string, 
    updates: Partial<FamilyMember>
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await updateFamilyMember(memberId, updates);
      // Mettre à jour l'état local
      setFamilyMembers(
        familyMembers.map(member => 
          member.id === memberId ? { ...member, ...updates } : member
        )
      );
      
      toast({
        title: "Membre mis à jour",
        description: "Les informations du membre ont été mises à jour avec succès.",
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour du membre:', err);
      const errorMessage = 'Impossible de mettre à jour le membre. Veuillez réessayer.';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour supprimer un membre
  const removeMember = async (memberId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteFamilyMember(memberId);
      // Mettre à jour l'état local
      setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
      
      toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé de la famille.",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du membre:', err);
      const errorMessage = 'Impossible de supprimer le membre. Veuillez réessayer.';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer une invitation à un membre
  const sendInvitation = async (memberId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await sendMemberInvitation(memberId);
      // Mettre à jour l'état local
      setFamilyMembers(
        familyMembers.map(member => 
          member.id === memberId ? { ...member, invitationSent: true } : member
        )
      );
      
      const member = familyMembers.find(m => m.id === memberId);
      
      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${member?.email || 'ce membre'}.`,
      });
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', err);
      const errorMessage = 'Impossible d\'envoyer l\'invitation. Veuillez réessayer.';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour rafraîchir la liste des membres
  const refreshFamilyMembers = async (): Promise<void> => {
    if (!currentFamily) return;

    setIsLoading(true);
    setError(null);

    try {
      const members = await getFamilyMembers(currentFamily.id);
      setFamilyMembers(members);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des membres:', err);
      setError('Impossible de rafraîchir les membres. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FamilyContext.Provider
      value={{
        currentFamily,
        families,
        familyMembers,
        isLoading,
        error,
        setCurrentFamily,
        createNewFamily,
        addMember,
        updateMember,
        removeMember,
        sendInvitation,
        refreshFamilyMembers
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = (): FamilyContextType => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};