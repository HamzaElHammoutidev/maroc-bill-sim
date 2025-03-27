
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const { t } = useLanguage();

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!invoiceId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('invoices.invoice_details')}</DialogTitle>
          <DialogDescription>
            {t('invoices.invoice_number')}: {invoiceId}
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
          <Button onClick={handleClose}>{t('common.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;
