import React from 'react';
import { Plus, FileEdit, Calendar, Settings, User, CreditCard, LogOut, Users, Home, File, Package } from 'lucide-react';

interface Props {
  onClick: () => void;
  icon: string;
  label: string;
  primary?: boolean;
}

export function DashboardActionButton({ onClick, icon, label, primary = false }: Props) {
  // Map des icônes disponibles
  const iconMap: Record<string, React.ReactElement> = {
    Plus: <Plus size={16} />,
    Edit: <FileEdit size={16} />,
    Calendar: <Calendar size={16} />,
    Settings: <Settings size={16} />,
    User: <User size={16} />,
    CreditCard: <CreditCard size={16} />,
    LogOut: <LogOut size={16} />,
    Users: <Users size={16} />,
    Home: <Home size={16} />,
    File: <File size={16} />,
    Package: <Package size={16} />
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${primary 
        ? 'bg-primary text-white hover:bg-primary/90'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
    >
      <span className="mr-2">{iconMap[icon] || icon}</span>
      {label}
    </button>
  );
}
