import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, differenceInDays, isBefore } from 'date-fns';
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
import { BellRing, Clock, AlertTriangle, CheckCircle, DownloadCloud } from 'lucide-react';
import { mockInvoices, Invoice, Client, getClientById } from '@/data/mockData';

interface PaymentScheduleViewProps {
  clientId?: string;
  onSelectInvoice?: (invoiceId: string, clientId: string) => void;
  onExportSchedule?: () => void;
}

const PaymentScheduleView: React.FC<PaymentScheduleViewProps> = ({
  clientId,
  onSelectInvoice,
  onExportSchedule
}) => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [overdueDays, setOverdueDays] = useState<Record<string, number>>({});
  const [totalDue, setTotalDue] = useState(0);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [totalUpcoming, setTotalUpcoming] = useState(0);

  useEffect(() => {
    // Filter invoices based on client ID if provided
    const filteredInvoices = clientId
      ? mockInvoices.filter(inv => inv.clientId === clientId && 
                           (inv.status === 'sent' || inv.status === 'partial' || inv.status === 'overdue'))
      : mockInvoices.filter(inv => inv.status === 'sent' || inv.status === 'partial' || inv.status === 'overdue');
    
    // Sort by due date
    const sortedInvoices = [...filteredInvoices].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    
    setInvoices(sortedInvoices);
    
    // Calculate overdue days and totals
    const now = new Date();
    let dueTotal = 0;
    let overdueTotal = 0;
    let upcomingTotal = 0;
    
    const overdueDaysMap: Record<string, number> = {};
    
    sortedInvoices.forEach(invoice => {
      const dueDate = new Date(invoice.dueDate);
      const remainingAmount = invoice.total - (invoice.paidAmount || 0);
      
      if (isBefore(dueDate, now)) {
        const days = differenceInDays(now, dueDate);
        overdueDaysMap[invoice.id] = days;
        overdueTotal += remainingAmount;
      } else {
        upcomingTotal += remainingAmount;
      }
      
      dueTotal += remainingAmount;
    });
    
    setOverdueDays(overdueDaysMap);
    setTotalDue(dueTotal);
    setTotalOverdue(overdueTotal);
    setTotalUpcoming(upcomingTotal);
    
  }, [clientId]);

  const handleRecordPayment = (invoice: Invoice) => {
    if (onSelectInvoice) {
      onSelectInvoice(invoice.id, invoice.clientId);
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              {clientId 
                ? t('payments.client_payment_schedule', { client: getClientById(clientId)?.name }) 
                : t('payments.payment_schedule')}
            </CardTitle>
            <CardDescription>
              {t('payments.schedule_description')}
            </CardDescription>
          </div>
          {onExportSchedule && (
            <Button variant="outline" size="sm" onClick={onExportSchedule}>
              <DownloadCloud className="h-4 w-4 mr-2" />
              {t('common.export')}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-600">{t('payments.total_due')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalDue)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-600">{t('payments.total_overdue')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalOverdue)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-600">{t('payments.total_upcoming')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalUpcoming)}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('payments.no_pending_invoices')}
            </div>
          ) : (
            invoices.map(invoice => {
              const dueDate = new Date(invoice.dueDate);
              const now = new Date();
              const isOverdue = isBefore(dueDate, now);
              const daysOverdue = isOverdue ? overdueDays[invoice.id] : 0;
              const remainingAmount = invoice.total - (invoice.paidAmount || 0);
              const client = getClientById(invoice.clientId);
              
              return (
                <div 
                  key={invoice.id} 
                  className={`border rounded-md p-4 ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                        {!clientId && client && <span className="text-sm text-muted-foreground">- {client.name}</span>}
                        {isOverdue ? (
                          <Badge variant="destructive" className="ml-2">
                            {t('payments.overdue_days', { count: daysOverdue })}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2 bg-blue-50">
                            {t('payments.due_in_days', { count: differenceInDays(dueDate, now) })}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
                        <div>
                          <span className="text-sm text-muted-foreground">{t('common.amount')}:</span>
                          <span className="font-medium ml-1">{formatCurrency(invoice.total)}</span>
                        </div>
                        
                        <span className="hidden md:inline text-muted-foreground">•</span>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">{t('payments.paid')}:</span>
                          <span className="font-medium ml-1">{formatCurrency(invoice.paidAmount || 0)}</span>
                        </div>
                        
                        <span className="hidden md:inline text-muted-foreground">•</span>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">{t('payments.remaining')}:</span>
                          <span className={`font-medium ml-1 ${isOverdue ? 'text-red-600' : ''}`}>
                            {formatCurrency(remainingAmount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">{t('common.due_date')}:</span>
                        <span className={`ml-1 ${isOverdue ? 'text-red-600' : ''}`}>
                          {format(dueDate, 'PPP')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Button 
                        size="sm" 
                        onClick={() => handleRecordPayment(invoice)}
                        className={isOverdue ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        {isOverdue ? <AlertTriangle className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        {t('payments.record_payment')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
      
      {invoices.length > 0 && (
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <BellRing className="h-4 w-4 mr-2" />
            {t('payments.payment_reminder_tip')}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default PaymentScheduleView; 