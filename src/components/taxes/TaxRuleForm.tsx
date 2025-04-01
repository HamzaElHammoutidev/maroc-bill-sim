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
import { 
  TaxRule, 
  Tax, 
  ProductCategory, 
  getTaxRules, 
  getTaxById, 
  getTaxes,
  getProductCategories,
  mockTaxRules 
} from '@/data/mockData';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Schema for tax rule form
const taxRuleSchema = z.object({
  name: z.string().min(2, { message: "Rule name is required" }),
  description: z.string().optional(),
  taxIds: z.array(z.string()).min(1, { message: "At least one tax must be selected" }),
  productCategoryIds: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  priority: z.coerce.number().int().min(1),
});

interface TaxRuleFormProps {
  companyId: string;
  ruleId: string | null;
  onClose: (refreshData?: boolean) => void;
}

const TaxRuleForm: React.FC<TaxRuleFormProps> = ({ companyId, ruleId, onClose }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewRule, setIsNewRule] = useState(true);
  const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  
  // Create form with default values
  const form = useForm<z.infer<typeof taxRuleSchema>>({
    resolver: zodResolver(taxRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      taxIds: [],
      productCategoryIds: [],
      isActive: true,
      priority: 1,
    }
  });
  
  // Load available taxes and product categories
  useEffect(() => {
    setAvailableTaxes(getTaxes(companyId));
    setProductCategories(getProductCategories(companyId));
  }, [companyId]);
  
  // Update form when ruleId changes
  useEffect(() => {
    if (ruleId) {
      setIsNewRule(false);
      const rule = getTaxRules(companyId).find(r => r.id === ruleId);
      if (rule) {
        form.reset({
          name: rule.name,
          description: rule.description || '',
          taxIds: rule.taxIds,
          productCategoryIds: rule.productCategoryIds || [],
          isActive: rule.isActive,
          priority: rule.priority,
        });
      }
    } else {
      setIsNewRule(true);
      form.reset({
        name: '',
        description: '',
        taxIds: [],
        productCategoryIds: [],
        isActive: true,
        priority: 1,
      });
    }
  }, [ruleId, companyId, form]);
  
  const onSubmit = (values: z.infer<typeof taxRuleSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call an API
      if (isNewRule) {
        // Create new rule
        const newRule: TaxRule = {
          id: `rule-${Date.now()}`,
          companyId,
          name: values.name,
          description: values.description,
          taxIds: values.taxIds,
          productCategoryIds: values.productCategoryIds?.length ? values.productCategoryIds : undefined,
          isActive: values.isActive,
          priority: values.priority,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Add to mock data
        mockTaxRules.push(newRule);
        toast.success(t('taxes.rule_created'));
      } else if (ruleId) {
        // Update existing rule
        const ruleIndex = mockTaxRules.findIndex(r => r.id === ruleId);
        if (ruleIndex !== -1) {
          mockTaxRules[ruleIndex] = {
            ...mockTaxRules[ruleIndex],
            name: values.name,
            description: values.description,
            taxIds: values.taxIds,
            productCategoryIds: values.productCategoryIds?.length ? values.productCategoryIds : undefined,
            isActive: values.isActive,
            priority: values.priority,
            updatedAt: new Date().toISOString(),
          };
          toast.success(t('taxes.rule_updated'));
        }
      }
      
      // Close form and refresh data
      onClose(true);
    } catch (error) {
      console.error('Failed to save tax rule:', error);
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
              <FormLabel>{t('taxes.rule_name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('taxes.rule_name_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('taxes.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('taxes.rule_description_placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('taxes.priority')}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  step="1" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="taxIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">{t('taxes.applicable_taxes')}</FormLabel>
                </div>
                <div className="space-y-2">
                  {availableTaxes.map((tax) => (
                    <FormField
                      key={tax.id}
                      control={form.control}
                      name="taxIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={tax.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(tax.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, tax.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== tax.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {tax.name} ({tax.rate}%)
                              <Badge 
                                variant="outline" 
                                className="ml-2"
                              >
                                {tax.type === 'vat' ? t('taxes.type_vat') :
                                 tax.type === 'service' ? t('taxes.type_service') :
                                 tax.type === 'stamp' ? t('taxes.type_stamp') : 
                                 t('taxes.type_other')}
                              </Badge>
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {productCategories.length > 0 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="productCategoryIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">{t('taxes.applicable_product_categories')}</FormLabel>
                  </div>
                  <div className="space-y-2">
                    {productCategories.map((category) => (
                      <FormField
                        key={category.id}
                        control={form.control}
                        name="productCategoryIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={category.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, category.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== category.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {category.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
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
            {isSubmitting ? t('common.saving') : (isNewRule ? t('common.create') : t('common.save'))}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaxRuleForm; 