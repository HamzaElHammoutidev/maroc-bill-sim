import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileDown, Upload, Check, X, AlertCircle, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockInvoices, mockPayments, mockClients, createPayment } from '@/data/mockData';
import { toast } from 'sonner';
import { Toggle } from '@/components/ui/toggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types for the bank reconciliation
interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference?: string;
  balance?: number;
  status: 'unmatched' | 'matched' | 'partially_matched' | 'ignored';
  matchedPayments?: string[];
  matchConfidence?: number; // 0-100 confidence score
}

interface ReconciliationSummary {
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  totalAmount: number;
  matchedAmount: number;
  unmatchedAmount: number;
}

interface BankReconciliationProps {
  onExport?: (format: string) => void;
  onCreatePayment?: (paymentData: any) => void;
  onMatchSuccess?: () => void;
}

export const BankReconciliation: React.FC<BankReconciliationProps> = ({
  onExport,
  onCreatePayment,
  onMatchSuccess
}) => {
  const { t } = useTranslation();
  
  // State for bank transactions
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<string>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // State for filtering
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    to: new Date()
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for match dialog
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  
  // Filters for transactions
  const filteredTransactions = useMemo(() => {
    return bankTransactions.filter(transaction => {
      // Date range filter
      if (dateRange?.from && isAfter(dateRange.from, new Date(transaction.date))) {
        return false;
      }
      if (dateRange?.to && isBefore(dateRange.to, new Date(transaction.date))) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && transaction.status !== statusFilter) {
        return false;
      }
      
      // Search query
      if (searchQuery && 
          !transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [bankTransactions, dateRange, statusFilter, searchQuery]);
  
  // Calculate summary statistics
  const summary: ReconciliationSummary = useMemo(() => {
    return {
      totalTransactions: filteredTransactions.length,
      matchedTransactions: filteredTransactions.filter(t => 
        t.status === 'matched' || t.status === 'partially_matched').length,
      unmatchedTransactions: filteredTransactions.filter(t => 
        t.status === 'unmatched').length,
      totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      matchedAmount: filteredTransactions.filter(t => 
        t.status === 'matched' || t.status === 'partially_matched')
        .reduce((sum, t) => sum + t.amount, 0),
      unmatchedAmount: filteredTransactions.filter(t => 
        t.status === 'unmatched')
        .reduce((sum, t) => sum + t.amount, 0)
    };
  }, [filteredTransactions]);
  
  // Generate mock bank transactions for the demo
  useEffect(() => {
    // For demo purposes, we'll create mock transactions with varying match states
    const mockTransactions: BankTransaction[] = [];
    
    // Add some matched payments (derived from existing payments)
    mockPayments.slice(0, 5).forEach((payment, index) => {
      const invoice = mockInvoices.find(inv => inv.id === payment.invoiceId);
      const client = invoice ? mockClients.find(c => c.id === invoice.clientId) : null;
      
      mockTransactions.push({
        id: `bt-${index}`,
        date: payment.date,
        description: `Payment from ${client?.name || 'Unknown Client'}`,
        amount: payment.amount,
        reference: payment.reference || payment.transactionId,
        status: 'matched',
        matchedPayments: [payment.id],
        matchConfidence: 100
      });
    });
    
    // Add some unmatched transactions
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      mockTransactions.push({
        id: `bt-unmatched-${i}`,
        date: date.toISOString(),
        description: `Bank transfer ${Math.floor(Math.random() * 100000)}`,
        amount: Math.floor(Math.random() * 1000) * 100 + 5000, // Random amount between 5000 and 105000
        reference: `REF${Math.floor(Math.random() * 1000000)}`,
        status: 'unmatched'
      });
    }
    
    // Add a partially matched transaction
    mockTransactions.push({
      id: `bt-partial-1`,
      date: new Date().toISOString(),
      description: `Multiple invoices payment - Client XYZ`,
      amount: 15000,
      reference: `MULTI-PAY-${Math.floor(Math.random() * 1000)}`,
      status: 'partially_matched',
      matchedPayments: mockPayments.length > 0 ? [mockPayments[0].id] : [],
      matchConfidence: 85
    });
    
    // Sort by date (newest first)
    mockTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setBankTransactions(mockTransactions);
  }, []);
  
  // Handle file import
  const handleImport = () => {
    if (!importFile) {
      toast.error(t('reconciliation.no_file_selected'));
      return;
    }
    
    // In a real app, this would parse the file
    // For demo, we'll just show a success message
    toast.success(t('reconciliation.import_success', { count: 15 }));
    setIsImportDialogOpen(false);
    setImportFile(null);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  // Open match dialog for a transaction
  const handleMatchTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    
    // Generate suggested matches
    // In a real app, this would use sophisticated matching algorithms
    const suggestions = mockInvoices
      .filter(inv => 
        (inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'partial') &&
        Math.abs(inv.total - transaction.amount) < 0.01 * inv.total // Within 1% of transaction amount
      )
      .map(inv => {
        const client = mockClients.find(c => c.id === inv.clientId);
        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientName: client?.name || 'Unknown',
          amount: inv.total - (inv.paidAmount || 0),
          date: inv.date,
          confidence: calculateMatchConfidence(transaction, inv)
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 matches
    
    setSuggestedMatches(suggestions);
    setSelectedMatches(transaction.matchedPayments || []);
    setIsMatchDialogOpen(true);
  };
  
  // Calculate match confidence score
  const calculateMatchConfidence = (transaction: BankTransaction, invoice: any) => {
    // A real implementation would use more sophisticated algorithms
    // This is a simplified example
    let score = 0;
    
    // Exact amount match is very significant
    if (Math.abs(transaction.amount - invoice.total) < 0.01) {
      score += 60;
    } else if (Math.abs(transaction.amount - invoice.total) < invoice.total * 0.05) {
      // Within 5%
      score += 40;
    }
    
    // Transaction reference contains invoice number
    if (transaction.reference && 
        transaction.reference.includes(invoice.invoiceNumber)) {
      score += 30;
    }
    
    // Transaction date is after invoice date
    if (isAfter(new Date(transaction.date), new Date(invoice.date))) {
      score += 10;
    }
    
    return Math.min(score, 100);
  };
  
  // Handle match completion
  const handleCompleteMatch = () => {
    if (!selectedTransaction) return;
    
    // Create payments for selected matches
    selectedMatches.forEach(invoiceId => {
      const invoice = mockInvoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        const paymentData = {
          invoiceId,
          amount: invoice.total - (invoice.paidAmount || 0),
          method: 'bank',
          date: new Date(selectedTransaction.date),
          reference: selectedTransaction.reference || selectedTransaction.id,
          notes: `Auto-matched from bank transaction ${selectedTransaction.id}`,
          companyId: invoice.companyId,
        };
        
        if (onCreatePayment) {
          onCreatePayment(paymentData);
        } else {
          // Use the mock data function if no handler provided
          createPayment(paymentData);
        }
      }
    });
    
    // Update the transaction status
    setBankTransactions(prev => 
      prev.map(t => {
        if (t.id === selectedTransaction.id) {
          return {
            ...t,
            status: selectedMatches.length > 0 
              ? (selectedMatches.length === 1 ? 'matched' : 'partially_matched')
              : t.status,
            matchedPayments: selectedMatches.length > 0 ? selectedMatches : t.matchedPayments
          };
        }
        return t;
      })
    );
    
    toast.success(t('reconciliation.match_success'));
    setIsMatchDialogOpen(false);
    
    if (onMatchSuccess) {
      onMatchSuccess();
    }
  };
  
  // Handle auto-match all
  const handleAutoMatchAll = () => {
    // In a real app, this would run sophisticated matching algorithms
    // For demo, we'll do a simple match
    const updatedTransactions = bankTransactions.map(transaction => {
      if (transaction.status === 'unmatched') {
        // Find an invoice with similar amount
        const matchingInvoice = mockInvoices.find(inv => 
          (inv.status === 'sent' || inv.status === 'overdue') &&
          Math.abs(inv.total - transaction.amount) < 0.01 * inv.total && // Within 1% of transaction amount
          (!transaction.matchedPayments || !transaction.matchedPayments.includes(inv.id))
        );
        
        if (matchingInvoice) {
          return {
            ...transaction,
            status: 'matched' as const,
            matchedPayments: [matchingInvoice.id],
            matchConfidence: 90
          };
        }
      }
      return transaction;
    });
    
    setBankTransactions(updatedTransactions);
    toast.success(t('reconciliation.auto_match_success'));
  };
  
  // Handle marking a transaction as ignored
  const handleIgnoreTransaction = (id: string) => {
    setBankTransactions(prev => 
      prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            status: 'ignored'
          };
        }
        return t;
      })
    );
    
    toast.success(t('reconciliation.transaction_ignored'));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>{t('reconciliation.title')}</CardTitle>
            <CardDescription>
              {t('reconciliation.description')}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('reconciliation.import')}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onExport && onExport('csv')}
            >
              <FileDown className="h-4 w-4 mr-2" />
              {t('reconciliation.export')}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-600">{t('reconciliation.total_transactions')}</p>
            <p className="text-2xl font-bold">{summary.totalTransactions}</p>
            <p className="text-sm text-blue-600">
              {formatCurrency(summary.totalAmount)}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-600">{t('reconciliation.matched_transactions')}</p>
            <p className="text-2xl font-bold">{summary.matchedTransactions}</p>
            <p className="text-sm text-green-600">
              {formatCurrency(summary.matchedAmount)}
            </p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-md">
            <p className="text-sm text-amber-600">{t('reconciliation.unmatched_transactions')}</p>
            <p className="text-2xl font-bold">{summary.unmatchedTransactions}</p>
            <p className="text-sm text-amber-600">
              {formatCurrency(summary.unmatchedAmount)}
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Date Range */}
          <div>
            <Label>{t('reconciliation.date_range')}</Label>
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
                    <span>{t('reconciliation.date_range')}</span>
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
          
          {/* Status Filter */}
          <div>
            <Label>{t('reconciliation.status')}</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('reconciliation.all_statuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reconciliation.all_statuses')}</SelectItem>
                <SelectItem value="matched">{t('reconciliation.matched')}</SelectItem>
                <SelectItem value="partially_matched">{t('reconciliation.partially_matched')}</SelectItem>
                <SelectItem value="unmatched">{t('reconciliation.unmatched')}</SelectItem>
                <SelectItem value="ignored">{t('reconciliation.ignored')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Search */}
          <div className="md:col-span-2">
            <Label>{t('reconciliation.search')}</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('reconciliation.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
        
        {/* Auto-match button */}
        <div className="mb-4">
          <Button 
            variant="secondary" 
            onClick={handleAutoMatchAll}
            disabled={filteredTransactions.filter(t => t.status === 'unmatched').length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            {t('reconciliation.auto_match_all')}
          </Button>
        </div>
        
        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reconciliation.date')}</TableHead>
                <TableHead>{t('reconciliation.description')}</TableHead>
                <TableHead>{t('reconciliation.reference')}</TableHead>
                <TableHead className="text-right">{t('reconciliation.amount')}</TableHead>
                <TableHead>{t('reconciliation.status')}</TableHead>
                <TableHead>{t('reconciliation.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {t('reconciliation.no_transactions')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'PPP')}
                    </TableCell>
                    <TableCell>
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      {transaction.reference || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          transaction.status === 'matched' && "border-green-200 bg-green-50 text-green-800",
                          transaction.status === 'partially_matched' && "border-amber-200 bg-amber-50 text-amber-800",
                          transaction.status === 'unmatched' && "border-blue-200 bg-blue-50 text-blue-800",
                          transaction.status === 'ignored' && "border-gray-200 bg-gray-50 text-gray-800"
                        )}
                      >
                        {t(`reconciliation.${transaction.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.status !== 'ignored' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleMatchTransaction(transaction)}
                          >
                            {transaction.status === 'unmatched' ? t('reconciliation.match') : t('reconciliation.edit_match')}
                          </Button>
                        )}
                        
                        {transaction.status === 'unmatched' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleIgnoreTransaction(transaction.id)}
                          >
                            {t('reconciliation.ignore')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">
          {t('reconciliation.last_import', { date: format(new Date(), 'PPP') })}
        </div>
      </CardFooter>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reconciliation.import_transactions')}</DialogTitle>
            <DialogDescription>
              {t('reconciliation.import_description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('reconciliation.file_format')}</Label>
              <Select value={importFormat} onValueChange={setImportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder={t('reconciliation.select_format')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="qif">QIF (Quicken)</SelectItem>
                  <SelectItem value="ofx">OFX (Open Financial Exchange)</SelectItem>
                  <SelectItem value="mt940">MT940 (SWIFT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('reconciliation.file')}</Label>
              <Input 
                type="file" 
                accept=".csv,.qif,.ofx,.mt940" 
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('reconciliation.file_requirements')}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleImport} disabled={!importFile}>
              {t('reconciliation.import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Match Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('reconciliation.match_transaction')}</DialogTitle>
            <DialogDescription>
              {t('reconciliation.match_description')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              {/* Transaction details */}
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
                <div>
                  <p className="text-sm text-muted-foreground">{t('reconciliation.date')}</p>
                  <p className="font-medium">{format(new Date(selectedTransaction.date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('reconciliation.amount')}</p>
                  <p className="font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">{t('reconciliation.description')}</p>
                  <p className="font-medium">{selectedTransaction.description}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">{t('reconciliation.reference')}</p>
                  <p className="font-medium">{selectedTransaction.reference || '-'}</p>
                </div>
              </div>
              
              {/* Suggested matches */}
              <div>
                <h3 className="text-sm font-medium mb-2">{t('reconciliation.suggested_matches')}</h3>
                
                {suggestedMatches.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    {t('reconciliation.no_matches_found')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {suggestedMatches.map(match => (
                      <div 
                        key={match.id}
                        className={`p-3 border rounded-md flex items-center justify-between ${
                          selectedMatches.includes(match.id) ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div>
                          <div className="font-medium">
                            {match.invoiceNumber} - {match.clientName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(match.date), 'PPP')} • {formatCurrency(match.amount)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-blue-50">
                            {match.confidence}% {t('reconciliation.match')}
                          </Badge>
                          
                          <Toggle
                            pressed={selectedMatches.includes(match.id)}
                            onPressedChange={(pressed) => {
                              if (pressed) {
                                setSelectedMatches(prev => [...prev, match.id]);
                              } else {
                                setSelectedMatches(prev => prev.filter(id => id !== match.id));
                              }
                            }}
                            aria-label="Select match"
                          >
                            {selectedMatches.includes(match.id) ? 
                              <Check className="h-4 w-4" /> : 
                              <Plus className="h-4 w-4" />
                            }
                          </Toggle>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMatchDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleCompleteMatch}
              disabled={selectedMatches.length === 0}
            >
              {t('reconciliation.confirm_match')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 