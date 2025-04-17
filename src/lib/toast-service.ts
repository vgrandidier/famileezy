import { toast } from "@/hooks/use-toast";

/**
 * Service centralisé pour la gestion des notifications
 * Offre une interface cohérente et accessible pour les notifications
 */
export const ToastService = {
  /**
   * Affiche une notification de succès
   * @param title Titre du message de succès
   * @param description Description détaillée (optionnelle)
   */
  success: (title: string, description?: string) => {
    // Jouer un son de notification (si supporté par le navigateur)
    playNotificationSound('success');
    
    // Afficher la notification
    toast({
      title,
      description,
      variant: "default",
      // Ajouter une icône ou un style spécifique pour le succès
      className: "toast-success",
    });
    
    // Envoyer un événement d'analyse (analytics)
    logToastEvent('success', title);
  },

  /**
   * Affiche une notification d'erreur
   * @param title Titre du message d'erreur
   * @param description Description détaillée de l'erreur (optionnelle)
   * @param error Objet d'erreur pour les logs (optionnel)
   */
  error: (title: string, description?: string, error?: any) => {
    // Jouer un son de notification d'erreur (si supporté)
    playNotificationSound('error');
    
    // Log l'erreur pour le débogage côté client
    if (error) {
      console.error(`Toast Error: ${title}`, error);
    }
    
    // Afficher la notification
    toast({
      title,
      description,
      variant: "destructive",
      // Augmenter la durée pour les messages d'erreur
      duration: 6000,
    });
    
    // Envoyer un événement d'analyse
    logToastEvent('error', title);
  },

  /**
   * Affiche une notification informative
   * @param title Titre du message
   * @param description Description détaillée (optionnelle)
   */
  info: (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      className: "toast-info",
    });
    
    logToastEvent('info', title);
  },

  /**
   * Affiche une notification d'avertissement
   * @param title Titre de l'avertissement
   * @param description Description détaillée (optionnelle)
   */
  warning: (title: string, description?: string) => {
    // Jouer un son de notification d'avertissement (si supporté)
    playNotificationSound('warning');
    
    toast({
      title,
      description,
      variant: "default",
      className: "toast-warning",
      // Augmenter légèrement la durée pour les avertissements
      duration: 5000,
    });
    
    logToastEvent('warning', title);
  },

  /**
   * Affiche une notification de chargement qui sera mise à jour
   * @param title Titre initial
   * @param description Description initiale (optionnelle)
   * @returns Fonction pour mettre à jour ou terminer la notification
   */
  loading: (title: string, description?: string) => {
    const toastInstance = toast({
      title,
      description,
      variant: "default",
      className: "toast-loading",
      // Les notifications de chargement ne disparaissent pas automatiquement
      duration: Infinity,
    });
    
    // Retourne des fonctions pour mettre à jour cette notification spécifique
    return {
      // Met à jour la notification de chargement
      update: (newTitle: string, newDescription?: string) => {
        // Nous devons passer l'ID pour que l'update fonctionne correctement
        toastInstance.update({
          id: toastInstance.id,
          title: newTitle,
          description: newDescription,
        });
        
        return { dismiss: toastInstance.dismiss };
      },
      // Termine le chargement avec succès
      success: (newTitle: string, newDescription?: string) => {
        // Fermer d'abord le toast actuel
        toastInstance.dismiss();
        
        // Créer un nouveau toast de succès
        toast({
          title: newTitle,
          description: newDescription,
          variant: "default",
          className: "toast-success",
          duration: 3000,
        });
        
        playNotificationSound('success');
        logToastEvent('success', newTitle);
      },
      // Termine le chargement avec erreur
      error: (newTitle: string, newDescription?: string) => {
        // Fermer d'abord le toast actuel
        toastInstance.dismiss();
        
        // Créer un nouveau toast d'erreur
        toast({
          title: newTitle,
          description: newDescription,
          variant: "destructive",
          duration: 5000,
        });
        
        playNotificationSound('error');
        logToastEvent('error', newTitle);
      },
      // Ferme manuellement la notification
      dismiss: toastInstance.dismiss,
    };
  },
};

// Fonction interne pour jouer des sons (si activés et supportés)
function playNotificationSound(type: 'success' | 'error' | 'warning' | 'info') {
  // Vérifier les préférences utilisateur (à implémenter)
  const soundEnabled = localStorage.getItem('notification-sound') !== 'disabled';
  
  if (!soundEnabled || typeof window === 'undefined' || !window.AudioContext) {
    return;
  }
  
  try {
    // Les sons seraient définis ailleurs et chargés au démarrage de l'appli
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Définir les propriétés en fonction du type de notification
    switch (type) {
      case 'success':
        oscillator.frequency.value = 660;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
        break;
      case 'error':
        oscillator.frequency.value = 330;
        oscillator.type = 'sawtooth';
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 300);
        break;
      case 'warning':
        oscillator.frequency.value = 440;
        oscillator.type = 'triangle';
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 250);
        break;
    }
  } catch (e) {
    console.warn('Error playing notification sound', e);
  }
}

// Fonction interne pour logger les événements de notification (analytics)
function logToastEvent(type: string, title: string) {
  // Dans une application réelle, ça enverrait des analytics à un service
  // Par exemple: 
  // analytics.track('notification', { type, title });
  
  // Pour le débogage en développement
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Toast Analytics] ${type}: ${title}`);
  }
}