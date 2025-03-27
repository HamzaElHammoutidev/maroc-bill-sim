
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Quotes = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddQuote = () => {
    toast({
      title: t('quotes.addToast'),
      description: t('quotes.addToastDesc'),
    });
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
            <CardTitle>{t('quotes.recentTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('quotes.emptyState')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Quotes;
