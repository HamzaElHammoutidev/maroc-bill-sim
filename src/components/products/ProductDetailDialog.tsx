import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  ShoppingBag,
  Tag,
  Barcode,
  DollarSign,
  Percent,
  Package,
  Edit,
  Plus,
  Calendar,
  User,
  Info,
  History,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  Product, 
  ProductCategory,
  getProductCategoryById,
  getProductDiscounts,
  calculateDiscountedPrice,
  ProductDiscount,
  StockMovement,
  StockMovementType,
  getStockLocationById,
  getProductStockMovements
} from '@/data/mockData';
import { formatCurrency, formatDate } from '@/utils/format';

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onEdit: () => void;
  onAddDiscount: () => void;
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  open,
  onOpenChange,
  product,
  onEdit,
  onAddDiscount
}) => {
  const { t } = useTranslation();
  
  // Get product category
  const category = product.category ? getProductCategoryById(product.category) : null;
  
  // Get product discounts
  const discounts = getProductDiscounts(product.id);
  
  // Calculate price with VAT
  const priceTTC = product.price * (1 + (product.vatRate / 100));
  
  // Get stock movements for this product
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  
  useEffect(() => {
    if (product.id) {
      const movements = getProductStockMovements(product.id);
      setStockMovements(movements);
    }
  }, [product.id]);
  
  // Get location name
  const locationName = product.locationId ? getStockLocationById(product.locationId)?.name : '-';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
              <DialogDescription>{product.description}</DialogDescription>
            </div>
            <Badge className={product.isService ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
              {product.isService ? t('products.service') : t('products.product')}
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="info">
              <ShoppingBag className="w-4 h-4 mr-2" />
              {t('products.detail.info')}
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="w-4 h-4 mr-2" />
              {t('products.detail.pricing')}
            </TabsTrigger>
            <TabsTrigger value="discounts">
              <Percent className="w-4 h-4 mr-2" />
              {t('products.detail.discounts')}
            </TabsTrigger>
            {!product.isService && (
              <TabsTrigger value="stock">
                <Package className="w-4 h-4 mr-2" />
                {t('stock.history')}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('products.detail.basic_info')}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {product.reference && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        {t('products.reference')}
                      </dt>
                      <dd>{product.reference}</dd>
                    </>
                  )}
                  
                  {product.barcode && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center">
                        <Barcode className="w-4 h-4 mr-2" />
                        {t('products.barcode')}
                      </dt>
                      <dd>{product.barcode}</dd>
                    </>
                  )}
                  
                  <dt className="text-sm font-medium text-muted-foreground">
                    <Package className="w-4 h-4 mr-2" />
                    {t('products.unit')}
                  </dt>
                  <dd>
                    {product.unit}
                    {product.minQuantity && product.minQuantity > 1 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (min: {product.minQuantity})
                      </span>
                    )}
                  </dd>
                  
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t('products.category')}
                  </dt>
                  <dd>
                    {category ? (
                      <Badge variant="outline" className="mr-2">
                        {category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </dd>
                  
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t('products.created_at')}
                  </dt>
                  <dd>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </dd>
                  
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t('products.updated_at')}
                  </dt>
                  <dd>
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </dd>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('products.detail.pricing_info')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary/20 rounded-md">
                    <div className="text-sm text-muted-foreground">{t('products.price')} (HT)</div>
                    <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>
                  </div>
                  
                  <div className="p-4 bg-secondary/20 rounded-md">
                    <div className="text-sm text-muted-foreground">{t('products.vatRate')}</div>
                    <div className="text-2xl font-bold">{product.vatRate}%</div>
                  </div>
                  
                  <div className="p-4 bg-secondary/20 rounded-md">
                    <div className="text-sm text-muted-foreground">{t('products.priceTTC')}</div>
                    <div className="text-2xl font-bold">{formatCurrency(priceTTC)}</div>
                  </div>
                </div>
                
                {discounts.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">{t('products.available_discounts')}</h4>
                    <div className="space-y-2">
                      {discounts.map(discount => {
                        const { discountedPrice, totalDiscount } = calculateDiscountedPrice(product);
                        return (
                          <div key={discount.id} className="flex items-center justify-between border p-2 rounded-md">
                            <div>
                              <p className="font-medium">{discount.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {discount.type === 'percentage' 
                                  ? `${discount.value}%` 
                                  : formatCurrency(discount.value)}
                              </p>
                              {discount.code && (
                                <p className="text-xs bg-muted px-2 py-0.5 rounded-sm inline-block mt-1">
                                  {t('products.discount.code')}: {discount.code}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-green-600 font-medium">
                                {formatCurrency(totalDiscount)}
                              </p>
                              <p className="text-sm">
                                {formatCurrency(discountedPrice)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="discounts" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('products.detail.discounts')}</CardTitle>
                <Button size="sm" onClick={onAddDiscount}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('products.discount.add')}
                </Button>
              </CardHeader>
              <CardContent>
                {discounts.length > 0 ? (
                  <div className="space-y-3">
                    {discounts.map(discount => (
                      <DiscountItem 
                        key={discount.id}
                        discount={discount} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Percent className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>{t('products.no_discounts')}</p>
                    <Button 
                      variant="link" 
                      onClick={onAddDiscount}
                      className="mt-2"
                    >
                      {t('products.discount.create_first')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stock" className="space-y-4">
            {!product.manageStock ? (
              <div className="text-center py-6">
                <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{t('stock.not_managed_for_product')}</p>
              </div>
            ) : stockMovements.length === 0 ? (
              <div className="text-center py-6">
                <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{t('stock.no_history')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 divide-y">
                  {stockMovements.map((movement) => (
                    <div key={movement.id} className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium flex items-center">
                            {movement.type === 'purchase' && (
                              <ArrowUp className="h-4 w-4 mr-2 text-green-600" />
                            )}
                            {movement.type === 'sale' && (
                              <ArrowDown className="h-4 w-4 mr-2 text-red-600" />
                            )}
                            {(movement.type === 'return_customer' || movement.type === 'return_supplier') && (
                              <ArrowUp className="h-4 w-4 mr-2 text-amber-600" />
                            )}
                            {movement.type === 'adjustment' && (
                              <History className="h-4 w-4 mr-2 text-blue-600" />
                            )}
                            {movement.type === 'transfer' && (
                              <Package className="h-4 w-4 mr-2 text-purple-600" />
                            )}
                            {t(`stock.movement_types.${movement.type}`)}
                          </div>
                          {movement.reason && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {movement.reason}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity} {product.unit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(movement.date)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">{t('stock.previous')}:</span>{' '}
                          <span className="font-medium">{movement.previousStock}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('stock.new')}:</span>{' '}
                          <span className="font-medium">{movement.newStock}</span>
                        </div>
                        {movement.locationId && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">{t('stock.location')}:</span>{' '}
                            <span>{getStockLocationById(movement.locationId)?.name || movement.locationId}</span>
                          </div>
                        )}
                        {movement.referenceId && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">{t('stock.reference')}:</span>{' '}
                            <span>{movement.referenceId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('form.close')}
          </Button>
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            {t('form.edit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DiscountItemProps {
  discount: ProductDiscount;
}

const DiscountItem: React.FC<DiscountItemProps> = ({ discount }) => {
  const { t } = useTranslation();
  
  return (
    <div className="border rounded-md p-3 hover:border-primary transition-colors">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{discount.name}</h4>
        <Badge variant="outline" className={discount.type === 'percentage' ? 'bg-blue-50' : 'bg-green-50'}>
          {discount.type === 'percentage' 
            ? `${discount.value}%` 
            : formatCurrency(discount.value)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
        {discount.code && (
          <div className="flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <span>{discount.code}</span>
          </div>
        )}
        
        {(discount.startDate || discount.endDate) && (
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <span>
              {discount.startDate && new Date(discount.startDate).toLocaleDateString()}
              {discount.startDate && discount.endDate && ' - '}
              {discount.endDate && new Date(discount.endDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {(discount.clientCategory || discount.clientId) && (
          <div className="flex items-center">
            <User className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <span>
              {discount.clientCategory && t(`clients.category.${discount.clientCategory.toLowerCase()}`)}
              {discount.clientId && t('products.discount.specific_client')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailDialog; 