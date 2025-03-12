import React, { useState, useEffect } from 'react';
import useTailorProfileStore, { TailorProfile } from '../utils/tailorProfileStore';
import { toast } from 'sonner';

interface Props {
  userId: string;
  profile: TailorProfile | null;
}

type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface BusinessHours {
  [key in Day]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export function BusinessHoursForm({ userId, profile }: Props) {
  const { updateProfile } = useTailorProfileStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const initialBusinessHours: BusinessHours = {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '13:00', closed: false },
    sunday: { open: '09:00', close: '13:00', closed: true },
  };
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>(initialBusinessHours);
  
  const days: Array<{key: Day, label: string}> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];
  
  useEffect(() => {
    if (profile && profile.businessHours) {
      setBusinessHours(profile.businessHours as BusinessHours);
    }
  }, [profile]);
  
  const handleHoursChange = (day: Day, field: 'open' | 'close', value: string) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };
  
  const handleClosedToggle = (day: Day) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed
      }
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateProfile(userId, { businessHours });
      toast.success('Business hours updated successfully');
    } catch (error) {
      console.error('Error saving business hours:', error);
      toast.error('Failed to save business hours');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-blue-700 mb-6">
        <p className="text-sm">
          Set your regular business hours. Clients will see these hours on your profile.
          You can mark days as closed if you don't operate on those days.
        </p>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Day</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Open</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Close</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Closed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {days.map(({ key, label }) => (
              <tr key={key}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{label}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <input
                    type="time"
                    value={businessHours[key].open}
                    onChange={(e) => handleHoursChange(key, 'open', e.target.value)}
                    disabled={businessHours[key].closed}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <input
                    type="time"
                    value={businessHours[key].close}
                    onChange={(e) => handleHoursChange(key, 'close', e.target.value)}
                    disabled={businessHours[key].closed}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <input
                    type="checkbox"
                    checked={businessHours[key].closed}
                    onChange={() => handleClosedToggle(key)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            'Save Business Hours'
          )}
        </button>
      </div>
    </form>
  );
}