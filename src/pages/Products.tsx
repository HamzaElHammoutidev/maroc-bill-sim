
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddProduct = () => {
    toast({
      title: t('products.addToast'),
      description: t('products.addToastDesc'),
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="products.title"
        description="products.description"
        action={{
          label: "products.add",
          onClick: handleAddProduct
        }}
      />
      
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground">{t('products.emptyState')}</p>
        </div>
      )}
    </div>
  );
};

export default Products;
