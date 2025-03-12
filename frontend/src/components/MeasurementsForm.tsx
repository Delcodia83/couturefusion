import React, { useState, useEffect } from 'react';
import useClientProfileStore, { MeasurementProfile } from '../utils/clientProfileStore';
import { toast } from 'sonner';

interface Props {
  userId: string;
  measurements: MeasurementProfile | null | undefined;
}

export function MeasurementsForm({ userId, measurements }: Props) {
  const { updateMeasurements } = useClientProfileStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'detailed'>('basic');
  
  const initialState: MeasurementProfile = {
    chest: null,
    waist: null,
    hips: null,
    inseam: null,
    shoulder: null,
    sleeve: null,
    neck: null,
    thigh: null,
    calf: null,
    ankle: null,
    frontWaistLength: null,
    backWaistLength: null,
    acrossFront: null,
    acrossBack: null,
    bustPoint: null,
    armhole: null,
    wrist: null,
    riseHeight: null,
  };
  
  const [formData, setFormData] = useState<MeasurementProfile>(initialState);
  
  useEffect(() => {
    if (measurements) {
      setFormData(measurements);
    }
  }, [measurements]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : parseFloat(value)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateMeasurements(userId, formData);
      toast.success('Measurements saved successfully');
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast.error('Failed to save measurements');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render a measurement input field
  const MeasurementField = ({ label, name, value }: { label: string; name: keyof MeasurementProfile; value: number | null }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} (cm)
      </label>
      <input
        type="number"
        id={name}
        name={name}
        value={value === null ? '' : value}
        onChange={handleInputChange}
        min="0"
        step="0.1"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        placeholder="0.0"
      />
    </div>
  );
  
  return (
    <div>
      {/* Measurement Help Notice */}
      <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">
        <h3 className="text-lg font-medium mb-2">How to Take Measurements</h3>
        <p className="text-sm">
          For the most accurate fit, we recommend having someone else take your measurements while you stand in a relaxed position.
          Use a flexible measuring tape and measure in centimeters for best results.
        </p>
        <a 
          href="#" 
          className="mt-2 inline-block text-sm text-primary hover:underline"
          onClick={(e) => {
            e.preventDefault();
            // This could open a modal with detailed measurement guides in the future
            toast.info('Detailed measurement guides coming soon!');
          }}
        >
          View detailed measurement guide
        </a>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`pb-4 px-1 ${activeTab === 'basic' 
              ? 'border-b-2 border-primary font-medium text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Basic Measurements
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`pb-4 px-1 ${activeTab === 'detailed' 
              ? 'border-b-2 border-primary font-medium text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Detailed Measurements
          </button>
        </nav>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'basic' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MeasurementField label="Chest/Bust" name="chest" value={formData.chest} />
            <MeasurementField label="Waist" name="waist" value={formData.waist} />
            <MeasurementField label="Hips" name="hips" value={formData.hips} />
            <MeasurementField label="Shoulder Width" name="shoulder" value={formData.shoulder} />
            <MeasurementField label="Sleeve Length" name="sleeve" value={formData.sleeve} />
            <MeasurementField label="Inseam" name="inseam" value={formData.inseam} />
            <MeasurementField label="Neck" name="neck" value={formData.neck} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MeasurementField label="Thigh" name="thigh" value={formData.thigh} />
            <MeasurementField label="Calf" name="calf" value={formData.calf} />
            <MeasurementField label="Ankle" name="ankle" value={formData.ankle} />
            <MeasurementField label="Front Waist Length" name="frontWaistLength" value={formData.frontWaistLength} />
            <MeasurementField label="Back Waist Length" name="backWaistLength" value={formData.backWaistLength} />
            <MeasurementField label="Across Front" name="acrossFront" value={formData.acrossFront} />
            <MeasurementField label="Across Back" name="acrossBack" value={formData.acrossBack} />
            <MeasurementField label="Bust Point" name="bustPoint" value={formData.bustPoint} />
            <MeasurementField label="Armhole" name="armhole" value={formData.armhole} />
            <MeasurementField label="Wrist" name="wrist" value={formData.wrist} />
            <MeasurementField label="Rise Height" name="riseHeight" value={formData.riseHeight} />
          </div>
        )}
        
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
              'Save Measurements'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}