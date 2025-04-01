import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { mockClients, Client } from '@/data/mockData';
import { Edit, Trash, Eye, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';
import { Column } from '@/components/DataTable/DataTable';
import { 
  EntityManager, 
  TextField, 
  SelectField 
} from '@/components/common/EntityManagement';
import { useNavigate } from 'react-router-dom';

const ClientsRefactored = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  const navigate = useNavigate();
  
  const [clients, setClients] = useState(mockClients);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
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
  
  // Event handlers
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
    
    // Reset form
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
  };
  
  const handleDeleteClient = () => {
    if (!selectedClient) return;
    
    // Remove client from state
    setClients(prev => prev.filter(client => client.id !== selectedClient.id));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (selectedClient) {
      setSelectedClient(prev => ({
        ...prev!,
        [name]: value
      }));
    } else {
      setNewClient(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (selectedClient) {
      setSelectedClient(prev => ({
        ...prev!,
        [name]: value
      }));
    } else {
      setNewClient(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Define the columns for the data table
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
              setSelectedClient(client);
            }
          },
          {
            label: t('form.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => {
              setSelectedClient(client);
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
  
  const createCategoryTabs = () => {
    const categories = ['all', 'VIP', 'regular', 'prospect'];
    
    return (
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {t(`clients.category.${category}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  };
  
  // Filter clients by company ID and category
  const filterClientsByCategory = (data: Client[]) => {
    return data.filter(client => {
      if (client.companyId !== companyId) return false;
      if (selectedCategory === 'all') return true;
      return client.category === selectedCategory;
    });
  };
  
  // Export configuration
  const exportHeaders = {
    id: 'ID',
    name: t('clients.name'),
    contactName: t('clients.contact_name'),
    ice: t('clients.ice'),
    if: t('clients.if'),
    rc: t('clients.rc'),
    cnss: t('clients.cnss'),
    email: t('clients.email'),
    phone: t('clients.phone'),
    website: t('clients.website'),
    address: t('clients.address'),
    city: t('clients.city'),
    category: t('clients.category.label'),
    preferredPaymentMethod: t('clients.preferredPaymentMethod'),
    paymentTerms: t('clients.paymentTerms'),
  };
  
  // Render form for adding a client
  const renderAddClientForm = () => (
    <>
      <TextField
        label={t('clients.name')}
        id="name"
        name="name"
        value={newClient.name || ''}
        onChange={handleInputChange}
        required
      />
      
      <TextField
        label={t('clients.contact_name')}
        id="contactName"
        name="contactName"
        value={newClient.contactName || ''}
        onChange={handleInputChange}
      />
      
      <SelectField
        label={t('clients.category.label')}
        id="category"
        name="category"
        value={newClient.category || 'regular'}
        onValueChange={(value) => handleSelectChange('category', value)}
        options={[
          { value: 'VIP', label: 'VIP' },
          { value: 'regular', label: t('clients.category.regular') },
          { value: 'prospect', label: t('clients.category.prospect') }
        ]}
      />
      
      <SelectField
        label={t('clients.preferredPaymentMethod')}
        id="preferredPaymentMethod"
        name="preferredPaymentMethod"
        value={newClient.preferredPaymentMethod || 'bank'}
        onValueChange={(value) => handleSelectChange('preferredPaymentMethod', value)}
        options={[
          { value: 'cash', label: t('payment.methods.cash') },
          { value: 'bank', label: t('payment.methods.bank') },
          { value: 'check', label: t('payment.methods.check') },
          { value: 'other', label: t('payment.methods.other') }
        ]}
        placeholder={t('clients.payment_select')}
      />
      
      <TextField
        label={t('clients.paymentTerms')}
        id="paymentTerms"
        name="paymentTerms"
        value={newClient.paymentTerms || ''}
        onChange={handleInputChange}
        placeholder="30 days, 60 days, etc."
      />
      
      <TextField
        label={t('clients.ice')}
        id="ice"
        name="ice"
        value={newClient.ice || ''}
        onChange={handleInputChange}
      />
      
      <TextField
        label={t('clients.if')}
        id="if"
        name="if"
        value={newClient.if || ''}
        onChange={handleInputChange}
      />
      
      <TextField
        label={t('clients.rc')}
        id="rc"
        name="rc"
        value={newClient.rc || ''}
        onChange={handleInputChange}
      />
      
      <TextField
        label={t('clients.cnss')}
        id="cnss"
        name="cnss"
        value={newClient.cnss || ''}
        onChange={handleInputChange}
      />
      
      <TextField
        label={t('clients.email')}
        id="email"
        name="email"
        type="email"
        value={newClient.email || ''}
        onChange={handleInputChange}
      />
      
      <TextField
        label={t('clients.website')}
        id="website"
        name="website"
        value={newClient.website || ''}
        onChange={handleInputChange}
      />
      
      <TextField
        label={t('clients.phone')}
        id="phone"
        name="phone"
        value={newClient.phone || ''}
        onChange={handleInputChange}
        required
      />
      
      <TextField
        label={t('clients.city')}
        id="city"
        name="city"
        value={newClient.city || ''}
        onChange={handleInputChange}
        required
      />
      
      <div className="sm:col-span-2">
        <TextField
          label={t('clients.address')}
          id="address"
          name="address"
          value={newClient.address || ''}
          onChange={handleInputChange}
          required
        />
      </div>
    </>
  );
  
  // Render form for editing a client
  const renderEditClientForm = () => {
    if (!selectedClient) return null;
    
    return (
      <>
        <TextField
          label={t('clients.name')}
          id="edit-name"
          name="name"
          value={selectedClient.name}
          onChange={handleInputChange}
          required
        />
        
        <TextField
          label={t('clients.contact_name')}
          id="edit-contactName"
          name="contactName"
          value={selectedClient.contactName || ''}
          onChange={handleInputChange}
        />
        
        <SelectField
          label={t('clients.category.label')}
          id="edit-category"
          name="category"
          value={selectedClient.category || 'regular'}
          onValueChange={(value) => handleSelectChange('category', value)}
          options={[
            { value: 'VIP', label: 'VIP' },
            { value: 'regular', label: t('clients.category.regular') },
            { value: 'prospect', label: t('clients.category.prospect') }
          ]}
        />
        
        <SelectField
          label={t('clients.preferredPaymentMethod')}
          id="edit-preferredPaymentMethod"
          name="preferredPaymentMethod"
          value={selectedClient.preferredPaymentMethod || 'bank'}
          onValueChange={(value) => handleSelectChange('preferredPaymentMethod', value)}
          options={[
            { value: 'cash', label: t('payment.methods.cash') },
            { value: 'bank', label: t('payment.methods.bank') },
            { value: 'check', label: t('payment.methods.check') },
            { value: 'other', label: t('payment.methods.other') }
          ]}
        />
        
        <TextField
          label={t('clients.paymentTerms')}
          id="edit-paymentTerms"
          name="paymentTerms"
          value={selectedClient.paymentTerms || ''}
          onChange={handleInputChange}
          placeholder="30 days, 60 days, etc."
        />
        
        <TextField
          label={t('clients.ice')}
          id="edit-ice"
          name="ice"
          value={selectedClient.ice || ''}
          onChange={handleInputChange}
        />
        
        <TextField
          label={t('clients.if')}
          id="edit-if"
          name="if"
          value={selectedClient.if || ''}
          onChange={handleInputChange}
        />
        
        <TextField
          label={t('clients.rc')}
          id="edit-rc"
          name="rc"
          value={selectedClient.rc || ''}
          onChange={handleInputChange}
        />
        
        <TextField
          label={t('clients.cnss')}
          id="edit-cnss"
          name="cnss"
          value={selectedClient.cnss || ''}
          onChange={handleInputChange}
        />
        
        <TextField
          label={t('clients.email')}
          id="edit-email"
          name="email"
          type="email"
          value={selectedClient.email || ''}
          onChange={handleInputChange}
        />
        
        <TextField
          label={t('clients.website')}
          id="edit-website"
          name="website"
          value={selectedClient.website || ''}
          onChange={handleInputChange}
        />
        
        <TextField
          label={t('clients.phone')}
          id="edit-phone"
          name="phone"
          value={selectedClient.phone}
          onChange={handleInputChange}
          required
        />
        
        <TextField
          label={t('clients.city')}
          id="edit-city"
          name="city"
          value={selectedClient.city}
          onChange={handleInputChange}
          required
        />
        
        <div className="sm:col-span-2">
          <TextField
            label={t('clients.address')}
            id="edit-address"
            name="address"
            value={selectedClient.address}
            onChange={handleInputChange}
            required
          />
        </div>
      </>
    );
  };
  
  return (
    <EntityManager<Client>
      title={t('clients.title')}
      addButtonText={t('clients.add')}
      exportButtonText={t('clients.export')}
      columns={columns}
      data={clients}
      searchKey="name"
      searchPlaceholder={t('clients.search')}
      noResultsMessage={t('clients.no_results')}
      noDataMessage={t('clients.no_clients')}
      initialSortField="name"
      initialSortDirection="asc"
      filterComponent={createCategoryTabs()}
      showExport={true}
      exportHeaders={exportHeaders}
      exportFilename="clients"
      selectedEntity={selectedClient}
      setSelectedEntity={setSelectedClient}
      renderAddForm={renderAddClientForm}
      renderEditForm={renderEditClientForm}
      onEntityAdd={handleAddClient}
      onEntityEdit={handleEditClient}
      onEntityDelete={handleDeleteClient}
      addSuccessMessage={t('clients.added_success')}
      editSuccessMessage={t('clients.updated_success')}
      deleteSuccessMessage={t('clients.deleted_success')}
      filterData={filterClientsByCategory}
      addDialogTitle={t('clients.add')}
      addDialogDescription={t('clients.add_description')}
      editDialogTitle={t('clients.edit')}
      editDialogDescription={t('clients.edit_description')}
      deleteDialogTitle={t('clients.delete_confirmation')}
      deleteDialogDescription={t('clients.delete_warning')}
    />
  );
};

export default ClientsRefactored; 