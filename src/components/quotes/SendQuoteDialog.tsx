
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Send, File } from 'lucide-react';
import { Quote } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

// Define form validation schema
const formSchema = z.object({
  to: z.string().email({
    message: "Veuillez saisir une adresse email valide.",
  }),
  cc: z.string().email({
    message: "Veuillez saisir une adresse email valide.",
  }).optional().or(z.literal('')),
  subject: z.string().min(1, {
    message: "Le sujet est requis.",
  }),
  message: z.string().min(1, {
    message: "Le message est requis.",
  }),
  attachPdf: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface SendQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: FormValues) => void;
  quote: Quote | null;
}

const SendQuoteDialog: React.FC<SendQuoteDialogProps> = ({
  open,
  onOpenChange,
  onSend,
  quote,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: quote?.clientId ? "" : "",
      cc: "",
      subject: quote ? `Devis ${quote.quoteNumber}` : "",
      message: `Bonjour,\n\nVeuillez trouver ci-joint notre devis.\n\nCordialement,\nL'équipe commerciale`,
      attachPdf: true,
    },
  });
  
  // Submit handler
  const handleFormSubmit = (data: FormValues) => {
    if (!quote) {
      toast({
        title: t('quotes.sendError'),
        description: t('quotes.sendErrorDesc'),
        variant: 'destructive',
      });
      return;
    }
    
    onSend(data);
  };
  
  if (!quote) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('quotes.sendTitle')}</DialogTitle>
          <DialogDescription>
            {t('quotes.sendDescription')} {quote.quoteNumber}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Email To */}
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quotes.emailTo')}</FormLabel>
                  <FormControl>
                    <Input placeholder="client@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email CC */}
            <FormField
              control={form.control}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quotes.emailCc')}</FormLabel>
                  <FormControl>
                    <Input placeholder="collegue@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quotes.emailSubject')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quotes.emailMessage')}</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            {/* Attach PDF */}
            <FormField
              control={form.control}
              name="attachPdf"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center">
                      <File className="h-4 w-4 mr-2" />
                      {t('quotes.attachPdf')}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('form.cancel')}
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                {t('quotes.send')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SendQuoteDialog;
