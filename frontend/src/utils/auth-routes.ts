import { UserRole } from "./firebase";

// Define route configurations and permissions
export const authRoutes = {
  // Public routes
  public: {
    home: "/",
    login: "/login",
    register: "/register"
  },
  
  // Protected routes by role
  protected: {
    [UserRole.CLIENT]: {
      dashboard: "/client-dashboard",
      profile: "/client-profile"
    },
    [UserRole.TAILOR]: {
      dashboard: "/tailor-dashboard",
      profile: "/tailor-profile"
    },
    [UserRole.ADMIN]: {
      dashboard: "/admin-dashboard"
    }
  },
  
  // Get the appropriate redirect path based on user role
  getRedirectPath: (role: UserRole | undefined) => {
    if (!role) return authRoutes.public.login;
    
    switch (role) {
      case UserRole.CLIENT:
        return '/client-dashboard';
      case UserRole.TAILOR:
        return '/tailor-dashboard';
      case UserRole.ADMIN:
        return '/admin-settings';
      default:
        return '/';
    }
  }
};
