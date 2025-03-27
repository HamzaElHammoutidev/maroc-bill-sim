
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Payments = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddPayment = () => {
    toast({
      title: t('payments.addToast'),
      description: t('payments.addToastDesc'),
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="payments.title"
        description="payments.description"
        action={{
          label: "payments.add",
          onClick: handleAddPayment
        }}
      />
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t('payments.tabs.all')}</TabsTrigger>
          <TabsTrigger value="pending">{t('payments.tabs.pending')}</TabsTrigger>
          <TabsTrigger value="completed">{t('payments.tabs.completed')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[80px] w-full rounded-lg" />
              <Skeleton className="h-[80px] w-full rounded-lg" />
              <Skeleton className="h-[80px] w-full rounded-lg" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('payments.allTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('payments.emptyState')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('payments.pendingTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('payments.emptyState')}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('payments.completedTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('payments.emptyState')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payments;
