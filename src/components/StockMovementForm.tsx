import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { 
  createStockMovement, 
  getProductById,
  getStockLocations, 
  getDefaultStockLocation,
  Product,
  StockLocation,
  StockMovementType,
  mockProducts
} from '@/data/mockData';

// Define schema for stock movement
const stockMovementSchema = z.object({
  productId: z.string().min(1, { message: 'Product is required' }),
  type: z.enum(['purchase', 'sale', 'return_customer', 'return_supplier', 'adjustment', 'transfer', 'inventory']),
  quantity: z.coerce.number().int().min(0.01),
  locationId: z.string().min(1, { message: 'Location is required' }),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

interface StockMovementFormProps {
  companyId: string;
  productId?: string;
  initialType?: StockMovementType;
  onComplete?: () => void;
}

export default function StockMovementForm({ 
  companyId, 
  productId, 
  initialType = 'purchase',
  onComplete 
}: StockMovementFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Setup form
  const form = useForm<z.infer<typeof stockMovementSchema>>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      productId: productId || '',
      type: initialType,
      quantity: 1,
      locationId: '',
      reason: '',
      reference: '',
    },
  });
  
  // Load locations and default location
  useEffect(() => {
    const stockLocations = getStockLocations(companyId);
    setLocations(stockLocations);
    
    // Set default location if available
    const defaultLocation = getDefaultStockLocation(companyId);
    if (defaultLocation) {
      form.setValue('locationId', defaultLocation.id);
    } else if (stockLocations.length > 0) {
      form.setValue('locationId', stockLocations[0].id);
    }
  }, [companyId, form]);
  
  // Get product details when product changes
  useEffect(() => {
    const watchedProductId = form.watch('productId');
    if (watchedProductId) {
      const product = getProductById(watchedProductId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [form.watch('productId')]);
  
  // Load available products that have stock management enabled
  useEffect(() => {
    // Get products that have stock management enabled
    const stockManagedProducts = mockProducts.filter(p => 
      p.companyId === companyId && 
      p.manageStock && 
      !p.isService
    );
    
    setProducts(stockManagedProducts);
    
    // Set initial product if provided
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [companyId, productId]);
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof stockMovementSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Determine quantity sign based on movement type
      let quantity = values.quantity;
      if (['sale', 'return_supplier'].includes(values.type)) {
        quantity = -quantity; // negative for outbound movements
      }
      
      // Create stock movement
      const result = createStockMovement(
        companyId,
        values.productId,
        values.type as StockMovementType,
        quantity,
        values.locationId,
        values.reason || undefined,
        values.reference || undefined
      );
      
      if ('error' in result) {
        toast({
          title: t('common.error'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      
      // Show success message
      toast({
        title: t('stock.movement_created'),
        description: t('stock.stock_updated'),
      });
      
      // Reset form
      form.reset({
        productId: '',
        type: initialType,
        quantity: 1,
        locationId: values.locationId, // Keep the same location
        reason: '',
        reference: '',
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper to get movement type label
  const getMovementTypeLabel = (type: string) => {
    return t(`stock.movement_types.${type}`);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('products.product')}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!!productId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.select_product')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedProduct && (
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span>{t('stock.current_stock')}:</span>
              <span className="font-medium">
                {selectedProduct.currentStock} {selectedProduct.unit}
              </span>
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stock.movement_type')}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!!initialType}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('stock.select_movement_type')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="purchase">{getMovementTypeLabel('purchase')}</SelectItem>
                  <SelectItem value="sale">{getMovementTypeLabel('sale')}</SelectItem>
                  <SelectItem value="return_customer">{getMovementTypeLabel('return_customer')}</SelectItem>
                  <SelectItem value="return_supplier">{getMovementTypeLabel('return_supplier')}</SelectItem>
                  <SelectItem value="adjustment">{getMovementTypeLabel('adjustment')}</SelectItem>
                  <SelectItem value="transfer">{getMovementTypeLabel('transfer')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stock.quantity')}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stock.location')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('stock.select_location')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stock.reason')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stock.reference')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.processing') : t('stock.update_stock')}
        </Button>
      </form>
    </Form>
  );
} 