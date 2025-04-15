import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'es' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.login": "Connexion",
    "nav.signup": "S'inscrire",
    "nav.profile": "Profil",
    "nav.dashboard": "Tableau de bord",
    "nav.logout": "Déconnexion",
    "nav.family": "Famille",
    
    // Landing page
    "landing.hero.title": "Gérez votre vie de famille en toute simplicité",
    "landing.hero.subtitle": "Une application complète pour organiser la vie de famille moderne",
    "landing.hero.cta": "Commencer gratuitement",
    
    // Features
    "features.pocketMoney.title": "Argent de poche",
    "features.pocketMoney.description": "Gérez l'argent de poche de vos enfants et suivez leurs économies",
    "features.budget.title": "Budget familial",
    "features.budget.description": "Planifiez et suivez les dépenses de toute la famille",
    "features.recipes.title": "Recettes",
    "features.recipes.description": "Organisez vos recettes et planifiez vos repas en famille",
    "features.solar.title": "Production solaire",
    "features.solar.description": "Suivez votre production d'énergie solaire et réduisez vos factures",
    "features.calendar.title": "Calendrier familial",
    "features.calendar.description": "Coordonnez les emplois du temps de toute la famille",
    "features.tasks.title": "Tâches ménagères",
    "features.tasks.description": "Distribuez et suivez les tâches ménagères pour toute la famille",
    
    // Auth forms
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.login": "Connexion",
    "auth.signup": "S'inscrire",
    "auth.firstName": "Prénom",
    "auth.lastName": "Nom",
    "auth.forgotPassword": "Mot de passe oublié ?",
    "auth.noAccount": "Pas encore de compte ?",
    "auth.hasAccount": "Déjà un compte ?",
    
    // Profile
    "profile.title": "Mon profil",
    "profile.firstName": "Prénom",
    "profile.lastName": "Nom",
    "profile.email": "Email",
    "profile.password": "Mot de passe",
    "profile.updatePassword": "Mettre à jour le mot de passe",
    "profile.save": "Enregistrer",
    "profile.picture": "Photo de profil",
    "profile.uploadPicture": "Télécharger une nouvelle photo",
    
    // Footer
    "footer.rights": "Tous droits réservés",
    "footer.privacy": "Politique de confidentialité",
    "footer.terms": "Conditions d'utilisation",
    "footer.contact": "Contact"
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.login": "Login",
    "nav.signup": "Sign up",
    "nav.profile": "Profile",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Logout",
    "nav.family": "Family",
    
    // Landing page
    "landing.hero.title": "Manage your family life with ease",
    "landing.hero.subtitle": "A comprehensive app to organize the modern family life",
    "landing.hero.cta": "Start for free",
    
    // Features
    "features.pocketMoney.title": "Pocket Money",
    "features.pocketMoney.description": "Manage your children's pocket money and track their savings",
    "features.budget.title": "Family Budget",
    "features.budget.description": "Plan and track expenses for the entire family",
    "features.recipes.title": "Recipes",
    "features.recipes.description": "Organize your recipes and plan family meals",
    "features.solar.title": "Solar Production",
    "features.solar.description": "Track your solar energy production and reduce your bills",
    "features.calendar.title": "Family Calendar",
    "features.calendar.description": "Coordinate schedules for the entire family",
    "features.tasks.title": "Household Chores",
    "features.tasks.description": "Distribute and track household chores for the whole family",
    
    // Auth forms
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.login": "Login",
    "auth.signup": "Sign up",
    "auth.firstName": "First name",
    "auth.lastName": "Last name",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    
    // Profile
    "profile.title": "My Profile",
    "profile.firstName": "First name",
    "profile.lastName": "Last name",
    "profile.email": "Email",
    "profile.password": "Password",
    "profile.updatePassword": "Update password",
    "profile.save": "Save",
    "profile.picture": "Profile picture",
    "profile.uploadPicture": "Upload new picture",
    
    // Footer
    "footer.rights": "All rights reserved",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.contact": "Contact"
  },
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.login": "Iniciar sesión",
    "nav.signup": "Registrarse",
    "nav.profile": "Perfil",
    "nav.dashboard": "Panel",
    "nav.logout": "Cerrar sesión",
    "nav.family": "Familia",
    
    // Landing page
    "landing.hero.title": "Gestiona tu vida familiar con facilidad",
    "landing.hero.subtitle": "Una aplicación completa para organizar la vida familiar moderna",
    "landing.hero.cta": "Comenzar gratis",
    
    // Features
    "features.pocketMoney.title": "Dinero de bolsillo",
    "features.pocketMoney.description": "Gestiona el dinero de bolsillo de tus hijos y controla sus ahorros",
    "features.budget.title": "Presupuesto familiar",
    "features.budget.description": "Planifica y controla los gastos de toda la familia",
    "features.recipes.title": "Recetas",
    "features.recipes.description": "Organiza tus recetas y planifica las comidas familiares",
    "features.solar.title": "Producción solar",
    "features.solar.description": "Controla tu producción de energía solar y reduce tus facturas",
    "features.calendar.title": "Calendario familiar",
    "features.calendar.description": "Coordina horarios para toda la familia",
    "features.tasks.title": "Tareas domésticas",
    "features.tasks.description": "Distribuye y controla las tareas domésticas para toda la familia",
    
    // Auth forms
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.login": "Iniciar sesión",
    "auth.signup": "Registrarse",
    "auth.firstName": "Nombre",
    "auth.lastName": "Apellido",
    "auth.forgotPassword": "¿Olvidaste la contraseña?",
    "auth.noAccount": "¿No tienes una cuenta?",
    "auth.hasAccount": "¿Ya tienes una cuenta?",
    
    // Profile
    "profile.title": "Mi Perfil",
    "profile.firstName": "Nombre",
    "profile.lastName": "Apellido",
    "profile.email": "Correo electrónico",
    "profile.password": "Contraseña",
    "profile.updatePassword": "Actualizar contraseña",
    "profile.save": "Guardar",
    "profile.picture": "Foto de perfil",
    "profile.uploadPicture": "Subir nueva foto",
    
    // Footer
    "footer.rights": "Todos los derechos reservados",
    "footer.privacy": "Política de privacidad",
    "footer.terms": "Términos de servicio",
    "footer.contact": "Contacto"
  },
  it: {
    // Navigation
    "nav.home": "Home",
    "nav.login": "Accesso",
    "nav.signup": "Registrati",
    "nav.profile": "Profilo",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Uscita",
    "nav.family": "Famiglia",
    
    // Landing page
    "landing.hero.title": "Gestisci la tua vita familiare con facilità",
    "landing.hero.subtitle": "Un'app completa per organizzare la vita familiare moderna",
    "landing.hero.cta": "Inizia gratuitamente",
    
    // Features
    "features.pocketMoney.title": "Paghetta",
    "features.pocketMoney.description": "Gestisci la paghetta dei tuoi figli e tieni traccia dei loro risparmi",
    "features.budget.title": "Budget familiare",
    "features.budget.description": "Pianifica e tieni traccia delle spese per tutta la famiglia",
    "features.recipes.title": "Ricette",
    "features.recipes.description": "Organizza le tue ricette e pianifica i pasti familiari",
    "features.solar.title": "Produzione solare",
    "features.solar.description": "Monitora la tua produzione di energia solare e riduci le bollette",
    "features.calendar.title": "Calendario familiare",
    "features.calendar.description": "Coordina gli orari per tutta la famiglia",
    "features.tasks.title": "Faccende domestiche",
    "features.tasks.description": "Distribuisci e monitora le faccende domestiche per tutta la famiglia",
    
    // Auth forms
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.login": "Accesso",
    "auth.signup": "Registrati",
    "auth.firstName": "Nome",
    "auth.lastName": "Cognome",
    "auth.forgotPassword": "Password dimenticata?",
    "auth.noAccount": "Non hai un account?",
    "auth.hasAccount": "Hai già un account?",
    
    // Profile
    "profile.title": "Il mio profilo",
    "profile.firstName": "Nome",
    "profile.lastName": "Cognome",
    "profile.email": "Email",
    "profile.password": "Password",
    "profile.updatePassword": "Aggiorna password",
    "profile.save": "Salva",
    "profile.picture": "Foto profilo",
    "profile.uploadPicture": "Carica nuova foto",
    
    // Footer
    "footer.rights": "Tutti i diritti riservati",
    "footer.privacy": "Informativa sulla privacy",
    "footer.terms": "Termini di servizio",
    "footer.contact": "Contatto"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['fr', 'en', 'es', 'it'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
