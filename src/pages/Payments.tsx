
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { formatCurrency } from '@/lib/utils';
import { mockPayments } from '@/data/mockData';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { CreditCard, Search } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const Payments = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const getFilteredPayments = () => {
    return mockPayments
      .filter(payment => payment.companyId === companyId)
      .filter(payment => 
        statusFilter === 'all' || payment.status === statusFilter
      );
  };

  const filteredPayments = getFilteredPayments();
  
  const handleAddPayment = () => {
    toast.info(t('payments.add_message'));
  };
  
  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'pending', label: t('payments.pending') },
    { value: 'completed', label: t('payments.completed') },
    { value: 'failed', label: t('payments.failed') },
    { value: 'refunded', label: t('payments.refunded') },
  ];

  const columns: Column<typeof mockPayments[0]>[] = [
    {
      header: t('payments.transaction_id'),
      accessorKey: 'transactionId',
      enableSorting: true,
      cellClassName: 'font-medium'
    },
    {
      header: t('payments.invoice'),
      accessorKey: 'invoiceId',
      enableSorting: true
    },
    {
      header: t('payments.date'),
      accessorKey: 'date',
      enableSorting: true,
      cell: (payment) => new Date(payment.date).toLocaleDateString()
    },
    {
      header: t('payments.amount'),
      accessorKey: 'amount',
      enableSorting: true,
      cell: (payment) => formatCurrency(payment.amount),
      className: 'text-right',
      cellClassName: 'text-right'
    },
    {
      header: t('payments.method'),
      accessorKey: 'method',
      enableSorting: true
    },
    {
      header: t('payments.status'),
      accessorKey: 'status',
      enableSorting: true,
      cell: (payment) => (
        <StatusBadge status={payment.status} type="payment" />
      ),
      className: 'text-center',
      cellClassName: 'text-center'
    }
  ];
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('payments.title')} 
        description={t('payments.description')}
        action={{
          label: t('payments.add'),
          onClick: handleAddPayment
        }}
        icon={<CreditCard className="h-4 w-4" />}
      />
      
      <Card className="mb-8 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
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
        data={filteredPayments}
        columns={columns}
        searchPlaceholder={t('payments.search')}
        searchKey="transactionId"
        noResultsMessage={t('payments.no_results')}
        noDataMessage={t('payments.no_payments')}
        initialSortField="date"
        initialSortDirection="desc"
        cardClassName="shadow-sm"
        tableClassName="border-collapse border-spacing-0"
      />
    </div>
  );
};

export default Payments;
