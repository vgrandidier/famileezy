// Modification du FamilyDrawer.tsx
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FamilyMemberList from './FamilyMemberList';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFamily } from '@/context/FamilyContext';
import { PlusCircle, UserPlus, ChevronDown } from 'lucide-react';

interface FamilyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FamilyDrawer = ({ open, onOpenChange }: FamilyDrawerProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentFamily, families, createNewFamily, setCurrentFamily } = useFamily();
  
  // États pour le dialogue de création de famille
  const [newFamilyDialogOpen, setNewFamilyDialogOpen] = useState(false);
  const [familyName, setFamilyName] = useState('Ma Famille');
  const [isCreating, setIsCreating] = useState(false);

  // Fonction pour créer une nouvelle famille
  const handleCreateFamily = async () => {
    if (!familyName.trim()) return;
    
    setIsCreating(true);
    try {
      await createNewFamily(familyName.trim());
      setNewFamilyDialogOpen(false);
      setFamilyName('Ma Famille'); // Réinitialiser pour la prochaine fois
    } catch (error) {
      console.error("Erreur lors de la création de la famille:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{t('nav.family')}</SheetTitle>
        </SheetHeader>
        
        <div className="pr-6">
          {/* Sélecteur de famille (si plusieurs familles) - MODIFIÉ */}
          {families.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Sélectionner une famille</label>
              <div className="relative w-full">
                <select 
                  className="w-full p-2 pr-10 border rounded-md appearance-none bg-white"
                  value={currentFamily?.id || ''}
                  onChange={(e) => {
                    const selectedFamily = families.find(f => f.id === e.target.value);
                    if (selectedFamily) {
                      setCurrentFamily(selectedFamily);
                    }
                  }}
                >
                  {families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          )}
          
          {/* Message si aucune famille n'est disponible */}
          {families.length === 0 && (
            <div className="text-center py-8 mb-4">
              <p className="text-muted-foreground mb-4">
                Veuillez créer une famille pour commencer à ajouter des membres.
              </p>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => setNewFamilyDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer ma première famille
              </Button>
            </div>
          )}
          
          {/* Bouton de création d'une famille supplémentaire */}
          {families.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full mb-4"
              onClick={() => setNewFamilyDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une nouvelle famille
            </Button>
          )}
          
          {/* Liste des membres de la famille actuelle */}
          {currentFamily && <FamilyMemberList />}
        </div>
        
        {/* Dialogue de création de famille */}
        <Dialog open={newFamilyDialogOpen} onOpenChange={setNewFamilyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle famille</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="family-name">Nom de la famille</label>
                <Input 
                  id="family-name"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Ex: Famille Dupont"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setNewFamilyDialogOpen(false)} 
                variant="outline"
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateFamily}
                disabled={isCreating || !familyName.trim()}
              >
                {isCreating ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyDrawer;