import React from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, Payment } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/utils/format';

export interface AccountStatementProps {
  /**
   * Invoices to display in the statement
   */
  invoices: Invoice[];
  
  /**
   * Payments to display in the statement
   */
  payments: Payment[];
  
  /**
   * Currency symbol to use
   */
  currencySymbol?: string;
  
  /**
   * Label for invoices section
   */
  invoicesLabel?: string;
  
  /**
   * Label for payments section
   */
  paymentsLabel?: string;
  
  /**
   * Label for balance section
   */
  balanceLabel?: string;
  
  /**
   * Number of items to show before "Show more" option
   */
  initialLimit?: number;
}

/**
 * A component that displays an account statement with invoices and payments
 */
const AccountStatement: React.FC<AccountStatementProps> = ({
  invoices,
  payments,
  currencySymbol = 'DH',
  invoicesLabel,
  paymentsLabel,
  balanceLabel,
  initialLimit = 5,
}) => {
  const { t } = useTranslation();
  const [showAllInvoices, setShowAllInvoices] = React.useState(false);
  const [showAllPayments, setShowAllPayments] = React.useState(false);
  
  // Calculate the total from invoices
  const invoicesTotal = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  
  // Calculate the total from completed payments
  const paymentsTotal = payments.reduce((sum, payment) => {
    if (payment.status === 'completed') {
      return sum + payment.amount;
    }
    return sum;
  }, 0);
  
  // Calculate the current balance
  const balance = invoicesTotal - paymentsTotal;
  
  // Sort invoices by date (newest first)
  const sortedInvoices = [...invoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Limit the number of items to show based on the initialLimit
  const displayedInvoices = showAllInvoices 
    ? sortedInvoices 
    : sortedInvoices.slice(0, initialLimit);
    
  const displayedPayments = showAllPayments 
    ? sortedPayments 
    : sortedPayments.slice(0, initialLimit);
  
  // Get status badge color
  const getInvoiceStatusColor = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'partial':
        return 'bg-blue-500';
      case 'overdue':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'sent':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{balanceLabel || t('account.balance.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">{t('account.balance.invoices')}</div>
              <div className="text-2xl font-bold">{formatCurrency(invoicesTotal, currencySymbol)}</div>
            </div>
            
            <div className="p-4 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">{t('account.balance.payments')}</div>
              <div className="text-2xl font-bold">{formatCurrency(paymentsTotal, currencySymbol)}</div>
            </div>
            
            <div className="p-4 bg-secondary/20 rounded-md">
              <div className="text-sm text-muted-foreground">{t('account.balance.balance')}</div>
              <div className={`text-2xl font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(balance, currencySymbol)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Invoices */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{invoicesLabel || t('account.invoices.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {displayedInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t('account.invoices.number')}</th>
                    <th className="text-left p-2">{t('account.invoices.date')}</th>
                    <th className="text-left p-2">{t('account.invoices.due_date')}</th>
                    <th className="text-right p-2">{t('account.invoices.total')}</th>
                    <th className="text-center p-2">{t('account.invoices.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <a href={`/invoices/${invoice.id}`} className="text-primary hover:underline">
                          {invoice.invoiceNumber}
                        </a>
                      </td>
                      <td className="p-2">{formatDate(invoice.date)}</td>
                      <td className="p-2">{formatDate(invoice.dueDate)}</td>
                      <td className="p-2 text-right">{formatCurrency(invoice.total, currencySymbol)}</td>
                      <td className="p-2 text-center">
                        <Badge className={getInvoiceStatusColor(invoice.status)} variant="outline">
                          {t(`invoice.status.${invoice.status}`)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {sortedInvoices.length > initialLimit && (
                <div className="mt-4 text-center">
                  <button 
                    className="text-xs text-primary underline"
                    onClick={() => setShowAllInvoices(!showAllInvoices)}
                  >
                    {showAllInvoices 
                      ? t('common.show_less') 
                      : t('common.show_more', { count: sortedInvoices.length - initialLimit })}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              {t('account.invoices.none')}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payments */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{paymentsLabel || t('account.payments.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {displayedPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t('account.payments.date')}</th>
                    <th className="text-left p-2">{t('account.payments.method')}</th>
                    <th className="text-left p-2">{t('account.payments.reference')}</th>
                    <th className="text-right p-2">{t('account.payments.amount')}</th>
                    <th className="text-center p-2">{t('account.payments.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{formatDate(payment.date)}</td>
                      <td className="p-2">{t(`payment.methods.${payment.method}`)}</td>
                      <td className="p-2">{payment.reference || '—'}</td>
                      <td className="p-2 text-right">{formatCurrency(payment.amount, currencySymbol)}</td>
                      <td className="p-2 text-center">
                        <Badge className={getPaymentStatusColor(payment.status)} variant="outline">
                          {t(`payment.status.${payment.status}`)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {sortedPayments.length > initialLimit && (
                <div className="mt-4 text-center">
                  <button 
                    className="text-xs text-primary underline"
                    onClick={() => setShowAllPayments(!showAllPayments)}
                  >
                    {showAllPayments 
                      ? t('common.show_less') 
                      : t('common.show_more', { count: sortedPayments.length - initialLimit })}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              {t('account.payments.none')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountStatement; 