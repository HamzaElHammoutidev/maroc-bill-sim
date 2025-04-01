import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTaxReportById, getTaxById, getInvoiceById, Invoice } from '@/data/mockData';
import { formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Download, Printer, FileText, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TaxReportDetailProps {
  reportId: string;
  onClose: () => void;
}

const TaxReportDetail: React.FC<TaxReportDetailProps> = ({ reportId, onClose }) => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const report = getTaxReportById(reportId);
  
  useEffect(() => {
    if (report) {
      // Get all included invoices
      const invoiceList = report.invoiceIds
        .map(id => getInvoiceById(id))
        .filter(invoice => invoice !== undefined) as Invoice[];
      
      setInvoices(invoiceList);
    }
  }, [report]);
  
  if (!report) {
    return (
      <div className="text-center p-4">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="font-semibold mb-1">{t('taxes.report_not_found')}</h3>
        <p className="text-muted-foreground">{t('taxes.report_not_found_desc')}</p>
      </div>
    );
  }
  
  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  // Get status badge variant
  const getStatusBadge = () => {
    switch (report.status) {
      case 'draft':
        return <Badge variant="outline">{t('taxes.status_draft')}</Badge>;
      case 'generated':
        return <Badge variant="secondary">{t('taxes.status_generated')}</Badge>;
      case 'submitted':
        return <Badge variant="default">{t('taxes.status_submitted')}</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{report.name}</h2>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <span>{formatDate(report.startDate)}</span>
            <span>-</span>
            <span>{formatDate(report.endDate)}</span>
            {getStatusBadge()}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            {t('common.print')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('common.download')}
          </Button>
          {report.status === 'generated' && (
            <Button size="sm">
              <Check className="h-4 w-4 mr-2" />
              {t('taxes.mark_as_submitted')}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('taxes.total_vat')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(report.totalVat)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('taxes.total_invoices')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('taxes.report_date')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{formatDate(report.createdAt)}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('taxes.vat_breakdown')}</CardTitle>
          <CardDescription>{t('taxes.vat_breakdown_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(report.vatByRate).map(([rate, amount]) => (
              <div key={rate} className="flex justify-between items-center">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {rate}%
                  </Badge>
                  <span>{t('taxes.vat_rate')} {rate}%</span>
                </div>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between items-center font-bold">
              <span>{t('taxes.total_vat')}</span>
              <span>{formatCurrency(report.totalVat)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('taxes.included_invoices')}</CardTitle>
          <CardDescription>{t('taxes.included_invoices_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4 font-medium text-sm text-muted-foreground">
                <div>{t('invoices.number')}</div>
                <div>{t('invoices.date')}</div>
                <div>{t('clients.name')}</div>
                <div className="text-right">{t('invoices.total')}</div>
                <div className="text-right">{t('invoices.vat')}</div>
                <div>{t('invoices.status')}</div>
              </div>
              
              <Separator />
              
              {invoices.map(invoice => (
                <div key={invoice.id} className="grid grid-cols-6 gap-4 text-sm items-center">
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                  <div>{formatDate(invoice.date)}</div>
                  <div className="truncate">{invoice.clientId}</div> {/* In a real app, get client name */}
                  <div className="text-right">{formatCurrency(invoice.total)}</div>
                  <div className="text-right">{formatCurrency(invoice.vatAmount)}</div>
                  <div>
                    <Badge 
                      variant={
                        invoice.status === 'paid' ? 'default' :
                        invoice.status === 'overdue' ? 'destructive' :
                        invoice.status === 'cancelled' ? 'destructive' :
                        'secondary'
                      }
                      className="capitalize"
                    >
                      {t(`invoices.status_${invoice.status}`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p>{t('taxes.no_invoices_found')}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {t('taxes.total_invoices')}: {invoices.length}
          </div>
          <div className="text-sm font-medium">
            {t('taxes.total_vat')}: {formatCurrency(report.totalVat)}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaxReportDetail; 