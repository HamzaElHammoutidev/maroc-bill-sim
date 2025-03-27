
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { CreditCard } from 'lucide-react';
import { mockPayments } from '@/data/mockData';
import { toast } from 'sonner';

// Import our new components
import PaymentFilters from '@/components/payments/PaymentFilters';
import PaymentsTable from '@/components/payments/PaymentsTable';
import PaymentDetailsDialog from '@/components/payments/PaymentDetailsDialog';
import InvoiceDetailsDialog from '@/components/payments/InvoiceDetailsDialog';
import DownloadReceiptPopover from '@/components/payments/DownloadReceiptPopover';
import DeletePaymentDialog from '@/components/payments/DeletePaymentDialog';

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
  
  // Function to view payment details
  const handleViewPayment = (payment: typeof mockPayments[0]) => {
    setViewPayment(payment);
  };

  // Function to view invoice details
  const handleViewInvoice = (invoiceId: string) => {
    setViewInvoice(invoiceId);
  };

  // Function to download receipt
  const handleDownloadReceipt = (payment: typeof mockPayments[0]) => {
    setDownloadPayment(payment);
    setIsDownloadMenuOpen(true);
  };

  // Function to actually download the receipt in a specific format
  const handleDownloadReceiptFormat = (format: string, payment: typeof mockPayments[0]) => {
    setIsDownloadMenuOpen(false);
    setDownloadPayment(null);
    toast.success(`${t('payments.downloaded')} ${payment.transactionId} as ${format}`);
  };

  // Function to handle dialog close properly
  const handleCloseViewPayment = () => {
    setViewPayment(null);
  };

  // Function to handle invoice dialog close properly
  const handleCloseViewInvoice = () => {
    setViewInvoice(null);
  };

  // Function to handle alert dialog close properly
  const handleCloseDeleteDialog = () => {
    setDeletePaymentId(null);
  };

  // Function to handle download popover close properly
  const handleCloseDownloadMenu = () => {
    setIsDownloadMenuOpen(false);
    setDownloadPayment(null);
  };

  // Function to request payment deletion
  const handleDeletePayment = (paymentId: string) => {
    setDeletePaymentId(paymentId);
  };

  // Function to confirm and execute payment deletion
  const handleConfirmDelete = () => {
    if (deletePaymentId) {
      toast.success(`${t('payments.deleted')} #${deletePaymentId}`);
      setDeletePaymentId(null);
    }
  };

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
      
      <PaymentFilters 
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      
      <PaymentsTable 
        payments={filteredPayments}
        onViewPayment={handleViewPayment}
        onViewInvoice={handleViewInvoice}
        onDownloadReceipt={handleDownloadReceipt}
        onDeletePayment={handleDeletePayment}
      />

      <PaymentDetailsDialog 
        payment={viewPayment}
        open={!!viewPayment}
        onOpenChange={handleCloseViewPayment}
      />

      <InvoiceDetailsDialog 
        invoiceId={viewInvoice}
        open={!!viewInvoice}
        onOpenChange={handleCloseViewInvoice}
      />

      <DownloadReceiptPopover 
        payment={downloadPayment}
        open={isDownloadMenuOpen}
        onOpenChange={handleCloseDownloadMenu}
        onDownload={handleDownloadReceiptFormat}
      />

      <DeletePaymentDialog 
        paymentId={deletePaymentId}
        open={!!deletePaymentId}
        onOpenChange={handleCloseDeleteDialog}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Payments;
