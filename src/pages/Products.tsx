
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Edit, Trash, Eye, Copy } from 'lucide-react';
import { mockProducts, Product } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import TableActions, { ActionItem } from '@/components/DataTable/TableActions';

const Products = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAddProduct = () => {
    toast({
      title: t('products.addToast'),
      description: t('products.addToastDesc'),
    });
  };

  const columns: Column<Product>[] = [
    {
      header: t('products.nameColumn'),
      accessorKey: 'name',
      enableSorting: true,
      cellClassName: 'font-medium'
    },
    {
      header: t('products.descriptionColumn'),
      accessorKey: 'description',
      cellClassName: 'max-w-xs truncate'
    },
    {
      header: t('products.priceColumn'),
      accessorKey: 'price',
      enableSorting: true,
      cell: (product) => formatCurrency(product.price)
    },
    {
      header: t('products.vatColumn'),
      accessorKey: 'vatRate',
      enableSorting: true,
      cell: (product) => `${product.vatRate}%`
    },
    {
      header: t('products.typeColumn'),
      accessorKey: 'isService',
      enableSorting: true,
      cell: (product) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          product.isService 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {product.isService ? t('products.service') : t('products.product')}
        </span>
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
            onClick: () => {
              toast({
                title: t('products.viewToast'),
                description: `${t('products.viewToastDesc')} ${product.name}`
              });
            }
          },
          {
            label: t('form.edit'),
            icon: <Edit className="h-4 w-4" />,
            onClick: () => {
              toast({
                title: t('products.editToast'),
                description: `${t('products.editToastDesc')} ${product.name}`
              });
            }
          },
          {
            label: t('form.duplicate'),
            icon: <Copy className="h-4 w-4" />,
            onClick: () => {
              toast({
                title: t('products.duplicateToast'),
                description: `${t('products.duplicateToastDesc')} ${product.name}`
              });
            }
          },
          {
            label: t('form.delete'),
            icon: <Trash className="h-4 w-4" />,
            onClick: () => {
              toast({
                title: t('products.deleteToast'),
                description: `${t('products.deleteToastDesc')} ${product.name}`
              });
            },
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
        title="products.title"
        description="products.description"
        action={{
          label: "products.add",
          onClick: handleAddProduct
        }}
      />
      
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          searchPlaceholder={t('products.search')}
          searchKey="name"
          noResultsMessage={t('products.noResults')}
          noDataMessage={t('products.emptyState')}
          title={t('products.cardTitle')}
          initialSortField="name"
          initialSortDirection="asc"
        />
      )}
    </div>
  );
};

export default Products;
