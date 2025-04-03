import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Inventory as InventoryType, 
  getInventories, 
  getInventoryItems,
  getStockLocationById,
  getProductById
} from '@/data/mockData';
import { formatDate } from '@/utils/format';
import PageHeader from '@/components/PageHeader';
import { Clipboard, ClipboardCheck, Plus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import InventoryForm from '@/components/InventoryForm';
import InventoryHelp from '@/components/InventoryHelp';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Component to view inventory details
const InventoryViewDialog = ({ 
  inventory, 
  open, 
  onOpenChange 
}: { 
  inventory: InventoryType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  useEffect(() => {
    if (inventory) {
      setInventoryItems(getInventoryItems(inventory.id));
    }
  }, [inventory]);
  
  if (!inventory) return null;
  
  const location = getStockLocationById(inventory.locationId);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('stock.viewing_inventory')} {inventory.name}</DialogTitle>
          <DialogDescription>{t('stock.inventory_description')}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Inventory info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/10">
            <div>
              <p className="text-sm text-muted-foreground">{t('stock.location')}</p>
              <p className="font-medium">{location?.name || inventory.locationId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.status')}</p>
              <p className="font-medium">
                <Badge variant={
                  inventory.status === 'completed' ? 'default' :
                  inventory.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                  {t(`stock.status_${inventory.status}`)}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.date')}</p>
              <p className="font-medium">{formatDate(inventory.date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.created_by')}</p>
              <p className="font-medium">{inventory.createdBy}</p>
            </div>
            {inventory.notes && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">{t('stock.notes')}</p>
                <p className="font-medium">{inventory.notes}</p>
              </div>
            )}
          </div>
          
          {/* Inventory items */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('products.product')}</TableHead>
                  <TableHead className="text-right">{t('stock.expected')}</TableHead>
                  <TableHead className="text-right">{t('stock.actual')}</TableHead>
                  <TableHead className="text-right">{t('stock.difference')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map(item => {
                  const product = getProductById(item.productId);
                  const difference = item.actualQuantity - item.expectedQuantity;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{product?.name || item.productId}</TableCell>
                      <TableCell className="text-right">{item.expectedQuantity}</TableCell>
                      <TableCell className="text-right">{item.actualQuantity}</TableCell>
                      <TableCell className="text-right">
                        <span className={
                          difference > 0 
                            ? 'text-green-600' 
                            : difference < 0 
                              ? 'text-red-600' 
                              : ''
                        }>
                          {difference > 0 ? '+' : ''}{difference}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Adjustment summary */}
          {inventory.status === 'completed' && (
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">{t('stock.adjustment_summary')}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>{t('stock.total_items')}:</span>
                  <span>{inventoryItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('stock.items_with_differences')}:</span>
                  <span>{inventoryItems.filter(i => i.actualQuantity !== i.expectedQuantity).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('stock.positive_adjustments')}:</span>
                  <span className="text-green-600">
                    +{inventoryItems.reduce((sum, item) => {
                      const diff = item.actualQuantity - item.expectedQuantity;
                      return sum + (diff > 0 ? diff : 0);
                    }, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('stock.negative_adjustments')}:</span>
                  <span className="text-red-600">
                    {inventoryItems.reduce((sum, item) => {
                      const diff = item.actualQuantity - item.expectedQuantity;
                      return sum + (diff < 0 ? diff : 0);
                    }, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Inventory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [inventories, setInventories] = useState<InventoryType[]>([]);
  const [isNewInventoryOpen, setIsNewInventoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedInventory, setSelectedInventory] = useState<InventoryType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
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
            setSelectedInventory(inventory);
            setIsViewDialogOpen(true);
          }}
        >
          {t('common.view')}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <PageHeader 
          title={t('stock.inventory')}
          description={t('stock.inventory_description')}
          action={{
            label: t('stock.new_inventory'),
            onClick: () => setIsNewInventoryOpen(true)
          }}
          icon={<Clipboard className="h-5 w-5" />}
        />
        <InventoryHelp />
      </div>
      
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
      
      {/* View inventory dialog */}
      <InventoryViewDialog
        inventory={selectedInventory}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  );
};

export default Inventory; 