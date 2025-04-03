import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Printer, Share, CreditCard, FileMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Invoice, getInvoiceById, getClientById, getProductById, getCompanyById } from '@/data/mockData';
import { formatDate, formatCurrency } from '@/lib/utils';
import InvoiceStatusWorkflow from '@/components/invoices/InvoiceStatusWorkflow';
import StatusBadge from '@/components/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PaymentForm, { PaymentFormValues } from '@/components/payments/PaymentForm';
import { generateInvoicePDF } from '../../lib/pdfGenerator';

interface InvoiceDetailsDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  invoiceId,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  
  if (!invoiceId) return null;
  
  const invoice = getInvoiceById(invoiceId);
  
  if (!invoice) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t('invoices.invoice_not_found')}</DialogTitle>
            <DialogDescription>
              {t('invoices.invoice_not_found_desc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>{t('common.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  const client = getClientById(invoice.clientId);
  
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
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">
                  {t('invoices.invoice')} #{invoice.invoiceNumber}
                </DialogTitle>
                <DialogDescription>
                  {t('invoices.created_on')} {formatDate(invoice.createdAt)}
                </DialogDescription>
              </div>
              <StatusBadge status={invoice.status} type="invoice" className="ml-2" />
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Status Workflow */}
            <InvoiceStatusWorkflow 
              status={invoice.status}
              createdAt={invoice.createdAt}
              sentAt={invoice.status !== 'draft' ? invoice.updatedAt : undefined}
              paidAt={invoice.status === 'paid' ? invoice.updatedAt : undefined}
              cancelledAt={invoice.status === 'cancelled' ? invoice.updatedAt : undefined}
            />
            
            {/* Client and Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('invoices.client_info')}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-1">
                    <p className="font-medium">{client?.name || t('invoices.unknown_client')}</p>
                    {client?.address && <p className="text-sm">{client.address}</p>}
                    {client?.city && (
                      <p className="text-sm">{client.city}</p>
                    )}
                    {client?.email && <p className="text-sm">{client.email}</p>}
                    {client?.phone && <p className="text-sm">{client.phone}</p>}
                    {client?.ice && <p className="text-sm text-muted-foreground">ICE: {client.ice}</p>}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('invoices.invoice_info')}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('invoices.invoice_number')}</Label>
                      <p>{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('invoices.date')}</Label>
                      <p>{formatDate(invoice.date)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('invoices.due_date')}</Label>
                      <p>{formatDate(invoice.dueDate)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t('invoices.status')}</Label>
                      <StatusBadge status={invoice.status} type="invoice" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Invoice Items */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('invoices.items')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('invoices.product')}</TableHead>
                      <TableHead>{t('invoices.description')}</TableHead>
                      <TableHead className="text-center">{t('invoices.quantity')}</TableHead>
                      <TableHead className="text-right">{t('invoices.unit_price')}</TableHead>
                      <TableHead className="text-right">{t('invoices.vat')}</TableHead>
                      <TableHead className="text-right">{t('invoices.discount')}</TableHead>
                      <TableHead className="text-right">{t('invoices.total')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {getProductById(item.productId)?.name || t('invoices.unknown_product')}
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{item.vatRate}%</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end mt-4">
                  <div className="w-60 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('invoices.subtotal')}</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('invoices.vat_amount')}</span>
                      <span>{formatCurrency(invoice.vatAmount)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{t('invoices.discount')}</span>
                        <span>-{formatCurrency(invoice.discount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>{t('invoices.total')}</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                    
                    {invoice.isDeposit && (
                      <div className="rounded-md bg-primary/10 p-2 mt-2">
                        <p className="text-xs font-medium text-primary">{t('invoices.deposit_invoice')}</p>
                        <div className="flex justify-between text-sm mt-1">
                          <span>{t('invoices.deposit_percentage')}</span>
                          <span>{invoice.depositPercentage}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t('invoices.deposit_amount')}</span>
                          <span>{formatCurrency(invoice.depositAmount || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Notes and Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoice.notes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t('invoices.notes')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{invoice.notes}</p>
                    </CardContent>
                  </Card>
                )}
                
                {invoice.terms && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t('invoices.payment_terms')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{invoice.terms}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                {t('common.close')}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-1" />
                {t('invoices.print')}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                {t('invoices.download')}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share className="h-4 w-4 mr-1" />
                {t('invoices.share')}
              </Button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {['sent', 'partial', 'overdue'].includes(invoice.status) && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleRecordPayment}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  {t('invoices.record_payment')}
                </Button>
              )}
              
              {/* Credit Note button - show for sent, paid, partial, or overdue invoices */}
              {['sent', 'paid', 'partial', 'overdue'].includes(invoice.status) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // In a real app, this would use a router or open a dialog
                    console.log('Create credit note for invoice', invoice.id);
                    window.location.href = `/credit-notes/create?invoiceId=${invoice.id}`;
                  }}
                >
                  <FileMinus className="h-4 w-4 mr-1" />
                  {t('credit_notes.create_from_invoice')}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Form Dialog */}
      {invoice && (
        <PaymentForm
          open={paymentFormOpen}
          onOpenChange={setPaymentFormOpen}
          onSubmit={handlePaymentSubmit}
          initialClientId={invoice.clientId}
          initialInvoiceId={invoice.id}
        />
      )}
    </>
  );
};

export default InvoiceDetailsDialog;
