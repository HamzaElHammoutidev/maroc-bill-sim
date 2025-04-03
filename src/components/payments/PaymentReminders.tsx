import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, isPast, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockInvoices, mockClients, Invoice, Client } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AlertCircle, Bell, BellRing, Calendar, Check, Clock, Mail, MailWarning, SendHorizontal } from 'lucide-react';

// Types for payment reminders
interface ReminderTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  reminderType: 'gentle' | 'standard' | 'urgent';
}

interface ReminderRule {
  id: string;
  name: string;
  daysAfterDue: number;
  templateId: string;
  isActive: boolean;
  sendAutomatically: boolean;
}

interface ReminderLog {
  id: string;
  invoiceId: string;
  clientId: string;
  dateSent: string;
  reminderType: 'gentle' | 'standard' | 'urgent';
  emailSubject: string;
  status: 'sent' | 'opened' | 'clicked' | 'replied';
  sentBy: string; // user ID or 'system' for auto-reminders
}

interface PaymentRemindersProps {
  onSendReminder?: (invoiceIds: string[], templateId: string) => void;
  onMarkAsPaid?: (invoiceId: string) => void;
  onRuleChange?: (rules: ReminderRule[]) => void;
}

export const PaymentReminders: React.FC<PaymentRemindersProps> = ({
  onSendReminder,
  onMarkAsPaid,
  onRuleChange
}) => {
  const { t } = useTranslation();
  
  // State for invoices requiring reminders
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isRemindersDialogOpen, setIsRemindersDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  
  // State for reminder rules and templates
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>([]);
  const [reminderTemplates, setReminderTemplates] = useState<ReminderTemplate[]>([]);
  const [isEditRuleDialogOpen, setIsEditRuleDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<ReminderRule | null>(null);
  
  // State for custom email when sending reminders
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [useCustomEmail, setUseCustomEmail] = useState(false);
  
  // Get all overdue invoices from mock data
  useEffect(() => {
    const overdueInvoices = mockInvoices.filter(invoice => 
      (invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'partial') &&
      isPast(new Date(invoice.dueDate))
    );
    
    setInvoices(overdueInvoices);
    
    // Create mock reminder templates
    const templates: ReminderTemplate[] = [
      {
        id: 'template-1',
        name: t('reminders.gentle_reminder'),
        subject: t('reminders.gentle_reminder_subject'),
        body: t('reminders.gentle_reminder_body'),
        reminderType: 'gentle'
      },
      {
        id: 'template-2',
        name: t('reminders.standard_reminder'),
        subject: t('reminders.standard_reminder_subject'),
        body: t('reminders.standard_reminder_body'),
        reminderType: 'standard'
      },
      {
        id: 'template-3',
        name: t('reminders.urgent_reminder'),
        subject: t('reminders.urgent_reminder_subject'),
        body: t('reminders.urgent_reminder_body'),
        reminderType: 'urgent'
      }
    ];
    setReminderTemplates(templates);
    
    // Set default template
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
    
    // Create mock reminder rules
    const rules: ReminderRule[] = [
      {
        id: 'rule-1',
        name: t('reminders.first_reminder'),
        daysAfterDue: 3,
        templateId: 'template-1',
        isActive: true,
        sendAutomatically: true
      },
      {
        id: 'rule-2',
        name: t('reminders.second_reminder'),
        daysAfterDue: 10,
        templateId: 'template-2',
        isActive: true,
        sendAutomatically: true
      },
      {
        id: 'rule-3',
        name: t('reminders.final_reminder'),
        daysAfterDue: 30,
        templateId: 'template-3',
        isActive: true,
        sendAutomatically: false
      }
    ];
    setReminderRules(rules);
    
    // Create mock reminder logs
    const logs: ReminderLog[] = [];
    overdueInvoices.slice(0, 3).forEach((invoice, index) => {
      logs.push({
        id: `log-${index}`,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        dateSent: addDays(new Date(), -(index + 2)).toISOString(),
        reminderType: index === 0 ? 'gentle' : index === 1 ? 'standard' : 'urgent',
        emailSubject: templates[index % templates.length].subject,
        status: ['sent', 'opened', 'clicked', 'replied'][Math.floor(Math.random() * 4)] as any,
        sentBy: 'system'
      });
    });
    setReminderLogs(logs);
  }, [t]);
  
  // Group invoices by client for better UI organization
  const invoicesByClient = useMemo(() => {
    const grouped: Record<string, { client: Client | null, invoices: Invoice[] }> = {};
    
    invoices.forEach(invoice => {
      if (!grouped[invoice.clientId]) {
        const client = mockClients.find(c => c.id === invoice.clientId) || null;
        grouped[invoice.clientId] = { client, invoices: [] };
      }
      grouped[invoice.clientId].invoices.push(invoice);
    });
    
    return Object.values(grouped);
  }, [invoices]);
  
  // Get all invoices that need reminders based on rules
  const invoicesNeedingReminders = useMemo(() => {
    return invoices.filter(invoice => {
      const daysPastDue = differenceInDays(new Date(), new Date(invoice.dueDate));
      
      // Check if this invoice matches any active rule's criteria
      return reminderRules.some(rule => 
        rule.isActive && daysPastDue >= rule.daysAfterDue &&
        // Check if this invoice hasn't received this level of reminder yet
        !reminderLogs.some(log => 
          log.invoiceId === invoice.id && 
          log.reminderType === reminderTemplates.find(t => t.id === rule.templateId)?.reminderType
        )
      );
    });
  }, [invoices, reminderRules, reminderLogs, reminderTemplates]);
  
  // Handle sending reminders
  const handleSendReminders = () => {
    if (selectedInvoices.length === 0) {
      toast.error(t('reminders.no_invoices_selected'));
      return;
    }
    
    // Get the template
    const template = reminderTemplates.find(t => t.id === selectedTemplateId);
    if (!template) {
      toast.error(t('reminders.no_template_selected'));
      return;
    }
    
    // In a real app, this would send actual emails
    // For our demo, we'll just update the reminder logs
    const newLogs = selectedInvoices.map(invoiceId => {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      return {
        id: `log-${Date.now()}-${invoiceId}`,
        invoiceId,
        clientId: invoice?.clientId || '',
        dateSent: new Date().toISOString(),
        reminderType: template.reminderType,
        emailSubject: useCustomEmail ? customSubject : template.subject,
        status: 'sent' as const,
        sentBy: 'user-1' // In a real app, this would be the current user
      };
    });
    
    setReminderLogs(prev => [...newLogs, ...prev]);
    
    if (onSendReminder) {
      onSendReminder(selectedInvoices, selectedTemplateId);
    }
    
    toast.success(t('reminders.sent_success', { count: selectedInvoices.length }));
    setIsRemindersDialogOpen(false);
    setSelectedInvoices([]);
  };
  
  // Handle rule changes
  const handleRuleSave = () => {
    if (!currentRule) return;
    
    const updatedRules = reminderRules.map(rule => 
      rule.id === currentRule.id ? currentRule : rule
    );
    
    setReminderRules(updatedRules);
    
    if (onRuleChange) {
      onRuleChange(updatedRules);
    }
    
    toast.success(t('reminders.rule_updated'));
    setIsEditRuleDialogOpen(false);
    setCurrentRule(null);
  };
  
  // Handle editing a rule
  const handleEditRule = (rule: ReminderRule) => {
    setCurrentRule({ ...rule });
    setIsEditRuleDialogOpen(true);
  };
  
  // Toggle select all invoices
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };
  
  // Handle selecting/deselecting an invoice
  const handleSelectInvoice = (checked: boolean, invoiceId: string) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  };
  
  // Open reminder dialog and reset custom email fields
  const handleOpenReminderDialog = () => {
    if (selectedInvoices.length === 0) {
      toast.error(t('reminders.no_invoices_selected'));
      return;
    }
    
    const template = reminderTemplates.find(t => t.id === selectedTemplateId);
    if (template) {
      setCustomSubject(template.subject);
      setCustomBody(template.body);
    }
    
    setUseCustomEmail(false);
    setIsRemindersDialogOpen(true);
  };
  
  // Handle invoice being marked as paid
  const handleMarkAsPaid = (invoiceId: string) => {
    if (onMarkAsPaid) {
      onMarkAsPaid(invoiceId);
    }
    
    // Update our local state
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    
    toast.success(t('reminders.marked_as_paid'));
  };
  
  // Format reminder status badge
  const getReminderStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
          {t('reminders.status.sent')}
        </Badge>;
      case 'opened':
        return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
          {t('reminders.status.opened')}
        </Badge>;
      case 'clicked':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
          {t('reminders.status.clicked')}
        </Badge>;
      case 'replied':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
          {t('reminders.status.replied')}
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle>{t('reminders.title')}</CardTitle>
            <CardDescription>
              {t('reminders.description')}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={handleOpenReminderDialog}
              disabled={selectedInvoices.length === 0}
            >
              <SendHorizontal className="h-4 w-4 mr-2" />
              {t('reminders.send')}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overdue">
          <TabsList className="mb-4">
            <TabsTrigger value="overdue">
              {t('reminders.overdue_invoices')}
              {invoicesNeedingReminders.length > 0 && (
                <Badge className="ml-2 bg-red-500" variant="default">
                  {invoicesNeedingReminders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">{t('reminders.history')}</TabsTrigger>
            <TabsTrigger value="settings">{t('reminders.settings')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overdue" className="space-y-4">
            {/* Summary section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-600">{t('reminders.overdue_invoices')}</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
                <p className="text-sm text-red-600">
                  {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0))}
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md">
                <p className="text-sm text-amber-600">{t('reminders.invoices_needing_reminders')}</p>
                <p className="text-2xl font-bold">{invoicesNeedingReminders.length}</p>
                <div className="flex items-center text-sm text-amber-600 mt-1">
                  <BellRing className="h-4 w-4 mr-1" />
                  {t('reminders.based_on_rules')}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-600">{t('reminders.reminders_sent')}</p>
                <p className="text-2xl font-bold">{reminderLogs.length}</p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {t('reminders.last_30_days')}
                </div>
              </div>
            </div>
            
            {/* Invoice list with checkboxes for selection */}
            <div>
              <div className="flex items-center mb-4">
                <Checkbox 
                  id="select-all" 
                  checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="ml-2">
                  {t('reminders.select_all')}
                </Label>
                
                {selectedInvoices.length > 0 && (
                  <p className="ml-auto text-sm text-muted-foreground">
                    {t('reminders.selected', { count: selectedInvoices.length })}
                  </p>
                )}
              </div>
              
              {invoicesByClient.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  {t('reminders.no_overdue_invoices')}
                </div>
              ) : (
                <div className="space-y-6">
                  {invoicesByClient.map(({ client, invoices }) => (
                    <div key={client?.id || 'unknown'} className="border rounded-md p-4">
                      <div className="flex items-center mb-4">
                        <h3 className="font-medium">
                          {client?.name || t('reminders.unknown_client')}
                        </h3>
                        <Badge className="ml-2">
                          {invoices.length} {t('reminders.invoices')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {invoices.map(invoice => {
                          const daysPastDue = differenceInDays(new Date(), new Date(invoice.dueDate));
                          const isPastDueForRule = reminderRules.some(rule => 
                            rule.isActive && daysPastDue >= rule.daysAfterDue
                          );
                          
                          // Find latest reminder sent for this invoice
                          const latestReminder = reminderLogs
                            .filter(log => log.invoiceId === invoice.id)
                            .sort((a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime())[0];
                          
                          return (
                            <div 
                              key={invoice.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-md",
                                isPastDueForRule ? "bg-red-50" : "bg-gray-50"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox 
                                  checked={selectedInvoices.includes(invoice.id)}
                                  onCheckedChange={(checked) => 
                                    handleSelectInvoice(checked as boolean, invoice.id)
                                  }
                                  className="mt-1"
                                />
                                
                                <div>
                                  <div className="font-medium">
                                    {invoice.invoiceNumber}
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    {formatCurrency(invoice.total - (invoice.paidAmount || 0))}
                                    <span className="mx-1">•</span>
                                    <span className={daysPastDue > 30 ? "text-red-600" : ""}>
                                      {t('reminders.days_overdue', { days: daysPastDue })}
                                    </span>
                                  </div>
                                  
                                  {latestReminder && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {t('reminders.last_reminder')}: {format(new Date(latestReminder.dateSent), 'PP')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {isPastDueForRule && !latestReminder && (
                                  <Badge variant="outline" className="bg-amber-50 border-amber-200">
                                    <BellRing className="h-3 w-3 mr-1" />
                                    {t('reminders.needs_reminder')}
                                  </Badge>
                                )}
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  {t('reminders.mark_paid')}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reminders.date_sent')}</TableHead>
                    <TableHead>{t('reminders.invoice')}</TableHead>
                    <TableHead>{t('reminders.client')}</TableHead>
                    <TableHead>{t('reminders.type')}</TableHead>
                    <TableHead>{t('reminders.status')}</TableHead>
                    <TableHead>{t('reminders.sent_by')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminderLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {t('reminders.no_reminders_sent')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    reminderLogs.map(log => {
                      const invoice = mockInvoices.find(inv => inv.id === log.invoiceId);
                      const client = mockClients.find(c => c.id === log.clientId);
                      
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(new Date(log.dateSent), 'PPP')}
                          </TableCell>
                          <TableCell>
                            {invoice?.invoiceNumber || t('reminders.unknown')}
                          </TableCell>
                          <TableCell>
                            {client?.name || t('reminders.unknown')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                log.reminderType === 'gentle' && "border-blue-200 bg-blue-50 text-blue-800",
                                log.reminderType === 'standard' && "border-amber-200 bg-amber-50 text-amber-800",
                                log.reminderType === 'urgent' && "border-red-200 bg-red-50 text-red-800"
                              )}
                            >
                              {t(`reminders.type.${log.reminderType}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getReminderStatusBadge(log.status)}
                          </TableCell>
                          <TableCell>
                            {log.sentBy === 'system' ? (
                              <span className="text-muted-foreground">{t('reminders.automatic')}</span>
                            ) : (
                              t('reminders.user')
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">{t('reminders.reminder_rules')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('reminders.rules_description')}
                </p>
                
                <div className="space-y-3">
                  {reminderRules.map(rule => (
                    <div 
                      key={rule.id} 
                      className="border rounded-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('reminders.days_after_due', { days: rule.daysAfterDue })} •
                          {' '}{reminderTemplates.find(t => t.id === rule.templateId)?.name || t('reminders.unknown_template')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={rule.isActive}
                            onCheckedChange={(checked) => {
                              const updatedRules = reminderRules.map(r => 
                                r.id === rule.id ? { ...r, isActive: checked } : r
                              );
                              setReminderRules(updatedRules);
                              if (onRuleChange) {
                                onRuleChange(updatedRules);
                              }
                            }}
                          />
                          <Label>{rule.isActive ? t('reminders.active') : t('reminders.inactive')}</Label>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                        >
                          {t('reminders.edit')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">{t('reminders.email_templates')}</h3>
                
                <div className="space-y-3">
                  {reminderTemplates.map(template => (
                    <div key={template.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            template.reminderType === 'gentle' && "border-blue-200 bg-blue-50 text-blue-800",
                            template.reminderType === 'standard' && "border-amber-200 bg-amber-50 text-amber-800",
                            template.reminderType === 'urgent' && "border-red-200 bg-red-50 text-red-800"
                          )}
                        >
                          {t(`reminders.type.${template.reminderType}`)}
                        </Badge>
                      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <p className="text-sm font-medium">{t('reminders.subject')}: {template.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="flex items-center text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 mr-2" />
          {t('reminders.automatic_reminder_notice')}
        </div>
      </CardFooter>
      
      {/* Send Reminders Dialog */}
      <Dialog open={isRemindersDialogOpen} onOpenChange={setIsRemindersDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('reminders.send_reminders')}</DialogTitle>
            <DialogDescription>
              {t('reminders.send_reminders_description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">{t('reminders.reminder_template')}</Label>
              <RadioGroup 
                value={selectedTemplateId} 
                onValueChange={setSelectedTemplateId}
                className="space-y-2"
              >
                {reminderTemplates.map(template => (
                  <div key={template.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={template.id} id={template.id} />
                    <Label htmlFor={template.id} className="flex items-center">
                      {template.name}
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-2",
                          template.reminderType === 'gentle' && "border-blue-200 bg-blue-50 text-blue-800",
                          template.reminderType === 'standard' && "border-amber-200 bg-amber-50 text-amber-800",
                          template.reminderType === 'urgent' && "border-red-200 bg-red-50 text-red-800"
                        )}
                      >
                        {t(`reminders.type.${template.reminderType}`)}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="custom-email" 
                checked={useCustomEmail}
                onCheckedChange={setUseCustomEmail}
              />
              <Label htmlFor="custom-email">{t('reminders.customize_email')}</Label>
            </div>
            
            {useCustomEmail && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="subject">{t('reminders.subject')}</Label>
                  <Input 
                    id="subject" 
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="body">{t('reminders.body')}</Label>
                  <Textarea
                    id="body"
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            )}
            
            <div className="border rounded-md p-3 bg-muted/20">
              <h4 className="text-sm font-medium mb-1">{t('reminders.summary')}</h4>
              <p className="text-sm">{t('reminders.sending_to', { count: selectedInvoices.length })}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemindersDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSendReminders}>
              <SendHorizontal className="h-4 w-4 mr-2" />
              {t('reminders.send_now')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Rule Dialog */}
      <Dialog open={isEditRuleDialogOpen} onOpenChange={setIsEditRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reminders.edit_rule')}</DialogTitle>
            <DialogDescription>
              {t('reminders.edit_rule_description')}
            </DialogDescription>
          </DialogHeader>
          
          {currentRule && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">{t('reminders.rule_name')}</Label>
                <Input
                  id="rule-name"
                  value={currentRule.name}
                  onChange={(e) => setCurrentRule({ ...currentRule, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="days-after-due">{t('reminders.days_after_due_label')}</Label>
                <Input
                  id="days-after-due"
                  type="number"
                  min="1"
                  value={currentRule.daysAfterDue}
                  onChange={(e) => setCurrentRule({ 
                    ...currentRule, 
                    daysAfterDue: parseInt(e.target.value) || 1 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template">{t('reminders.template')}</Label>
                <Select 
                  value={currentRule.templateId}
                  onValueChange={(value) => setCurrentRule({ ...currentRule, templateId: value })}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder={t('reminders.select_template')} />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={currentRule.isActive}
                  onCheckedChange={(checked) => setCurrentRule({ ...currentRule, isActive: checked })}
                />
                <Label htmlFor="is-active">{t('reminders.active')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="send-automatically"
                  checked={currentRule.sendAutomatically}
                  onCheckedChange={(checked) => setCurrentRule({
                    ...currentRule,
                    sendAutomatically: checked
                  })}
                />
                <Label htmlFor="send-automatically">{t('reminders.send_automatically')}</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRuleDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRuleSave}>
              {t('reminders.save_rule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 