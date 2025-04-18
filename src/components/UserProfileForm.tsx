import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import ProfilePhotoUploader from './ProfilePhotoUploader';

const UserProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    try {
      setIsLoading(true);
      
      await updateProfile({
        firstName,
        lastName,
        email,
        profilePicture,
        ...(password ? { password } : {})
      });
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été mises à jour avec succès.",
      });
      
      // Clear password field after successful update
      setPassword('');
      
      // Focus sur le bouton de sauvegarde pour les utilisateurs clavier
      saveButtonRef.current?.focus();
      
    } catch (error) {
      console.error("Erreur de mise à jour du profil:", error);
      toast({
        title: "Échec de la mise à jour",
        description: "Un problème est survenu lors de la mise à jour de votre profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpdated = (url: string) => {
    console.log("Photo mise à jour dans UserProfileForm:", url);
    setProfilePicture(url);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{t('profile.title', "Mon profil")}</CardTitle>
        <CardDescription>
          {t('profile.subtitle', "Gérez vos informations personnelles et vos préférences")}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Photo de profil - Utilisation du composant amélioré */}
          {user && (
            <ProfilePhotoUploader 
              userId={user.id}
              currentPhotoUrl={profilePicture}
              firstName={firstName}
              lastName={lastName}
              onPhotoUpdated={handlePhotoUpdated}
            />
          )}

          {/* Champs du formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Laissez vide pour conserver le mot de passe actuel"
            />
            <p className="text-xs text-muted-foreground">
              Remplissez ce champ uniquement si vous souhaitez changer votre mot de passe
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-famille-blue hover:bg-famille-blue/90"
            disabled={isLoading}
            ref={saveButtonRef}
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserProfileForm;