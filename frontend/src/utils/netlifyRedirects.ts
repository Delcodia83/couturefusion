/**
 * Ce fichier aide à configurer les redirections Netlify
 * pour que l'application SPA (Single Page Application) fonctionne correctement.
 * 
 * Pour un déploiement réussi sur Netlify, veuillez suivre ces étapes:
 * 
 * 1. Créer un fichier _redirects dans le dossier public avec le contenu: /* /index.html 200
 * 2. Assurez-vous que le fichier netlify.toml a été créé à la racine du projet
 * 3. Configurez les variables d'environnement dans l'interface Netlify
 */

/**
 * Étape pour déployer sur Netlify:
 * 
 * 1. Connectez votre dépôt GitHub à Netlify
 * 2. Configurez les paramètres de build:
 *    - Build command: npm run build
 *    - Publish directory: dist
 * 3. Ajoutez les variables d'environnement nécessaires:
 *    - VITE_FIREBASE_API_KEY
 *    - VITE_FIREBASE_AUTH_DOMAIN
 *    - VITE_FIREBASE_PROJECT_ID
 *    - VITE_FIREBASE_STORAGE_BUCKET
 *    - VITE_FIREBASE_MESSAGING_SENDER_ID
 *    - VITE_FIREBASE_APP_ID
 *    - VITE_FIREBASE_MEASUREMENT_ID
 *    - VITE_API_URL (URL de votre backend)
 */

// Configuration pour Netlify
export const NETLIFY_REDIRECTS_CONTENT = '/* /index.html 200';

// Instructions pour le déploiement sur Netlify
export const NETLIFY_DEPLOYMENT_DOCS = {
  steps: [
    "Connecter le dépôt GitHub à Netlify",
    "Configurer la commande de build: npm run build",
    "Configurer le répertoire de publication: dist",
    "Ajouter les variables d'environnement Firebase et API"
  ],
  requiredFiles: [
    "_redirects dans /public",
    "netlify.toml à la racine"
  ]
};
