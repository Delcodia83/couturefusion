import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import useTailorProfileStore, { OrderStatus } from '../utils/tailorProfileStore';
import { StatsCard } from 'components/StatsCard';
import { OrdersList } from 'components/OrdersList';
import { DashboardActionButton } from 'components/DashboardActionButton';

export default function TailorDashboard() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { 
    profile, 
    orders, 
    stats, 
    fetchProfile, 
    fetchOrders, 
    fetchStats,
    isLoading, 
    error 
  } = useTailorProfileStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');

  useEffect(() => {
    if (user) {
      fetchProfile(user.uid);
      fetchOrders(user.uid);
      fetchStats(user.uid);
    }
  }, [user, fetchProfile, fetchOrders, fetchStats]);

  const pendingOrders = orders.filter(order => 
    order.status !== OrderStatus.COMPLETED && 
    order.status !== OrderStatus.DELIVERED && 
    order.status !== OrderStatus.CANCELLED
  );

  const completedOrders = orders.filter(order => 
    order.status === OrderStatus.COMPLETED || 
    order.status === OrderStatus.DELIVERED
  );

  const getDisplayOrders = () => {
    switch(activeTab) {
      case 'pending':
        return pendingOrders;
      case 'completed':
        return completedOrders;
      case 'all':
      default:
        return orders;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.businessName ? `${profile.businessName} Dashboard` : 'My Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {profile?.ownerName || user?.displayName || 'Tailor'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <DashboardActionButton 
              onClick={() => navigate('/tailor-profile')} 
              icon="✏️" 
              label="Edit Profile"
            />
            <DashboardActionButton 
              onClick={() => navigate('/tailor-designs')} 
              icon="🎨" 
              label="My Designs"
            />
            <DashboardActionButton 
              onClick={() => navigate('/create-order')} 
              icon="➕" 
              label="New Order"
              primary
            />
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Orders" 
            value={stats?.totalOrders || 0} 
            icon="📊"
            loading={isLoading}
          />
          <StatsCard 
            title="Pending Orders" 
            value={stats?.pendingOrders || 0} 
            icon="⏳"
            loading={isLoading}
          />
          <StatsCard 
            title="Completed Orders" 
            value={stats?.completedOrders || 0} 
            icon="✅"
            loading={isLoading}
          />
          <StatsCard 
            title="This Month Revenue" 
            value={stats?.thisMonthRevenue || 0} 
            icon="💰"
            loading={isLoading}
            useCurrencyFormat
          />
        </div>
        
        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 text-sm font-medium ${activeTab === 'pending' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Pending Orders ({pendingOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 text-sm font-medium ${activeTab === 'completed' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Completed Orders ({completedOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 text-sm font-medium ${activeTab === 'all' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                All Orders ({orders.length})
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            <OrdersList orders={getDisplayOrders()} isLoading={isLoading} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}