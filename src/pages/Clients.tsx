
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockClients, Client } from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Search, MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
import { toast } from 'sonner';

const Clients = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [clients, setClients] = useState(mockClients);
  
  // New client form state
  const [newClient, setNewClient] = useState<Partial<Client>>({
    companyId,
    name: '',
    ice: '',
    if: '',
    rc: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    contactName: ''
  });
  
  // Filter clients by search query and company ID
  const filteredClients = clients
    .filter(client => client.companyId === companyId)
    .filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.ice?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.if?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.rc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const handleAddClient = () => {
    // Validate form
    if (!newClient.name || !newClient.address || !newClient.city || !newClient.phone) {
      toast.error(t('clients.validation_error'));
      return;
    }
    
    // Create new client with unique ID and timestamps
    const newClientWithId: Client = {
      ...newClient as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
      id: `client-${Date.now()}`,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add client to state
    setClients([...clients, newClientWithId]);
    
    // Reset form and close dialog
    setNewClient({
      companyId,
      name: '',
      ice: '',
      if: '',
      rc: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      contactName: ''
    });
    setIsAddClientDialogOpen(false);
    
    toast.success(t('clients.added_success'));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('clients.title')} 
        action={{
          label: t('clients.add'),
          onClick: () => setIsAddClientDialogOpen(true)
        }}
      />
      
      <Card className="mb-8 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('clients.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg shadow-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left">{t('clients.name')}</th>
              <th className="px-4 py-3 text-left">{t('clients.ice')}</th>
              <th className="px-4 py-3 text-left">{t('clients.if')}</th>
              <th className="px-4 py-3 text-left">{t('clients.email')}</th>
              <th className="px-4 py-3 text-left">{t('clients.phone')}</th>
              <th className="px-4 py-3 text-left">{t('clients.city')}</th>
              <th className="px-4 py-3 text-center">{t('clients.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr 
                  key={client.id}
                  className="border-t hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{client.name}</div>
                      {client.contactName && (
                        <div className="text-sm text-muted-foreground">{client.contactName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{client.ice || '-'}</td>
                  <td className="px-4 py-3">{client.if || '-'}</td>
                  <td className="px-4 py-3">{client.email || '-'}</td>
                  <td className="px-4 py-3">{client.phone}</td>
                  <td className="px-4 py-3">{client.city}</td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('form.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('form.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          {t('form.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {searchQuery ? t('clients.no_results') : t('clients.no_clients')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Client Dialog */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('clients.add')}</DialogTitle>
            <DialogDescription>
              {t('clients.add_description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('clients.name')} *</Label>
              <Input
                id="name"
                name="name"
                value={newClient.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactName">{t('clients.contact_name')}</Label>
              <Input
                id="contactName"
                name="contactName"
                value={newClient.contactName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ice">{t('clients.ice')}</Label>
              <Input
                id="ice"
                name="ice"
                value={newClient.ice}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="if">{t('clients.if')}</Label>
              <Input
                id="if"
                name="if"
                value={newClient.if}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rc">{t('clients.rc')}</Label>
              <Input
                id="rc"
                name="rc"
                value={newClient.rc}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('clients.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newClient.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">{t('clients.phone')} *</Label>
              <Input
                id="phone"
                name="phone"
                value={newClient.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">{t('clients.city')} *</Label>
              <Input
                id="city"
                name="city"
                value={newClient.city}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">{t('clients.address')} *</Label>
              <Input
                id="address"
                name="address"
                value={newClient.address}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
              {t('form.cancel')}
            </Button>
            <Button onClick={handleAddClient}>
              {t('form.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
