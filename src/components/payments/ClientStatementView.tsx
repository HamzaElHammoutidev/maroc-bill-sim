import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { Download, Printer, Users, Receipt } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  mockClients,
  mockInvoices,
  mockPayments,
  getClientPayments,
  getClientInvoices,
  Client
} from '@/data/mockData';

interface ClientStatementViewProps {
  clientId?: string;
  onViewInvoice?: (invoiceId: string) => void;
  onViewPayment?: (paymentId: string) => void;
  onPrint?: () => void;
  onExport?: (format: string) => void;
}

interface StatementEntry {
  id: string;
  date: string;
  description: string;
  type: 'invoice' | 'payment' | 'credit_note';
  reference: string;
  amount: number;
  balance: number;
}

const ClientStatementView: React.FC<ClientStatementViewProps> = ({
  clientId: initialClientId,
  onViewInvoice,
  onViewPayment,
  onPrint,
  onExport
}) => {
  const { t } = useTranslation();
  const [clientId, setClientId] = useState<string | undefined>(initialClientId);
  const [client, setClient] = useState<Client | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1), // 3 months ago, 1st day
    to: new Date()
  });
  const [entries, setEntries] = useState<StatementEntry[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalInvoiced, setTotalInvoiced] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  // Load client data when clientId changes
  useEffect(() => {
    if (clientId) {
      const selectedClient = mockClients.find(c => c.id === clientId);
      setClient(selectedClient || null);
    } else {
      setClient(null);
    }
  }, [clientId]);

  // Calculate statement entries when client or date range changes
  useEffect(() => {
    if (!clientId) {
      setEntries([]);
      setCurrentBalance(0);
      setTotalInvoiced(0);
      setTotalPaid(0);
      return;
    }

    // Get client invoices and payments
    const invoices = getClientInvoices(clientId);
    const payments = getClientPayments(clientId);
    
    // Combine into single array of transactions
    let transactions: StatementEntry[] = [];
    
    // Add invoices
    invoices.forEach(invoice => {
      transactions.push({
        id: invoice.id,
        date: invoice.date,
        description: t('statements.invoice_issued'),
        type: 'invoice',
        reference: invoice.invoiceNumber,
        amount: invoice.total,
        balance: 0 // Will calculate later
      });
    });
    
    // Add payments
    payments.forEach(payment => {
      transactions.push({
        id: payment.id,
        date: payment.date,
        description: t(`payments.methods.${payment.method}`),
        type: 'payment',
        reference: payment.transactionId || '-',
        amount: -payment.amount, // Negative because it reduces the balance
        balance: 0 // Will calculate later
      });
    });
    
    // Sort by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Filter by date range if present
    if (dateRange?.from) {
      transactions = transactions.filter(entry => 
        new Date(entry.date) >= dateRange.from!
      );
    }
    
    if (dateRange?.to) {
      transactions = transactions.filter(entry => 
        new Date(entry.date) <= dateRange.to!
      );
    }
    
    // Calculate running balance
    let balance = 0;
    const calculatedEntries = transactions.map(entry => {
      balance += entry.amount;
      return {
        ...entry,
        balance
      };
    });
    
    // Calculate totals
    const invoicedAmount = calculatedEntries
      .filter(entry => entry.type === 'invoice')
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const paidAmount = calculatedEntries
      .filter(entry => entry.type === 'payment')
      .reduce((sum, entry) => sum - entry.amount, 0);
    
    setEntries(calculatedEntries);
    setCurrentBalance(balance);
    setTotalInvoiced(invoicedAmount);
    setTotalPaid(paidAmount);
    
  }, [clientId, dateRange, t]);

  // Handle view invoice
  const handleViewInvoice = (invoiceId: string) => {
    if (onViewInvoice) {
      onViewInvoice(invoiceId);
    }
  };

  // Handle view payment
  const handleViewPayment = (paymentId: string) => {
    if (onViewPayment) {
      onViewPayment(paymentId);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              {t('payments.client_statement')}
            </CardTitle>
            <CardDescription>
              {t('payments.client_statement_description')}
            </CardDescription>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Client selection if no client ID is provided */}
            {!initialClientId && (
              <Select
                value={clientId}
                onValueChange={setClientId}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder={t('payments.select_client')} />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Date range selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
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
        </div>
      </CardHeader>
      
      <CardContent>
        {clientId && client ? (
          <>
            {/* Client information */}
            <div className="bg-muted/20 border rounded-md p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.client')}</p>
                  <p className="font-medium">{client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('clients.ice')}</p>
                  <p className="font-medium">{client.ice || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('clients.email')}</p>
                  <p className="font-medium">{client.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('clients.payment_terms')}</p>
                  <p className="font-medium">{client.paymentTerms || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* Summary boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border p-4 rounded-md">
                <p className="text-sm text-muted-foreground">{t('payments.current_balance')}</p>
                <p className={cn(
                  "text-xl font-bold",
                  currentBalance > 0 ? "text-red-600" : "text-green-600"
                )}>
                  {formatCurrency(currentBalance)}
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <p className="text-sm text-muted-foreground">{t('payments.total_invoiced')}</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(totalInvoiced)}</p>
              </div>
              <div className="border p-4 rounded-md">
                <p className="text-sm text-muted-foreground">{t('payments.total_paid')}</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
            
            {/* Statement table */}
            <div className="border rounded-md overflow-auto">
              <Table>
                <TableCaption>{t('payments.statement_caption')}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead>{t('common.reference')}</TableHead>
                    <TableHead className="text-right">{t('common.amount')}</TableHead>
                    <TableHead className="text-right">{t('payments.balance')}</TableHead>
                    <TableHead className="text-center">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        {t('payments.no_transactions')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map(entry => (
                      <TableRow key={`${entry.id}-${entry.type}`}>
                        <TableCell>{format(new Date(entry.date), 'PP')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.type === 'invoice' ? (
                              <StatusBadge status="invoice" type="invoice" />
                            ) : (
                              <StatusBadge status="completed" type="payment" />
                            )}
                            {entry.description}
                          </div>
                        </TableCell>
                        <TableCell>{entry.reference}</TableCell>
                        <TableCell className={cn(
                          "text-right",
                          entry.type === 'payment' ? "text-green-600" : "text-blue-600"
                        )}>
                          {entry.type === 'payment' 
                            ? `- ${formatCurrency(Math.abs(entry.amount))}` 
                            : formatCurrency(entry.amount)}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          entry.balance > 0 ? "text-red-600" : "text-green-600"
                        )}>
                          {formatCurrency(entry.balance)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => entry.type === 'invoice' 
                              ? handleViewInvoice(entry.id) 
                              : handleViewPayment(entry.id)
                            }
                          >
                            {t('common.view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>{t('payments.select_client_for_statement')}</p>
          </div>
        )}
      </CardContent>
      
      {client && (
        <CardFooter className="flex flex-wrap justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            {t('common.print')}
          </Button>
          <Button variant="outline" onClick={() => onExport && onExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export_pdf')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ClientStatementView; 