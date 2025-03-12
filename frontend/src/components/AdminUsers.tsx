import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { firebaseApp } from "app";
import { collection, getDocs, getFirestore, query, where, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

const db = getFirestore(firebaseApp);

interface User {
  id: string;
  email: string;
  displayName: string;
  userType: string;
  isActive: boolean;
  createdAt: Date;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUserType, setFilterUserType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);
      
      const fetchedUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        fetchedUsers.push({
          id: doc.id,
          email: userData.email || "",
          displayName: userData.displayName || "",
          userType: userData.userType || "client",
          isActive: userData.isActive !== false, // Default to true if not set
          createdAt: userData.createdAt?.toDate() || new Date(),
        });
      });
      
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters whenever search term or filter changes
    let result = users;
    
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        user => user.displayName.toLowerCase().includes(lowerCaseSearch) || 
               user.email.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    if (filterUserType) {
      result = result.filter(user => user.userType === filterUserType);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filterUserType, users]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isActive: !currentStatus
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );
      
      toast.success(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Erreur lors de la modification du statut de l'utilisateur");
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        userType: newRole
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, userType: newRole } : user
        )
      );
      
      toast.success("Rôle de l'utilisateur mis à jour avec succès");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Erreur lors de la mise à jour du rôle de l'utilisateur");
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end">
        <div className="flex-1">
          <Label htmlFor="search-users">Rechercher</Label>
          <Input
            id="search-users"
            placeholder="Rechercher par nom ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <Label htmlFor="filter-usertype">Type d'utilisateur</Label>
          <Select value={filterUserType} onValueChange={setFilterUserType}>
            <SelectTrigger id="filter-usertype">
              <SelectValue placeholder="Tous les utilisateurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les utilisateurs</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="tailor">Tailleurs</SelectItem>
              <SelectItem value="admin">Administrateurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={() => {
          setSearchTerm("");
          setFilterUserType("");
        }}>
          Réinitialiser
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.userType === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.userType === 'tailor' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.userType === 'tailor' ? 'Tailleur' : 
                       user.userType === 'admin' ? 'Admin' : 'Client'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={user.isActive} 
                      onCheckedChange={() => handleToggleUserStatus(user.id, user.isActive)}
                    />
                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les informations de {selectedUser?.displayName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user-role">Type d'utilisateur</Label>
                <Select 
                  defaultValue={selectedUser.userType}
                  onValueChange={(value) => handleUpdateUserRole(selectedUser.id, value)}
                >
                  <SelectTrigger id="user-role">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="tailor">Tailleur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;