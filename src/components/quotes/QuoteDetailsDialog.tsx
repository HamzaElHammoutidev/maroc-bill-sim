
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Quote, getClientById, getProductById } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { Edit, Trash, Copy, FilePieChart } from 'lucide-react';

interface QuoteDetailsDialogProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onConvert?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const QuoteDetailsDialog: React.FC<QuoteDetailsDialogProps> = ({
  quote,
  open,
  onOpenChange,
  onEdit,
  onConvert,
  onDuplicate,
  onDelete,
}) => {
  const { t } = useLanguage();

  if (!quote) return null;

  const client = getClientById(quote.clientId);
  
  // Only allow editing of draft or sent quotes
  const canEdit = ['draft', 'sent'].includes(quote.status);
  // Only allow conversion of accepted quotes
  const canConvert = quote.status === 'accepted';
  // Only allow deletion of non-converted quotes
  const canDelete = quote.status !== 'converted';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{quote.quoteNumber}</span>
            <StatusBadge status={quote.status} type="quote" />
          </DialogTitle>
          <DialogDescription>
            {t('quotes.detailsDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <h3 className="text-sm font-medium mb-1">{t('quotes.client')}</h3>
            <p className="text-base">{client?.name || t('quotes.unknownClient')}</p>
            {client?.address && (
              <p className="text-sm text-muted-foreground">{client.address}</p>
            )}
            {client?.city && (
              <p className="text-sm text-muted-foreground">{client.city}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">{t('quotes.dateLabel')}:</span>
              <span>{formatDate(quote.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">{t('quotes.expiryLabel')}:</span>
              <span>{formatDate(quote.expiryDate)}</span>
            </div>
            {quote.convertedInvoiceId && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">{t('quotes.invoiceLabel')}:</span>
                <span>{quote.convertedInvoiceId}</span>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="py-4">
          <h3 className="font-medium mb-2">{t('quotes.items')}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('quotes.itemDescription')}</TableHead>
                <TableHead className="text-right">{t('quotes.quantity')}</TableHead>
                <TableHead className="text-right">{t('quotes.unitPrice')}</TableHead>
                <TableHead className="text-right">{t('quotes.discount')}</TableHead>
                <TableHead className="text-right">{t('quotes.total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="space-y-2 py-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">{t('quotes.subtotal')}:</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          {quote.discount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span className="text-sm">{t('quotes.discount')}:</span>
              <span>-{formatCurrency(quote.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span className="text-sm">{t('quotes.vat')}:</span>
            <span>{formatCurrency(quote.vatAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>{t('quotes.total')}:</span>
            <span>{formatCurrency(quote.total)}</span>
          </div>
        </div>
        
        {quote.notes && (
          <div className="py-2">
            <h3 className="text-sm font-medium mb-1">{t('quotes.notes')}</h3>
            <p className="text-sm text-muted-foreground">{quote.notes}</p>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          <div className="flex space-x-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={!canEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              {t('form.edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onConvert}
              disabled={!canConvert}
            >
              <FilePieChart className="h-4 w-4 mr-1" />
              {t('quotes.convert')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
            >
              <Copy className="h-4 w-4 mr-1" />
              {t('quotes.duplicate')}
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={!canDelete}
          >
            <Trash className="h-4 w-4 mr-1" />
            {t('form.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDetailsDialog;
