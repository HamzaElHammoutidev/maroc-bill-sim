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
import { Calendar as CalendarIcon, Trash, Plus, ReceiptText, File, FileCheck, FileDown, FilePieChart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { Invoice, InvoiceStatus, mockClients, mockProducts, Client, Product } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import InvoiceLegalNotices from './InvoiceLegalNotices';
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
import { FileUploader } from '@/components/FileUploader';
import { Switch } from '@/components/ui/switch';

// Define form validation schema
const formSchema = z.object({
  clientId: z.string({
    required_error: "Vous devez sélectionner un client",
  }),
  date: z.date({
    required_error: "La date est requise",
  }),
  dueDate: z.date({
    required_error: "La date d'échéance est requise",
  }),
  invoiceNumber: z.string().optional(),
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
  attachments: z.array(z.any()).optional(),
  isDeposit: z.boolean().default(false),
  depositPercentage: z.number().optional(),
  depositAmount: z.number().optional(),
  hasFiscalStamp: z.boolean().default(false),
  fiscalStampAmount: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  invoice?: Invoice;
  isEditing?: boolean;
  viewOnly?: boolean;
}

const InvoiceFormDialog: React.FC<InvoiceFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  invoice,
  isEditing = false,
  viewOnly = false,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [subtotal, setSubtotal] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [showDepositOptions, setShowDepositOptions] = useState(invoice?.isDeposit || false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Determine if fields should be disabled
  const isDisabled = viewOnly || (isEditing && invoice?.status !== 'draft');
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: invoice?.clientId || "",
      date: invoice ? new Date(invoice.date) : new Date(),
      dueDate: invoice ? new Date(invoice.dueDate) : new Date(new Date().setDate(new Date().getDate() + 30)),
      invoiceNumber: invoice?.invoiceNumber || "",
      paymentTerms: invoice?.terms || "",
      notes: invoice?.notes || "",
      items: invoice?.items || [
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
      isDeposit: invoice?.isDeposit || false,
      depositPercentage: invoice?.depositPercentage || 30,
      depositAmount: invoice?.depositAmount || 0,
      hasFiscalStamp: invoice?.hasFiscalStamp || false,
      fiscalStampAmount: invoice?.fiscalStampAmount || 20, // Default to 20 DH
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
    
    // Update deposit amount if percentage is set
    const isDeposit = form.watch("isDeposit");
    const depositPercentage = form.watch("depositPercentage");
    
    if (isDeposit && depositPercentage) {
      const depositAmount = (newTotal * depositPercentage) / 100;
      form.setValue("depositAmount", depositAmount);
    }
  }, [form.watch("items"), form.watch("isDeposit"), form.watch("depositPercentage")]);
  
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
        title: t('invoices.minimumItemError'),
        description: t('invoices.minimumItemErrorDesc'),
        variant: 'destructive',
      });
    }
  };
  
  // Handler for selecting a product
  const handleProductSelect = (value: string, index: number) => {
    const product = mockProducts.find(p => p.id === value);
    if (product) {
      const currentItems = form.getValues("items");
      currentItems[index].description = product.name;
      currentItems[index].unitPrice = product.price;
      currentItems[index].vatRate = product.vatRate;
      
      // Update the total for this item
      currentItems[index].total = (currentItems[index].quantity * currentItems[index].unitPrice) - currentItems[index].discount;
      
      form.setValue("items", [...currentItems]);
    }
  };
  
  // Handler for updating an item's fields
  const handleItemUpdate = (index: number) => {
    const currentItems = form.getValues("items");
    const item = currentItems[index];
    
    // Recalculate the total for this item
    item.total = (item.quantity * item.unitPrice) - item.discount;
    
    form.setValue("items", [...currentItems]);
  };
  
  // Handle file uploads
  const handleFileUpload = (files: File[]) => {
    setAttachments([...attachments, ...files]);
    form.setValue("attachments", [...attachments, ...files]);
  };
  
  // Handle file removal
  const handleRemoveFile = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    form.setValue("attachments", newAttachments);
  };
  
  // Handle deposit toggle
  const handleDepositToggle = (checked: boolean) => {
    setShowDepositOptions(checked);
    form.setValue("isDeposit", checked);
    
    if (checked) {
      // Set default deposit percentage
      form.setValue("depositPercentage", 30);
      const depositAmount = (total * 30) / 100;
      form.setValue("depositAmount", depositAmount);
    } else {
      form.setValue("depositPercentage", undefined);
      form.setValue("depositAmount", undefined);
    }
  };
  
  const handleFormSubmit = (data: FormValues) => {
    // Pass the form data to the parent component
    onSubmit(data);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {viewOnly
              ? `${t('invoices.view')} ${t('invoices.invoice')} #${invoice?.invoiceNumber}`
              : isEditing
              ? `${t('form.edit')} ${t('invoices.invoice')}`
              : `${t('invoices.create')}`}
          </DialogTitle>
          <DialogDescription>
            {viewOnly
              ? t('invoices.invoice_details')
              : isEditing
              ? t('invoices.edit_description')
              : t('invoices.create_description')}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Client and Invoice Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoices.client')}</FormLabel>
                      <Select
                        disabled={isDisabled}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('invoices.select_client')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} - {client.ice}
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
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoices.invoice_number')}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isDisabled || (isEditing && invoice?.status !== 'draft')}
                          placeholder={`FAC-${new Date().getFullYear()}-0001`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
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
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
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
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('invoices.due_date')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
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
              </div>
            </div>
            
            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t('invoices.items')}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={isDisabled}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('invoices.add_item')}
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('invoices.product')}</TableHead>
                    <TableHead>{t('invoices.description')}</TableHead>
                    <TableHead className="text-center">{t('invoices.quantity')}</TableHead>
                    <TableHead className="text-right">{t('invoices.unit_price')}</TableHead>
                    <TableHead className="text-center">{t('invoices.vat_rate')}</TableHead>
                    <TableHead className="text-right">{t('invoices.discount')}</TableHead>
                    <TableHead className="text-right">{t('invoices.total')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.watch("items").map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => {
                            handleProductSelect(value, index);
                          }}
                          disabled={isDisabled}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('invoices.select_product')} />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => {
                            const updatedItems = [...form.getValues("items")];
                            updatedItems[index].description = e.target.value;
                            form.setValue("items", updatedItems);
                          }}
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedItems = [...form.getValues("items")];
                            updatedItems[index].quantity = parseInt(e.target.value);
                            form.setValue("items", updatedItems);
                            handleItemUpdate(index);
                          }}
                          className="text-center"
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updatedItems = [...form.getValues("items")];
                            updatedItems[index].unitPrice = parseFloat(e.target.value);
                            form.setValue("items", updatedItems);
                            handleItemUpdate(index);
                          }}
                          className="text-right"
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.vatRate.toString()}
                          onValueChange={(value) => {
                            const updatedItems = [...form.getValues("items")];
                            updatedItems[index].vatRate = parseInt(value);
                            form.setValue("items", updatedItems);
                            handleItemUpdate(index);
                          }}
                          disabled={isDisabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="7">7%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="14">14%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.discount}
                          onChange={(e) => {
                            const updatedItems = [...form.getValues("items")];
                            updatedItems[index].discount = parseFloat(e.target.value);
                            form.setValue("items", updatedItems);
                            handleItemUpdate(index);
                          }}
                          className="text-right"
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          disabled={isDisabled || form.getValues("items").length <= 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Totals Section */}
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span>{t('invoices.subtotal')}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('invoices.vat')}</span>
                    <span>{formatCurrency(vatAmount)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t('invoices.discount')}</span>
                      <span>-{formatCurrency(discountTotal)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>{t('invoices.total')}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  
                  {/* Deposit Option */}
                  <div className="pt-4">
                    <div className="flex items-center space-x-2 pb-2">
                      <Switch 
                        checked={showDepositOptions}
                        onCheckedChange={handleDepositToggle}
                        disabled={isDisabled}
                      />
                      <Label>{t('invoices.create_deposit_invoice')}</Label>
                    </div>
                    
                    {showDepositOptions && (
                      <div className="space-y-4 mt-2">
                        <div className="flex flex-col gap-2">
                          <FormField
                            control={form.control}
                            name="depositPercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('invoices.deposit_percentage')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      field.onChange(value);
                                      const depositAmount = (total * value) / 100;
                                      form.setValue("depositAmount", depositAmount);
                                    }}
                                    disabled={isDisabled}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FormField
                            control={form.control}
                            name="depositAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('invoices.deposit_amount')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    disabled={true}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes and Terms Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('invoices.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('invoices.notes_placeholder')}
                        {...field}
                        rows={4}
                        disabled={isDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('invoices.payment_terms')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('invoices.terms_placeholder')}
                        {...field}
                        rows={4}
                        disabled={isDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Attachments Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('invoices.attachments')}</h3>
              
              {!isDisabled && (
                <FileUploader 
                  onFilesSelected={handleFileUpload}
                  maxFiles={5}
                  acceptedTypes={['.pdf', '.jpg', '.png', '.doc', '.docx', '.xls', '.xlsx']}
                />
              )}
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2" />
                        <span>{file.name}</span>
                      </div>
                      {!isDisabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Legal Notices */}
            <InvoiceLegalNotices 
              isEditing={isEditing}
              customNotices={form.watch("customLegalNotices")}
              onCustomNoticesChange={(value) => form.setValue("customLegalNotices", value)}
              disabled={isDisabled}
            />
            
            {/* Fiscal Stamp Section */}
            <div className="space-y-2 pt-4">
              <Separator />
              <h3 className="text-lg font-medium">{t('invoices.fiscal_stamp') || "Timbre fiscal"}</h3>
              
              <FormField
                control={form.control}
                name="hasFiscalStamp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('invoices.add_fiscal_stamp') || "Ajouter un timbre fiscal"}</FormLabel>
                      <FormDescription>
                        {t('invoices.fiscal_stamp_description') || "Requis pour certains types de factures selon la réglementation en vigueur."}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isDisabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("hasFiscalStamp") && (
                <FormField
                  control={form.control}
                  name="fiscalStampAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoices.fiscal_stamp_amount') || "Montant du timbre"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isDisabled}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('invoices.fiscal_stamp_info') || "Généralement 20 DH pour la plupart des factures commerciales"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
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

export default InvoiceFormDialog; 