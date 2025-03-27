import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { formatCurrency } from '@/lib/utils';
import { mockPayments } from '@/data/mockData';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { 
  CreditCard, 
  Search, 
  Eye, 
  FileText, 
  Trash, 
  Receipt, 
  DownloadCloud,
  AlertCircle
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';
import { Button } from '@/components/ui/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Payments = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewPayment, setViewPayment] = useState<(typeof mockPayments[0]) | null>(null);
  const [viewInvoice, setViewInvoice] = useState<string | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [downloadPayment, setDownloadPayment] = useState<(typeof mockPayments[0]) | null>(null);
  
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

  // Function to view payment details
  const handleViewPayment = (payment: typeof mockPayments[0]) => {
    setViewPayment(payment);
  };

  // Function to view invoice details
  const handleViewInvoice = (invoiceId: string) => {
    setViewInvoice(invoiceId);
  };

  // Function to download receipt
  const handleDownloadReceipt = (format: string, payment: typeof mockPayments[0]) => {
    setIsDownloadMenuOpen(false);
    toast.success(`${t('payments.downloaded')} ${payment.transactionId} as ${format}`);
  };

  // Function to delete payment
  const handleConfirmDelete = () => {
    if (deletePaymentId) {
      toast.success(`${t('payments.deleted')} #${deletePaymentId}`);
      setDeletePaymentId(null);
    }
  };

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
    },
    {
      header: t('payments.actions'),
      accessorKey: 'id',
      cell: (payment) => {
        const actions: ActionItem[] = [
          {
            label: t('payments.view'),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => {
              handleViewPayment(payment);
            }
          },
          {
            label: t('payments.view_invoice'),
            icon: <FileText className="h-4 w-4" />,
            onClick: () => {
              handleViewInvoice(payment.invoiceId);
            }
          },
          {
            label: t('payments.download_receipt'),
            icon: <DownloadCloud className="h-4 w-4" />,
            onClick: () => {
              setDownloadPayment(payment);
              setIsDownloadMenuOpen(true);
            }
          },
          {
            label: t('payments.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => {
              setDeletePaymentId(payment.transactionId);
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

      {/* Payment View Dialog */}
      <Dialog open={!!viewPayment} onOpenChange={() => setViewPayment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('payments.payment_details')}</DialogTitle>
            <DialogDescription>
              {t('payments.transaction')}: {viewPayment?.transactionId}
            </DialogDescription>
          </DialogHeader>
          
          {viewPayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('payments.date')}</span>
                  <span className="font-medium">{new Date(viewPayment.date).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('payments.amount')}</span>
                  <span className="font-medium">{formatCurrency(viewPayment.amount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('payments.method')}</span>
                  <span className="font-medium">{viewPayment.method}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('payments.status')}</span>
                  <StatusBadge status={viewPayment.status} type="payment" />
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-sm text-muted-foreground">{t('payments.invoice')}</span>
                  <span className="font-medium">{viewPayment.invoiceId}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-sm text-muted-foreground">{t('payments.payment_note')}</span>
                  <span className="font-medium">{viewPayment.note || t('payments.no_note')}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewPayment(null)}>{t('common.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice View Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('invoices.invoice_details')}</DialogTitle>
            <DialogDescription>
              {t('invoices.invoice_number')}: {viewInvoice}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="p-4 border rounded-md bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>{t('invoices.full_invoice_message')}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setViewInvoice(null)}>{t('common.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Download Popover */}
      <Popover open={isDownloadMenuOpen} onOpenChange={setIsDownloadMenuOpen}>
        <PopoverContent className="w-56 p-0">
          <div className="p-3">
            <h4 className="font-medium text-sm mb-1">{t('payments.select_format')}</h4>
            <p className="text-xs text-muted-foreground mb-2">{t('payments.download_description')}</p>
          </div>
          <div className="border-t">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none h-9 px-3"
              onClick={() => downloadPayment && handleDownloadReceipt('PDF', downloadPayment)}
            >
              PDF
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none h-9 px-3"
              onClick={() => downloadPayment && handleDownloadReceipt('CSV', downloadPayment)}
            >
              CSV
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePaymentId} onOpenChange={(open) => !open && setDeletePaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('payments.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('payments.delete_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
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

export default Payments;
