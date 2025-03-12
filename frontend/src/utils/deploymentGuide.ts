/**
 * Guide de déploiement de CoutureFusion sur Netlify
 * 
 * Ce fichier contient des instructions pour déployer correctement
 * l'application CoutureFusion sur Netlify.
 */

/**
 * Configuration requise pour Netlify
 */
export const netlifySetup = {
  buildSettings: {
    buildCommand: "npm run build",
    publishDirectory: "dist",
    nodeVersion: "20.x"
  },
  
  environmentVariables: [
    // Firebase - à récupérer depuis votre projet Firebase
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
    
    // API URLs
    "VITE_API_URL", // URL du backend
    
    // Services tiers
    "VITE_CLOUDINARY_CLOUD_NAME",
    "VITE_CLOUDINARY_UPLOAD_PRESET",
    "VITE_PAYTECH_API_KEY"
  ],
  
  requiredFiles: [
    {
      path: "_redirects", 
      content: "/* /index.html 200",
      location: "racine du dossier dist ou public"
    },
    {
      path: "netlify.toml",
      content: `[build]\n  command = "npm run build"\n  publish = "dist"\n\n[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200`,
      location: "racine du projet"
    }
  ],
  
  setupSteps: [
    "1. Créer un compte Netlify et connecter votre dépôt GitHub",
    "2. Configurer les paramètres de build comme indiqué ci-dessus",
    "3. Ajouter les variables d'environnement nécessaires",
    "4. Assurer que les fichiers _redirects et netlify.toml sont présents",
    "5. Déployer l'application",
    "6. Configurer un domaine personnalisé (optionnel)"
  ]
};

/**
 * Après le déploiement, vérifiez les points suivants
 */
export const postDeploymentChecklist = [
  "Vérifier que l'authentification Firebase fonctionne correctement",
  "Vérifier que les redirections fonctionnent pour toutes les routes",
  "S'assurer que l'application peut se connecter au backend",
  "Tester le processus d'inscription et de connexion",
  "Tester les fonctionnalités clients et tailleurs",
  "Tester le panneau d'administration",
  "Vérifier que Cloudinary fonctionne pour l'upload d'images",
  "Tester les paiements avec PayTech"
];

/**
 * Problèmes courants et solutions
 */
export const troubleshootingGuide = [
  {
    problem: "Routes non trouvées (404) lors de l'actualisation de la page",
    solution: "Vérifier que le fichier _redirects est bien présent et contient '/* /index.html 200'"
  },
  {
    problem: "Problèmes d'authentification Firebase",
    solution: "Vérifier que le domaine Netlify est autorisé dans la console Firebase"
  },
  {
    problem: "Variables d'environnement non définies",
    solution: "Ajouter les variables manquantes dans les paramètres du site Netlify"
  },
  {
    problem: "Connexion au backend échoue",
    solution: "Vérifier que l'URL du backend est correcte et accessible publiquement"
  }
];
