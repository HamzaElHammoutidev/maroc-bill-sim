
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Simple translations for demonstration
const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Auth
    'login.title': 'Connexion',
    'login.email': 'Email',
    'login.password': 'Mot de passe',
    'login.role': 'Rôle',
    'login.button': 'Se connecter',
    'login.remember': 'Se souvenir de moi',
    
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.clients': 'Clients',
    'nav.products': 'Produits',
    'nav.invoices': 'Factures',
    'nav.quotes': 'Devis',
    'nav.payments': 'Paiements',
    'nav.reports': 'Rapports',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue sur MarocBill',
    'dashboard.total_sales': 'Ventes totales',
    'dashboard.pending_invoices': 'Factures en attente',
    'dashboard.overdue_invoices': 'Factures en retard',
    'dashboard.paid_invoices': 'Factures payées',
    'dashboard.recent_activity': 'Activité récente',
    'dashboard.monthly_revenue': 'Revenus mensuels',
    'dashboard.top_clients': 'Meilleurs clients',
    
    // Clients
    'clients.title': 'Clients',
    'clients.add': 'Ajouter un client',
    'clients.search': 'Rechercher un client',
    'clients.name': 'Nom',
    'clients.ice': 'ICE',
    'clients.if': 'IF',
    'clients.rc': 'RC',
    'clients.email': 'Email',
    'clients.phone': 'Téléphone',
    'clients.address': 'Adresse',
    'clients.city': 'Ville',
    'clients.actions': 'Actions',
    
    // Forms
    'form.save': 'Enregistrer',
    'form.cancel': 'Annuler',
    'form.edit': 'Modifier',
    'form.delete': 'Supprimer',
    'form.view': 'Voir',
    
    // Invoices
    'invoices.title': 'Factures',
    'invoices.create': 'Créer une facture',
    'invoices.number': 'N° Facture',
    'invoices.date': 'Date',
    'invoices.due_date': 'Date d\'échéance',
    'invoices.client': 'Client',
    'invoices.amount': 'Montant',
    'invoices.status': 'Statut',
    'invoices.actions': 'Actions',
    'invoices.paid': 'Payée',
    'invoices.partial': 'Partiel',
    'invoices.unpaid': 'Non payée',
    'invoices.overdue': 'En retard',
    
    // Common
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.from': 'De',
    'common.to': 'À',
    'common.status': 'Statut',
    'common.actions': 'Actions',
    'common.all': 'Tous',
    'common.loading': 'Chargement...',
    'common.currency': 'MAD',
    'common.select': 'Sélectionner',
    'common.no_results': 'Aucun résultat',
  },
  ar: {
    // Auth
    'login.title': 'تسجيل الدخول',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.role': 'الدور',
    'login.button': 'تسجيل الدخول',
    'login.remember': 'تذكرني',
    
    // Navigation
    'nav.dashboard': 'لوحة القيادة',
    'nav.clients': 'العملاء',
    'nav.products': 'المنتجات',
    'nav.invoices': 'الفواتير',
    'nav.quotes': 'عروض الأسعار',
    'nav.payments': 'المدفوعات',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    
    // Dashboard
    'dashboard.title': 'لوحة القيادة',
    'dashboard.welcome': 'مرحبًا بك في المغرب بيل',
    'dashboard.total_sales': 'إجمالي المبيعات',
    'dashboard.pending_invoices': 'الفواتير المعلقة',
    'dashboard.overdue_invoices': 'الفواتير المتأخرة',
    'dashboard.paid_invoices': 'الفواتير المدفوعة',
    'dashboard.recent_activity': 'النشاط الأخير',
    'dashboard.monthly_revenue': 'الإيرادات الشهرية',
    'dashboard.top_clients': 'أفضل العملاء',
    
    // Clients
    'clients.title': 'العملاء',
    'clients.add': 'إضافة عميل',
    'clients.search': 'البحث عن عميل',
    'clients.name': 'الاسم',
    'clients.ice': 'ICE',
    'clients.if': 'IF',
    'clients.rc': 'RC',
    'clients.email': 'البريد الإلكتروني',
    'clients.phone': 'الهاتف',
    'clients.address': 'العنوان',
    'clients.city': 'المدينة',
    'clients.actions': 'الإجراءات',
    
    // Forms
    'form.save': 'حفظ',
    'form.cancel': 'إلغاء',
    'form.edit': 'تعديل',
    'form.delete': 'حذف',
    'form.view': 'عرض',
    
    // Invoices
    'invoices.title': 'الفواتير',
    'invoices.create': 'إنشاء فاتورة',
    'invoices.number': 'رقم الفاتورة',
    'invoices.date': 'التاريخ',
    'invoices.due_date': 'تاريخ الاستحقاق',
    'invoices.client': 'العميل',
    'invoices.amount': 'المبلغ',
    'invoices.status': 'الحالة',
    'invoices.actions': 'الإجراءات',
    'invoices.paid': 'مدفوعة',
    'invoices.partial': 'مدفوعة جزئيًا',
    'invoices.unpaid': 'غير مدفوعة',
    'invoices.overdue': 'متأخرة',
    
    // Common
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.from': 'من',
    'common.to': 'إلى',
    'common.status': 'الحالة',
    'common.actions': 'الإجراءات',
    'common.all': 'الكل',
    'common.loading': 'جار التحميل...',
    'common.currency': 'درهم',
    'common.select': 'اختر',
    'common.no_results': 'لا توجد نتائج',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    // Add RTL support for Arabic
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    if (language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
