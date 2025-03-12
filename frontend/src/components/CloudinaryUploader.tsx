import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Trash2, Upload, Image } from 'lucide-react';
import { uploadToCloudinary, CloudinaryUploadResult } from '../utils/cloudinaryService';
import { toast } from 'sonner';

interface Props {
  onUploadSuccess: (result: CloudinaryUploadResult) => void;
  onUploadError?: (error: Error) => void;
  folder: string;
  publicId?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  acceptedFileTypes?: string;
  maxSizeMB?: number;
}

export function CloudinaryUploader({
  onUploadSuccess,
  onUploadError,
  folder,
  publicId,
  buttonText = 'Téléverser une image',
  buttonVariant = 'default',
  acceptedFileTypes = 'image/*',
  maxSizeMB = 5
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Gérer la sélection d'un fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier la taille du fichier
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`La taille du fichier dépasse la limite de ${maxSizeMB} Mo`);
      return;
    }
    
    // Créer une URL de prévisualisation
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    
    // Nettoyer l'URL de prévisualisation à la fin
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Simuler un clic sur l'input file caché
  const triggerFileSelection = () => {
    fileInputRef.current?.click();
  };
  
  // Démarrer l'upload vers Cloudinary
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Aucun fichier sélectionné');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(10); // Démarrer avec 10% pour montrer que ça commence
    
    try {
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const increment = Math.floor(Math.random() * 10);
          return Math.min(prev + increment, 90); // Cap à 90% avant confirmation
        });
      }, 300);
      
      // Faire l'upload réel vers Cloudinary
      const result = await uploadToCloudinary(selectedFile, {
        folder: folder,
        public_id: publicId
      });
      
      // Upload terminé
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Nettoyer et notifier le parent
      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        onUploadSuccess(result);
        toast.success('Image téléversée avec succès');
      }, 500);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      const err = error instanceof Error ? error : new Error('Erreur inconnue lors du téléversement');
      onUploadError?.(err);
      toast.error(`Erreur: ${err.message}`);
    }
  };
  
  // Annuler la sélection
  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  
  return (
    <div className="space-y-4">
      {/* Input file caché */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
      />
      
      {/* Aperçu de l'image sélectionnée */}
      {previewUrl && (
        <div className="relative w-full h-48 overflow-hidden rounded-md border border-gray-200">
          <img 
            src={previewUrl} 
            alt="Aperçu" 
            className="w-full h-full object-cover"
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
      
      {/* Barre de progression */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Téléversement en cours...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {/* Boutons d'action */}
      <div className="flex space-x-3">
        {!selectedFile ? (
          <Button 
            type="button" 
            variant={buttonVariant}
            onClick={triggerFileSelection}
            disabled={isUploading}
            className="flex items-center"
          >
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        ) : !isUploading ? (
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              variant="default" 
              onClick={handleUpload}
            >
              <Upload className="mr-2 h-4 w-4" />
              Téléverser
            </Button>
          </div>
        ) : null}
      </div>
      
      {/* Message d'aide */}
      {!selectedFile && !isUploading && (
        <div className="text-xs text-gray-500 mt-1 flex items-center">
          <Image className="mr-1 h-3 w-3" />
          Format recommandé: JPEG, PNG ou WebP. Taille max: {maxSizeMB} Mo
        </div>
      )}
    </div>
  );
}
