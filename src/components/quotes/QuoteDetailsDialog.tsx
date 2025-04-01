import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, getClientById, getProductById, getCompanyById, QuoteLineItem } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Dialog as DialogComponent,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { Edit, Trash, Copy, FilePieChart, SendHorizontal, Printer, FileDown } from 'lucide-react';
import QuoteLegalNotices from './QuoteLegalNotices';
import QuoteVATDetails from './QuoteVATDetails';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { CurrencySelector } from '../CurrencySelector';
import { defaultCurrency } from '@/config/moroccoConfig';

// This function will need to be implemented or imported 
// when jsPDF and html2canvas are installed
const generatePDF = async (elementId: string, filename: string) => {
  try {
    const { jsPDF } = await import('jspdf');
    const html2canvas = await import('html2canvas');
    
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const canvas = await html2canvas.default(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please check the console for details.');
  }
};

// Generate quote content for PDF/Print
const generateQuoteContent = (quote: Quote, client: any, company: any, t: (key: string, params?: any) => string, isRTL = false) => {
  return `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <title>${quote.quoteNumber}</title>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 1cm;
        }
        html, body {
          font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: white;
          line-height: 1.4;
        }
        * {
          box-sizing: border-box;
        }
        .page {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          padding: 20mm 15mm;
          margin: 0 auto;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }
        .company-info {
          font-weight: normal;
          width: 60%;
        }
        .company-name {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 5px;
          color: #222;
        }
        .company-details {
          font-size: 10px;
          color: #555;
        }
        .quote-info {
          width: 35%;
          text-align: ${isRTL ? 'left' : 'right'};
        }
        .quote-number {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .quote-date {
          font-size: 11px;
          margin-bottom: 3px;
        }
        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 15px;
          font-size: 11px;
          font-weight: bold;
          margin-top: 5px;
          background-color: #eef2ff;
          color: #2563eb;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .client-info {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .client-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .client-details {
          font-size: 12px;
          color: #555;
        }
        .grid {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -10px;
        }
        .grid-col-2 {
          flex: 0 0 50%;
          padding: 0 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        thead th {
          background-color: #f3f4f6;
          text-align: ${isRTL ? 'right' : 'left'};
          padding: 10px;
          font-weight: bold;
          color: #1f2937;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }
        tbody td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }
        .text-right {
          text-align: ${isRTL ? 'left' : 'right'};
        }
        .totals {
          margin-top: 20px;
          width: 300px;
          ${isRTL ? 'margin-right: auto;' : 'margin-left: auto;'}
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 12px;
        }
        .total-label {
          font-weight: normal;
          color: #4b5563;
        }
        .subtotal-row {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .grand-total {
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #e5e7eb;
          color: #1f2937;
        }
        .notes-section {
          margin-top: 30px;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 5px;
          font-size: 12px;
        }
        .notes-title {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 14px;
          color: #4b5563;
        }
        .notes-content {
          color: #4b5563;
          white-space: pre-line;
        }
        .terms-section {
          margin-top: 20px;
          font-size: 12px;
          color: #4b5563;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 5px;
        }
        .terms-title {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 14px;
          color: #4b5563;
        }
        .footer {
          position: absolute;
          bottom: 15mm;
          left: 15mm;
          right: 15mm;
          text-align: center;
          font-size: 9px;
          color: #9ca3af;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
        }
        .legal-details {
          margin-top: 5px;
        }
        .vat-summary {
          margin-top: 20px;
          width: 100%;
          font-size: 11px;
        }
        .vat-summary table {
          width: 100%;
          border-collapse: collapse;
        }
        .vat-summary th {
          background-color: #f3f4f6;
          padding: 8px;
          text-align: ${isRTL ? 'right' : 'left'};
        }
        .vat-summary td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .quote-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          opacity: 0.03;
          color: #000;
          z-index: 0;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Watermark for drafts or specific statuses -->
        ${quote.status === 'draft' ? `<div class="quote-watermark">${t('quotes.status.draft').toUpperCase()}</div>` : ''}
        
        <div class="header">
          <div class="company-info">
            <div class="company-name">${company?.name || ''}</div>
            <div class="company-details">
              ${company?.address ? `${company.address}<br>` : ''}
              ${company?.city ? `${company.city}<br>` : ''}
              ${company?.phone ? `${t('company.phone')}: ${company.phone}<br>` : ''}
              ${company?.email ? `${t('company.email')}: ${company.email}<br>` : ''}
              ${company?.website ? `${company.website}` : ''}
            </div>
          </div>
          <div class="quote-info">
            <div class="quote-number">${t('quotes.quotation')}</div>
            <div class="quote-number">${quote.quoteNumber}</div>
            <div class="quote-date">${t('quotes.dateLabel')}: ${formatDate(quote.date)}</div>
            <div class="quote-date">${t('quotes.expiryLabel')}: ${formatDate(quote.expiryDate)}</div>
            <div class="status-badge">${t(`quotes.status.${quote.status}`)}</div>
          </div>
        </div>

        <div class="grid">
          <div class="grid-col-2">
            <div class="section">
              <div class="section-title">${t('quotes.client')}</div>
              <div class="client-info">
                <div class="client-name">${client?.name || t('quotes.unknownClient')}</div>
                <div class="client-details">
                  ${client?.address ? `${client.address}<br>` : ''}
                  ${client?.city ? `${client.city}<br>` : ''}
                  ${client?.phone ? `${t('client.phone')}: ${client.phone}<br>` : ''}
                  ${client?.email ? `${t('client.email')}: ${client.email}` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid-col-2">
            <div class="section">
              <div class="section-title">${t('quotes.paymentInfo')}</div>
              <div class="client-info">
                ${quote.terms ? `
                  <div class="client-details">
                    <strong>${t('quotes.paymentTerms')}</strong><br>
                    ${quote.terms}
                  </div>
                ` : t('quotes.standardPaymentTerms')}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">${t('quotes.items')}</div>
          <table>
            <thead>
              <tr>
                <th>${t('quotes.itemDescription')}</th>
                <th class="text-right">${t('quotes.quantity')}</th>
                <th class="text-right">${t('quotes.unitPrice')}</th>
                <th class="text-right">${t('quotes.vatRate')}</th>
                <th class="text-right">${t('quotes.discount')}</th>
                <th class="text-right">${t('quotes.total')}</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                  <td class="text-right">${item.vatRate}%</td>
                  <td class="text-right">${formatCurrency(item.discount)}</td>
                  <td class="text-right">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row subtotal-row">
              <span class="total-label">${t('quotes.subtotal')}:</span>
              <span>${formatCurrency(quote.subtotal)}</span>
            </div>
            ${quote.discount > 0 ? `
              <div class="total-row">
                <span class="total-label">${t('quotes.discount')}:</span>
                <span>-${formatCurrency(quote.discount)}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span class="total-label">${t('quotes.vat')}:</span>
              <span>${formatCurrency(quote.vatAmount)}</span>
            </div>
            <div class="total-row grand-total">
              <span>${t('quotes.total')}:</span>
              <span>${formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        <!-- VAT Summary by rate -->
        <div class="vat-summary">
          <div class="section-title">${t('quotes.vat_summary')}</div>
          <table>
            <thead>
              <tr>
                <th>${t('quotes.vatRate')}</th>
                <th class="text-right">${t('quotes.taxable_amount')}</th>
                <th class="text-right">${t('quotes.vat_amount')}</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                // Group items by VAT rate and calculate totals
                interface VatRateSummary {
                  taxable: number;
                  vat: number;
                }
                
                const vatRates: Record<string, VatRateSummary> = {};
                quote.items.forEach(item => {
                  const rate = item.vatRate;
                  if (!vatRates[rate]) {
                    vatRates[rate] = { taxable: 0, vat: 0 };
                  }
                  const taxableAmount = item.quantity * item.unitPrice - item.discount;
                  const vatAmount = taxableAmount * (rate / 100);
                  vatRates[rate].taxable += taxableAmount;
                  vatRates[rate].vat += vatAmount;
                });
                
                return Object.entries(vatRates).map(([rate, amounts]) => `
                  <tr>
                    <td>${rate}%</td>
                    <td class="text-right">${formatCurrency(amounts.taxable)}</td>
                    <td class="text-right">${formatCurrency(amounts.vat)}</td>
                  </tr>
                `).join('');
              })()}
            </tbody>
          </table>
        </div>

        ${quote.notes ? `
          <div class="notes-section">
            <div class="notes-title">${t('quotes.notes')}</div>
            <div class="notes-content">${quote.notes}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>${company?.name || ''}</div>
          <div class="legal-details">
            ${t('quotes.ice')}: ${company?.ice || ''} - ${t('quotes.if')}: ${company?.if || ''}
          </div>
          <div>${t('quotes.document_generated', { date: new Date().toLocaleDateString() })}</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

interface QuoteDetailsDialogProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onSend?: () => void;
  onConvert?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

// Add interface to extend Quote with properties for Moroccan features
interface ExtendedQuote extends Quote {
  currency?: string;
  customLegalNotices?: string;
}

const QuoteDetailsDialog: React.FC<QuoteDetailsDialogProps> = ({
  quote,
  open,
  onOpenChange,
  onEdit,
  onSend,
  onConvert,
  onDuplicate,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [currency, setCurrency] = useState(defaultCurrency);

  if (!quote) return null;

  const client = getClientById(quote.clientId);
  const company = getCompanyById(quote.companyId);
  
  // Only allow editing of draft or sent quotes
  const canEdit = ['draft', 'pending_validation', 'awaiting_acceptance'].includes(quote.status);
  // Only allow sending of draft quotes or those awaiting acceptance
  const canSend = ['draft', 'pending_validation', 'awaiting_acceptance'].includes(quote.status);
  // Only allow conversion of accepted quotes
  const canConvert = quote.status === 'accepted';
  // Only allow deletion of non-converted quotes
  const canDelete = quote.status !== 'converted';

  // Convert InvoiceItem to QuoteLineItem for VAT details component
  const quoteLineItems: QuoteLineItem[] = quote.items.map(item => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unit: 'unit',
    price: item.unitPrice, // Use unitPrice from InvoiceItem
    vatRate: item.vatRate,
    discount: item.discount,
    total: item.total
  }));

  // Add calculated VAT
  const subtotal = quote.subtotal;
  const totalVat = quote.vatAmount;

  // Print handler
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate print content
    const printContent = generateQuoteContent(quote, client, company, t, isRTL);

    // Write to the window and print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Print after the content is loaded
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  // PDF export handler
  const handleExportPDF = () => {
    // Create a container for the PDF content
    const tempDiv = document.createElement('div');
    tempDiv.id = 'pdf-export-container';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Generate content
    const pdfContent = generateQuoteContent(quote, client, company, t, isRTL);
    tempDiv.innerHTML = pdfContent;
    
    // Generate and download the PDF
    generatePDF('pdf-export-container', `quote-${quote.quoteNumber}`);
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(tempDiv);
    }, 100);
  };

  return (
    <DialogComponent open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background z-10 pb-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{t('quotes.viewQuote')}</DialogTitle>
              <div className="flex items-center space-x-2">
                <LanguageSwitcher />
                <CurrencySelector value={currency} onChange={setCurrency} />
              </div>
            </div>
            <DialogDescription>
              {t('quotes.quoteDetails')} {quote?.quoteNumber}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {company?.logo && (
                <img 
                  src={company.logo} 
                  alt={company?.name || t('common.companyLogo')} 
                  className="h-12 mr-3" 
                />
              )}
              <div>
                <h2 className="text-lg font-bold">{company?.name}</h2>
                {company?.address && <p className="text-sm text-muted-foreground">{company.address}</p>}
                {company?.city && <p className="text-sm text-muted-foreground">{company.city}</p>}
                {company?.phone && <p className="text-sm text-muted-foreground">{company.phone}</p>}
                {company?.email && <p className="text-sm text-muted-foreground">{company.email}</p>}
                {company?.website && <p className="text-sm text-muted-foreground">{company.website}</p>}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end">
                <span>{quote.quoteNumber}</span>
              </div>
              <StatusBadge status={quote.status} type="quote" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-1">{t('quotes.client')}</h3>
              <p className="text-base">{client?.name || t('quotes.unknownClient')}</p>
              {client?.address && (
                <p className="text-sm text-muted-foreground">{client.address}</p>
              )}
              {client?.city && (
                <p className="text-sm text-muted-foreground">{client.city}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{t('quotes.dateLabel')}:</span>
                <span>{formatDate(quote.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">{t('quotes.expiryLabel')}:</span>
                <span>{formatDate(quote.expiryDate)}</span>
              </div>
              {quote.convertedInvoiceId && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{t('quotes.invoiceLabel')}:</span>
                  <span>{quote.convertedInvoiceId}</span>
                </div>
              )}
              {quote.terms && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{t('quotes.paymentTerms')}:</span>
                  <span>{quote.terms}</span>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="py-4">
            <h3 className="font-medium mb-2">{t('quotes.items')}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quotes.itemDescription')}</TableHead>
                  <TableHead className="text-right">{t('quotes.quantity')}</TableHead>
                  <TableHead className="text-right">{t('quotes.unitPrice')}</TableHead>
                  <TableHead className="text-right">{t('quotes.vatRate')}</TableHead>
                  <TableHead className="text-right">{t('quotes.discount')}</TableHead>
                  <TableHead className="text-right">{t('quotes.total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{item.vatRate}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="space-y-2 py-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">{t('quotes.subtotal')}:</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span className="text-sm">{t('quotes.discount')}:</span>
                <span>-{formatCurrency(quote.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span className="text-sm">{t('quotes.vat')}:</span>
              <span>{formatCurrency(quote.vatAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>{t('quotes.total')}:</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
          
          {quote.notes && (
            <div className="py-2">
              <h3 className="text-sm font-medium mb-1">{t('quotes.notes')}</h3>
              <p className="text-sm text-muted-foreground">{quote.notes}</p>
            </div>
          )}
          
          <div className="flex justify-end space-y-2">
            <div className="w-[300px] space-y-1">
              <div className="flex justify-between text-sm">
                <span>{t('quotes.total_excl_tax')}:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('quotes.total_vat')}:</span>
                <span>{formatCurrency(totalVat)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>{t('quotes.total_incl_tax')}:</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>
          
          <div className="grid gap-4 mt-6 lg:grid-cols-2">
            <QuoteVATDetails 
              items={quoteLineItems}
              subtotal={subtotal}
              total={quote.total}
              currency={currency}
            />
            
            <QuoteLegalNotices
              customNotices={(quote as ExtendedQuote).customLegalNotices}
              onNoticesChange={() => {}}
              readOnly={true}
            />
          </div>
          
          <DialogFooter className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={!canEdit}
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-1" />
              {t('form.edit')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSend}
              disabled={!canSend}
              className="w-full"
            >
              <SendHorizontal className="h-4 w-4 mr-1" />
              {t('quotes.send')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onConvert}
              disabled={!canConvert}
              className="w-full"
            >
              <FilePieChart className="h-4 w-4 mr-1" />
              {t('quotes.convert')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-1" />
              {t('quotes.duplicate')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="w-full col-span-1 sm:col-span-2 mt-2 mb-2"
            >
              <Printer className="h-4 w-4 mr-1" />
              {t('quotes.print')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="w-full col-span-1 sm:col-span-2 mt-2 mb-2"
            >
              <FileDown className="h-4 w-4 mr-1" />
              {t('quotes.export_pdf')}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={!canDelete}
              className="w-full col-span-2 sm:col-span-4 mt-2"
            >
              <Trash className="h-4 w-4 mr-1" />
              {t('form.delete')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </DialogComponent>
  );
};

export default QuoteDetailsDialog;
