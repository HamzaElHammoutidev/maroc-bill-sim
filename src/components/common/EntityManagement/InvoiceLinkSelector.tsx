
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Invoice } from '@/data/mockData';

export interface InvoiceLinkSelectorProps {
  invoices: Invoice[];
  selectedInvoiceId: string | null;
  onChange: (invoiceId: string | null) => void;
  getClientName: (clientId: string) => string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const InvoiceLinkSelector: React.FC<InvoiceLinkSelectorProps> = ({
  invoices,
  selectedInvoiceId,
  onChange,
  getClientName,
  label = 'Link Invoice',
  placeholder = 'Select an invoice',
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedInvoiceId || '');
  const [searchTerm, setSearchTerm] = useState('');

  // When selectedInvoiceId changes from parent
  useEffect(() => {
    setValue(selectedInvoiceId || '');
  }, [selectedInvoiceId]);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter((invoice) => {
    const searchString = searchTerm.toLowerCase();
    const clientName = getClientName(invoice.clientId).toLowerCase();
    
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchString) ||
      clientName.includes(searchString) ||
      formatDate(invoice.date).toLowerCase().includes(searchString)
    );
  });

  // Find the currently selected invoice
  const selectedInvoice = value
    ? invoices.find((invoice) => invoice.id === value)
    : null;

  // Handle selection change
  const handleSelectInvoice = (invoiceId: string) => {
    setValue(invoiceId);
    onChange(invoiceId);
    setOpen(false);
  };

  // Handle clearing the selection
  const handleClearInvoice = () => {
    setValue('');
    onChange(null);
  };

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled}
            >
              {selectedInvoice ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                  <span className="text-muted-foreground">
                    ({getClientName(selectedInvoice.clientId)})
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[300px]" align="start">
            <Command>
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder={t('common.search_invoices')}
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  className="flex-1 border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <CommandList>
                <CommandEmpty>{t('common.no_invoices_found')}</CommandEmpty>
                <CommandGroup>
                  {filteredInvoices.map((invoice) => (
                    <CommandItem
                      key={invoice.id}
                      value={invoice.id}
                      onSelect={() => handleSelectInvoice(invoice.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === invoice.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {getClientName(invoice.clientId)} - {formatDate(invoice.date)} - {formatCurrency(invoice.total)}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedInvoice && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={handleClearInvoice}
            disabled={disabled}
          >
            <X className="h-4 w-4 opacity-50" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvoiceLinkSelector;
