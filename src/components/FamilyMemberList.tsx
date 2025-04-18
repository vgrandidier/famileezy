import React, { useState } from 'react';
import { User, UserPlus, Pencil, Trash2, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import FamilyMemberDialog from './FamilyMemberDialog';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { featuresData } from '@/pages/FeaturePage';
import { ModulePermissions } from '@/services/familyService';

const FamilyMemberList = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    familyMembers, 
    currentFamily, 
    addMember, 
    updateMember, 
    removeMember, 
    sendInvitation,
    isLoading 
  } = useFamily();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [invitationSending, setInvitationSending] = useState<{[key: string]: boolean}>({});

  // Vérifier si l'utilisateur courant est le propriétaire de la famille
  const isOwner = user && currentFamily ? currentFamily.ownerId === user.id : false;

  const handleNewMember = () => {
    setSelectedMember(null);
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    // Interdire la suppression de son propre profil
    const memberToDelete = familyMembers.find(m => m.id === memberId);
    if (memberToDelete?.email === user?.email && memberToDelete.profile === 'parent') {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez pas supprimer votre propre compte.",
        variant: "destructive",
      });
      return;
    }

    try {
      await removeMember(memberId);
      toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer ce membre.",
        variant: "destructive",
      });
    }
  };

  const handleSendInvitation = async (memberId: string, email: string) => {
    setInvitationSending(prev => ({
      ...prev,
      [memberId]: true
    }));
    
    try {
      await sendInvitation(memberId);
      
      // Mettre à jour l'état
      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${email}.`,
      });
      
      // On garde l'icône de chargement un instant pour l'UX
      setTimeout(() => {
        setInvitationSending(prev => ({
          ...prev,
          [memberId]: false
        }));
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation.",
        variant: "destructive",
      });
      setInvitationSending(prev => ({
        ...prev,
        [memberId]: false
      }));
    }
  };

  // Gérer la sauvegarde d'un membre
  const handleSaveMember = async (memberData: any) => {
    try {
      if (selectedMember) {
        // MISE À JOUR: Vérification spéciale pour le compte utilisateur
        if (selectedMember.email === user?.email && selectedMember.profile === 'parent') {
          // Pour le membre propriétaire, on limite les champs à mettre à jour
          const safeUpdates = {
            firstName: memberData.firstName,
            lastName: memberData.lastName,
            profilePicture: memberData.profilePicture
          };
          
          console.log("Mise à jour limitée pour le propriétaire:", safeUpdates);
          await updateMember(selectedMember.id, safeUpdates);
        } else {
          // Pour les autres membres, mise à jour complète
          await updateMember(selectedMember.id, memberData);
        }
        
        toast({
          title: "Membre mis à jour",
          description: "Les informations du membre ont été mises à jour avec succès."
        });
      } else {
        // Ajout d'un nouveau membre
        await addMember(memberData);
        toast({
          title: "Membre ajouté",
          description: "Le nouveau membre a été ajouté avec succès."
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
      // Ne pas fermer le dialogue en cas d'erreur pour permettre de réessayer
    }
  };

  if (!currentFamily) {
    return (
      <div className="text-center py-8">
        <p>Veuillez sélectionner ou créer une famille pour voir ses membres.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Chargement des membres de la famille...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={handleNewMember} className="w-full sm:w-auto">
        <UserPlus className="mr-2 h-4 w-4" />
        Ajouter un membre
      </Button>

      <div className="grid gap-4 sm:gap-6">
        {familyMembers.map((member) => (
          <div
            key={member.id}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm border"
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.profilePicture} />
              <AvatarFallback>
                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-grow text-center sm:text-left">
              <h3 className="font-semibold">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {member.profile === 'parent' ? 'Parent' : 'Enfant'}
              </p>
              {member.email && (
                <p className="text-sm text-muted-foreground">{member.email}</p>
              )}
              {member.profile === 'child' && member.pocketMoney && (
                <p className="text-sm text-muted-foreground">
                  Argent de poche : {member.pocketMoney}€ {member.pocketMoneyFrequency === 'weekly' ? 'par semaine' : 'par mois'}
                </p>
              )}
              
              {/* Affichage des icônes de modules */}
              {member.profile === 'child' && member.modulePermissions && (
                <div className="flex flex-wrap gap-1 my-2">
                  <TooltipProvider>
                    {Object.entries(featuresData).map(([id, feature]) => {
                      const hasAccess = member.modulePermissions?.[id as keyof ModulePermissions];
                      
                      // Ne montrer que les modules autorisés
                      if (!hasAccess) return null;
                      
                      const Icon = feature.icon;
                      
                      return (
                        <Tooltip key={id}>
                          <TooltipTrigger asChild>
                            <div className="relative inline-block">
                              <div 
                                className="p-1 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: `${feature.color}20` }}
                              >
                                <Icon 
                                  size={16} 
                                  style={{ color: feature.color }} 
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t(`features.${id}.title`, feature.title)}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              {/* Ne pas afficher les boutons d'action pour les membres qui ne nous appartiennent pas */}
              {(isOwner || member.email === user?.email) && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditMember(member)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {/* Ne pas permettre de supprimer son propre profil parent */}
                  {!(member.email === user?.email && member.profile === 'parent') && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {member.email && !member.invitationAccepted && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSendInvitation(member.id, member.email!)}
                      disabled={member.invitationSent || invitationSending[member.id]}
                    >
                      {member.invitationSent || invitationSending[member.id] ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <FamilyMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveMember}
        member={selectedMember}
      />
    </div>
  );
};

export default FamilyMemberList;