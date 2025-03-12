import React, { useState, useEffect } from 'react';
import useClientProfileStore, { ClientProfile } from '../utils/clientProfileStore';
import { toast } from 'sonner';

interface Props {
  userId: string;
  profile: ClientProfile | null;
}

export function PersonalInfoForm({ userId, profile }: Props) {
  const { createProfile, updateProfile } = useClientProfileStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    notes: '',
    preferredStyles: [] as string[],
  });
  
  // Popular style options
  const styleOptions = [
    'Classic',
    'Modern',
    'Casual',
    'Formal',
    'Business',
    'Traditional',
    'Ethnic',
    'Minimalist',
  ];
  
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        notes: profile.notes || '',
        preferredStyles: profile.preferredStyles || [],
      });
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStyleToggle = (style: string) => {
    setFormData(prev => {
      const currentStyles = [...prev.preferredStyles];
      if (currentStyles.includes(style)) {
        return {
          ...prev,
          preferredStyles: currentStyles.filter(s => s !== style)
        };
      } else {
        return {
          ...prev,
          preferredStyles: [...currentStyles, style]
        };
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (profile) {
        await updateProfile(userId, formData);
        toast.success('Profile updated successfully');
      } else {
        await createProfile(userId, formData);
        toast.success('Profile created successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Enter your full name"
        />
      </div>
      
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Enter your phone number"
        />
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          value={formData.address}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Enter your address"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Styles
        </label>
        <div className="flex flex-wrap gap-2">
          {styleOptions.map(style => (
            <button
              key={style}
              type="button"
              onClick={() => handleStyleToggle(style)}
              className={`px-3 py-1 rounded-full text-sm ${formData.preferredStyles.includes(style) 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Special Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Any special preferences or notes for tailors"
        />
      </div>
      
      <div className="pt-5">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">◷</span>
              Saving...
            </>
          ) : (
            'Save Personal Information'
          )}
        </button>
      </div>
    </form>
  );
}