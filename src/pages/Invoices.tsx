
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockInvoices, mockClients, InvoiceStatus } from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { 
  FileText, 
  CheckCircle, 
  Share, 
  FileEdit, 
  Trash, 
  Search,
  FilePlus
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
import { Card, CardContent } from '@/components/ui/card';

const Invoices = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const getFilteredInvoices = () => {
    return mockInvoices
      .filter(invoice => invoice.companyId === companyId)
      .filter(invoice => 
        statusFilter === 'all' || invoice.status === statusFilter
      );
  };

  const filteredInvoices = getFilteredInvoices();
  
  const handleCreateInvoice = () => {
    toast.info(t('invoices.create_message'));
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

  const columns: Column<typeof mockInvoices[0]>[] = [
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
        const client = mockClients.find(c => c.id === invoice.clientId);
        return client?.name || t('invoices.unknown_client');
      }
    },
    {
      header: t('invoices.date'),
      accessorKey: 'date',
      enableSorting: true,
      cell: (invoice) => new Date(invoice.date).toLocaleDateString()
    },
    {
      header: t('invoices.due_date'),
      accessorKey: 'dueDate',
      enableSorting: true,
      cell: (invoice) => new Date(invoice.dueDate).toLocaleDateString()
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
            onClick: () => {
              toast.info(`${t('invoices.viewing')} #${invoice.invoiceNumber}`);
            }
          },
          {
            label: t('invoices.send'),
            icon: <Share className="h-4 w-4" />,
            onClick: () => {
              toast.info(`${t('invoices.sending')} #${invoice.invoiceNumber}`);
            }
          },
          {
            label: t('invoices.edit'),
            icon: <FileEdit className="h-4 w-4" />,
            onClick: () => {
              toast.info(`${t('invoices.editing')} #${invoice.invoiceNumber}`);
            }
          },
          {
            label: t('invoices.mark_paid'),
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => {
              toast.success(`${t('invoices.marked_paid')} #${invoice.invoiceNumber}`);
            }
          },
          {
            label: t('invoices.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => {
              toast.error(`${t('invoices.deleting')} #${invoice.invoiceNumber}`);
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
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('invoices.title')} 
        action={{
          label: t('invoices.create'),
          onClick: handleCreateInvoice
        }}
      />
      
      <Card className="mb-8 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <div className="invisible w-0 h-0">{searchQuery}</div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DataTable
        data={filteredInvoices}
        columns={columns}
        searchPlaceholder={t('invoices.search')}
        searchKey="invoiceNumber"
        noResultsMessage={t('invoices.no_results')}
        noDataMessage={t('invoices.no_invoices')}
        initialSortField="date"
        initialSortDirection="desc"
        cardClassName="shadow-sm"
        tableClassName="border-collapse border-spacing-0"
      />
    </div>
  );
};

export default Invoices;
