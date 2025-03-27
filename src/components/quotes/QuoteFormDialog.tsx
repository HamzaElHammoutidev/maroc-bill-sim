
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Calendar as CalendarIcon, Trash, Plus, ReceiptText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { Quote, QuoteStatus, mockClients, mockProducts, Client, Product } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

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
});

type FormValues = z.infer<typeof formSchema>;

interface QuoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  quote?: Quote;
  isEditing?: boolean;
}

const QuoteFormDialog: React.FC<QuoteFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  quote,
  isEditing = false,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [subtotal, setSubtotal] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [total, setTotal] = useState(0);
  
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
    };
    
    onSubmit(submitData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('quotes.editTitle') : t('quotes.createTitle')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('quotes.editDescription') : t('quotes.createDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={isEditing && quote?.status !== 'draft'}
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
                            disabled={isEditing && quote?.status !== 'draft'}
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
                            disabled={isEditing && quote?.status !== 'draft'}
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
                        disabled={isEditing && quote?.status !== 'draft'}
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
              
              {/* Items List */}
              <div className="space-y-4">
                {form.watch("items").map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    {/* Product Selection */}
                    <div className="col-span-12 md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('quotes.product')}</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProductSelect(value, index);
                              }}
                              disabled={isEditing && quote?.status !== 'draft'}
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
                    <div className="col-span-12 md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('quotes.description')}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={isEditing && quote?.status !== 'draft'}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-span-3 md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('quotes.quantity')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  handleItemUpdate(index);
                                }}
                                disabled={isEditing && quote?.status !== 'draft'}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Unit Price */}
                    <div className="col-span-3 md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('quotes.unitPrice')}</FormLabel>
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
                                disabled={isEditing && quote?.status !== 'draft'}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* VAT Rate */}
                    <div className="col-span-3 md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.vatRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('quotes.vatRate')}</FormLabel>
                            <Select
                              value={String(field.value)}
                              onValueChange={(value) => {
                                field.onChange(Number(value));
                                handleItemUpdate(index);
                              }}
                              disabled={isEditing && quote?.status !== 'draft'}
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
                    <div className="col-span-3 md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('quotes.discount')}</FormLabel>
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
                                disabled={isEditing && quote?.status !== 'draft'}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Total */}
                    <div className="col-span-3 md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.total`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('quotes.lineTotal')}</FormLabel>
                            <FormControl>
                              <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                                {formatCurrency(field.value)}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Remove Item */}
                    <div className="col-span-3 md:col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={(isEditing && quote?.status !== 'draft') || form.watch("items").length <= 1}
                        className="w-full"
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
                  disabled={isEditing && quote?.status !== 'draft'}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('quotes.addItem')}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('quotes.subtotal')}</span>
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
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t('quotes.total')}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            
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
                      disabled={isEditing && quote?.status !== 'draft'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('form.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isEditing && quote?.status !== 'draft'}
              >
                <ReceiptText className="h-4 w-4 mr-2" />
                {isEditing ? t('form.update') : t('form.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteFormDialog;
