/**
 * Service d'optimisation d'images
 * Fournit des fonctions pour redimensionner, comprimer et optimiser les images
 * avant leur envoi au serveur ou leur affichage
 */

/**
 * Configuration pour l'optimisation d'image
 */
interface ImageOptimizerOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    progressive?: boolean;
  }
  
  /**
   * Optimise une image à partir d'un fichier File ou Blob
   * @param imageFile Fichier d'image à optimiser (File ou Blob)
   * @param options Options d'optimisation
   * @returns Promise avec le blob optimisé et son URL
   */
  export async function optimizeImage(
    imageFile: File | Blob,
    options: ImageOptimizerOptions = {}
  ): Promise<{ blob: Blob; url: string }> {
    // Options par défaut
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.85,
      format = 'jpeg',
      progressive = true,
    } = options;
  
    return new Promise((resolve, reject) => {
      // Créer un objet URL pour l'image source
      const url = URL.createObjectURL(imageFile);
      const img = new Image();
      
      // Gérer le chargement de l'image
      img.onload = () => {
        // Libérer l'URL de l'image source
        URL.revokeObjectURL(url);
        
        // Calculer les dimensions optimisées
        let width = img.width;
        let height = img.height;
        
        // Redimensionner si nécessaire en préservant le ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Créer un canvas pour le redimensionnement
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte Canvas 2D'));
          return;
        }
        
        // Dessiner avec antialiasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Déterminer le type MIME en fonction du format demandé
        let mimeType: string;
        switch (format) {
          case 'webp':
            mimeType = 'image/webp';
            break;
          case 'png':
            mimeType = 'image/png';
            break;
          case 'jpeg':
          default:
            mimeType = 'image/jpeg';
            break;
        }
        
        // Convertir le canvas en blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Échec de la conversion du canvas en blob"));
              return;
            }
            
            // Créer une URL pour le blob optimisé
            const optimizedUrl = URL.createObjectURL(blob);
            resolve({ blob, url: optimizedUrl });
            
            // Log des stats d'optimisation en développement
            if (process.env.NODE_ENV === 'development') {
              const originalSize = imageFile.size;
              const optimizedSize = blob.size;
              const reduction = ((originalSize - optimizedSize) / originalSize) * 100;
              console.log(
                `Optimisation d'image: ${originalSize} -> ${optimizedSize} bytes (${reduction.toFixed(2)}% de réduction)`
              );
            }
          },
          mimeType,
          quality
        );
      };
      
      // Gérer les erreurs de chargement d'image
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Échec du chargement de l'image source"));
      };
      
      // Déclencher le chargement de l'image
      img.src = url;
    });
  }
  
  /**
   * Crée une version miniature (thumbnail) d'une image
   * @param imageFile Fichier d'image source
   * @param size Taille maximale de la miniature (carré)
   * @returns Promise avec le blob de la miniature et son URL
   */
  export async function createThumbnail(
    imageFile: File | Blob,
    size: number = 150
  ): Promise<{ blob: Blob; url: string }> {
    return optimizeImage(imageFile, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.8,
      format: 'jpeg',
    });
  }
  
  /**
   * Vérifie si le navigateur prend en charge le format WebP
   * @returns Promise indiquant si WebP est supporté
   */
  export async function supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0 && img.height > 0);
      img.onerror = () => resolve(false);
      img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
  }
  
  /**
   * Précharge une image pour améliorer les temps de chargement
   * @param url URL de l'image à précharger
   * @returns Promise résolue quand l'image est chargée
   */
  export function preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }
  
  /**
   * Obtient les dimensions réelles d'une image
   * @param url URL de l'image
   * @returns Promise avec les dimensions {width, height}
   */
  export async function getImageDimensions(
    url: string
  ): Promise<{ width: number; height: number }> {
    const img = await preloadImage(url);
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  }