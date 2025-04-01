import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, QuoteStatus } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Percent, TrendingUp, Users, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface QuoteStatisticsProps {
  quotes: Quote[];
  onExport: () => void;
}

// Status colors for charts
const STATUS_COLORS = {
  draft: '#d1d5db',
  pending_validation: '#fbbf24',
  awaiting_acceptance: '#60a5fa',
  accepted: '#34d399',
  rejected: '#ef4444',
  expired: '#a1a1aa',
  converted: '#8b5cf6',
};

const QuoteStatistics: React.FC<QuoteStatisticsProps> = ({ quotes, onExport }) => {
  const { t } = useTranslation();
  
  // Calculate statistics
  const stats = useMemo(() => {
    // Total quotes count
    const totalQuotes = quotes.length;
    
    // Count by status
    const statusCounts = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to percentages
    const statusPercentages = Object.entries(statusCounts).reduce((acc, [status, count]) => {
      acc[status] = (count / totalQuotes) * 100;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate conversion rate
    const convertedCount = statusCounts.converted || 0;
    const acceptedCount = statusCounts.accepted || 0;
    const totalConvertible = convertedCount + acceptedCount;
    const conversionRate = totalConvertible > 0 ? (convertedCount / totalConvertible) * 100 : 0;
    
    // Calculate acceptance rate
    const totalFinalized = (statusCounts.accepted || 0) + 
                          (statusCounts.rejected || 0) + 
                          (statusCounts.expired || 0) + 
                          (statusCounts.converted || 0);
    const acceptanceRate = totalFinalized > 0 ? 
      ((statusCounts.accepted || 0) + (statusCounts.converted || 0)) / totalFinalized * 100 : 0;
    
    // Calculate average time to acceptance (in days)
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted' || q.status === 'converted');
    let avgTimeToAcceptance = 0;
    
    if (acceptedQuotes.length > 0) {
      const totalDays = acceptedQuotes.reduce((sum, quote) => {
        const created = new Date(quote.createdAt);
        const accepted = new Date(quote.updatedAt); // Using updatedAt as a proxy for acceptance date
        const diffTime = Math.abs(accepted.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      
      avgTimeToAcceptance = totalDays / acceptedQuotes.length;
    }
    
    // Calculate average quote value
    const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0);
    const avgQuoteValue = totalQuotes > 0 ? totalValue / totalQuotes : 0;
    
    // Calculate monthly distribution
    const monthlyData = quotes.reduce((acc, quote) => {
      const date = new Date(quote.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: `${t(`common.months.${date.getMonth()}`)} ${date.getFullYear()}`,
          total: 0,
          accepted: 0,
          rejected: 0,
          converted: 0,
        };
      }
      
      acc[monthKey].total += 1;
      
      if (quote.status === 'accepted') acc[monthKey].accepted += 1;
      if (quote.status === 'rejected') acc[monthKey].rejected += 1;
      if (quote.status === 'converted') acc[monthKey].converted += 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by date
    const monthlyTrends = Object.values(monthlyData).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
    
    // Data for status distribution pie chart
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: t(`quotes.status.${status}`),
      value: count,
      status,
    }));
    
    return {
      totalQuotes,
      statusCounts,
      statusPercentages,
      conversionRate,
      acceptanceRate,
      avgTimeToAcceptance,
      avgQuoteValue,
      monthlyTrends,
      statusDistribution,
      totalValue,
    };
  }, [quotes, t]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">{t('quotes.statisticsTitle')}</h2>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          {t('quotes.export')}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Quotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('quotes.totalQuotes')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              {t('quotes.totalValue')}: {formatCurrency(stats.totalValue)}
            </p>
          </CardContent>
        </Card>
        
        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('quotes.conversionRate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.conversionRate)}</div>
            <Progress value={stats.conversionRate} className="h-2" />
          </CardContent>
        </Card>
        
        {/* Acceptance Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('quotes.acceptanceRate')}
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.acceptanceRate)}</div>
            <Progress value={stats.acceptanceRate} className="h-2" />
          </CardContent>
        </Card>
        
        {/* Average Quote Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('quotes.avgQuoteValue')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgQuoteValue)}</div>
            <p className="text-xs text-muted-foreground">
              {t('quotes.avgTimeToAcceptance')}: {Math.round(stats.avgTimeToAcceptance)} {t('quotes.days')}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">{t('quotes.trends')}</TabsTrigger>
          <TabsTrigger value="status">{t('quotes.statusDistribution')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('quotes.monthlyTrends')}</CardTitle>
              <CardDescription>
                {t('quotes.monthlyTrendsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.monthlyTrends}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name={t('quotes.totalCreated')} fill="#6366f1" />
                    <Bar dataKey="accepted" name={t('quotes.accepted')} fill="#34d399" />
                    <Bar dataKey="rejected" name={t('quotes.rejected')} fill="#ef4444" />
                    <Bar dataKey="converted" name={t('quotes.converted')} fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('quotes.statusSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: STATUS_COLORS[status as QuoteStatus] || '#ccc' }}
                      />
                      <div className="flex-1 text-sm">
                        {t(`quotes.status.${status}`)}
                      </div>
                      <div className="text-sm font-medium">
                        {count} ({formatPercentage(stats.statusPercentages[status])})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('quotes.conversionMetrics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                    <span className="text-sm">{t('quotes.acceptedRate')}</span>
                  </div>
                  <span>{formatPercentage(stats.acceptanceRate)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm">{t('quotes.rejectedRate')}</span>
                  </div>
                  <span>
                    {formatPercentage(
                      stats.statusPercentages.rejected ? 
                      stats.statusPercentages.rejected : 0
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-sm">{t('quotes.expirationRate')}</span>
                  </div>
                  <span>
                    {formatPercentage(
                      stats.statusPercentages.expired ? 
                      stats.statusPercentages.expired : 0
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm">{t('quotes.conversionToInvoice')}</span>
                  </div>
                  <span>{formatPercentage(stats.conversionRate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>{t('quotes.statusDistribution')}</CardTitle>
              <CardDescription>
                {t('quotes.statusDistributionDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.statusDistribution.map((entry) => (
                      <Cell 
                        key={`cell-${entry.status}`} 
                        fill={STATUS_COLORS[entry.status as QuoteStatus] || '#ccc'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, t('quotes.count')]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteStatistics; 