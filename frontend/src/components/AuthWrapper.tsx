import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../utils/authStore';
import { UserRole } from '../utils/firebaseAdapter';
import { authRoutes } from '../utils/auth-routes';

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectPath?: string;
}

export function AuthWrapper({ 
  children, 
  requiredRoles, 
  redirectPath = '/login' 
}: AuthWrapperProps) {
  const { user, initialized, initializeAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  // If auth is not initialized yet, show nothing (or a loading indicator)
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If roles are required, check if user has one of them
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on role
      const redirectTo = authRoutes.getRedirectPath(user.role);
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Render children
  return <>{children}</>;
}