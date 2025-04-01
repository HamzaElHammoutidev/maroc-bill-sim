import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getClientById, 
  getClientInvoices, 
  getClientQuotes, 
  getClientPayments,
  getClientBalance,
  getClientTotalVat,
  Client, 
  Invoice, 
  Quote, 
  Payment 
} from '@/data/mockData';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  FileText,
  Receipt,
  CreditCard,
  Clock,
  Users,
  Edit,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber } from '@/utils/format';
import { AccountStatement } from '@/components/common/EntityManagement';
import { toast } from 'sonner';

const ClientDetail = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [totalVat, setTotalVat] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (!clientId) {
      navigate('/clients');
      return;
    }
    
    // Fetch client data
    const clientData = getClientById(clientId);
    if (!clientData) {
      toast.error(t('clients.not_found'));
      navigate('/clients');
      return;
    }
    
    // Check if client belongs to the current company
    const companyId = user?.companyId || '101';
    if (clientData.companyId !== companyId) {
      toast.error(t('common.access_denied'));
      navigate('/clients');
      return;
    }
    
    // Set client data
    setClient(clientData);
    
    // Fetch related data
    const clientInvoices = getClientInvoices(clientId);
    const clientQuotes = getClientQuotes(clientId);
    const clientPayments = getClientPayments(clientId);
    const clientBalance = getClientBalance(clientId);
    const clientTotalVat = getClientTotalVat(clientId);
    
    setInvoices(clientInvoices);
    setQuotes(clientQuotes);
    setPayments(clientPayments);
    setBalance(clientBalance);
    setTotalVat(clientTotalVat);
    
    setLoading(false);
  }, [clientId, navigate, t, user]);
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!client) {
    return null;
  }
  
  return (
    <div className="staggered-fade-in space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          
          {client.category && (
            <Badge className="ml-2">{client.category}</Badge>
          )}
        </div>
        
        <Button onClick={() => navigate('/clients', { state: { editClientId: client.id } })}>
          <Edit className="h-4 w-4 mr-2" />
          {t('form.edit')}
        </Button>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="details">{t('account.client.details')}</TabsTrigger>
          <TabsTrigger value="statement">{t('account.client.history')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
          {/* General Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('account.client.details')}</CardTitle>
              <CardDescription>{t('clients.information')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{t('clients.name')}</div>
                      <div>{client.name}</div>
                    </div>
                  </div>
                  
                  {client.contactName && (
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">{t('clients.contact_name')}</div>
                        <div>{client.contactName}</div>
                      </div>
                    </div>
                  )}
                  
                  {client.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">{t('clients.email')}</div>
                        <div>
                          <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                            {client.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{t('clients.phone')}</div>
                      <div>
                        <a href={`tel:${client.phone}`} className="text-primary hover:underline">
                          {formatPhoneNumber(client.phone)}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {client.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">{t('clients.website')}</div>
                        <div>
                          <a 
                            href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {client.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right column */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{t('clients.address')}</div>
                      <div>{client.address}</div>
                      <div>{client.city}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{t('clients.legal_info')}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                        <div className="text-sm text-muted-foreground">{t('clients.ice')}:</div>
                        <div className="text-sm">{client.ice || '—'}</div>
                        
                        <div className="text-sm text-muted-foreground">{t('clients.if')}:</div>
                        <div className="text-sm">{client.if || '—'}</div>
                        
                        <div className="text-sm text-muted-foreground">{t('clients.rc')}:</div>
                        <div className="text-sm">{client.rc || '—'}</div>
                        
                        <div className="text-sm text-muted-foreground">{t('clients.cnss')}:</div>
                        <div className="text-sm">{client.cnss || '—'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{t('clients.preferredPaymentMethod')}</div>
                      <div>
                        {client.preferredPaymentMethod 
                          ? t(`payment.methods.${client.preferredPaymentMethod}`) 
                          : '—'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{t('clients.paymentTerms')}</div>
                      <div>{client.paymentTerms || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Persons */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('account.client.contact.title')}</CardTitle>
                <CardDescription>{t('clients.contacts.description')}</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t('account.client.contact.add')}
              </Button>
            </CardHeader>
            <CardContent>
              {client.contacts && client.contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.contacts.map(contact => (
                    <div key={contact.id} className="border rounded-md p-4 hover:border-primary transition-colors">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">{contact.name}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">{contact.role}</div>
                      {contact.email && (
                        <div className="text-sm mb-1">
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="text-sm">
                          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {t('clients.contacts.none')}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Financial Summary */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('account.balance.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">{t('account.balance.invoices')}</div>
                  <div className="text-2xl font-bold">{invoices.length}</div>
                </div>
                
                <div className="p-4 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">{t('quotes.title')}</div>
                  <div className="text-2xl font-bold">{quotes.length}</div>
                </div>
                
                <div className="p-4 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">{t('account.balance.balance')}</div>
                  <div className={`text-2xl font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                      maximumFractionDigits: 2,
                    }).format(balance)}
                  </div>
                </div>
                
                <div className="p-4 bg-secondary/20 rounded-md">
                  <div className="text-sm text-muted-foreground">{t('invoice.vat_total')}</div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD',
                      maximumFractionDigits: 2,
                    }).format(totalVat)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statement" className="mt-6">
          <AccountStatement 
            invoices={invoices}
            payments={payments}
            currencySymbol="DH"
            initialLimit={10}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;