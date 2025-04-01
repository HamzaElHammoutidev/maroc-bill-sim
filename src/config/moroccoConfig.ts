/**
 * Configuration file for Morocco-specific settings
 */

// Legal notices that must appear on quotes
export const legalNotices = {
  // French versions
  fr: {
    quoteValidity: "Ce devis est valable pour une durée de 30 jours à compter de sa date d'émission.",
    acceptanceTerms: "L'acceptation du présent devis implique également l'acceptation de nos conditions générales de vente.",
    paymentTerms: "Modalités de paiement : 30% d'acompte à la commande, solde à la livraison.",
    signatureRequirement: "Pour acceptation, veuillez retourner ce devis avec la mention 'Bon pour accord', daté et signé.",
    stampRequirement: "Un cachet de l'entreprise est requis pour les professionnels.",
    cancellationTerms: "Toute annulation après acceptation du devis entraînera la facturation des travaux déjà réalisés.",
    disputeResolution: "En cas de litige, la juridiction compétente sera celle du siège social de notre entreprise.",
  },
  // Arabic versions
  ar: {
    quoteValidity: "هذا العرض صالح لمدة 30 يوما من تاريخ إصداره.",
    acceptanceTerms: "قبول هذا العرض يعني أيضا قبول شروط البيع العامة الخاصة بنا.",
    paymentTerms: "شروط الدفع: 30٪ دفعة مقدمة عند الطلب، والرصيد عند التسليم.",
    signatureRequirement: "للقبول، يرجى إعادة هذا العرض مع عبارة 'موافق عليه'، مع التاريخ والتوقيع.",
    stampRequirement: "ختم الشركة مطلوب للمهنيين.",
    cancellationTerms: "أي إلغاء بعد قبول العرض سيؤدي إلى فوترة العمل المنجز بالفعل.",
    disputeResolution: "في حالة نزاع، ستكون المحكمة المختصة هي محكمة المقر الرئيسي لشركتنا.",
  }
};

// VAT rates in Morocco
export const vatRates = [
  { id: 'standard', rate: 20, label: { fr: 'TVA standard (20%)', ar: 'ضريبة القيمة المضافة القياسية (20٪)' } },
  { id: 'reduced_14', rate: 14, label: { fr: 'TVA réduite (14%)', ar: 'ضريبة القيمة المضافة المخفضة (14٪)' } },
  { id: 'reduced_10', rate: 10, label: { fr: 'TVA réduite (10%)', ar: 'ضريبة القيمة المضافة المخفضة (10٪)' } },
  { id: 'reduced_7', rate: 7, label: { fr: 'TVA réduite (7%)', ar: 'ضريبة القيمة المضافة المخفضة (7٪)' } },
  { id: 'exempt', rate: 0, label: { fr: 'Exonéré de TVA', ar: 'معفى من ضريبة القيمة المضافة' } },
];

// Supported currencies
export const currencies = [
  { code: 'MAD', symbol: 'DH', name: { fr: 'Dirham marocain', ar: 'درهم مغربي' } },
  { code: 'EUR', symbol: '€', name: { fr: 'Euro', ar: 'يورو' } },
  { code: 'USD', symbol: '$', name: { fr: 'Dollar américain', ar: 'دولار أمريكي' } },
  { code: 'GBP', symbol: '£', name: { fr: 'Livre sterling', ar: 'جنيه إسترليني' } },
];

// Default currency
export const defaultCurrency = 'MAD';

// Function to convert number to words in Arabic and French
export const numberToWords = {
  fr: (amount: number): string => {
    // This is a simplified version. In a real app, use a dedicated library
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    if (amount === 0) return 'zéro';
    
    // Just a placeholder implementation - not complete
    return `${amount} dirhams`;
  },
  ar: (amount: number): string => {
    // This is a simplified version. In a real app, use a dedicated library
    // Just a placeholder implementation - not complete
    return `${amount} درهم`;
  }
};

// VAT calculation rules
export const vatCalculationRules = {
  // Round to 2 decimal places for display
  roundForDisplay: (amount: number): number => {
    return Math.round(amount * 100) / 100;
  },
  
  // Calculate VAT amount from base price and rate
  calculateVat: (basePrice: number, vatRate: number): number => {
    return (basePrice * vatRate) / 100;
  },
  
  // Convert cents to dirhams (for storing and calculations)
  centsToAmount: (cents: number): number => {
    return cents / 100;
  },
  
  // Convert dirhams to cents (for storing and calculations)
  amountToCents: (amount: number): number => {
    return Math.round(amount * 100);
  }
};

// Export default settings
export default {
  legalNotices,
  vatRates,
  currencies,
  defaultCurrency,
  numberToWords,
  vatCalculationRules
}; 