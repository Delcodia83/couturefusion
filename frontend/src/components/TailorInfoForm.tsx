import React, { useState, useEffect } from 'react';
import useTailorProfileStore, { TailorProfile } from '../utils/tailorProfileStore';
import { toast } from 'sonner';

interface Props {
  userId: string;
  profile: TailorProfile | null;
}

export function TailorInfoForm({ userId, profile }: Props) {
  const { createProfile, updateProfile } = useTailorProfileStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phoneNumber: '',
    address: '',
    bio: '',
    specialties: [] as string[],
    yearsOfExperience: 0,
  });
  
  // Specialty options
  const specialtyOptions = [
    'Wedding Attire',
    'Formal Wear',
    'Traditional Clothing',
    'Casual Wear',
    'Alterations',
    'Custom Design',
    'Children Clothing',
    'Uniforms',
  ];
  
  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || '',
        ownerName: profile.ownerName || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        bio: profile.bio || '',
        specialties: profile.specialties || [],
        yearsOfExperience: profile.yearsOfExperience || 0,
      });
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'yearsOfExperience') {
        return {
          ...prev,
          [name]: parseInt(value) || 0
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => {
      const currentSpecialties = [...prev.specialties];
      if (currentSpecialties.includes(specialty)) {
        return {
          ...prev,
          specialties: currentSpecialties.filter(s => s !== specialty)
        };
      } else {
        return {
          ...prev,
          specialties: [...currentSpecialties, specialty]
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
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
          Business Name
        </label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Enter your business name"
        />
      </div>
      
      <div>
        <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
          Owner Name
        </label>
        <input
          type="text"
          id="ownerName"
          name="ownerName"
          value={formData.ownerName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Enter owner's name"
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
          placeholder="Enter your business phone number"
        />
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Business Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          value={formData.address}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Enter your business address"
        />
      </div>
      
      <div>
        <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
          Years of Experience
        </label>
        <input
          type="number"
          id="yearsOfExperience"
          name="yearsOfExperience"
          min="0"
          value={formData.yearsOfExperience}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialties
        </label>
        <div className="flex flex-wrap gap-2">
          {specialtyOptions.map(specialty => (
            <button
              key={specialty}
              type="button"
              onClick={() => handleSpecialtyToggle(specialty)}
              className={`px-3 py-1 rounded-full text-sm ${formData.specialties.includes(specialty) 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Business Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Tell clients about your business and expertise"
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
            'Save Business Information'
          )}
        </button>
      </div>
    </form>
  );
}