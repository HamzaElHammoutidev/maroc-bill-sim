
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getInvoiceStats, getTopClients, mockInvoices, mockClients } from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  RefreshCcw,
  Eye,
  Edit,
  Trash,
  Download
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const companyId = user?.companyId || '101'; // Default for demo
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Get data with the refreshKey dependency
  const stats = React.useMemo(() => getInvoiceStats(companyId), [companyId, refreshKey]);
  const topClients = React.useMemo(() => getTopClients(companyId), [companyId, refreshKey]);
  
  // Recent invoices - just the last 5
  const recentInvoices = React.useMemo(() => 
    [...mockInvoices]
      .filter(invoice => invoice.companyId === companyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    [companyId, refreshKey]
  );
  
  // Function to refresh data
  const refreshData = useCallback(() => {
    setLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      setLoading(false);
      toast({
        title: t('dashboard.data_refreshed'),
        description: t('dashboard.refresh_success'),
      });
    }, 800);
  }, [toast, t]);
  
  // Function to view invoice details (mock for now)
  const viewInvoice = useCallback((invoiceId: string) => {
    toast({
      title: t('invoices.view'),
      description: `${t('invoices.viewing')} #${invoiceId}`,
    });
  }, [toast, t]);
  
  // Function to download invoice (mock for now)
  const downloadInvoice = useCallback((invoiceId: string) => {
    toast({
      title: t('invoices.download'),
      description: `${t('invoices.downloading')} #${invoiceId}`,
    });
  }, [toast, t]);
  
  // COLORS
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('dashboard.title')} 
        description={t('dashboard.welcome')}
        action={{
          label: 'dashboard.refresh',
          onClick: refreshData
        }}
        icon={<RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('dashboard.total_sales')}
          value={`${stats.total.toLocaleString()} ${t('common.currency')}`}
          icon={DollarSign}
          colorClass="bg-primary/10 text-primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={t('dashboard.pending_invoices')}
          value={`${stats.totalPending.toLocaleString()} ${t('common.currency')}`}
          icon={Clock}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title={t('dashboard.overdue_invoices')}
          value={`${stats.totalOverdue.toLocaleString()} ${t('common.currency')}`}
          icon={AlertTriangle}
          colorClass="bg-red-50 text-red-600"
        />
        <StatCard
          title={t('dashboard.paid_invoices')}
          value={`${stats.totalPaid.toLocaleString()} ${t('common.currency')}`}
          icon={CheckCircle}
          colorClass="bg-green-50 text-green-600"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('dashboard.monthly_revenue')}</CardTitle>
              <CardDescription>{t('dashboard.revenue_description')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={stats.monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} ${t('common.currency')}`, t('dashboard.revenue')]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#colorUv)" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('dashboard.top_clients')}</CardTitle>
              <CardDescription>{t('dashboard.clients_description')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topClients}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {topClients.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} ${t('common.currency')}`, t('dashboard.revenue')]}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
            <CardDescription>{t('dashboard.activity_description')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">{t('invoices.number')}</th>
                  <th className="text-left py-3 px-4 font-medium">{t('invoices.client')}</th>
                  <th className="text-left py-3 px-4 font-medium">{t('invoices.date')}</th>
                  <th className="text-left py-3 px-4 font-medium">{t('invoices.amount')}</th>
                  <th className="text-left py-3 px-4 font-medium">{t('invoices.status')}</th>
                  <th className="text-left py-3 px-4 font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => {
                  const client = mockClients.find(c => c.id === invoice.clientId);
                  
                  return (
                    <tr 
                      key={invoice.id} 
                      className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm">
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-sm">{client?.name}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {invoice.total.toLocaleString()} {t('common.currency')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <StatusBadge status={invoice.status} type="invoice" />
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => viewInvoice(invoice.id)}
                            title={t('common.view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => downloadInvoice(invoice.id)}
                            title={t('common.download')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-more-vertical"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  toast({
                                    title: t('invoices.edit'),
                                    description: `${t('invoices.editing')} #${invoice.invoiceNumber}`,
                                  });
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>{t('common.edit')}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  toast({
                                    title: t('invoices.delete'),
                                    description: `${t('invoices.delete_confirmation')} #${invoice.invoiceNumber}`,
                                    variant: "destructive"
                                  });
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>{t('common.delete')}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            {t('common.showing')} {recentInvoices.length} {t('common.of')} {mockInvoices.filter(invoice => invoice.companyId === companyId).length} {t('invoices.title')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: t('common.view_all'),
                description: t('invoices.view_all_redirect'),
              });
            }}
          >
            {t('common.view_all')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
