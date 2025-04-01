import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import { 
  CreditNote, 
  CreditNoteStatus, 
  mockCreditNotes, 
  getCreditNoteById, 
  getClientById 
} from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  FileMinus, 
  FileCheck, 
  RefreshCcw, 
  CheckCircle, 
  X, 
  Info,
  FileX,
  BellRing
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CreditNoteList from '@/components/invoices/CreditNoteList';
import CreditNoteForm from '@/components/invoices/CreditNoteForm';
import CreditNoteDetailsDialog from '@/components/invoices/CreditNoteDetailsDialog';

const CreditNotes = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [isLoading, setIsLoading] = useState(true);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null);
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateForm, setIsCreateForm] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  useEffect(() => {
    if (invoiceId) {
      setIsCreateForm(true);
      setIsFormOpen(true);
    }
  }, [invoiceId]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setCreditNotes(mockCreditNotes);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleCreateCreditNote = () => {
    setSelectedCreditNote(null);
    setIsCreateForm(true);
    setIsFormOpen(true);
  };
  
  const handleViewCreditNote = (creditNote: CreditNote) => {
    setSelectedCreditNote(creditNote);
    setIsDetailsOpen(true);
  };
  
  const handleEditCreditNote = (creditNote: CreditNote) => {
    if (creditNote.status !== 'draft') {
      toast({
        title: t('credit_notes.edit_error'),
        description: t('credit_notes.edit_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedCreditNote(creditNote);
    setIsCreateForm(false);
    setIsFormOpen(true);
  };
  
  const handleApplyCreditNote = (creditNote: CreditNote) => {
    if (creditNote.isFullyApplied) {
      toast({
        title: t('credit_notes.apply_error'),
        description: t('credit_notes.apply_error_desc'),
        variant: 'destructive'
      });
      return;
    }
    
    toast({
      title: t('credit_notes.apply_credit'),
      description: t('credit_notes.apply_credit_desc'),
    });
  };
  
  const handleCreditNoteFormSubmit = (creditNote: CreditNote) => {
    toast({
      title: isCreateForm 
        ? t('credit_notes.created') 
        : t('credit_notes.updated'),
      description: `${t('credit_notes.credit_note')} #${creditNote.creditNoteNumber}`,
    });
    
    setCreditNotes([...mockCreditNotes]);
    setIsFormOpen(false);
  };
  
  const getStatusCounts = () => {
    const counts = {
      draft: 0,
      issued: 0,
      applied: 0,
      cancelled: 0,
      total: creditNotes.length
    };
    
    creditNotes.forEach(note => {
      if (counts.hasOwnProperty(note.status)) {
        counts[note.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();
  
  const statusCards = [
    {
      title: t('credit_notes.status.draft'),
      count: statusCounts.draft,
      icon: <FileMinus className="h-8 w-8 text-gray-500" />,
      className: 'bg-gray-50 border-gray-200'
    },
    {
      title: t('credit_notes.status.issued'),
      count: statusCounts.issued,
      icon: <RefreshCcw className="h-8 w-8 text-blue-500" />,
      className: 'bg-blue-50 border-blue-200'
    },
    {
      title: t('credit_notes.status.applied'),
      count: statusCounts.applied,
      icon: <FileCheck className="h-8 w-8 text-green-500" />,
      className: 'bg-green-50 border-green-200'
    },
    {
      title: t('credit_notes.status.cancelled'),
      count: statusCounts.cancelled,
      icon: <FileX className="h-8 w-8 text-red-500" />,
      className: 'bg-red-50 border-red-200'
    }
  ];
  
  const calculateTotalCreditAmount = () => {
    return creditNotes.reduce((sum, note) => sum + note.total, 0);
  };
  
  const calculateRemainingCreditAmount = () => {
    return creditNotes.reduce((sum, note) => {
      const remainingAmount = note.remainingAmount !== undefined 
        ? note.remainingAmount 
        : (note.isFullyApplied ? 0 : note.total);
      return sum + remainingAmount;
    }, 0);
  };
  
  const totalCreditAmount = calculateTotalCreditAmount();
  const remainingCreditAmount = calculateRemainingCreditAmount();
  
  return (
    <div>
      <PageHeader 
        title={t('credit_notes.title')} 
        description={t('credit_notes.description')}
        action={{
          label: t('credit_notes.create'),
          onClick: handleCreateCreditNote
        }}
      />
      
      {isLoading ? (
        <div className="space-y-6">
          <Card className="h-[200px] w-full rounded-lg">
            <CardContent className="h-full flex items-center justify-center">
              <div className="animate-pulse w-full h-full bg-gray-200 rounded-lg" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {statusCards.map((card, index) => (
              <Card key={index} className={`${card.className} shadow-sm`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    {card.title}
                    <span>{card.icon}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{card.count}</p>
                </CardContent>
              </Card>
            ))}
            
            <Card className="bg-purple-50 border-purple-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  {t('credit_notes.total_amount')}
                  <span><BellRing className="h-8 w-8 text-purple-500" /></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(totalCreditAmount)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 border-amber-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  {t('credit_notes.remaining_amount')}
                  <span><RefreshCcw className="h-8 w-8 text-amber-500" /></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(remainingCreditAmount)}</p>
              </CardContent>
            </Card>
          </div>
          
          <CreditNoteList
            onSelectCreditNote={handleViewCreditNote}
            onCreateCreditNote={handleCreateCreditNote}
          />
        </>
      )}
      
      <CreditNoteForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreditNoteFormSubmit}
        onCancel={() => setIsFormOpen(false)}
        creditNote={isCreateForm ? undefined : selectedCreditNote || undefined}
        invoiceId={invoiceId || undefined}
      />
      
      {selectedCreditNote && (
        <CreditNoteDetailsDialog
          creditNote={selectedCreditNote}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onEdit={handleEditCreditNote}
          onApply={handleApplyCreditNote}
        />
      )}
    </div>
  );
};

export default CreditNotes;
