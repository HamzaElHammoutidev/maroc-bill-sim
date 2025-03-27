
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getInvoiceStats, getTopClients, mockInvoices, mockClients } from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Users
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const companyId = user?.companyId || '101'; // Default for demo
  const stats = getInvoiceStats(companyId);
  const topClients = getTopClients(companyId);
  
  // Recent invoices - just the last 5
  const recentInvoices = [...mockInvoices]
    .filter(invoice => invoice.companyId === companyId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // COLORS
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={t('dashboard.title')} 
        description={t('dashboard.welcome')}
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
          <CardHeader className="pb-2">
            <CardTitle>{t('dashboard.monthly_revenue')}</CardTitle>
            <CardDescription>{t('dashboard.revenue_description')}</CardDescription>
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
          <CardHeader className="pb-2">
            <CardTitle>{t('dashboard.top_clients')}</CardTitle>
            <CardDescription>{t('dashboard.clients_description')}</CardDescription>
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
        <CardHeader>
          <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
          <CardDescription>{t('dashboard.activity_description')}</CardDescription>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
