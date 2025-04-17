import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FamilyDrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const FamilyDrawerContext = createContext<FamilyDrawerContextType | undefined>(undefined);

export const FamilyDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen(!isOpen);

  return (
    <FamilyDrawerContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </FamilyDrawerContext.Provider>
  );
};

export const useFamilyDrawer = (): FamilyDrawerContextType => {
  const context = useContext(FamilyDrawerContext);
  if (context === undefined) {
    throw new Error('useFamilyDrawer must be used within a FamilyDrawerProvider');
  }
  return context;
};