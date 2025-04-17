import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileDrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const ProfileDrawerContext = createContext<ProfileDrawerContextType | undefined>(undefined);

export const ProfileDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen(!isOpen);

  return (
    <ProfileDrawerContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </ProfileDrawerContext.Provider>
  );
};

export const useProfileDrawer = (): ProfileDrawerContextType => {
  const context = useContext(ProfileDrawerContext);
  if (context === undefined) {
    throw new Error('useProfileDrawer must be used within a ProfileDrawerProvider');
  }
  return context;
};