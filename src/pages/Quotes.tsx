
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar } from 'lucide-react';
import { mockQuotes, Quote, getClientById } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>{t('quotes.recentTitle')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quotes.length === 0 ? (
              <p className="text-muted-foreground">{t('quotes.emptyState')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('quotes.numberColumn')}</TableHead>
                      <TableHead>{t('quotes.clientColumn')}</TableHead>
                      <TableHead>{t('quotes.dateColumn')}</TableHead>
                      <TableHead>{t('quotes.expiryColumn')}</TableHead>
                      <TableHead>{t('quotes.totalColumn')}</TableHead>
                      <TableHead>{t('quotes.statusColumn')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => {
                      const client = getClientById(quote.clientId);
                      return (
                        <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                          <TableCell>{client?.name || t('quotes.unknownClient')}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(quote.date)}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(quote.expiryDate)}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(quote.total)}</TableCell>
                          <TableCell>
                            <StatusBadge status={quote.status} type="quote" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Quotes;
