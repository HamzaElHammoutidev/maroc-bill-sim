import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  Plus, 
  Edit, 
  Trash, 
  FileText, 
  Calculator,
  Calendar,
  Check,
  X,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/format';
import { 
  Tax, 
  TaxRule, 
  TaxReport, 
  getTaxes, 
  getTaxRules, 
  getTaxReports, 
  getTaxById,
  calculateVatForPeriod,
  createTaxReport
} from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TaxForm from '@/components/taxes/TaxForm';
import TaxRuleForm from '@/components/taxes/TaxRuleForm';
import TaxReportForm from '@/components/taxes/TaxReportForm';
import TaxReportDetail from '@/components/taxes/TaxReportDetail';

const Taxes = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  // UI state
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedTaxId, setSelectedTaxId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  // Dialog state
  const [isTaxFormOpen, setIsTaxFormOpen] = useState(false);
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);
  
  // Data state
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  
  // Load data
  useEffect(() => {
    loadData();
  }, [companyId]);
  
  const loadData = () => {
    setTaxes(getTaxes(companyId));
    setTaxRules(getTaxRules(companyId));
    setTaxReports(getTaxReports(companyId));
  };
  
  // Tax catalog columns
  const taxColumns: Column<Tax>[] = [
    {
      header: t('taxes.name'),
      accessorKey: 'name',
      enableSorting: true,
      cell: (tax) => (
        <div>
          <div className="font-medium">{tax.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{tax.code}</div>
        </div>
      )
    },
    {
      header: t('taxes.type'),
      accessorKey: 'type',
      enableSorting: true,
      cell: (tax) => (
        <Badge variant="outline">
          {tax.type === 'vat' ? t('taxes.type_vat') :
           tax.type === 'service' ? t('taxes.type_service') :
           tax.type === 'stamp' ? t('taxes.type_stamp') : 
           t('taxes.type_other')}
        </Badge>
      )
    },
    {
      header: t('taxes.rate'),
      accessorKey: 'rate',
      enableSorting: true,
      cell: (tax) => (
        <div className="font-medium">{tax.rate}%</div>
      )
    },
    {
      header: t('taxes.applies_to'),
      accessorKey: 'appliesTo',
      enableSorting: true,
      cell: (tax) => (
        tax.appliesTo === 'all' ? t('taxes.applies_all') :
        tax.appliesTo === 'products' ? t('taxes.applies_products') :
        tax.appliesTo === 'services' ? t('taxes.applies_services') : '-'
      )
    },
    {
      header: t('taxes.status'),
      accessorKey: 'isActive',
      enableSorting: true,
      cell: (tax) => (
        <Badge variant={tax.isActive ? "default" : "destructive"}>
          {tax.isActive ? t('common.active') : t('common.inactive')}
        </Badge>
      )
    },
    {
      header: t('common.actions'),
      accessorKey: 'id',
      cell: (tax) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedTaxId(tax.id);
              setIsTaxFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // In a real app, confirm and delete
              toast.error("Deletion not implemented in demo");
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];
  
  // Tax rules columns
  const ruleColumns: Column<TaxRule>[] = [
    {
      header: t('taxes.rule_name'),
      accessorKey: 'name',
      enableSorting: true,
      cell: (rule) => (
        <div>
          <div className="font-medium">{rule.name}</div>
          {rule.description && (
            <div className="text-xs text-muted-foreground mt-1">{rule.description}</div>
          )}
        </div>
      )
    },
    {
      header: t('taxes.taxes'),
      accessorKey: 'taxIds',
      enableSorting: false,
      cell: (rule) => (
        <div className="flex flex-wrap gap-1">
          {rule.taxIds.map(taxId => {
            const tax = getTaxById(taxId);
            return tax ? (
              <Badge key={taxId} variant="outline">
                {tax.name} ({tax.rate}%)
              </Badge>
            ) : null;
          })}
        </div>
      )
    },
    {
      header: t('taxes.priority'),
      accessorKey: 'priority',
      enableSorting: true,
      cell: (rule) => rule.priority
    },
    {
      header: t('taxes.status'),
      accessorKey: 'isActive',
      enableSorting: true,
      cell: (rule) => (
        <Badge variant={rule.isActive ? "default" : "destructive"}>
          {rule.isActive ? t('common.active') : t('common.inactive')}
        </Badge>
      )
    },
    {
      header: t('common.actions'),
      accessorKey: 'id',
      cell: (rule) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedRuleId(rule.id);
              setIsRuleFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // In a real app, confirm and delete
              toast.error("Deletion not implemented in demo");
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];
  
  // Tax reports columns
  const reportColumns: Column<TaxReport>[] = [
    {
      header: t('taxes.report_name'),
      accessorKey: 'name',
      enableSorting: true,
      cell: (report) => (
        <div>
          <div className="font-medium">{report.name}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(report.createdAt)}
          </div>
        </div>
      )
    },
    {
      header: t('taxes.period'),
      accessorKey: 'startDate',
      enableSorting: true,
      cell: (report) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatDate(report.startDate)}</span>
          <span>-</span>
          <span>{formatDate(report.endDate)}</span>
        </div>
      )
    },
    {
      header: t('taxes.total_vat'),
      accessorKey: 'totalVat',
      enableSorting: true,
      cell: (report) => (
        <div className="font-medium">
          {new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            maximumFractionDigits: 2,
          }).format(report.totalVat)}
        </div>
      )
    },
    {
      header: t('taxes.status'),
      accessorKey: 'status',
      enableSorting: true,
      cell: (report) => {
        let content = null;
        switch (report.status) {
          case 'draft':
            content = <Badge variant="outline">{t('taxes.status_draft')}</Badge>;
            break;
          case 'generated':
            content = <Badge variant="secondary">{t('taxes.status_generated')}</Badge>;
            break;
          case 'submitted':
            content = <Badge variant="default">{t('taxes.status_submitted')}</Badge>;
            break;
        }
        return content;
      }
    },
    {
      header: t('common.actions'),
      accessorKey: 'id',
      cell: (report) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedReportId(report.id);
              setIsReportDetailOpen(true);
            }}
          >
            {t('common.view')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // In a real app, download report
              toast.success(t('taxes.download_success'));
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];
  
  // Form handlers
  const handleTaxFormClose = (refreshData: boolean = false) => {
    setIsTaxFormOpen(false);
    setSelectedTaxId(null);
    if (refreshData) {
      loadData();
    }
  };
  
  const handleRuleFormClose = (refreshData: boolean = false) => {
    setIsRuleFormOpen(false);
    setSelectedRuleId(null);
    if (refreshData) {
      loadData();
    }
  };
  
  const handleReportFormClose = (refreshData: boolean = false) => {
    setIsReportFormOpen(false);
    if (refreshData) {
      loadData();
    }
  };
  
  const handleReportDetailClose = () => {
    setIsReportDetailOpen(false);
    setSelectedReportId(null);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title={t('taxes.title')}
        description={t('taxes.description')}
        icon={<Receipt className="h-5 w-5" />}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="catalog">{t('taxes.catalog')}</TabsTrigger>
          <TabsTrigger value="rules">{t('taxes.rules')}</TabsTrigger>
          <TabsTrigger value="reports">{t('taxes.reports')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="catalog" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button 
              size="sm"
              onClick={() => {
                setSelectedTaxId(null);
                setIsTaxFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('taxes.add_tax')}
            </Button>
          </div>
          
          <DataTable
            data={taxes}
            columns={taxColumns}
            searchPlaceholder={t('taxes.search_taxes')}
            searchKey="name"
            noResultsMessage={t('taxes.no_taxes_found')}
            noDataMessage={t('taxes.no_taxes')}
            initialSortField="name"
            initialSortDirection="asc"
            cardClassName="shadow-sm"
          />
          
          <Sheet open={isTaxFormOpen} onOpenChange={setIsTaxFormOpen}>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>
                  {selectedTaxId ? t('taxes.edit_tax') : t('taxes.add_tax')}
                </SheetTitle>
                <SheetDescription>
                  {t('taxes.tax_form_description')}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <TaxForm 
                  companyId={companyId}
                  taxId={selectedTaxId}
                  onClose={handleTaxFormClose}
                />
              </div>
            </SheetContent>
          </Sheet>
        </TabsContent>
        
        <TabsContent value="rules" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button 
              size="sm"
              onClick={() => {
                setSelectedRuleId(null);
                setIsRuleFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('taxes.add_rule')}
            </Button>
          </div>
          
          <DataTable
            data={taxRules}
            columns={ruleColumns}
            searchPlaceholder={t('taxes.search_rules')}
            searchKey="name"
            noResultsMessage={t('taxes.no_rules_found')}
            noDataMessage={t('taxes.no_rules')}
            initialSortField="priority"
            initialSortDirection="desc"
            cardClassName="shadow-sm"
          />
          
          <Sheet open={isRuleFormOpen} onOpenChange={setIsRuleFormOpen}>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>
                  {selectedRuleId ? t('taxes.edit_rule') : t('taxes.add_rule')}
                </SheetTitle>
                <SheetDescription>
                  {t('taxes.rule_form_description')}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <TaxRuleForm 
                  companyId={companyId}
                  ruleId={selectedRuleId}
                  onClose={handleRuleFormClose}
                />
              </div>
            </SheetContent>
          </Sheet>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button 
              size="sm"
              onClick={() => setIsReportFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('taxes.generate_report')}
            </Button>
          </div>
          
          <DataTable
            data={taxReports}
            columns={reportColumns}
            searchPlaceholder={t('taxes.search_reports')}
            searchKey="name"
            noResultsMessage={t('taxes.no_reports_found')}
            noDataMessage={t('taxes.no_reports')}
            initialSortField="createdAt"
            initialSortDirection="desc"
            cardClassName="shadow-sm"
          />
          
          <Sheet open={isReportFormOpen} onOpenChange={setIsReportFormOpen}>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>
                  {t('taxes.generate_report')}
                </SheetTitle>
                <SheetDescription>
                  {t('taxes.report_form_description')}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <TaxReportForm 
                  companyId={companyId}
                  onClose={handleReportFormClose}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <Dialog open={isReportDetailOpen} onOpenChange={setIsReportDetailOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {t('taxes.report_detail')}
                </DialogTitle>
                <DialogDescription>
                  {t('taxes.report_detail_description')}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {selectedReportId && (
                  <TaxReportDetail 
                    reportId={selectedReportId}
                    onClose={handleReportDetailClose}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Taxes; 