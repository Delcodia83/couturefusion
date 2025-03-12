import { useEffect } from 'react';
import { useUserRoleStore } from './userRoleStore';
import useAppSettingsStore from './appSettingsStore';

// Hook pour initialiser les données de l'application
export const useAppInit = () => {
  const { initializeRole } = useUserRoleStore();
  const { fetchSettings } = useAppSettingsStore();

  useEffect(() => {
    // Initialiser les rôles et paramètres au démarrage
    initializeRole();
    fetchSettings();
  }, [initializeRole, fetchSettings]);

  return null;
};

// Initialize app immediately when imported
export const initializeApp = () => {
  const { initializeRole } = useUserRoleStore.getState();
  const { fetchSettings } = useAppSettingsStore.getState();
  
  // Appeler les fonctions d'initialisation (non-hooks)
  Promise.all([
    initializeRole(),
    fetchSettings()
  ]).catch(error => {
    console.error('Error initializing app:', error);
  });
};
