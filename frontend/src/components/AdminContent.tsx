import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { firebaseApp } from "app";
import { collection, getDocs, getFirestore, query, doc, updateDoc, where } from "firebase/firestore";
import { toast } from "sonner";

const db = getFirestore(firebaseApp);

interface Design {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tailorId: string;
  tailorName: string;
  isApproved: boolean;
  status: string;
  createdAt: Date;
}

interface ReportItem {
  id: string;
  type: string;
  itemId: string;
  itemType: string;
  reportedBy: string;
  reportedByName: string;
  reason: string;
  status: string;
  createdAt: Date;
}

const AdminContent = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isDesignDialogOpen, setIsDesignDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Fetch designs
      const designsCollection = collection(db, "designs");
      const designsSnapshot = await getDocs(designsCollection);
      
      const fetchedDesigns: Design[] = [];
      designsSnapshot.forEach((doc) => {
        const designData = doc.data();
        fetchedDesigns.push({
          id: doc.id,
          name: designData.name || "",
          description: designData.description || "",
          imageUrl: designData.imageUrl || "",
          tailorId: designData.tailorId || "",
          tailorName: designData.tailorName || "",
          isApproved: designData.isApproved === true,
          status: designData.status || "pending",
          createdAt: designData.createdAt?.toDate() || new Date(),
        });
      });
      
      setDesigns(fetchedDesigns);
      
      // Fetch reports
      const reportsCollection = collection(db, "reports");
      const reportsSnapshot = await getDocs(reportsCollection);
      
      const fetchedReports: ReportItem[] = [];
      reportsSnapshot.forEach((doc) => {
        const reportData = doc.data();
        fetchedReports.push({
          id: doc.id,
          type: reportData.type || "",
          itemId: reportData.itemId || "",
          itemType: reportData.itemType || "",
          reportedBy: reportData.reportedBy || "",
          reportedByName: reportData.reportedByName || "",
          reason: reportData.reason || "",
          status: reportData.status || "pending",
          createdAt: reportData.createdAt?.toDate() || new Date(),
        });
      });
      
      setReports(fetchedReports);
      
    } catch (error) {
      console.error("Error fetching content data:", error);
      toast.error("Erreur lors du chargement des données de contenu");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDesign = async (designId: string, currentStatus: boolean) => {
    try {
      const designRef = doc(db, "designs", designId);
      await updateDoc(designRef, {
        isApproved: !currentStatus,
        status: !currentStatus ? "approved" : "pending"
      });
      
      // Update local state
      setDesigns(prevDesigns => 
        prevDesigns.map(design => 
          design.id === designId ? { 
            ...design, 
            isApproved: !currentStatus,
            status: !currentStatus ? "approved" : "pending"
          } : design
        )
      );
      
      toast.success(`Design ${!currentStatus ? 'approuvé' : 'en attente'} avec succès`);
    } catch (error) {
      console.error("Error approving design:", error);
      toast.error("Erreur lors de l'approbation du design");
    }
  };

  const handleReportAction = async (reportId: string, action: string) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: action
      });
      
      // Update local state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId ? { ...report, status: action } : report
        )
      );
      
      toast.success(`Signalement marqué comme ${action === 'resolved' ? 'résolu' : 'rejeté'}`);
    } catch (error) {
      console.error("Error handling report:", error);
      toast.error("Erreur lors du traitement du signalement");
    }
  };

  const viewDesignDetails = (design: Design) => {
    setSelectedDesign(design);
    setIsDesignDialogOpen(true);
  };

  const filteredDesigns = designs.filter(design => {
    let matches = true;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      matches = matches && (design.name.toLowerCase().includes(term) || 
                           design.tailorName.toLowerCase().includes(term));
    }
    
    if (filterStatus) {
      if (filterStatus === "approved") {
        matches = matches && design.isApproved === true;
      } else if (filterStatus === "pending") {
        matches = matches && design.isApproved === false;
      }
    }
    
    return matches;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Chargement du contenu...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="designs" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="designs">Designs</TabsTrigger>
          <TabsTrigger value="reports">Signalements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="designs">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end mb-4">
            <div className="flex-1">
              <Label htmlFor="search-designs">Rechercher</Label>
              <Input
                id="search-designs"
                placeholder="Rechercher par nom ou tailleur"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/3">
              <Label htmlFor="filter-status">Statut</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterStatus("");
            }}>
              Réinitialiser
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aperçu</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Tailleur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesigns.length > 0 ? (
                  filteredDesigns.map((design) => (
                    <TableRow key={design.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded overflow-hidden bg-gray-100">
                          {design.imageUrl ? (
                            <img 
                              src={design.imageUrl} 
                              alt={design.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              Aucune image
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{design.name}</TableCell>
                      <TableCell>{design.tailorName}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          design.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {design.isApproved ? 'Approuvé' : 'En attente'}
                        </span>
                      </TableCell>
                      <TableCell>{design.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => viewDesignDetails(design)}>
                          Détails
                        </Button>
                        <Button 
                          variant={design.isApproved ? "destructive" : "default"} 
                          size="sm"
                          onClick={() => handleApproveDesign(design.id, design.isApproved)}
                        >
                          {design.isApproved ? 'Retirer' : 'Approuver'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucun design trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Signalé par</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <span className="capitalize">{report.itemType}</span>
                      </TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>{report.reportedByName}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                          report.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status === 'resolved' ? 'Résolu' : 
                           report.status === 'rejected' ? 'Rejeté' : 'En attente'}
                        </span>
                      </TableCell>
                      <TableCell>{report.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {report.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReportAction(report.id, 'resolved')}
                            >
                              Résoudre
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleReportAction(report.id, 'rejected')}
                            >
                              Rejeter
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucun signalement trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDesignDialogOpen} onOpenChange={setIsDesignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du Design</DialogTitle>
            <DialogDescription>
              Informations détaillées sur le design
            </DialogDescription>
          </DialogHeader>
          
          {selectedDesign && (
            <div className="space-y-4 py-4">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                {selectedDesign.imageUrl ? (
                  <img 
                    src={selectedDesign.imageUrl} 
                    alt={selectedDesign.name} 
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    Aucune image
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <p className="font-medium">{selectedDesign.name}</p>
                </div>
                
                <div>
                  <Label>Tailleur</Label>
                  <p className="font-medium">{selectedDesign.tailorName}</p>
                </div>
                
                <div className="col-span-2">
                  <Label>Description</Label>
                  <p>{selectedDesign.description}</p>
                </div>
                
                <div>
                  <Label>Date de création</Label>
                  <p>{selectedDesign.createdAt.toLocaleDateString()}</p>
                </div>
                
                <div>
                  <Label>Statut d'approbation</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={selectedDesign.isApproved} 
                      onCheckedChange={() => {
                        handleApproveDesign(selectedDesign.id, selectedDesign.isApproved);
                        setSelectedDesign({
                          ...selectedDesign,
                          isApproved: !selectedDesign.isApproved,
                          status: !selectedDesign.isApproved ? "approved" : "pending"
                        });
                      }}
                    />
                    <span>{selectedDesign.isApproved ? 'Approuvé' : 'En attente'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDesignDialogOpen(false)}>
              Fermer
            </Button>
            {selectedDesign && (
              <Button 
                variant={selectedDesign.isApproved ? "destructive" : "default"}
                onClick={() => {
                  handleApproveDesign(selectedDesign.id, selectedDesign.isApproved);
                  setIsDesignDialogOpen(false);
                }}
              >
                {selectedDesign.isApproved ? 'Retirer l\'approbation' : 'Approuver'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContent;