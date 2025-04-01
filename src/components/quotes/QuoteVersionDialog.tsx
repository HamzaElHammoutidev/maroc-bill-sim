import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { QuoteStatus, Quote, mockQuotes } from '@/data/mockData';
import { AlertCircle, Clock, FileText, History } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface QuoteVersionDialogProps {
  quote: Quote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNewVersion: () => void;
  onViewVersion: (quoteId: string) => void;
}

const QuoteVersionDialog: React.FC<QuoteVersionDialogProps> = ({
  quote,
  open,
  onOpenChange,
  onCreateNewVersion,
  onViewVersion,
}) => {
  const { t } = useTranslation();
  const [versions, setVersions] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine the original quote ID (either the quote's originalQuoteId or its own ID if it's the original)
  const originalId = quote.originalQuoteId || quote.id;
  
  // Load all versions of this quote
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For now, we'll simulate by filtering the mockQuotes
      const relatedQuotes = mockQuotes.filter(q => 
        q.id === originalId || 
        q.originalQuoteId === originalId ||
        q.id === quote.id ||
        q.originalQuoteId === quote.originalQuoteId
      );
      
      // Sort by version number (latest first)
      const sortedVersions = [...relatedQuotes].sort((a, b) => 
        (b.versionNumber || 1) - (a.versionNumber || 1)
      );
      
      setVersions(sortedVersions);
      setIsLoading(false);
    }
  }, [open, originalId, quote]);

  // Get status badge
  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig: Record<QuoteStatus, { label: string, variant: 'default' | 'outline' | 'secondary' | 'destructive' }> = {
      draft: { label: t('quotes.status.draft'), variant: 'outline' },
      pending_validation: { label: t('quotes.status.pending_validation'), variant: 'secondary' },
      awaiting_acceptance: { label: t('quotes.status.awaiting_acceptance'), variant: 'default' },
      accepted: { label: t('quotes.status.accepted'), variant: 'default' },
      rejected: { label: t('quotes.status.rejected'), variant: 'destructive' },
      expired: { label: t('quotes.status.expired'), variant: 'destructive' },
      converted: { label: t('quotes.status.converted'), variant: 'secondary' },
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('quotes.versionHistoryTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('quotes.versionHistoryDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {versions.length === 1 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('quotes.noVersionsTitle')}</AlertTitle>
              <AlertDescription>
                {t('quotes.noVersionsDesc')}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="rounded-md border p-4">
            <h3 className="text-sm font-medium mb-2">{t('quotes.versionInfoTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('quotes.versionInfoDesc')}
            </p>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quotes.version')}</TableHead>
                  <TableHead>{t('quotes.quoteNumber')}</TableHead>
                  <TableHead>{t('quotes.status')}</TableHead>
                  <TableHead>{t('quotes.date')}</TableHead>
                  <TableHead>{t('quotes.amount')}</TableHead>
                  <TableHead className="text-right">{t('form.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.id} className={cn(v.id === quote.id && "bg-muted/50")}>
                    <TableCell className="font-medium">
                      {v.isLatestVersion && (
                        <Badge variant="outline" className="mr-2">
                          {t('quotes.latest')}
                        </Badge>
                      )}
                      {t('quotes.versionNumber', { version: v.versionNumber || 1 })}
                    </TableCell>
                    <TableCell>{v.quoteNumber}</TableCell>
                    <TableCell>{getStatusBadge(v.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{format(new Date(v.createdAt), 'dd/MM/yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(v.total)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewVersion(v.id)}
                        className="h-8 gap-1"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {t('form.view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('form.close')}
          </Button>
          <Button
            onClick={onCreateNewVersion}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            {t('quotes.createNewVersion')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteVersionDialog; 