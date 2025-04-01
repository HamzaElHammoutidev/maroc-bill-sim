
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Payment } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentDetailsDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentDetailsDialog: React.FC<PaymentDetailsDialogProps> = ({
  payment,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('payments.payment_details')}</DialogTitle>
          <DialogDescription>
            {t('payments.transaction')}: {payment.transactionId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t('payments.date')}</span>
              <span className="font-medium">{new Date(payment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t('payments.amount')}</span>
              <span className="font-medium">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t('payments.method')}</span>
              <span className="font-medium">{payment.method}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t('payments.status')}</span>
              <StatusBadge status={payment.status} type="payment" />
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-sm text-muted-foreground">{t('payments.invoice')}</span>
              <span className="font-medium">{payment.invoiceId}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-sm text-muted-foreground">{t('payments.payment_note')}</span>
              <span className="font-medium">{payment.notes || t('payments.no_note')}</span>
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

export default PaymentDetailsDialog;
