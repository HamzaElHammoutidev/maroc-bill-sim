import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { 
  ShoppingBag, 
  Edit, 
  Trash, 
  Plus, 
  Download,
  RefreshCcw,
  Package,
  ArrowUp,
  ArrowDown,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Product,
  StockMovement,
  StockLocation,
  mockProducts,
  mockStockMovements,
  getStockLocations,
  getProductById,
  getStockLocationById
} from '@/data/mockData';
import { formatCurrency, formatDate } from '@/utils/format';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import StockMovementForm from '@/components/StockMovementForm';

const Stock = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('products');
  const [filterStatus, setFilterStatus] = useState<string>('low');
  
  // Movement form state
  const [isMovementFormOpen, setIsMovementFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);
  const [movementType, setMovementType] = useState<'purchase' | 'sale' | 'adjustment' | 'transfer'>('purchase');
  
  // Load data
  useEffect(() => {
    // Load products that have stock management enabled
    const allProducts = mockProducts.filter(p => p.companyId === companyId && !p.isService && p.manageStock);
    setProducts(allProducts);
    
    // Load stock movements
    const movements = mockStockMovements.filter(m => m.companyId === companyId);
    setStockMovements(movements);
    
    // Load locations
    const locs = getStockLocations(companyId);
    setLocations(locs);
    
    // Set default location if available
    if (locs.length > 0) {
      const defaultLoc = locs.find(loc => loc.isDefault);
      setSelectedLocation(defaultLoc ? defaultLoc.id : 'all');
    }
  }, [companyId]);
  
  // Refresh data after movement
  const refreshData = () => {
    // In a real app, you would fetch updated data from the API
    // Here, we'll just close the form and refresh the movements
    setIsMovementFormOpen(false);
    
    // Refresh stock movements
    const updatedMovements = mockStockMovements.filter(m => m.companyId === companyId);
    setStockMovements(updatedMovements);
    
    // Refresh products to show updated stock levels
    const updatedProducts = mockProducts.filter(p => p.companyId === companyId && !p.isService && p.manageStock);
    setProducts(updatedProducts);
  };
  
  // Open movement form for a specific action
  const openMovementForm = (productId: string, type: 'purchase' | 'sale' | 'adjustment' | 'transfer') => {
    setSelectedProduct(productId);
    setMovementType(type);
    setIsMovementFormOpen(true);
  };
  
  // Filter products by location and stock status
  const filteredProducts = products.filter(product => {
    // Filter by location if not "all"
    if (selectedLocation !== 'all' && product.locationId !== selectedLocation) {
      return false;
    }
    
    // Filter by stock status
    if (filterStatus === 'low') {
      return (
        product.alertStock !== undefined && 
        product.currentStock !== undefined && 
        product.currentStock <= product.alertStock
      );
    } else if (filterStatus === 'out') {
      return product.currentStock !== undefined && product.currentStock <= 0;
    }
    
    return true; // "all" status
  });
  
  // Filter movements by location
  const filteredMovements = stockMovements.filter(movement => {
    return selectedLocation === 'all' || movement.locationId === selectedLocation;
  });
  
  // Product table columns
  const productColumns: Column<Product>[] = [
    {
      header: t('products.name'),
      accessorKey: 'name',
      enableSorting: true,
      cell: (product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          {product.reference && (
            <div className="text-xs text-muted-foreground mt-1">
              {product.reference}
            </div>
          )}
        </div>
      )
    },
    {
      header: t('stock.location'),
      accessorKey: 'locationId',
      enableSorting: true,
      cell: (product) => {
        const location = product.locationId 
          ? getStockLocationById(product.locationId)
          : null;
          
        return location ? (
          <Badge variant="outline">{location.name}</Badge>
        ) : (
          '-'
        );
      }
    },
    {
      header: t('products.unit'),
      accessorKey: 'unit',
      enableSorting: true,
      cell: (product) => product.unit
    },
    {
      header: t('stock.current_stock'),
      accessorKey: 'currentStock',
      enableSorting: true,
      cell: (product) => {
        let stockClass = '';
        if (product.currentStock <= 0) {
          stockClass = 'text-destructive font-semibold';
        } else if (product.alertStock && product.currentStock <= product.alertStock) {
          stockClass = 'text-amber-500 font-semibold';
        } else if (product.minStock && product.currentStock <= product.minStock) {
          stockClass = 'text-orange-500 font-semibold';
        }
        
        return (
          <div className={stockClass}>
            {product.currentStock} {product.unit}
          </div>
        );
      }
    },
    {
      header: t('stock.min_stock'),
      accessorKey: 'minStock',
      enableSorting: true,
      cell: (product) => (product.minStock ? `${product.minStock} ${product.unit}` : '-')
    },
    {
      header: t('stock.alert_stock'),
      accessorKey: 'alertStock',
      enableSorting: true,
      cell: (product) => (product.alertStock ? `${product.alertStock} ${product.unit}` : '-')
    },
    {
      header: t('products.actions'),
      accessorKey: 'id',
      cell: (product) => {
        const actions: ActionItem[] = [
          {
            label: t('stock.adjust'),
            icon: <History className="h-4 w-4" />,
            onClick: () => {
              openMovementForm(product.id, 'adjustment');
            }
          },
          {
            label: t('stock.add'),
            icon: <ArrowUp className="h-4 w-4" />,
            onClick: () => {
              openMovementForm(product.id, 'purchase');
            }
          },
          {
            label: t('stock.remove'),
            icon: <ArrowDown className="h-4 w-4" />,
            onClick: () => {
              openMovementForm(product.id, 'sale');
            }
          },
          {
            label: t('stock.transfer'),
            icon: <Package className="h-4 w-4" />,
            onClick: () => {
              openMovementForm(product.id, 'transfer');
            }
          }
        ];
        
        return <TableActions actions={actions} label={t('common.actions')} />;
      }
    }
  ];
  
  // Movement table columns
  const movementColumns: Column<StockMovement>[] = [
    {
      header: t('stock.date'),
      accessorKey: 'date',
      enableSorting: true,
      cell: (movement) => formatDate(movement.date)
    },
    {
      header: t('products.name'),
      accessorKey: 'productId',
      enableSorting: true,
      cell: (movement) => {
        const product = getProductById(movement.productId);
        return product ? (
          <div className="font-medium">{product.name}</div>
        ) : movement.productId;
      }
    },
    {
      header: t('stock.movement_type'),
      accessorKey: 'type',
      enableSorting: true,
      cell: (movement) => {
        let icon = null;
        let className = '';
        
        switch (movement.type) {
          case 'purchase':
            icon = <ArrowUp className="h-4 w-4 mr-1 text-green-600" />;
            className = 'text-green-600';
            break;
          case 'sale':
            icon = <ArrowDown className="h-4 w-4 mr-1 text-red-600" />;
            className = 'text-red-600';
            break;
          case 'return_customer':
          case 'return_supplier':
            icon = <ArrowUp className="h-4 w-4 mr-1 text-amber-600" />;
            className = 'text-amber-600';
            break;
          case 'adjustment':
            icon = <History className="h-4 w-4 mr-1 text-blue-600" />;
            className = 'text-blue-600';
            break;
          case 'transfer':
            icon = <Package className="h-4 w-4 mr-1 text-purple-600" />;
            className = 'text-purple-600';
            break;
          default:
            icon = <Package className="h-4 w-4 mr-1" />;
        }
        
        return (
          <div className={`flex items-center ${className}`}>
            {icon}
            {t(`stock.movement_types.${movement.type}`)}
          </div>
        );
      }
    },
    {
      header: t('stock.quantity'),
      accessorKey: 'quantity',
      enableSorting: true,
      cell: (movement) => {
        const product = getProductById(movement.productId);
        const unit = product ? product.unit : '';
        return (
          <div className={movement.quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {movement.quantity > 0 ? '+' : ''}{movement.quantity} {unit}
          </div>
        );
      }
    },
    {
      header: t('stock.previous_stock'),
      accessorKey: 'previousStock',
      enableSorting: true,
      cell: (movement) => {
        const product = getProductById(movement.productId);
        const unit = product ? product.unit : '';
        return `${movement.previousStock} ${unit}`;
      }
    },
    {
      header: t('stock.new_stock'),
      accessorKey: 'newStock',
      enableSorting: true,
      cell: (movement) => {
        const product = getProductById(movement.productId);
        const unit = product ? product.unit : '';
        return `${movement.newStock} ${unit}`;
      }
    },
    {
      header: t('stock.reason'),
      accessorKey: 'reason',
      enableSorting: true,
      cell: (movement) => movement.reason || '-'
    },
    {
      header: t('stock.location'),
      accessorKey: 'locationId',
      enableSorting: true,
      cell: (movement) => {
        const location = getStockLocationById(movement.locationId);
        return location ? location.name : movement.locationId;
      }
    }
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title={t('stock.management')}
        description={t('stock.management_description')}
        action={{
          label: t('stock.inventory'),
          onClick: () => {
            navigate('/inventory');
          }
        }}
      />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('stock.stock_status')}</CardTitle>
          <CardDescription>{t('stock.stock_status_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">
                {products.length}
              </div>
              <div className="text-sm text-blue-600">
                {t('stock.total_products')}
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="text-2xl font-bold text-amber-700">
                {products.filter(p => 
                  p.alertStock !== undefined && 
                  p.currentStock !== undefined && 
                  p.currentStock <= p.alertStock &&
                  p.currentStock > 0
                ).length}
              </div>
              <div className="text-sm text-amber-600">
                {t('stock.low_stock')}
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="text-2xl font-bold text-red-700">
                {products.filter(p => 
                  p.currentStock !== undefined && 
                  p.currentStock <= 0
                ).length}
              </div>
              <div className="text-sm text-red-600">
                {t('stock.out_of_stock')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tab selection */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <Tabs defaultValue="products" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t('stock.products')}
            </TabsTrigger>
            <TabsTrigger value="movements">
              <History className="h-4 w-4 mr-2" />
              {t('stock.movements')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-x-2">
          {activeTab === 'products' && (
            <>
              <Tabs defaultValue={filterStatus} onValueChange={setFilterStatus}>
                <TabsList>
                  <TabsTrigger value="all">{t('stock.all')}</TabsTrigger>
                  <TabsTrigger value="low">{t('stock.low_stock')}</TabsTrigger>
                  <TabsTrigger value="out">{t('stock.out_of_stock')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </>
          )}
          
          <Tabs defaultValue={selectedLocation} onValueChange={setSelectedLocation}>
            <TabsList>
              <TabsTrigger value="all">{t('stock.all_locations')}</TabsTrigger>
              {locations.map(location => (
                <TabsTrigger key={location.id} value={location.id}>
                  {location.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Tables */}
      {activeTab === 'products' ? (
        <DataTable
          data={filteredProducts}
          columns={productColumns}
          searchPlaceholder={t('stock.search_products')}
          searchKey="name"
          noResultsMessage={t('stock.no_products_found')}
          noDataMessage={t('stock.no_products')}
          initialSortField="currentStock"
          initialSortDirection="asc"
          cardClassName="shadow-sm"
        />
      ) : (
        <DataTable
          data={filteredMovements}
          columns={movementColumns}
          searchPlaceholder={t('stock.search_movements')}
          searchKey="id"
          noResultsMessage={t('stock.no_movements_found')}
          noDataMessage={t('stock.no_movements')}
          initialSortField="date"
          initialSortDirection="desc"
          cardClassName="shadow-sm"
        />
      )}
      
      {/* Stock Movement Sheet */}
      <Sheet open={isMovementFormOpen} onOpenChange={setIsMovementFormOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {movementType === 'purchase' && t('stock.add_stock')}
              {movementType === 'sale' && t('stock.remove_stock')}
              {movementType === 'adjustment' && t('stock.adjust_stock')}
              {movementType === 'transfer' && t('stock.transfer_stock')}
            </SheetTitle>
            <SheetDescription>
              {movementType === 'purchase' && t('stock.add_stock_description')}
              {movementType === 'sale' && t('stock.remove_stock_description')}
              {movementType === 'adjustment' && t('stock.adjust_stock_description')}
              {movementType === 'transfer' && t('stock.transfer_stock_description')}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <StockMovementForm 
              companyId={companyId}
              productId={selectedProduct}
              initialType={movementType}
              onComplete={refreshData}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Stock; 