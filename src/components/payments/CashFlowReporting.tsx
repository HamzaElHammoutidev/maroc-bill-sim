import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, TrendingUp, TrendingDown, Calendar as CalendarIcon2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  mockInvoices,
  mockPayments,
  mockClients,
  Invoice,
  Payment
} from '@/data/mockData';

// Types for cash flow reporting
interface CashFlowPeriod {
  name: string;
  period: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface ProjectedPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  dueDate: string;
  amount: number;
  status: 'upcoming' | 'overdue';
  daysRemaining?: number;
  daysOverdue?: number;
}

interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CashFlowReportingProps {
  period?: 'monthly' | 'quarterly' | 'yearly';
  showProjection?: boolean;
  onExport?: (format: string) => void;
}

export const CashFlowReporting: React.FC<CashFlowReportingProps> = ({
  period: initialPeriod = 'monthly',
  showProjection = true,
  onExport
}) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>(initialPeriod);
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(addMonths(new Date(), -11)),
    to: endOfMonth(new Date())
  });
  const [showProjections, setShowProjections] = useState(showProjection);
  const [groupBy, setGroupBy] = useState<'date' | 'client' | 'method'>('date');
  
  // Get all payments within the date range
  const filteredPayments = useMemo(() => {
    let payments = [...mockPayments];
    
    // Filter by date range
    if (dateRange?.from) {
      payments = payments.filter(payment => 
        new Date(payment.date) >= dateRange.from!
      );
    }
    
    if (dateRange?.to) {
      payments = payments.filter(payment => 
        new Date(payment.date) <= dateRange.to!
      );
    }
    
    // Filter by client
    if (clientFilter !== 'all') {
      const clientInvoiceIds = mockInvoices
        .filter(invoice => invoice.clientId === clientFilter)
        .map(invoice => invoice.id);
      
      payments = payments.filter(payment => 
        clientInvoiceIds.includes(payment.invoiceId)
      );
    }
    
    // Filter by payment method
    if (paymentMethodFilter !== 'all') {
      payments = payments.filter(payment => 
        payment.method === paymentMethodFilter
      );
    }
    
    return payments;
  }, [dateRange, clientFilter, paymentMethodFilter]);
  
  // Generate time periods for the cash flow chart
  const cashFlowData: CashFlowPeriod[] = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    
    // Create an array of months between the start and end dates
    const months = eachMonthOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });
    
    // For each month, calculate inflow and outflow
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const periodName = format(month, 'MMM yyyy');
      
      // Find payments in this month
      const periodPayments = filteredPayments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });
      
      // Calculate inflow (all payments received)
      const inflow = periodPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // For this demo, we'll use a simplified outflow
      // In a real app, this would include expenses, salaries, etc.
      const outflow = inflow * (0.3 + Math.random() * 0.3); // Random 30-60% of inflow for demo
      
      return {
        name: periodName,
        period: format(month, 'yyyy-MM'),
        inflow,
        outflow,
        balance: inflow - outflow
      };
    });
    
    // If period is quarterly or yearly, aggregate the monthly data
    if (period === 'quarterly') {
      const quarterlyData: CashFlowPeriod[] = [];
      for (let i = 0; i < monthlyData.length; i += 3) {
        const quarterMonths = monthlyData.slice(i, i + 3);
        if (quarterMonths.length > 0) {
          const firstMonth = new Date(quarterMonths[0].period);
          const quarter = Math.floor(firstMonth.getMonth() / 3) + 1;
          const year = firstMonth.getFullYear();
          
          quarterlyData.push({
            name: `Q${quarter} ${year}`,
            period: `${year}-Q${quarter}`,
            inflow: quarterMonths.reduce((sum, month) => sum + month.inflow, 0),
            outflow: quarterMonths.reduce((sum, month) => sum + month.outflow, 0),
            balance: quarterMonths.reduce((sum, month) => sum + month.balance, 0)
          });
        }
      }
      return quarterlyData;
    }
    
    if (period === 'yearly') {
      const yearlyData: CashFlowPeriod[] = [];
      const yearGroups: Record<string, CashFlowPeriod[]> = {};
      
      monthlyData.forEach(month => {
        const year = month.period.substring(0, 4);
        if (!yearGroups[year]) {
          yearGroups[year] = [];
        }
        yearGroups[year].push(month);
      });
      
      Object.entries(yearGroups).forEach(([year, months]) => {
        yearlyData.push({
          name: year,
          period: year,
          inflow: months.reduce((sum, month) => sum + month.inflow, 0),
          outflow: months.reduce((sum, month) => sum + month.outflow, 0),
          balance: months.reduce((sum, month) => sum + month.balance, 0)
        });
      });
      
      return yearlyData;
    }
    
    return monthlyData;
  }, [filteredPayments, dateRange, period]);
  
  // Calculate payment method breakdown
  const paymentMethodData = useMemo(() => {
    const methodGroups: Record<string, { amount: number; count: number }> = {};
    
    filteredPayments.forEach(payment => {
      const method = payment.method;
      if (!methodGroups[method]) {
        methodGroups[method] = { amount: 0, count: 0 };
      }
      methodGroups[method].amount += payment.amount;
      methodGroups[method].count++;
    });
    
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return Object.entries(methodGroups).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
    }));
  }, [filteredPayments]);
  
  // Get projected payments (upcoming due invoices)
  const projectedPayments = useMemo((): ProjectedPayment[] => {
    const today = new Date();
    const nextThreeMonths = addMonths(today, 3);
    
    // Get unpaid invoices
    const unpaidInvoices = mockInvoices.filter(invoice => 
      invoice.status === 'sent' || 
      invoice.status === 'partial' || 
      invoice.status === 'overdue'
    );
    
    // Transform them into projected payments
    return unpaidInvoices.map(invoice => {
      const dueDate = new Date(invoice.dueDate);
      const isOverdue = dueDate < today;
      const client = mockClients.find(client => client.id === invoice.clientId);
      
      // Calculate remaining amount
      const paidAmount = invoice.paidAmount || 0;
      const remainingAmount = invoice.total - paidAmount;
      
      // Calculate days remaining or overdue
      const daysDiff = Math.round(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        id: `proj-${invoice.id}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientId: invoice.clientId,
        clientName: client?.name || 'Unknown Client',
        dueDate: invoice.dueDate,
        amount: remainingAmount,
        status: isOverdue ? 'overdue' : 'upcoming',
        daysRemaining: isOverdue ? undefined : daysDiff,
        daysOverdue: isOverdue ? Math.abs(daysDiff) : undefined
      };
    }).filter(projection => 
      // Only include projections within the next 3 months or already overdue
      projection.status === 'overdue' || 
      (new Date(projection.dueDate) <= nextThreeMonths)
    ).sort((a, b) => 
      // Sort by due date (overdue first, then upcoming)
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, []);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Handle export
  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format);
    }
  };
  
  // Group data by client
  const clientData = useMemo(() => {
    const clientGroups: Record<string, { amount: number; count: number }> = {};
    
    filteredPayments.forEach(payment => {
      const invoice = mockInvoices.find(inv => inv.id === payment.invoiceId);
      if (invoice) {
        const clientId = invoice.clientId;
        if (!clientGroups[clientId]) {
          clientGroups[clientId] = { amount: 0, count: 0 };
        }
        clientGroups[clientId].amount += payment.amount;
        clientGroups[clientId].count++;
      }
    });
    
    return Object.entries(clientGroups).map(([clientId, data]) => {
      const client = mockClients.find(c => c.id === clientId);
      return {
        name: client?.name || 'Unknown Client',
        clientId,
        amount: data.amount,
        count: data.count
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [filteredPayments]);
  
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                {t('payments.cash_flow_reporting')}
              </CardTitle>
              <CardDescription>
                {t('payments.cash_flow_description')}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={showProjections ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowProjections(!showProjections)}
              >
                <CalendarIcon2 className="h-4 w-4 mr-2" />
                {t('payments.projections')}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t('common.export')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    {t('common.export_csv')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    {t('common.export_pdf')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    {t('common.export_excel')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Date Range */}
            <div>
              <Label>{t('payments.date_range')}</Label>
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
            
            {/* Period */}
            <div>
              <Label>{t('payments.period')}</Label>
              <Select
                value={period}
                onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setPeriod(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('payments.select_period')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('payments.monthly')}</SelectItem>
                  <SelectItem value="quarterly">{t('payments.quarterly')}</SelectItem>
                  <SelectItem value="yearly">{t('payments.yearly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Client Filter */}
            <div>
              <Label>{t('common.client')}</Label>
              <Select
                value={clientFilter}
                onValueChange={setClientFilter}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('payments.select_client')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all_clients')}</SelectItem>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Payment Method Filter */}
            <div>
              <Label>{t('payments.payment_method')}</Label>
              <Select
                value={paymentMethodFilter}
                onValueChange={setPaymentMethodFilter}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('payments.select_method')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all_methods')}</SelectItem>
                  <SelectItem value="cash">{t('payments.methods.cash')}</SelectItem>
                  <SelectItem value="bank">{t('payments.methods.bank')}</SelectItem>
                  <SelectItem value="check">{t('payments.methods.check')}</SelectItem>
                  <SelectItem value="other">{t('payments.methods.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-600">{t('payments.total_inflow')}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(cashFlowData.reduce((sum, period) => sum + period.inflow, 0))}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {t('payments.from')} {cashFlowData.reduce((sum, period) => sum + period.inflow, 0) / 
                (filteredPayments.length || 1)} {t('payments.per_payment')}
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-600">{t('payments.total_outflow')}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(cashFlowData.reduce((sum, period) => sum + period.outflow, 0))}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {cashFlowData.reduce((sum, period) => sum + period.outflow, 0) / 
                cashFlowData.reduce((sum, period) => sum + period.inflow, 1) * 100}% {t('payments.of_inflow')}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-sm text-green-600">{t('payments.net_cash_flow')}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(cashFlowData.reduce((sum, period) => sum + period.balance, 0))}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {t('payments.over')} {cashFlowData.length} {t(`payments.${period}_periods`)}
              </p>
            </div>
          </div>
          
          {/* Cash Flow Chart */}
          <div className="border rounded-md p-4 mb-6">
            <h3 className="text-md font-medium mb-4">{t('payments.cash_flow_over_time')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cashFlowData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), ""]}
                    labelFormatter={(value) => t('payments.period', { period: value })}
                  />
                  <Legend />
                  <Bar dataKey="inflow" name={t('payments.inflow')} fill="#0088FE" />
                  <Bar dataKey="outflow" name={t('payments.outflow')} fill="#FF8042" />
                  <Bar dataKey="balance" name={t('payments.balance')} fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Payment Analysis Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Payment Methods Breakdown */}
            <div className="border rounded-md p-4">
              <h3 className="text-md font-medium mb-4">{t('payments.payment_methods_breakdown')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="method"
                      label={({ method, percentage }) => `${t(`payments.methods.${method}`)}: ${percentage.toFixed(1)}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), ""]}
                      labelFormatter={(method) => t(`payments.methods.${method}`)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {paymentMethodData.map((method, index) => (
                  <div key={method.method} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{t(`payments.methods.${method.method}`)}</span>
                    </div>
                    <div className="text-sm">
                      {formatCurrency(method.amount)} ({method.count} {t('payments.payments')})
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Top Clients */}
            <div className="border rounded-md p-4">
              <h3 className="text-md font-medium mb-4">{t('payments.top_clients')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clientData.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), ""]}
                    />
                    <Bar dataKey="amount" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {clientData.slice(0, 5).map((client, index) => (
                  <div key={client.clientId} className="flex justify-between items-center">
                    <span className="text-sm">{client.name}</span>
                    <div className="text-sm">
                      {formatCurrency(client.amount)} ({client.count} {t('payments.payments')})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Projections Section */}
          {showProjections && (
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium">{t('payments.projected_cash_flow')}</h3>
                <Badge variant="outline" className="bg-blue-50">
                  {t('payments.next_3_months')}
                </Badge>
              </div>
              
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border p-3 rounded-md bg-green-50">
                    <p className="text-sm text-green-600">{t('payments.expected_inflow')}</p>
                    <p className="text-xl font-medium">
                      {formatCurrency(projectedPayments.reduce((sum, p) => sum + p.amount, 0))}
                    </p>
                  </div>
                  <div className="border p-3 rounded-md bg-amber-50">
                    <p className="text-sm text-amber-600">{t('payments.invoices_due')}</p>
                    <p className="text-xl font-medium">
                      {projectedPayments.length}
                    </p>
                  </div>
                  <div className="border p-3 rounded-md bg-red-50">
                    <p className="text-sm text-red-600">{t('payments.overdue_amount')}</p>
                    <p className="text-xl font-medium">
                      {formatCurrency(projectedPayments
                        .filter(p => p.status === 'overdue')
                        .reduce((sum, p) => sum + p.amount, 0))}
                    </p>
                  </div>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-2">{t('payments.upcoming_payments')}</h4>
              <div className="max-h-80 overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.client')}</TableHead>
                      <TableHead>{t('common.invoice')}</TableHead>
                      <TableHead>{t('common.due_date')}</TableHead>
                      <TableHead className="text-right">{t('common.amount')}</TableHead>
                      <TableHead className="text-center">{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectedPayments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.clientName}</TableCell>
                        <TableCell>{payment.invoiceNumber}</TableCell>
                        <TableCell>{format(new Date(payment.dueDate), 'PP')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-center">
                          {payment.status === 'overdue' ? (
                            <span className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {t('payments.overdue_days', { days: payment.daysOverdue })}
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {t('payments.due_in_days', { days: payment.daysRemaining })}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            {t('payments.data_last_updated')}: {format(new Date(), 'PPp')}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CashFlowReporting;

// Required imports for components used but not imported at the top
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'; 