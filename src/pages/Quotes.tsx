
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
  FileMinus
} from 'lucide-react';
import { mockQuotes, Quote, getClientById } from '@/data/mockData';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import QuoteFilters from '@/components/quotes/QuoteFilters';
import QuoteDetailsDialog from '@/components/quotes/QuoteDetailsDialog';

const Quotes = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
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
  
  const handleAddQuote = () => {
    toast({
      title: t('quotes.addToast'),
      description: t('quotes.addToastDesc'),
    });
  };
  
  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsDetailsOpen(true);
  };
  
  const handleEditQuote = (quote: Quote) => {
    toast({
      title: t('quotes.editToast'),
      description: `${t('quotes.editToastDesc')} ${quote.quoteNumber}`
    });
  };
  
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
    
    toast({
      title: t('quotes.convertToast'),
      description: `${t('quotes.convertToastDesc')} ${quote.quoteNumber}`
    });
  };
  
  const handleDuplicateQuote = (quote: Quote) => {
    toast({
      title: t('quotes.duplicateToast'),
      description: `${t('quotes.duplicateToastDesc')} ${quote.quoteNumber}`
    });
  };
  
  const handleDeleteQuote = (quote: Quote) => {
    toast({
      title: t('quotes.deleteToast'),
      description: `${t('quotes.deleteToastDesc')} ${quote.quoteNumber}`
    });
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            onConvert={selectedQuote ? () => handleConvertQuote(selectedQuote) : undefined}
            onDuplicate={selectedQuote ? () => handleDuplicateQuote(selectedQuote) : undefined}
            onDelete={selectedQuote ? () => handleDeleteQuote(selectedQuote) : undefined}
          />
        </>
      )}
    </div>
  );
};

export default Quotes;
