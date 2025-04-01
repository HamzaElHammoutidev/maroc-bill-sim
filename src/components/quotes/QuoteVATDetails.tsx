import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Receipt, ExternalLink } from 'lucide-react';
import { vatCalculationRules, numberToWords } from '@/config/moroccoConfig';
import { QuoteLineItem } from '@/data/mockData';

interface QuoteVATDetailsProps {
  items: QuoteLineItem[];
  subtotal: number;
  total: number;
  currency?: string;
}

interface VATBreakdown {
  rate: number;
  baseAmount: number;
  vatAmount: number;
}

const QuoteVATDetails: React.FC<QuoteVATDetailsProps> = ({
  items,
  subtotal,
  total,
  currency = 'MAD'
}) => {
  const { t, i18n } = useTranslation();
  
  // Calculate total VAT
  const totalVat = total - subtotal;
  
  // Calculate VAT breakdown by rate
  const vatBreakdown = items.reduce((acc: VATBreakdown[], item) => {
    const vatRate = item.vatRate || 0;
    const existingBreakdown = acc.find(b => b.rate === vatRate);
    
    if (existingBreakdown) {
      existingBreakdown.baseAmount += item.price * item.quantity;
      existingBreakdown.vatAmount += (item.price * item.quantity * vatRate) / 100;
    } else {
      acc.push({
        rate: vatRate,
        baseAmount: item.price * item.quantity,
        vatAmount: (item.price * item.quantity * vatRate) / 100
      });
    }
    
    return acc;
  }, []);
  
  // Format currency
  const formatAmount = (amount: number): string => {
    const roundedAmount = vatCalculationRules.roundForDisplay(amount);
    return new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-MA' : 'ar-MA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(roundedAmount);
  };
  
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-md">{t('quotes.vat_details')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* VAT Breakdown Table */}
          <ScrollArea className="h-auto max-h-[200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quotes.vat_rate')}</TableHead>
                  <TableHead className="text-right">{t('quotes.total_excl_tax')}</TableHead>
                  <TableHead className="text-right">{t('quotes.total_vat')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vatBreakdown.map((breakdown, index) => (
                  <TableRow key={index}>
                    <TableCell>{breakdown.rate}%</TableCell>
                    <TableCell className="text-right">{formatAmount(breakdown.baseAmount)}</TableCell>
                    <TableCell className="text-right">{formatAmount(breakdown.vatAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          
          {/* Totals */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-sm font-medium">{t('quotes.total_excl_tax')}:</span>
              <span className="text-sm font-medium">{formatAmount(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">{t('quotes.total_vat')}:</span>
              <span className="text-sm font-medium">{formatAmount(totalVat)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>{t('quotes.total_incl_tax')}:</span>
              <span>{formatAmount(total)}</span>
            </div>
          </div>
          
          {/* Amount in words */}
          <div className="pt-4 border-t">
            <div className="flex items-start space-x-2">
              <CreditCard className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="space-y-1">
                <span className="text-sm font-medium">{t('quotes.amount_in_words')}:</span>
                <p className="text-sm text-muted-foreground">
                  {numberToWords[i18n.language](total)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Additional VAT Info */}
          <div className="pt-4 border-t">
            <a 
              href="https://www.tax.gov.ma/wps/portal/DGI/Accueil/Production_Reglementaire/TVA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground flex items-center hover:underline"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              {t('quotes.vat_info_link')}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteVATDetails; 