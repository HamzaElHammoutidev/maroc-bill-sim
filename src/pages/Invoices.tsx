
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockInvoices, mockClients, InvoiceStatus } from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, FilePlus, FileText, CheckCircle, Share, FileEdit, Trash } from 'lucide-react';
import { toast } from 'sonner';

const Invoices = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter invoices by search query, status, and company ID
  const filteredInvoices = mockInvoices
    .filter(invoice => invoice.companyId === companyId)
    .filter(invoice => 
      statusFilter === 'all' || invoice.status === statusFilter
    )
    .filter(invoice => 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mockClients.find(c => c.id === invoice.clientId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleCreateInvoice = () => {
    toast.info(t('invoices.create_message'));
  };
  
  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'draft', label: t('invoices.draft') },
    { value: 'sent', label: t('invoices.sent') },
    { value: 'paid', label: t('invoices.paid') },
    { value: 'partial', label: t('invoices.partial') },
    { value: 'overdue', label: t('invoices.overdue') },
    { value: 'cancelled', label: t('invoices.cancelled') },
  ];
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('invoices.title')} 
        action={{
          label: t('invoices.create'),
          onClick: handleCreateInvoice
        }}
      />
      
      <Card className="mb-8 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('invoices.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.status')} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg shadow-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left">{t('invoices.number')}</th>
              <th className="px-4 py-3 text-left">{t('invoices.client')}</th>
              <th className="px-4 py-3 text-left">{t('invoices.date')}</th>
              <th className="px-4 py-3 text-left">{t('invoices.due_date')}</th>
              <th className="px-4 py-3 text-right">{t('invoices.amount')}</th>
              <th className="px-4 py-3 text-center">{t('invoices.status')}</th>
              <th className="px-4 py-3 text-center">{t('invoices.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => {
                const client = mockClients.find(c => c.id === invoice.clientId);
                
                return (
                  <tr 
                    key={invoice.id}
                    className="border-t hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">{client?.name}</td>
                    <td className="px-4 py-3">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {invoice.total.toLocaleString()} {t('common.currency')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={invoice.status} type="invoice" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            {t('invoices.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="mr-2 h-4 w-4" />
                            {t('invoices.send')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileEdit className="mr-2 h-4 w-4" />
                            {t('invoices.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t('invoices.mark_paid')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            {t('invoices.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' ? t('invoices.no_results') : t('invoices.no_invoices')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
