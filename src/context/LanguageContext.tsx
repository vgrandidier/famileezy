
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'es' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
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
    "nav.family": "Ma Famille",
    
    // Landing page
    "landing.hero.title": "Gérez votre vie de famille en toute simplicité",
    "landing.hero.subtitle": "Une application complète pour organiser la vie de famille moderne",
    "landing.hero.cta": "Commencer gratuitement",
    
    // Features
    "features.pocket-money.title": "Argent de poche",
    "features.pocket-money.description": "Gérez l'argent de poche de vos enfants et suivez leurs économies",
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
    "features.comingSoon": "Cette fonctionnalité arrive bientôt. Revenez plus tard pour voir les mises à jour !",
    
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
    "profile.subtitle": "Gérez vos informations personnelles et vos préférences",
    "profile.firstName": "Prénom",
    "profile.lastName": "Nom",
    "profile.email": "Email",
    "profile.password": "Mot de passe",
    "profile.passwordPlaceholder": "Laissez vide pour conserver le mot de passe actuel",
    "profile.passwordHelp": "Remplissez ce champ uniquement si vous souhaitez changer votre mot de passe",
    "profile.save": "Enregistrer",
    "profile.saving": "Enregistrement...",
    "profile.updateSuccess": "Profil mis à jour",
    "profile.updateSuccessDetail": "Vos informations personnelles ont été mises à jour avec succès.",
    "profile.updateFailed": "Échec de la mise à jour",
    "profile.updateFailedDetail": "Un problème est survenu lors de la mise à jour de votre profil.",
    "profile.changePhoto": "Changer la photo",
    "profile.selectPhoto": "Sélectionner une photo",
    "profile.clickToUpload": "Cliquez sur l'icône pour changer la photo",
    "profile.uploading": "Téléchargement en cours",
    "profile.photoUploaded": "Photo téléchargée",
    "profile.photoUploadedSuccess": "Votre photo de profil a été mise à jour avec succès.",
    "profile.uploadFailed": "Échec du téléchargement",
    "profile.uploadFailedDetail": "Un problème est survenu lors du téléchargement de votre photo.",
    "profile.invalidFile": "Format invalide",
    "profile.selectImageFile": "Veuillez sélectionner une image.",
    "profile.updatingProfile": "Mise à jour du profil...",
    "profile.updateCompleted": "Mise à jour terminée",
    "profile.updateError": "Erreur lors de la mise à jour",
    "profile.cropperOpened": "Recadrage d'image ouvert",
    "profile.uploadingPhoto": "Chargement de la photo en cours",
    "profile.photoUploadComplete": "Téléchargement de la photo terminé",
    "profile.photoUploadError": "Erreur lors du téléchargement de la photo",
    "profile.cropImage": "Recadrer l'image",
    "profile.cropInstructions": "Déplacez et redimensionnez l'image pour la recadrer",
    "profile.loadingImage": "Chargement de l'image...",
    
    // Common
    "common.save": "Sauvegarder",
    "common.cancel": "Annuler",
    "common.confirm": "Confirmer",
    
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
    "nav.family": "My Family",
    
    // Landing page
    "landing.hero.title": "Manage your family life with ease",
    "landing.hero.subtitle": "A comprehensive app to organize the modern family life",
    "landing.hero.cta": "Start for free",
    
    // Features
    "features.pocket-money.title": "Pocket Money",
    "features.pocket-money.description": "Manage your children's pocket money and track their savings",
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
    "features.comingSoon": "This feature is coming soon. Check back later for updates!",
    
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
    "profile.subtitle": "Manage your personal information and preferences",
    "profile.firstName": "First name",
    "profile.lastName": "Last name",
    "profile.email": "Email",
    "profile.password": "Password",
    "profile.passwordPlaceholder": "Leave empty to keep current password",
    "profile.passwordHelp": "Fill this field only if you want to change your password",
    "profile.save": "Save",
    "profile.saving": "Saving...",
    "profile.updateSuccess": "Profile updated",
    "profile.updateSuccessDetail": "Your personal information has been successfully updated.",
    "profile.updateFailed": "Update failed",
    "profile.updateFailedDetail": "A problem occurred while updating your profile.",
    "profile.changePhoto": "Change photo",
    "profile.selectPhoto": "Select a photo",
    "profile.clickToUpload": "Click on the icon to change the photo",
    "profile.uploading": "Uploading",
    "profile.photoUploaded": "Photo uploaded",
    "profile.photoUploadedSuccess": "Your profile picture has been successfully updated.",
    "profile.uploadFailed": "Upload failed",
    "profile.uploadFailedDetail": "A problem occurred while uploading your photo.",
    "profile.invalidFile": "Invalid format",
    "profile.selectImageFile": "Please select an image.",
    "profile.updatingProfile": "Updating profile...",
    "profile.updateCompleted": "Update completed",
    "profile.updateError": "Error during update",
    "profile.cropperOpened": "Image cropping opened",
    "profile.uploadingPhoto": "Uploading photo",
    "profile.photoUploadComplete": "Photo upload complete",
    "profile.photoUploadError": "Error uploading photo",
    "profile.cropImage": "Crop image",
    "profile.cropInstructions": "Move and resize the image to crop it",
    "profile.loadingImage": "Loading image...",
    
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    
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
    "features.pocket-money.title": "Dinero de bolsillo",
    "features.pocket-money.description": "Gestiona el dinero de bolsillo de tus hijos y controla sus ahorros",
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
    "features.comingSoon": "Esta función estará disponible pronto. ¡Vuelve más tarde para ver las actualizaciones!",
    
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
    "profile.clickToUpload": "Haga clic en el icono para cambiar la foto",
    "profile.cropImage": "Recortar imagen",
    
    // Common
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    
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
    "features.pocket-money.title": "Paghetta",
    "features.pocket-money.description": "Gestisci la paghetta dei tuoi figli e tieni traccia dei loro risparmi",
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
    "features.comingSoon": "Questa funzionalità sarà disponibile presto. Torna più tardi per gli aggiornamenti!",
    
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
    "profile.clickToUpload": "Clicca sull'icona per cambiare la foto",
    "profile.cropImage": "Ritaglia immagine",
    
    // Common
    "common.save": "Salva",
    "common.cancel": "Annulla",
    "common.confirm": "Conferma",
    
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

  const t = (key: string, fallback?: string): string => {
    // @ts-ignore
    return translations[language][key] || fallback || key;
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
