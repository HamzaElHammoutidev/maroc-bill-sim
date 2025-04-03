import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Share, Download, CheckCircle, FileText, CreditCard } from 'lucide-react';
import { Invoice, getClientById, getCompanyById, getProductById } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import InvoiceArchiveManager from './InvoiceArchiveManager';
import PaymentForm, { PaymentFormValues } from '@/components/payments/PaymentForm';
import { generateInvoicePDF } from '../../lib/pdfGenerator';

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  open,
  onOpenChange,
  invoice,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const client = getClientById(invoice.clientId);
  const company = getCompanyById(invoice.companyId);
  
  const handlePrint = () => {
    try {
      // Get client and company data
      const client = getClientById(invoice.clientId);
      const company = invoice.companyId ? getCompanyById(invoice.companyId) : undefined;
      
      // Generate PDF
      const doc = generateInvoicePDF(invoice, client, company);
      
      // Open and print the PDF 
      const pdfData = doc.output('dataurlstring');
      const printWindow = window.open('');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Invoice</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${pdfData}" onload="setTimeout(function() { window.print(); window.close(); }, 500)"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      
      // Show success notification
      toast({
        title: t('common.success'),
        description: t('invoices.print_success'),
      });
    } catch (error) {
      console.error('Failed to print PDF:', error);
      
      // Show error notification
      toast({
        title: t('common.error'),
        description: t('invoices.print_error'),
        variant: 'destructive',
      });
    }
  };
  
  const handleShare = () => {
    try {
      // Get client and company data
      const client = getClientById(invoice.clientId);
      const company = invoice.companyId ? getCompanyById(invoice.companyId) : undefined;
      
      // Generate PDF
      const doc = generateInvoicePDF(invoice, client, company);
      
      // Create a blob from the PDF data
      const pdfBlob = doc.output('blob');
      
      // Check if the Web Share API is available
      if (navigator.share) {
        // Create a file to share
        const file = new File([pdfBlob], `Invoice-${invoice.invoiceNumber}.pdf`, { 
          type: 'application/pdf' 
        });
        
        // Use the Web Share API to share the file
        navigator.share({
          title: `Invoice #${invoice.invoiceNumber}`,
          text: `Invoice for ${client?.name || 'Client'}`,
          files: [file]
        })
        .then(() => {
          toast({
            title: t('common.success'),
            description: t('invoices.share_success'),
          });
        })
        .catch(error => {
          console.error('Share failed:', error);
          // Fallback to downloading if sharing fails
          doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
          toast({
            title: t('common.info'),
            description: t('invoices.share_fallback'),
          });
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
        toast({
          title: t('common.info'),
          description: t('invoices.share_not_supported'),
        });
      }
    } catch (error) {
      console.error('Failed to share PDF:', error);
      
      // Show error notification
      toast({
        title: t('common.error'),
        description: t('invoices.share_error'),
        variant: 'destructive',
      });
    }
  };
  
  const handleDownload = () => {
    try {
      // Get client and company data
      const client = getClientById(invoice.clientId);
      const company = invoice.companyId ? getCompanyById(invoice.companyId) : undefined;
      
      // Generate PDF
      const doc = generateInvoicePDF(invoice, client, company);
      
      // Save the PDF with a filename based on invoice number
      doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      
      // Show success notification
      toast({
        title: t('common.success'),
        description: t('invoices.download_success'),
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      
      // Show error notification
      toast({
        title: t('common.error'),
        description: t('invoices.download_error'),
        variant: 'destructive',
      });
    }
  };
  
  const handleRecordPayment = () => {
    setPaymentFormOpen(true);
  };

  const handlePaymentSubmit = (data: PaymentFormValues) => {
    // In a real app, this would make an API call to save the payment
    console.log('Payment submitted:', data);
    
    toast({
      title: t('payments.created_success'),
      description: `${t('payments.invoice')} #${invoice.invoiceNumber}`
    });
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle>{t('invoices.viewing')} #{invoice.invoiceNumber}</DialogTitle>
            <div className="flex items-center space-x-2">
              <StatusBadge status={invoice.status} type="invoice" />
            </div>
          </DialogHeader>
          
          <div className="space-y-8 py-4">
            {/* Invoice content here... */}
            
            {/* Footer actions */}
            <div className="flex justify-between items-center flex-wrap gap-2 mt-8">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  {t('invoices.print')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('invoices.download')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  {t('invoices.share')}
                </Button>
                
                {/* Add the archive manager component */}
                {invoice.status !== 'draft' && (
                  <InvoiceArchiveManager 
                    invoice={invoice}
                    onViewArchive={(url) => {
                      // In a real app, open the archived PDF
                      console.log(`Viewing archive: ${url}`);
                    }}
                    onDownloadArchive={(url) => {
                      // In a real app, download the archived PDF
                      console.log(`Downloading archive: ${url}`);
                      
                      toast({
                        title: t('invoices.archive_downloaded') || "Archive téléchargée",
                        description: `${t('invoices.invoice')} #${invoice.invoiceNumber}`
                      });
                    }}
                  />
                )}
              </div>
              
              <div className="flex gap-2">
                {['sent', 'partial', 'overdue'].includes(invoice.status) && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleRecordPayment}
                  >
                    <CreditCard className="h-4 w-4" />
                    {t('invoices.record_payment')}
                  </Button>
                )}
                <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm">
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Form Dialog */}
      <PaymentForm
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        onSubmit={handlePaymentSubmit}
        initialClientId={invoice.clientId}
        initialInvoiceId={invoice.id}
      />
    </>
  );
};

export default InvoiceDetailsDialog; 