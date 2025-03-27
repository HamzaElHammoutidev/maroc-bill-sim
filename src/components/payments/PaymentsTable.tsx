
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, FileText, Trash, DownloadCloud } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import StatusBadge from '@/components/StatusBadge';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';
import { PaymentStatus, Payment } from '@/data/mockData';

interface PaymentsTableProps {
  payments: Payment[];
  onViewPayment: (payment: Payment) => void;
  onViewInvoice: (invoiceId: string) => void;
  onDownloadReceipt: (payment: Payment) => void;
  onDeletePayment: (paymentId: string) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  onViewPayment,
  onViewInvoice,
  onDownloadReceipt,
  onDeletePayment,
}) => {
  const { t } = useLanguage();

  const columns: Column<Payment>[] = [
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
        <StatusBadge status={payment.status as PaymentStatus} type="payment" />
      ),
      className: 'text-center',
      cellClassName: 'text-center'
    },
    {
      header: t('payments.actions'),
      accessorKey: 'id',
      cell: (payment) => {
        const actions: ActionItem[] = [
          {
            label: t('payments.view'),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onViewPayment(payment)
          },
          {
            label: t('payments.view_invoice'),
            icon: <FileText className="h-4 w-4" />,
            onClick: () => onViewInvoice(payment.invoiceId)
          },
          {
            label: t('payments.download_receipt'),
            icon: <DownloadCloud className="h-4 w-4" />,
            onClick: () => onDownloadReceipt(payment)
          },
          {
            label: t('payments.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => onDeletePayment(payment.transactionId || ''),
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
    <DataTable
      data={payments}
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
  );
};

export default PaymentsTable;
