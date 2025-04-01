import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { Quote } from '@/data/mockData';
import { formatDate } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const reminderSchema = z.object({
  enabled: z.boolean(),
  days: z.number().min(1).max(30),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface QuoteReminderDialogProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ReminderFormValues) => void;
}

const QuoteReminderDialog: React.FC<QuoteReminderDialogProps> = ({
  quote,
  open,
  onOpenChange,
  onSave,
}) => {
  const { t } = useTranslation();
  
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      enabled: quote?.reminderEnabled || false,
      days: quote?.reminderDays || 7,
    },
  });
  
  if (!quote) return null;
  
  const calculatedReminderDate = () => {
    if (!form.watch('enabled')) return null;
    
    const expiryDate = new Date(quote.expiryDate);
    const daysBeforeExpiry = form.watch('days');
    const reminderDate = new Date(expiryDate);
    reminderDate.setDate(expiryDate.getDate() - daysBeforeExpiry);
    
    return reminderDate;
  };
  
  const handleSubmit = (data: ReminderFormValues) => {
    onSave(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('quotes.reminderTitle')}</DialogTitle>
          <DialogDescription>
            {t('quotes.reminderDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium">{t('quotes.quoteDetails')}</h3>
            <p className="text-sm text-muted-foreground">{quote.quoteNumber}</p>
            <p className="text-sm text-muted-foreground">
              {t('quotes.client')}: {quote.clientId}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('quotes.expiryLabel')}: {formatDate(quote.expiryDate)}
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('quotes.enableReminders')}</FormLabel>
                      <FormDescription>
                        {t('quotes.enableRemindersDesc')}
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
              
              {form.watch('enabled') && (
                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('quotes.reminderDaysBefore')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={30} 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {calculatedReminderDate() && (
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <Calendar className="h-4 w-4" />
                            {t('quotes.reminderScheduled')}: {formatDate(calculatedReminderDate()!)}
                          </div>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button type="submit">
                  {t('form.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteReminderDialog; 