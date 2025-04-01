import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditNote, 
  CreditNoteStatus, 
  CreditNoteReason, 
  mockCreditNotes, 
  getCreditNoteById, 
  getClientById 
} from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileX,
  FileMinus,
  ArrowLeft,
  Search,
  AlertCircle,
  Check,
  Ban,
  CornerDownLeft,
  CircleDollarSign
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface CreditNoteListProps {
  onSelectCreditNote: (creditNote: CreditNote) => void;
  onCreateCreditNote: () => void;
  invoiceId?: string; // Optional: to filter by specific invoice
}

const CreditNoteList: React.FC<CreditNoteListProps> = ({
  onSelectCreditNote,
  onCreateCreditNote,
  invoiceId
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [filteredCreditNotes, setFilteredCreditNotes] = useState<CreditNote[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load credit notes
  useEffect(() => {
    const timer = setTimeout(() => {
      // If invoiceId is provided, filter by that invoice
      const notes = invoiceId 
        ? mockCreditNotes.filter(note => note.invoiceId === invoiceId)
        : mockCreditNotes;
      
      setCreditNotes(notes);
      setFilteredCreditNotes(notes);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [invoiceId]);
  
  // Apply filters
  useEffect(() => {
    let result = [...creditNotes];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(note => note.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.creditNoteNumber.toLowerCase().includes(query) || 
        (getClientById(note.clientId)?.name || '').toLowerCase().includes(query)
      );
    }
    
    setFilteredCreditNotes(result);
  }, [creditNotes, statusFilter, searchQuery]);
  
  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'draft', label: t('credit_notes.status.draft') },
    { value: 'issued', label: t('credit_notes.status.issued') },
    { value: 'applied', label: t('credit_notes.status.applied') },
    { value: 'cancelled', label: t('credit_notes.status.cancelled') },
  ];
  
  // Get icon based on credit note reason
  const getReasonIcon = (reason: CreditNoteReason) => {
    switch (reason) {
      case 'defective':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'mistake':
        return <Ban className="h-4 w-4 text-amber-500" />;
      case 'goodwill':
        return <CircleDollarSign className="h-4 w-4 text-blue-500" />;
      case 'return':
        return <CornerDownLeft className="h-4 w-4 text-indigo-500" />;
      case 'other':
        return <Check className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: CreditNoteStatus) => {
    // We'll reuse the StatusBadge component but with credit note specific styling
    let variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success' = 'default';
    
    switch (status) {
      case 'draft':
        variant = 'secondary';
        break;
      case 'issued':
        variant = 'default';
        break;
      case 'applied':
        variant = 'success';
        break;
      case 'cancelled':
        variant = 'destructive';
        break;
    }
    
    return (
      <div className="flex items-center justify-center">
        <StatusBadge status={status} type="credit_note" />
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('credit_notes.title')}</CardTitle>
          <CardDescription>{t('credit_notes.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-10 w-[250px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('credit_notes.title')}</CardTitle>
          <CardDescription>{t('credit_notes.description')}</CardDescription>
        </div>
        {!invoiceId && (
          <Button onClick={onCreateCreditNote}>
            <FileMinus className="h-4 w-4 mr-2" />
            {t('credit_notes.create')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('credit_notes.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('credit_notes.filter_by_status')} />
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
          
          {/* Table */}
          {filteredCreditNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileX className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">{t('credit_notes.no_results')}</h3>
              <p className="text-sm text-muted-foreground">
                {invoiceId 
                  ? t('credit_notes.no_credit_notes_for_invoice') 
                  : t('credit_notes.no_credit_notes')}
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('credit_notes.number')}</TableHead>
                    <TableHead>{t('credit_notes.date')}</TableHead>
                    <TableHead>{t('credit_notes.client')}</TableHead>
                    <TableHead>{t('credit_notes.reason')}</TableHead>
                    <TableHead className="text-right">{t('credit_notes.amount')}</TableHead>
                    <TableHead className="text-center">{t('credit_notes.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCreditNotes.map((creditNote) => (
                    <TableRow 
                      key={creditNote.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectCreditNote(creditNote)}
                    >
                      <TableCell className="font-medium">
                        {creditNote.creditNoteNumber}
                      </TableCell>
                      <TableCell>{formatDate(creditNote.date)}</TableCell>
                      <TableCell>
                        {getClientById(creditNote.clientId)?.name || t('credit_notes.unknown_client')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getReasonIcon(creditNote.reason)}
                          {t(`credit_notes.reason_${creditNote.reason}`)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(creditNote.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(creditNote.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditNoteList; 