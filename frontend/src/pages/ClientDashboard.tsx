import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import useAuthStore from '../utils/authStore';

export default function ClientDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Log Out
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-600">Welcome back, {user?.displayName || 'Client'}!</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Measurements</h2>
            <p className="text-gray-600 mb-4">Manage your body measurements for perfect-fitting garments.</p>
            <button 
              onClick={() => navigate('/client-profile')} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Manage Profile
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Orders</h2>
            <p className="text-gray-600 mb-4">You don't have any orders yet.</p>
            <button 
              onClick={() => navigate('/designs')} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Browse Tailors
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Designs</h2>
            <p className="text-gray-600 mb-4">You haven't saved any designs yet.</p>
            <button 
              onClick={() => navigate('/designs')} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Explore Designs
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}