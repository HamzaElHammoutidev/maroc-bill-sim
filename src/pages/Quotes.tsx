
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  SendHorizontal
} from 'lucide-react';
import { mockQuotes, mockInvoices, Quote, getClientById, QuoteStatus } from '@/data/mockData';
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

const Quotes = () => {
  const { t } = useLanguage();
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
    // Only allow editing of draft or sent quotes
    if (!['draft', 'sent'].includes(quote.status)) {
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
    // Only allow sending of draft quotes or resending of sent quotes
    if (!['draft', 'sent'].includes(quote.status)) {
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
    if (!selectedQuote) return;
    
    // Update the status to 'sent' if it was in 'draft' status
    if (selectedQuote.status === 'draft') {
      const updatedQuotes = quotes.map(q => {
        if (q.id === selectedQuote.id) {
          return {
            ...q,
            status: 'sent' as QuoteStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return q;
      });
      
      setQuotes(updatedQuotes);
      setSelectedQuote({
        ...selectedQuote,
        status: 'sent',
        updatedAt: new Date().toISOString(),
      });
    }
    
    toast({
      title: t('quotes.sendSuccess'),
      description: t('quotes.sendSuccessDesc')
    });
    
    setIsSendOpen(false);
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

  const handleApplyFilters = (filters: {
    status: string | null;
    clientId: string | null;
    dateRange: { from: Date | null; to: Date | null };
  }) => {
    setFilterStatus(filters.status);
    setFilterClient(filters.clientId);
    setFilterDateRange(filters.dateRange);
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
            // Only allow editing of draft or sent quotes
            disabled: !['draft', 'sent'].includes(quote.status)
          },
          {
            label: t('quotes.send'),
            icon: <SendHorizontal className="h-4 w-4" />,
            onClick: () => handleSendQuote(quote),
            // Only allow sending of draft or sent quotes
            disabled: !['draft', 'sent'].includes(quote.status)
          },
          {
            label: t('quotes.convert'),
            icon: <FilePieChart className="h-4 w-4" />,
            onClick: () => handleConvertQuote(quote),
            // Only allow conversion of accepted quotes
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
      sent: 0,
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
      title: t('quotes.sentStatus'),
      count: statusCounts.sent,
      icon: <FileText className="h-8 w-8 text-purple-500" />,
      className: 'bg-purple-50 border-purple-200'
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
    const totalSent = statusCounts.sent + statusCounts.accepted + statusCounts.rejected + statusCounts.expired + statusCounts.converted;
    const totalConverted = statusCounts.converted;
    
    if (totalSent === 0) return 0;
    return (totalConverted / totalSent) * 100;
  };
  
  const conversionRate = calculateConversionRate();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="quotes.title"
        description="quotes.description"
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
            onApplyFilters={handleApplyFilters}
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
          <QuoteDetailsDialog
            quote={selectedQuote}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            onEdit={selectedQuote ? () => handleEditQuote(selectedQuote) : undefined}
            onSend={selectedQuote ? () => handleSendQuote(selectedQuote) : undefined}
            onConvert={selectedQuote ? () => handleConvertQuote(selectedQuote) : undefined}
            onDuplicate={selectedQuote ? () => handleDuplicateQuote(selectedQuote) : undefined}
            onDelete={selectedQuote ? () => handleDeleteQuote(selectedQuote) : undefined}
          />
          
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
        </>
      )}
    </div>
  );
};

export default Quotes;
