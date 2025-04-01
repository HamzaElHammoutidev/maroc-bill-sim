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
  Eye, 
  Copy, 
  Plus, 
  Download,
  Tag,
  Barcode,
  Package,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  mockProducts, 
  Product, 
  mockProductCategories, 
  ProductCategory,
  getProductCategories,
  getProductCategoryById,
  getProductDiscounts,
  calculateDiscountedPrice,
  getStockLocationById
} from '@/data/mockData';
import { formatCurrency } from '@/utils/format';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';
import ProductDialog from '@/components/products/ProductDialog';
import CategoryDialog from '@/components/products/CategoryDialog';
import DiscountDialog from '@/components/products/DiscountDialog';
import ProductDetailDialog from '@/components/products/ProductDetailDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Products = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const companyId = user?.companyId || '101'; // Default for demo
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showStockInfo, setShowStockInfo] = useState(true);
  
  // Load products and categories
  useEffect(() => {
    // Load all products for the company
    const companyProducts = mockProducts.filter(product => product.companyId === companyId);
    setProducts(companyProducts);
    
    // Load categories
    const companyCategories = getProductCategories(companyId);
    setCategories(companyCategories);
  }, [companyId]);
  
  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);
  
  // Handle product operations
  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setIsEditMode(true);
    } else {
      setSelectedProduct(null);
      setIsEditMode(false);
    }
    setIsProductDialogOpen(true);
  };
  
  const handleOpenDetailDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };
  
  const handleConfirmDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteProduct = () => {
    if (selectedProduct) {
      // In a real app, you would send a request to delete the product
      // For demo purposes, we'll just filter it from our local state
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      toast.success(`${t('products.deleted')} ${selectedProduct.name}`);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleConfirmDuplicateProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDuplicateDialogOpen(true);
  };
  
  const handleDuplicateProduct = () => {
    if (selectedProduct) {
      const newProduct: Product = {
        ...selectedProduct,
        id: `product-${Date.now()}`,
        name: `${selectedProduct.name} (${t('products.copy')})`,
        reference: selectedProduct.reference ? `${selectedProduct.reference}-COPY` : undefined,
        barcode: undefined, // Don't copy barcode as it should be unique
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setProducts([...products, newProduct]);
      toast.success(`${t('products.duplicated')} ${selectedProduct.name}`);
      setIsDuplicateDialogOpen(false);
    }
  };
  
  const handleAddCategory = () => {
    setIsCategoryDialogOpen(true);
  };
  
  const handleExportProducts = () => {
    // Filter products by category if needed
    const productsToExport = filteredProducts;
    
    // Format the data for CSV export
    const csvContent = [
      // CSV Header
      [
        'ID', 
        t('products.name'), 
        t('products.reference'),
        t('products.barcode'),
        t('products.description'), 
        t('products.price'), 
        t('products.vatRate'), 
        t('products.category'),
        t('products.unit'),
        t('products.minQuantity'),
        t('products.type')
      ].join(','),
      // CSV Data rows
      ...productsToExport.map(product => {
        const category = product.category 
          ? getProductCategoryById(product.category)?.name || ''
          : '';
          
        return [
          product.id,
          product.name.replace(/,/g, ' '), // Replace commas to avoid CSV issues
          (product.reference || '').replace(/,/g, ' '),
          product.barcode || '',
          (product.description || '').replace(/,/g, ' '),
          product.price,
          `${product.vatRate}%`,
          category.replace(/,/g, ' '),
          product.unit,
          product.minQuantity || 1,
          product.isService ? t('products.service') : t('products.product')
        ].join(',');
      })
    ].join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(t('products.export.success'));
  };

  // Define the columns for the data table
  const columns: Column<Product>[] = [
    {
      header: t('products.name'),
      accessorKey: 'name',
      enableSorting: true,
      cell: (product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          {product.reference && (
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <Tag className="w-3 h-3 mr-1" />
              {product.reference}
            </div>
          )}
          {product.barcode && (
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <Barcode className="w-3 h-3 mr-1" />
              {product.barcode}
            </div>
          )}
        </div>
      )
    },
    {
      header: t('products.category'),
      accessorKey: 'category',
      enableSorting: true,
      cell: (product) => {
        const category = product.category 
          ? getProductCategoryById(product.category)
          : null;
          
        return category ? (
          <Badge variant="outline">{category.name}</Badge>
        ) : (
          '-'
        );
      }
    },
    {
      header: t('products.unit'),
      accessorKey: 'unit',
      enableSorting: true,
      cell: (product) => (
        <div className="flex items-center">
          <Package className="w-3 h-3 mr-1" />
          {product.unit} 
          {product.minQuantity && product.minQuantity > 1 && (
            <span className="text-xs text-muted-foreground ml-1">
              (min: {product.minQuantity})
            </span>
          )}
        </div>
      )
    },
    {
      header: t('products.price'),
      accessorKey: 'price',
      enableSorting: true,
      cell: (product) => {
        const discounts = getProductDiscounts(product.id);
        return (
          <div>
            <div>{formatCurrency(product.price)}</div>
            {discounts.length > 0 && (
              <div className="text-xs text-green-600 flex items-center mt-1">
                <Percent className="w-3 h-3 mr-1" />
                {discounts.length > 1 
                  ? `${discounts.length} ${t('products.discount_available')}` 
                  : t('products.discount_available')}
              </div>
            )}
          </div>
        );
      }
    },
    // Add stock column if showing stock info
    ...(showStockInfo ? [
      {
        header: t('stock.stock_level'),
        accessorKey: 'currentStock',
        enableSorting: true,
        cell: (product) => {
          if (product.isService) {
            return <span className="text-muted-foreground italic text-xs">-</span>;
          }
          
          if (!product.manageStock) {
            return <span className="text-muted-foreground italic text-xs">{t('stock.not_managed')}</span>;
          }
          
          const locationName = product.locationId 
            ? getStockLocationById(product.locationId)?.name 
            : null;
            
          let stockClass = '';
          if (product.currentStock <= 0) {
            stockClass = 'text-destructive font-semibold';
          } else if (product.alertStock && product.currentStock <= product.alertStock) {
            stockClass = 'text-amber-500 font-semibold';
          } else if (product.minStock && product.currentStock <= product.minStock) {
            stockClass = 'text-orange-500 font-semibold';
          }
          
          return (
            <div>
              <div className={stockClass}>
                {product.currentStock} {product.unit}
              </div>
              {locationName && (
                <div className="text-xs text-muted-foreground mt-1">
                  {locationName}
                </div>
              )}
            </div>
          );
        }
      }
    ] : []),
    {
      header: t('products.vatRate'),
      accessorKey: 'vatRate',
      enableSorting: true,
      cell: (product) => `${product.vatRate}%`
    },
    {
      header: t('products.priceTTC'),
      accessorKey: 'priceTTC',
      enableSorting: true,
      cell: (product) => {
        const priceTTC = product.price * (1 + (product.vatRate / 100));
        return formatCurrency(priceTTC);
      }
    },
    {
      header: t('products.type'),
      accessorKey: 'isService',
      enableSorting: true,
      cell: (product) => (
        <Badge className={product.isService ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
          {product.isService ? t('products.service') : t('products.product')}
        </Badge>
      )
    },
    {
      header: t('products.actions'),
      accessorKey: 'id',
      cell: (product) => {
        const actions: ActionItem[] = [
          {
            label: t('form.view'),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleOpenDetailDialog(product)
          },
          {
            label: t('form.edit'),
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleOpenProductDialog(product)
          },
          {
            label: t('form.duplicate'),
            icon: <Copy className="h-4 w-4" />,
            onClick: () => handleConfirmDuplicateProduct(product)
          },
          {
            label: t('form.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => handleConfirmDeleteProduct(product),
            className: 'text-destructive'
          }
        ];
        
        return <TableActions actions={actions} label={t('common.actions')} />;
      },
      className: 'text-center',
      cellClassName: 'text-center'
    }
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title={t('products.title')}
        description={t('products.description')}
        action={{
          label: t('products.add'),
          onClick: () => handleOpenProductDialog()
        }}
      />
      
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex space-x-2">
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">{t('products.all_categories')}</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="icon" onClick={handleAddCategory} title={t('products.add_category')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowStockInfo(!showStockInfo)}
            className="flex items-center"
          >
            <Package className="mr-2 h-4 w-4" />
            {showStockInfo ? t('stock.hide_stock') : t('stock.show_stock')}
          </Button>
          
          <Button variant="outline" onClick={handleExportProducts}>
            <Download className="mr-2 h-4 w-4" />
            {t('products.export.button')}
          </Button>
        </div>
      </div>
      
      <DataTable
        data={filteredProducts}
        columns={columns}
        searchPlaceholder={t('products.search')}
        searchKey="name"
        noResultsMessage={t('products.no_results')}
        noDataMessage={t('products.no_products')}
        initialSortField="name"
        initialSortDirection="asc"
        cardClassName="shadow-sm"
      />
      
      {/* Product Dialog */}
      {isProductDialogOpen && (
        <ProductDialog
          open={isProductDialogOpen}
          onOpenChange={setIsProductDialogOpen}
          product={selectedProduct}
          categories={categories}
          isEdit={isEditMode}
          onSave={(product) => {
            if (isEditMode) {
              // Update existing product
              setProducts(products.map(p => p.id === product.id ? product : p));
              toast.success(`${t('products.updated')} ${product.name}`);
            } else {
              // Add new product
              setProducts([...products, product]);
              toast.success(`${t('products.created')} ${product.name}`);
            }
            setIsProductDialogOpen(false);
          }}
        />
      )}
      
      {/* Category Dialog */}
      {isCategoryDialogOpen && (
        <CategoryDialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
          onSave={(category) => {
            // Add new category to the list
            setCategories([...categories, category]);
            toast.success(`${t('products.category.created')} ${category.name}`);
            setIsCategoryDialogOpen(false);
          }}
        />
      )}
      
      {/* Product Detail Dialog */}
      {isDetailDialogOpen && selectedProduct && (
        <ProductDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          product={selectedProduct}
          onEdit={() => {
            setIsDetailDialogOpen(false);
            handleOpenProductDialog(selectedProduct);
          }}
          onAddDiscount={() => {
            setIsDetailDialogOpen(false);
            setIsDiscountDialogOpen(true);
          }}
        />
      )}
      
      {/* Discount Dialog */}
      {isDiscountDialogOpen && selectedProduct && (
        <DiscountDialog
          open={isDiscountDialogOpen}
          onOpenChange={setIsDiscountDialogOpen}
          product={selectedProduct}
          onSave={(discount) => {
            // In a real app, we would add this discount to the backend
            toast.success(`${t('products.discount.created')} ${discount.name}`);
            setIsDiscountDialogOpen(false);
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.delete_confirmation_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {`${t('products.delete_confirmation_description')} ${selectedProduct?.name || ''}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('form.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Duplicate Confirmation Dialog */}
      <AlertDialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.duplicate_confirmation_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {`${t('products.duplicate_confirmation_description')} ${selectedProduct?.name || ''}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateProduct}>
              {t('form.duplicate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
