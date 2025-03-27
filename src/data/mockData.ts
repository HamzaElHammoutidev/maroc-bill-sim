
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
  address: string;
  city: string;
  phone: string;
  email?: string;
  contactName?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

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
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  quoteId?: string; // If converted from a quote
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
}

export interface Payment {
  id: string;
  companyId: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank' | 'check' | 'other';
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
    address: '1 Avenue Annakhil, Hay Riad',
    city: 'Rabat',
    phone: '+212 537 111 111',
    email: 'contact@iam.ma',
    contactName: 'Mohammed Alami',
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
    contactName: 'Fatima Zahra Bennis',
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
    address: '2 Rue Al Abtal, Hay Erraha',
    city: 'Casablanca',
    phone: '+212 522 333 333',
    email: 'contact@ocpgroup.ma',
    contactName: 'Karim Tazi',
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
    address: 'Aéroport Mohammed V',
    city: 'Casablanca',
    phone: '+212 522 444 444',
    email: 'customerservice@royalairmaroc.com',
    contactName: 'Younes Berrada',
    createdAt: '2023-04-05T11:20:00Z',
    updatedAt: '2023-04-05T11:20:00Z'
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
    createdAt: '2023-01-05T13:20:00Z',
    updatedAt: '2023-01-05T13:20:00Z'
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
    updatedAt: '2023-05-10T10:30:00Z'
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
    updatedAt: '2023-06-15T14:45:00Z'
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
    updatedAt: '2023-07-20T09:15:00Z'
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
    updatedAt: '2023-08-05T11:20:00Z'
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
    convertedInvoiceId: '401'
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
    updatedAt: '2023-07-15T14:30:00Z'
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
    updatedAt: '2023-07-25T11:20:00Z'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '601',
    companyId: '101',
    invoiceId: '401',
    amount: 27800,
    date: '2023-05-20T00:00:00Z',
    method: 'bank',
    reference: 'VIR-123456',
    notes: 'Paiement reçu par virement',
    createdAt: '2023-05-20T15:30:00Z',
    updatedAt: '2023-05-20T15:30:00Z'
  },
  {
    id: '602',
    companyId: '101',
    invoiceId: '403',
    amount: 40000,
    date: '2023-07-30T00:00:00Z',
    method: 'check',
    reference: 'CHQ-789012',
    notes: 'Acompte 50%',
    createdAt: '2023-07-30T10:15:00Z',
    updatedAt: '2023-07-30T10:15:00Z'
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
