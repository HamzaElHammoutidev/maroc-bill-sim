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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Quote } from '@/data/mockData';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const validationSchema = z.object({
  notes: z.string().optional(),
});

type ValidationFormValues = z.infer<typeof validationSchema>;

interface QuoteValidationDialogProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidate: (data: ValidationFormValues) => void;
  onReject: (data: ValidationFormValues) => void;
}

const QuoteValidationDialog: React.FC<QuoteValidationDialogProps> = ({
  quote,
  open,
  onOpenChange,
  onValidate,
  onReject,
}) => {
  const { t } = useTranslation();
  
  const form = useForm<ValidationFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      notes: '',
    },
  });
  
  if (!quote) return null;
  
  const handleValidate = (data: ValidationFormValues) => {
    onValidate(data);
  };
  
  const handleReject = () => {
    onReject(form.getValues());
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('quotes.validateTitle')}</DialogTitle>
          <DialogDescription>
            {t('quotes.validateDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium">{t('quotes.quoteDetails')}</h3>
            <p className="text-sm text-muted-foreground">{quote.quoteNumber}</p>
            <p className="text-sm text-muted-foreground">{t('quotes.total')}: {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(quote.total)}</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleValidate)}>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quotes.validationNotes')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('quotes.validationNotesPlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6 flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReject}
                  className="border-red-300 bg-red-50 hover:bg-red-100 hover:text-red-800"
                >
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  {t('quotes.rejectValidation')}
                </Button>
                <Button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('quotes.approveValidation')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteValidationDialog; 