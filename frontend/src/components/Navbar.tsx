import React from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../utils/authStore";
import { authRoutes } from "../utils/auth-routes";
import { UserRole } from "../utils/firebase";
import { useUserRoleStore } from "../utils/userRoleStore";

export interface Props {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: Props) {
  const navigate = useNavigate();
  const { user, logout, initialized } = useAuthStore();
  const { role } = useUserRoleStore();
  
  const isAdmin = role === UserRole.ADMIN;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle navigation to dashboard based on user role
  const handleDashboardClick = () => {
    if (user) {
      const dashboardPath = authRoutes.getRedirectPath(user.role);
      navigate(dashboardPath);
    }
  };

  return (
    <nav className={`w-full py-4 ${transparent ? 'absolute top-0 z-10' : 'bg-white shadow-sm'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-semibold text-primary">CoutureFusion</Link>
        </div>
        
        <div className="hidden md:flex space-x-6">
          {!user && (
            <>
              <a href="#features" className="text-gray-700 hover:text-primary transition-colors">Features</a>
              <a href="#tailors" className="text-gray-700 hover:text-primary transition-colors">For Tailors</a>
              <a href="#clients" className="text-gray-700 hover:text-primary transition-colors">For Clients</a>
              <Link to="/designs" className="text-gray-700 hover:text-primary transition-colors">Designs</Link>
            </>
          )}
          {user && (
            <>
              <button 
                onClick={handleDashboardClick}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Dashboard
              </button>
              {user.role === UserRole.CLIENT && (
                <>
                  <Link 
                    to="/designs" 
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Designs
                  </Link>
                  <Link 
                    to="/client-profile" 
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    My Profile
                  </Link>
                </>
              )}
              {user.role === UserRole.TAILOR && (
                <>
                  <Link 
                    to="/tailor-profile" 
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/tailor-dashboard" 
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Orders
                  </Link>
                  <Link 
                    to="/tailor-designs" 
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    My Designs
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link 
                  to="/admin-settings" 
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Admin Settings
                </Link>
              )}
            </>
          )}
        </div>
        
        <div className="flex space-x-4">
          {initialized && !user ? (
            <>
              <button 
                onClick={() => navigate("/login")} 
                className="px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate("/register")} 
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                Get Started
              </button>
            </>
          ) : initialized && user ? (
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
            >
              Log Out
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
