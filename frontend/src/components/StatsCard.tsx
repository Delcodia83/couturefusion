import React from 'react';
import useAppSettingsStore from '../utils/appSettingsStore';

interface Props {
  title: string;
  value: number | string;
  icon?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  useCurrencyFormat?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  prefix = '', 
  suffix = '', 
  loading = false,
  useCurrencyFormat = false 
}: Props) {
  const { formatCurrency } = useAppSettingsStore();
  
  const renderValue = () => {
    if (typeof value === 'number' && useCurrencyFormat) {
      return formatCurrency(value);
    }
    return `${prefix}${value}${suffix}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      
      <div className="mt-2">
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">
            {renderValue()}
          </p>
        )}
      </div>
    </div>
  );
}
