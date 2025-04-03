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
  FormDescription,
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
import { Calendar as CalendarIcon, Trash, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { ProformaInvoice, mockClients, mockProducts, Client, Product } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import MoroccanInvoiceRequirements from '../products/MoroccanInvoiceRequirements';
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
  proformaNumber: z.string().optional(),
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

interface ProformaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  proforma?: ProformaInvoice;
  isEditing?: boolean;
  viewOnly?: boolean;
}

const ProformaFormDialog: React.FC<ProformaFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  proforma,
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
  const isDisabled = viewOnly || (isEditing && proforma?.status !== 'draft');
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: proforma?.clientId || "",
      date: proforma ? new Date(proforma.date) : new Date(),
      expiryDate: proforma ? new Date(proforma.expiryDate) : new Date(new Date().setDate(new Date().getDate() + 30)),
      proformaNumber: proforma?.proformaNumber || "",
      paymentTerms: proforma?.terms || "",
      notes: proforma?.notes || "",
      items: proforma?.items || [
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
    form.setValue("items", currentItems.filter((_, i) => i !== index));
  };
  
  // Handler for product selection
  const handleProductSelect = (value: string, index: number) => {
    const product = mockProducts.find(p => p.id === value);
    if (product) {
      const currentItems = form.getValues("items");
      const updatedItems = [...currentItems];
      updatedItems[index] = {
        ...updatedItems[index],
        productId: product.id,
        description: product.name,
        unitPrice: product.price,
        vatRate: product.vatRate,
      };
      form.setValue("items", updatedItems);
    }
  };
  
  // Handler for item updates
  const handleItemUpdate = (index: number) => {
    const currentItems = form.getValues("items");
    const item = currentItems[index];
    const total = (item.quantity * item.unitPrice) - item.discount;
    
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      total,
    };
    
    form.setValue("items", updatedItems);
  };
  
  // Handler for form submission
  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('invoices.edit_proforma') : t('invoices.create_proforma')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('invoices.edit_proforma_desc') : t('invoices.create_proforma_desc')}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('invoices.client')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isDisabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('invoices.select_client')} />
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
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('invoices.date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isDisabled}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t('invoices.pick_date')}</span>
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
                          disabled={isDisabled}
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
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('invoices.expiry_date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isDisabled}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t('invoices.pick_date')}</span>
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
                          disabled={isDisabled}
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
                name="proformaNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('invoices.proforma_number')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('invoices.items')}</Label>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">{t('invoices.description')}</TableHead>
                      <TableHead className="w-[100px]">{t('invoices.quantity')}</TableHead>
                      <TableHead className="w-[120px]">{t('invoices.unit_price')}</TableHead>
                      <TableHead className="w-[100px]">{t('invoices.vat')}</TableHead>
                      <TableHead className="w-[120px]">{t('invoices.discount')}</TableHead>
                      <TableHead className="w-[120px]">{t('invoices.total')}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch("items").map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => handleProductSelect(value, index)}
                            disabled={isDisabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('invoices.select_product')} />
                            </SelectTrigger>
                            <SelectContent>
                              {mockProducts.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              const currentItems = form.getValues("items");
                              const updatedItems = [...currentItems];
                              updatedItems[index] = {
                                ...updatedItems[index],
                                quantity: value,
                              };
                              form.setValue("items", updatedItems);
                              handleItemUpdate(index);
                            }}
                            disabled={isDisabled}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              const currentItems = form.getValues("items");
                              const updatedItems = [...currentItems];
                              updatedItems[index] = {
                                ...updatedItems[index],
                                unitPrice: value,
                              };
                              form.setValue("items", updatedItems);
                              handleItemUpdate(index);
                            }}
                            disabled={isDisabled}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.vatRate}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              const currentItems = form.getValues("items");
                              const updatedItems = [...currentItems];
                              updatedItems[index] = {
                                ...updatedItems[index],
                                vatRate: value,
                              };
                              form.setValue("items", updatedItems);
                              handleItemUpdate(index);
                            }}
                            disabled={isDisabled}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              const currentItems = form.getValues("items");
                              const updatedItems = [...currentItems];
                              updatedItems[index] = {
                                ...updatedItems[index],
                                discount: value,
                              };
                              form.setValue("items", updatedItems);
                              handleItemUpdate(index);
                            }}
                            disabled={isDisabled}
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            disabled={isDisabled}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="mt-2"
                disabled={isDisabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('invoices.add_item')}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>{t('invoices.subtotal')}</Label>
                <p>{formatCurrency(subtotal)}</p>
              </div>
              <div>
                <Label>{t('invoices.vat_amount')}</Label>
                <p>{formatCurrency(vatAmount)}</p>
              </div>
              <div>
                <Label>{t('invoices.discount')}</Label>
                <p>{formatCurrency(discountTotal)}</p>
              </div>
              <div>
                <Label>{t('invoices.total')}</Label>
                <p>{formatCurrency(total)}</p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('invoices.payment_terms')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('invoices.terms_placeholder')}
                      disabled={isDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('invoices.notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('invoices.notes_placeholder')}
                      disabled={isDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <MoroccanInvoiceRequirements type="proforma" />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              {!viewOnly && (
                <Button type="submit">
                  {isEditing ? t('invoices.save_changes') : t('invoices.create')}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProformaFormDialog; 