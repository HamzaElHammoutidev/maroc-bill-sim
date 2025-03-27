
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Quote } from '@/data/mockData';

interface DeleteQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  quote: Quote | null;
}

const DeleteQuoteDialog: React.FC<DeleteQuoteDialogProps> = ({
  open,
  onOpenChange,
  onDelete,
  quote,
}) => {
  const { t } = useLanguage();
  
  if (!quote) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('quotes.deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('quotes.deleteDescription')} <strong>{quote.quoteNumber}</strong>.
            <br />
            {t('quotes.deleteWarning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('form.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteQuoteDialog;
