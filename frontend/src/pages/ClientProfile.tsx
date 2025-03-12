import React, { useEffect, useState } from 'react';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import useAuthStore from '../utils/authStore';
import useClientProfileStore from '../utils/clientProfileStore';
import { PersonalInfoForm } from 'components/PersonalInfoForm';
import { MeasurementsForm } from 'components/MeasurementsForm';

export default function ClientProfile() {
  const { user } = useAuthStore();
  const { profile, fetchProfile, isLoading, error } = useClientProfileStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'measurements'>('personal');

  useEffect(() => {
    if (user) {
      fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('personal')}
                className={`pb-4 px-1 ${activeTab === 'personal' 
                  ? 'border-b-2 border-primary font-medium text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('measurements')}
                className={`pb-4 px-1 ${activeTab === 'measurements' 
                  ? 'border-b-2 border-primary font-medium text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                My Measurements
              </button>
            </nav>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <div>
              {/* Tab Content */}
              {activeTab === 'personal' ? (
                <PersonalInfoForm userId={user.uid} profile={profile} />
              ) : (
                <MeasurementsForm userId={user.uid} measurements={profile?.measurements} />
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}