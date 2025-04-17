import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from 'lucide-react';
import ImageCropper from './ImageCropper';

const UserProfileForm = () => {
  const { user, updateProfile, uploadProfilePicture } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // État pour le recadrage d'image
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    try {
      setIsLoading(true);
      
      // Notification pour les lecteurs d'écran
      const statusElement = document.getElementById('profile-update-status');
      if (statusElement) {
        statusElement.textContent = t('profile.updatingProfile');
      }
      
      await updateProfile({
        firstName,
        lastName,
        email,
        ...(password ? { password } : {})
      });
      
      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.updateSuccessDetail'),
      });
      
      // Mise à jour du statut pour les lecteurs d'écran
      if (statusElement) {
        statusElement.textContent = t('profile.updateCompleted');
      }
      
      // Clear password field after successful update
      setPassword('');
      
      // Focus sur le bouton de sauvegarde pour les utilisateurs clavier
      saveButtonRef.current?.focus();
      
    } catch (error) {
      toast({
        title: t('profile.updateFailed'),
        description: t('profile.updateFailedDetail'),
        variant: "destructive",
      });
      
      // Mise à jour du statut pour les lecteurs d'écran
      const statusElement = document.getElementById('profile-update-status');
      if (statusElement) {
        statusElement.textContent = t('profile.updateError');
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Valider que c'est bien une image
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('profile.invalidFile'),
        description: t('profile.selectImageFile'),
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    setShowCropper(true);
    
    // Statut pour lecteurs d'écran
    const statusElement = document.getElementById('profile-photo-status');
    if (statusElement) {
      statusElement.textContent = t('profile.cropperOpened');
    }
  };

  const handleCropComplete = async (croppedImageUrl: string, croppedBlob: Blob) => {
    try {
      setIsUploading(true);
      
      // Statut pour lecteurs d'écran
      const statusElement = document.getElementById('profile-photo-status');
      if (statusElement) {
        statusElement.textContent = t('profile.uploadingPhoto');
      }
      
      // Convertir le Blob en File pour l'upload
      const croppedFile = new File([croppedBlob], selectedFile?.name || 'profile.jpg', { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      await uploadProfilePicture(croppedFile);
      
      toast({
        title: t('profile.photoUploaded'),
        description: t('profile.photoUploadedSuccess'),
      });
      
      // Mise à jour du statut pour les lecteurs d'écran
      if (statusElement) {
        statusElement.textContent = t('profile.photoUploadComplete');
      }
      
    } catch (error) {
      toast({
        title: t('profile.uploadFailed'),
        description: t('profile.uploadFailedDetail'),
        variant: "destructive",
      });
      
      // Mise à jour du statut pour les lecteurs d'écran
      const statusElement = document.getElementById('profile-photo-status');
      if (statusElement) {
        statusElement.textContent = t('profile.photoUploadError');
      }
      
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Éléments de statut cachés pour lecteurs d'écran */}
      <div className="sr-only" aria-live="polite" id="profile-update-status"></div>
      <div className="sr-only" aria-live="polite" id="profile-photo-status"></div>
      
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>
            {t('profile.subtitle')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} aria-labelledby="profile-form-title">
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={user?.profilePicture || '/placeholder.svg'} 
                    alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  />
                  <AvatarFallback className="bg-famille-purple text-white text-xl" aria-hidden="true">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isUploading ? (
                  <div 
                    className="absolute bottom-0 right-0 rounded-full bg-white p-1 shadow"
                    aria-label={t('profile.uploading')}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={triggerFileInput}
                    aria-label={t('profile.changePhoto')}
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  aria-label={t('profile.selectPhoto')}
                  tabIndex={-1}
                />
              </div>
              <span 
                className="text-xs text-muted-foreground"
                id="photo-upload-instruction"
                aria-hidden="true"  // Déjà couvert par le bouton avec aria-label
              >
                {t('profile.clickToUpload')}
              </span>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" id="firstName-label">{t('profile.firstName')}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-labelledby="firstName-label"
                  aria-required="true"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" id="lastName-label">{t('profile.lastName')}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-labelledby="lastName-label"
                  aria-required="true"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" id="email-label">{t('profile.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-labelledby="email-label"
                aria-required="true"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" id="password-label">{t('profile.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('profile.passwordPlaceholder')}
                aria-labelledby="password-label"
                aria-describedby="password-help"
              />
              <p id="password-help" className="text-xs text-muted-foreground">
                {t('profile.passwordHelp')}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-famille-blue hover:bg-famille-blue/90"
              disabled={isLoading}
              ref={saveButtonRef}
              aria-busy={isLoading}
            >
              {isLoading ? t('profile.saving') : t('profile.save')}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Composant de recadrage d'image */}
      <ImageCropper
        open={showCropper}
        onClose={() => setShowCropper(false)}
        imageFile={selectedFile}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default UserProfileForm;