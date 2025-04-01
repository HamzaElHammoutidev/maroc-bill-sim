import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, FilePieChart, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn, formatCurrency } from '@/lib/utils';
import { Quote } from '@/data/mockData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Define form validation schema
const formSchema = z.object({
  invoiceDate: z.date({
    required_error: "La date de facturation est requise",
  }),
  dueDate: z.date({
    required_error: "La date d'échéance est requise",
  }),
  conversionType: z.enum(['full', 'partial']),
  generateDeposit: z.boolean().default(false),
  depositAmount: z.number().optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
  depositNote: z.string().optional(),
  includeOriginalQuote: z.boolean().default(true),
  sendInvoiceEmail: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface ConvertQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvert: (data: FormValues) => void;
  quote: Quote | null;
}

const ConvertQuoteDialog: React.FC<ConvertQuoteDialogProps> = ({
  open,
  onOpenChange,
  onConvert,
  quote,
}) => {
  const { t } = useTranslation();
  
  // Calculate default deposit amount (30% of total)
  const defaultDepositAmount = quote ? quote.total * 0.3 : 0;
  const defaultDepositPercentage = 30;
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      conversionType: 'full',
      generateDeposit: false,
      depositAmount: Math.round(defaultDepositAmount * 100) / 100,
      depositPercentage: defaultDepositPercentage,
      depositNote: t('quotes.defaultDepositNote'),
      includeOriginalQuote: true,
      sendInvoiceEmail: false,
    },
  });
  
  // Update deposit amount when percentage changes
  const handleDepositPercentageChange = (value: number) => {
    if (!quote) return;
    const amount = (value / 100) * quote.total;
    form.setValue('depositPercentage', value);
    form.setValue('depositAmount', Math.round(amount * 100) / 100);
  };
  
  // Update deposit percentage when amount changes
  const handleDepositAmountChange = (value: number) => {
    if (!quote) return;
    const percentage = (value / quote.total) * 100;
    form.setValue('depositAmount', value);
    form.setValue('depositPercentage', Math.round(percentage * 100) / 100);
  };
  
  // Handle conversion type change
  const handleConversionTypeChange = (value: string) => {
    if (value === 'partial') {
      form.setValue('generateDeposit', true);
    }
    form.setValue('conversionType', value as 'full' | 'partial');
  };
  
  // Submit handler
  const handleFormSubmit = (data: FormValues) => {
    onConvert(data);
  };
  
  // Calculate remaining amount after deposit
  const remainingAmount = quote 
    ? quote.total - (form.watch('generateDeposit') ? (form.watch('depositAmount') || 0) : 0) 
    : 0;
  
  if (!quote) return null;
  
  // Check if quote is not the latest version
  const showVersionWarning = quote.isLatestVersion === false;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('quotes.convertTitle')}</DialogTitle>
          <DialogDescription>
            {t('quotes.convertDescription')} {quote.quoteNumber}
          </DialogDescription>
        </DialogHeader>
        
        {showVersionWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('quotes.versionWarningTitle')}</AlertTitle>
            <AlertDescription>
              {t('quotes.versionWarningDesc')}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Invoice Date */}
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('quotes.invoiceDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>{t('quotes.selectDate')}</span>
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
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('quotes.dueDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>{t('quotes.selectDate')}</span>
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
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Conversion Type */}
              <div className="space-y-2">
                <FormLabel>{t('quotes.conversionType')}</FormLabel>
                <ToggleGroup 
                  type="single" 
                  value={form.watch('conversionType')}
                  onValueChange={handleConversionTypeChange}
                  className="justify-start"
                >
                  <ToggleGroupItem value="full">{t('quotes.fullConversion')}</ToggleGroupItem>
                  <ToggleGroupItem value="partial">{t('quotes.partialConversion')}</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {/* Generate Deposit Invoice */}
              {form.watch('conversionType') === 'full' && (
                <FormField
                  control={form.control}
                  name="generateDeposit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {t('quotes.generateDeposit')}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              
              {/* Deposit Amount and Percentage */}
              {(form.watch('generateDeposit') || form.watch('conversionType') === 'partial') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="depositAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quotes.depositAmount')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              step="0.01"
                              {...field} 
                              value={field.value || ''}
                              onChange={(e) => handleDepositAmountChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="depositPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quotes.depositPercentage')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => handleDepositPercentageChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">%</div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Deposit Note */}
                  <FormField
                    control={form.control}
                    name="depositNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('quotes.depositNote')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Summary */}
                  <div className="rounded-md border p-4 space-y-2">
                    <h4 className="text-sm font-medium">{t('quotes.summary')}</h4>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span>{t('quotes.totalAmount')}:</span>
                      <span className="font-medium text-right">
                        {formatCurrency(quote.total)}
                      </span>
                      
                      <span>{t('quotes.depositAmount')}:</span>
                      <span className="font-medium text-right">
                        {formatCurrency(form.watch('depositAmount') || 0)}
                      </span>
                      
                      <span>{t('quotes.remainingAmount')}:</span>
                      <span className="font-medium text-right">
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              {/* Additional Options */}
              <FormField
                control={form.control}
                name="includeOriginalQuote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('quotes.includeOriginalQuote')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sendInvoiceEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('quotes.sendInvoiceEmail')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('form.cancel')}
              </Button>
              <Button type="submit" className="gap-2">
                <FilePieChart className="h-4 w-4" />
                {t('quotes.convert')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertQuoteDialog;
