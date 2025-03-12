import { create } from 'zustand';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from './firebase';
import { firebaseApp } from 'app';
import { getStorage } from 'firebase/storage';

// Type de catégorie de modèle
export enum DesignCategory {
  DRESS = 'dress',
  SUIT = 'suit',
  SHIRT = 'shirt',
  PANTS = 'pants',
  SKIRT = 'skirt',
  COAT = 'coat',
  ACCESSORY = 'accessory',
  OTHER = 'other'
}

// Interface pour le modèle
export interface Design {
  id: string;
  tailorId: string;
  name: string;
  description: string;
  category: DesignCategory;
  images: string[];
  price: number;
  estimatedTime: number; // En jours
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

// Interface pour le formulaire de création/édition
export interface DesignFormData {
  name: string;
  description: string;
  category: DesignCategory;
  price: number;
  estimatedTime: number;
  isPublic: boolean;
}

// Interface pour le state du store
interface DesignCatalogState {
  designs: Design[];
  isLoading: boolean;
  error: string | null;
  fetchDesigns: (tailorId?: string, category?: DesignCategory, isPublic?: boolean) => Promise<void>;
  fetchDesignById: (designId: string) => Promise<Design | null>;
  createDesign: (tailorId: string, formData: DesignFormData, imageFiles: File[]) => Promise<Design>;
  updateDesign: (designId: string, formData: DesignFormData, newImageFiles?: File[], imagesToDelete?: string[]) => Promise<Design>;
  deleteDesign: (designId: string) => Promise<void>;
  uploadImage: (designId: string, file: File) => Promise<string>;
  deleteImage: (designId: string, imageUrl: string) => Promise<void>;
}

// Création du store Zustand
const useDesignCatalogStore = create<DesignCatalogState>((set, get) => {
  // Obtenir une référence au storage Firebase
  const storage = getStorage(firebaseApp);
  
  return {
    designs: [],
    isLoading: false,
    error: null,

    // Récupérer la liste des modèles
    fetchDesigns: async (tailorId?: string, category?: DesignCategory, isPublic?: boolean) => {
      set({ isLoading: true, error: null });
      try {
        let designsQuery = collection(db, 'designs');
        let constraints = [];
        
        // Construire la requête en fonction des paramètres
        if (tailorId) {
          constraints.push(where('tailorId', '==', tailorId));
        }
        
        if (category) {
          constraints.push(where('category', '==', category));
        }
        
        if (isPublic !== undefined) {
          constraints.push(where('isPublic', '==', isPublic));
        }
        
        // Appliquer les contraintes si elles existent
        const designsRef = constraints.length > 0 
          ? query(designsQuery, ...constraints) 
          : designsQuery;
        
        const querySnapshot = await getDocs(designsRef);
        const designsData = querySnapshot.docs.map(doc => doc.data() as Design);
        
        set({ designs: designsData, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch designs';
        set({ error: errorMessage, isLoading: false });
        console.error('Error fetching designs:', error);
      }
    },

    // Récupérer un modèle par son ID
    fetchDesignById: async (designId: string) => {
      set({ isLoading: true, error: null });
      try {
        const docRef = doc(db, 'designs', designId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const designData = docSnap.data() as Design;
          return designData;
        } else {
          set({ error: 'Design not found', isLoading: false });
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch design';
        set({ error: errorMessage, isLoading: false });
        console.error('Error fetching design:', error);
        return null;
      } finally {
        set({ isLoading: false });
      }
    },

    // Créer un nouveau modèle
    createDesign: async (tailorId: string, formData: DesignFormData, imageFiles: File[]) => {
      set({ isLoading: true, error: null });
      try {
        const timestamp = Date.now();
        const designId = `design_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Upload des images
        const imageUrls: string[] = [];
        
        for (const file of imageFiles) {
          const imageUrl = await get().uploadImage(designId, file);
          imageUrls.push(imageUrl);
        }
        
        // Création du modèle
        const newDesign: Design = {
          id: designId,
          tailorId,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          images: imageUrls,
          price: formData.price,
          estimatedTime: formData.estimatedTime,
          isPublic: formData.isPublic,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        
        await setDoc(doc(db, 'designs', designId), newDesign);
        
        // Mettre à jour la liste des modèles
        set(state => ({
          designs: [...state.designs, newDesign],
          isLoading: false
        }));
        
        return newDesign;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create design';
        set({ error: errorMessage, isLoading: false });
        console.error('Error creating design:', error);
        throw error;
      }
    },

    // Mettre à jour un modèle existant
    updateDesign: async (designId: string, formData: DesignFormData, newImageFiles?: File[], imagesToDelete?: string[]) => {
      set({ isLoading: true, error: null });
      try {
        // Récupérer le modèle existant
        const existingDesign = await get().fetchDesignById(designId);
        
        if (!existingDesign) {
          throw new Error('Design not found');
        }
        
        // Gérer la suppression d'images
        let updatedImages = [...existingDesign.images];
        
        if (imagesToDelete && imagesToDelete.length > 0) {
          for (const imageUrl of imagesToDelete) {
            await get().deleteImage(designId, imageUrl);
            updatedImages = updatedImages.filter(url => url !== imageUrl);
          }
        }
        
        // Gérer l'ajout de nouvelles images
        if (newImageFiles && newImageFiles.length > 0) {
          for (const file of newImageFiles) {
            const imageUrl = await get().uploadImage(designId, file);
            updatedImages.push(imageUrl);
          }
        }
        
        // Mettre à jour le modèle
        const updatedDesign: Design = {
          ...existingDesign,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          images: updatedImages,
          price: formData.price,
          estimatedTime: formData.estimatedTime,
          isPublic: formData.isPublic,
          updatedAt: Date.now()
        };
        
        await updateDoc(doc(db, 'designs', designId), updatedDesign);
        
        // Mettre à jour la liste des modèles
        set(state => ({
          designs: state.designs.map(design => 
            design.id === designId ? updatedDesign : design
          ),
          isLoading: false
        }));
        
        return updatedDesign;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update design';
        set({ error: errorMessage, isLoading: false });
        console.error('Error updating design:', error);
        throw error;
      }
    },

    // Supprimer un modèle
    deleteDesign: async (designId: string) => {
      set({ isLoading: true, error: null });
      try {
        // Récupérer le modèle pour avoir les URLs des images
        const design = await get().fetchDesignById(designId);
        
        if (!design) {
          throw new Error('Design not found');
        }
        
        // Supprimer toutes les images
        for (const imageUrl of design.images) {
          await get().deleteImage(designId, imageUrl);
        }
        
        // Supprimer le document
        await deleteDoc(doc(db, 'designs', designId));
        
        // Mettre à jour la liste des modèles
        set(state => ({
          designs: state.designs.filter(design => design.id !== designId),
          isLoading: false
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete design';
        set({ error: errorMessage, isLoading: false });
        console.error('Error deleting design:', error);
        throw error;
      }
    },

    // Upload d'une image
    uploadImage: async (designId: string, file: File) => {
      try {
        // Créer un nom de fichier unique
        const timestamp = Date.now();
        const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        const extension = file.name.split('.').pop();
        const fullFileName = `${fileName}.${extension}`;
        
        // Chemin de stockage
        const storagePath = `designs/${designId}/images/${fullFileName}`;
        const storageRef = ref(storage, storagePath);
        
        // Upload de l'image
        await uploadBytes(storageRef, file);
        
        // Récupérer l'URL de téléchargement
        const downloadUrl = await getDownloadURL(storageRef);
        
        return downloadUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    },

    // Supprimer une image
    deleteImage: async (designId: string, imageUrl: string) => {
      try {
        // Extraire le chemin de l'URL pour obtenir la référence
        const urlObj = new URL(imageUrl);
        const pathWithParams = urlObj.pathname;
        const pathSegments = pathWithParams.split('/');
        const fileName = pathSegments[pathSegments.length - 1].split('?')[0];
        
        const storagePath = `designs/${designId}/images/${fileName}`;
        const storageRef = ref(storage, storagePath);
        
        // Supprimer l'image
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
      }
    }
  };
});

export default useDesignCatalogStore;