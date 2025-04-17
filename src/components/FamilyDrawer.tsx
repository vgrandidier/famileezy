import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import FamilyMemberList from './FamilyMemberList';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface FamilyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FamilyDrawer = ({ open, onOpenChange }: FamilyDrawerProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();

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
          <FamilyMemberList currentUser={user} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyDrawer;