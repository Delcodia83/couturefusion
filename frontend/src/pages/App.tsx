import React, { useEffect } from "react";
import { useAppInit } from "../utils/appInit";
import { Navbar } from "components/Navbar";
import { HeroSection } from "components/HeroSection";
import { FeaturesSection } from "components/FeaturesSection";
import { ForTailorsSection } from "components/ForTailorsSection";
import { ForClientsSection } from "components/ForClientsSection";
import { CtaSection } from "components/CtaSection";
import { Footer } from "components/Footer";
import { Toaster } from "components/Toaster";

import { RouteHandler } from "components/RouteHandler";
import { useCurrentUser } from "app";
import { useNavigate, useLocation } from "react-router-dom";
import { authRoutes } from "../utils/auth-routes";

export default function App() {
  // Initialiser l'application
  useAppInit();
  
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route is homepage
  const isHomePage = location.pathname === '/';
  
  // Check if current path matches any of our auth routes
  const isAuthPath = [
    '/login', 
    '/register', 
    '/client-dashboard', 
    '/tailor-dashboard', 
    '/admin-dashboard'
  ].includes(location.pathname);

  useEffect(() => {
    if (!loading && user && isHomePage) {
      // Get the user's role from the custom claims
      const userRole = user.customClaims?.role || 'client';
      // Only redirect from home page
      const redirectPath = authRoutes.getRedirectPath(userRole);
      navigate(redirectPath);
    }
  }, [user, loading, navigate, isHomePage]);

  // Show home page content only if we're on the home page
  return (
    <div className="min-h-screen">
      <Toaster />
      <Navbar transparent={isHomePage} />
      
      {isAuthPath ? (
        <RouteHandler />
      ) : (
        // Only show landing page content on home route
        <>
          <HeroSection />
          <FeaturesSection />
          <ForTailorsSection />
          <ForClientsSection />
          <CtaSection />
          <Footer />
        </>
      )}
    </div>
  );
}
