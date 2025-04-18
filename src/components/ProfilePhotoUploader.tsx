import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoUploaderProps {
  userId: string;
  currentPhotoUrl?: string;
  firstName?: string;
  lastName?: string;
  onPhotoUpdated?: (url: string) => void;
}

const ProfilePhotoUploader = ({ 
  userId, 
  currentPhotoUrl,
  firstName = '',
  lastName = '',
  onPhotoUpdated
}: ProfilePhotoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner une image.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Créer un nom de fichier unique
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile_${Date.now()}.${fileExtension}`;
      
      // Référence au chemin de stockage
      const storageRef = ref(storage, `profile_pictures/${userId}/${fileName}`);
      
      // Téléchargement direct du fichier
      const uploadResult = await uploadBytes(storageRef, file);
      
      // Récupération de l'URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Mise à jour de Firestore uniquement
      await updateDoc(doc(db, "users", userId), {
        profilePicture: downloadURL,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Photo téléchargée",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
      
      // Notifier le parent si nécessaire
      if (onPhotoUpdated) {
        onPhotoUpdated(downloadURL);
      }
      
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: "Échec du téléchargement",
        description: "Un problème est survenu. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input pour permettre de sélectionner à nouveau le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-2">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={currentPhotoUrl} 
            alt={`Photo de profil de ${firstName} ${lastName}`}
          />
          <AvatarFallback className="bg-famille-purple text-white text-xl">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {isUploading ? (
          <div className="absolute bottom-0 right-0 rounded-full bg-white p-1 shadow">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full"
            onClick={triggerFileInput}
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
      </div>
      <span className="text-xs text-muted-foreground">
        Cliquez sur l'icône pour changer la photo
      </span>
    </div>
  );
};

export default ProfilePhotoUploader;