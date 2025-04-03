import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Quote, Client, Company, Product, getProductById } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';

// Define shared styling constants
const COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  accent: '#3b82f6',
  muted: '#64748b',
  background: '#f8fafc',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  border: '#e2e8f0',
};

const FONTS = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
  oblique: 'Helvetica-Oblique',
};

interface PDFDocumentOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  language?: string;
}

interface QuoteItem {
  id: string;
  productId: string;  // Make required to match InvoiceItem
  productName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
  total: number;
}

// Create a separate interface instead of extending Quote
interface EnhancedQuote {
  id: string;
  quoteNumber: string;
  clientId: string;
  companyId: string;
  status: string;
  date: string;
  expiryDate: string;
  total: number;
  subtotal: number;
  vatAmount: number;
  discount: number;
  notes?: string;
  terms?: string;
  items: QuoteItem[];
  validityPeriod?: number;
  termsAndConditions?: string;
}

/**
 * Generate a professional PDF for an invoice
 */
export const generateInvoicePDF = (
  invoice: Invoice,
  client: Client | undefined,
  company: Company | undefined,
  options?: PDFDocumentOptions
): jsPDF => {
  // Create new PDF document in portrait mode
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set document properties
  doc.setProperties({
    title: options?.title || `Invoice #${invoice.invoiceNumber}`,
    author: options?.author || company?.name || 'Your Company',
    subject: options?.subject || `Invoice for ${client?.name || 'Client'}`,
    keywords: options?.keywords || 'invoice, billing',
    creator: options?.creator || 'Invoice Management System',
  });

  // Set default font
  doc.setFont(FONTS.regular);
  
  // Add company logo if available
  if (company?.logo) {
    try {
      doc.addImage(company.logo, 'JPEG', 20, 10, 40, 20);
    } catch (e) {
      console.error('Could not add logo to PDF', e);
    }
  }

  // Add company information
  doc.setFont(FONTS.bold);
  doc.setFontSize(20);
  doc.setTextColor(COLORS.primary);
  doc.text(company?.name || 'Your Company', 20, company?.logo ? 40 : 20);
  
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  let yPos = company?.logo ? 45 : 25;
  
  if (company?.address) {
    doc.text(company.address, 20, yPos);
    yPos += 5;
  }
  
  if (company?.city) {
    doc.text(company.city, 20, yPos);
    yPos += 5;
  }
  
  if (company?.phone) {
    doc.text(`Tel: ${company.phone}`, 20, yPos);
    yPos += 5;
  }
  
  if (company?.email) {
    doc.text(`Email: ${company.email}`, 20, yPos);
    yPos += 5;
  }
  
  if (company?.ice) {
    doc.text(`ICE: ${company.ice}`, 20, yPos);
    yPos += 5;
  }
  
  if (company?.if) {
    doc.text(`IF: ${company.if}`, 20, yPos);
    yPos += 5;
  }
  
  if (company?.rc) {
    doc.text(`RC: ${company.rc}`, 20, yPos);
    yPos += 5;
  }

  // Invoice details in top right
  doc.setFont(FONTS.bold);
  doc.setFontSize(18);
  doc.setTextColor(COLORS.primary);
  doc.text('INVOICE', 130, 20);
  
  const borderColor = (status: string) => {
    switch (status) {
      case 'paid': return COLORS.success;
      case 'partial': return COLORS.warning;
      case 'overdue': return COLORS.danger;
      default: return COLORS.accent;
    }
  };
  
  // Status badge
  const statusColor = borderColor(invoice.status);
  doc.setDrawColor(statusColor);
  doc.setFillColor(statusColor);
  doc.roundedRect(150, 25, 40, 10, 2, 2, 'F');
  doc.setFont(FONTS.bold);
  doc.setFontSize(10);
  doc.setTextColor('#ffffff');
  
  // Capitalize first letter and make rest lowercase
  const formattedStatus = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase();
  doc.text(formattedStatus, 170, 31, { align: 'center' });
  
  // Invoice details
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  doc.text(`Invoice Number: #${invoice.invoiceNumber}`, 130, 45);
  doc.text(`Issue Date: ${formatDate(invoice.date)}`, 130, 50);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 130, 55);
  
  // Calculate days overdue if applicable
  if (invoice.status === 'overdue') {
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    doc.setTextColor(COLORS.danger);
    doc.text(`${daysOverdue} days overdue`, 130, 60);
    doc.setTextColor(COLORS.secondary);
  }

  // Client information box
  yPos = Math.max(yPos, 80); // Ensure there's enough space

  doc.setDrawColor(COLORS.border);
  doc.setFillColor(COLORS.background);
  doc.roundedRect(20, yPos, 80, 40, 2, 2, 'FD');
  
  doc.setFont(FONTS.bold);
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary);
  doc.text('BILL TO:', 25, yPos + 7);
  
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  
  let clientYPos = yPos + 14;
  doc.text(client?.name || 'Client Name', 25, clientYPos);
  clientYPos += 5;
  
  if (client?.address) {
    doc.text(client.address, 25, clientYPos);
    clientYPos += 5;
  }
  
  if (client?.city) {
    doc.text(client.city, 25, clientYPos);
    clientYPos += 5;
  }
  
  if (client?.email) {
    doc.text(client.email, 25, clientYPos);
    clientYPos += 5;
  }
  
  if (client?.phone) {
    doc.text(client.phone, 25, clientYPos);
    clientYPos += 5;
  }
  
  if (client?.ice) {
    doc.text(`ICE: ${client.ice}`, 25, clientYPos);
  }

  // Payment information
  doc.setDrawColor(COLORS.border);
  doc.setFillColor(COLORS.background);
  doc.roundedRect(110, yPos, 80, 40, 2, 2, 'FD');
  
  doc.setFont(FONTS.bold);
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary);
  doc.text('PAYMENT DETAILS:', 115, yPos + 7);
  
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  
  if (company?.rib) {
    doc.text(`Bank Account: ${company.rib}`, 115, yPos + 14);
  }
  
  doc.text(`Payment Terms: ${invoice.terms || 'Due on receipt'}`, 115, yPos + 19);
  
  if (invoice.isDeposit) {
    doc.text(`Deposit: ${invoice.depositPercentage}% (${formatCurrency(invoice.depositAmount || 0)})`, 115, yPos + 24);
  }

  // Add items table
  const startY = yPos + 50;
  
  const tableHeaders = [
    { header: 'Item', dataKey: 'product' },
    { header: 'Description', dataKey: 'description' },
    { header: 'Qty', dataKey: 'quantity' },
    { header: 'Unit Price', dataKey: 'unitPrice' },
    { header: 'VAT %', dataKey: 'vatRate' },
    { header: 'Total', dataKey: 'total' },
  ];
  
  const tableData = invoice.items.map(item => {
    const product = getProductById(item.productId);
    return {
      product: product?.name || 'Unknown Product',
      description: item.description || '',
      quantity: item.quantity.toString(),
      unitPrice: formatCurrency(item.unitPrice),
      vatRate: `${item.vatRate}%`,
      total: formatCurrency(item.total),
    };
  });
  
  // Get table properties
  let finalY: number;

  autoTable(doc, {
    startY,
    head: [tableHeaders.map(col => col.header)],
    body: tableData.map(row => 
      tableHeaders.map(col => row[col.dataKey as keyof typeof row])
    ),
    headStyles: {
      fillColor: COLORS.primary,
      textColor: '#ffffff',
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: COLORS.background
    },
    columnStyles: {
      2: { halign: 'center' }, // Quantity centered
      3: { halign: 'right' },  // Unit price right-aligned
      4: { halign: 'right' },  // VAT rate right-aligned
      5: { halign: 'right' },  // Total right-aligned
    },
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    didDrawPage: (data) => {
      finalY = data.cursor.y + 10;
    }
  });

  // If finalY wasn't set in the didDrawPage callback, set a default value
  if (finalY === undefined) {
    finalY = startY + 100; // arbitrary default
  }

  // Add totals section
  // const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Summary box
  doc.setDrawColor(COLORS.border);
  doc.setFillColor(COLORS.background);
  doc.roundedRect(120, finalY, 70, 40, 2, 2, 'FD');
  
  // Summary details
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  
  let summaryY = finalY + 8;
  doc.text('Subtotal:', 125, summaryY);
  doc.text(formatCurrency(invoice.subtotal), 180, summaryY, { align: 'right' });
  summaryY += 6;
  
  doc.text('VAT:', 125, summaryY);
  doc.text(formatCurrency(invoice.vatAmount), 180, summaryY, { align: 'right' });
  summaryY += 6;
  
  if (invoice.discount > 0) {
    doc.text('Discount:', 125, summaryY);
    doc.text('-' + formatCurrency(invoice.discount), 180, summaryY, { align: 'right' });
    summaryY += 6;
  }
  
  // Add a line before total
  doc.setDrawColor(COLORS.muted);
  doc.line(125, summaryY, 180, summaryY);
  summaryY += 5;
  
  // Total
  doc.setFont(FONTS.bold);
  doc.setFontSize(12);
  doc.setTextColor(COLORS.primary);
  doc.text('TOTAL:', 125, summaryY);
  doc.text(formatCurrency(invoice.total), 180, summaryY, { align: 'right' });

  // Add notes and terms if available
  if (invoice.notes || invoice.terms) {
    const notesY = finalY + 50;
    
    if (invoice.notes) {
      doc.setFont(FONTS.bold);
      doc.setFontSize(10);
      doc.setTextColor(COLORS.primary);
      doc.text('Notes:', 20, notesY);
      
      doc.setFont(FONTS.regular);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.secondary);
      doc.text(invoice.notes, 20, notesY + 5, { 
        maxWidth: 170,
        lineHeightFactor: 1.5
      });
    }
    
    if (invoice.terms && !invoice.notes) {
      doc.setFont(FONTS.bold);
      doc.setFontSize(10);
      doc.setTextColor(COLORS.primary);
      doc.text('Payment Terms:', 20, notesY);
      
      doc.setFont(FONTS.regular);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.secondary);
      doc.text(invoice.terms, 20, notesY + 5, { 
        maxWidth: 170,
        lineHeightFactor: 1.5
      });
    } else if (invoice.terms) {
      const termsY = notesY + Math.max(10, doc.getTextDimensions(invoice.notes, { maxWidth: 170 }).h + 10);
      
      doc.setFont(FONTS.bold);
      doc.setFontSize(10);
      doc.setTextColor(COLORS.primary);
      doc.text('Payment Terms:', 20, termsY);
      
      doc.setFont(FONTS.regular);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.secondary);
      doc.text(invoice.terms, 20, termsY + 5, { 
        maxWidth: 170,
        lineHeightFactor: 1.5
      });
    }
  }

  // Add footer with page number and legal information
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const pageHeight = doc.internal.pageSize.height;
    
    // Add divider line
    doc.setDrawColor(COLORS.border);
    doc.line(20, pageHeight - 20, 190, pageHeight - 20);
    
    // Add footer text
    doc.setFont(FONTS.regular);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted);
    
    // Company legal information
    let footerText = company?.name || 'Your Company';
    if (company?.if) footerText += ` | IF: ${company.if}`;
    if (company?.rc) footerText += ` | RC: ${company.rc}`;
    if (company?.ice) footerText += ` | ICE: ${company.ice}`;
    
    doc.text(footerText, 105, pageHeight - 15, { align: 'center' });
    
    // Page number
    doc.text(`Page ${i} of ${pageCount}`, 105, pageHeight - 10, { align: 'center' });
  }

  return doc;
};

/**
 * Generate a professional PDF for a quote
 */
export const generateQuotePDF = (
  quote: Quote | EnhancedQuote,
  client: Client | undefined,
  company: Company | undefined,
  options?: PDFDocumentOptions
): jsPDF => {
  // Create new PDF document in portrait mode
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Helper function to check if quote is EnhancedQuote
  const isEnhancedQuote = (q: Quote | EnhancedQuote): q is EnhancedQuote => {
    return 'validityPeriod' in q || 'termsAndConditions' in q;
  };

  // Get enhanced properties safely
  const validityPeriod = isEnhancedQuote(quote) ? quote.validityPeriod || '30' : '30';
  const termsAndConditions = isEnhancedQuote(quote) ? quote.termsAndConditions : undefined;

  // Set document properties
  doc.setProperties({
    title: options?.title || `Quote #${quote.quoteNumber}`,
    author: options?.author || company?.name || 'Your Company',
    subject: options?.subject || `Quote for ${client?.name || 'Client'}`,
    keywords: options?.keywords || 'quote, proposal',
    creator: options?.creator || 'Quote Management System',
  });

  // Set default font
  doc.setFont(FONTS.regular);
  
  // Add company logo if available
  if (company?.logo) {
    try {
      doc.addImage(company.logo, 'JPEG', 20, 10, 40, 20);
    } catch (e) {
      console.error('Could not add logo to PDF', e);
    }
  }

  // Add company information
  doc.setFont(FONTS.bold);
  doc.setFontSize(20);
  doc.setTextColor(COLORS.primary);
  doc.text(company?.name || 'Your Company', 20, company?.logo ? 40 : 20);
  
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  let yPos = company?.logo ? 45 : 25;
  
  if (company?.address) {
    doc.text(company.address, 20, yPos);
    yPos += 5;
  }
  
  if (company?.city) {
    doc.text(company.city, 20, yPos);
    yPos += 5;
  }
  
  if (company?.phone) {
    doc.text(`Tel: ${company.phone}`, 20, yPos);
    yPos += 5;
  }
  
  if (company?.email) {
    doc.text(`Email: ${company.email}`, 20, yPos);
    yPos += 5;
  }
  
  if (company?.ice) {
    doc.text(`ICE: ${company.ice}`, 20, yPos);
    yPos += 5;
  }
  
  if (company?.if) {
    doc.text(`IF: ${company.if}`, 20, yPos);
    yPos += 5;
  }
  
  if (company?.rc) {
    doc.text(`RC: ${company.rc}`, 20, yPos);
    yPos += 5;
  }

  // Quote details in top right
  doc.setFont(FONTS.bold);
  doc.setFontSize(18);
  doc.setTextColor(COLORS.primary);
  doc.text('QUOTE', 130, 20);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return COLORS.success;
      case 'rejected': return COLORS.danger;
      case 'expired': return COLORS.muted;
      default: return COLORS.accent;
    }
  };
  
  // Status badge
  const statusColor = getStatusColor(quote.status);
  doc.setDrawColor(statusColor);
  doc.setFillColor(statusColor);
  doc.roundedRect(150, 25, 40, 10, 2, 2, 'F');
  doc.setFont(FONTS.bold);
  doc.setFontSize(10);
  doc.setTextColor('#ffffff');
  
  // Capitalize first letter and make rest lowercase
  const formattedStatus = quote.status.charAt(0).toUpperCase() + quote.status.slice(1).toLowerCase();
  doc.text(formattedStatus, 170, 31, { align: 'center' });
  
  // Quote details
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  doc.text(`Quote Number: #${quote.quoteNumber}`, 130, 45);
  doc.text(`Issue Date: ${formatDate(quote.date)}`, 130, 50);
  doc.text(`Valid Until: ${formatDate(quote.expiryDate)}`, 130, 55);

  // Client information box
  yPos = Math.max(yPos, 80); // Ensure there's enough space

  doc.setDrawColor(COLORS.border);
  doc.setFillColor(COLORS.background);
  doc.roundedRect(20, yPos, 80, 40, 2, 2, 'FD');
  
  doc.setFont(FONTS.bold);
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary);
  doc.text('PREPARED FOR:', 25, yPos + 7);
  
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  
  let clientYPos = yPos + 14;
  doc.text(client?.name || 'Client Name', 25, clientYPos);
  clientYPos += 5;
  
  if (client?.address) {
    doc.text(client.address, 25, clientYPos);
    clientYPos += 5;
  }
  
  if (client?.city) {
    doc.text(client.city, 25, clientYPos);
    clientYPos += 5;
  }
  
  if (client?.email) {
    doc.text(client.email, 25, clientYPos);
    clientYPos += 5;
  }
  
  if (client?.phone) {
    doc.text(client.phone, 25, clientYPos);
    clientYPos += 5;
  }
  
  if (client?.ice) {
    doc.text(`ICE: ${client.ice}`, 25, clientYPos);
  }

  // Quote information
  doc.setDrawColor(COLORS.border);
  doc.setFillColor(COLORS.background);
  doc.roundedRect(110, yPos, 80, 40, 2, 2, 'FD');
  
  doc.setFont(FONTS.bold);
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary);
  doc.text('QUOTE DETAILS:', 115, yPos + 7);
  
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  
  doc.text(`Valid for: ${validityPeriod} days`, 115, yPos + 14);
  
  // Calculate days remaining until expiry if not expired/accepted/rejected
  if (!['expired', 'accepted', 'rejected'].includes(quote.status)) {
    const expiryDate = new Date(quote.expiryDate);
    const today = new Date();
    const daysRemaining = Math.max(0, Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    doc.text(`Days remaining: ${daysRemaining}`, 115, yPos + 19);
  }
  
  if (termsAndConditions) {
    doc.text('Includes terms & conditions', 115, yPos + 24);
  }

  // Add items table
  const startY = yPos + 50;
  
  const tableHeaders = [
    { header: 'Item', dataKey: 'product' },
    { header: 'Description', dataKey: 'description' },
    { header: 'Qty', dataKey: 'quantity' },
    { header: 'Unit Price', dataKey: 'unitPrice' },
    { header: 'VAT %', dataKey: 'vatRate' },
    { header: 'Total', dataKey: 'total' },
  ];
  
  const tableData = quote.items.map(item => {
    return {
      product: item.productName || 'Product',
      description: item.description || '',
      quantity: item.quantity.toString(),
      unitPrice: formatCurrency(item.unitPrice),
      vatRate: `${item.vatRate}%`,
      total: formatCurrency(item.total),
    };
  });
  
  // Get table properties
  let finalY: number;

  autoTable(doc, {
    startY,
    head: [tableHeaders.map(col => col.header)],
    body: tableData.map(row => 
      tableHeaders.map(col => row[col.dataKey as keyof typeof row])
    ),
    headStyles: {
      fillColor: COLORS.primary,
      textColor: '#ffffff',
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: COLORS.background
    },
    columnStyles: {
      2: { halign: 'center' }, // Quantity centered
      3: { halign: 'right' },  // Unit price right-aligned
      4: { halign: 'right' },  // VAT rate right-aligned
      5: { halign: 'right' },  // Total right-aligned
    },
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    didDrawPage: (data) => {
      finalY = data.cursor.y + 10;
    }
  });

  // If finalY wasn't set in the didDrawPage callback, set a default value
  if (finalY === undefined) {
    finalY = startY + 100; // arbitrary default
  }

  // Add totals section
  // const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Summary box
  doc.setDrawColor(COLORS.border);
  doc.setFillColor(COLORS.background);
  doc.roundedRect(120, finalY, 70, 40, 2, 2, 'FD');
  
  // Summary details
  doc.setFont(FONTS.regular);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  
  let summaryY = finalY + 8;
  doc.text('Subtotal:', 125, summaryY);
  doc.text(formatCurrency(quote.subtotal), 180, summaryY, { align: 'right' });
  summaryY += 6;
  
  doc.text('VAT:', 125, summaryY);
  doc.text(formatCurrency(quote.vatAmount), 180, summaryY, { align: 'right' });
  summaryY += 6;
  
  if (quote.discount > 0) {
    doc.text('Discount:', 125, summaryY);
    doc.text('-' + formatCurrency(quote.discount), 180, summaryY, { align: 'right' });
    summaryY += 6;
  }
  
  // Add a line before total
  doc.setDrawColor(COLORS.muted);
  doc.line(125, summaryY, 180, summaryY);
  summaryY += 5;
  
  // Total
  doc.setFont(FONTS.bold);
  doc.setFontSize(12);
  doc.setTextColor(COLORS.primary);
  doc.text('TOTAL:', 125, summaryY);
  doc.text(formatCurrency(quote.total), 180, summaryY, { align: 'right' });

  // Add notes and terms if available
  let notesY = finalY + 50;
  
  if (quote.notes) {
    doc.setFont(FONTS.bold);
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary);
    doc.text('Notes:', 20, notesY);
    
    doc.setFont(FONTS.regular);
    doc.setFontSize(9);
    doc.setTextColor(COLORS.secondary);
    doc.text(quote.notes, 20, notesY + 5, { 
      maxWidth: 170,
      lineHeightFactor: 1.5
    });
    
    // Update Y position based on text height
    const textDims = doc.getTextDimensions(quote.notes, { maxWidth: 170 });
    notesY += Math.max(15, textDims.h + 10);
  }
  
  if (termsAndConditions) {
    doc.setFont(FONTS.bold);
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary);
    doc.text('Terms & Conditions:', 20, notesY);
    
    doc.setFont(FONTS.regular);
    doc.setFontSize(9);
    doc.setTextColor(COLORS.secondary);
    doc.text(termsAndConditions, 20, notesY + 5, { 
      maxWidth: 170,
      lineHeightFactor: 1.5
    });
  }

  // Add acceptance section for quotes
  if (quote.status === 'pending_validation' || quote.status === 'awaiting_acceptance') {
    const acceptanceY = notesY + (termsAndConditions ? 
      Math.max(15, doc.getTextDimensions(termsAndConditions, { maxWidth: 170 }).h + 10) : 
      0);
    
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(20, acceptanceY, 170, 40, 2, 2, 'S');
    
    doc.setFont(FONTS.bold);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.primary);
    doc.text('ACCEPTANCE', 105, acceptanceY + 7, { align: 'center' });
    
    doc.setFont(FONTS.regular);
    doc.setFontSize(9);
    doc.setTextColor(COLORS.secondary);
    doc.text('To accept this quote, please sign below and return this document.', 105, acceptanceY + 15, { align: 'center' });
    
    // Signature line
    doc.line(40, acceptanceY + 30, 90, acceptanceY + 30);
    doc.text('Signature', 65, acceptanceY + 35, { align: 'center' });
    
    doc.line(110, acceptanceY + 30, 160, acceptanceY + 30);
    doc.text('Date', 135, acceptanceY + 35, { align: 'center' });
  }

  // Add footer with page number and legal information
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const pageHeight = doc.internal.pageSize.height;
    
    // Add divider line
    doc.setDrawColor(COLORS.border);
    doc.line(20, pageHeight - 20, 190, pageHeight - 20);
    
    // Add footer text
    doc.setFont(FONTS.regular);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted);
    
    // Company legal information
    let footerText = company?.name || 'Your Company';
    if (company?.if) footerText += ` | IF: ${company.if}`;
    if (company?.rc) footerText += ` | RC: ${company.rc}`;
    if (company?.ice) footerText += ` | ICE: ${company.ice}`;
    
    doc.text(footerText, 105, pageHeight - 15, { align: 'center' });
    
    // Page number
    doc.text(`Page ${i} of ${pageCount}`, 105, pageHeight - 10, { align: 'center' });
  }

  return doc;
};

// Utility function to download the PDF
export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
}; 