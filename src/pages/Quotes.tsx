import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Calendar, 
  Edit, 
  Trash, 
  Eye, 
  FileCheck, 
  FilePieChart, 
  Copy,
  Plus,
  FileX,
  FileMinus,
  SendHorizontal,
  ClipboardCheck,
  AlertTriangle,
  Bell,
  History,
  Download
} from 'lucide-react';
import { mockQuotes, mockInvoices, Quote, getClientById, QuoteStatus, EmailHistoryEntry } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import QuoteFilters from '@/components/quotes/QuoteFilters';
import QuoteDetailsDialog from '@/components/quotes/QuoteDetailsDialog';
import QuoteFormDialog from '@/components/quotes/QuoteFormDialog';
import SendQuoteDialog from '@/components/quotes/SendQuoteDialog';
import ConvertQuoteDialog from '@/components/quotes/ConvertQuoteDialog';
import DeleteQuoteDialog from '@/components/quotes/DeleteQuoteDialog';
import QuoteValidationDialog from '@/components/quotes/QuoteValidationDialog';
import QuoteReminderDialog from '@/components/quotes/QuoteReminderDialog';

const Quotes = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  
  // Dialog visibility states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateForm, setIsCreateForm] = useState(true);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState<string | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setQuotes(mockQuotes);
      setFilteredQuotes(mockQuotes);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...quotes];
    
    if (filterStatus) {
      result = result.filter(quote => quote.status === filterStatus);
    }
    
    if (filterClient) {
      result = result.filter(quote => quote.clientId === filterClient);
    }
    
    if (filterDateRange.from) {
      result = result.filter(quote => new Date(quote.date) >= filterDateRange.from!);
    }
    
    if (filterDateRange.to) {
      result = result.filter(quote => new Date(quote.date) <= filterDateRange.to!);
    }
    
    setFilteredQuotes(result);
  }, [quotes, filterStatus, filterClient, filterDateRange]);
  
  // Handler for the "Add Quote" button
  const handleAddQuote = () => {
    setSelectedQuote(null);
    setIsCreateForm(true);
    setIsFormOpen(true);
  };
  
  // Handler for viewing a quote
  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsDetailsOpen(true);
  };
  
  // Handler for editing a quote
  const handleEditQuote = (quote: Quote) => {
    // Only allow editing of draft or awaiting acceptance quotes
    if (!['draft', 'pending_validation', 'awaiting_acceptance'].includes(quote.status)) {
      toast({
        title: t('quotes.editError'),
        description: t('quotes.editErrorDesc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedQuote(quote);
    setIsCreateForm(false);
    setIsFormOpen(true);
  };
  
  // Handler for sending a quote
  const handleSendQuote = (quote: Quote) => {
    // Only allow sending of draft quotes or resending of awaiting acceptance quotes
    if (!['draft', 'pending_validation', 'awaiting_acceptance'].includes(quote.status)) {
      toast({
        title: t('quotes.sendError'),
        description: t('quotes.sendErrorDesc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedQuote(quote);
    setIsSendOpen(true);
  };
  
  // Handler for converting a quote to an invoice
  const handleConvertQuote = (quote: Quote) => {
    // Only allow conversion of quotes that are in 'accepted' status
    if (quote.status !== 'accepted') {
      toast({
        title: t('quotes.conversionError'),
        description: t('quotes.conversionErrorDesc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedQuote(quote);
    setIsConvertOpen(true);
  };
  
  // Handler for duplicating a quote
  const handleDuplicateQuote = (quote: Quote) => {
    // Create a new quote based on the selected one
    const newQuote: Quote = {
      ...quote,
      id: `dup-${quote.id}`,
      quoteNumber: `${quote.quoteNumber}-DUP`,
      date: new Date().toISOString(),
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      status: 'draft' as QuoteStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      convertedInvoiceId: undefined,
    };
    
    // Add the new quote to the list
    setQuotes([newQuote, ...quotes]);
    
    toast({
      title: t('quotes.duplicateToast'),
      description: `${t('quotes.duplicateToastDesc')} ${quote.quoteNumber}`
    });
  };
  
  // Handler for deleting a quote
  const handleDeleteQuote = (quote: Quote) => {
    // Prevent deletion of converted quotes
    if (quote.status === 'converted') {
      toast({
        title: t('quotes.deleteError'),
        description: t('quotes.deleteErrorDesc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedQuote(quote);
    setIsDeleteOpen(true);
  };
  
  // Handler for submitting a quote for validation
  const handleSubmitForValidation = (quote: Quote) => {
    // Only allow submission of draft quotes
    if (quote.status !== 'draft') {
      toast({
        title: t('quotes.validationError'),
        description: t('quotes.validationErrorDesc'),
        variant: 'destructive'
      });
      return;
    }
    
    // Update the quote status
    const updatedQuotes = quotes.map(q => {
      if (q.id === quote.id) {
        return {
          ...q,
          status: 'pending_validation' as QuoteStatus,
          needsValidation: true,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    
    setQuotes(updatedQuotes);
    
    toast({
      title: t('quotes.validationSubmitted'),
      description: t('quotes.validationSubmittedDesc'),
    });
  };
  
  // Handler for opening the validation dialog
  const handleValidateQuote = (quote: Quote) => {
    if (quote.status !== 'pending_validation') {
      toast({
        title: t('quotes.cannotValidate'),
        description: t('quotes.cannotValidateDesc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedQuote(quote);
    setIsValidationOpen(true);
  };
  
  // Handlers for validation dialog actions
  const handleApproveValidation = (data: any) => {
    if (!selectedQuote) return;
    
    const updatedQuotes = quotes.map(q => {
      if (q.id === selectedQuote.id) {
        return {
          ...q,
          status: 'draft' as QuoteStatus, // Return to draft so it can be sent
          needsValidation: false,
          validatedById: 'current-user', // Replace with actual user ID
          validatedAt: new Date().toISOString(),
          notes: data.notes ? `${q.notes || ''}\n\nValidation Notes: ${data.notes}` : q.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    
    setQuotes(updatedQuotes);
    setIsValidationOpen(false);
    
    toast({
      title: t('quotes.quoteApproved'),
      description: t('quotes.quoteApprovedDesc'),
    });
  };
  
  const handleRejectValidation = (data: any) => {
    if (!selectedQuote) return;
    
    const updatedQuotes = quotes.map(q => {
      if (q.id === selectedQuote.id) {
        return {
          ...q,
          status: 'draft' as QuoteStatus, // Return to draft for corrections
          needsValidation: false,
          notes: data.notes ? `${q.notes || ''}\n\nRejection Notes: ${data.notes}` : q.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    
    setQuotes(updatedQuotes);
    setIsValidationOpen(false);
    
    toast({
      title: t('quotes.quoteRejected'),
      description: t('quotes.quoteRejectedDesc'),
      variant: 'destructive'
    });
  };
  
  // Handler for reminder configuration
  const handleConfigureReminder = (quote: Quote) => {
    // Only allow reminder configuration for quotes that are in 'awaiting_acceptance' status
    if (quote.status !== 'awaiting_acceptance') {
      toast({
        title: t('quotes.reminderError'),
        description: t('quotes.reminderErrorDesc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedQuote(quote);
    setIsReminderOpen(true);
  };
  
  // Handler for saving reminder settings
  const handleSaveReminder = (data: any) => {
    if (!selectedQuote) return;
    
    const updatedQuotes = quotes.map(q => {
      if (q.id === selectedQuote.id) {
        // Calculate next reminder date based on settings
        let nextReminderDate: string | undefined;
        
        if (data.enabled) {
          const expiryDate = new Date(q.expiryDate);
          const reminderDate = new Date(expiryDate);
          reminderDate.setDate(expiryDate.getDate() - data.days);
          
          // If the reminder date is in the future, set it as the next reminder date
          if (reminderDate > new Date()) {
            nextReminderDate = reminderDate.toISOString();
          }
        }
        
        return {
          ...q,
          reminderEnabled: data.enabled,
          reminderDays: data.days,
          nextReminderDate: nextReminderDate,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    
    setQuotes(updatedQuotes);
    setIsReminderOpen(false);
    
    toast({
      title: t('quotes.reminderSaved'),
      description: t('quotes.reminderSavedDesc'),
    });
  };
  
  // Form submission handlers
  const handleQuoteFormSubmit = (data: any) => {
    if (isCreateForm) {
      // Generate a new quote ID and number
      const newId = `quote-${Date.now()}`;
      const nextNumber = quotes.length + 1;
      const year = new Date().getFullYear();
      const newQuoteNumber = `DEV-${year}-${String(nextNumber).padStart(4, '0')}`;
      
      // Create a new quote object
      const newQuote: Quote = {
        id: newId,
        companyId: '101', // Using a default company ID
        clientId: data.clientId,
        quoteNumber: newQuoteNumber,
        date: data.date.toISOString(),
        expiryDate: data.expiryDate.toISOString(),
        status: 'draft',
        items: data.items,
        subtotal: data.subtotal,
        vatAmount: data.vatAmount,
        discount: data.discountTotal,
        total: data.total,
        notes: data.notes,
        terms: data.paymentTerms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add the new quote to the list
      setQuotes([newQuote, ...quotes]);
      
      toast({
        title: t('quotes.createToast'),
        description: t('quotes.createToastDesc')
      });
    } else if (selectedQuote) {
      // Update the existing quote
      const updatedQuotes = quotes.map(q => {
        if (q.id === selectedQuote.id) {
          return {
            ...q,
            clientId: data.clientId,
            date: data.date.toISOString(),
            expiryDate: data.expiryDate.toISOString(),
            items: data.items,
            subtotal: data.subtotal,
            vatAmount: data.vatAmount,
            discount: data.discountTotal,
            total: data.total,
            notes: data.notes,
            terms: data.paymentTerms,
            updatedAt: new Date().toISOString(),
          };
        }
        return q;
      });
      
      setQuotes(updatedQuotes);
      
      toast({
        title: t('quotes.updateToast'),
        description: t('quotes.updateToastDesc')
      });
    }
    
    setIsFormOpen(false);
  };
  
  const handleSendFormSubmit = (data: any) => {
    if (selectedQuote) {
      // Update the status to 'awaiting_acceptance' if it was in 'draft' or 'pending_validation' status
      const updatedQuotes = quotes.map(q => {
        if (q.id === selectedQuote.id) {
          return {
            ...q,
            status: 'awaiting_acceptance' as QuoteStatus,
            lastEmailSentAt: new Date().toISOString(),
            emailRecipients: [data.emailTo],
            emailCc: data.emailCc ? [data.emailCc] : [],
            emailHistory: [
              ...(q.emailHistory || []),
              {
                id: `email-${Date.now()}`,
                quoteId: q.id,
                sentAt: new Date().toISOString(),
                sentBy: 'current-user', // Replace with actual user ID in real implementation
                recipients: [data.emailTo],
                cc: data.emailCc ? [data.emailCc] : [],
                subject: data.subject,
                message: data.message,
                status: 'sent' as 'sent' | 'failed' | 'opened' | 'responded',
              }
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return q;
      });
      
      setQuotes(updatedQuotes);
      setIsSendOpen(false);
      
      toast({
        title: t('quotes.sendSuccess'),
        description: t('quotes.sendSuccessDesc')
      });
    }
  };
  
  const handleConvertFormSubmit = (data: any) => {
    if (!selectedQuote) return;
    
    // Generate a new invoice ID and number
    const newId = `invoice-${Date.now()}`;
    const nextNumber = mockInvoices.length + 1;
    const year = new Date().getFullYear();
    const newInvoiceNumber = `FACT-${year}-${String(nextNumber).padStart(4, '0')}`;
    
    // Update the quote status to 'converted'
    const updatedQuotes = quotes.map(q => {
      if (q.id === selectedQuote.id) {
        return {
          ...q,
          status: 'converted' as QuoteStatus,
          convertedInvoiceId: newInvoiceNumber,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    
    setQuotes(updatedQuotes);
    
    toast({
      title: t('quotes.convertSuccess'),
      description: `${t('quotes.convertSuccessDesc')} ${newInvoiceNumber}`
    });
    
    // If deposit invoice was requested, show another toast
    if (data.generateDeposit) {
      toast({
        title: t('quotes.depositCreated'),
        description: `${t('quotes.depositCreatedDesc')} ${formatCurrency(data.depositAmount)}`
      });
    }
    
    setIsConvertOpen(false);
    // Close the details dialog as well
    setIsDetailsOpen(false);
  };
  
  const handleConfirmDelete = () => {
    if (!selectedQuote) return;
    
    // Remove the quote from the list
    setQuotes(quotes.filter(q => q.id !== selectedQuote.id));
    
    toast({
      title: t('quotes.deleteToast'),
      description: `${t('quotes.deleteToastDesc')} ${selectedQuote.quoteNumber}`
    });
    
    setIsDeleteOpen(false);
    // Close the details dialog as well
    setIsDetailsOpen(false);
  };

  const handleResetFilters = () => {
    setFilterStatus(null);
    setFilterClient(null);
    setFilterDateRange({ from: null, to: null });
  };
  
  // Define table columns
  const columns: Column<Quote>[] = [
    {
      header: t('quotes.numberColumn'),
      accessorKey: 'quoteNumber',
      enableSorting: true,
      cellClassName: 'font-medium'
    },
    {
      header: t('quotes.clientColumn'),
      accessorKey: 'clientId',
      enableSorting: true,
      cell: (quote) => {
        const client = getClientById(quote.clientId);
        return client?.name || t('quotes.unknownClient');
      }
    },
    {
      header: t('quotes.dateColumn'),
      accessorKey: 'date',
      enableSorting: true,
      cell: (quote) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {formatDate(quote.date)}
        </div>
      )
    },
    {
      header: t('quotes.expiryColumn'),
      accessorKey: 'expiryDate',
      enableSorting: true,
      cell: (quote) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {formatDate(quote.expiryDate)}
        </div>
      )
    },
    {
      header: t('quotes.totalColumn'),
      accessorKey: 'total',
      enableSorting: true,
      cell: (quote) => formatCurrency(quote.total)
    },
    {
      header: t('quotes.statusColumn'),
      accessorKey: 'status',
      enableSorting: true,
      cell: (quote) => (
        <StatusBadge status={quote.status} type="quote" />
      )
    },
    {
      header: t('quotes.actions'),
      accessorKey: 'id',
      cell: (quote) => {
        const actions: ActionItem[] = [
          {
            label: t('form.view'),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewQuote(quote)
          },
          {
            label: t('form.edit'),
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEditQuote(quote),
            // Only allow editing of draft or awaiting acceptance quotes
            disabled: !['draft', 'pending_validation', 'awaiting_acceptance'].includes(quote.status)
          },
          {
            label: t('quotes.send'),
            icon: <SendHorizontal className="h-4 w-4" />,
            onClick: () => handleSendQuote(quote),
            // Only allow sending of draft or awaiting acceptance quotes
            disabled: !['draft', 'pending_validation', 'awaiting_acceptance'].includes(quote.status) || 
                     (quote.status === 'draft' && quote.needsValidation === true)
          },
          {
            label: t('quotes.configureReminder'),
            icon: <Bell className="h-4 w-4" />,
            onClick: () => handleConfigureReminder(quote),
            // Only show for awaiting acceptance quotes
            hidden: quote.status !== 'awaiting_acceptance'
          },
          {
            label: t('quotes.submitForValidation'),
            icon: <ClipboardCheck className="h-4 w-4" />,
            onClick: () => handleSubmitForValidation(quote),
            // Only show for draft quotes
            hidden: quote.status !== 'draft'
          },
          {
            label: t('quotes.validateQuote'),
            icon: <FileCheck className="h-4 w-4" />,
            onClick: () => handleValidateQuote(quote),
            // Only show for quotes pending validation
            hidden: quote.status !== 'pending_validation'
          },
          {
            label: t('quotes.convert'),
            icon: <FilePieChart className="h-4 w-4" />,
            onClick: () => handleConvertQuote(quote),
            // Only allow conversion of quotes that are in 'accepted' status
            disabled: quote.status !== 'accepted'
          },
          {
            label: t('quotes.duplicate'),
            icon: <Copy className="h-4 w-4" />,
            onClick: () => handleDuplicateQuote(quote)
          },
          {
            label: t('form.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => handleDeleteQuote(quote),
            // Only allow deletion of non-converted quotes
            disabled: quote.status === 'converted',
            className: 'text-destructive'
          }
        ];
        
        return <TableActions actions={actions} label={t('common.actions')} />;
      },
      className: 'text-center',
      cellClassName: 'text-center'
    }
  ];
  
  // Get counts for each status
  const getStatusCounts = () => {
    const counts = {
      draft: 0,
      pending_validation: 0,
      awaiting_acceptance: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      converted: 0,
      total: quotes.length
    };
    
    quotes.forEach(quote => {
      if (counts.hasOwnProperty(quote.status)) {
        counts[quote.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();
  
  // Define status cards
  const statusCards = [
    {
      title: t('quotes.draftStatus'),
      count: statusCounts.draft,
      icon: <FileMinus className="h-8 w-8 text-gray-500" />,
      className: 'bg-gray-50 border-gray-200'
    },
    {
      title: t('quotes.pendingValidationStatus'),
      count: statusCounts.pending_validation,
      icon: <FileText className="h-8 w-8 text-yellow-500" />,
      className: 'bg-yellow-50 border-yellow-200'
    },
    {
      title: t('quotes.awaitingAcceptanceStatus'),
      count: statusCounts.awaiting_acceptance,
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      className: 'bg-blue-50 border-blue-200'
    },
    {
      title: t('quotes.acceptedStatus'),
      count: statusCounts.accepted,
      icon: <FileCheck className="h-8 w-8 text-green-500" />,
      className: 'bg-green-50 border-green-200'
    },
    {
      title: t('quotes.rejectedStatus'),
      count: statusCounts.rejected,
      icon: <FileX className="h-8 w-8 text-red-500" />,
      className: 'bg-red-50 border-red-200'
    }
  ];
  
  // Calculate conversion rate
  const calculateConversionRate = () => {
    const totalSent = statusCounts.awaiting_acceptance + statusCounts.accepted + statusCounts.rejected + statusCounts.expired + statusCounts.converted;
    const totalConverted = statusCounts.converted;
    
    if (totalSent === 0) return 0;
    return (totalConverted / totalSent) * 100;
  };
  
  const conversionRate = calculateConversionRate();
  
  // Check for upcoming reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const reminderDue = quotes.filter(quote => {
        if (!quote.reminderEnabled || !quote.nextReminderDate) return false;
        const reminderDate = new Date(quote.nextReminderDate);
        return reminderDate <= now && quote.status === 'awaiting_acceptance';
      });
      
      if (reminderDue.length > 0) {
        // In a real application, this would send actual reminder emails
        // Here we'll just log to console and show a toast
        console.log('Reminders due for quotes:', reminderDue.map(q => q.quoteNumber));
        
        // Update quotes to mark reminders as sent
        const updatedQuotes = quotes.map(q => {
          if (reminderDue.some(rq => rq.id === q.id)) {
            // Create a new email history entry for the reminder
            const emailHistoryEntry: EmailHistoryEntry = {
              id: `email-reminder-${Date.now()}-${q.id}`,
              quoteId: q.id,
              sentAt: new Date().toISOString(),
              sentBy: 'system', // Sent by the system
              recipients: q.emailRecipients || [],
              subject: t('quotes.reminderEmailSubject'),
              message: t('quotes.reminderEmailMessage'),
              status: 'sent' as 'sent' | 'failed' | 'opened' | 'responded',
            };
            
            // Calculate the next reminder date (if enabled and expiry date is in the future)
            let nextReminderDate: string | undefined = undefined;
            if (q.reminderEnabled && new Date(q.expiryDate) > now) {
              // For simplicity, schedule the next reminder in 7 days
              // In a real app, this would be more sophisticated
              const next = new Date();
              next.setDate(now.getDate() + 7);
              nextReminderDate = next.toISOString();
            }
            
            return {
              ...q,
              lastEmailSentAt: new Date().toISOString(),
              emailHistory: [...(q.emailHistory || []), emailHistoryEntry],
              nextReminderDate,
            };
          }
          return q;
        });
        
        setQuotes(updatedQuotes);
        
        // Show toast notification
        toast({
          title: t('quotes.remindersSent'),
          description: t('quotes.remindersSentDesc'),
        });
      }
    };
    
    // Check for reminders when the component loads
    if (!isLoading) {
      checkReminders();
    }
    
    // Set up an interval to check for reminders
    // In a real app, this would be handled by a backend service
    const interval = setInterval(checkReminders, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [quotes, isLoading, toast, t]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="quotes.title"
        description="quotes.pageDescription"
        action={{
          label: "quotes.add",
          onClick: handleAddQuote
        }}
      />
      
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-[150px] w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statusCards.map((card, index) => (
              <Card key={index} className={`${card.className} shadow-sm`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    {card.title}
                    <span>{card.icon}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{card.count}</p>
                </CardContent>
              </Card>
            ))}
            
            {/* Conversion Rate Card */}
            <Card className="bg-amber-50 border-amber-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  {t('quotes.conversionRate')}
                  <span><FilePieChart className="h-8 w-8 text-amber-500" /></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <QuoteFilters 
            statusFilter={filterStatus || 'all'}
            setStatusFilter={(status) => setFilterStatus(status === 'all' ? null : status)}
            clientFilter={filterClient || 'all'}
            setClientFilter={(clientId) => setFilterClient(clientId === 'all' ? null : clientId)}
            dateFilter={filterDateRange}
            setDateFilter={setFilterDateRange}
            onResetFilters={handleResetFilters}
          />
          
          {/* Quotes Table */}
          <DataTable
            data={filteredQuotes}
            columns={columns}
            searchPlaceholder={t('quotes.search')}
            searchKey="quoteNumber"
            noResultsMessage={t('quotes.noResults')}
            noDataMessage={t('quotes.emptyState')}
            title={t('quotes.recentTitle')}
            initialSortField="date"
            initialSortDirection="desc"
            onRowClick={handleViewQuote}
            cardClassName="shadow-sm"
          />
          
          {/* Quote Details Dialog */}
          {isDetailsOpen && selectedQuote && (
            <QuoteDetailsDialog
              quote={selectedQuote}
              open={isDetailsOpen}
              onOpenChange={setIsDetailsOpen}
              onEdit={() => handleEditQuote(selectedQuote)}
              onSend={() => handleSendQuote(selectedQuote)}
              onConvert={() => handleConvertQuote(selectedQuote)}
              onDuplicate={() => handleDuplicateQuote(selectedQuote)}
              onDelete={() => handleDeleteQuote(selectedQuote)}
            />
          )}
          
          {/* Quote Form Dialog */}
          <QuoteFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={handleQuoteFormSubmit}
            quote={isCreateForm ? undefined : selectedQuote}
            isEditing={!isCreateForm}
          />
          
          {/* Send Quote Dialog */}
          <SendQuoteDialog
            open={isSendOpen}
            onOpenChange={setIsSendOpen}
            onSend={handleSendFormSubmit}
            quote={selectedQuote}
          />
          
          {/* Convert Quote Dialog */}
          <ConvertQuoteDialog
            open={isConvertOpen}
            onOpenChange={setIsConvertOpen}
            onConvert={handleConvertFormSubmit}
            quote={selectedQuote}
          />
          
          {/* Delete Quote Dialog */}
          <DeleteQuoteDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onDelete={handleConfirmDelete}
            quote={selectedQuote}
          />
          
          {/* Validation Dialog */}
          {isValidationOpen && selectedQuote && (
            <QuoteValidationDialog
              quote={selectedQuote}
              open={isValidationOpen}
              onOpenChange={setIsValidationOpen}
              onValidate={handleApproveValidation}
              onReject={handleRejectValidation}
            />
          )}
          
          {/* Reminder Dialog */}
          {isReminderOpen && selectedQuote && (
            <QuoteReminderDialog
              quote={selectedQuote}
              open={isReminderOpen}
              onOpenChange={setIsReminderOpen}
              onSave={handleSaveReminder}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Quotes;
