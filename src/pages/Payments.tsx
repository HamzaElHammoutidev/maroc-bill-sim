import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { CreditCard, AlertCircle } from 'lucide-react';
import { mockPayments, Payment, createPayment } from '@/data/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Import our components
import PaymentFilters from '@/components/payments/PaymentFilters';
import PaymentsTable from '@/components/payments/PaymentsTable';
import PaymentDetailsDialog from '@/components/payments/PaymentDetailsDialog';
import InvoiceDetailsDialog from '@/components/payments/InvoiceDetailsDialog';
import DownloadReceiptPopover from '@/components/payments/DownloadReceiptPopover';
import DeletePaymentDialog from '@/components/payments/DeletePaymentDialog';
import PaymentForm, { PaymentFormValues } from '@/components/payments/PaymentForm';
import PaymentScheduleView from '@/components/payments/PaymentScheduleView';
import ClientStatementView from '@/components/payments/ClientStatementView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CashFlowReporting } from '@/components/payments/CashFlowReporting';
import { VatEncashmentTracker } from '@/components/payments/VatEncashmentTracker';
import { BankReconciliation } from '@/components/payments/BankReconciliation';
import { PaymentReminders } from '@/components/payments/PaymentReminders';
import { AuditTrailSystem } from '@/components/payments/AuditTrailSystem';

const Payments = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [viewInvoice, setViewInvoice] = useState<string | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [downloadPayment, setDownloadPayment] = useState<Payment | null>(null);
  
  // State for payment form
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [initialClientId, setInitialClientId] = useState<string | undefined>(undefined);
  const [initialInvoiceId, setInitialInvoiceId] = useState<string | undefined>(undefined);
  
  const getFilteredPayments = () => {
    return payments
      .filter(payment => payment.companyId === companyId)
      .filter(payment => 
        statusFilter === 'all' || payment.status === statusFilter
      );
  };

  const filteredPayments = getFilteredPayments();
  
  const handleAddPayment = () => {
    setInitialClientId(undefined);
    setInitialInvoiceId(undefined);
    setIsPaymentFormOpen(true);
  };
  
  // Function to open payment form for a specific invoice
  const handleAddPaymentForInvoice = (invoiceId: string, clientId: string) => {
    setInitialInvoiceId(invoiceId);
    setInitialClientId(clientId);
    setIsPaymentFormOpen(true);
  };
  
  // Function to handle payment form submission
  const handlePaymentSubmit = (formData: PaymentFormValues) => {
    // Create a new payment
    const paymentData = {
      ...formData,
      companyId,
      status: 'completed' as const,
    };
    
    // Create the payment in our data store
    const newPayment = createPayment(paymentData);
    
    // Add to local state
    setPayments(prev => [newPayment, ...prev]);
    
    // Show success message
    toast.success(t('payments.created_success'));
    setIsPaymentFormOpen(false);
  };
  
  // Function to view payment details
  const handleViewPayment = (payment: Payment) => {
    setViewPayment(payment);
  };

  // Function to view invoice details
  const handleViewInvoice = (invoiceId: string) => {
    setViewInvoice(invoiceId);
  };

  // Function to download receipt
  const handleDownloadReceipt = (payment: Payment) => {
    setDownloadPayment(payment);
    setIsDownloadMenuOpen(true);
  };

  // Function to actually download the receipt in a specific format
  const handleDownloadReceiptFormat = (format: string, payment: Payment) => {
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
      // Remove from our local state
      setPayments(prev => prev.filter(p => p.id !== deletePaymentId));
      
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
      
      <Tabs defaultValue="payments" className="mt-6">
        <TabsList className="mb-4 w-full md:w-auto">
          <TabsTrigger value="payments">{t('payments.payments')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('payments.schedule')}</TabsTrigger>
          <TabsTrigger value="statements">{t('payments.statements')}</TabsTrigger>
          <TabsTrigger value="reporting">{t('payments.reporting')}</TabsTrigger>
          <TabsTrigger value="reconciliation">{t('payments.reconciliation')}</TabsTrigger>
          <TabsTrigger value="reminders">{t('payments.reminders')}</TabsTrigger>
          <TabsTrigger value="audit">{t('payments.audit')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="mt-0">
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
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-0">
          <PaymentScheduleView 
            onSelectInvoice={handleAddPaymentForInvoice}
            onExportSchedule={() => toast.info(t('payments.export_schedule_info'))}
          />
        </TabsContent>
        
        <TabsContent value="statements" className="mt-0">
          <ClientStatementView 
            onViewInvoice={handleViewInvoice}
            onViewPayment={handleViewPayment}
            onPrint={() => toast.info(t('payments.print_statement_info'))}
            onExport={(format) => toast.info(t('payments.export_statement_info', { format }))}
          />
        </TabsContent>
        
        <TabsContent value="reporting" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <CashFlowReporting 
              onExport={(format) => toast.info(t('payments.export_cashflow_info', { format }))}
            />
            
            <VatEncashmentTracker 
              onExport={(format) => toast.info(t('payments.export_vat_info', { format }))}
              onPrint={() => toast.info(t('payments.print_vat_info'))}
              onMarkDeclared={(period) => toast.success(t('payments.vat_declared', { period }))}
              onMarkPaid={(period) => toast.success(t('payments.vat_paid', { period }))}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="reconciliation" className="mt-0">
          <BankReconciliation 
            onExport={(format) => toast.info(t('payments.export_reconciliation_info', { format }))}
            onCreatePayment={(paymentData) => {
              const newPayment = createPayment(paymentData);
              setPayments(prev => [newPayment, ...prev]);
              toast.success(t('payments.payment_created_from_reconciliation'));
            }}
            onMatchSuccess={() => toast.success(t('payments.reconciliation_success'))}
          />
        </TabsContent>
        
        <TabsContent value="reminders" className="mt-0">
          <PaymentReminders 
            onSendReminder={(invoiceIds, templateId) => {
              toast.success(t('payments.reminders_sent', { count: invoiceIds.length }));
            }}
            onMarkAsPaid={(invoiceId) => {
              // Update invoice status in a real app
              toast.success(t('payments.invoice_marked_paid', { id: invoiceId }));
            }}
          />
        </TabsContent>
        
        <TabsContent value="audit" className="mt-0">
          <AuditTrailSystem 
            onExport={(format) => toast.info(t('payments.export_audit_info', { format }))}
          />
        </TabsContent>
      </Tabs>

      {/* Payment Registration Form */}
      <PaymentForm
        open={isPaymentFormOpen}
        onOpenChange={setIsPaymentFormOpen}
        onSubmit={handlePaymentSubmit}
        initialClientId={initialClientId}
        initialInvoiceId={initialInvoiceId}
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

      <AlertDialog open={!!deletePaymentId} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('payments.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('payments.delete_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Payments;
