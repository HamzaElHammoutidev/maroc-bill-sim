import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { mockClients, getClientsByCategory, Client } from '@/data/mockData';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash, Eye, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Define client validation schema
const clientFormSchema = z.object({
  name: z.string().min(1, { message: 'Client name is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  ice: z.string().optional(),
  if: z.string().optional(),
  rc: z.string().optional(),
  cnss: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  website: z.string().optional(),
  contactName: z.string().optional(),
  category: z.enum(['VIP', 'regular', 'prospect', 'new']).default('regular'),
  preferredPaymentMethod: z.enum(['cash', 'bank', 'check', 'online', 'other']).default('bank'),
  paymentTerms: z.string().optional()
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const Clients = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clients, setClients] = useState(mockClients);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Check if we're getting redirected with a client to edit
  useEffect(() => {
    if (location.state?.editClientId) {
      const clientToEdit = clients.find(client => client.id === location.state.editClientId);
      if (clientToEdit) {
        setSelectedClient(clientToEdit);
        setIsEditClientDialogOpen(true);
        // Clear the location state to avoid reopening the dialog on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, clients]);
  
  // New client form state
  const [newClient, setNewClient] = useState<Partial<Client>>({
    companyId,
    name: '',
    ice: '',
    if: '',
    rc: '',
    cnss: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    contactName: '',
    category: 'regular',
    preferredPaymentMethod: 'bank',
    paymentTerms: '30 days',
    contacts: []
  });
  
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: ''
  });
  
  const [isAddingContact, setIsAddingContact] = useState(false);
  
  // Initialize form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      phone: '',
      ice: '',
      if: '',
      rc: '',
      cnss: '',
      email: '',
      website: '',
      contactName: '',
      category: 'regular',
      preferredPaymentMethod: 'bank',
      paymentTerms: '30 days',
    }
  });
  
  const handleAddContact = () => {
    if (!newContact.name || !newContact.role) {
      toast.error(t('clients.contact_validation_error'));
      return;
    }
    
    const contact = {
      id: `contact-${Date.now()}`,
      name: newContact.name,
      role: newContact.role,
      email: newContact.email,
      phone: newContact.phone
    };
    
    setNewClient(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), contact]
    }));
    
    setNewContact({
      name: '',
      role: '',
      email: '',
      phone: ''
    });
    
    setIsAddingContact(false);
    toast.success(t('clients.contacts.added'));
  };
  
  const handleRemoveContact = (contactId: string) => {
    setNewClient(prev => ({
      ...prev,
      contacts: (prev.contacts || []).filter(c => c.id !== contactId)
    }));
    toast.success(t('clients.contacts.removed'));
  };
  
  const handleAddClient = (data: ClientFormValues) => {
    // Create new client with unique ID and timestamps
    const newClientWithId: Client = {
      ...data,
      id: `client-${Date.now()}`,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: data.name,
      address: data.address,
      city: data.city,
      phone: data.phone,
      contacts: newClient.contacts || []
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
      cnss: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      website: '',
      contactName: '',
      category: 'regular',
      preferredPaymentMethod: 'bank',
      paymentTerms: '30 days',
      contacts: []
    });
    form.reset();
    setIsAddClientDialogOpen(false);
    
    toast.success(t('clients.added_success'));
  };

  const handleEditClient = () => {
    if (!selectedClient) return;
    
    // Validate form
    if (!selectedClient.name || !selectedClient.address || !selectedClient.city || !selectedClient.phone) {
      toast.error(t('clients.validation_error'));
      return;
    }
    
    // Update client with new timestamp
    const updatedClient: Client = {
      ...selectedClient,
      updatedAt: new Date().toISOString()
    };
    
    // Update client in state
    setClients(prev => prev.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
    
    // Close dialog
    setIsEditClientDialogOpen(false);
    
    toast.success(t('clients.updated_success'));
  };
  
  const handleDeleteClient = () => {
    if (!selectedClient) return;
    
    // Remove client from state
    setClients(prev => prev.filter(client => client.id !== selectedClient.id));
    
    // Close dialog
    setIsDeleteDialogOpen(false);
    
    toast.success(t('clients.deleted_success'));
  };
  
  const handleExportClients = () => {
    // Filter clients by company ID and category
    const clientsToExport = clients.filter(client => {
      if (client.companyId !== companyId) return false;
      if (selectedCategory === 'all') return true;
      return client.category === selectedCategory;
    });
    
    // Format the data for CSV export
    const csvContent = [
      // CSV Header
      [
        'ID', 
        t('clients.name'), 
        t('clients.contact_name'), 
        t('clients.ice'), 
        t('clients.if'), 
        t('clients.rc'), 
        t('clients.cnss'), 
        t('clients.email'), 
        t('clients.phone'), 
        t('clients.website'), 
        t('clients.address'), 
        t('clients.city'), 
        t('clients.category.label'), 
        t('clients.preferredPaymentMethod'), 
        t('clients.paymentTerms')
      ].join(','),
      // CSV Data rows
      ...clientsToExport.map(client => [
        client.id,
        client.name.replace(/,/g, ' '), // Replace commas to avoid CSV issues
        (client.contactName || '').replace(/,/g, ' '),
        client.ice || '',
        client.if || '',
        client.rc || '',
        client.cnss || '',
        client.email || '',
        client.phone || '',
        client.website || '',
        (client.address || '').replace(/,/g, ' '),
        (client.city || '').replace(/,/g, ' '),
        client.category || '',
        client.preferredPaymentMethod || '',
        (client.paymentTerms || '').replace(/,/g, ' ')
      ].join(','))
    ].join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(t('clients.export_success'));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isEditClientDialogOpen && selectedClient) {
      setSelectedClient(prev => ({
        ...prev!,
        [name]: value
      }));
    } else {
      setNewClient(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (isEditClientDialogOpen && selectedClient) {
      setSelectedClient(prev => ({
        ...prev!,
        [name]: value
      }));
    } else {
      setNewClient(prev => ({ ...prev, [name]: value }));
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setIsEditClientDialogOpen(true);
  };
  
  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };
  
  // Add state for managing contacts in edit mode
  const [isAddingEditContact, setIsAddingEditContact] = useState(false);
  const [editContact, setEditContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: ''
  });
  
  // Add handlers for edit contact
  const handleEditContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditContact(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddEditContact = () => {
    if (!editContact.name || !editContact.role) {
      toast.error(t('clients.contact_validation_error'));
      return;
    }
    
    const contact = {
      id: `contact-${Date.now()}`,
      name: editContact.name,
      role: editContact.role,
      email: editContact.email,
      phone: editContact.phone
    };
    
    setSelectedClient(prev => ({
      ...prev!,
      contacts: [...(prev?.contacts || []), contact]
    }));
    
    setEditContact({
      name: '',
      role: '',
      email: '',
      phone: ''
    });
    
    setIsAddingEditContact(false);
    toast.success(t('clients.contacts.added'));
  };
  
  const handleRemoveEditContact = (contactId: string) => {
    setSelectedClient(prev => ({
      ...prev!,
      contacts: (prev?.contacts || []).filter(c => c.id !== contactId)
    }));
    toast.success(t('clients.contacts.removed'));
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
          {client.category && (
            <Badge variant="outline" className="mt-1">{client.category}</Badge>
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
      header: t('clients.payment'),
      accessorKey: 'preferredPaymentMethod',
      enableSorting: true,
      cell: (client) => client.preferredPaymentMethod || '-'
    },
    {
      header: t('clients.terms'),
      accessorKey: 'paymentTerms',
      enableSorting: true,
      cell: (client) => client.paymentTerms || '-'
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
              // Navigate to client detail page
              navigate(`/clients/${client.id}`);
            }
          },
          {
            label: t('form.edit'),
            icon: <Edit className="h-4 w-4" />,
            onClick: () => {
              openEditDialog(client);
            }
          },
          {
            label: t('form.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => {
              openDeleteDialog(client);
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

  // Filter clients by company ID and category
  const filteredClients = clients.filter(client => {
    if (client.companyId !== companyId) return false;
    if (selectedCategory === 'all') return true;
    return client.category === selectedCategory;
  });
  
  // Available categories
  const categories = ['all', 'VIP', 'regular', 'prospect'];
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('clients.title')} 
        action={{
          label: t('clients.add'),
          onClick: () => setIsAddClientDialogOpen(true)
        }}
      />
      
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {t(`clients.category.${category}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <Button variant="outline" onClick={handleExportClients}>
          <Download className="mr-2 h-4 w-4" />
          {t('clients.export')}
        </Button>
      </div>
      
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('clients.add')}</DialogTitle>
            <DialogDescription>
              {t('clients.add_description')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddClient)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.name')} *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.contact_name')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.category.label')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('clients.category.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIP">VIP</SelectItem>
                          <SelectItem value="regular">{t('clients.category.regular')}</SelectItem>
                          <SelectItem value="prospect">{t('clients.category.prospect')}</SelectItem>
                          <SelectItem value="new">{t('clients.category.new')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredPaymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.preferredPaymentMethod')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('clients.payment_select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">{t('payment.methods.cash')}</SelectItem>
                          <SelectItem value="bank">{t('payment.methods.bank')}</SelectItem>
                          <SelectItem value="check">{t('payment.methods.check')}</SelectItem>
                          <SelectItem value="online">{t('payment.methods.online')}</SelectItem>
                          <SelectItem value="other">{t('payment.methods.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.paymentTerms')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="30 days, 60 days, etc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.ice')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="if"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.if')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.rc')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cnss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.cnss')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.email')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.website')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.phone')} *</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.city')} *</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.address')} *</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Contacts section */}
                <div className="sm:col-span-2 space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>{t('clients.contacts.title')}</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsAddingContact(true)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {t('clients.contacts.add')}
                    </Button>
                  </div>
                  
                  {newClient.contacts && newClient.contacts.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {newClient.contacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between border p-2 rounded-md">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.role}</p>
                            {contact.email && <p className="text-sm">{contact.email}</p>}
                            {contact.phone && <p className="text-sm">{contact.phone}</p>}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveContact(contact.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('clients.contacts.none')}</p>
                  )}
                  
                  {isAddingContact && (
                    <div className="border p-4 rounded-md mt-2">
                      <h4 className="font-medium mb-2">{t('clients.contacts.new')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="contactName">{t('clients.contacts.name')} *</Label>
                          <Input
                            id="contactName"
                            name="name"
                            value={newContact.name}
                            onChange={handleContactInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="contactRole">{t('clients.contacts.role')} *</Label>
                          <Input
                            id="contactRole"
                            name="role"
                            value={newContact.role}
                            onChange={handleContactInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="contactEmail">{t('clients.contacts.email')}</Label>
                          <Input
                            id="contactEmail"
                            name="email"
                            type="email"
                            value={newContact.email}
                            onChange={handleContactInputChange}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="contactPhone">{t('clients.contacts.phone')}</Label>
                          <Input
                            id="contactPhone"
                            name="phone"
                            value={newContact.phone}
                            onChange={handleContactInputChange}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-2 space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsAddingContact(false)}
                        >
                          {t('form.cancel')}
                        </Button>
                        <Button 
                          type="button" 
                          size="sm"
                          onClick={handleAddContact}
                        >
                          {t('form.add')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsAddClientDialogOpen(false)} type="button">
                  {t('form.cancel')}
                </Button>
                <Button type="submit">
                  {t('form.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Client Dialog */}
      <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('clients.edit')}</DialogTitle>
            <DialogDescription>
              {t('clients.edit_description')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t('clients.name')} *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={selectedClient.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-contactName">{t('clients.contact_name')}</Label>
                <Input
                  id="edit-contactName"
                  name="contactName"
                  value={selectedClient.contactName || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">{t('clients.category.label')}</Label>
                <Select
                  value={selectedClient.category || 'regular'}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder={t('clients.category.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="regular">{t('clients.category.regular')}</SelectItem>
                    <SelectItem value="prospect">{t('clients.category.prospect')}</SelectItem>
                    <SelectItem value="new">{t('clients.category.new')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-preferredPaymentMethod">{t('clients.preferredPaymentMethod')}</Label>
                <Select
                  value={selectedClient.preferredPaymentMethod || 'bank'}
                  onValueChange={(value) => handleSelectChange('preferredPaymentMethod', value)}
                >
                  <SelectTrigger id="edit-preferredPaymentMethod">
                    <SelectValue placeholder={t('clients.payment_select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('payment.methods.cash')}</SelectItem>
                    <SelectItem value="bank">{t('payment.methods.bank')}</SelectItem>
                    <SelectItem value="check">{t('payment.methods.check')}</SelectItem>
                    <SelectItem value="online">{t('payment.methods.online')}</SelectItem>
                    <SelectItem value="other">{t('payment.methods.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-paymentTerms">{t('clients.paymentTerms')}</Label>
                <Input
                  id="edit-paymentTerms"
                  name="paymentTerms"
                  value={selectedClient.paymentTerms || ''}
                  onChange={handleInputChange}
                  placeholder="30 days, 60 days, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-ice">{t('clients.ice')}</Label>
                <Input
                  id="edit-ice"
                  name="ice"
                  value={selectedClient.ice || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-if">{t('clients.if')}</Label>
                <Input
                  id="edit-if"
                  name="if"
                  value={selectedClient.if || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-rc">{t('clients.rc')}</Label>
                <Input
                  id="edit-rc"
                  name="rc"
                  value={selectedClient.rc || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-cnss">{t('clients.cnss')}</Label>
                <Input
                  id="edit-cnss"
                  name="cnss"
                  value={selectedClient.cnss || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t('clients.email')}</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={selectedClient.email || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-website">{t('clients.website')}</Label>
                <Input
                  id="edit-website"
                  name="website"
                  value={selectedClient.website || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">{t('clients.phone')} *</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={selectedClient.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-city">{t('clients.city')} *</Label>
                <Input
                  id="edit-city"
                  name="city"
                  value={selectedClient.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-address">{t('clients.address')} *</Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={selectedClient.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {/* Contacts section in edit form */}
              <div className="sm:col-span-2 space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label>{t('clients.contacts.title')}</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddingEditContact(true)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {t('clients.contacts.add')}
                  </Button>
                </div>
                
                {selectedClient.contacts && selectedClient.contacts.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {selectedClient.contacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between border p-2 rounded-md">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                          {contact.email && <p className="text-sm">{contact.email}</p>}
                          {contact.phone && <p className="text-sm">{contact.phone}</p>}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveEditContact(contact.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('clients.contacts.none')}</p>
                )}
                
                {isAddingEditContact && (
                  <div className="border p-4 rounded-md mt-2">
                    <h4 className="font-medium mb-2">{t('clients.contacts.new')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="editContactName">{t('clients.contacts.name')} *</Label>
                        <Input
                          id="editContactName"
                          name="name"
                          value={editContact.name}
                          onChange={handleEditContactInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="editContactRole">{t('clients.contacts.role')} *</Label>
                        <Input
                          id="editContactRole"
                          name="role"
                          value={editContact.role}
                          onChange={handleEditContactInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="editContactEmail">{t('clients.contacts.email')}</Label>
                        <Input
                          id="editContactEmail"
                          name="email"
                          type="email"
                          value={editContact.email}
                          onChange={handleEditContactInputChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="editContactPhone">{t('clients.contacts.phone')}</Label>
                        <Input
                          id="editContactPhone"
                          name="phone"
                          value={editContact.phone}
                          onChange={handleEditContactInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAddingEditContact(false)}
                      >
                        {t('form.cancel')}
                      </Button>
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={handleAddEditContact}
                      >
                        {t('form.add')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClientDialogOpen(false)}>
              {t('form.cancel')}
            </Button>
            <Button onClick={handleEditClient}>
              {t('form.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('clients.delete_confirmation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('clients.delete_warning')} 
              {selectedClient && <strong className="font-semibold block mt-2">{selectedClient.name}</strong>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteClient}
            >
              {t('form.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
