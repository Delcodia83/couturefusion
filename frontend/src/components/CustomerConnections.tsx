import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Clock, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCustomerIdStore, { CustomerConnection } from "../utils/customerIdStore";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Props {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: "client" | "tailor";
}

export function CustomerConnections({ userId, userEmail, userName, userRole }: Props) {
  const { fetchConnections, createConnection, updateConnectionStatus, connections, pending, accepted, isLoading } = useCustomerIdStore();
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchConnections(userId);
    }
  }, [userId]);

  const handleCreateConnection = async () => {
    if (!partnerEmail || !partnerName) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      if (userRole === "client") {
        await createConnection({
          clientId: userId,
          tailorId: "", // Sera rempli plus tard quand le tailleur acceptera
          clientName: userName,
          tailorName: partnerName,
          clientEmail: userEmail,
          tailorEmail: partnerEmail
        });
      } else {
        await createConnection({
          clientId: "", // Sera rempli plus tard quand le client acceptera
          tailorId: userId,
          clientName: partnerName,
          tailorName: userName,
          clientEmail: partnerEmail, 
          tailorEmail: userEmail
        });
      }

      toast.success("Demande de connexion envoyée !");
      setPartnerEmail("");
      setPartnerName("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating connection:", error);
      toast.error("Une erreur est survenue lors de l'envoi de la demande.");
    }
  };

  const handleUpdateStatus = async (connectionId: string, status: "accepted" | "rejected") => {
    try {
      await updateConnectionStatus(connectionId, status);
      toast.success(`Demande ${status === "accepted" ? "acceptée" : "refusée"} avec succès !`);
    } catch (error) {
      console.error("Error updating connection status:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du statut.");
    }
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "accepted":
        return <Check className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getConnectionStatusText = (connection: CustomerConnection) => {
    const isOutgoing = (userRole === "client" && connection.clientEmail === userEmail) || 
                      (userRole === "tailor" && connection.tailorEmail === userEmail);

    if (connection.status === "pending") {
      return isOutgoing ? "En attente de réponse" : "En attente de votre réponse";
    } else if (connection.status === "accepted") {
      return "Connecté";
    } else {
      return "Refusé";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Connexions {userRole === "client" ? "Tailleurs" : "Clients"}</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter une connexion</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un{userRole === "client" ? " tailleur" : " client"}</DialogTitle>
              <DialogDescription>
                Entrez les informations du {userRole === "client" ? "tailleur" : "client"} avec qui vous souhaitez établir une connexion.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder={userRole === "client" ? "Nom du tailleur" : "Nom du client"}
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={userRole === "client" ? "Email du tailleur" : "Email du client"}
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleCreateConnection} disabled={isLoading}>
                {isLoading ? "Chargement..." : "Envoyer la demande"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Actives</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {accepted.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune connexion active pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accepted.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  userRole={userRole}
                  renderStatusIcon={renderStatusIcon}
                  getConnectionStatusText={getConnectionStatusText}
                  formatDate={formatDate}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune demande en attente.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pending.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  userRole={userRole}
                  renderStatusIcon={renderStatusIcon}
                  getConnectionStatusText={getConnectionStatusText}
                  formatDate={formatDate}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {connections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune connexion trouvée.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  userRole={userRole}
                  renderStatusIcon={renderStatusIcon}
                  getConnectionStatusText={getConnectionStatusText}
                  formatDate={formatDate}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ConnectionCardProps {
  connection: CustomerConnection;
  userRole: "client" | "tailor";
  renderStatusIcon: (status: string) => React.ReactNode;
  getConnectionStatusText: (connection: CustomerConnection) => string;
  formatDate: (date: Date) => string;
  onUpdateStatus: (connectionId: string, status: "accepted" | "rejected") => Promise<void>;
}

function ConnectionCard({
  connection,
  userRole,
  renderStatusIcon,
  getConnectionStatusText,
  formatDate,
  onUpdateStatus
}: ConnectionCardProps) {
  const isPending = connection.status === "pending";
  const isReceivedRequest = isPending && (
    (userRole === "client" && connection.clientId === "") ||
    (userRole === "tailor" && connection.tailorId === "")
  );
  
  const partnerName = userRole === "client" ? connection.tailorName : connection.clientName;
  const partnerEmail = userRole === "client" ? connection.tailorEmail : connection.clientEmail;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{partnerName}</CardTitle>
          <Badge className="flex items-center gap-1" variant={connection.status === "rejected" ? "destructive" : "secondary"}>
            {renderStatusIcon(connection.status)}
            {getConnectionStatusText(connection)}
          </Badge>
        </div>
        <CardDescription>{partnerEmail}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-500">
          Créée le {formatDate(connection.createdAt)}
        </p>
      </CardContent>
      
      {isReceivedRequest && (
        <CardFooter className="flex justify-end space-x-2 pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onUpdateStatus(connection.id, "rejected")}
          >
            Refuser
          </Button>
          <Button 
            size="sm" 
            onClick={() => onUpdateStatus(connection.id, "accepted")}
          >
            Accepter
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
