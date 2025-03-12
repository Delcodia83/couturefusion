import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { firebaseApp } from "app";
import { collection, getDocs, getFirestore, query, where, orderBy, limit, Timestamp } from "firebase/firestore";

const db = getFirestore(firebaseApp);

interface StatsData {
  usersCount: number;
  tailorsCount: number;
  clientsCount: number;
  ordersCount: number;
  revenueTotal: number;
  activeSubscriptions: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminStats = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsData>({
    usersCount: 0,
    tailorsCount: 0,
    clientsCount: 0,
    ordersCount: 0,
    revenueTotal: 0,
    activeSubscriptions: 0,
  });
  
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [orderDistributionData, setOrderDistributionData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would fetch these from Firestore
        // For now, using mock data
        
        // Mock User Count
        const usersQuery = query(collection(db, "users"));
        const userSnapshot = await getDocs(usersQuery);
        const totalUsers = userSnapshot.size;
        
        // Count tailors vs clients
        const tailorsQuery = query(collection(db, "users"), where("userType", "==", "tailor"));
        const tailorSnapshot = await getDocs(tailorsQuery);
        const tailorCount = tailorSnapshot.size;
        
        const clientCount = totalUsers - tailorCount;
        
        // Orders count
        const ordersQuery = query(collection(db, "orders"));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersCount = ordersSnapshot.size;
        
        // Revenue calculation (in a real app, you'd sum the amounts from orders)
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
          const orderData = doc.data();
          if (orderData.totalPrice) {
            totalRevenue += orderData.totalPrice;
          }
        });
        
        // Active subscriptions
        const subscriptionsQuery = query(
          collection(db, "subscriptions"), 
          where("status", "==", "active")
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const activeSubscriptions = subscriptionsSnapshot.size;
        
        setStats({
          usersCount: totalUsers,
          tailorsCount: tailorCount,
          clientsCount: clientCount,
          ordersCount: ordersCount,
          revenueTotal: totalRevenue,
          activeSubscriptions: activeSubscriptions
        });
        
        // Generate mock growth data
        generateMockData();
        
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const generateMockData = () => {
      // User growth over time (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const userGrowth = months.map((month, index) => ({
        name: month,
        clients: Math.floor(20 + (index * 5) + Math.random() * 10),
        tailors: Math.floor(5 + (index * 2) + Math.random() * 5),
      }));
      setUserGrowthData(userGrowth);
      
      // Order distribution by status
      const orderDistribution = [
        { name: 'En attente', value: 15 },
        { name: 'En cours', value: 25 },
        { name: 'Terminé', value: 35 },
        { name: 'Annulé', value: 5 },
      ];
      setOrderDistributionData(orderDistribution);
      
      // Revenue over time
      const revenue = months.map((month, index) => ({
        name: month,
        revenue: Math.floor(5000 + (index * 2000) + Math.random() * 1000),
      }));
      setRevenueData(revenue);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full h-40 animate-pulse">
            <div className="h-full bg-gray-200 rounded-lg"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>Total des utilisateurs sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.usersCount}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {stats.tailorsCount} tailleurs · {stats.clientsCount} clients
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Commandes</CardTitle>
          <CardDescription>Total des commandes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.ordersCount}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {Math.round(stats.ordersCount / (stats.usersCount || 1) * 10) / 10} commandes/utilisateur en moyenne
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Revenus</CardTitle>
          <CardDescription>Chiffre d'affaires total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.revenueTotal.toLocaleString()} FCFA</div>
          <div className="text-sm text-muted-foreground mt-1">
            {stats.activeSubscriptions} abonnements actifs
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <Card className="col-span-full md:col-span-2 mt-6">
        <CardHeader>
          <CardTitle>Croissance des Utilisateurs</CardTitle>
          <CardDescription>Évolution du nombre d'utilisateurs ces 6 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="clients" stackId="1" stroke="#8884d8" fill="#8884d8" name="Clients" />
                <Area type="monotone" dataKey="tailors" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Tailleurs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Répartition des Commandes</CardTitle>
          <CardDescription>Par statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {orderDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-full mt-6">
        <CardHeader>
          <CardTitle>Revenus Mensuels</CardTitle>
          <CardDescription>Évolution des revenus ces 6 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Revenu']} />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminStats;