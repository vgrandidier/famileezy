import React, { useState } from 'react';
import { User, UserPlus, Pencil, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FamilyMemberDialog from './FamilyMemberDialog';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  profile: 'parent' | 'child';
  pocketMoney?: string;
  pocketMoneyFrequency?: 'weekly' | 'monthly';
}

interface FamilyMemberListProps {
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
}

const FamilyMemberList = ({ currentUser }: FamilyMemberListProps) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      profilePicture: currentUser.profilePicture,
      profile: 'parent',
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const handleNewMember = () => {
    setSelectedMember(null);
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleDeleteMember = (memberId: string) => {
    if (memberId === currentUser.id) {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez pas supprimer votre propre compte.",
        variant: "destructive",
      });
      return;
    }
    setMembers(members.filter(m => m.id !== memberId));
    toast({
      title: "Membre supprimé",
      description: "Le membre a été supprimé de la famille.",
    });
  };

  const handleSendInvitation = (email: string) => {
    toast({
      title: "Invitation envoyée",
      description: `Une invitation a été envoyée à ${email}`,
    });
  };

  const onSaveMember = (member: Omit<FamilyMember, 'id'>) => {
    if (selectedMember) {
      setMembers(members.map(m => 
        m.id === selectedMember.id 
          ? { ...member, id: selectedMember.id }
          : m
      ));
      toast({
        title: "Membre modifié",
        description: "Les informations du membre ont été mises à jour.",
      });
    } else {
      setMembers([...members, { ...member, id: Date.now().toString() }]);
      toast({
        title: "Membre ajouté",
        description: "Le nouveau membre a été ajouté à la famille.",
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Button onClick={handleNewMember} className="w-full sm:w-auto">
        <UserPlus className="mr-2 h-4 w-4" />
        Ajouter un membre
      </Button>

      <div className="grid gap-4 sm:gap-6">
        {members.map((member) => (
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
            </div>

            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              {member.id !== currentUser.id && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditMember(member)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {member.email && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSendInvitation(member.email!)}
                    >
                      <Mail className="h-4 w-4" />
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
        onSave={onSaveMember}
        member={selectedMember}
      />
    </div>
  );
};

export default FamilyMemberList;
