
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Reports = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState("sales");
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="reports.title"
        description="reports.description"
      />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder={t('reports.selectType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">{t('reports.types.sales')}</SelectItem>
            <SelectItem value="clients">{t('reports.types.clients')}</SelectItem>
            <SelectItem value="products">{t('reports.types.products')}</SelectItem>
            <SelectItem value="invoices">{t('reports.types.invoices')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t(`reports.${reportType}Title`)}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">{t('reports.chartPlaceholder')}</p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.summaryTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('reports.summaryPlaceholder')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.trendsTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('reports.trendsPlaceholder')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
