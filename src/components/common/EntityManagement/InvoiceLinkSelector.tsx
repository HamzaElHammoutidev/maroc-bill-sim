
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, FileCheck, FileX, FilePlus } from 'lucide-react';
import { mockInvoices } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface InvoiceLinkSelectorProps {
  onInvoiceSelect: (invoiceId: string) => void;
  selectedInvoiceId?: string;
  clientId?: string;
  disabled?: boolean;
  type?: 'credit-note' | 'deposit' | 'proforma';
}

const InvoiceLinkSelector: React.FC<InvoiceLinkSelectorProps> = ({
  onInvoiceSelect,
  selectedInvoiceId,
  clientId,
  disabled = false,
  type = 'credit-note'
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState(mockInvoices);
  const [open, setOpen] = useState(false);

  // Get the currently selected invoice
  const selectedInvoice = mockInvoices.find(inv => inv.id === selectedInvoiceId);

  // Filter invoices based on client and search query
  useEffect(() => {
    let filtered = mockInvoices;
    
    // Filter by client if specified
    if (clientId) {
      filtered = filtered.filter(inv => inv.clientId === clientId);
    }
    
    // Additional filters based on type
    if (type === 'credit-note') {
      // For credit notes, only show issued/paid invoices
      filtered = filtered.filter(inv => 
        ['issued', 'sent', 'paid', 'partial', 'overdue'].includes(inv.status)
      );
    } else if (type === 'deposit') {
      // For deposit invoices, show only non-paid invoices
      filtered = filtered.filter(inv => 
        ['draft', 'issued', 'sent', 'partial', 'overdue'].includes(inv.status)
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(query) || 
        inv.clientName?.toLowerCase().includes(query)
      );
    }
    
    setFilteredInvoices(filtered);
  }, [clientId, searchQuery, type]);

  return (
    <div className="space-y-2">
      <Label>{t(type === 'credit-note' ? 'credit_notes.related_invoice' : 'invoices.related_invoice')}</Label>
      
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left font-normal"
              disabled={disabled}
            >
              {selectedInvoice ? (
                <div className="flex flex-col">
                  <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(selectedInvoice.date)} - {formatCurrency(selectedInvoice.total)}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">{t('invoices.select_invoice')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="start">
            <div className="p-3 border-b">
              <Input
                placeholder={t('invoices.search_invoices')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-dashed"
                icon={<Search className="w-4 h-4 mr-2 opacity-50" />}
              />
            </div>
            <div className="max-h-[300px] overflow-auto p-0">
              {filteredInvoices.length > 0 ? (
                <div className="grid gap-1 p-2">
                  {filteredInvoices.map((invoice) => (
                    <Button
                      key={invoice.id}
                      variant="ghost"
                      className="justify-start w-full px-2 py-1 h-auto grid grid-cols-[auto_1fr] gap-2"
                      onClick={() => {
                        onInvoiceSelect(invoice.id);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        {invoice.status === 'paid' ? (
                          <FileCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <FilePlus className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                        <div className="flex justify-between w-full text-xs text-muted-foreground">
                          <span>{formatDate(invoice.date)}</span>
                          <span>{formatCurrency(invoice.total)}</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <FileX className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('invoices.no_invoices_found')}
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default InvoiceLinkSelector;
