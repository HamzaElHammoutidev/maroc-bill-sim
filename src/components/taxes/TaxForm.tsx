import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Tax, getTaxById, mockTaxes } from '@/data/mockData';

// Schema for tax form
const taxSchema = z.object({
  name: z.string().min(2, { message: "Tax name is required" }),
  code: z.string().min(2, { message: "Tax code is required" }),
  type: z.enum(['vat', 'service', 'stamp', 'other']),
  rate: z.coerce.number().min(0).max(100),
  isDefault: z.boolean().default(false),
  isExempt: z.boolean().default(false),
  exemptionReason: z.string().optional(),
  isActive: z.boolean().default(true),
  appliesTo: z.enum(['all', 'products', 'services']),
  description: z.string().optional(),
});

interface TaxFormProps {
  companyId: string;
  taxId: string | null;
  onClose: (refreshData?: boolean) => void;
}

const TaxForm: React.FC<TaxFormProps> = ({ companyId, taxId, onClose }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewTax, setIsNewTax] = useState(true);
  
  // Create form with default values
  const form = useForm<z.infer<typeof taxSchema>>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'vat',
      rate: 0,
      isDefault: false,
      isExempt: false,
      exemptionReason: '',
      isActive: true,
      appliesTo: 'all',
      description: '',
    }
  });
  
  // Update form when taxId changes
  useEffect(() => {
    if (taxId) {
      setIsNewTax(false);
      const tax = getTaxById(taxId);
      if (tax) {
        form.reset({
          name: tax.name,
          code: tax.code,
          type: tax.type,
          rate: tax.rate,
          isDefault: tax.isDefault,
          isExempt: tax.isExempt,
          exemptionReason: tax.exemptionReason || '',
          isActive: tax.isActive,
          appliesTo: tax.appliesTo,
          description: tax.description || '',
        });
      }
    } else {
      setIsNewTax(true);
      form.reset({
        name: '',
        code: '',
        type: 'vat',
        rate: 0,
        isDefault: false,
        isExempt: false,
        exemptionReason: '',
        isActive: true,
        appliesTo: 'all',
        description: '',
      });
    }
  }, [taxId, form]);
  
  // Watch for exempt status to show/hide exemption reason
  const isExempt = form.watch('isExempt');
  
  const onSubmit = (values: z.infer<typeof taxSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call an API
      if (isNewTax) {
        // Create new tax
        const newTax: Tax = {
          id: `tax-${Date.now()}`,
          companyId,
          name: values.name,
          code: values.code,
          type: values.type,
          rate: values.rate,
          isDefault: values.isDefault,
          isExempt: values.isExempt,
          exemptionReason: values.isExempt ? values.exemptionReason : undefined,
          isActive: values.isActive,
          appliesTo: values.appliesTo,
          description: values.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Add to mock data
        mockTaxes.push(newTax);
        toast.success(t('taxes.tax_created'));
      } else if (taxId) {
        // Update existing tax
        const taxIndex = mockTaxes.findIndex(t => t.id === taxId);
        if (taxIndex !== -1) {
          mockTaxes[taxIndex] = {
            ...mockTaxes[taxIndex],
            name: values.name,
            code: values.code,
            type: values.type,
            rate: values.rate,
            isDefault: values.isDefault,
            isExempt: values.isExempt,
            exemptionReason: values.isExempt ? values.exemptionReason : undefined,
            isActive: values.isActive,
            appliesTo: values.appliesTo,
            description: values.description,
            updatedAt: new Date().toISOString(),
          };
          toast.success(t('taxes.tax_updated'));
        }
      }
      
      // Close form and refresh data
      onClose(true);
    } catch (error) {
      console.error('Failed to save tax:', error);
      toast.error(t('common.error_saving'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('taxes.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('taxes.name_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('taxes.code')}</FormLabel>
              <FormControl>
                <Input placeholder={t('taxes.code_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('taxes.type')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('taxes.select_type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vat">{t('taxes.type_vat')}</SelectItem>
                    <SelectItem value="service">{t('taxes.type_service')}</SelectItem>
                    <SelectItem value="stamp">{t('taxes.type_stamp')}</SelectItem>
                    <SelectItem value="other">{t('taxes.type_other')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('taxes.rate')} (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.01" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="appliesTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('taxes.applies_to')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('taxes.select_applies_to')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">{t('taxes.applies_all')}</SelectItem>
                  <SelectItem value="products">{t('taxes.applies_products')}</SelectItem>
                  <SelectItem value="services">{t('taxes.applies_services')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>{t('taxes.is_default')}</FormLabel>
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
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>{t('taxes.is_active')}</FormLabel>
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
        </div>
        
        <FormField
          control={form.control}
          name="isExempt"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>{t('taxes.is_exempt')}</FormLabel>
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
        
        {isExempt && (
          <FormField
            control={form.control}
            name="exemptionReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('taxes.exemption_reason')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('taxes.exemption_reason_placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('taxes.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('taxes.description_placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.saving') : (isNewTax ? t('common.create') : t('common.save'))}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaxForm; 