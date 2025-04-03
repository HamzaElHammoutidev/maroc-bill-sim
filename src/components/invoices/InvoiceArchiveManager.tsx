import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { History, Download, Archive, Info, AlertCircle } from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface InvoiceArchiveManagerProps {
  invoice: Invoice;
  onViewArchive?: (archiveUrl: string) => void;
  onDownloadArchive?: (archiveUrl: string) => void;
}

const InvoiceArchiveManager: React.FC<InvoiceArchiveManagerProps> = ({
  invoice,
  onViewArchive,
  onDownloadArchive
}) => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  
  // Check if invoice has been archived
  const isArchived = !!invoice.archiveVersion && !!invoice.archivedAt;
  
  const handleViewArchive = () => {
    if (invoice.archiveUrl && onViewArchive) {
      onViewArchive(invoice.archiveUrl);
    }
  };
  
  const handleDownloadArchive = () => {
    if (invoice.archiveUrl && onDownloadArchive) {
      onDownloadArchive(invoice.archiveUrl);
    }
  };
  
  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('invoices.archive_info') || "Informations d'archivage"}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('invoices.archive_details') || "Détails d'archivage"}</DialogTitle>
            <DialogDescription>
              {t('invoices.archive_details_desc') || "Informations sur l'archivage et la traçabilité de cette facture"}
            </DialogDescription>
          </DialogHeader>
          
          {isArchived ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{t('invoices.archive_info') || "Informations d'archivage"}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">{t('invoices.archive_version') || "Version"}</div>
                  <div>{invoice.archiveVersion}</div>
                  
                  <div className="text-muted-foreground">{t('invoices.archived_at') || "Date d'archivage"}</div>
                  <div>{formatDate(invoice.archivedAt || '')}</div>
                  
                  <div className="text-muted-foreground">{t('invoices.invoice_status') || "Statut"}</div>
                  <div>
                    <Badge variant={
                      invoice.status === 'paid' ? 'success' : 
                      invoice.status === 'sent' ? 'default' : 
                      invoice.status === 'overdue' ? 'destructive' : 
                      invoice.status === 'partial' ? 'warning' : 
                      'outline'
                    }>
                      {t(`invoices.status_${invoice.status}`) || invoice.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">{t('invoices.validation_info') || "Informations de validation"}</h4>
                {invoice.isValidated ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">{t('invoices.validated_at') || "Validée le"}</div>
                    <div>{formatDate(invoice.validatedAt || '')}</div>
                    
                    <div className="text-muted-foreground">{t('invoices.validated_by') || "Validée par"}</div>
                    <div>{invoice.validatedBy}</div>
                    
                    <div className="text-muted-foreground">{t('invoices.locked_status') || "Verrouillage"}</div>
                    <div>
                      <Badge variant={invoice.isLocked ? 'default' : 'outline'}>
                        {invoice.isLocked ? 
                          (t('invoices.locked') || "Verrouillée") : 
                          (t('invoices.unlocked') || "Non verrouillée")}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t('invoices.not_validated') || "Cette facture n'a pas encore été validée"}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">{t('invoices.email_info') || "Informations d'envoi"}</h4>
                {invoice.sentAt ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">{t('invoices.sent_at') || "Envoyée le"}</div>
                    <div>{formatDate(invoice.sentAt)}</div>
                    
                    <div className="text-muted-foreground">{t('invoices.sent_by') || "Envoyée par"}</div>
                    <div>{invoice.sentBy}</div>
                    
                    <div className="text-muted-foreground">{t('invoices.recipients') || "Destinataires"}</div>
                    <div>{invoice.emailRecipients?.join(', ') || '-'}</div>
                    
                    {invoice.emailCc && invoice.emailCc.length > 0 && (
                      <>
                        <div className="text-muted-foreground">{t('invoices.cc') || "Copie"}</div>
                        <div>{invoice.emailCc.join(', ')}</div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t('invoices.not_sent') || "Cette facture n'a pas encore été envoyée"}
                  </div>
                )}
              </div>
              
              <DialogFooter className="pt-4">
                {invoice.archiveUrl && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleViewArchive}>
                      <Info className="h-4 w-4 mr-2" />
                      {t('invoices.view_archive') || "Voir l'archive"}
                    </Button>
                    <Button variant="default" size="sm" onClick={handleDownloadArchive}>
                      <Download className="h-4 w-4 mr-2" />
                      {t('invoices.download_archive') || "Télécharger l'archive"}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('invoices.not_archived') || "Non archivée"}</AlertTitle>
              <AlertDescription>
                {t('invoices.not_archived_desc') || "Cette facture n'a pas encore été archivée. L'archivage est effectué automatiquement lors de l'envoi de la facture."}
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceArchiveManager; 