// This file contains all the mock data for the application

import { User, UserRole } from "../contexts/AuthContext";

// Types for our domain models
export interface Company {
  id: string;
  name: string;
  ice: string; // Identifiant Commun de l'Entreprise
  if: string; // Identifiant Fiscal
  rc: string; // Registre de Commerce
  cnss?: string; // CNSS number
  address: string;
  city: string;
  phone: string;
  email: string;
  logo?: string;
  website?: string;
  rib?: string; // Bank account info
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  ice?: string; // Identifiant Commun de l'Entreprise (optional for some clients)
  if?: string; // Identifiant Fiscal
  rc?: string; // Registre de Commerce
  cnss?: string; // CNSS number (optional)
  address: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;
  contactName?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for customer management
  category?: 'VIP' | 'regular' | 'prospect' | 'new' | string; // Customer segmentation
  contacts?: Contact[]; // Additional contact persons
  preferredPaymentMethod?: 'cash' | 'bank' | 'check' | 'online' | 'other';
  paymentTerms?: string; // Standard payment terms (30 days, 60 days, etc.)
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  description: string;
  price: number;
  vatRate: number; // 0, 7, 10, 14, 20
  unit: string; // piece, hour, kg, etc.
  isService: boolean;
  reference?: string; // Internal reference code
  barcode?: string; // Barcode for physical products (EAN, UPC, etc.)
  category?: string; // Product category ID
  minQuantity?: number; // Minimum order quantity
  discounts?: ProductDiscount[]; // Associated discounts
  
  // Stock management fields
  manageStock?: boolean; // Whether to track inventory for this product
  currentStock?: number; // Current stock level
  minStock?: number; // Minimum stock level
  alertStock?: number; // Alert threshold
  locationId?: string; // Storage location ID
  
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDiscount {
  id: string;
  productId: string;
  name: string;
  type: 'percentage' | 'fixed'; // Percentage or fixed amount
  value: number; // Percentage (0-100) or fixed amount
  clientCategory?: string; // Optional: Apply only to specific client category
  clientId?: string; // Optional: Apply only to specific client
  startDate?: string; // Optional: Validity period start
  endDate?: string; // Optional: Validity period end
  code?: string; // Optional: Promo code to apply the discount
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type QuoteStatus = 'draft' | 'pending_validation' | 'awaiting_acceptance' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type CreditNoteStatus = 'draft' | 'issued' | 'applied' | 'cancelled';
export type CreditNoteReason = 'defective' | 'mistake' | 'goodwill' | 'return' | 'other';

export interface InvoiceItem {
  id: string;
  invoiceId?: string;
  quoteId?: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discount: number;
  total: number;
  paidAmount?: number; // Amount already paid
  lastPaymentDate?: string; // Date of the last payment
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  quoteId?: string; // If converted from a quote
  
  // Fiscal stamp information
  hasFiscalStamp?: boolean;
  fiscalStampAmount?: number;
  fiscalStampId?: string;
  
  // Invoice validation and locking
  isValidated?: boolean;
  validatedAt?: string;
  validatedBy?: string;
  isLocked?: boolean; // When true, invoice number is finalized and cannot be modified
  
  // Email tracking
  sentAt?: string;
  sentBy?: string;
  emailRecipients?: string[];
  emailCc?: string[];
  emailHistory?: EmailHistoryEntry[];
  
  // Deposit information
  isDeposit?: boolean;
  depositForInvoiceId?: string; // If this is a deposit invoice, reference to the main invoice
  hasDepositInvoice?: boolean; // If this invoice has an associated deposit invoice
  depositInvoiceId?: string; // Reference to the deposit invoice
  depositAmount?: number; // Amount of the deposit
  depositPercentage?: number; // Percentage of the total represented by the deposit
  
  // Credit note tracking
  hasCreditNotes?: boolean;
  creditNoteIds?: string[]; // IDs of credit notes associated with this invoice
  creditNoteTotal?: number; // Total amount of credit notes applied to this invoice
  
  // Document archiving
  archiveVersion?: number; // Version number for archiving
  archiveUrl?: string; // URL to archived document
  archivedAt?: string; // When the invoice was archived
}

export type ProformaInvoiceStatus = 'draft' | 'sent' | 'converted' | 'expired' | 'cancelled';

export interface ProformaInvoice {
  id: string;
  companyId: string;
  clientId: string;
  proformaNumber: string;
  date: string;
  expiryDate: string;
  status: ProformaInvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discount: number;
  total: number;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  convertedInvoiceId?: string; // Reference to the invoice if converted
  convertedAt?: string; // When it was converted to a real invoice
}

export interface CreditNote {
  id: string;
  companyId: string;
  clientId: string;
  invoiceId: string; // Reference to the original invoice
  creditNoteNumber: string; // AVO-YYYY-#### format
  date: string;
  status: CreditNoteStatus;
  reason: CreditNoteReason;
  reasonDescription?: string; // Additional details about the reason
  items: InvoiceItem[]; // Same structure as invoice items for simplicity
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Stock impact
  affectsStock?: boolean; // Whether this credit note should adjust stock quantities
  stockAdjusted?: boolean; // Whether stock has been adjusted
  
  // Application tracking
  appliedAmount?: number; // Amount of the credit note that has been applied
  remainingAmount?: number; // Amount still available to apply
  isFullyApplied?: boolean; // Whether the credit note has been fully applied
  applications?: CreditNoteApplication[]; // Where the credit note has been applied
  
  // Document archiving
  archiveVersion?: number; // Version number for archiving
  archiveUrl?: string; // URL to archived document
  archivedAt?: string; // When the credit note was archived
}

export interface CreditNoteApplication {
  id: string;
  creditNoteId: string;
  targetInvoiceId?: string; // The invoice to which the credit is applied (can be null if applied as a refund)
  amount: number;
  date: string;
  isRefund: boolean; // Whether this was applied as a refund instead of against an invoice
  refundMethod?: 'bank' | 'cash' | 'check'; // Only used if isRefund=true
  refundReference?: string; // Reference number for the refund
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  companyId: string;
  clientId: string;
  quoteNumber: string;
  date: string;
  expiryDate: string;
  status: QuoteStatus;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discount: number;
  total: number;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  convertedInvoiceId?: string; // If converted to an invoice
  
  // Internal validation fields
  needsValidation?: boolean;
  validatedById?: string;
  validatedAt?: string;
  
  // Email tracking
  lastEmailSentAt?: string;
  emailRecipients?: string[];
  emailCc?: string[];
  emailHistory?: EmailHistoryEntry[];
  
  // Reminder configuration
  reminderEnabled?: boolean;
  reminderDays?: number; // Days before expiry to send reminder
  nextReminderDate?: string;
  
  // Version tracking
  versionNumber?: number;
  isLatestVersion?: boolean;
  previousVersionId?: string; // Reference to previous version
  originalQuoteId?: string; // Reference to the original quote for all versions
  
  // Deposit tracking
  hasDepositInvoice?: boolean;
  depositInvoiceId?: string;
  depositAmount?: number;
  depositPercentage?: number;
}

export interface EmailHistoryEntry {
  id: string;
  quoteId: string;
  sentAt: string;
  sentBy: string;
  recipients: string[];
  cc?: string[];
  subject: string;
  message: string;
  status: 'sent' | 'failed' | 'opened' | 'responded';
  responseDate?: string;
  responseNotes?: string;
}

export interface Payment {
  id: string;
  companyId: string;
  invoiceId: string;
  transactionId?: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank' | 'check' | 'online' | 'other';
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  additionalFields?: Record<string, string>; // For storing method-specific details
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

// Mock Data
export const mockCompanies: Company[] = [
  {
    id: '101',
    name: 'Tech Innovations Maroc',
    ice: '001234567890123',
    if: 'IF12345678',
    rc: 'RC123456',
    cnss: 'CNSS12345678',
    address: '123 Avenue Hassan II',
    city: 'Casablanca',
    phone: '+212 522 123 456',
    email: 'contact@techinnovations.ma',
    website: 'www.techinnovations.ma',
    rib: '123456789012345678901234'
  },
  {
    id: '102',
    name: 'Maroc Digital Solutions',
    ice: '001987654321098',
    if: 'IF87654321',
    rc: 'RC654321',
    address: '45 Rue Mohammed V',
    city: 'Rabat',
    phone: '+212 537 987 654',
    email: 'info@marocdigital.ma'
  }
];

export const mockClients: Client[] = [
  {
    id: '201',
    companyId: '101',
    name: 'Maroc Telecom',
    ice: '000123456789012',
    if: 'IF11111111',
    rc: 'RC111111',
    cnss: 'CNSS11111111',
    address: '1 Avenue Annakhil, Hay Riad',
    city: 'Rabat',
    phone: '+212 537 111 111',
    email: 'contact@iam.ma',
    website: 'www.iam.ma',
    contactName: 'Mohammed Alami',
    category: 'VIP',
    preferredPaymentMethod: 'bank',
    paymentTerms: '30 days',
    contacts: [
      {
        id: 'c101',
        name: 'Fatima Zahra',
        role: 'Financial Director',
        email: 'fatima.zahra@iam.ma',
        phone: '+212 537 111 222'
      },
      {
        id: 'c102',
        name: 'Karim Bensouda',
        role: 'Accountant',
        email: 'karim.bensouda@iam.ma',
        phone: '+212 537 111 333'
      }
    ],
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-01-15T10:30:00Z'
  },
  {
    id: '202',
    companyId: '101',
    name: 'Banque Populaire',
    ice: '000234567890123',
    if: 'IF22222222',
    rc: 'RC222222',
    address: '101 Boulevard Zerktouni',
    city: 'Casablanca',
    phone: '+212 522 222 222',
    email: 'service.client@bp.ma',
    website: 'www.bp.ma',
    contactName: 'Fatima Zahra Bennis',
    category: 'regular',
    preferredPaymentMethod: 'check',
    paymentTerms: '60 days',
    contacts: [
      {
        id: 'c201',
        name: 'Hassan Tazi',
        role: 'Financial Director',
        email: 'hassan.tazi@bp.ma',
        phone: '+212 522 222 333'
      }
    ],
    createdAt: '2023-02-20T14:45:00Z',
    updatedAt: '2023-02-20T14:45:00Z'
  },
  {
    id: '203',
    companyId: '101',
    name: 'Office Chérifien des Phosphates',
    ice: '000345678901234',
    if: 'IF33333333',
    rc: 'RC333333',
    cnss: 'CNSS33333333',
    address: '2 Rue Al Abtal, Hay Erraha',
    city: 'Casablanca',
    phone: '+212 522 333 333',
    email: 'contact@ocpgroup.ma',
    website: 'www.ocpgroup.ma',
    contactName: 'Karim Tazi',
    category: 'VIP',
    preferredPaymentMethod: 'bank',
    paymentTerms: '45 days',
    contacts: [
      {
        id: 'c301',
        name: 'Souad El Alami',
        role: 'Financial Director',
        email: 'souad.elalami@ocpgroup.ma',
        phone: '+212 522 333 444'
      },
      {
        id: 'c302',
        name: 'Mehdi Alaoui',
        role: 'Purchasing Director',
        email: 'mehdi.alaoui@ocpgroup.ma',
        phone: '+212 522 333 555'
      }
    ],
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-03-10T09:15:00Z'
  },
  {
    id: '204',
    companyId: '101',
    name: 'Royal Air Maroc',
    ice: '000456789012345',
    if: 'IF44444444',
    rc: 'RC444444',
    cnss: 'CNSS44444444',
    address: 'Aéroport Mohammed V',
    city: 'Casablanca',
    phone: '+212 522 444 444',
    email: 'customerservice@royalairmaroc.com',
    website: 'www.royalairmaroc.com',
    contactName: 'Younes Berrada',
    category: 'regular',
    preferredPaymentMethod: 'bank',
    paymentTerms: '30 days',
    contacts: [
      {
        id: 'c401',
        name: 'Nadia Chraibi',
        role: 'Financial Director',
        email: 'nadia.chraibi@royalairmaroc.com',
        phone: '+212 522 444 555'
      }
    ],
    createdAt: '2023-04-05T11:20:00Z',
    updatedAt: '2023-04-05T11:20:00Z'
  }
];

export const mockProductCategories: ProductCategory[] = [
  {
    id: 'cat1',
    companyId: '101',
    name: 'Services informatiques',
    description: 'Tous les services liés à l\'informatique',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'cat2',
    companyId: '101',
    name: 'Matériel informatique',
    description: 'Tous les produits hardware',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'cat3',
    companyId: '101',
    name: 'Formations',
    description: 'Toutes les formations professionnelles',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'cat4',
    companyId: '101',
    name: 'Consommables',
    description: 'Consommables informatiques',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

export const mockProductDiscounts: ProductDiscount[] = [
  {
    id: 'disc1',
    productId: '301',
    name: 'Remise fidélité',
    type: 'percentage',
    value: 10,
    clientCategory: 'VIP',
    isActive: true,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-01-10T00:00:00Z'
  },
  {
    id: 'disc2',
    productId: '303',
    name: 'Remise volume',
    type: 'percentage',
    value: 15,
    isActive: true,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 'disc3',
    productId: '305',
    name: 'Promo été 2023',
    type: 'fixed',
    value: 500,
    code: 'ETE2023',
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-08-31T00:00:00Z',
    isActive: true,
    createdAt: '2023-05-15T00:00:00Z',
    updatedAt: '2023-05-15T00:00:00Z'
  }
];

export const mockProducts: Product[] = [
  {
    id: '301',
    companyId: '101',
    name: 'Développement site web',
    description: 'Création d\'un site web responsive',
    price: 15000,
    vatRate: 20,
    unit: 'forfait',
    isService: true,
    reference: 'SRV-WEB-001',
    category: 'cat1',
    minQuantity: 1,
    manageStock: true,
    currentStock: 10,
    minStock: 5,
    alertStock: 3,
    locationId: 'loc1',
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z'
  },
  {
    id: '302',
    companyId: '101',
    name: 'Maintenance informatique',
    description: 'Service de maintenance mensuel',
    price: 2500,
    vatRate: 20,
    unit: 'mois',
    isService: true,
    reference: 'SRV-MAINT-001',
    category: 'cat1',
    minQuantity: 1,
    manageStock: true,
    currentStock: 20,
    minStock: 10,
    alertStock: 5,
    locationId: 'loc2',
    createdAt: '2023-01-02T09:30:00Z',
    updatedAt: '2023-01-02T09:30:00Z'
  },
  {
    id: '303',
    companyId: '101',
    name: 'Ordinateur portable',
    description: 'Laptop professionnel',
    price: 12000,
    vatRate: 20,
    unit: 'pièce',
    isService: false,
    reference: 'MAT-PC-001',
    category: 'cat2',
    barcode: '5901234123457',
    minQuantity: 1,
    manageStock: true,
    currentStock: 5,
    minStock: 2,
    alertStock: 1,
    locationId: 'loc3',
    createdAt: '2023-01-03T10:45:00Z',
    updatedAt: '2023-01-03T10:45:00Z'
  },
  {
    id: '304',
    companyId: '101',
    name: 'Imprimante laser',
    description: 'Imprimante laser couleur',
    price: 3500,
    vatRate: 20,
    unit: 'pièce',
    isService: false,
    reference: 'MAT-IMP-001',
    category: 'cat2',
    barcode: '5901234123458',
    minQuantity: 1,
    manageStock: true,
    currentStock: 10,
    minStock: 5,
    alertStock: 3,
    locationId: 'loc4',
    createdAt: '2023-01-04T11:15:00Z',
    updatedAt: '2023-01-04T11:15:00Z'
  },
  {
    id: '305',
    companyId: '101',
    name: 'Formation Excel',
    description: 'Formation Excel avancé',
    price: 5000,
    vatRate: 20,
    unit: 'jour',
    isService: true,
    reference: 'FORM-EXC-001',
    category: 'cat3',
    minQuantity: 1,
    manageStock: true,
    currentStock: 20,
    minStock: 10,
    alertStock: 5,
    locationId: 'loc5',
    createdAt: '2023-01-05T13:20:00Z',
    updatedAt: '2023-01-05T13:20:00Z'
  },
  {
    id: '306',
    companyId: '101',
    name: 'Cartouche d\'encre',
    description: 'Cartouche d\'encre pour imprimante laser',
    price: 800,
    vatRate: 20,
    unit: 'pièce',
    isService: false,
    reference: 'CONS-ENC-001',
    category: 'cat4',
    barcode: '5901234123459',
    minQuantity: 2,
    manageStock: true,
    currentStock: 50,
    minStock: 25,
    alertStock: 10,
    locationId: 'loc6',
    createdAt: '2023-01-06T14:30:00Z',
    updatedAt: '2023-01-06T14:30:00Z'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '401',
    companyId: '101',
    clientId: '201',
    invoiceNumber: 'FACT-2023-001',
    date: '2023-05-10T00:00:00Z',
    dueDate: '2023-06-09T00:00:00Z',
    status: 'paid',
    items: [
      {
        id: '4011',
        invoiceId: '401',
        productId: '301',
        description: 'Développement site web',
        quantity: 1,
        unitPrice: 15000,
        vatRate: 20,
        discount: 0,
        total: 15000
      },
      {
        id: '4012',
        invoiceId: '401',
        productId: '305',
        description: 'Formation Excel (2 jours)',
        quantity: 2,
        unitPrice: 5000,
        vatRate: 20,
        discount: 1000,
        total: 9000
      }
    ],
    subtotal: 24000,
    vatAmount: 4800,
    discount: 1000,
    total: 27800,
    notes: 'Paiement à effectuer par virement bancaire.',
    createdAt: '2023-05-10T10:30:00Z',
    updatedAt: '2023-05-10T10:30:00Z',
    isDeposit: true,
    depositForInvoiceId: '401',
    hasDepositInvoice: true,
    depositInvoiceId: '401',
    depositAmount: 10000,
    depositPercentage: 36.0
  },
  {
    id: '402',
    companyId: '101',
    clientId: '202',
    invoiceNumber: 'FACT-2023-002',
    date: '2023-06-15T00:00:00Z',
    dueDate: '2023-07-15T00:00:00Z',
    status: 'sent',
    items: [
      {
        id: '4021',
        invoiceId: '402',
        productId: '302',
        description: 'Maintenance informatique (6 mois)',
        quantity: 6,
        unitPrice: 2500,
        vatRate: 20,
        discount: 0,
        total: 15000
      }
    ],
    subtotal: 15000,
    vatAmount: 3000,
    discount: 0,
    total: 18000,
    createdAt: '2023-06-15T14:45:00Z',
    updatedAt: '2023-06-15T14:45:00Z',
    isDeposit: true,
    depositForInvoiceId: '402',
    hasDepositInvoice: true,
    depositInvoiceId: '402',
    depositAmount: 7500,
    depositPercentage: 41.7
  },
  {
    id: '403',
    companyId: '101',
    clientId: '203',
    invoiceNumber: 'FACT-2023-003',
    date: '2023-07-20T00:00:00Z',
    dueDate: '2023-08-19T00:00:00Z',
    status: 'partial',
    items: [
      {
        id: '4031',
        invoiceId: '403',
        productId: '303',
        description: 'Ordinateurs portables',
        quantity: 5,
        unitPrice: 12000,
        vatRate: 20,
        discount: 5000,
        total: 55000
      },
      {
        id: '4032',
        invoiceId: '403',
        productId: '304',
        description: 'Imprimantes laser',
        quantity: 2,
        unitPrice: 3500,
        vatRate: 20,
        discount: 0,
        total: 7000
      }
    ],
    subtotal: 67000,
    vatAmount: 13400,
    discount: 5000,
    total: 75400,
    notes: 'Livraison incluse.',
    createdAt: '2023-07-20T09:15:00Z',
    updatedAt: '2023-07-20T09:15:00Z',
    isDeposit: true,
    depositForInvoiceId: '403',
    hasDepositInvoice: true,
    depositInvoiceId: '403',
    depositAmount: 30000,
    depositPercentage: 39.8
  },
  {
    id: '404',
    companyId: '101',
    clientId: '204',
    invoiceNumber: 'FACT-2023-004',
    date: '2023-08-05T00:00:00Z',
    dueDate: '2023-09-04T00:00:00Z',
    status: 'overdue',
    items: [
      {
        id: '4041',
        invoiceId: '404',
        productId: '301',
        description: 'Refonte site web',
        quantity: 1,
        unitPrice: 20000,
        vatRate: 20,
        discount: 2000,
        total: 18000
      }
    ],
    subtotal: 20000,
    vatAmount: 4000,
    discount: 2000,
    total: 22000,
    createdAt: '2023-08-05T11:20:00Z',
    updatedAt: '2023-08-05T11:20:00Z',
    isDeposit: true,
    depositForInvoiceId: '404',
    hasDepositInvoice: true,
    depositInvoiceId: '404',
    depositAmount: 10000,
    depositPercentage: 45.5
  }
];

export const mockQuotes: Quote[] = [
  {
    id: '501',
    companyId: '101',
    clientId: '201',
    quoteNumber: 'DEV-2023-001',
    date: '2023-04-15T00:00:00Z',
    expiryDate: '2023-05-15T00:00:00Z',
    status: 'converted',
    items: [
      {
        id: '5011',
        quoteId: '501',
        productId: '301',
        description: 'Développement site web',
        quantity: 1,
        unitPrice: 15000,
        vatRate: 20,
        discount: 0,
        total: 15000
      },
      {
        id: '5012',
        quoteId: '501',
        productId: '305',
        description: 'Formation Excel (2 jours)',
        quantity: 2,
        unitPrice: 5000,
        vatRate: 20,
        discount: 1000,
        total: 9000
      }
    ],
    subtotal: 24000,
    vatAmount: 4800,
    discount: 1000,
    total: 27800,
    notes: 'Devis valable 30 jours.',
    createdAt: '2023-04-15T10:30:00Z',
    updatedAt: '2023-05-10T10:30:00Z',
    convertedInvoiceId: '401',
    versionNumber: 1,
    isLatestVersion: true,
    previousVersionId: null,
    originalQuoteId: null,
    hasDepositInvoice: true,
    depositInvoiceId: '401',
    depositAmount: 10000,
    depositPercentage: 36.0
  },
  {
    id: '502',
    companyId: '101',
    clientId: '203',
    quoteNumber: 'DEV-2023-002',
    date: '2023-07-01T00:00:00Z',
    expiryDate: '2023-07-31T00:00:00Z',
    status: 'accepted',
    items: [
      {
        id: '5021',
        quoteId: '502',
        productId: '303',
        description: 'Ordinateurs portables',
        quantity: 5,
        unitPrice: 12000,
        vatRate: 20,
        discount: 5000,
        total: 55000
      },
      {
        id: '5022',
        quoteId: '502',
        productId: '304',
        description: 'Imprimantes laser',
        quantity: 2,
        unitPrice: 3500,
        vatRate: 20,
        discount: 0,
        total: 7000
      }
    ],
    subtotal: 67000,
    vatAmount: 13400,
    discount: 5000,
    total: 75400,
    notes: 'Livraison incluse.',
    createdAt: '2023-07-01T09:15:00Z',
    updatedAt: '2023-07-15T14:30:00Z',
    convertedInvoiceId: '403',
    versionNumber: 2,
    isLatestVersion: true,
    previousVersionId: '501',
    originalQuoteId: '501',
    hasDepositInvoice: true,
    depositInvoiceId: '403',
    depositAmount: 30000,
    depositPercentage: 39.8
  },
  {
    id: '503',
    companyId: '101',
    clientId: '204',
    quoteNumber: 'DEV-2023-003',
    date: '2023-07-25T00:00:00Z',
    expiryDate: '2023-08-24T00:00:00Z',
    status: 'sent',
    items: [
      {
        id: '5031',
        quoteId: '503',
        productId: '301',
        description: 'Refonte site web',
        quantity: 1,
        unitPrice: 20000,
        vatRate: 20,
        discount: 2000,
        total: 18000
      }
    ],
    subtotal: 20000,
    vatAmount: 4000,
    discount: 2000,
    total: 22000,
    createdAt: '2023-07-25T11:20:00Z',
    updatedAt: '2023-07-25T11:20:00Z',
    convertedInvoiceId: '404',
    versionNumber: 3,
    isLatestVersion: true,
    previousVersionId: '502',
    originalQuoteId: '502',
    hasDepositInvoice: true,
    depositInvoiceId: '404',
    depositAmount: 10000,
    depositPercentage: 45.5
  }
];

export const mockPayments: Payment[] = [
  {
    id: '601',
    companyId: '101',
    invoiceId: '401',
    transactionId: 'TXN-001',
    amount: 27800,
    date: '2023-05-20T00:00:00Z',
    method: 'bank',
    reference: 'VIR-123456',
    notes: 'Paiement reçu par virement',
    status: 'completed',
    createdAt: '2023-05-20T15:30:00Z',
    updatedAt: '2023-05-20T15:30:00Z'
  },
  {
    id: '602',
    companyId: '101',
    invoiceId: '403',
    transactionId: 'TXN-002',
    amount: 40000,
    date: '2023-07-30T00:00:00Z',
    method: 'check',
    reference: 'CHQ-789012',
    notes: 'Acompte 50%',
    status: 'completed',
    createdAt: '2023-07-30T10:15:00Z',
    updatedAt: '2023-07-30T10:15:00Z'
  }
];

// Mock data for inventories
export const mockInventories: Inventory[] = [
  {
    id: 'inv1',
    companyId: '101',
    name: 'Inventaire mensuel - Avril 2023',
    status: 'completed',
    date: '2023-04-30T00:00:00Z',
    locationId: 'loc1',
    notes: 'Inventaire mensuel standard',
    createdBy: 'user1',
    createdAt: '2023-04-29T09:00:00Z',
    updatedAt: '2023-04-30T17:00:00Z'
  },
  {
    id: 'inv2',
    companyId: '101',
    name: 'Inventaire mensuel - Mai 2023',
    status: 'in_progress',
    date: '2023-05-31T00:00:00Z',
    locationId: 'loc1',
    createdBy: 'user1',
    createdAt: '2023-05-30T09:00:00Z',
    updatedAt: '2023-05-30T09:00:00Z'
  }
];

// Mock data for inventory items
export const mockInventoryItems: InventoryItem[] = [
  // Completed inventory
  {
    id: 'invitem1',
    inventoryId: 'inv1',
    productId: '303',
    expectedQuantity: 9,
    actualQuantity: 8,
    difference: -1,
    notes: 'Un ordinateur manquant',
    updatedAt: '2023-04-30T15:30:00Z'
  },
  {
    id: 'invitem2',
    inventoryId: 'inv1',
    productId: '304',
    expectedQuantity: 11,
    actualQuantity: 11,
    difference: 0,
    updatedAt: '2023-04-30T16:00:00Z'
  },
  {
    id: 'invitem3',
    inventoryId: 'inv1',
    productId: '306',
    expectedQuantity: 48,
    actualQuantity: 46,
    difference: -2,
    notes: 'Deux cartouches manquantes',
    updatedAt: '2023-04-30T16:30:00Z'
  },
  
  // In-progress inventory
  {
    id: 'invitem4',
    inventoryId: 'inv2',
    productId: '303',
    expectedQuantity: 8,
    actualQuantity: 0, // Not counted yet
    difference: 0,
    updatedAt: '2023-05-30T09:00:00Z'
  },
  {
    id: 'invitem5',
    inventoryId: 'inv2',
    productId: '304',
    expectedQuantity: 11,
    actualQuantity: 0, // Not counted yet
    difference: 0,
    updatedAt: '2023-05-30T09:00:00Z'
  }
];

// Helper functions
export const getClientById = (clientId: string): Client | undefined => {
  return mockClients.find(client => client.id === clientId);
};

export const getProductById = (productId: string): Product | undefined => {
  return mockProducts.find(product => product.id === productId);
};

export const getInvoiceById = (invoiceId: string): Invoice | undefined => {
  return mockInvoices.find(invoice => invoice.id === invoiceId);
};

export const getQuoteById = (quoteId: string): Quote | undefined => {
  return mockQuotes.find(quote => quote.id === quoteId);
};

export const getCompanyById = (companyId: string): Company | undefined => {
  return mockCompanies.find(company => company.id === companyId);
};

// For dashboard statistics
export const getInvoiceStats = (companyId: string) => {
  const companyInvoices = mockInvoices.filter(invoice => invoice.companyId === companyId);
  
  const totalPaid = companyInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  
  const totalPending = companyInvoices
    .filter(invoice => invoice.status === 'sent' || invoice.status === 'partial')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  
  const totalOverdue = companyInvoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  
  // Get monthly revenue (last 6 months)
  const today = new Date();
  const monthlyData = [];
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    const revenue = companyInvoices
      .filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === month.getMonth() && 
               invoiceDate.getFullYear() === month.getFullYear();
      })
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    monthlyData.push({
      name: monthName,
      value: revenue
    });
  }
  
  return {
    totalPaid,
    totalPending,
    totalOverdue,
    total: totalPaid + totalPending + totalOverdue,
    monthlyData
  };
};

// For top clients chart
export const getTopClients = (companyId: string, limit = 5) => {
  const clientTotals = new Map<string, number>();
  
  mockInvoices
    .filter(invoice => invoice.companyId === companyId)
    .forEach(invoice => {
      const currentTotal = clientTotals.get(invoice.clientId) || 0;
      clientTotals.set(invoice.clientId, currentTotal + invoice.total);
    });
  
  const sortedClients = Array.from(clientTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([clientId, total]) => {
      const client = getClientById(clientId);
      return {
        name: client?.name || 'Unknown',
        value: total
      };
    });
  
  return sortedClients;
};

// Additional helper functions for client management
export const getClientInvoices = (clientId: string): Invoice[] => {
  return mockInvoices.filter(invoice => invoice.clientId === clientId);
};

export const getClientQuotes = (clientId: string): Quote[] => {
  return mockQuotes.filter(quote => quote.clientId === clientId);
};

export const getClientPayments = (clientId: string): Payment[] => {
  const clientInvoices = getClientInvoices(clientId);
  const clientInvoiceIds = clientInvoices.map(invoice => invoice.id);
  return mockPayments.filter(payment => clientInvoiceIds.includes(payment.invoiceId));
};

export const getClientBalance = (clientId: string): number => {
  const invoices = getClientInvoices(clientId);
  const invoicesTotal = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  
  const payments = getClientPayments(clientId);
  const paymentsTotal = payments.reduce((sum, payment) => {
    // Only count completed payments
    if (payment.status === 'completed') {
      return sum + payment.amount;
    }
    return sum;
  }, 0);
  
  return invoicesTotal - paymentsTotal;
};

export const getClientTotalVat = (clientId: string): number => {
  const invoices = getClientInvoices(clientId);
  return invoices.reduce((sum, invoice) => sum + invoice.vatAmount, 0);
};

export const getClientsByCategory = (companyId: string, category: string): Client[] => {
  return mockClients.filter(client => 
    client.companyId === companyId && client.category === category
  );
};

// Get all product categories for a company
export function getProductCategories(companyId: string): ProductCategory[] {
  return mockProductCategories.filter(category => category.companyId === companyId && category.isActive);
}

// Get a specific product category by ID
export function getProductCategoryById(categoryId: string): ProductCategory | undefined {
  return mockProductCategories.find(category => category.id === categoryId);
}

// Get all products by category
export function getProductsByCategory(companyId: string, categoryId: string): Product[] {
  return mockProducts.filter(product => 
    product.companyId === companyId && product.category === categoryId
  );
}

// Get all discounts for a product
export function getProductDiscounts(productId: string): ProductDiscount[] {
  return mockProductDiscounts.filter(discount => 
    discount.productId === productId && discount.isActive
  );
}

// Get all discounts for a specific client (based on client ID and category)
export function getClientDiscounts(productId: string, clientId: string, clientCategory?: string): ProductDiscount[] {
  return mockProductDiscounts.filter(discount => {
    if (!discount.isActive || discount.productId !== productId) return false;
    
    // Check if discount applies to this specific client
    if (discount.clientId && discount.clientId === clientId) return true;
    
    // Check if discount applies to this client's category
    if (discount.clientCategory && clientCategory && discount.clientCategory === clientCategory) return true;
    
    // Check if discount is for any client (no specific client or category)
    if (!discount.clientId && !discount.clientCategory) return true;
    
    return false;
  });
}

// Calculate the price after applying discounts
export function calculateDiscountedPrice(
  product: Product, 
  quantity: number = 1, 
  clientId?: string, 
  clientCategory?: string,
  promoCode?: string
): { 
  originalPrice: number,
  discountedPrice: number,
  appliedDiscounts: ProductDiscount[],
  totalDiscount: number
} {
  const originalPrice = product.price * quantity;
  let discountedPrice = originalPrice;
  const appliedDiscounts: ProductDiscount[] = [];
  
  // Get available discounts for this product and client
  const availableDiscounts = clientId 
    ? getClientDiscounts(product.id, clientId, clientCategory)
    : getProductDiscounts(product.id);
  
  // Filter by promo code if provided
  const discounts = promoCode 
    ? availableDiscounts.filter(d => !d.code || d.code === promoCode)
    : availableDiscounts.filter(d => !d.code);
  
  // Check each discount validity
  const validDiscounts = discounts.filter(discount => {
    // Check dates if they exist
    if (discount.startDate && discount.endDate) {
      const now = new Date();
      const start = new Date(discount.startDate);
      const end = new Date(discount.endDate);
      
      if (now < start || now > end) return false;
    }
    
    return true;
  });
  
  // Apply discounts - we'll apply the most advantageous discount
  if (validDiscounts.length > 0) {
    // Calculate potential discounted prices
    const potentialPrices = validDiscounts.map(discount => {
      if (discount.type === 'percentage') {
        const discountAmount = originalPrice * (discount.value / 100);
        return {
          discount,
          price: originalPrice - discountAmount,
          discountAmount
        };
      } else {
        // Fixed amount
        return {
          discount,
          price: originalPrice - discount.value,
          discountAmount: discount.value
        };
      }
    });
    
    // Find the best discount (lowest price)
    const bestDiscount = potentialPrices.reduce((best, current) => 
      current.price < best.price ? current : best
    , potentialPrices[0]);
    
    discountedPrice = bestDiscount.price;
    appliedDiscounts.push(bestDiscount.discount);
    
    // Ensure price is never negative
    if (discountedPrice < 0) discountedPrice = 0;
  }
  
  return {
    originalPrice,
    discountedPrice,
    appliedDiscounts,
    totalDiscount: originalPrice - discountedPrice
  };
}

// Add new interfaces for stock management
export interface StockLocation {
  id: string;
  companyId: string;
  name: string;
  address?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'purchase' | 'sale' | 'return_customer' | 'return_supplier' | 'adjustment' | 'transfer' | 'inventory';

export interface StockMovement {
  id: string;
  companyId: string;
  productId: string;
  type: StockMovementType;
  quantity: number; // Positive for in, negative for out
  reason?: string;
  referenceId?: string; // Related document ID (invoice, purchase order, etc.)
  referenceType?: string; // Type of reference (invoice, purchase order, etc.)
  locationId: string;
  previousStock: number;
  newStock: number;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface Inventory {
  id: string;
  companyId: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  locationId: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  inventoryId: string;
  productId: string;
  expectedQuantity: number; // Quantity in system before inventory
  actualQuantity: number; // Counted quantity
  difference: number; // Difference between expected and actual
  notes?: string;
  updatedAt: string;
}

// Add mock stock locations and movements

export const mockStockLocations: StockLocation[] = [
  {
    id: 'loc1',
    companyId: '101',
    name: 'Entrepôt principal',
    address: '123 Avenue Hassan II, Casablanca',
    isDefault: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'loc2',
    companyId: '101',
    name: 'Entrepôt secondaire',
    address: '45 Rue Mohammed V, Rabat',
    isDefault: false,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  },
  {
    id: 'loc3',
    companyId: '101',
    name: 'Magasin Casablanca',
    address: 'Centre Commercial Morocco Mall, Casablanca',
    isDefault: false,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z'
  }
];

export const mockStockMovements: StockMovement[] = [
  // Purchases
  {
    id: 'mov1',
    companyId: '101',
    productId: '303', // Ordinateur portable
    type: 'purchase',
    quantity: 10,
    reason: 'Achat initial',
    referenceId: 'PO-2023-001',
    referenceType: 'purchase_order',
    locationId: 'loc1',
    previousStock: 0,
    newStock: 10,
    date: '2023-02-10T10:00:00Z',
    createdBy: 'user1',
    createdAt: '2023-02-10T10:00:00Z'
  },
  {
    id: 'mov2',
    companyId: '101',
    productId: '304', // Imprimante laser
    type: 'purchase',
    quantity: 15,
    reason: 'Réapprovisionnement',
    referenceId: 'PO-2023-002',
    referenceType: 'purchase_order',
    locationId: 'loc1',
    previousStock: 5,
    newStock: 20,
    date: '2023-02-15T11:30:00Z',
    createdBy: 'user1',
    createdAt: '2023-02-15T11:30:00Z'
  },
  
  // Sales
  {
    id: 'mov3',
    companyId: '101',
    productId: '303', // Ordinateur portable
    type: 'sale',
    quantity: -2,
    referenceId: '401', // Invoice ID
    referenceType: 'invoice',
    locationId: 'loc1',
    previousStock: 10,
    newStock: 8,
    date: '2023-03-05T14:20:00Z',
    createdBy: 'user1',
    createdAt: '2023-03-05T14:20:00Z'
  },
  {
    id: 'mov4',
    companyId: '101',
    productId: '304', // Imprimante laser
    type: 'sale',
    quantity: -4,
    referenceId: '403', // Invoice ID
    referenceType: 'invoice',
    locationId: 'loc1',
    previousStock: 20,
    newStock: 16,
    date: '2023-03-20T09:45:00Z',
    createdBy: 'user1',
    createdAt: '2023-03-20T09:45:00Z'
  },
  
  // Returns
  {
    id: 'mov5',
    companyId: '101',
    productId: '303', // Ordinateur portable
    type: 'return_customer',
    quantity: 1,
    reason: 'Produit défectueux',
    referenceId: '401', // Invoice ID
    referenceType: 'credit_note',
    locationId: 'loc1',
    previousStock: 8,
    newStock: 9,
    date: '2023-03-25T13:15:00Z',
    createdBy: 'user1',
    createdAt: '2023-03-25T13:15:00Z'
  },
  
  // Adjustments
  {
    id: 'mov6',
    companyId: '101',
    productId: '306', // Cartouche d'encre
    type: 'adjustment',
    quantity: -2,
    reason: 'Perte en stock',
    locationId: 'loc1',
    previousStock: 50,
    newStock: 48,
    date: '2023-04-01T08:30:00Z',
    createdBy: 'user1',
    createdAt: '2023-04-01T08:30:00Z'
  },
  
  // Transfers
  {
    id: 'mov7',
    companyId: '101',
    productId: '304', // Imprimante laser
    type: 'transfer',
    quantity: -5,
    reason: 'Transfert vers magasin',
    locationId: 'loc1',
    previousStock: 16,
    newStock: 11,
    date: '2023-04-10T10:00:00Z',
    createdBy: 'user1',
    createdAt: '2023-04-10T10:00:00Z'
  },
  {
    id: 'mov8',
    companyId: '101',
    productId: '304', // Imprimante laser
    type: 'transfer',
    quantity: 5,
    reason: 'Transfert depuis entrepôt principal',
    locationId: 'loc3',
    previousStock: 0,
    newStock: 5,
    date: '2023-04-10T10:30:00Z',
    createdBy: 'user1',
    createdAt: '2023-04-10T10:30:00Z'
  },
  
  // Inventory
  {
    id: 'mov9',
    companyId: '101',
    productId: '303', // Ordinateur portable
    type: 'inventory',
    quantity: -1,
    reason: 'Ajustement inventaire mensuel',
    referenceId: 'INV-2023-001',
    referenceType: 'inventory',
    locationId: 'loc1',
    previousStock: 9,
    newStock: 8,
    date: '2023-04-30T16:45:00Z',
    createdBy: 'user1',
    createdAt: '2023-04-30T16:45:00Z'
  }
];

// Helper functions for stock management

// Get all stock locations for a company
export function getStockLocations(companyId: string): StockLocation[] {
  return mockStockLocations.filter(location => location.companyId === companyId);
}

// Get a specific stock location by ID
export function getStockLocationById(locationId: string): StockLocation | undefined {
  return mockStockLocations.find(location => location.id === locationId);
}

// Get the default location for a company
export function getDefaultStockLocation(companyId: string): StockLocation | undefined {
  return mockStockLocations.find(location => location.companyId === companyId && location.isDefault);
}

// Get stock movements for a product
export function getProductStockMovements(productId: string): StockMovement[] {
  return mockStockMovements.filter(movement => movement.productId === productId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get stock movements for a specific location
export function getLocationStockMovements(locationId: string): StockMovement[] {
  return mockStockMovements.filter(movement => movement.locationId === locationId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get all inventories for a company
export function getInventories(companyId: string): Inventory[] {
  return mockInventories.filter(inventory => inventory.companyId === companyId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get a specific inventory by ID
export function getInventoryById(inventoryId: string): Inventory | undefined {
  return mockInventories.find(inventory => inventory.id === inventoryId);
}

// Get inventory items for an inventory
export function getInventoryItems(inventoryId: string): InventoryItem[] {
  return mockInventoryItems.filter(item => item.inventoryId === inventoryId);
}

// Get products that need restocking (below alert level)
export function getProductsNeedingRestock(companyId: string): Product[] {
  return mockProducts.filter(product => 
    product.companyId === companyId &&
    product.manageStock &&
    !product.isService &&
    product.currentStock !== undefined &&
    product.alertStock !== undefined &&
    product.currentStock <= product.alertStock
  );
}

// Create a stock movement and update product stock
export function createStockMovement(
  companyId: string,
  productId: string,
  type: StockMovementType,
  quantity: number,
  locationId: string,
  reason?: string,
  referenceId?: string,
  referenceType?: string
): StockMovement | { error: string } {
  // Find the product
  const product = getProductById(productId);
  if (!product) {
    return { error: 'Product not found' };
  }
  
  // Check if product has stock management enabled
  if (!product.manageStock) {
    return { error: 'Stock management not enabled for this product' };
  }
  
  // Check if location exists
  const location = getStockLocationById(locationId);
  if (!location) {
    return { error: 'Location not found' };
  }
  
  // For sales, check if we have enough stock
  if (type === 'sale' && (product.currentStock || 0) < Math.abs(quantity)) {
    return { error: 'Insufficient stock' };
  }
  
  // Create the stock movement
  const previousStock = product.currentStock || 0;
  const newStock = previousStock + quantity;
  
  const movement: StockMovement = {
    id: `mov-${Date.now()}`,
    companyId,
    productId,
    type,
    quantity,
    reason,
    referenceId,
    referenceType,
    locationId,
    previousStock,
    newStock,
    date: new Date().toISOString(),
    createdBy: 'user1', // In a real app, this would come from the authenticated user
    createdAt: new Date().toISOString()
  };
  
  // In a real app, this would be a database transaction
  mockStockMovements.push(movement);
  
  // Update product stock
  product.currentStock = newStock;
  product.updatedAt = new Date().toISOString();
  
  return movement;
}

// Create a new inventory
export function createInventory(
  companyId: string,
  name: string,
  locationId: string,
  notes?: string
): Inventory {
  const now = new Date().toISOString();
  const inventory: Inventory = {
    id: `inv-${Date.now()}`,
    companyId,
    name,
    status: 'draft',
    date: now,
    locationId,
    notes,
    createdBy: 'user1', // In a real app, this would come from the authenticated user
    createdAt: now,
    updatedAt: now
  };
  
  // In a real app, this would be a database transaction
  mockInventories.push(inventory);
  
  return inventory;
}

// Start an inventory (generate inventory items)
export function startInventory(inventoryId: string): InventoryItem[] | { error: string } {
  const inventory = getInventoryById(inventoryId);
  if (!inventory) {
    return { error: 'Inventory not found' };
  }
  
  if (inventory.status !== 'draft') {
    return { error: 'Inventory must be in draft status to start' };
  }
  
  // Get all products that are stock managed
  const products = mockProducts.filter(product => 
    product.companyId === inventory.companyId &&
    product.manageStock &&
    !product.isService
  );
  
  // Create inventory items
  const inventoryItems: InventoryItem[] = [];
  const now = new Date().toISOString();
  
  for (const product of products) {
    const item: InventoryItem = {
      id: `invitem-${Date.now()}-${product.id}`,
      inventoryId,
      productId: product.id,
      expectedQuantity: product.currentStock || 0,
      actualQuantity: 0, // To be filled during counting
      difference: 0,
      updatedAt: now
    };
    
    inventoryItems.push(item);
    mockInventoryItems.push(item);
  }
  
  // Update inventory status
  inventory.status = 'in_progress';
  inventory.updatedAt = now;
  
  return inventoryItems;
}

// Complete inventory and apply adjustments
export function completeInventory(inventoryId: string, applyAdjustments: boolean = true): { success: boolean } | { error: string } {
  const inventory = getInventoryById(inventoryId);
  if (!inventory) {
    return { error: 'Inventory not found' };
  }
  
  if (inventory.status !== 'in_progress') {
    return { error: 'Inventory must be in progress to complete' };
  }
  
  // Get inventory items
  const inventoryItems = getInventoryItems(inventoryId);
  if (inventoryItems.length === 0) {
    return { error: 'No inventory items found' };
  }
  
  // Check if all items have been counted
  const uncountedItems = inventoryItems.filter(item => item.actualQuantity === 0);
  if (uncountedItems.length > 0) {
    return { error: 'Not all items have been counted' };
  }
  
  const now = new Date().toISOString();
  
  // Apply adjustments if needed
  if (applyAdjustments) {
    for (const item of inventoryItems) {
      if (item.difference !== 0) {
        const product = getProductById(item.productId);
        if (product) {
          // Create a stock movement for the adjustment
          createStockMovement(
            inventory.companyId,
            item.productId,
            'inventory',
            item.difference,
            inventory.locationId,
            'Ajustement inventaire',
            inventory.id,
            'inventory'
          );
        }
      }
    }
  }
  
  // Update inventory status
  inventory.status = 'completed';
  inventory.updatedAt = now;
  
  return { success: true };
}

// Function to check if there's enough stock for invoice items
export function checkStockForInvoiceItems(
  companyId: string,
  items: InvoiceItem[],
  locationId?: string
): { success: boolean; insufficientItems?: { product: Product, requested: number, available: number }[] } {
  // Get the default location if none specified
  const defaultLocation = getDefaultStockLocation(companyId);
  const stockLocationId = locationId || (defaultLocation ? defaultLocation.id : '');
  
  if (!stockLocationId) {
    return { success: false, insufficientItems: [] };
  }
  
  const insufficientItems: { product: Product, requested: number, available: number }[] = [];
  
  // Check stock for each item
  for (const item of items) {
    const product = getProductById(item.productId);
    
    if (!product) continue;
    
    // Skip stock check for services or products not managed in stock
    if (product.isService || !product.manageStock) continue;
    
    // Check if there's enough stock
    if ((product.currentStock || 0) < item.quantity) {
      insufficientItems.push({
        product,
        requested: item.quantity,
        available: product.currentStock || 0
      });
    }
  }
  
  return {
    success: insufficientItems.length === 0,
    insufficientItems: insufficientItems.length > 0 ? insufficientItems : undefined
  };
}

// Create stock movements for invoice items
export function createStockMovementsForInvoice(
  invoiceId: string,
  companyId: string,
  items: InvoiceItem[],
  locationId?: string,
  shouldCheckStock: boolean = true
): { success: boolean; message?: string; movements: StockMovement[] } {
  // Get the default location if none specified
  const defaultLocation = getDefaultStockLocation(companyId);
  const stockLocationId = locationId || (defaultLocation ? defaultLocation.id : '');
  
  if (!stockLocationId) {
    return { 
      success: false, 
      message: 'No stock location found', 
      movements: [] 
    };
  }
  
  // Check stock if required
  if (shouldCheckStock) {
    const stockCheck = checkStockForInvoiceItems(companyId, items, stockLocationId);
    if (!stockCheck.success) {
      const productNames = stockCheck.insufficientItems?.map(item => 
        `${item.product.name} (requested: ${item.requested}, available: ${item.available})`
      ).join(', ');
      
      return {
        success: false,
        message: `Insufficient stock for: ${productNames}`,
        movements: []
      };
    }
  }
  
  const movements: StockMovement[] = [];
  
  // Create stock movement for each item
  for (const item of items) {
    const product = getProductById(item.productId);
    
    if (!product) continue;
    
    // Skip services or products not managed in stock
    if (product.isService || !product.manageStock) continue;
    
    // Create a movement with negative quantity (stock exit)
    const result = createStockMovement(
      companyId,
      item.productId,
      'sale',
      -item.quantity,
      stockLocationId,
      'Invoice creation',
      invoiceId,
      'invoice'
    );
    
    if (!('error' in result)) {
      movements.push(result);
    }
  }
  
  return {
    success: true,
    movements
  };
}

// Function to update stock settings for a product
export function updateProductStockSettings(
  productId: string,
  settings: {
    manageStock?: boolean;
    minStock?: number;
    alertStock?: number;
    locationId?: string;
  }
): Product | { error: string } {
  const productIndex = mockProducts.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return { error: 'Product not found' };
  }
  
  // Update the product
  const updatedProduct = {
    ...mockProducts[productIndex],
    ...settings,
    updatedAt: new Date().toISOString()
  };
  
  // Save the updated product
  mockProducts[productIndex] = updatedProduct;
  
  return updatedProduct;
}

// Create a new invoice with stock management
export function createInvoice(
  companyId: string,
  clientId: string,
  items: Omit<InvoiceItem, 'id' | 'invoiceId'>[],
  options?: {
    date?: string;
    dueDate?: string;
    notes?: string;
    terms?: string;
    stockLocationId?: string;
    checkStock?: boolean;
    updateStock?: boolean;
  }
): Invoice | { error: string } {
  if (!companyId) return { error: 'Company ID is required' };
  if (!clientId) return { error: 'Client ID is required' };
  if (!items.length) return { error: 'Invoice must have at least one item' };
  
  // Generate invoice number
  const lastInvoice = mockInvoices
    .filter(inv => inv.companyId === companyId)
    .sort((a, b) => 
      b.invoiceNumber.localeCompare(a.invoiceNumber)
    )[0];
  
  let invoiceNumber = 'INV-00001';
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
    invoiceNumber = `INV-${String(lastNumber + 1).padStart(5, '0')}`;
  }
  
  // Current date
  const now = new Date();
  const date = options?.date || now.toISOString();
  
  // Due date (default to 30 days later)
  const defaultDueDate = new Date(now);
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);
  const dueDate = options?.dueDate || defaultDueDate.toISOString();
  
  // Prepare invoice items
  const invoiceItems: InvoiceItem[] = items.map((item, index) => ({
    id: `ii-${Date.now()}-${index}`,
    invoiceId: '', // Will be filled later
    ...item
  }));
  
  // Check stock if required
  if (options?.checkStock !== false) {
    const stockCheck = checkStockForInvoiceItems(
      companyId, 
      invoiceItems, 
      options?.stockLocationId
    );
    
    if (!stockCheck.success && stockCheck.insufficientItems) {
      const productNames = stockCheck.insufficientItems.map(item => 
        `${item.product.name} (requested: ${item.requested}, available: ${item.available})`
      ).join(', ');
      
      return { error: `Insufficient stock for: ${productNames}` };
    }
  }
  
  // Calculate totals
  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity), 
    0
  );
  
  const vatAmount = invoiceItems.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.vatRate / 100), 
    0
  );
  
  const discount = invoiceItems.reduce(
    (sum, item) => sum + item.discount, 
    0
  );
  
  const total = subtotal + vatAmount - discount;
  
  // Create the invoice
  const invoice: Invoice = {
    id: `inv-${Date.now()}`,
    companyId,
    clientId,
    invoiceNumber,
    date,
    dueDate,
    status: 'draft',
    items: invoiceItems,
    subtotal,
    vatAmount,
    discount,
    total,
    notes: options?.notes,
    terms: options?.terms,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isDeposit: options?.checkStock !== false,
    depositForInvoiceId: options?.checkStock !== false ? invoice.id : undefined,
    hasDepositInvoice: options?.checkStock !== false,
    depositInvoiceId: options?.checkStock !== false ? invoice.id : undefined,
    depositAmount: options?.checkStock !== false ? total : undefined,
    depositPercentage: options?.checkStock !== false ? 100 : undefined
  };
  
  // Update item IDs
  invoice.items = invoice.items.map(item => ({
    ...item,
    invoiceId: invoice.id
  }));
  
  // Add to mock data
  mockInvoices.push(invoice);
  
  // Update stock if required
  if (options?.updateStock !== false) {
    createStockMovementsForInvoice(
      invoice.id,
      companyId,
      invoice.items,
      options?.stockLocationId,
      false // Skip stock check as we already did it
    );
  }
  
  return invoice;
}

// Tax management types
export interface Tax {
  id: string;
  companyId: string;
  name: string;
  code: string; // Internal code for the tax
  type: 'vat' | 'service' | 'stamp' | 'other';
  rate: number; // Rate in percentage
  isDefault: boolean;
  isExempt: boolean;
  exemptionReason?: string;
  isActive: boolean;
  appliesTo: 'all' | 'products' | 'services';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRule {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  taxIds: string[]; // Tax IDs that apply for this rule
  productCategoryIds?: string[]; // Apply to specific product categories
  clientCategoryIds?: string[]; // Apply to specific client categories
  isActive: boolean;
  priority: number; // Higher priority rules override lower ones
  createdAt: string;
  updatedAt: string;
}

export interface TaxReport {
  id: string;
  companyId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'generated' | 'submitted';
  totalVat: number;
  vatByRate: Record<string, number>; // VAT amount by rate
  invoiceIds: string[]; // Included invoices
  createdAt: string;
  updatedAt: string;
}

// Mock data for taxes
export const mockTaxes: Tax[] = [
  {
    id: 'tax1',
    companyId: '101',
    name: 'TVA Standard',
    code: 'TVA-20',
    type: 'vat',
    rate: 20,
    isDefault: true,
    isExempt: false,
    isActive: true,
    appliesTo: 'all',
    description: 'Taux standard de TVA au Maroc (20%)',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'tax2',
    companyId: '101',
    name: 'TVA Réduite',
    code: 'TVA-14',
    type: 'vat',
    rate: 14,
    isDefault: false,
    isExempt: false,
    isActive: true,
    appliesTo: 'all',
    description: 'Taux réduit de TVA au Maroc (14%)',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'tax3',
    companyId: '101',
    name: 'TVA Réduite',
    code: 'TVA-10',
    type: 'vat',
    rate: 10,
    isDefault: false,
    isExempt: false,
    isActive: true,
    appliesTo: 'all',
    description: 'Taux réduit de TVA au Maroc (10%)',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'tax4',
    companyId: '101',
    name: 'TVA Réduite',
    code: 'TVA-7',
    type: 'vat',
    rate: 7,
    isDefault: false,
    isExempt: false,
    isActive: true,
    appliesTo: 'all',
    description: 'Taux réduit de TVA au Maroc (7%)',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'tax5',
    companyId: '101',
    name: 'TVA Exemptée',
    code: 'TVA-0',
    type: 'vat',
    rate: 0,
    isDefault: false,
    isExempt: true,
    exemptionReason: 'Produits et services exonérés de TVA',
    isActive: true,
    appliesTo: 'all',
    description: 'Exonération de TVA (0%)',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'tax6',
    companyId: '101',
    name: 'Timbre Fiscal',
    code: 'TIMBRE',
    type: 'stamp',
    rate: 0.25,
    isDefault: false,
    isExempt: false,
    isActive: true,
    appliesTo: 'services',
    description: 'Timbre fiscal pour certains documents',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

export const mockTaxRules: TaxRule[] = [
  {
    id: 'rule1',
    companyId: '101',
    name: 'Règle standard',
    description: 'Application du taux standard de TVA (20%)',
    taxIds: ['tax1'],
    isActive: true,
    priority: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'rule2',
    companyId: '101',
    name: 'Services informatiques',
    description: 'TVA à 20% pour services informatiques',
    taxIds: ['tax1'],
    productCategoryIds: ['cat1'], // Assuming cat1 is for IT services
    isActive: true,
    priority: 2,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'rule3',
    companyId: '101',
    name: 'Produits alimentaires',
    description: 'TVA réduite pour produits alimentaires',
    taxIds: ['tax4'],
    productCategoryIds: ['cat5'], // Assuming cat5 is for food products
    isActive: true,
    priority: 2,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

export const mockTaxReports: TaxReport[] = [
  {
    id: 'report1',
    companyId: '101',
    name: 'Déclaration TVA T1 2023',
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-03-31T23:59:59Z',
    status: 'submitted',
    totalVat: 17800,
    vatByRate: {
      '20': 16000,
      '14': 1200,
      '10': 600,
      '7': 0,
      '0': 0
    },
    invoiceIds: ['401', '402', '403'],
    createdAt: '2023-04-05T10:00:00Z',
    updatedAt: '2023-04-05T10:00:00Z'
  },
  {
    id: 'report2',
    companyId: '101',
    name: 'Déclaration TVA T2 2023',
    startDate: '2023-04-01T00:00:00Z',
    endDate: '2023-06-30T23:59:59Z',
    status: 'generated',
    totalVat: 12400,
    vatByRate: {
      '20': 10000,
      '14': 1400,
      '10': 1000,
      '7': 0,
      '0': 0
    },
    invoiceIds: ['404'],
    createdAt: '2023-07-03T14:30:00Z',
    updatedAt: '2023-07-03T14:30:00Z'
  }
];

// Tax utility functions
export function getTaxes(companyId: string): Tax[] {
  return mockTaxes.filter(tax => tax.companyId === companyId && tax.isActive);
}

export function getTaxById(taxId: string): Tax | undefined {
  return mockTaxes.find(tax => tax.id === taxId);
}

export function getTaxRules(companyId: string): TaxRule[] {
  return mockTaxRules.filter(rule => rule.companyId === companyId && rule.isActive)
    .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
}

export function getTaxReports(companyId: string): TaxReport[] {
  return mockTaxReports.filter(report => report.companyId === companyId);
}

export function getTaxReportById(reportId: string): TaxReport | undefined {
  return mockTaxReports.find(report => report.id === reportId);
}

export function calculateVatForPeriod(
  companyId: string,
  startDate: string,
  endDate: string,
  options?: {
    invoiceStatus?: InvoiceStatus[];
  }
): {
  totalVat: number;
  vatByRate: Record<string, number>;
  invoiceIds: string[];
} {
  // Filter invoices by date range and company
  const invoices = mockInvoices.filter(inv => 
    inv.companyId === companyId &&
    new Date(inv.date) >= new Date(startDate) &&
    new Date(inv.date) <= new Date(endDate) &&
    (!options?.invoiceStatus || options.invoiceStatus.includes(inv.status))
  );
  
  // Calculate VAT by rate
  const vatByRate: Record<string, number> = {};
  let totalVat = 0;
  
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const rateKey = item.vatRate.toString();
      if (!vatByRate[rateKey]) {
        vatByRate[rateKey] = 0;
      }
      
      const itemVat = (item.unitPrice * item.quantity * item.vatRate) / 100;
      vatByRate[rateKey] += itemVat;
      totalVat += itemVat;
    });
  });
  
  return {
    totalVat,
    vatByRate,
    invoiceIds: invoices.map(inv => inv.id)
  };
}

export function createTaxReport(
  companyId: string,
  name: string,
  startDate: string,
  endDate: string,
  options?: {
    invoiceStatus?: InvoiceStatus[];
  }
): TaxReport {
  // Calculate VAT for the period
  const { totalVat, vatByRate, invoiceIds } = calculateVatForPeriod(
    companyId,
    startDate,
    endDate,
    options
  );
  
  // Create the report
  const report: TaxReport = {
    id: `report-${Date.now()}`,
    companyId,
    name,
    startDate,
    endDate,
    status: 'generated',
    totalVat,
    vatByRate,
    invoiceIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add to mock data
  mockTaxReports.push(report);
  
  return report;
}

export function getApplicableTax(
  companyId: string,
  productId: string,
  clientId?: string
): Tax {
  const product = getProductById(productId);
  if (!product) {
    // Return default tax if product not found
    return mockTaxes.find(tax => tax.companyId === companyId && tax.isDefault) || mockTaxes[0];
  }
  
  const client = clientId ? getClientById(clientId) : undefined;
  const clientCategory = client?.category;
  const productCategory = product.category;
  
  // Get all active rules for this company, sorted by priority
  const rules = getTaxRules(companyId);
  
  // Find the first matching rule
  for (const rule of rules) {
    let productCategoryMatch = true;
    let clientCategoryMatch = true;
    
    // Check product category constraints
    if (rule.productCategoryIds && rule.productCategoryIds.length > 0) {
      productCategoryMatch = productCategory ? rule.productCategoryIds.includes(productCategory) : false;
    }
    
    // Check client category constraints
    if (rule.clientCategoryIds && rule.clientCategoryIds.length > 0) {
      clientCategoryMatch = clientCategory ? rule.clientCategoryIds.includes(clientCategory) : false;
    }
    
    // If all constraints match, use this rule's taxes
    if (productCategoryMatch && clientCategoryMatch) {
      // Return the first tax in the rule (usually there's only one VAT rate)
      const tax = getTaxById(rule.taxIds[0]);
      if (tax) {
        return tax;
      }
    }
  }
  
  // If no rule matches, return the default tax
  return mockTaxes.find(tax => tax.companyId === companyId && tax.isDefault) || mockTaxes[0];
}

// Define QuoteLineItem interface if it doesn't exist
export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  price: number;
  vatRate: number;
  discount?: number;
  total: number;
}

// Near the beginning of the file, add mockCreditNotes array with your other mock data arrays

export const mockCreditNotes: CreditNote[] = [
  {
    id: 'cn-101',
    companyId: '101',
    clientId: '201',
    invoiceId: 'inv-101',
    creditNoteNumber: 'AVO-2023-0001',
    date: '2023-08-15T10:00:00Z',
    status: 'issued',
    reason: 'defective',
    reasonDescription: 'Return of defective products',
    items: [
      {
        id: 'cni-101-1',
        productId: 'prod-101',
        description: 'Laptop Dell XPS 15',
        quantity: 1,
        unitPrice: 12000,
        vatRate: 20,
        discount: 0,
        total: 12000
      }
    ],
    subtotal: 12000,
    vatAmount: 2400,
    total: 14400,
    notes: 'Credit note for defective laptop return',
    createdAt: '2023-08-15T10:00:00Z',
    updatedAt: '2023-08-15T10:00:00Z',
    affectsStock: true,
    stockAdjusted: true,
    appliedAmount: 0,
    remainingAmount: 14400,
    isFullyApplied: false,
    applications: []
  },
  {
    id: 'cn-102',
    companyId: '101',
    clientId: '202',
    invoiceId: 'inv-105',
    creditNoteNumber: 'AVO-2023-0002',
    date: '2023-09-05T14:30:00Z',
    status: 'applied',
    reason: 'goodwill',
    reasonDescription: 'Post-purchase discount as goodwill',
    items: [
      {
        id: 'cni-102-1',
        productId: 'prod-103',
        description: 'Software Development Services',
        quantity: 1,
        unitPrice: 5000,
        vatRate: 20,
        discount: 0,
        total: 5000
      }
    ],
    subtotal: 5000,
    vatAmount: 1000,
    total: 6000,
    notes: 'Goodwill discount after delivery issues',
    createdAt: '2023-09-05T14:30:00Z',
    updatedAt: '2023-09-05T15:45:00Z',
    affectsStock: false,
    appliedAmount: 6000,
    remainingAmount: 0,
    isFullyApplied: true,
    applications: [
      {
        id: 'cna-102-1',
        creditNoteId: 'cn-102',
        targetInvoiceId: 'inv-107',
        amount: 6000,
        date: '2023-09-05T15:45:00Z',
        isRefund: false,
        createdAt: '2023-09-05T15:45:00Z',
        updatedAt: '2023-09-05T15:45:00Z'
      }
    ]
  },
  {
    id: 'cn-103',
    companyId: '101',
    clientId: '203',
    invoiceId: 'inv-110',
    creditNoteNumber: 'AVO-2023-0003',
    date: '2023-10-10T09:15:00Z',
    status: 'draft',
    reason: 'mistake',
    reasonDescription: 'Correction of invoicing error',
    items: [
      {
        id: 'cni-103-1',
        productId: 'prod-105',
        description: 'Network Configuration',
        quantity: 10,
        unitPrice: 200,
        vatRate: 20,
        discount: 0,
        total: 2000
      }
    ],
    subtotal: 2000,
    vatAmount: 400,
    total: 2400,
    notes: 'Credit note for incorrect quantity on invoice',
    createdAt: '2023-10-10T09:15:00Z',
    updatedAt: '2023-10-10T09:15:00Z',
    affectsStock: false,
    appliedAmount: 0,
    remainingAmount: 2400,
    isFullyApplied: false,
    applications: []
  }
];

// Add the following utility functions for credit notes

// Get a credit note by ID
export const getCreditNoteById = (id: string): CreditNote | undefined => {
  return mockCreditNotes.find(creditNote => creditNote.id === id);
};

// Get credit notes for an invoice
export const getCreditNotesForInvoice = (invoiceId: string): CreditNote[] => {
  return mockCreditNotes.filter(creditNote => creditNote.invoiceId === invoiceId);
};

// Create a new credit note
export const createCreditNote = (creditNote: Omit<CreditNote, 'id' | 'createdAt' | 'updatedAt'>): CreditNote => {
  const now = new Date().toISOString();
  const id = `cn-${Date.now()}`;
  
  const newCreditNote: CreditNote = {
    ...creditNote,
    id,
    createdAt: now,
    updatedAt: now,
    appliedAmount: 0,
    remainingAmount: creditNote.total,
    isFullyApplied: false,
    applications: []
  };
  
  mockCreditNotes.push(newCreditNote);
  
  // Update the original invoice to indicate it has credit notes
  const invoice = mockInvoices.find(inv => inv.id === creditNote.invoiceId);
  if (invoice) {
    invoice.hasCreditNotes = true;
    invoice.creditNoteIds = invoice.creditNoteIds || [];
    invoice.creditNoteIds.push(id);
    invoice.creditNoteTotal = (invoice.creditNoteTotal || 0) + creditNote.total;
    invoice.updatedAt = now;
  }
  
  return newCreditNote;
};

// Apply a credit note to an invoice or as a refund
export const applyCreditNote = (
  creditNoteId: string, 
  amount: number, 
  targetInvoiceId?: string, 
  refundMethod?: 'bank' | 'cash' | 'check',
  refundReference?: string
): CreditNoteApplication | null => {
  // Find the credit note
  const creditNote = getCreditNoteById(creditNoteId);
  if (!creditNote) return null;
  
  // Check if there's enough remaining amount
  if ((creditNote.remainingAmount || 0) < amount) return null;
  
  const now = new Date().toISOString();
  const id = `cna-${Date.now()}`;
  
  // Create the application
  const application: CreditNoteApplication = {
    id,
    creditNoteId,
    targetInvoiceId,
    amount,
    date: now,
    isRefund: !targetInvoiceId,
    createdAt: now,
    updatedAt: now
  };
  
  if (application.isRefund && refundMethod) {
    application.refundMethod = refundMethod;
    application.refundReference = refundReference;
  }
  
  // Update the credit note
  creditNote.applications = creditNote.applications || [];
  creditNote.applications.push(application);
  creditNote.appliedAmount = (creditNote.appliedAmount || 0) + amount;
  creditNote.remainingAmount = creditNote.total - (creditNote.appliedAmount || 0);
  creditNote.isFullyApplied = creditNote.remainingAmount === 0;
  creditNote.status = creditNote.isFullyApplied ? 'applied' : 'issued';
  creditNote.updatedAt = now;
  
  // Update the target invoice if applicable
  if (targetInvoiceId) {
    const invoice = mockInvoices.find(inv => inv.id === targetInvoiceId);
    if (invoice) {
      // Logic to apply the credit to the invoice...
      // This would typically reduce the amount due on the invoice
      // For the sake of this example, we'll just mark it as updated
      invoice.updatedAt = now;
    }
  }
  
  return application;
};

// Mock proforma invoices data
export const mockProformaInvoices: ProformaInvoice[] = [
  {
    id: 'pro-001',
    companyId: '101',
    clientId: '201',
    proformaNumber: 'PRO-2023-0001',
    date: '2023-07-15T00:00:00Z',
    expiryDate: '2023-08-15T00:00:00Z',
    status: 'sent',
    items: [
      {
        id: 'item-pro-001-1',
        productId: '301',
        description: 'Développement site web - Phase 1',
        quantity: 1,
        unitPrice: 5000,
        vatRate: 20,
        discount: 0,
        total: 5000
      },
      {
        id: 'item-pro-001-2',
        productId: '302',
        description: 'Hébergement web (annuel)',
        quantity: 1,
        unitPrice: 500,
        vatRate: 20,
        discount: 0,
        total: 500
      }
    ],
    subtotal: 5500,
    vatAmount: 1100,
    discount: 0,
    total: 6600,
    notes: "Cette facture proforma est fournie à des fins d'information uniquement et n'a pas de valeur comptable.",
    terms: "Validité de 30 jours.",
    createdAt: '2023-07-15T00:00:00Z',
    updatedAt: '2023-07-15T00:00:00Z'
  },
  {
    id: 'pro-002',
    companyId: '101',
    clientId: '202',
    proformaNumber: 'PRO-2023-0002',
    date: '2023-08-01T00:00:00Z',
    expiryDate: '2023-09-01T00:00:00Z',
    status: 'converted',
    items: [
      {
        id: 'item-pro-002-1',
        productId: '303',
        description: 'Consultation marketing - 10h',
        quantity: 10,
        unitPrice: 120,
        vatRate: 20,
        discount: 0,
        total: 1200
      }
    ],
    subtotal: 1200,
    vatAmount: 240,
    discount: 0,
    total: 1440,
    notes: "Cette facture proforma est fournie à des fins d'information uniquement et n'a pas de valeur comptable.",
    terms: "Validité de 30 jours.",
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2023-08-05T00:00:00Z',
    convertedInvoiceId: '405',
    convertedAt: '2023-08-05T00:00:00Z'
  },
  {
    id: 'pro-003',
    companyId: '101',
    clientId: '203',
    proformaNumber: 'PRO-2023-0003',
    date: '2023-09-10T00:00:00Z',
    expiryDate: '2023-10-10T00:00:00Z',
    status: 'draft',
    items: [
      {
        id: 'item-pro-003-1',
        productId: '304',
        description: 'Audit SEO',
        quantity: 1,
        unitPrice: 1500,
        vatRate: 20,
        discount: 150,
        total: 1350
      }
    ],
    subtotal: 1500,
    vatAmount: 300,
    discount: 150,
    total: 1650,
    notes: "Brouillon de facture proforma pour approbation interne.",
    terms: "Validité de 30 jours après émission.",
    createdAt: '2023-09-10T00:00:00Z',
    updatedAt: '2023-09-10T00:00:00Z'
  }
];

export interface AdvancePaymentReportItem {
  id: string;
  depositInvoiceId: string;
  depositInvoiceNumber: string;
  clientId: string;
  clientName?: string;
  date: string;
  total: number;
  mainInvoiceId?: string;
  mainInvoiceNumber?: string;
  depositPercentage: number;
  remainingAmount: number;
  status: string;
}

// Function to get advance payment report data
export const getAdvancePaymentReport = (
  companyId: string,
  filters?: {
    clientId?: string;
    startDate?: string;
    endDate?: string;
    status?: string[];
  }
): AdvancePaymentReportItem[] => {
  // Find all invoices that are deposits
  let depositInvoices = mockInvoices.filter(
    invoice => invoice.companyId === companyId && invoice.isDeposit === true
  );
  
  // Apply filters if provided
  if (filters) {
    if (filters.clientId) {
      depositInvoices = depositInvoices.filter(
        invoice => invoice.clientId === filters.clientId
      );
    }
    
    if (filters.startDate) {
      depositInvoices = depositInvoices.filter(
        invoice => new Date(invoice.date) >= new Date(filters.startDate!)
      );
    }
    
    if (filters.endDate) {
      depositInvoices = depositInvoices.filter(
        invoice => new Date(invoice.date) <= new Date(filters.endDate!)
      );
    }
    
    if (filters.status && filters.status.length > 0) {
      depositInvoices = depositInvoices.filter(
        invoice => filters.status!.includes(invoice.status)
      );
    }
  }
  
  // Create report items
  const reportItems: AdvancePaymentReportItem[] = depositInvoices.map(invoice => {
    const client = getClientById(invoice.clientId);
    const mainInvoice = invoice.depositForInvoiceId 
      ? getInvoiceById(invoice.depositForInvoiceId) 
      : undefined;
    
    return {
      id: `apr-${invoice.id}`,
      depositInvoiceId: invoice.id,
      depositInvoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      clientName: client?.name,
      date: invoice.date,
      total: invoice.total,
      mainInvoiceId: mainInvoice?.id,
      mainInvoiceNumber: mainInvoice?.invoiceNumber,
      depositPercentage: invoice.depositPercentage || 0,
      remainingAmount: mainInvoice ? (mainInvoice.total - invoice.total) : invoice.total,
      status: invoice.status
    };
  });
  
  // Sort by date (newest first)
  return reportItems.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Function to create a new payment and update the related invoice
export const createPayment = (paymentData: any): Payment => {
  const now = new Date().toISOString();
  const { invoiceId, amount, method, date, reference, notes, companyId, status, additionalFields } = paymentData;
  
  // Create a new transaction ID
  const transactionId = `TR-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
  
  // Create the payment object
  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    companyId,
    invoiceId,
    transactionId,
    amount,
    date: date.toISOString(),
    method,
    reference: reference || undefined,
    notes: notes || undefined,
    status: status || 'completed',
    createdAt: now,
    updatedAt: now,
    additionalFields: additionalFields || undefined
  };
  
  // Add the payment to the mock payments
  mockPayments.unshift(newPayment);
  
  // Update the invoice
  const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex !== -1) {
    const invoice = mockInvoices[invoiceIndex];
    
    // Calculate current paid amount
    const currentPaidAmount = invoice.paidAmount || 0;
    const newPaidAmount = currentPaidAmount + amount;
    
    // Determine new status
    let newStatus: InvoiceStatus = invoice.status;
    if (newPaidAmount >= invoice.total) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }
    
    // Update the invoice
    mockInvoices[invoiceIndex] = {
      ...invoice,
      paidAmount: newPaidAmount,
      status: newStatus,
      lastPaymentDate: date.toISOString(),
      updatedAt: now
    };
  }
  
  return newPayment;
};
