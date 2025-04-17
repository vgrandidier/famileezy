import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Euro, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import ImageCropper from './ImageCropper';
import { useToast } from '@/hooks/use-toast';

// Définir les messages d'erreur en français pour le schéma
const formSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  profile: z.enum(['parent', 'child']),
  profilePicture: z.string().optional(),
  pocketMoney: z.string().optional(),
  pocketMoneyFrequency: z.enum(['weekly', 'monthly']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: FormValues) => void;
  member: {
    firstName: string;
    lastName: string;
    email?: string;
    profile: 'parent' | 'child';
    profilePicture?: string;
    pocketMoney?: string;
    pocketMoneyFrequency?: 'weekly' | 'monthly';
  } | null;
}

const FamilyMemberDialog = ({
  open,
  onOpenChange,
  onSave,
  member,
}: FamilyMemberDialogProps) => {
  // S'assurer que les traductions sont chargées
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  // États pour la gestion du recadrage d'image
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: member || {
      firstName: '',
      lastName: '',
      email: '',
      profile: 'child',
      profilePicture: '',
      pocketMoney: '',
      pocketMoneyFrequency: 'monthly',
    },
  });

  const isChild = form.watch('profile') === 'child';

  // Focus sur le premier champ quand la boîte de dialogue s'ouvre
  useEffect(() => {
    if (open && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open]);
  
  const handleSubmit = (values: FormValues) => {
    // Notification pour les lecteurs d'écran
    const statusElement = document.getElementById('family-member-status');
    if (statusElement) {
      statusElement.textContent = member 
        ? t('family.updatingMember') 
        : t('family.addingMember');
    }
    
    onSave(values);
    form.reset();

    // Mise à jour du statut pour les lecteurs d'écran
    if (statusElement) {
      statusElement.textContent = member 
        ? t('family.memberUpdated') 
        : t('family.memberAdded');
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Valider que c'est bien une image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner une image.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    setShowCropper(true);
    
    // Statut pour lecteurs d'écran
    const statusElement = document.getElementById('family-member-photo-status');
    if (statusElement) {
      statusElement.textContent = "Recadrage d'image ouvert";
    }
  };
  
  const handleCropComplete = async (croppedImageUrl: string, croppedBlob: Blob) => {
    try {
      setIsUploading(true);
      
      // Statut pour lecteurs d'écran
      const statusElement = document.getElementById('family-member-photo-status');
      if (statusElement) {
        statusElement.textContent = "Chargement de la photo en cours";
      }
      
      // Dans un cas réel, il faudrait uploader l'image au serveur
      // Pour notre démo, nous utilisons directement l'URL du blob
      form.setValue('profilePicture', croppedImageUrl);
      
      toast({
        title: "Photo ajoutée",
        description: "La photo de profil a été mise à jour avec succès.",
      });
      
      // Mise à jour du statut pour les lecteurs d'écran
      if (statusElement) {
        statusElement.textContent = "Photo téléchargée avec succès";
      }
      
    } catch (error) {
      toast({
        title: "Échec de l'upload",
        description: "Un problème est survenu lors de l'ajout de la photo.",
        variant: "destructive",
      });
      
      // Mise à jour du statut pour les lecteurs d'écran
      const statusElement = document.getElementById('family-member-photo-status');
      if (statusElement) {
        statusElement.textContent = "Erreur lors du téléchargement de la photo";
      }
      
    } finally {
      setIsUploading(false);
    }
  };
  
  // Gestion des raccourcis clavier pour la boîte de dialogue
  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      form.handleSubmit(handleSubmit)();
    }
  };

  return (
    <>
      {/* Éléments de statut cachés pour lecteurs d'écran */}
      <div className="sr-only" aria-live="polite" id="family-member-status"></div>
      <div className="sr-only" aria-live="polite" id="family-member-photo-status"></div>
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-[425px] bg-white"
          onKeyDown={handleDialogKeyDown}
          aria-labelledby="family-member-dialog-title"
        >
          <DialogHeader>
            <DialogTitle id="family-member-dialog-title">
              {member ? "Modifier un membre" : "Ajouter un membre"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={form.watch('profilePicture')} 
                      alt="Photo de profil du membre"
                    />
                    <AvatarFallback className="bg-muted" aria-hidden="true">
                      {form.watch('firstName')?.charAt(0) || ''}
                      {form.watch('lastName')?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  {isUploading ? (
                    <div 
                      className="absolute bottom-0 right-0 rounded-full bg-white p-1 shadow"
                      aria-label="Chargement en cours"
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
                      aria-label="Changer la photo"
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
                    aria-label="Sélectionner une photo"
                    tabIndex={-1}
                  />
                </div>
                <span 
                  className="text-xs text-muted-foreground"
                  aria-hidden="true"
                >
                  Cliquez sur l'icône pour changer la photo
                </span>
              </div>

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel id="firstName-label">Prénom</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        ref={firstInputRef}
                        aria-labelledby="firstName-label"
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage aria-live="assertive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel id="lastName-label">Nom</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        aria-labelledby="lastName-label"
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage aria-live="assertive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel id="email-label">Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email" 
                        aria-labelledby="email-label"
                        aria-describedby="email-help"
                      />
                    </FormControl>
                    <p id="email-help" className="text-xs text-muted-foreground">
                      Optionnel
                    </p>
                    <FormMessage aria-live="assertive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel id="profile-type-label">Profil</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                        aria-labelledby="profile-type-label"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem 
                              value="parent" 
                              aria-label="Parent"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Parent</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem 
                              value="child" 
                              aria-label="Enfant"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Enfant</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage aria-live="assertive" />
                  </FormItem>
                )}
              />

              {isChild && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pocketMoney"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel id="pocket-money-label">Argent de poche (€)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Montant"
                              aria-labelledby="pocket-money-label"
                            />
                            <Euro 
                              className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" 
                              aria-hidden="true"
                            />
                          </div>
                        </FormControl>
                        <FormMessage aria-live="assertive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pocketMoneyFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel id="frequency-label">Fréquence</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          aria-labelledby="frequency-label"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la fréquence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Par semaine</SelectItem>
                            <SelectItem value="monthly">Par mois</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage aria-live="assertive" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  aria-label="Annuler"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  aria-label={member ? "Enregistrer les modifications" : "Ajouter un nouveau membre"}
                >
                  {member ? "Enregistrer" : "Ajouter"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
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

export default FamilyMemberDialog;