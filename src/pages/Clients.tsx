
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockClients, Client } from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Eye } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';

const Clients = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
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

  const columns: Column<Client>[] = [
    {
      header: t('clients.name'),
      accessorKey: 'name',
      enableSorting: true,
      cell: (client) => (
        <div>
          <div className="font-medium">{client.name}</div>
          {client.contactName && (
            <div className="text-sm text-muted-foreground">{client.contactName}</div>
          )}
        </div>
      )
    },
    {
      header: t('clients.ice'),
      accessorKey: 'ice',
      enableSorting: true,
      cell: (client) => client.ice || '-'
    },
    {
      header: t('clients.if'),
      accessorKey: 'if',
      enableSorting: true,
      cell: (client) => client.if || '-'
    },
    {
      header: t('clients.email'),
      accessorKey: 'email',
      enableSorting: true,
      cell: (client) => client.email || '-'
    },
    {
      header: t('clients.phone'),
      accessorKey: 'phone',
      enableSorting: true
    },
    {
      header: t('clients.city'),
      accessorKey: 'city',
      enableSorting: true
    },
    {
      header: t('clients.actions'),
      accessorKey: 'id',
      cell: (client) => {
        const actions: ActionItem[] = [
          {
            label: t('form.view'),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => {
              toast.info(`${t('clients.viewing')} ${client.name}`);
            }
          },
          {
            label: t('form.edit'),
            icon: <Edit className="h-4 w-4" />,
            onClick: () => {
              toast.info(`${t('clients.editing')} ${client.name}`);
            }
          },
          {
            label: t('form.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => {
              toast.error(`${t('clients.deleting')} ${client.name}`);
            },
            className: 'text-destructive'
          }
        ];
        
        return <TableActions actions={actions} label={t('common.actions')} />;
      },
      className: 'text-center',
      cellClassName: 'text-center'
    }
  ];

  // Filter clients by company ID
  const filteredClients = clients.filter(client => client.companyId === companyId);
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('clients.title')} 
        action={{
          label: t('clients.add'),
          onClick: () => setIsAddClientDialogOpen(true)
        }}
      />
      
      <DataTable
        data={filteredClients}
        columns={columns}
        searchPlaceholder={t('clients.search')}
        searchKey="name"
        noResultsMessage={t('clients.no_results')}
        noDataMessage={t('clients.no_clients')}
        initialSortField="name"
        initialSortDirection="asc"
        cardClassName="shadow-sm"
      />
      
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
