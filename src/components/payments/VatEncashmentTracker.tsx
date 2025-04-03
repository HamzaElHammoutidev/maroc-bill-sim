import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileDown, Receipt, PrinterIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockInvoices, mockPayments, Invoice, Payment } from '@/data/mockData';

// Types for VAT Encashment tracking
interface VatEntry {
  id: string;
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  clientName: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  status: 'pending' | 'declared' | 'paid';
}

interface VatPeriodSummary {
  period: string;
  totalAmount: number;
  totalVat: number;
  status: 'pending' | 'declared' | 'paid';
  entriesCount: number;
}

interface VatEncashmentTrackerProps {
  onExport?: (format: string, period?: string) => void;
  onPrint?: (period?: string) => void;
  onMarkDeclared?: (period: string) => void;
  onMarkPaid?: (period: string) => void;
}

export const VatEncashmentTracker: React.FC<VatEncashmentTrackerProps> = ({
  onExport,
  onPrint,
  onMarkDeclared,
  onMarkPaid
}) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate VAT entries from payments
  // In a real app, this would come from your database
  const vatEntries = useMemo((): VatEntry[] => {
    const entries: VatEntry[] = [];
    
    mockPayments.forEach(payment => {
      const invoice = mockInvoices.find(inv => inv.id === payment.invoiceId);
      if (invoice) {
        // In a real app, you might have different VAT rates per line item
        // Here we'll just use the VAT amount from the invoice and pro-rate it if partial payment
        const paymentRatio = payment.amount / invoice.total;
        const vatAmount = invoice.vatAmount * paymentRatio;
        
        // Generate a status (in a real app, this would be tracked in the database)
        // For this demo, payments older than 3 months are "declared", older than 6 months are "paid"
        const paymentDate = new Date(payment.date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        let status: 'pending' | 'declared' | 'paid' = 'pending';
        if (isBefore(paymentDate, sixMonthsAgo)) {
          status = 'paid';
        } else if (isBefore(paymentDate, threeMonthsAgo)) {
          status = 'declared';
        }
        
        // Get client name
        const clientName = mockInvoices.find(inv => inv.id === payment.invoiceId)?.clientId || '';
        
        entries.push({
          id: `vat-${payment.id}`,
          paymentId: payment.id,
          invoiceId: payment.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          date: payment.date,
          clientName,
          amount: payment.amount,
          vatRate: invoice.vatAmount / invoice.total * 100, // Calculate effective VAT rate
          vatAmount,
          status
        });
      }
    });
    
    return entries;
  }, []);
  
  // Filter entries based on date range, status, and search
  const filteredEntries = useMemo(() => {
    let filtered = [...vatEntries];
    
    // Filter by date range
    if (dateRange?.from) {
      filtered = filtered.filter(entry => 
        isAfter(new Date(entry.date), dateRange.from!)
      );
    }
    
    if (dateRange?.to) {
      filtered = filtered.filter(entry => 
        isBefore(new Date(entry.date), dateRange.to!)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.invoiceNumber.toLowerCase().includes(query) ||
        entry.clientName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [vatEntries, dateRange, statusFilter, searchQuery]);
  
  // Group entries by month to show monthly totals
  const monthlyTotals = useMemo(() => {
    const months: Record<string, VatPeriodSummary> = {};
    
    vatEntries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMMM yyyy');
      
      if (!months[monthKey]) {
        months[monthKey] = {
          period: monthName,
          totalAmount: 0,
          totalVat: 0,
          status: 'pending',
          entriesCount: 0
        };
      }
      
      months[monthKey].totalAmount += entry.amount;
      months[monthKey].totalVat += entry.vatAmount;
      months[monthKey].entriesCount++;
      
      // The period status is the "lowest" status of any entry
      // pending < declared < paid
      if (entry.status === 'pending') {
        months[monthKey].status = 'pending';
      } else if (entry.status === 'declared' && months[monthKey].status === 'paid') {
        months[monthKey].status = 'declared';
      }
    });
    
    return Object.entries(months)
      .map(([key, summary]) => ({ ...summary, id: key }))
      .sort((a, b) => b.id.localeCompare(a.id)); // Sort by most recent first
  }, [vatEntries]);
  
  // Calculate totals for the current period
  const periodTotals = useMemo(() => {
    const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalVat = filteredEntries.reduce((sum, entry) => sum + entry.vatAmount, 0);
    
    return {
      totalAmount,
      totalVat,
      entriesCount: filteredEntries.length
    };
  }, [filteredEntries]);
  
  // Handle export
  const handleExport = (format: string) => {
    if (onExport) {
      const period = selectedPeriod === 'current' ? undefined : selectedPeriod;
      onExport(format, period);
    }
  };
  
  // Handle print
  const handlePrint = () => {
    if (onPrint) {
      const period = selectedPeriod === 'current' ? undefined : selectedPeriod;
      onPrint(period);
    }
  };
  
  // Handle mark as declared
  const handleMarkDeclared = () => {
    if (onMarkDeclared && selectedPeriod !== 'current') {
      onMarkDeclared(selectedPeriod);
    }
  };
  
  // Handle mark as paid
  const handleMarkPaid = () => {
    if (onMarkPaid && selectedPeriod !== 'current') {
      onMarkPaid(selectedPeriod);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-500" />
                {t('vat.encashment_tracker')}
              </CardTitle>
              <CardDescription>
                {t('vat.encashment_description')}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <PrinterIcon className="h-4 w-4 mr-2" />
                {t('common.print')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <FileDown className="h-4 w-4 mr-2" />
                {t('common.export')}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {t('vat.special_regime_notice')}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {t('vat.encashment_explanation')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Period Selection */}
            <div>
              <Label>{t('vat.reporting_period')}</Label>
              <Select 
                value={selectedPeriod} 
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('vat.select_period')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">{t('vat.current_period')}</SelectItem>
                  {monthlyTotals.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.period} ({formatCurrency(period.totalVat)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Custom Date Range */}
            {selectedPeriod === 'current' && (
              <div>
                <Label>{t('vat.custom_date_range')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>{t('payments.date_range')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {/* Status Filter */}
            <div>
              <Label>{t('vat.status_filter')}</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('vat.filter_by_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="pending">{t('vat.pending')}</SelectItem>
                  <SelectItem value="declared">{t('vat.declared')}</SelectItem>
                  <SelectItem value="paid">{t('vat.paid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search */}
            <div className="md:col-span-3">
              <Label>{t('common.search')}</Label>
              <Input
                type="text"
                placeholder={t('vat.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border p-4 rounded-md">
              <p className="text-sm text-muted-foreground">{t('vat.total_payments')}</p>
              <p className="text-2xl font-bold">{formatCurrency(periodTotals.totalAmount)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('vat.from')} {periodTotals.entriesCount} {t('vat.transactions')}
              </p>
            </div>
            
            <div className="border p-4 rounded-md bg-blue-50">
              <p className="text-sm text-blue-600">{t('vat.total_vat')}</p>
              <p className="text-2xl font-bold">{formatCurrency(periodTotals.totalVat)}</p>
              <p className="text-xs text-blue-600 mt-1">
                {t('vat.effective_rate')}: {(periodTotals.totalAmount > 0 
                  ? (periodTotals.totalVat / periodTotals.totalAmount) * 100 
                  : 0).toFixed(2)}%
              </p>
            </div>
            
            <div className="border p-4 rounded-md">
              <p className="text-sm text-muted-foreground">{t('vat.declaration_due')}</p>
              <p className="text-2xl font-bold">{format(endOfMonth(new Date()), 'MMMM dd, yyyy')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('vat.last_day_of_month')}
              </p>
            </div>
          </div>
          
          {/* VAT Encashment Table */}
          <div className="border rounded-md overflow-auto">
            <Table>
              <TableCaption>{t('vat.encashment_table_caption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead>{t('common.invoice')}</TableHead>
                  <TableHead>{t('common.client')}</TableHead>
                  <TableHead className="text-right">{t('common.amount')}</TableHead>
                  <TableHead className="text-right">{t('vat.vat_rate')}</TableHead>
                  <TableHead className="text-right">{t('vat.vat_amount')}</TableHead>
                  <TableHead className="text-center">{t('common.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      {t('vat.no_entries_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), 'PP')}</TableCell>
                      <TableCell>{entry.invoiceNumber}</TableCell>
                      <TableCell>{entry.clientName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                      <TableCell className="text-right">{entry.vatRate.toFixed(2)}%</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(entry.vatAmount)}</TableCell>
                      <TableCell className="text-center">
                        {entry.status === 'pending' && (
                          <span className="inline-flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                            {t('vat.pending')}
                          </span>
                        )}
                        {entry.status === 'declared' && (
                          <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {t('vat.declared')}
                          </span>
                        )}
                        {entry.status === 'paid' && (
                          <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {t('vat.paid')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* VAT Declaration Actions */}
          {selectedPeriod !== 'current' && (
            <div className="mt-6 p-4 border rounded-md bg-muted/20">
              <h3 className="text-md font-medium mb-3">{t('vat.declaration_actions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm">{t('vat.mark_as_declared')}</p>
                  <Button 
                    onClick={handleMarkDeclared}
                    variant="outline"
                    className="w-full"
                  >
                    {t('vat.mark_declared')}
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">{t('vat.mark_as_paid')}</p>
                  <Button 
                    onClick={handleMarkPaid}
                    variant="outline" 
                    className="w-full"
                  >
                    {t('vat.mark_paid')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            {t('vat.vat_regime')}: {t('vat.encashment_regime')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('vat.last_updated')}: {format(new Date(), 'PPp')}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VatEncashmentTracker; 