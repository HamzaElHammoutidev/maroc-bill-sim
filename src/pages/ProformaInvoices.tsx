import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ProformaInvoice, 
  ProformaInvoiceStatus, 
  mockProformaInvoices, 
  getClientById,
  Invoice,
  createInvoice
} from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  FileText, 
  CheckCircle, 
  SendHorizontal, 
  FileEdit, 
  Trash, 
  Search,
  FilePlus,
  AlertCircle,
  Receipt,
  FileDown,
  RotateCw,
  Ban,
  Calendar,
  Eye
} from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InvoiceFormDialog from '@/components/invoices/InvoiceFormDialog';

const ProformaInvoices = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [isLoading, setIsLoading] = useState(true);
  const [proformas, setProformas] = useState<ProformaInvoice[]>([]);
  const [filteredProformas, setFilteredProformas] = useState<ProformaInvoice[]>([]);
  const [selectedProforma, setSelectedProforma] = useState<ProformaInvoice | null>(null);
  
  // Dialog visibility states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateForm, setIsCreateForm] = useState(true);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Load proforma invoices
  useEffect(() => {
    const timer = setTimeout(() => {
      setProformas(mockProformaInvoices);
      setFilteredProformas(mockProformaInvoices);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...proformas];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(proforma => proforma.status === statusFilter);
    }
    
    // Apply client filter
    if (clientFilter !== 'all') {
      result = result.filter(proforma => proforma.clientId === clientFilter);
    }
    
    // Apply date filters
    if (dateFilter.from) {
      result = result.filter(proforma => new Date(proforma.date) >= dateFilter.from!);
    }
    
    if (dateFilter.to) {
      result = result.filter(proforma => new Date(proforma.date) <= dateFilter.to!);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(proforma => 
        proforma.proformaNumber.toLowerCase().includes(query) || 
        (getClientById(proforma.clientId)?.name || '').toLowerCase().includes(query)
      );
    }
    
    setFilteredProformas(result);
  }, [proformas, statusFilter, clientFilter, dateFilter, searchQuery]);
  
  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter('all');
    setClientFilter('all');
    setDateFilter({ from: null, to: null });
    setSearchQuery('');
  };
  
  const handleCreateProforma = () => {
    setSelectedProforma(null);
    setIsCreateForm(true);
    setIsFormOpen(true);
  };
  
  const handleViewProforma = (proforma: ProformaInvoice) => {
    setSelectedProforma(proforma);
    setIsDetailsOpen(true);
  };
  
  const handleEditProforma = (proforma: ProformaInvoice) => {
    // Only allow editing of draft proformas
    if (proforma.status !== 'draft') {
      toast({
        title: t('invoices.edit_error'),
        description: t('invoices.edit_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedProforma(proforma);
    setIsCreateForm(false);
    setIsFormOpen(true);
  };
  
  const handleSendProforma = (proforma: ProformaInvoice) => {
    // Only allow sending of draft proformas
    if (proforma.status !== 'draft') {
      toast({
        title: t('invoices.send_error'),
        description: t('invoices.send_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    // In a real app, you would send the proforma to the client
    toast({
      title: t('invoices.send_success'),
      description: `${t('invoices.proforma_invoice')} ${proforma.proformaNumber} ${t('invoices.send_success_desc')}`
    });
    
    // Update the status to 'sent'
    const updatedProformas = proformas.map(p => 
      p.id === proforma.id 
        ? { ...p, status: 'sent' as ProformaInvoiceStatus, updatedAt: new Date().toISOString() } 
        : p
    );
    
    setProformas(updatedProformas);
  };
  
  const handleConvertToInvoice = (proforma: ProformaInvoice) => {
    // Only allow conversion of sent proformas
    if (proforma.status !== 'sent') {
      toast({
        title: t('invoices.convert_error'),
        description: t('invoices.convert_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    // In a real app, you would create an invoice from the proforma
    // For now, just show a toast message
    toast({
      title: t('invoices.convert_proforma_success'),
      description: `${t('invoices.proforma_invoice')} ${proforma.proformaNumber} ${t('invoices.convert_success_desc')}`
    });
    
    // Update the status to 'converted'
    const updatedProformas = proformas.map(p => 
      p.id === proforma.id 
        ? { 
            ...p, 
            status: 'converted' as ProformaInvoiceStatus, 
            updatedAt: new Date().toISOString(),
            convertedAt: new Date().toISOString(),
            convertedInvoiceId: `INV-${Date.now()}`
          } 
        : p
    );
    
    setProformas(updatedProformas);
  };
  
  const handleDeleteProforma = (proforma: ProformaInvoice) => {
    setSelectedProforma(proforma);
    setIsDeleteOpen(true);
  };
  
  const confirmDeleteProforma = () => {
    if (!selectedProforma) return;
    
    // Filter out the selected proforma
    const updatedProformas = proformas.filter(p => p.id !== selectedProforma.id);
    setProformas(updatedProformas);
    setFilteredProformas(updatedProformas);
    
    toast({
      title: t('invoices.delete_success'),
      description: `${t('invoices.proforma_invoice')} ${selectedProforma.proformaNumber} ${t('invoices.delete_success_desc')}`
    });
    
    setIsDeleteOpen(false);
    setSelectedProforma(null);
  };
  
  // Status counts for cards
  const getStatusCounts = () => {
    return {
      total: proformas.length,
      draft: proformas.filter(p => p.status === 'draft').length,
      sent: proformas.filter(p => p.status === 'sent').length,
      converted: proformas.filter(p => p.status === 'converted').length,
      expired: proformas.filter(p => p.status === 'expired').length,
      cancelled: proformas.filter(p => p.status === 'cancelled').length
    };
  };
  
  const statusCounts = getStatusCounts();
  
  // Define table columns
  const columns: Column<ProformaInvoice>[] = [
    {
      accessorKey: 'proformaNumber',
      header: t('invoices.proforma_number'),
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span>{item.proformaNumber}</span>
        </div>
      )
    },
    {
      accessorKey: 'clientId',
      header: t('invoices.client'),
      cell: (item) => {
        const client = getClientById(item.clientId);
        return client ? client.name : 'Unknown';
      }
    },
    {
      accessorKey: 'date',
      header: t('invoices.date'),
      cell: (item) => formatDate(item.date)
    },
    {
      accessorKey: 'expiryDate',
      header: t('invoices.expiry_date'),
      cell: (item) => formatDate(item.expiryDate)
    },
    {
      accessorKey: 'total',
      header: t('invoices.total'),
      cell: (item) => formatCurrency(item.total)
    },
    {
      accessorKey: 'status',
      header: t('invoices.status'),
      cell: (item) => {
        const status = item.status;
        
        return (
          <StatusBadge 
            status={status} 
            type="invoice" 
          />
        );
      }
    },
    {
      accessorKey: 'actions',
      header: t('common.actions'),
      cell: (item) => {
        const proforma = item;
        const actions: ActionItem[] = [];
        
        actions.push({
          icon: <Eye size={16} />,
          label: t('common.view'),
          onClick: () => handleViewProforma(proforma)
        });
        
        if (proforma.status === 'draft') {
          actions.push({
            icon: <FileEdit size={16} />,
            label: t('common.edit'),
            onClick: () => handleEditProforma(proforma)
          });
          
          actions.push({
            icon: <SendHorizontal size={16} />,
            label: t('common.send'),
            onClick: () => handleSendProforma(proforma)
          });
        }
        
        if (proforma.status === 'sent') {
          actions.push({
            icon: <RotateCw size={16} />,
            label: t('invoices.convert_to_invoice'),
            onClick: () => handleConvertToInvoice(proforma)
          });
        }
        
        if (['draft', 'sent'].includes(proforma.status)) {
          actions.push({
            icon: <Trash size={16} />,
            label: t('common.delete'),
            onClick: () => handleDeleteProforma(proforma)
          });
        }
        
        return <TableActions actions={actions} />;
      }
    }
  ];
  
  return (
    <div className="space-y-4">
      <PageHeader
        title={t('invoices.proforma_invoices')}
        description={t('invoices.proforma_description')}
        action={{
          label: t('invoices.create_proforma'),
          onClick: handleCreateProforma
        }}
      />
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('invoices.total')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('invoices.statuses.draft')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.draft}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('invoices.statuses.sent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.sent}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('invoices.statuses.converted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.converted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('invoices.statuses.expired')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.expired}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('invoices.statuses.cancelled')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.cancelled}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder={t('common.search') as string}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('invoices.filter_status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="draft">{t('invoices.statuses.draft')}</SelectItem>
              <SelectItem value="sent">{t('invoices.statuses.sent')}</SelectItem>
              <SelectItem value="converted">{t('invoices.statuses.converted')}</SelectItem>
              <SelectItem value="expired">{t('invoices.statuses.expired')}</SelectItem>
              <SelectItem value="cancelled">{t('invoices.statuses.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select
            value={clientFilter}
            onValueChange={setClientFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('invoices.filter_client')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all_clients')}</SelectItem>
              {/* Here you would map through clients to create SelectItem components */}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full"
          >
            {t('common.reset_filters')}
          </Button>
        </div>
      </div>
      
      {/* Proforma Invoices Table */}
      <DataTable
        columns={columns}
        data={filteredProformas}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('invoices.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('invoices.delete_confirm_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProforma}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProformaInvoices; 