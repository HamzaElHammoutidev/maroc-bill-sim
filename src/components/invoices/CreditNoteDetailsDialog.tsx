import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { CreditNote, getClientById } from '@/data/mockData';

interface CreditNoteDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creditNote: CreditNote | null;
}

export default function CreditNoteDetailsDialog({ isOpen, onClose, creditNote }: CreditNoteDetailsDialogProps) {
  const { t } = useTranslation();

  if (!creditNote) return null;

  const client = creditNote.clientId ? getClientById(creditNote.clientId) : null;
  
  const statusColorMap = {
    draft: 'bg-gray-100 text-gray-800',
    issued: 'bg-blue-100 text-blue-800',
    applied: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('credit_notes.view_details')}</DialogTitle>
          <DialogDescription>
            {t('credit_notes.credit_note_number', { number: creditNote.creditNoteNumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <h3 className="font-medium text-sm">{t('credit_notes.customer')}</h3>
            <p>{client?.name || '-'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">{t('credit_notes.invoice_reference')}</h3>
            <p>{creditNote.invoiceId || '—'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">{t('credit_notes.issue_date')}</h3>
            <p>{creditNote.date}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">{t('credit_notes.status')}</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${statusColorMap[creditNote.status as keyof typeof statusColorMap]}`}>
              {t(`credit_notes.status.${creditNote.status}`)}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-sm">{t('credit_notes.reason')}</h3>
            <p>{t(`credit_notes.reason.${creditNote.reason}`)}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">{t('credit_notes.amount')}</h3>
            <p className="font-bold">{formatCurrency(creditNote.total)}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">{t('credit_notes.line_items')}</h3>
          <div className="space-y-2">
            {creditNote.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-4 font-medium">
          <span>{t('credit_notes.total')}</span>
          <span>{formatCurrency(creditNote.total)}</span>
        </div>

        {creditNote.remainingAmount !== undefined && (
          <div className="flex justify-between mt-2 font-medium">
            <span>{t('credit_notes.remaining_amount')}</span>
            <span>{formatCurrency(creditNote.remainingAmount)}</span>
          </div>
        )}

        {creditNote.reasonDescription && (
          <div className="mt-4">
            <h3 className="font-medium">{t('credit_notes.reason_description')}</h3>
            <p className="text-gray-700">{creditNote.reasonDescription}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 