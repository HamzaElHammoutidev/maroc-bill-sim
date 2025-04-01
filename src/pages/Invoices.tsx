import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { 
  mockInvoices, 
  mockClients, 
  Invoice, 
  InvoiceStatus, 
  createInvoice,
  getClientById 
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
  Ban,
  CreditCard,
  FileMinus,
  FileCheck,
  Clock,
  FileX,
  BellRing
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
import InvoiceDetailsDialog from '@/components/payments/InvoiceDetailsDialog';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import SendInvoiceDialog from '@/components/invoices/SendInvoiceDialog';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';

const Invoices = () => {
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Dialog visibility states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateForm, setIsCreateForm] = useState(true);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showInsufficientStockAlert, setShowInsufficientStockAlert] = useState(false);
  const [insufficientStockMessage, setInsufficientStockMessage] = useState('');
  
  // Load invoices
  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoices(mockInvoices);
      setFilteredInvoices(mockInvoices);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...invoices];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(invoice => invoice.status === statusFilter);
    }
    
    // Apply client filter
    if (clientFilter !== 'all') {
      result = result.filter(invoice => invoice.clientId === clientFilter);
    }
    
    // Apply date filters
    if (dateFilter.from) {
      result = result.filter(invoice => new Date(invoice.date) >= dateFilter.from!);
    }
    
    if (dateFilter.to) {
      result = result.filter(invoice => new Date(invoice.date) <= dateFilter.to!);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(query) || 
        (getClientById(invoice.clientId)?.name || '').toLowerCase().includes(query)
      );
    }
    
    setFilteredInvoices(result);
  }, [invoices, statusFilter, clientFilter, dateFilter, searchQuery]);
  
  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter('all');
    setClientFilter('all');
    setDateFilter({ from: null, to: null });
    setSearchQuery('');
  };
  
  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsCreateForm(true);
    setIsFormOpen(true);
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    // Only allow editing of draft invoices
    if (invoice.status !== 'draft') {
      toast({
        title: t('invoices.edit_error'),
        description: t('invoices.edit_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedInvoice(invoice);
    setIsCreateForm(false);
    setIsFormOpen(true);
  };
  
  const handleSendInvoice = (invoice: Invoice) => {
    // Only allow sending of draft invoices
    if (invoice.status !== 'draft') {
      toast({
        title: t('invoices.send_error'),
        description: t('invoices.send_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedInvoice(invoice);
    setIsSendOpen(true);
  };
  
  const handleMarkAsPaid = (invoice: Invoice) => {
    // Only allow marking as paid for sent or partially paid invoices
    if (!['sent', 'partial'].includes(invoice.status)) {
      toast({
        title: t('invoices.payment_error'),
        description: t('invoices.payment_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    // Update the invoice status
    const updatedInvoice = {
      ...invoice,
      status: 'paid' as InvoiceStatus,
      updatedAt: new Date().toISOString()
    };
    
    // Update the invoices array
    const updatedInvoices = invoices.map(i => 
      i.id === updatedInvoice.id ? updatedInvoice : i
    );
    
    setInvoices(updatedInvoices);
    
    toast({
      title: t('invoices.marked_paid'),
      description: `${t('invoices.invoice')} #${invoice.invoiceNumber}`,
    });
  };
  
  const handleDeleteInvoice = (invoice: Invoice) => {
    // Only allow deletion of draft invoices
    if (invoice.status !== 'draft') {
      toast({
        title: t('invoices.delete_error'),
        description: t('invoices.delete_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedInvoice(invoice);
    setIsDeleteOpen(true);
  };
  
  const handleCancelInvoice = (invoice: Invoice) => {
    // Only allow cancellation of sent or overdue invoices
    if (!['sent', 'overdue'].includes(invoice.status)) {
      toast({
        title: t('invoices.cancel_error'),
        description: t('invoices.cancel_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    // Update the invoice status
    const updatedInvoice = {
      ...invoice,
      status: 'cancelled' as InvoiceStatus,
      updatedAt: new Date().toISOString()
    };
    
    // Update the invoices array
    const updatedInvoices = invoices.map(i => 
      i.id === updatedInvoice.id ? updatedInvoice : i
    );
    
    setInvoices(updatedInvoices);
    
    toast({
      title: t('invoices.cancelled'),
      description: `${t('invoices.invoice')} #${invoice.invoiceNumber}`,
    });
  };
  
  const handleDownloadInvoice = (invoice: Invoice) => {
    toast({
      title: t('invoices.downloading'),
      description: `${t('invoices.invoice')} #${invoice.invoiceNumber}`,
    });
  };
  
  const handleInvoiceFormSubmit = (data: any) => {
    // Get the next invoice ID
    const nextId = `INV-${Date.now()}`;
    
    // Format the invoice number
    const invoiceNumber = data.invoiceNumber || `FAC-${new Date().getFullYear()}-${invoices.length + 1}`.padStart(8, '0');
    
    // Calculate totals
    let subtotal = 0;
    let vatAmount = 0;
    let discount = 0;
    
    data.items.forEach((item: any) => {
      subtotal += (item.quantity * item.unitPrice);
      vatAmount += (item.quantity * item.unitPrice) * (item.vatRate / 100);
      discount += item.discount;
    });
    
    const total = subtotal + vatAmount - discount;
    
    // Create the new invoice
    const newInvoice: Invoice = {
      id: nextId,
      companyId,
      clientId: data.clientId,
      invoiceNumber,
      date: data.date.toISOString(),
      dueDate: data.dueDate.toISOString(),
      status: 'draft',
      items: data.items.map((item: any, index: number) => ({
        id: `${nextId}-${index + 1}`,
        invoiceId: nextId,
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        discount: item.discount,
        total: (item.quantity * item.unitPrice) - item.discount
      })),
      subtotal,
      vatAmount,
      discount,
      total,
      notes: data.notes,
      terms: data.paymentTerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeposit: data.isDeposit,
      depositPercentage: data.depositPercentage,
      depositAmount: data.depositAmount
    };
    
    if (isCreateForm) {
      // Add the new invoice to the list
      setInvoices([newInvoice, ...invoices]);
      
      toast({
        title: t('invoices.created'),
        description: `${t('invoices.invoice')} #${invoiceNumber} ${t('common.created_successfully')}`,
      });
    } else {
      // Update existing invoice
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === selectedInvoice?.id ? {...newInvoice, id: invoice.id} : invoice
      );
      
      setInvoices(updatedInvoices);
      
      toast({
        title: t('invoices.updated'),
        description: `${t('invoices.invoice')} #${invoiceNumber} ${t('common.updated_successfully')}`,
      });
    }
  };
  
  const handleSendFormSubmit = (data: any) => {
    if (!selectedInvoice) return;
    
    // Update the invoice status to 'sent'
    const updatedInvoice = {
      ...selectedInvoice,
      status: 'sent' as InvoiceStatus,
      updatedAt: new Date().toISOString()
    };
    
    // Update the invoices array
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    );
    
    setInvoices(updatedInvoices);
    
    toast({
      title: t('invoices.sent'),
      description: `${t('invoices.invoice')} #${selectedInvoice.invoiceNumber} ${t('common.sent_successfully')}`,
    });
  };
  
  const handleConfirmDelete = () => {
    if (!selectedInvoice) return;
    
    // Remove the invoice from the list
    const updatedInvoices = invoices.filter(invoice => invoice.id !== selectedInvoice.id);
    setInvoices(updatedInvoices);
    
    setIsDeleteOpen(false);
    
    toast({
      title: t('invoices.deleted'),
      description: `${t('invoices.invoice')} #${selectedInvoice.invoiceNumber} ${t('common.deleted_successfully')}`,
    });
  };
  
  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'draft', label: t('invoices.draft') },
    { value: 'sent', label: t('invoices.sent') },
    { value: 'paid', label: t('invoices.paid') },
    { value: 'partial', label: t('invoices.partial') },
    { value: 'overdue', label: t('invoices.overdue') },
    { value: 'cancelled', label: t('invoices.cancelled') },
  ];
  
  // Get counts for each status
  const getStatusCounts = () => {
    const counts = {
      draft: 0,
      sent: 0,
      paid: 0,
      partial: 0,
      overdue: 0,
      cancelled: 0,
      total: invoices.length
    };
    
    invoices.forEach(invoice => {
      if (counts.hasOwnProperty(invoice.status)) {
        counts[invoice.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();
  
  // Define status cards
  const statusCards = [
    {
      title: t('invoices.draft'),
      count: statusCounts.draft,
      icon: <FileMinus className="h-8 w-8 text-gray-500" />,
      className: 'bg-gray-50 border-gray-200'
    },
    {
      title: t('invoices.sent'),
      count: statusCounts.sent,
      icon: <SendHorizontal className="h-8 w-8 text-blue-500" />,
      className: 'bg-blue-50 border-blue-200'
    },
    {
      title: t('invoices.paid'),
      count: statusCounts.paid,
      icon: <FileCheck className="h-8 w-8 text-green-500" />,
      className: 'bg-green-50 border-green-200'
    },
    {
      title: t('invoices.partial'),
      count: statusCounts.partial,
      icon: <Receipt className="h-8 w-8 text-amber-500" />,
      className: 'bg-amber-50 border-amber-200'
    },
    {
      title: t('invoices.overdue'),
      count: statusCounts.overdue,
      icon: <Clock className="h-8 w-8 text-red-500" />,
      className: 'bg-red-50 border-red-200'
    },
    {
      title: t('invoices.cancelled'),
      count: statusCounts.cancelled,
      icon: <FileX className="h-8 w-8 text-gray-500" />,
      className: 'bg-gray-50 border-gray-200'
    }
  ];
  
  // Calculate payment rate
  const calculatePaymentRate = () => {
    const totalSent = statusCounts.sent + statusCounts.paid + statusCounts.partial + statusCounts.overdue;
    const totalPaid = statusCounts.paid + statusCounts.partial;
    
    if (totalSent === 0) return 0;
    return (totalPaid / totalSent) * 100;
  };
  
  const paymentRate = calculatePaymentRate();
  
  const columns: Column<Invoice>[] = [
    {
      header: t('invoices.number'),
      accessorKey: 'invoiceNumber',
      enableSorting: true,
      cellClassName: 'font-medium'
    },
    {
      header: t('invoices.client'),
      accessorKey: 'clientId',
      enableSorting: true,
      cell: (invoice) => {
        const client = getClientById(invoice.clientId);
        return client?.name || t('invoices.unknown_client');
      }
    },
    {
      header: t('invoices.date'),
      accessorKey: 'date',
      enableSorting: true,
      cell: (invoice) => formatDate(invoice.date)
    },
    {
      header: t('invoices.due_date'),
      accessorKey: 'dueDate',
      enableSorting: true,
      cell: (invoice) => formatDate(invoice.dueDate)
    },
    {
      header: t('invoices.amount'),
      accessorKey: 'total',
      enableSorting: true,
      cell: (invoice) => formatCurrency(invoice.total),
      className: 'text-right',
      cellClassName: 'text-right'
    },
    {
      header: t('invoices.status'),
      accessorKey: 'status',
      enableSorting: true,
      cell: (invoice) => (
        <StatusBadge status={invoice.status} type="invoice" />
      ),
      className: 'text-center',
      cellClassName: 'text-center'
    },
    {
      header: t('invoices.actions'),
      accessorKey: 'id',
      cell: (invoice) => {
        const actions: ActionItem[] = [
          {
            label: t('invoices.view'),
            icon: <FileText className="h-4 w-4" />,
            onClick: () => handleViewInvoice(invoice)
          },
          {
            label: t('invoices.download'),
            icon: <FileDown className="h-4 w-4" />,
            onClick: () => handleDownloadInvoice(invoice)
          }
        ];
        
        // Only allow editing of draft invoices
        if (invoice.status === 'draft') {
          actions.push({
            label: t('invoices.edit'),
            icon: <FileEdit className="h-4 w-4" />,
            onClick: () => handleEditInvoice(invoice)
          });
        }
        
        // Only allow sending of draft invoices
        if (invoice.status === 'draft') {
          actions.push({
            label: t('invoices.send'),
            icon: <SendHorizontal className="h-4 w-4" />,
            onClick: () => handleSendInvoice(invoice)
          });
        }
        
        // Only allow marking as paid for sent or partially paid invoices
        if (['sent', 'partial'].includes(invoice.status)) {
          actions.push({
            label: t('invoices.mark_paid'),
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => handleMarkAsPaid(invoice)
          });
        }
        
        // Only allow recording partial payment for sent or partially paid invoices
        if (['sent', 'partial', 'overdue'].includes(invoice.status)) {
          actions.push({
            label: t('invoices.record_payment'),
            icon: <CreditCard className="h-4 w-4" />,
            onClick: () => {
              toast({
                title: t('invoices.recording_payment'),
                description: `#${invoice.invoiceNumber}`
              });
            }
          });
        }
        
        // Only allow cancellation of sent or overdue invoices
        if (['sent', 'overdue'].includes(invoice.status)) {
          actions.push({
            label: t('invoices.cancel'),
            icon: <Ban className="h-4 w-4" />,
            onClick: () => handleCancelInvoice(invoice),
            className: 'text-destructive'
          });
        }
        
        // Only allow deletion of draft invoices
        if (invoice.status === 'draft') {
          actions.push({
            label: t('invoices.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => handleDeleteInvoice(invoice),
            className: 'text-destructive'
          });
        }
        
        return <TableActions actions={actions} label={t('common.actions')} />;
      },
      className: 'text-center',
      cellClassName: 'text-center'
    }
  ];
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('invoices.title')} 
        action={{
          label: t('invoices.create'),
          onClick: handleCreateInvoice
        }}
      />
      
      {isLoading ? (
        <div className="space-y-6">
          <Card className="h-[200px] w-full rounded-lg">
            <CardContent className="h-full flex items-center justify-center">
              <div className="animate-pulse w-full h-full bg-gray-200 rounded-lg" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
            {statusCards.map((card, index) => (
              <Card key={index} className={`${card.className} shadow-sm`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    {card.title}
                    <span>{card.icon}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{card.count}</p>
                </CardContent>
              </Card>
            ))}
            
            {/* Payment Rate Card */}
            <Card className="bg-purple-50 border-purple-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  {t('invoices.payment_rate')}
                  <span><BellRing className="h-8 w-8 text-purple-500" /></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{paymentRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <div className="mb-6">
            <InvoiceFilters
              statusFilter={statusFilter}
              setStatusFilter={(status) => setStatusFilter(status)}
              clientFilter={clientFilter}
              setClientFilter={(clientId) => setClientFilter(clientId)}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onResetFilters={handleResetFilters}
            />
            
            {/* Search Input */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('invoices.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </>
      )}
      
      <DataTable
        data={filteredInvoices}
        columns={columns}
        searchKey="invoiceNumber"
        noDataMessage={t('invoices.no_invoices')}
        noResultsMessage={t('invoices.no_matching_invoices')}
        hideSearch={true}
        initialSortField="date"
        initialSortDirection="desc"
        cardClassName="shadow-sm"
      />
      
      {/* Invoice Form Dialog */}
      <InvoiceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleInvoiceFormSubmit}
        invoice={selectedInvoice || undefined}
        isEditing={!isCreateForm}
      />
      
      {/* Invoice Details Dialog */}
      <InvoiceDetailsDialog
        invoiceId={selectedInvoice?.id || null}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      
      {/* Send Invoice Dialog */}
      {selectedInvoice && (
        <SendInvoiceDialog
          open={isSendOpen}
          onOpenChange={setIsSendOpen}
          onSubmit={handleSendFormSubmit}
          invoice={selectedInvoice}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        title={t('invoices.confirm_delete')}
        description={t('invoices.confirm_delete_desc')}
      />
      
      {/* Insufficient Stock Alert */}
      <AlertDialog open={showInsufficientStockAlert} onOpenChange={setShowInsufficientStockAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('invoices.insufficient_stock')}</AlertDialogTitle>
            <AlertDialogDescription>
              {insufficientStockMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>
              {t('common.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Invoices;
