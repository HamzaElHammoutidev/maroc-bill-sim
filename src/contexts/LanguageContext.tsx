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
    'form.duplicate': 'Dupliquer',
    
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
    
    // Quotes
    'quotes.title': 'Devis',
    'quotes.description': 'Gérez vos devis et propositions commerciales',
    'quotes.add': 'Nouveau devis',
    'quotes.numberColumn': 'N° Devis',
    'quotes.clientColumn': 'Client',
    'quotes.dateColumn': 'Date',
    'quotes.expiryColumn': 'Validité',
    'quotes.totalColumn': 'Montant',
    'quotes.statusColumn': 'Statut',
    'quotes.actions': 'Actions',
    'quotes.unknownClient': 'Client inconnu',
    'quotes.search': 'Rechercher un devis',
    'quotes.noResults': 'Aucun devis ne correspond à votre recherche',
    'quotes.emptyState': 'Aucun devis pour le moment',
    'quotes.recentTitle': 'Devis récents',
    'quotes.draftStatus': 'Brouillons',
    'quotes.sentStatus': 'Envoyés',
    'quotes.acceptedStatus': 'Acceptés',
    'quotes.rejectedStatus': 'Refusés',
    'quotes.expiredStatus': 'Expirés',
    'quotes.convertedStatus': 'Convertis',
    'quotes.conversionRate': 'Taux de conversion',
    'quotes.filterStatus': 'Statut',
    'quotes.filterClient': 'Client',
    'quotes.filterDateRange': 'Période',
    'quotes.filterApply': 'Appliquer',
    'quotes.filterReset': 'Réinitialiser',
    'quotes.send': 'Envoyer',
    'quotes.convert': 'Convertir',
    'quotes.duplicate': 'Dupliquer',
    'quotes.editError': 'Modification impossible',
    'quotes.editErrorDesc': 'Seuls les devis en brouillon ou envoyés peuvent être modifiés',
    'quotes.sendError': 'Envoi impossible',
    'quotes.sendErrorDesc': 'Seuls les devis en brouillon ou envoyés peuvent être envoyés',
    'quotes.conversionError': 'Conversion impossible',
    'quotes.conversionErrorDesc': 'Seuls les devis acceptés peuvent être convertis en facture',
    'quotes.deleteError': 'Suppression impossible',
    'quotes.deleteErrorDesc': 'Les devis convertis en facture ne peuvent pas être supprimés',
    'quotes.createToast': 'Devis créé',
    'quotes.createToastDesc': 'Le devis a été créé avec succès',
    'quotes.updateToast': 'Devis modifié',
    'quotes.updateToastDesc': 'Le devis a été modifié avec succès',
    'quotes.duplicateToast': 'Devis dupliqué',
    'quotes.duplicateToastDesc': 'Le devis a été dupliqué à partir de',
    'quotes.deleteToast': 'Devis supprimé',
    'quotes.deleteToastDesc': 'Le devis a été supprimé',
    'quotes.sendSuccess': 'Devis envoyé',
    'quotes.sendSuccessDesc': 'Le devis a été envoyé par email',
    'quotes.convertSuccess': 'Devis converti',
    'quotes.convertSuccessDesc': 'Le devis a été converti en facture',
    'quotes.depositCreated': 'Facture d\'acompte créée',
    'quotes.depositCreatedDesc': 'Une facture d\'acompte a été créée pour un montant de',
    'quotes.deleteTitle': 'Confirmer la suppression',
    'quotes.deleteDescription': 'Vous êtes sur le point de supprimer le devis',
    'quotes.deleteWarning': 'Cette action est irréversible.',
    'quotes.sendTitle': 'Envoyer le devis',
    'quotes.sendDescription': 'Envoyer le devis par email au client',
    'quotes.emailTo': 'Destinataire',
    'quotes.emailCc': 'Copie (CC)',
    'quotes.emailSubject': 'Objet',
    'quotes.emailMessage': 'Message',
    'quotes.attachPdf': 'Joindre le devis au format PDF',
    'quotes.allStatus': 'Tous les statuts',
    'quotes.allClients': 'Tous les clients',
    'quotes.cardTitle': 'Liste des devis',
    
    // Products
    'products.title': 'Produits',
    'products.description': 'Gérez vos produits et services',
    'products.add': 'Ajouter un produit',
    'products.search': 'Rechercher un produit',
    'products.nameColumn': 'Nom',
    'products.descriptionColumn': 'Description',
    'products.priceColumn': 'Prix',
    'products.vatColumn': 'TVA',
    'products.typeColumn': 'Type',
    'products.actions': 'Actions',
    'products.product': 'Produit',
    'products.service': 'Service',
    'products.noResults': 'Aucun produit ne correspond à votre recherche',
    'products.emptyState': 'Aucun produit pour le moment',
    'products.cardTitle': 'Liste des produits',
    'products.viewToast': 'Voir le produit',
    'products.viewToastDesc': 'Vous consultez',
    'products.editToast': 'Modifier le produit',
    'products.editToastDesc': 'Vous modifiez',
    'products.duplicateToast': 'Dupliquer le produit',
    'products.duplicateToastDesc': 'Vous dupliquez',
    'products.deleteToast': 'Supprimer le produit',
    'products.deleteToastDesc': 'Vous supprimez',
    'products.addToast': 'Produit ajouté',
    'products.addToastDesc': 'Le produit a été ajouté avec succès',
    
    // Reports
    'reports.title': 'Rapports',
    'reports.description': 'Consultez vos rapports financiers',
    'reports.select_type': 'Sélectionner un type',
    'reports.types.sales': 'Ventes',
    'reports.types.clients': 'Clients',
    'reports.types.products': 'Produits',
    'reports.types.invoices': 'Factures',
    'reports.refresh': 'Actualiser',
    'reports.export': 'Exporter',
    'reports.share': 'Partager',
    'reports.sales_title': 'Rapport des ventes',
    'reports.clients_title': 'Rapport des clients',
    'reports.products_title': 'Rapport des produits',
    'reports.invoices_title': 'Rapport des factures',
    'reports.chart_placeholder': 'Le graphique sera affiché ici',
    'reports.summary_title': 'Résumé',
    'reports.summary_placeholder': 'Le résumé sera affiché ici',
    'reports.trends_title': 'Tendances',
    'reports.trends_placeholder': 'Les tendances seront affichées ici',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.description': 'Gérer les paramètres de votre compte',
    'settings.tabs.general': 'Général',
    'settings.tabs.notifications': 'Notifications',
    'settings.tabs.security': 'Sécurité',
    'settings.tabs.billing': 'Facturation',
    'settings.language.title': 'Langue',
    'settings.language.description': 'Sélectionnez votre langue préférée',
    'settings.theme.title': 'Thème',
    'settings.theme.description': 'Personnaliser l\'apparence de votre application',
    'settings.theme.darkMode': 'Mode sombre',
    'settings.notifications.title': 'Préférences de notification',
    'settings.notifications.description': 'Gérer comment vous recevez les notifications',
    'settings.notifications.email': 'Notifications par email',
    'settings.notifications.push': 'Notifications push',
    'settings.notifications.sms': 'Notifications SMS',
    'settings.security.title': 'Sécurité',
    'settings.security.description': 'Gérer la sécurité de votre compte',
    'settings.security.placeholder': 'Options de sécurité à venir',
    'settings.billing.title': 'Facturation',
    'settings.billing.description': 'Gérer vos informations de facturation',
    'settings.billing.placeholder': 'Options de facturation à venir',
    
    // Unauthorized
    'unauthorized.title': 'Accès non autorisé',
    'unauthorized.message': 'Vous n\'avez pas la permission d\'accéder à cette page.',
    'unauthorized.back': 'Retour au tableau de bord',
    
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
    'form.duplicate': 'نسخ',
    
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
    
    // Quotes
    'quotes.title': 'عروض الأسعار',
    'quotes.description': 'إدارة عروض الأسعار والمقترحات التجارية',
    'quotes.add': 'عرض سعر جديد',
    'quotes.numberColumn': 'رقم العرض',
    'quotes.clientColumn': 'العميل',
    'quotes.dateColumn': 'التاريخ',
    'quotes.expiryColumn': 'الصلاحية',
    'quotes.totalColumn': 'المبلغ',
    'quotes.statusColumn': 'الحالة',
    'quotes.actions': 'الإجراءات',
    'quotes.unknownClient': 'عميل غير معروف',
    'quotes.search': 'البحث عن عرض',
    'quotes.noResults': 'لا توجد عروض تطابق بحثك',
    'quotes.emptyState': 'لا توجد عروض حتى الآن',
    'quotes.recentTitle': 'العروض الأخيرة',
    'quotes.draftStatus': 'المسودات',
    'quotes.sentStatus': 'المرسلة',
    'quotes.acceptedStatus': 'المقبولة',
    'quotes.rejectedStatus': 'المرفوضة',
    'quotes.expiredStatus': 'المنتهية',
    'quotes.convertedStatus': 'المحولة',
    'quotes.conversionRate': 'معدل التحويل',
    'quotes.filterStatus': 'الحالة',
    'quotes.filterClient': 'العميل',
    'quotes.filterDateRange': 'الفترة',
    'quotes.filterApply': 'تطبيق',
    'quotes.filterReset': 'إعادة تعيين',
    'quotes.send': 'إرسال',
    'quotes.convert': 'تحويل',
    'quotes.duplicate': 'نسخ',
    'quotes.editError': 'لا يمكن التعديل',
    'quotes.editErrorDesc': 'يمكن تعديل العروض في حالة المسودة أو المرسلة فقط',
    'quotes.sendError': 'لا يمكن الإرسال',
    'quotes.sendErrorDesc': 'يمكن إرسال العروض في حالة المسودة أو المرسلة فقط',
    'quotes.conversionError': 'لا يمكن التحويل',
    'quotes.conversionErrorDesc': 'يمكن تحويل العروض المقبولة فقط إلى فواتير',
    'quotes.deleteError': 'لا يمكن الحذف',
    'quotes.deleteErrorDesc': 'لا يمكن حذف العروض المحولة إلى فواتير',
    'quotes.createToast': 'تم إنشاء العرض',
    'quotes.createToastDesc': 'تم إنشاء عرض السعر بنجاح',
    'quotes.updateToast': 'تم تحديث العرض',
    'quotes.updateToastDesc': 'تم تحديث عرض السعر بنجاح',
    'quotes.duplicateToast': 'تم نسخ العرض',
    'quotes.duplicateToastDesc': 'تم نسخ العرض من',
    'quotes.deleteToast': 'تم حذف العرض',
    'quotes.deleteToastDesc': 'تم حذف عرض السعر',
    'quotes.sendSuccess': 'تم إرسال العرض',
    'quotes.sendSuccessDesc': 'تم إرسال عرض السعر بالبريد الإلكتروني',
    'quotes.convertSuccess': 'تم تحويل العرض',
    'quotes.convertSuccessDesc': 'تم تحويل عرض السعر إلى فاتورة',
    'quotes.depositCreated': 'تم إنشاء فاتورة دفعة مقدمة',
    'quotes.depositCreatedDesc': 'تم إنشاء فاتورة دفعة مقدمة بمبلغ',
    'quotes.deleteTitle': 'تأكيد الحذف',
    'quotes.deleteDescription': 'أنت على وشك حذف عرض السعر',
    'quotes.deleteWarning': 'هذا الإجراء لا يمكن التراجع عنه.',
    'quotes.sendTitle': 'إرسال عرض السعر',
    'quotes.sendDescription': 'إرسال عرض السعر بالبريد الإلكتروني إلى العميل',
    'quotes.emailTo': 'المستلم',
    'quotes.emailCc': 'نسخة (CC)',
    'quotes.emailSubject': 'الموضوع',
    'quotes.emailMessage': 'الرسالة',
    'quotes.attachPdf': 'إرفاق عرض السعر بصيغة PDF',
    'quotes.allStatus': 'جميع الحالات',
    'quotes.allClients': 'جميع العملاء',
    'quotes.cardTitle': 'قائمة عروض الأسعار',
    
    // Products
    'products.title': 'المنتجات',
    'products.description': 'إدارة المنتجات والخدمات',
    'products.add': 'إضافة منتج',
    'products.search': 'البحث عن منتج',
    'products.nameColumn': 'الاسم',
    'products.descriptionColumn': 'الوصف',
    'products.priceColumn': 'السعر',
    'products.vatColumn': 'ضريبة القيمة المضافة',
    'products.typeColumn': 'النوع',
    'products.actions': 'الإجراءات',
    'products.product': 'منتج',
    'products.service': 'خدمة',
    'products.noResults': 'لا توجد منتجات تطابق بحثك',
    'products.emptyState': 'لا توجد منتجات حتى الآن',
    'products.cardTitle': 'قائمة المنتجات',
    'products.viewToast': 'عرض المنتج',
    'products.viewToastDesc': 'أنت تعرض',
    'products.editToast': 'تعديل المنتج',
    'products.editToastDesc': 'أنت تعدل',
    'products.duplicateToast': 'نسخ المنتج',
    'products.duplicateToastDesc': 'أنت تنسخ',
    'products.deleteToast': 'حذف المنتج',
    'products.deleteToastDesc': 'أنت تحذف',
    'products.addToast': 'تمت إضافة المنتج',
    'products.addToastDesc': 'تمت إضافة المنتج بنجاح',
    
    // Reports
    'reports.title': 'التقارير',
    'reports.description': 'استعراض التقارير المالية',
    'reports.select_type': 'اختر نوع التقرير',
    'reports.types.sales': 'المبيعات',
    'reports.types.clients': 'العملاء',
    'reports.types.products': 'المنتجات',
    'reports.types.invoices': 'الفواتير',
    'reports.refresh': 'تحديث',
    'reports.export': 'تصدير',
    'reports.share': 'مشاركة',
    'reports.sales_title': 'تقرير المبيعات',
    'reports.clients_title': 'تقرير العملاء',
    'reports.products_title': 'تقرير المنتجات',
    'reports.invoices_title': 'تقرير الفواتير',
    'reports.chart_placeholder': 'سيتم عرض الرسم البياني هنا',
    'reports.summary_title': 'ملخص',
    'reports.summary_placeholder': 'سيتم عرض الملخص هنا',
    'reports.trends_title': 'اتجاهات',
    'reports.trends_placeholder': 'سيتم عرض الاتجاهات هنا',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.description': 'إدارة إعدادات حسابك',
    'settings.tabs.general': 'عام',
    'settings.tabs.notifications': 'الإشعارات',
    'settings.tabs.security': 'الأمان',
    'settings.tabs.billing': 'الفواتير',
    'settings.language.title': 'اللغة',
    'settings.language.description': 'اختر لغتك المفضلة',
    'settings.theme.title': 'المظهر',
    'settings.theme.description': 'تخصيص مظهر التطبيق',
    'settings.theme.darkMode': 'الوضع الداكن',
    'settings.notifications.title': 'تفضيلات الإشعارات',
    'settings.notifications.description': 'إدارة كيفية تلقي الإشعارات',
    'settings.notifications.email': 'إشعارات البريد الإلكتروني',
    'settings.notifications.push': 'إشعارات الدفع',
    'settings.notifications.sms': 'إشعارات الرسائل القصيرة',
    'settings.security.title': 'الأمان',
    'settings.security.description': 'إدارة أمان حسابك',
    'settings.security.placeholder': 'خيارات الأمان قادمة قريباً',
    'settings.billing.title': 'الفواتير',
    'settings.billing.description': 'إدارة معلومات الفواتير',
    'settings.billing.placeholder': 'خيارات الفواتير قادمة قريباً',
    
    // Unauthorized
    'unauthorized.title': 'غير مصرح به',
    'unauthorized.message': 'ليس لديك إذن للوصول إلى هذه الصفحة.',
    'unauthorized.back': 'العودة إلى لوحة التحكم',
    
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
