import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface SimplePhotoUploaderProps {
  userId: string;
  currentPhotoUrl?: string;
  firstName?: string;
  lastName?: string;
  onPhotoUploaded: (url: string) => void;
}

export default function SimplePhotoUploader({
  userId,
  currentPhotoUrl,
  firstName = '',
  lastName = '',
  onPhotoUploaded
}: SimplePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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
      const fileName = `profile_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
      
      // Référence vers Firebase Storage
      const storageRef = ref(storage, `users/${userId}/${fileName}`);
      
      // Télécharger directement sans recadrage
      const uploadResult = await uploadBytes(storageRef, file);
      
      // Obtenir l'URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Notifier le parent
      onPhotoUploaded(downloadURL);
      
      toast({
        title: "Photo téléchargée",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      toast({
        title: "Échec du téléchargement",
        description: "Un problème est survenu lors du téléchargement de la photo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      <span className="text-xs text-muted-foreground">
        Cliquez sur l'icône pour changer la photo
      </span>
    </div>
  );
}