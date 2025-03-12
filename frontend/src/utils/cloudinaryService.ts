/**
 * Service pour gérer les uploads vers Cloudinary
 */
import brain from 'brain';

// Types pour faciliter l'utilisation
export interface CloudinaryUploadConfig {
  folder: string;
  public_id?: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  // ... autres propriétés retournées par Cloudinary
}

/**
 * Obtenir les informations de signature pour upload sécurisé vers Cloudinary
 */
export const getUploadSignature = async (config: CloudinaryUploadConfig) => {
  try {
    const response = await brain.generate_signature(config);
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la génération de la signature Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload direct d'un fichier vers Cloudinary
 */
export const uploadToCloudinary = async (
  file: File, 
  config: CloudinaryUploadConfig
): Promise<CloudinaryUploadResult> => {
  // Obtenir les informations de signature du serveur
  const signatureData = await getUploadSignature(config);
  
  // Préparer le FormData pour l'upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.api_key);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder);
  
  // Ajouter l'ID public s'il est fourni
  if (signatureData.public_id) {
    formData.append('public_id', signatureData.public_id);
  }
  
  // Faire l'upload directement à Cloudinary
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  if (!uploadResponse.ok) {
    throw new Error(`Erreur d'upload: ${uploadResponse.statusText}`);
  }
  
  return await uploadResponse.json();
};

/**
 * Fonction pour vérifier le statut de la connexion à Cloudinary
 */
export const checkCloudinaryStatus = async () => {
  try {
    const response = await brain.check_status();
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la vérification du statut Cloudinary:', error);
    throw error;
  }
};
