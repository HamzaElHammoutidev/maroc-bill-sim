
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { FileText, Calendar, Edit, Trash, Eye, FileCheck, FilePieChart } from 'lucide-react';
import { mockQuotes, Quote, getClientById } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';

const Quotes = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setQuotes(mockQuotes);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAddQuote = () => {
    toast({
      title: t('quotes.addToast'),
      description: t('quotes.addToastDesc'),
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            onClick: () => {
              toast({
                title: t('quotes.viewToast'),
                description: `${t('quotes.viewToastDesc')} ${quote.quoteNumber}`
              });
            }
          },
          {
            label: t('form.edit'),
            icon: <Edit className="h-4 w-4" />,
            onClick: () => {
              toast({
                title: t('quotes.editToast'),
                description: `${t('quotes.editToastDesc')} ${quote.quoteNumber}`
              });
            }
          },
          {
            label: t('quotes.convert'),
            icon: <FilePieChart className="h-4 w-4" />,
            onClick: () => {
              toast({
                title: t('quotes.convertToast'),
                description: `${t('quotes.convertToastDesc')} ${quote.quoteNumber}`
              });
            }
          },
          {
            label: t('form.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => {
              toast({
                title: t('quotes.deleteToast'),
                description: `${t('quotes.deleteToastDesc')} ${quote.quoteNumber}`
              });
            },
            className: 'text-destructive'
          }
        ];
        
        return <TableActions actions={actions} label={t('common.actions')} />;
      },
      className: 'text-center',
      cellClassName: 'text-center'
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
        <DataTable
          data={quotes}
          columns={columns}
          searchPlaceholder={t('quotes.search')}
          searchKey="quoteNumber"
          noResultsMessage={t('quotes.noResults')}
          noDataMessage={t('quotes.emptyState')}
          title={t('quotes.recentTitle')}
          initialSortField="date"
          initialSortDirection="desc"
          onRowClick={null}
          cardClassName="shadow-sm"
        />
      )}
    </div>
  );
};

export default Quotes;
