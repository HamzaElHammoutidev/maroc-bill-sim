import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { createTaxReport, InvoiceStatus } from '@/data/mockData';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Schema for tax report form
const taxReportSchema = z.object({
  name: z.string().min(2, { message: "Report name is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  includeStatuses: z.array(z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'])),
});

interface TaxReportFormProps {
  companyId: string;
  onClose: (refreshData?: boolean) => void;
}

const TaxReportForm: React.FC<TaxReportFormProps> = ({ companyId, onClose }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create form with default values
  const form = useForm<z.infer<typeof taxReportSchema>>({
    resolver: zodResolver(taxReportSchema),
    defaultValues: {
      name: `Déclaration TVA ${format(new Date(), 'MMMM yyyy', { locale: fr })}`,
      startDate: new Date(new Date().setDate(1)), // First day of current month
      endDate: new Date(),
      includeStatuses: ['sent', 'paid', 'partial'],
    }
  });
  
  const onSubmit = (values: z.infer<typeof taxReportSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Create report
      createTaxReport(
        companyId,
        values.name,
        values.startDate.toISOString(),
        values.endDate.toISOString(),
        {
          invoiceStatus: values.includeStatuses as InvoiceStatus[],
        }
      );
      
      toast.success(t('taxes.report_generated'));
      onClose(true);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error(t('common.error_generating'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const invoiceStatusOptions = [
    { value: 'draft', label: t('invoices.status_draft') },
    { value: 'sent', label: t('invoices.status_sent') },
    { value: 'paid', label: t('invoices.status_paid') },
    { value: 'partial', label: t('invoices.status_partial') },
    { value: 'overdue', label: t('invoices.status_overdue') },
    { value: 'cancelled', label: t('invoices.status_cancelled') },
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('taxes.report_name')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('taxes.start_date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>{t('taxes.select_date')}</span>
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
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('taxes.end_date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>{t('taxes.select_date')}</span>
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
        </div>
        
        <FormField
          control={form.control}
          name="includeStatuses"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">{t('taxes.include_statuses')}</FormLabel>
              </div>
              <div className="space-y-2">
                {invoiceStatusOptions.map(option => (
                  <FormField
                    key={option.value}
                    control={form.control}
                    name="includeStatuses"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.value as any)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, option.value as any])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.value
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option.label}
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
            {isSubmitting ? t('common.generating') : t('taxes.generate')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaxReportForm; 