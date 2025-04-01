import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Invoice, getClientById } from '@/data/mockData';

// Define form validation schema
const formSchema = z.object({
  recipient: z.string().email({
    message: "Une adresse email valide est requise",
  }),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, {
    message: "Le sujet est requis",
  }),
  message: z.string().min(1, {
    message: "Le message est requis",
  }),
  attachPdf: z.boolean().default(true),
  attachAdditionalFiles: z.boolean().default(false),
  sendCopy: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  invoice: Invoice;
}

const SendInvoiceDialog: React.FC<SendInvoiceDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  invoice,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('email');
  
  // Get client info
  const client = getClientById(invoice.clientId);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: client?.email || '',
      cc: '',
      bcc: '',
      subject: t('invoices.email_subject', { invoiceNumber: invoice.invoiceNumber }),
      message: t('invoices.email_default_message', { 
        clientName: client?.name || '',
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        dueDate: new Date(invoice.dueDate).toLocaleDateString()
      }),
      attachPdf: true,
      attachAdditionalFiles: false,
      sendCopy: false,
    },
  });
  
  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {t('invoices.send_invoice')} #{invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              {t('invoices.send_by_email')}
            </TabsTrigger>
            <TabsTrigger value="other">
              <SendHorizontal className="h-4 w-4 mr-2" />
              {t('invoices.other_methods')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoices.recipient')}</FormLabel>
                      <FormControl>
                        <Input placeholder="client@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoices.cc')}</FormLabel>
                        <FormControl>
                          <Input placeholder="cc@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bcc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoices.bcc')}</FormLabel>
                        <FormControl>
                          <Input placeholder="bcc@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoices.subject')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoices.message')}</FormLabel>
                      <FormControl>
                        <Textarea rows={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="attachPdf"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t('invoices.attach_pdf')}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="attachAdditionalFiles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t('invoices.attach_additional_files')}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sendCopy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t('invoices.send_copy_to_me')}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit">
                    {t('invoices.send')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="other" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">{t('invoices.other_send_methods')}</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>{t('invoices.download_and_print')}</li>
                  <li>{t('invoices.download_and_share')}</li>
                </ul>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="button"
                  onClick={() => {
                    // Mark as sent without email
                    onSubmit({
                      recipient: '',
                      subject: '',
                      message: '',
                      attachPdf: false,
                      attachAdditionalFiles: false,
                      sendCopy: false
                    });
                    onOpenChange(false);
                  }}
                >
                  {t('invoices.mark_as_sent')}
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceDialog; 