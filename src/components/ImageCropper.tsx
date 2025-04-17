import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { optimizeImage } from '@/lib/image-optimizer';
import { ToastService } from '@/lib/toast-service';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImageUrl: string, file: Blob) => void;
}

// Utiliser un memo pour éviter des recalculs constants
const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number) => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
};

async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string
): Promise<{ blob: Blob; url: string }> {
  // Création et configuration du canvas pour le recadrage
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Définir les dimensions de l'image recadrée
  canvas.width = crop.width;
  canvas.height = crop.height;

  // Dessiner l'image recadrée dans le canvas
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  // Convertir le canvas en blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        
        try {
          // Optimiser l'image recadrée avant de la retourner
          const optimized = await optimizeImage(blob, {
            maxWidth: 512, // Taille suffisante pour un avatar
            maxHeight: 512,
            quality: 0.85,
            format: 'jpeg'
          });
          
          resolve(optimized);
        } catch (err) {
          // En cas d'erreur d'optimisation, utiliser le blob original
          console.warn('Image optimization failed, using original crop', err);
          const fallbackUrl = URL.createObjectURL(blob);
          resolve({ blob, url: fallbackUrl });
        }
      },
      'image/jpeg',
      0.95 // Qualité JPEG initiale avant optimisation
    );
  });
}

const ImageCropper = ({ open, onClose, imageFile, onCropComplete }: ImageCropperProps) => {
  const { t } = useLanguage();
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState<number>(1);
  const [aspect] = useState<number>(1); // Ratio 1:1 pour photo de profil
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Référence pour gérer le focus
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Optimisation : utiliser un useCallback pour gérer le chargement de l'image
  const loadImage = useCallback(async (file: File) => {
    try {
      // Utiliser FileReader pour lire le fichier de manière asynchrone
      const reader = new FileReader();
      
      const loadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as data URL'));
          }
        };
        reader.onerror = () => reject(reader.error || new Error('Error reading file'));
      });
      
      reader.readAsDataURL(file);
      const dataUrl = await loadPromise;
      
      // Mesurer la performance de chargement
      if (performance && performance.mark) {
        performance.mark('image-loaded');
      }
      
      setImgSrc(dataUrl);
      setScale(1); // Réinitialiser le zoom
    } catch (error) {
      console.error('Error loading image:', error);
      ToastService.error(
        t('common.errorTitle'),
        t('profile.imageLoadError')
      );
    }
  }, [t]);
  
  // Charger l'image lorsque le fichier change
  useEffect(() => {
    if (!imageFile) return;
    
    // Mesurer la performance
    if (performance && performance.mark) {
      performance.mark('image-loading-start');
    }
    
    loadImage(imageFile);
    
    // Cleanup pour éviter les fuites mémoire
    return () => {
      if (imgSrc) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [imageFile, loadImage, imgSrc]);
  
  // Mettre le focus sur le bouton de sauvegarde quand la boîte de dialogue s'ouvre
  useEffect(() => {
    if (open && saveButtonRef.current) {
      // Petit délai pour s'assurer que la boîte de dialogue est entièrement rendue
      const timer = setTimeout(() => {
        saveButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, completedCrop]);
  
  // Réinitialiser le crop lorsque l'image est chargée
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;
    
    // Centrer le recadrage par défaut
    const newCrop = centerAspectCrop(width, height, aspect);
    setCrop(newCrop);
    
    // Mesurer la performance de chargement
    if (performance && performance.mark) {
      performance.mark('image-displayed');
      performance.measure('image-load-to-display', 'image-loaded', 'image-displayed');
      
      // En développement, afficher la mesure
      if (process.env.NODE_ENV === 'development') {
        const measurements = performance.getEntriesByType('measure');
        const loadTime = measurements.find(m => m.name === 'image-load-to-display');
        if (loadTime) {
          console.log(`Image display time: ${loadTime.duration.toFixed(2)}ms`);
        }
      }
    }
  }, [aspect]);
  
  const handleZoomChange = useCallback((value: number[]) => {
    setScale(value[0]);
  }, []);
  
  const handleSave = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Notification de chargement
      const loadingToast = ToastService.loading(
        t('profile.processingImage'),
        t('profile.pleaseWait')
      );
      
      // Mesurer les performances
      const startTime = performance.now();
      
      const { blob, url } = await getCroppedImg(
        imgRef.current,
        completedCrop,
        imageFile?.name || 'cropped.jpg'
      );
      
      // Temps d'exécution
      const processTime = performance.now() - startTime;
      
      // Log des performances en développement
      if (process.env.NODE_ENV === 'development') {
        console.log(`Image cropping completed in ${processTime.toFixed(2)}ms`);
        console.log(`Result image size: ${(blob.size / 1024).toFixed(2)}KB`);
      }
      
      // Mettre à jour la notification
      loadingToast.success(
        t('profile.imageCropped'),
        t('profile.imageReady')
      );
      
      onCropComplete(url, blob);
      onClose();
      
    } catch (e) {
      console.error('Error cropping image:', e);
      ToastService.error(
        t('profile.cropError'),
        t('profile.tryAgain')
      );
    } finally {
      setIsProcessing(false);
    }
  }, [imgRef, completedCrop, imageFile, onCropComplete, onClose, t]);
  
  const handleCancel = useCallback(() => {
    // Libérer les ressources
    if (imgSrc) {
      URL.revokeObjectURL(imgSrc);
    }
    onClose();
  }, [imgSrc, onClose]);
  
  // Gestion des raccourcis clavier
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  }, [handleCancel, handleSave]);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
        aria-labelledby="crop-dialog-title"
      >
        <DialogHeader>
          <DialogTitle id="crop-dialog-title">{t('profile.cropImage')}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col items-center" aria-live="polite">
          {imgSrc ? (
            <>
              <div aria-label={t('profile.cropImageDescription')} role="img">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  circularCrop
                  ruleOfThirds
                >
                  <img
                    ref={imgRef}
                    alt={t('profile.imageToEdit')}
                    src={imgSrc}
                    style={{ transform: `scale(${scale})` }}
                    onLoad={onImageLoad}
                    className="max-h-[300px]" // Limiter la hauteur pour les grands écrans
                  />
                </ReactCrop>
              </div>
              
              <div className="mt-4 w-full flex items-center gap-2">
                <span id="zoom-slider-label" className="sr-only">{t('profile.adjustZoom')}</span>
                <ZoomOut 
                  className="h-4 w-4" 
                  aria-hidden="true"
                />
                <Slider
                  value={[scale]}
                  min={0.5}
                  max={3}
                  step={0.01}
                  onValueChange={handleZoomChange}
                  className="flex-1"
                  aria-labelledby="zoom-slider-label"
                  aria-valuemin={0.5}
                  aria-valuemax={3}
                  aria-valuenow={scale}
                />
                <ZoomIn 
                  className="h-4 w-4"
                  aria-hidden="true" 
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {t('profile.cropInstructions')}
              </div>
            </>
          ) : (
            <p>{t('profile.loadingImage')}</p>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            aria-label={t('common.cancel')}
            disabled={isProcessing}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            ref={saveButtonRef}
            aria-label={t('common.save')}
            disabled={!completedCrop || isProcessing}
          >
            {isProcessing ? t('common.processing') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;