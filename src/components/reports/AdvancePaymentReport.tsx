import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileBarChart, RefreshCw } from 'lucide-react';
import { getAdvancePaymentReport, AdvancePaymentReportItem, mockClients } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface AdvancePaymentReportProps {
  companyId: string;
}

const AdvancePaymentReport: React.FC<AdvancePaymentReportProps> = ({ companyId }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [reportItems, setReportItems] = useState<AdvancePaymentReportItem[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  
  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  
  // Statistics
  const [totalAdvancePayments, setTotalAdvancePayments] = useState<number>(0);
  const [totalRemainingAmount, setTotalRemainingAmount] = useState<number>(0);
  const [avgAdvancePercentage, setAvgAdvancePercentage] = useState<number>(0);
  
  useEffect(() => {
    loadData();
  }, [companyId, dateRange, clientFilter, statusFilter]);
  
  const loadData = () => {
    setIsLoading(true);
    
    // Load clients for filter
    const clientList = mockClients.filter(client => client.companyId === companyId);
    setClients(clientList.map(client => ({ id: client.id, name: client.name })));
    
    // Prepare filters
    const filters = {
      clientId: clientFilter !== 'all' ? clientFilter : undefined,
      startDate: dateRange.from ? dateRange.from.toISOString() : undefined,
      endDate: dateRange.to ? dateRange.to.toISOString() : undefined,
      status: statusFilter.length > 0 ? statusFilter : undefined
    };
    
    // Get report data
    const data = getAdvancePaymentReport(companyId, filters);
    setReportItems(data);
    
    // Calculate statistics
    const total = data.reduce((sum, item) => sum + item.total, 0);
    const remaining = data.reduce((sum, item) => sum + item.remainingAmount, 0);
    const avgPercentage = data.length > 0 
      ? data.reduce((sum, item) => sum + item.depositPercentage, 0) / data.length 
      : 0;
    
    setTotalAdvancePayments(total);
    setTotalRemainingAmount(remaining);
    setAvgAdvancePercentage(avgPercentage);
    
    setIsLoading(false);
  };
  
  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setClientFilter('all');
    setStatusFilter([]);
  };
  
  const handleExport = () => {
    // In a real application, this would generate a CSV or PDF
    console.log('Exporting advance payment report');
  };
  
  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'partial':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  const renderStatusFilter = () => {
    const statuses = ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'];
    
    return (
      <div className="flex flex-wrap gap-2">
        {statuses.map(status => (
          <Badge 
            key={status}
            variant={statusFilter.includes(status) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              setStatusFilter(prev => 
                prev.includes(status) 
                  ? prev.filter(s => s !== status)
                  : [...prev, status]
              );
            }}
          >
            {t(`invoices.status_${status}`)}
          </Badge>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('reports.advance_payments.title')}</CardTitle>
          <CardDescription>{t('reports.advance_payments.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
              
              <Select
                value={clientFilter}
                onValueChange={setClientFilter}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={t('reports.advance_payments.select_client')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all_clients')}</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('common.reset')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.export')}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="pt-2">{renderStatusFilter()}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">
                    {t('reports.advance_payments.total_advance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(totalAdvancePayments)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">
                    {t('reports.advance_payments.total_remaining')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(totalRemainingAmount)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">
                    {t('reports.advance_payments.avg_percentage')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{avgAdvancePercentage.toFixed(2)}%</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{t('reports.advance_payments.list_title')}</CardTitle>
            </div>
            <Badge variant="outline">
              {reportItems.length} {t('reports.advance_payments.items_found')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {reportItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {isLoading 
                ? t('common.loading') 
                : t('reports.advance_payments.no_data')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('invoices.number')}</TableHead>
                    <TableHead>{t('invoices.client')}</TableHead>
                    <TableHead>{t('invoices.date')}</TableHead>
                    <TableHead className="text-right">{t('reports.advance_payments.amount')}</TableHead>
                    <TableHead className="text-right">{t('reports.advance_payments.percentage')}</TableHead>
                    <TableHead>{t('reports.advance_payments.main_invoice')}</TableHead>
                    <TableHead className="text-right">{t('reports.advance_payments.remaining')}</TableHead>
                    <TableHead>{t('invoices.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.depositInvoiceNumber}</TableCell>
                      <TableCell>{item.clientName || t('invoices.unknown_client')}</TableCell>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                      <TableCell className="text-right">{item.depositPercentage}%</TableCell>
                      <TableCell>
                        {item.mainInvoiceNumber || 
                          <span className="text-muted-foreground italic">{t('reports.advance_payments.no_main_invoice')}</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.remainingAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(item.status)}>
                          {t(`invoices.status_${item.status}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancePaymentReport; 