import React, { useEffect, useState } from 'react';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import useTailorProfileStore from '../utils/tailorProfileStore';
import { TailorInfoForm } from 'components/TailorInfoForm';
import { BusinessHoursForm } from 'components/BusinessHoursForm';

export default function TailorProfile() {
  const { user } = useUserGuardContext();
  const { profile, fetchProfile, isLoading, error } = useTailorProfileStore();
  const [activeTab, setActiveTab] = useState<'info' | 'hours'>('info');

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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Business Profile</h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-4 px-1 ${activeTab === 'info' 
                  ? 'border-b-2 border-primary font-medium text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Business Information
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`pb-4 px-1 ${activeTab === 'hours' 
                  ? 'border-b-2 border-primary font-medium text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Business Hours
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
              {activeTab === 'info' ? (
                <TailorInfoForm userId={user.uid} profile={profile} />
              ) : (
                <BusinessHoursForm userId={user.uid} profile={profile} />
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}