import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  InfoIcon, 
  ShieldIcon, 
  UsersIcon, 
  FileTextIcon, 
  ClipboardIcon, 
  HelpCircleIcon,
  DollarSignIcon,
  PackageIcon,
  BarChartIcon,
  SettingsIcon,
  SlidersIcon,
  AlertCircleIcon
} from 'lucide-react';

// Types for permissions
type AccessLevel = 'none' | 'read' | 'write' | 'manage';

interface ModulePermission {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  accessLevel: AccessLevel;
  features: FeaturePermission[];
}

interface FeaturePermission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresApproval?: boolean;
  criticalAction?: boolean;
}

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, AccessLevel>;
  features: Record<string, boolean>;
}

// Mock data for permissions
const INITIAL_MODULES: ModulePermission[] = [
  {
    id: 'dashboard',
    name: 'permissions.modules.dashboard',
    description: 'permissions.modules.dashboardDesc',
    icon: <BarChartIcon className="h-5 w-5" />,
    accessLevel: 'read',
    features: [
      {
        id: 'dashboard_export',
        name: 'permissions.features.dashboardExport',
        description: 'permissions.features.dashboardExportDesc',
        enabled: true
      }
    ]
  },
  {
    id: 'clients',
    name: 'permissions.modules.clients',
    description: 'permissions.modules.clientsDesc',
    icon: <UsersIcon className="h-5 w-5" />,
    accessLevel: 'write',
    features: [
      {
        id: 'clients_delete',
        name: 'permissions.features.clientsDelete',
        description: 'permissions.features.clientsDeleteDesc',
        enabled: false,
        criticalAction: true,
        requiresApproval: true
      },
      {
        id: 'clients_import',
        name: 'permissions.features.clientsImport',
        description: 'permissions.features.clientsImportDesc',
        enabled: true
      }
    ]
  },
  {
    id: 'invoices',
    name: 'permissions.modules.invoices',
    description: 'permissions.modules.invoicesDesc',
    icon: <FileTextIcon className="h-5 w-5" />,
    accessLevel: 'write',
    features: [
      {
        id: 'invoices_delete',
        name: 'permissions.features.invoicesDelete',
        description: 'permissions.features.invoicesDeleteDesc',
        enabled: false,
        criticalAction: true,
        requiresApproval: true
      },
      {
        id: 'invoices_validate',
        name: 'permissions.features.invoicesValidate',
        description: 'permissions.features.invoicesValidateDesc',
        enabled: true
      },
      {
        id: 'invoices_send',
        name: 'permissions.features.invoicesSend',
        description: 'permissions.features.invoicesSendDesc',
        enabled: true
      }
    ]
  },
  {
    id: 'quotes',
    name: 'permissions.modules.quotes',
    description: 'permissions.modules.quotesDesc',
    icon: <ClipboardIcon className="h-5 w-5" />,
    accessLevel: 'write',
    features: [
      {
        id: 'quotes_delete',
        name: 'permissions.features.quotesDelete',
        description: 'permissions.features.quotesDeleteDesc',
        enabled: false,
        criticalAction: true
      },
      {
        id: 'quotes_approve',
        name: 'permissions.features.quotesApprove',
        description: 'permissions.features.quotesApproveDesc',
        enabled: true,
        requiresApproval: true
      }
    ]
  },
  {
    id: 'products',
    name: 'permissions.modules.products',
    description: 'permissions.modules.productsDesc',
    icon: <PackageIcon className="h-5 w-5" />,
    accessLevel: 'read',
    features: [
      {
        id: 'products_pricing',
        name: 'permissions.features.productsPricing',
        description: 'permissions.features.productsPricingDesc',
        enabled: false,
        criticalAction: true
      }
    ]
  },
  {
    id: 'payments',
    name: 'permissions.modules.payments',
    description: 'permissions.modules.paymentsDesc',
    icon: <DollarSignIcon className="h-5 w-5" />,
    accessLevel: 'read',
    features: [
      {
        id: 'payments_record',
        name: 'permissions.features.paymentsRecord',
        description: 'permissions.features.paymentsRecordDesc',
        enabled: true
      }
    ]
  },
  {
    id: 'reports',
    name: 'permissions.modules.reports',
    description: 'permissions.modules.reportsDesc',
    icon: <BarChartIcon className="h-5 w-5" />,
    accessLevel: 'read',
    features: [
      {
        id: 'reports_export',
        name: 'permissions.features.reportsExport',
        description: 'permissions.features.reportsExportDesc',
        enabled: true
      }
    ]
  },
  {
    id: 'users',
    name: 'permissions.modules.users',
    description: 'permissions.modules.usersDesc',
    icon: <UsersIcon className="h-5 w-5" />,
    accessLevel: 'none',
    features: [
      {
        id: 'users_create',
        name: 'permissions.features.usersCreate',
        description: 'permissions.features.usersCreateDesc',
        enabled: false,
        criticalAction: true
      },
      {
        id: 'users_delete',
        name: 'permissions.features.usersDelete',
        description: 'permissions.features.usersDeleteDesc',
        enabled: false,
        criticalAction: true,
        requiresApproval: true
      }
    ]
  },
  {
    id: 'settings',
    name: 'permissions.modules.settings',
    description: 'permissions.modules.settingsDesc',
    icon: <SettingsIcon className="h-5 w-5" />,
    accessLevel: 'none',
    features: [
      {
        id: 'settings_company',
        name: 'permissions.features.settingsCompany',
        description: 'permissions.features.settingsCompanyDesc',
        enabled: false,
        criticalAction: true
      }
    ]
  }
];

// Role templates
const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'permissions.roles.admin',
    description: 'permissions.roles.adminDesc',
    permissions: {
      dashboard: 'manage',
      clients: 'manage',
      invoices: 'manage',
      quotes: 'manage',
      products: 'manage',
      payments: 'manage',
      reports: 'manage',
      users: 'manage',
      settings: 'manage'
    },
    features: {
      clients_delete: true,
      clients_import: true,
      invoices_delete: true,
      invoices_validate: true,
      invoices_send: true,
      quotes_delete: true,
      quotes_approve: true,
      products_pricing: true,
      payments_record: true,
      reports_export: true,
      users_create: true,
      users_delete: true,
      settings_company: true,
      dashboard_export: true
    }
  },
  {
    id: 'comptable',
    name: 'permissions.roles.comptable',
    description: 'permissions.roles.comptableDesc',
    permissions: {
      dashboard: 'read',
      clients: 'read',
      invoices: 'manage',
      quotes: 'read',
      products: 'read',
      payments: 'manage',
      reports: 'manage',
      users: 'none',
      settings: 'none'
    },
    features: {
      clients_delete: false,
      clients_import: false,
      invoices_delete: true,
      invoices_validate: true,
      invoices_send: true,
      quotes_delete: false,
      quotes_approve: false,
      products_pricing: false,
      payments_record: true,
      reports_export: true,
      users_create: false,
      users_delete: false,
      settings_company: false,
      dashboard_export: true
    }
  },
  {
    id: 'commercial',
    name: 'permissions.roles.commercial',
    description: 'permissions.roles.commercialDesc',
    permissions: {
      dashboard: 'read',
      clients: 'write',
      invoices: 'write',
      quotes: 'manage',
      products: 'read',
      payments: 'read',
      reports: 'read',
      users: 'none',
      settings: 'none'
    },
    features: {
      clients_delete: false,
      clients_import: true,
      invoices_delete: false,
      invoices_validate: false,
      invoices_send: true,
      quotes_delete: true,
      quotes_approve: true,
      products_pricing: false,
      payments_record: false,
      reports_export: true,
      users_create: false,
      users_delete: false,
      settings_company: false,
      dashboard_export: true
    }
  }
];

// Helper functions
const getAccessLevelColor = (level: AccessLevel) => {
  switch (level) {
    case 'none': return 'bg-gray-200 text-gray-600';
    case 'read': return 'bg-blue-100 text-blue-600';
    case 'write': return 'bg-green-100 text-green-600';
    case 'manage': return 'bg-purple-100 text-purple-600';
    default: return 'bg-gray-200 text-gray-600';
  }
};

const Permissions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { companies, currentCompany } = useCompany();
  
  // State
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [modules, setModules] = useState<ModulePermission[]>(INITIAL_MODULES);
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);
  const [changedPermissions, setChangedPermissions] = useState<boolean>(false);
  
  // Handle role selection
  const handleRoleChange = (role: string) => {
    if (changedPermissions) {
      if (!window.confirm(t('permissions.unsavedChanges'))) {
        return;
      }
    }
    
    setSelectedRole(role as UserRole);
    const template = ROLE_TEMPLATES.find(t => t.id === role);
    
    if (template) {
      // Apply template permissions to modules
      const updatedModules = INITIAL_MODULES.map(module => ({
        ...module,
        accessLevel: template.permissions[module.id] || 'none',
        features: module.features.map(feature => ({
          ...feature,
          enabled: template.features[feature.id] || false
        }))
      }));
      
      setModules(updatedModules);
      setChangedPermissions(false);
    }
  };
  
  // Handle module access level change
  const handleAccessLevelChange = (moduleId: string, level: AccessLevel) => {
    setModules(prevModules => 
      prevModules.map(module => 
        module.id === moduleId
          ? { ...module, accessLevel: level }
          : module
      )
    );
    setChangedPermissions(true);
  };
  
  // Handle feature toggle
  const handleFeatureToggle = (moduleId: string, featureId: string, enabled: boolean) => {
    const feature = modules
      .find(m => m.id === moduleId)
      ?.features.find(f => f.id === featureId);
    
    if (feature?.criticalAction && enabled) {
      setShowCriticalWarning(true);
    }
    
    setModules(prevModules => 
      prevModules.map(module => 
        module.id === moduleId
          ? {
              ...module,
              features: module.features.map(feature => 
                feature.id === featureId
                  ? { ...feature, enabled }
                  : feature
              )
            }
          : module
      )
    );
    setChangedPermissions(true);
  };
  
  // Save permissions
  const handleSavePermissions = () => {
    // In a real app, this would call an API to save permissions
    toast.success(t('permissions.saved'));
    setChangedPermissions(false);
  };
  
  // Reset permissions to template
  const handleResetPermissions = () => {
    handleRoleChange(selectedRole);
    toast.info(t('permissions.reset'));
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="permissions.title"
        description="permissions.description"
      />
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="w-full max-w-xs">
          <div className="space-y-1">
            <Label htmlFor="role-select">{t('permissions.selectRole')}</Label>
            <Select 
              value={selectedRole} 
              onValueChange={handleRoleChange}
            >
              <SelectTrigger id="role-select">
                <SelectValue placeholder={t('permissions.selectRolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                <SelectItem value="comptable">{t('users.roles.comptable')}</SelectItem>
                <SelectItem value="commercial">{t('users.roles.commercial')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2 self-end">
          <Button
            variant="outline"
            onClick={handleResetPermissions}
            disabled={!selectedRole || !changedPermissions}
          >
            {t('permissions.reset')}
          </Button>
          <Button
            onClick={handleSavePermissions}
            disabled={!selectedRole || !changedPermissions}
          >
            {t('permissions.save')}
          </Button>
        </div>
      </div>
      
      {selectedRole ? (
        <Tabs defaultValue="modules">
          <TabsList>
            <TabsTrigger value="modules">
              <ShieldIcon className="h-4 w-4 mr-2" />
              {t('permissions.tabs.modules')}
            </TabsTrigger>
            <TabsTrigger value="features">
              <SlidersIcon className="h-4 w-4 mr-2" />
              {t('permissions.tabs.features')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('permissions.moduleAccess.title')}</CardTitle>
                <CardDescription>
                  {t('permissions.moduleAccess.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">{t('permissions.module')}</TableHead>
                      <TableHead className="w-[350px]">{t('permissions.description')}</TableHead>
                      <TableHead>{t('permissions.accessLevel')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {module.icon}
                            {t(module.name)}
                          </div>
                        </TableCell>
                        <TableCell>{t(module.description)}</TableCell>
                        <TableCell>
                          <Select 
                            value={module.accessLevel} 
                            onValueChange={(value) => 
                              handleAccessLevelChange(module.id, value as AccessLevel)
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue>
                                <div className={`px-2 py-1 rounded-md text-xs font-medium inline-block ${getAccessLevelColor(module.accessLevel)}`}>
                                  {t(`permissions.levels.${module.accessLevel}`)}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="px-2 py-1 rounded-md text-xs font-medium inline-block bg-gray-200 text-gray-600">
                                  {t('permissions.levels.none')}
                                </div>
                              </SelectItem>
                              <SelectItem value="read">
                                <div className="px-2 py-1 rounded-md text-xs font-medium inline-block bg-blue-100 text-blue-600">
                                  {t('permissions.levels.read')}
                                </div>
                              </SelectItem>
                              <SelectItem value="write">
                                <div className="px-2 py-1 rounded-md text-xs font-medium inline-block bg-green-100 text-green-600">
                                  {t('permissions.levels.write')}
                                </div>
                              </SelectItem>
                              <SelectItem value="manage">
                                <div className="px-2 py-1 rounded-md text-xs font-medium inline-block bg-purple-100 text-purple-600">
                                  {t('permissions.levels.manage')}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="bg-muted p-4 rounded-md flex items-start gap-3">
              <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">{t('permissions.accessLevelInfo.title')}</h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="px-2 py-1 rounded-md text-xs font-medium inline-block bg-gray-200 text-gray-600 mr-2">{t('permissions.levels.none')}</span> {t('permissions.accessLevelInfo.none')}</li>
                  <li><span className="px-2 py-1 rounded-md text-xs font-medium inline-block bg-blue-100 text-blue-600 mr-2">{t('permissions.levels.read')}</span> {t('permissions.accessLevelInfo.read')}</li>
                  <li><span className="px-2 py-1 rounded-md text-xs font-medium inline-block bg-green-100 text-green-600 mr-2">{t('permissions.levels.write')}</span> {t('permissions.accessLevelInfo.write')}</li>
                  <li><span className="px-2 py-1 rounded-md text-xs font-medium inline-block bg-purple-100 text-purple-600 mr-2">{t('permissions.levels.manage')}</span> {t('permissions.accessLevelInfo.manage')}</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('permissions.featureAccess.title')}</CardTitle>
                <CardDescription>
                  {t('permissions.featureAccess.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {modules.map((module) => (
                    <div key={module.id} className="space-y-4">
                      <div className="flex items-center gap-2">
                        {module.icon}
                        <h3 className="text-lg font-semibold">{t(module.name)}</h3>
                        <div className={`ml-2 px-2 py-1 rounded-md text-xs font-medium inline-block ${getAccessLevelColor(module.accessLevel)}`}>
                          {t(`permissions.levels.${module.accessLevel}`)}
                        </div>
                      </div>
                      
                      {module.features.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[250px]">{t('permissions.feature')}</TableHead>
                              <TableHead className="w-[350px]">{t('permissions.description')}</TableHead>
                              <TableHead className="w-[100px]">{t('permissions.enabled')}</TableHead>
                              <TableHead>{t('permissions.restrictions')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {module.features.map((feature) => (
                              <TableRow key={feature.id}>
                                <TableCell className="font-medium">
                                  {t(feature.name)}
                                </TableCell>
                                <TableCell>
                                  {t(feature.description)}
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    id={feature.id}
                                    checked={feature.enabled}
                                    onCheckedChange={(checked) => 
                                      handleFeatureToggle(module.id, feature.id, checked)
                                    }
                                    disabled={module.accessLevel === 'none'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {feature.criticalAction && (
                                      <div className="px-2 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-red-100 text-red-600">
                                        <AlertCircleIcon className="h-3 w-3" />
                                        {t('permissions.critical')}
                                      </div>
                                    )}
                                    {feature.requiresApproval && (
                                      <div className="px-2 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-yellow-100 text-yellow-600">
                                        <ShieldIcon className="h-3 w-3" />
                                        {t('permissions.requiresApproval')}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-muted-foreground italic text-sm">
                          {t('permissions.noFeatures')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {showCriticalWarning && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start gap-3">
                <AlertCircleIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">{t('permissions.criticalWarning.title')}</h4>
                  <p className="text-amber-700 text-sm">{t('permissions.criticalWarning.description')}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-center mb-2">{t('permissions.noSelection.title')}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t('permissions.noSelection.description')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Permissions; 