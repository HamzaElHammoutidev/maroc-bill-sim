import React, { useState, useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Trash, Plus, ReceiptText, Edit, Printer, FileDown, FilePieChart, Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { Quote, QuoteStatus, mockClients, mockProducts, Client, Product } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import QuoteLegalNotices from './QuoteLegalNotices';
import QuoteVATDetails from './QuoteVATDetails';
import QuoteVATSelector from './QuoteVATSelector';
import { CurrencySelector } from '@/components/CurrencySelector';
import { defaultCurrency } from '@/config/moroccoConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';

// Define form validation schema
const formSchema = z.object({
  clientId: z.string({
    required_error: "Vous devez sélectionner un client",
  }),
  date: z.date({
    required_error: "La date est requise",
  }),
  expiryDate: z.date({
    required_error: "La date d'expiration est requise",
  }),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    vatRate: z.number().min(0),
    discount: z.number().min(0),
    total: z.number(),
  })).min(1, "Au moins un produit est requis"),
  currency: z.string().default(defaultCurrency),
  customLegalNotices: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  quote?: Quote;
  isEditing?: boolean;
  viewOnly?: boolean;
}

const QuoteFormDialog: React.FC<QuoteFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  quote,
  isEditing = false,
  viewOnly = false,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [subtotal, setSubtotal] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Determine if fields should be disabled
  const isDisabled = viewOnly || (isEditing && quote?.status !== 'draft');
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: quote?.clientId || "",
      date: quote ? new Date(quote.date) : new Date(),
      expiryDate: quote ? new Date(quote.expiryDate) : new Date(new Date().setDate(new Date().getDate() + 30)),
      paymentTerms: quote?.terms || "",
      notes: quote?.notes || "",
      items: quote?.items || [
        {
          productId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          vatRate: 20,
          discount: 0,
          total: 0,
        },
      ],
    },
  });
  
  // Update calculations when form values change
  useEffect(() => {
    const items = form.watch("items");
    
    let newSubtotal = 0;
    let newVatAmount = 0;
    let newDiscountTotal = 0;
    
    items.forEach(item => {
      const itemTotal = (item.quantity * item.unitPrice) - item.discount;
      newSubtotal += itemTotal;
      newVatAmount += itemTotal * (item.vatRate / 100);
      newDiscountTotal += item.discount;
    });
    
    const newTotal = newSubtotal + newVatAmount;
    
    setSubtotal(newSubtotal);
    setVatAmount(newVatAmount);
    setDiscountTotal(newDiscountTotal);
    setTotal(newTotal);
  }, [form.watch("items")]);
  
  // Handler for adding a new item
  const handleAddItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      {
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        discount: 0,
        total: 0,
      },
    ]);
  };
  
  // Handler for removing an item
  const handleRemoveItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    } else {
      toast({
        title: t('quotes.minimumItemError'),
        description: t('quotes.minimumItemErrorDesc'),
        variant: 'destructive',
      });
    }
  };
  
  // Handler for selecting a product
  const handleProductSelect = (value: string, index: number) => {
    const product = mockProducts.find(p => p.id === value);
    if (product) {
      const currentItems = form.getValues("items");
      const updatedItems = [...currentItems];
      updatedItems[index] = {
        ...updatedItems[index],
        productId: value,
        description: product.description,
        unitPrice: product.price,
        vatRate: product.vatRate,
        total: product.price * updatedItems[index].quantity - updatedItems[index].discount,
      };
      form.setValue("items", updatedItems);
    }
  };
  
  // Handler for updating item total when quantity, price, or discount changes
  const handleItemUpdate = (index: number) => {
    const currentItems = form.getValues("items");
    const item = currentItems[index];
    const itemTotal = (item.quantity * item.unitPrice) - item.discount;
    
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...item,
      total: itemTotal,
    };
    
    form.setValue("items", updatedItems);
  };
  
  // Submit handler
  const handleFormSubmit = (data: FormValues) => {
    // Add calculated totals
    const submitData = {
      ...data,
      subtotal,
      vatAmount,
      discountTotal,
      total,
      // Ensure company information is included
      companyId: '101', // Default to the first company in mock data (should be replaced with actual logged-in company ID in real app)
    };
    
    onSubmit(submitData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {viewOnly 
              ? t('quotes.viewQuote') 
              : isEditing 
                ? t('quotes.editTitle') 
                : t('quotes.createTitle')
            }
          </DialogTitle>
          <DialogDescription>
            {viewOnly
              ? t('quotes.quoteDetails') + (quote?.quoteNumber ? ` - ${quote.quoteNumber}` : '')
              : isEditing 
                ? t('quotes.editDescription') 
                : t('quotes.createDescription')
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* View-only indicator and Status Badge combined */}
            {viewOnly && quote?.status && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  <span>{t('quotes.viewMode')}</span>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  quote.status === 'draft' ? "bg-gray-100 text-gray-800" :
                  quote.status === 'pending_validation' ? "bg-yellow-100 text-yellow-800" :
                  quote.status === 'awaiting_acceptance' ? "bg-blue-100 text-blue-800" :
                  quote.status === 'accepted' ? "bg-green-100 text-green-800" :
                  quote.status === 'rejected' ? "bg-red-100 text-red-800" :
                  quote.status === 'expired' ? "bg-orange-100 text-orange-800" :
                  quote.status === 'converted' ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                )}>
                  {t(`quotes.status.${quote.status}`)}
                </div>
              </div>
            )}
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Selection */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quotes.client')}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('quotes.selectClient')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockClients.map((client) => (
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
              
              {/* Quote Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('quotes.date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isDisabled}
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
              
              {/* Quote Expiry Date */}
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('quotes.expiryDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isDisabled}
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
              
              {/* Payment Terms */}
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quotes.paymentTerms')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('quotes.paymentTermsPlaceholder')} 
                        {...field} 
                        disabled={isDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Items */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t('quotes.items')}</h3>
              
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                <div className="col-span-3 text-sm font-medium text-muted-foreground">{t('quotes.product')}</div>
                <div className="col-span-3 text-sm font-medium text-muted-foreground">{t('quotes.description')}</div>
                <div className="col-span-1 text-sm font-medium text-muted-foreground text-center">{t('quotes.quantity')}</div>
                <div className="col-span-1 text-sm font-medium text-muted-foreground text-right">{t('quotes.unitPrice')}</div>
                <div className="col-span-1 text-sm font-medium text-muted-foreground text-center">{t('quotes.vatRate')}</div>
                <div className="col-span-1 text-sm font-medium text-muted-foreground text-right">{t('quotes.discount')}</div>
                <div className="col-span-1 text-sm font-medium text-muted-foreground text-right">{t('quotes.lineTotal')}</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Items List */}
              <div className="space-y-4">
                {form.watch("items").map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    {/* Product Selection */}
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProductSelect(value, index);
                              }}
                              disabled={isDisabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('quotes.selectProduct')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Description */}
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={isDisabled}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                step="1"
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  handleItemUpdate(index);
                                }}
                                disabled={isDisabled}
                                className="text-center"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Unit Price */}
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                step="0.01"
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  handleItemUpdate(index);
                                }}
                                disabled={isDisabled}
                                className="text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* VAT Rate */}
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.vatRate`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              value={String(field.value)}
                              onValueChange={(value) => {
                                field.onChange(Number(value));
                                handleItemUpdate(index);
                              }}
                              disabled={isDisabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">0%</SelectItem>
                                <SelectItem value="7">7%</SelectItem>
                                <SelectItem value="10">10%</SelectItem>
                                <SelectItem value="14">14%</SelectItem>
                                <SelectItem value="20">20%</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Discount */}
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                step="0.01"
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  handleItemUpdate(index);
                                }}
                                disabled={isDisabled}
                                className="text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Total */}
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.total`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm text-right">
                                {formatCurrency(field.value)}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Remove Item */}
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={isDisabled || form.watch("items").length <= 1}
                        className="h-10 w-full"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Add Item Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  disabled={isDisabled}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('quotes.addItem')}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Two-column layout for notes and totals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Notes and additional settings */}
              <div className="space-y-6">
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quotes.notes')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('quotes.notesPlaceholder')} 
                      className="min-h-[100px]" 
                      {...field} 
                          disabled={isDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
                {/* Language and Currency Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>{t('common.i18n.language')}</FormLabel>
                    <div className="mt-2">
                      <LanguageSwitcher />
                    </div>
                  </div>
                  <div>
                    <FormLabel>{t('common.currency')}</FormLabel>
                    <div className="mt-2">
                      <CurrencySelector value="MAD" onChange={() => {}} />
                    </div>
                  </div>
                </div>
                
                {/* Legal Notices */}
                <FormItem>
                  <FormLabel>{t('quotes.legal_notices')}</FormLabel>
                  <div className="border rounded-md p-3 bg-muted/50">
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">{t('quotes.legal_validity')}</p>
                      <p className="mb-2">{t('quotes.acceptance_terms')}</p>
                      <p>{t('quotes.payment_terms')}</p>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="mt-2 h-auto p-0"
                      disabled={isDisabled}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {t('quotes.edit_legal_notices')}
                    </Button>
                  </div>
                </FormItem>
              </div>
              
              {/* Right Column - Totals and VAT */}
              <div className="space-y-6">
                {/* VAT Selector */}
                <FormItem>
                  <FormLabel>{t('quotes.vat_rate')}</FormLabel>
                  <div className="border rounded-md p-3">
                    <div className="space-y-2">
                      <RadioGroup defaultValue="20" className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id="vat-0" />
                          <Label htmlFor="vat-0">0%</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="7" id="vat-7" />
                          <Label htmlFor="vat-7">7%</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="10" id="vat-10" />
                          <Label htmlFor="vat-10">10%</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="14" id="vat-14" />
                          <Label htmlFor="vat-14">14%</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="20" id="vat-20" />
                          <Label htmlFor="vat-20">20%</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </FormItem>
                
                {/* Totals */}
                <div>
                  <FormLabel>{t('quotes.total')}</FormLabel>
                  <div className="border rounded-md p-4 mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('quotes.subtotal')}</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountTotal > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t('quotes.discountTotal')}</span>
                        <span>-{formatCurrency(discountTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t('quotes.vat')}</span>
                      <span>{formatCurrency(vatAmount)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>{t('quotes.total')}</span>
                      <span className="text-xl">{formatCurrency(total)}</span>
                    </div>
                    <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex justify-between mb-1">
                        <span>{t('quotes.total_excl_tax')}</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('quotes.total_vat')}</span>
                        <span>{formatCurrency(vatAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              {viewOnly ? (
                <>
                  <div className="w-full flex flex-col sm:flex-row gap-2 justify-end">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                        {t('form.close')}
                      </Button>
                      
                      <Button type="button" variant="outline" className="w-full sm:w-auto">
                        <Printer className="h-4 w-4 mr-2" />
                        {t('quotes.print')}
                      </Button>
                      
                      <Button type="button" variant="outline" className="w-full sm:w-auto">
                        <FileDown className="h-4 w-4 mr-2" />
                        {t('quotes.export_pdf')}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      {quote?.status === 'accepted' && (
                        <Button type="button" className="w-full sm:w-auto">
                          <FilePieChart className="h-4 w-4 mr-2" />
                          {t('quotes.convert')}
                        </Button>
                      )}
                      
                      <Button type="button" className="w-full sm:w-auto">
                        <Copy className="h-4 w-4 mr-2" />
                        {t('quotes.duplicate')}
                      </Button>
                      
                      {quote?.status === 'draft' && (
                        <Button type="button" className="w-full sm:w-auto">
                          <Edit className="h-4 w-4 mr-2" />
                          {t('form.edit')}
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    {t('form.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isDisabled}
                  >
                    <ReceiptText className="h-4 w-4 mr-2" />
                    {isEditing ? t('quotes.update') : t('form.save')}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteFormDialog;
