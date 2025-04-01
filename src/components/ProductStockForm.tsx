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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
// Instead of using CompanyContext, we'll use mockCompanies directly
// import { useCompany } from '@/contexts/CompanyContext';
import { 
  createStockMovement, 
  getProductById, 
  getStockLocationById,
  Product, 
  StockLocation,
  mockProducts,
  mockCompanies
} from '@/data/mockData';
import { ArrowUp, ArrowDown, Package, Truck, RotateCcw, ShoppingCart, RefreshCcw } from 'lucide-react';

// Define props interface
interface ProductStockFormProps {
  product: Product | null;
  locations: StockLocation[];
  defaultLocationId: string;
  movementType: 'entry' | 'exit' | 'adjustment' | 'transfer';
  onClose: () => void;
}

export default function ProductStockForm({
  product,
  locations,
  defaultLocationId,
  movementType,
  onClose
}: ProductStockFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Instead of using context, we'll use the first company as the current one
  const currentCompany = mockCompanies[0];
  const [selectedLocationId, setSelectedLocationId] = useState(defaultLocationId);
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    product ? product.id : null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(product);

  // Define form schema with enhanced validation
  const formSchema = z.object({
    productId: z.string({
      required_error: t('validations.product_required'),
    }),
    locationId: z.string({
      required_error: t('validations.location_required'),
    }),
    quantity: z.coerce
      .number()
      .positive({
        message: t('validations.quantity_positive'),
      })
      .int({
        message: t('validations.quantity_integer'),
      }),
    reason: z.string().optional(),
    reference: z.string().optional(),
    sourceLocationId: movementType === 'transfer' ? 
      z.string({
        required_error: t('validations.source_location_required'),
      }) : 
      z.string().optional(),
    destinationLocationId: movementType === 'transfer' ? 
      z.string({
        required_error: t('validations.destination_location_required'),
      }) : 
      z.string().optional(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: product ? product.id : '',
      locationId: defaultLocationId,
      quantity: 1,
      reason: '',
      reference: '',
      sourceLocationId: defaultLocationId,
      destinationLocationId: '',
    },
  });

  // Load products for selection
  useEffect(() => {
    // In a real app, this would be an API call to get stock-managed products
    const stockManagedProducts = mockProducts.filter(
      p => p.companyId === currentCompany.id && 
           p.manageStock && 
           !p.isService
    );
    setProductOptions(stockManagedProducts);
  }, [currentCompany]);

  // Update selected product when product ID changes
  useEffect(() => {
    if (selectedProductId) {
      const foundProduct = getProductById(selectedProductId);
      if (foundProduct) {
        setSelectedProduct(foundProduct);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId]);

  // Handle product selection change
  const handleProductChange = (value: string) => {
    setSelectedProductId(value);
    form.setValue('productId', value);
  };

  // Handle location selection change
  const handleLocationChange = (value: string) => {
    setSelectedLocationId(value);
    form.setValue('locationId', value);
  };

  // Get icon based on movement type
  const getMovementTypeIcon = () => {
    switch (movementType) {
      case 'entry':
        return <ArrowUp className="h-5 w-5 text-green-500" />;
      case 'exit':
        return <ArrowDown className="h-5 w-5 text-red-500" />;
      case 'adjustment':
        return <RefreshCcw className="h-5 w-5 text-amber-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  // Get title based on movement type
  const getFormTitle = () => {
    switch (movementType) {
      case 'entry':
        return t('stock.entry_title');
      case 'exit':
        return t('stock.exit_title');
      case 'adjustment':
        return t('stock.adjustment_title');
      default:
        return t('stock.movement_title');
    }
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!currentCompany) {
      toast({
        title: t('common.error'),
        description: t('common.no_company_selected'),
        variant: 'destructive',
      });
      return;
    }

    // Validate stock levels for exits
    if (movementType === 'exit' && selectedProduct) {
      if ((selectedProduct.currentStock || 0) < values.quantity) {
        toast({
          title: t('common.error'),
          description: t('stock.insufficient_stock'),
          variant: 'destructive',
        });
        return;
      }
    }

    // Determine movement type for the backend
    let movementTypeForBackend: 'purchase' | 'sale' | 'adjustment' | 'return_customer' | 'return_supplier' | 'transfer';
    let quantityWithSign = values.quantity;

    switch (movementType) {
      case 'entry':
        movementTypeForBackend = 'purchase';
        break;
      case 'exit':
        movementTypeForBackend = 'sale';
        quantityWithSign = -values.quantity; // Negative for exits
        break;
      case 'adjustment':
      default:
        movementTypeForBackend = 'adjustment';
        break;
    }

    // Create stock movement
    const result = createStockMovement(
      currentCompany.id,
      values.productId,
      movementTypeForBackend,
      quantityWithSign,
      values.locationId,
      values.reason || undefined,
      values.reference || undefined,
      'manual'
    );

    if ('error' in result) {
      toast({
        title: t('common.error'),
        description: result.error,
        variant: 'destructive',
      });
    } else {
      const product = getProductById(values.productId);
      const location = getStockLocationById(values.locationId);
      
      toast({
        title: t('stock.movement_created'),
        description: `${product?.name} - ${Math.abs(quantityWithSign)} ${
          quantityWithSign > 0 ? t('stock.added_to') : t('stock.removed_from')
        } ${location?.name}`,
      });
      
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {getMovementTypeIcon()}
        <h3 className="text-lg font-medium">{getFormTitle()}</h3>
      </div>

      {selectedProduct && (
        <div className="bg-muted p-3 rounded-md mb-4">
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium">{selectedProduct.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedProduct.reference}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{t('stock.current_stock')}: {selectedProduct.currentStock || 0}</p>
              {selectedProduct.minStock && (
                <p className="text-sm text-muted-foreground">
                  {t('stock.min_stock')}: {selectedProduct.minStock}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('products.product')}</FormLabel>
                <Select
                  disabled={!!product}
                  onValueChange={handleProductChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('products.select_product')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
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
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('stock.location')}</FormLabel>
                <Select
                  onValueChange={handleLocationChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('stock.select_location')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('stock.quantity')}</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
                {movementType === 'exit' && selectedProduct && (
                  <FormDescription>
                    {(selectedProduct.currentStock || 0) < field.value ? (
                      <span className="text-red-500">{t('stock.insufficient_stock')}</span>
                    ) : (
                      <span>{t('stock.available')}: {selectedProduct.currentStock}</span>
                    )}
                  </FormDescription>
                )}
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
                  <Textarea 
                    placeholder={t('stock.reason_placeholder')} 
                    className="resize-none" 
                    {...field}
                  />
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
                  <Input 
                    placeholder={t('stock.reference_placeholder')} 
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('stock.reference_description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <AlertDialogFooter className="pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit"
              variant={
                movementType === 'entry' 
                  ? 'default' 
                  : movementType === 'exit' 
                    ? 'destructive' 
                    : 'secondary'
              }
            >
              {t('stock.confirm_movement')}
            </Button>
          </AlertDialogFooter>
        </form>
      </Form>
    </div>
  );
} 