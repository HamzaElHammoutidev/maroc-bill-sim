
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, BarChart3, PieChart, Download, Share, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Reports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [reportType, setReportType] = useState("sales");
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('reports.title')}
        description={t('reports.description')}
        icon={<LineChart className="h-4 w-4" />}
      />
      
      <Card className="mb-8 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder={t('reports.select_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">{t('reports.types.sales')}</SelectItem>
                <SelectItem value="clients">{t('reports.types.clients')}</SelectItem>
                <SelectItem value="products">{t('reports.types.products')}</SelectItem>
                <SelectItem value="invoices">{t('reports.types.invoices')}</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('reports.refresh')}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t('reports.export')}
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                {t('reports.share')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              {t(`reports.${reportType}_title`)}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">{t('reports.chart_placeholder')}</p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-muted-foreground" />
                {t('reports.summary_title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('reports.summary_placeholder')}</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                {t('reports.trends_title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('reports.trends_placeholder')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
