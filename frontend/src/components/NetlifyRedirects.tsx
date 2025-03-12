import React, { useEffect } from "react";
import { NETLIFY_REDIRECTS_CONTENT } from "utils/netlifyRedirects";

/**
 * Composant pour générer dynamiquement le fichier _redirects pour Netlify
 * dans l'environnement de développement.
 * 
 * En production, utilisez un fichier _redirects statique dans le dossier public
 * ou un netlify.toml à la racine du projet.
 */
interface Props {}

export const NetlifyRedirects: React.FC<Props> = () => {
  useEffect(() => {
    console.log(
      "NetlifyRedirects: Pour déployer sur Netlify, assurez-vous d'avoir un fichier _redirects dans le dossier public avec: ",
      NETLIFY_REDIRECTS_CONTENT
    );
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
};
