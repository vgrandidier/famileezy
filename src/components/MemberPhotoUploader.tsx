import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ImageCropper from './ImageCropper';
import { uploadCroppedFamilyMemberPhoto } from '@/services/familyService';

interface MemberPhotoUploaderProps {
  memberId: string;
  currentPhotoUrl?: string;
  firstName?: string;
  lastName?: string;
  onPhotoUpdated?: (url: string) => void;
}

const MemberPhotoUploader = ({ 
  memberId, 
  currentPhotoUrl,
  firstName = '',
  lastName = '',
  onPhotoUpdated
}: MemberPhotoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // États pour la gestion du recadrage d'image
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Stocker le fichier et afficher l'interface de cropping
    setSelectedFile(file);
    setShowCropper(true);
    
    // Réinitialiser l'input pour permettre de sélectionner à nouveau le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCropComplete = async (croppedImageUrl: string, croppedBlob: Blob) => {
    try {
      setIsUploading(true);
      
      // Utiliser le service pour uploader l'image vers Firebase Storage
      const firebaseUrl = await uploadCroppedFamilyMemberPhoto(memberId, croppedBlob);
      
      // Mettre à jour l'état local avec l'URL Firebase (pas l'URL du blob local)
      if (onPhotoUpdated) {
        onPhotoUpdated(firebaseUrl);
      }
      
      // Notification de succès
      toast({
        title: "Photo ajoutée",
        description: "La photo du membre a été mise à jour avec succès.",
      });
      
      // Fermer le cropper
      setShowCropper(false);
      
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
      toast({
        title: "Échec du traitement",
        description: "Un problème est survenu lors de l'envoi de la photo vers le serveur. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-2">
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={currentPhotoUrl} 
              alt={`Photo de ${firstName} ${lastName}`}
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
              disabled={isUploading}
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
            disabled={isUploading}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Cliquez sur l'icône pour changer la photo
        </span>
      </div>
      
      {/* Composant de recadrage d'image */}
      <ImageCropper
        open={showCropper}
        onClose={handleCropCancel}
        imageFile={selectedFile}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default MemberPhotoUploader;