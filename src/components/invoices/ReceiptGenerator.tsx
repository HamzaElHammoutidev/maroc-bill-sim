import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ProformaInvoice, mockClients, mockCompanies } from '@/data/mockData';

interface ReceiptGeneratorProps {
  proforma: ProformaInvoice;
  onDownload: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ proforma, onDownload }) => {
  const { t } = useTranslation();

  const generateReceipt = () => {
    // Create a new window for the receipt
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    // Get the client and company details
    const client = mockClients.find(c => c.id === proforma.clientId);
    const company = mockCompanies.find(c => c.id === proforma.companyId);

    if (!client || !company) return;

    // Create the receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('invoices.receipt')} - ${proforma.proformaNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .company-info {
            margin-bottom: 20px;
          }
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          }
          .receipt-details {
            margin-bottom: 30px;
          }
          .receipt-details p {
            margin: 5px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .items-table th {
            background-color: #f5f5f5;
          }
          .totals {
            margin-top: 20px;
            text-align: right;
          }
          .totals p {
            margin: 5px 0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .signature {
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .signature p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>${t('invoices.receipt')}</h1>
            <p>${t('invoices.receipt_number')}: ${proforma.proformaNumber}</p>
          </div>

          <div class="company-info">
            <h2>${company.name}</h2>
            <p>${t('invoices.address')}: ${company.address}</p>
            <p>${t('invoices.phone')}: ${company.phone}</p>
            <p>${t('invoices.email')}: ${company.email}</p>
            <p>${t('invoices.tax_id')}: ${company.taxId}</p>
          </div>

          <div class="receipt-details">
            <p><strong>${t('invoices.client')}:</strong> ${client.name}</p>
            <p><strong>${t('invoices.date')}:</strong> ${format(new Date(proforma.date), 'PPP', { locale: fr })}</p>
            <p><strong>${t('invoices.payment_date')}:</strong> ${format(new Date(), 'PPP', { locale: fr })}</p>
            <p><strong>${t('invoices.payment_method')}:</strong> ${t('invoices.cash')}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>${t('invoices.description')}</th>
                <th>${t('invoices.quantity')}</th>
                <th>${t('invoices.unit_price')}</th>
                <th>${t('invoices.vat')}</th>
                <th>${t('invoices.total')}</th>
              </tr>
            </thead>
            <tbody>
              ${proforma.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${item.vatRate}%</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>${t('invoices.subtotal')}:</strong> ${formatCurrency(proforma.subtotal)}</p>
            <p><strong>${t('invoices.vat_amount')}:</strong> ${formatCurrency(proforma.vatAmount)}</p>
            <p><strong>${t('invoices.discount')}:</strong> ${formatCurrency(proforma.discount)}</p>
            <p><strong>${t('invoices.total')}:</strong> ${formatCurrency(proforma.total)}</p>
          </div>

          <div class="signature">
            <p>${t('invoices.payment_received_by')}: _________________</p>
            <p>${t('invoices.signature')}: _________________</p>
            <p>${t('invoices.date')}: _________________</p>
          </div>

          <div class="footer">
            <p>${t('invoices.receipt_footer')}</p>
            <p>${t('invoices.thank_you')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Write the HTML to the new window
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();

    // Wait for the content to load before printing
    receiptWindow.onload = () => {
      receiptWindow.print();
    };
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        generateReceipt();
        onDownload();
      }}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {t('invoices.download_receipt')}
    </Button>
  );
};

export default ReceiptGenerator; 