import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, differenceInDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Client, 
  Invoice, 
  Payment, 
  mockClients, 
  mockInvoices 
} from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import AttachmentUploader from './AttachmentUploader';

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PaymentFormValues) => void;
  initialClientId?: string;
  initialInvoiceId?: string;
}

// Define form schema with Zod
const paymentFormSchema = z.object({
  clientId: z.string().min(1, { message: 'Client is required' }),
  invoiceId: z.string().min(1, { message: 'Invoice is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be greater than 0' }),
  date: z.date(),
  method: z.enum(['cash', 'bank', 'check', 'online', 'other']),
  reference: z.string().optional(),
  additionalFields: z.record(z.string()).optional(),
  notes: z.string().optional(),
  isPartialPayment: z.boolean().default(false),
  applyLateFee: z.boolean().default(false),
  lateFeeAmount: z.coerce.number().min(0).optional(),
  lateFeePercentage: z.coerce.number().min(0).max(100).optional(),
  lateFeeType: z.enum(['fixed', 'percentage']).default('percentage')
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const PaymentForm: React.FC<PaymentFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialClientId,
  initialInvoiceId
}) => {
  const { t } = useTranslation();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [daysOverdue, setDaysOverdue] = useState<number>(0);
  const [hasLateFee, setHasLateFee] = useState<boolean>(false);

  // Initialize form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      clientId: initialClientId || '',
      invoiceId: initialInvoiceId || '',
      amount: 0,
      date: new Date(),
      method: 'bank',
      reference: '',
      notes: '',
      isPartialPayment: false,
      applyLateFee: false,
      lateFeeAmount: 0,
      lateFeePercentage: 2, // Default 2%
      lateFeeType: 'percentage'
    }
  });

  // Load client details when client changes
  useEffect(() => {
    const clientId = form.watch('clientId');
    if (clientId) {
      const client = mockClients.find(c => c.id === clientId);
      setSelectedClient(client || null);

      // Get all unpaid/partially paid invoices for this client
      const invoices = mockInvoices.filter(
        inv => inv.clientId === clientId && 
        (inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'partial')
      );
      setClientInvoices(invoices);

      // If no invoice is selected yet and we have invoices, preselect first one
      const currentInvoiceId = form.watch('invoiceId');
      if (!currentInvoiceId && invoices.length > 0 && !initialInvoiceId) {
        form.setValue('invoiceId', invoices[0].id);
      }
    } else {
      setSelectedClient(null);
      setClientInvoices([]);
    }
  }, [form.watch('clientId')]);

  // Load invoice details when invoice changes
  useEffect(() => {
    const invoiceId = form.watch('invoiceId');
    if (invoiceId) {
      const invoice = mockInvoices.find(inv => inv.id === invoiceId);
      setSelectedInvoice(invoice || null);
      
      if (invoice) {
        // Calculate remaining amount (total minus already paid)
        const totalAmount = invoice.total;
        const paidAmount = invoice.paidAmount || 0;
        const remaining = totalAmount - paidAmount;
        setRemainingAmount(remaining);
        
        // Set default payment amount to the full remaining balance
        form.setValue('amount', remaining);
        
        // Check if invoice is overdue
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        if (isBefore(dueDate, today)) {
          const days = differenceInDays(today, dueDate);
          setDaysOverdue(days);
          setHasLateFee(days > 0);
          
          // Calculate default late fee (2% of remaining amount)
          const lateFeePercentage = form.watch('lateFeePercentage') || 2;
          const defaultLateFee = (remaining * lateFeePercentage) / 100;
          form.setValue('lateFeeAmount', parseFloat(defaultLateFee.toFixed(2)));
        } else {
          setDaysOverdue(0);
          setHasLateFee(false);
        }
      }
    } else {
      setSelectedInvoice(null);
      setRemainingAmount(0);
      setDaysOverdue(0);
      setHasLateFee(false);
    }
  }, [form.watch('invoiceId')]);

  // Watch for late fee changes
  useEffect(() => {
    if (form.watch('applyLateFee') && form.watch('lateFeeType') === 'percentage') {
      const percentage = form.watch('lateFeePercentage') || 0;
      const lateFeeAmount = (remainingAmount * percentage) / 100;
      form.setValue('lateFeeAmount', parseFloat(lateFeeAmount.toFixed(2)));
    }
  }, [form.watch('lateFeePercentage'), form.watch('lateFeeType'), form.watch('applyLateFee')]);

  // Handle form submission
  const handleSubmit = (values: PaymentFormValues) => {
    // Prepare the data with any attachments
    const formData = {
      ...values,
      attachments
    };
    
    onSubmit(formData);
    onOpenChange(false);
  };

  // Additional fields for specific payment methods
  const renderAdditionalFields = () => {
    const method = form.watch('method');
    
    switch (method) {
      case 'check':
        return (
          <>
            <FormField
              control={form.control}
              name="additionalFields.checkNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payments.check_number')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalFields.bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payments.bank_name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case 'bank':
        return (
          <FormField
            control={form.control}
            name="additionalFields.transferId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payments.transfer_id')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t('payments.register_payment')}</DialogTitle>
          <DialogDescription>
            {t('payments.register_payment_desc')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">{t('payments.details')}</TabsTrigger>
            <TabsTrigger value="late_fees" disabled={!hasLateFee}>{t('payments.late_fees')}</TabsTrigger>
            <TabsTrigger value="attachments">{t('payments.attachments')}</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <TabsContent value="details" className="space-y-4 mt-0">
                {/* Client Selection */}
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.client')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('payments.select_client')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockClients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Invoice Selection */}
                {selectedClient && (
                  <FormField
                    control={form.control}
                    name="invoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.invoice')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={clientInvoices.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                clientInvoices.length === 0 
                                  ? t('payments.no_unpaid_invoices') 
                                  : t('payments.select_invoice')
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientInvoices.map(invoice => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.invoiceNumber} - {formatCurrency(invoice.total - (invoice.paidAmount || 0))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {clientInvoices.length === 0 && (
                          <FormDescription>
                            {t('payments.client_has_no_unpaid_invoices')}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Invoice Details & Amount */}
                {selectedInvoice && (
                  <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('invoices.invoice_number')}</p>
                      <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('invoices.total_amount')}</p>
                      <p className="font-medium">{formatCurrency(selectedInvoice.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('invoices.already_paid')}</p>
                      <p className="font-medium">{formatCurrency(selectedInvoice.paidAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('invoices.remaining_amount')}</p>
                      <p className="font-medium text-primary">{formatCurrency(remainingAmount)}</p>
                    </div>
                    {daysOverdue > 0 && (
                      <div className="col-span-2">
                        <p className="text-sm text-red-500 font-medium">
                          {t('payments.overdue_notice', { days: daysOverdue })}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('payments.amount')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                            
                            // Check if partial payment
                            if (selectedInvoice && value < remainingAmount) {
                              form.setValue('isPartialPayment', true);
                            } else {
                              form.setValue('isPartialPayment', false);
                            }
                          }}
                        />
                      </FormControl>
                      {form.watch('isPartialPayment') && (
                        <FormDescription className="text-amber-500">
                          {t('payments.partial_payment_notice')}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('payments.date')}</FormLabel>
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
                                format(field.value, "PPP")
                              ) : (
                                <span>{t('common.pick_date')}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('payments.method')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('payments.select_method')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">{t('payments.methods.cash')}</SelectItem>
                          <SelectItem value="bank">{t('payments.methods.bank')}</SelectItem>
                          <SelectItem value="check">{t('payments.methods.check')}</SelectItem>
                          <SelectItem value="online">{t('payments.methods.online')}</SelectItem>
                          <SelectItem value="other">{t('payments.methods.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Method-specific fields */}
                {renderAdditionalFields()}

                {/* Reference */}
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('payments.reference')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('payments.reference_desc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('payments.notes')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('payments.notes_placeholder')}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="late_fees" className="space-y-4 mt-0">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <p className="text-amber-800 text-sm">
                    {t('payments.overdue_explanation', { days: daysOverdue })}
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="applyLateFee"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('payments.apply_late_fee')}
                        </FormLabel>
                        <FormDescription>
                          {t('payments.apply_late_fee_desc')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch('applyLateFee') && (
                  <>
                    <FormField
                      control={form.control}
                      name="lateFeeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('payments.late_fee_type')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('payments.select_fee_type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">{t('payments.percentage')}</SelectItem>
                              <SelectItem value="fixed">{t('payments.fixed_amount')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('lateFeeType') === 'percentage' ? (
                      <FormField
                        control={form.control}
                        name="lateFeePercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('payments.late_fee_percentage')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  field.onChange(isNaN(value) ? 0 : value);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('payments.percentage_of_remaining', {
                                amount: formatCurrency(
                                  (remainingAmount * (form.watch('lateFeePercentage') || 0)) / 100
                                )
                              })}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="lateFeeAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('payments.late_fee_amount')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  field.onChange(isNaN(value) ? 0 : value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="border p-3 rounded-md bg-muted/20">
                      <p className="text-sm font-medium mb-1">{t('payments.fee_summary')}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm text-muted-foreground">{t('invoices.remaining_amount')}:</p>
                        <p className="text-sm text-right">{formatCurrency(remainingAmount)}</p>
                        
                        <p className="text-sm text-muted-foreground">{t('payments.late_fee')}:</p>
                        <p className="text-sm text-right">{formatCurrency(form.watch('lateFeeAmount') || 0)}</p>
                        
                        <p className="text-sm font-medium">{t('payments.total_with_fee')}:</p>
                        <p className="text-sm font-medium text-right">
                          {formatCurrency(remainingAmount + (form.watch('lateFeeAmount') || 0))}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="attachments" className="space-y-4 mt-0">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">{t('payments.attachment_instructions')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('payments.attachment_description')}
                  </p>
                </div>
                
                <AttachmentUploader 
                  onAttachmentChange={setAttachments}
                  maxFiles={5}
                  maxFileSize={10}
                />
              </TabsContent>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">{t('payments.register')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm; 