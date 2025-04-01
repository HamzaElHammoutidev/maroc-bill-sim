import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  ActivityIcon,
  FileTextIcon, 
  UsersIcon,
  ClipboardIcon,
  PackageIcon,
  AlertCircleIcon,
  DollarSignIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  SearchIcon,
} from 'lucide-react';

// Define types for audit log entries
interface AuditLogEntry {
  id: string;
  action: string;
  type: 'user' | 'invoice' | 'quote' | 'client' | 'product' | 'payment' | 'system';
  entityId?: string;
  entityName?: string;
  userId: string;
  userName: string;
  userRole: string;
  details?: string;
  metadata?: Record<string, any>;
  severity: 'info' | 'warning' | 'critical';
  ip?: string;
  timestamp: string;
  companyId: string;
}

// Mock audit log data
const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: '1',
    action: 'user.login',
    type: 'user',
    userId: '3',
    userName: 'John Doe',
    userRole: 'comptable',
    details: 'User logged in successfully',
    ip: '192.168.1.1',
    severity: 'info',
    timestamp: '2023-04-28T14:30:00Z',
    companyId: '101'
  },
  {
    id: '2',
    action: 'invoice.create',
    type: 'invoice',
    entityId: 'INV-2023-0042',
    entityName: 'Invoice #INV-2023-0042',
    userId: '3',
    userName: 'John Doe',
    userRole: 'comptable',
    details: 'Created new invoice for client ACME Inc.',
    metadata: {
      clientId: 'client-123',
      clientName: 'ACME Inc.',
      amount: 1500.00,
      items: 5
    },
    severity: 'info',
    timestamp: '2023-04-28T15:15:00Z',
    companyId: '101'
  },
  {
    id: '3',
    action: 'invoice.delete',
    type: 'invoice',
    entityId: 'INV-2023-0041',
    entityName: 'Invoice #INV-2023-0041',
    userId: '2',
    userName: 'Company Admin',
    userRole: 'admin',
    details: 'Deleted invoice - Reason: duplicate entry',
    severity: 'warning',
    timestamp: '2023-04-28T10:45:00Z',
    companyId: '101'
  },
  {
    id: '4',
    action: 'client.update',
    type: 'client',
    entityId: 'client-123',
    entityName: 'ACME Inc.',
    userId: '4',
    userName: 'Jane Smith',
    userRole: 'commercial',
    details: 'Updated client contact information',
    metadata: {
      fields: ['phone', 'email', 'address']
    },
    severity: 'info',
    timestamp: '2023-04-27T16:20:00Z',
    companyId: '101'
  },
  {
    id: '5',
    action: 'user.create',
    type: 'user',
    entityId: '5',
    entityName: 'Alex Johnson',
    userId: '2',
    userName: 'Company Admin',
    userRole: 'admin',
    details: 'Created new user with role: comptable',
    severity: 'warning',
    timestamp: '2023-04-27T09:30:00Z',
    companyId: '101'
  },
  {
    id: '6',
    action: 'quote.convert',
    type: 'quote',
    entityId: 'QT-2023-0038',
    entityName: 'Quote #QT-2023-0038',
    userId: '4',
    userName: 'Jane Smith',
    userRole: 'commercial',
    details: 'Converted quote to invoice #INV-2023-0042',
    metadata: {
      invoiceId: 'INV-2023-0042',
      clientId: 'client-123',
      clientName: 'ACME Inc.',
      amount: 1500.00
    },
    severity: 'info',
    timestamp: '2023-04-28T15:10:00Z',
    companyId: '101'
  },
  {
    id: '7',
    action: 'payment.record',
    type: 'payment',
    entityId: 'PAY-2023-0025',
    entityName: 'Payment #PAY-2023-0025',
    userId: '3',
    userName: 'John Doe',
    userRole: 'comptable',
    details: 'Recorded payment for invoice #INV-2023-0040',
    metadata: {
      invoiceId: 'INV-2023-0040',
      clientId: 'client-124',
      clientName: 'TechCorp Ltd',
      amount: 2200.00,
      method: 'bank'
    },
    severity: 'info',
    timestamp: '2023-04-26T11:45:00Z',
    companyId: '101'
  },
  {
    id: '8',
    action: 'user.update_permissions',
    type: 'user',
    entityId: '4',
    entityName: 'Jane Smith',
    userId: '2',
    userName: 'Company Admin',
    userRole: 'admin',
    details: 'Updated user permissions - Added: invoices.validate, Removed: clients.delete',
    metadata: {
      added: ['invoices.validate'],
      removed: ['clients.delete']
    },
    severity: 'warning',
    timestamp: '2023-04-25T14:05:00Z',
    companyId: '101'
  },
  {
    id: '9',
    action: 'system.settings_change',
    type: 'system',
    userId: '2',
    userName: 'Company Admin',
    userRole: 'admin',
    details: 'Updated company settings - Changed: Tax rates, Company address',
    severity: 'critical',
    timestamp: '2023-04-25T10:30:00Z',
    companyId: '101'
  },
  {
    id: '10',
    action: 'product.price_change',
    type: 'product',
    entityId: 'product-056',
    entityName: 'Premium Service Package',
    userId: '2',
    userName: 'Company Admin',
    userRole: 'admin',
    details: 'Changed product price from 800.00 to 950.00',
    metadata: {
      oldPrice: 800.00,
      newPrice: 950.00,
      percentChange: 18.75
    },
    severity: 'warning',
    timestamp: '2023-04-24T09:15:00Z',
    companyId: '101'
  }
];

// Get icon for action type
const getActionTypeIcon = (type: string) => {
  switch (type) {
    case 'user':
      return <UsersIcon className="h-4 w-4" />;
    case 'invoice':
      return <FileTextIcon className="h-4 w-4" />;
    case 'quote':
      return <ClipboardIcon className="h-4 w-4" />;
    case 'client':
      return <UsersIcon className="h-4 w-4" />;
    case 'product':
      return <PackageIcon className="h-4 w-4" />;
    case 'payment':
      return <DollarSignIcon className="h-4 w-4" />;
    case 'system':
      return <ActivityIcon className="h-4 w-4" />;
    default:
      return <ActivityIcon className="h-4 w-4" />;
  }
};

// Get severity badge
const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'info':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
    case 'critical':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

const AuditLog = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  
  // State
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() });
  const [isLoading, setIsLoading] = useState(false);
  
  // Load initial data
  useEffect(() => {
    // In a real app, this would fetch from an API
    setLogs(MOCK_AUDIT_LOG);
    setFilteredLogs(MOCK_AUDIT_LOG);
  }, []);
  
  // Apply filters
  useEffect(() => {
    setIsLoading(true);
    
    let result = [...logs];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(log => log.type === typeFilter);
    }
    
    // Apply severity filter
    if (severityFilter !== 'all') {
      result = result.filter(log => log.severity === severityFilter);
    }
    
    // Apply date range filter
    if (dateRange.from) {
      result = result.filter(log => new Date(log.timestamp) >= dateRange.from!);
    }
    if (dateRange.to) {
      // Include the entire day by setting time to 23:59:59
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        log => 
          (log.userName && log.userName.toLowerCase().includes(query)) ||
          (log.entityName && log.entityName.toLowerCase().includes(query)) ||
          (log.details && log.details.toLowerCase().includes(query)) ||
          (log.action && log.action.toLowerCase().includes(query))
      );
    }
    
    setFilteredLogs(result);
    setIsLoading(false);
  }, [logs, typeFilter, severityFilter, dateRange, searchQuery]);
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Reset filters
  const resetFilters = () => {
    setTypeFilter('all');
    setSeverityFilter('all');
    setDateRange({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() });
    setSearchQuery('');
  };
  
  // Export audit log
  const exportAuditLog = () => {
    // In a real app, this would generate a CSV or PDF
    toast.success(t('auditLog.exported'));
  };
  
  // Refresh data
  const refreshData = () => {
    setIsLoading(true);
    // In a real app, this would refetch from the API
    setTimeout(() => {
      setIsLoading(false);
      toast.success(t('auditLog.refreshed'));
    }, 500);
  };
  
  // Get action name
  const getActionName = (action: string) => {
    // In a real app, this would use translation keys
    const parts = action.split('.');
    if (parts.length === 2) {
      return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].replace('_', ' ')}`;
    }
    return action;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="auditLog.title"
        description="auditLog.description"
      />
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>{t('auditLog.filters.title')}</CardTitle>
              <CardDescription>
                {t('auditLog.filters.description')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                {t('auditLog.refresh')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportAuditLog}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                {t('auditLog.export')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('auditLog.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="sm:w-[180px]">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('auditLog.filterByType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLog.allTypes')}</SelectItem>
                    <SelectItem value="user">{t('auditLog.types.user')}</SelectItem>
                    <SelectItem value="invoice">{t('auditLog.types.invoice')}</SelectItem>
                    <SelectItem value="quote">{t('auditLog.types.quote')}</SelectItem>
                    <SelectItem value="client">{t('auditLog.types.client')}</SelectItem>
                    <SelectItem value="product">{t('auditLog.types.product')}</SelectItem>
                    <SelectItem value="payment">{t('auditLog.types.payment')}</SelectItem>
                    <SelectItem value="system">{t('auditLog.types.system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:w-[180px]">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('auditLog.filterBySeverity')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLog.allSeverities')}</SelectItem>
                    <SelectItem value="info">{t('auditLog.severities.info')}</SelectItem>
                    <SelectItem value="warning">{t('auditLog.severities.warning')}</SelectItem>
                    <SelectItem value="critical">{t('auditLog.severities.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                {t('auditLog.resetFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('auditLog.columns.timestamp')}</TableHead>
                <TableHead>{t('auditLog.columns.action')}</TableHead>
                <TableHead>{t('auditLog.columns.user')}</TableHead>
                <TableHead>{t('auditLog.columns.details')}</TableHead>
                <TableHead>{t('auditLog.columns.severity')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center">
                      <RefreshCwIcon className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {t('auditLog.loading')}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t('auditLog.noResults')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionTypeIcon(log.type)}
                        <span className="font-medium">{getActionName(log.action)}</span>
                      </div>
                      {log.entityName && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {log.entityName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {t(`users.roles.${log.userRole}`)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{log.details}</div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => {
                            // In a real app, this would open a modal with metadata details
                            toast.info(t('auditLog.metadataInfo'));
                          }}
                        >
                          {t('auditLog.showMetadata')}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(log.severity)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog; 