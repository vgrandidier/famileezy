import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import UserProfileForm from './UserProfileForm';
import { useLanguage } from '@/context/LanguageContext';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDrawer = ({ open, onOpenChange }: ProfileDrawerProps) => {
  const { t } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{t('profile.title')}</SheetTitle>
        </SheetHeader>
        <div className="pr-6">
          <UserProfileForm />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDrawer;