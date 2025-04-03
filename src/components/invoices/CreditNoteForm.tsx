import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  CreditNote, 
  CreditNoteReason, 
  Invoice, 
  InvoiceItem,
  getClientById, 
  mockInvoices,
  mockProducts,
  createCreditNote,
  getProductById
} from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CalendarIcon, 
  Loader2, 
  RefreshCcw,
  CheckCircle,
  X, 
  Info
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  invoiceId: z.string(),
  creditNoteNumber: z.string().min(1, 'Credit note number is required'),
  date: z.string(),
  reason: z.enum(['defective', 'mistake', 'goodwill', 'return', 'other'] as const),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string(),
      description: z.string(),
      quantity: z.number().min(0.01),
      unitPrice: z.number().min(0),
      vatRate: z.number().min(0),
      discount: z.number().min(0),
      total: z.number().min(0),
      selected: z.boolean().optional(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface CreditNoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreditNote) => void;
  onCancel: () => void;
  creditNote?: CreditNote; // For editing mode
  invoiceId?: string; // For creation mode from a specific invoice
}

const CreditNoteForm: React.FC<CreditNoteFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  creditNote,
  invoiceId
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [isLoading, setIsLoading] = useState(true);
  const [sourceInvoice, setSourceInvoice] = useState<Invoice | null>(null);
  const [availableInvoices, setAvailableInvoices] = useState<Invoice[]>([]);
  const [itemSelection, setItemSelection] = useState<Record<string, boolean>>({});
  
  const isEditing = !!creditNote;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceId: creditNote?.invoiceId || invoiceId || '',
      creditNoteNumber: creditNote?.creditNoteNumber || generateCreditNoteNumber(),
      date: creditNote ? new Date(creditNote.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reason: (creditNote?.reason as CreditNoteReason) || 'return',
      notes: creditNote?.notes || '',
      items: [],
    }
  });
  
  function generateCreditNoteNumber() {
    const year = new Date().getFullYear();
    const nextNumber = 1; // In real app, would get the next available number
    return `AVO-${year}-${String(nextNumber).padStart(4, '0')}`;
  }
  
  useEffect(() => {
    const eligibleInvoices = mockInvoices.filter(
      inv => inv.status === 'sent' || inv.status === 'paid' || inv.status === 'partial'
    );
    setAvailableInvoices(eligibleInvoices);
    
    if (invoiceId || creditNote?.invoiceId) {
      const targetInvoiceId = invoiceId || creditNote?.invoiceId;
      const invoice = mockInvoices.find(inv => inv.id === targetInvoiceId);
      if (invoice) {
        setSourceInvoice(invoice);
        
        if (creditNote) {
          const selection: Record<string, boolean> = {};
          invoice.items.forEach(item => {
            const creditNoteItem = creditNote.items.find(cni => {
              return (cni.id === item.id) || 
                (cni.productId === item.productId && cni.unitPrice === item.unitPrice);
            });
            selection[item.id] = !!creditNoteItem;
          });
          setItemSelection(selection);
        }
      }
    }
    
    setIsLoading(false);
  }, [invoiceId, creditNote]);
  
  useEffect(() => {
    if (sourceInvoice) {
      const formItems = sourceInvoice.items.map(item => {
        let quantity = item.quantity;
        let selected = false;
        
        if (creditNote) {
          const creditNoteItem = creditNote.items.find(cni => {
            return (cni.id === item.id) || 
              (cni.productId === item.productId && cni.unitPrice === item.unitPrice);
          });
          
          if (creditNoteItem) {
            quantity = creditNoteItem.quantity;
            selected = true;
          }
        }
        
        return {
          ...item,
          quantity,
          selected
        };
      });
      
      form.setValue('items', formItems);
      form.setValue('invoiceId', sourceInvoice.id);
    }
  }, [sourceInvoice, form, creditNote]);
  
  const handleItemToggle = (itemId: string, checked: boolean) => {
    setItemSelection(prev => ({
      ...prev,
      [itemId]: checked
    }));
    
    const currentItems = form.getValues('items');
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId) {
        return { ...item, selected: checked };
      }
      return item;
    });
    
    form.setValue('items', updatedItems);
  };
  
  const handleQuantityChange = (itemId: string, quantity: number) => {
    const currentItems = form.getValues('items');
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId) {
        const total = (quantity * item.unitPrice) - item.discount;
        return { ...item, quantity, total };
      }
      return item;
    });
    
    form.setValue('items', updatedItems);
  };
  
  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSourceInvoice(invoice);
    }
  };
  
  const calculateTotals = () => {
    const items = form.getValues('items');
    const selectedItems = items.filter(item => item.selected);
    
    const subtotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = selectedItems.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * (item.vatRate / 100)), 0);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };
  
  const { subtotal, vatAmount, total } = calculateTotals();
  
  const onFormSubmit = (values: FormValues) => {
    setIsLoading(true);
    
    const selectedItems = values.items.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      setIsLoading(false);
      return;
    }
    
    const now = new Date().toISOString();
    const creditNoteData: Omit<CreditNote, 'id' | 'createdAt' | 'updatedAt'> = {
      companyId,
      clientId: sourceInvoice?.clientId || '',
      invoiceId: values.invoiceId,
      creditNoteNumber: values.creditNoteNumber,
      date: values.date,
      status: 'draft',
      reason: values.reason,
      reasonDescription: '',
      items: selectedItems.map(item => ({
        id: `cni-${Date.now()}-${item.id}`,
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        discount: item.discount,
        total: item.total
      })),
      subtotal,
      vatAmount,
      total,
      notes: values.notes,
      affectsStock: false,
      stockAdjusted: false,
      appliedAmount: 0,
      remainingAmount: total,
      isFullyApplied: false,
      applications: [],
      archiveVersion: 1,
      archivedAt: now,
    };
    
    const newCreditNote = createCreditNote(creditNoteData);
    
    if (sourceInvoice) {
      console.log(`Credit note ${newCreditNote.creditNoteNumber} created for invoice ${sourceInvoice.invoiceNumber}`);
    }
    
    onSubmit(newCreditNote);
    
    onOpenChange(false);
    setIsLoading(false);
  };
  
  const getReasonIcon = (reason: CreditNoteReason) => {
    switch (reason) {
      case 'return':
        return <RefreshCcw className="h-4 w-4 text-yellow-500" />;
      case 'defective':
        return <X className="h-4 w-4 text-red-500" />;
      case 'mistake':
        return <X className="h-4 w-4 text-red-500" />;
      case 'goodwill':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const reasonOptions = [
    { value: 'defective', label: t('credit_notes.reason_defective') },
    { value: 'mistake', label: t('credit_notes.reason_mistake') },
    { value: 'goodwill', label: t('credit_notes.reason_goodwill') },
    { value: 'return', label: t('credit_notes.reason_return') },
    { value: 'other', label: t('credit_notes.reason_other') },
  ];
  
  if (isLoading && !open) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing 
              ? t('credit_notes.edit_title') 
              : t('credit_notes.create_title')}
          </DialogTitle>
          <DialogDescription>
            {t('credit_notes.form_description')}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isEditing && !invoiceId && (
                <FormField
                  control={form.control}
                  name="invoiceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('credit_notes.original_invoice')}</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleInvoiceChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('credit_notes.select_invoice')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableInvoices.map((invoice) => (
                            <SelectItem key={invoice.id} value={invoice.id}>
                              {invoice.invoiceNumber} - {getClientById(invoice.clientId)?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {(sourceInvoice || isEditing) && (
                <div className="col-span-1 border rounded-md p-4 bg-muted/20">
                  <h3 className="font-medium mb-2">{t('credit_notes.invoice_details')}</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">{t('invoices.number')}:</span> {sourceInvoice?.invoiceNumber}</p>
                    <p>
                      <span className="font-medium">{t('invoices.client')}:</span> {
                        sourceInvoice ? getClientById(sourceInvoice.clientId)?.name : ''
                      }
                    </p>
                    <p><span className="font-medium">{t('invoices.date')}:</span> {sourceInvoice ? formatDate(sourceInvoice.date) : ''}</p>
                    <p><span className="font-medium">{t('invoices.amount')}:</span> {sourceInvoice ? formatCurrency(sourceInvoice.total) : ''}</p>
                  </div>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="creditNoteNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('credit_notes.number')}</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('credit_notes.date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>{t('form.select_date')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('credit_notes.reason')}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('credit_notes.select_reason')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reasonOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>{t('credit_notes.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('credit_notes.notes_placeholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">{t('credit_notes.select_items')}</h3>
              
              {sourceInvoice ? (
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">{t('credit_notes.include')}</TableHead>
                        <TableHead>{t('credit_notes.product')}</TableHead>
                        <TableHead>{t('credit_notes.description')}</TableHead>
                        <TableHead className="text-right">{t('credit_notes.unit_price')}</TableHead>
                        <TableHead className="text-right">{t('credit_notes.quantity')}</TableHead>
                        <TableHead className="text-right">{t('credit_notes.vat')}</TableHead>
                        <TableHead className="text-right">{t('credit_notes.total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.getValues('items').map((item, index) => {
                        const product = getProductById(item.productId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Checkbox
                                checked={itemSelection[item.id] || false}
                                onCheckedChange={(checked) => 
                                  handleItemToggle(item.id, checked === true)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {product?.name || item.productId}
                            </TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                className="w-20 text-right"
                                value={item.quantity}
                                onChange={(e) => 
                                  handleQuantityChange(item.id, parseFloat(e.target.value) || 0)
                                }
                                min={0}
                                max={item.quantity}
                                step={product?.isService ? 0.25 : 1}
                                disabled={!itemSelection[item.id]}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {item.vatRate}%
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.total)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="border rounded-md p-4 text-center">
                  <p className="text-muted-foreground">
                    {t('credit_notes.select_invoice_first')}
                  </p>
                </div>
              )}
              
              {sourceInvoice && (
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex justify-between w-64">
                    <span className="font-medium">{t('credit_notes.subtotal')}:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between w-64">
                    <span className="font-medium">{t('credit_notes.vat_amount')}:</span>
                    <span>{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between w-64 text-lg font-bold">
                    <span>{t('credit_notes.total')}:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !sourceInvoice || total === 0}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? t('common.save') : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreditNoteForm;
