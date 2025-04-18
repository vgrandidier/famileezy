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
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ImageCropper from './ImageCropper';
import { useToast } from '@/hooks/use-toast';
import { featuresData } from '@/pages/FeaturePage';

// Définir le type TypeScript pour les permissions de modules
type ModulePermissions = {
  'pocket-money': boolean;
  'budget': boolean;
  'recipes': boolean;
  'solar': boolean;
  'calendar': boolean;
  'tasks': boolean;
};

// Définir les messages d'erreur en français pour le schéma
const formSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  profile: z.enum(['parent', 'child']),
  profilePicture: z.string().optional(),
  pocketMoney: z.string().optional(),
  pocketMoneyFrequency: z.enum(['weekly', 'monthly']).optional(),
  // Ajout des permissions pour les modules
  modulePermissions: z.object({
    'pocket-money': z.boolean().default(false),
    'budget': z.boolean().default(false),
    'recipes': z.boolean().default(true),
    'solar': z.boolean().default(false),
    'calendar': z.boolean().default(true),
    'tasks': z.boolean().default(false),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: FormValues) => void;
  member: {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    profile: 'parent' | 'child';
    profilePicture?: string;
    pocketMoney?: string;
    pocketMoneyFrequency?: 'weekly' | 'monthly';
    modulePermissions?: ModulePermissions;
  } | null;
}

const FamilyMemberDialog = ({
  open,
  onOpenChange,
  onSave,
  member,
}: FamilyMemberDialogProps) => {
  // Débogage pour voir ce qui est reçu
  console.log("Member data received:", member);
  
  // S'assurer que les traductions sont chargées
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('personal');
  
  // États pour la gestion du recadrage d'image
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Valeurs par défaut pour les permissions de modules d'un enfant
  const defaultModulePermissions = {
    'pocket-money': false,
    'budget': false,
    'recipes': true,
    'solar': false,
    'calendar': true,
    'tasks': false,
  };
  
  // Configurer le formulaire avec les valeurs initiales
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: member ? {
      ...member,
      modulePermissions: member.modulePermissions || 
        (member.profile === 'child' ? defaultModulePermissions : undefined)
    } : {
      firstName: '',
      lastName: '',
      email: '',
      profile: 'child',
      profilePicture: '',
      pocketMoney: '',
      pocketMoneyFrequency: 'monthly',
      modulePermissions: defaultModulePermissions
    },
  });
  
  // Débogage de l'initialisation
  console.log("Form initialized with:", form.getValues());

  // Réinitialiser le formulaire lorsque le membre change ou lorsque la boîte de dialogue s'ouvre/se ferme
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, resetting form with:", member);
      if (member) {
        form.reset({
          ...member,
          modulePermissions: member.modulePermissions || 
            (member.profile === 'child' ? defaultModulePermissions : undefined)
        });
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          email: '',
          profile: 'child',
          profilePicture: '',
          pocketMoney: '',
          pocketMoneyFrequency: 'monthly',
          modulePermissions: defaultModulePermissions
        });
      }
      
      // Focus sur le premier champ
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open, member, form]);

  const isChild = form.watch('profile') === 'child';

  // Réinitialiser les permissions si le profil change de parent à enfant
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'profile' && value.profile === 'child') {
        form.setValue('modulePermissions', defaultModulePermissions);
      } else if (name === 'profile' && value.profile === 'parent') {
        form.setValue('modulePermissions', undefined);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  const handleSubmit = (values: FormValues) => {
    console.log("Submitting values:", values);
    
    // Notification pour les lecteurs d'écran
    const statusElement = document.getElementById('family-member-status');
    if (statusElement) {
      statusElement.textContent = member 
        ? t('family.updatingMember', "Mise à jour du membre") 
        : t('family.addingMember', "Ajout d'un membre");
    }
    
    // Si c'est un parent, on retire les paramètres spécifiques aux enfants
    if (values.profile === 'parent') {
      values.pocketMoney = undefined;
      values.pocketMoneyFrequency = undefined;
      values.modulePermissions = undefined;
    }
    
    onSave(values);
    form.reset();

    // Mise à jour du statut pour les lecteurs d'écran
    if (statusElement) {
      statusElement.textContent = member 
        ? t('family.memberUpdated', "Membre mis à jour") 
        : t('family.memberAdded', "Membre ajouté");
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
          className="sm:max-w-[525px] bg-white overflow-y-auto max-h-[90vh]"
          onKeyDown={handleDialogKeyDown}
          aria-labelledby="family-member-dialog-title"
        >
          <DialogHeader>
            <DialogTitle id="family-member-dialog-title">
              {member && member.id ? "Modifier un membre" : "Ajouter un membre"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
                  {isChild && <TabsTrigger value="access">Accès aux modules</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4 pt-4">
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
                            value={field.value}
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
                              value={field.value}
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
                </TabsContent>
                
                {isChild && (
                  <TabsContent value="access" className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Accès aux modules</h3>
                        <p className="text-xs text-muted-foreground">
                          Sélectionnez les modules auxquels l'enfant aura accès
                        </p>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      {Object.entries(featuresData).map(([id, feature]) => {
                        // Utiliser TypeScript pour s'assurer que nous traitons correctement les clés typées
                        const moduleId = id as keyof ModulePermissions;
                        
                        return (
                          <FormField
                            key={id}
                            control={form.control}
                            // Utiliser register pour les propriétés imbriquées avec react-hook-form
                            name={`modulePermissions.${moduleId}` as const}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="flex gap-2 items-center cursor-pointer">
                                    <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                                    <span>{t(`features.${id}.title`, feature.title)}</span>
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {t(`features.${id}.description`, `Description du module ${feature.title}`)}
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                  </TabsContent>
                )}
              </Tabs>

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
                  aria-label={member && member.id ? "Enregistrer les modifications" : "Ajouter un nouveau membre"}
                >
                  {member && member.id ? "Enregistrer" : "Ajouter"}
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