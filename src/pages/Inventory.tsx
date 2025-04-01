import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Inventory as InventoryType, 
  getInventories, 
  getInventoryItems,
  getStockLocationById
} from '@/data/mockData';
import { formatDate } from '@/utils/format';
import PageHeader from '@/components/PageHeader';
import { Clipboard, ClipboardCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import InventoryForm from '@/components/InventoryForm';

const Inventory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [inventories, setInventories] = useState<InventoryType[]>([]);
  const [isNewInventoryOpen, setIsNewInventoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Load inventories
  useEffect(() => {
    const companyInventories = getInventories(companyId);
    setInventories(companyInventories);
  }, [companyId]);
  
  // Filter inventories by status
  const filteredInventories = inventories.filter(inventory => {
    if (activeTab === 'all') return true;
    return inventory.status === activeTab;
  });
  
  // Inventory table columns
  const inventoryColumns: Column<InventoryType>[] = [
    {
      header: t('stock.name'),
      accessorKey: 'name',
      enableSorting: true,
      cell: (inventory) => (
        <div>
          <div className="font-medium">{inventory.name}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(inventory.createdAt)}
          </div>
        </div>
      )
    },
    {
      header: t('stock.location'),
      accessorKey: 'locationId',
      enableSorting: true,
      cell: (inventory) => {
        const location = getStockLocationById(inventory.locationId);
        return location ? location.name : inventory.locationId;
      }
    },
    {
      header: t('stock.status'),
      accessorKey: 'status',
      enableSorting: true,
      cell: (inventory) => {
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        
        switch (inventory.status) {
          case 'draft':
            variant = "outline";
            break;
          case 'in_progress':
            variant = "secondary";
            break;
          case 'completed':
            variant = "default";
            break;
          case 'cancelled':
            variant = "destructive";
            break;
        }
        
        return (
          <Badge variant={variant}>
            {t(`stock.status_${inventory.status}`)}
          </Badge>
        );
      }
    },
    {
      header: t('stock.items_count'),
      accessorKey: 'id',
      enableSorting: false,
      cell: (inventory) => {
        const items = getInventoryItems(inventory.id);
        return items.length;
      }
    },
    {
      header: t('stock.date_updated'),
      accessorKey: 'updatedAt',
      enableSorting: true,
      cell: (inventory) => formatDate(inventory.updatedAt)
    },
    {
      header: t('common.actions'),
      accessorKey: 'id',
      cell: (inventory) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            // In a real app, navigate to inventory detail view
            // navigate(`/inventory/${inventory.id}`);
            alert(t('stock.viewing_inventory') + " " + inventory.name);
          }}
        >
          {t('common.view')}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title={t('stock.inventory')}
        description={t('stock.inventory_description')}
        action={{
          label: t('stock.new_inventory'),
          onClick: () => setIsNewInventoryOpen(true)
        }}
        icon={<Clipboard className="h-5 w-5" />}
      />
      
      {/* Tab selection */}
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('stock.all')}
            </TabsTrigger>
            <TabsTrigger value="draft">
              {t('stock.status_draft')}
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              {t('stock.status_in_progress')}
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t('stock.status_completed')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Inventory table */}
      <DataTable
        data={filteredInventories}
        columns={inventoryColumns}
        searchPlaceholder={t('stock.search_inventories')}
        searchKey="name"
        noResultsMessage={t('stock.no_inventories_found')}
        noDataMessage={t('stock.no_inventories')}
        initialSortField="updatedAt"
        initialSortDirection="desc"
        cardClassName="shadow-sm"
      />
      
      {/* New inventory sheet */}
      <Sheet open={isNewInventoryOpen} onOpenChange={setIsNewInventoryOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{t('stock.new_inventory')}</SheetTitle>
            <SheetDescription>
              {t('stock.new_inventory_description')}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <InventoryForm />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Inventory; 