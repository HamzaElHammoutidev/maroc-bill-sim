import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Package, Tag, BoxIcon, Clock } from 'lucide-react';
import { 
  Product, 
  ProductCategory,
  getStockLocations, 
  StockLocation 
} from '@/data/mockData';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: ProductCategory[];
  isEdit: boolean;
  onSave: (product: Product) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  categories,
  isEdit,
  onSave
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.companyId || '101';

  // Stock locations
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    companyId,
    name: '',
    description: '',
    price: 0,
    vatRate: 20,
    unit: 'pièce',
    isService: false,
    minQuantity: 1,
    // Stock management fields
    manageStock: false,
    currentStock: 0,
    minStock: 0,
    alertStock: 0,
    locationId: ''
  });
  
  // Set initial form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        ...product
      });
    } else {
      setFormData({
        companyId,
        name: '',
        description: '',
        price: 0,
        vatRate: 20,
        unit: 'pièce',
        isService: false,
        minQuantity: 1,
        // Stock management fields
        manageStock: false,
        currentStock: 0,
        minStock: 0,
        alertStock: 0,
        locationId: ''
      });
    }
  }, [product, companyId]);

  // Load stock locations
  useEffect(() => {
    const locations = getStockLocations(companyId);
    setStockLocations(locations);
    
    // Set default location if not already set and locations exist
    if (locations.length > 0 && !formData.locationId) {
      const defaultLocation = locations.find(loc => loc.isDefault);
      setFormData(prev => ({
        ...prev,
        locationId: defaultLocation ? defaultLocation.id : locations[0].id
      }));
    }
  }, [companyId]);
  
  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Number input change handler
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };
  
  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Switch change handler
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Save handler
  const handleSave = () => {
    // Validate required fields
    if (!formData.name || !formData.price || !formData.unit) {
      // Show validation error
      return;
    }
    
    // Create the product object
    const newProduct: Product = {
      ...formData,
      id: product?.id || `product-${Date.now()}`,
      companyId: formData.companyId || companyId,
      name: formData.name || '',
      description: formData.description || '',
      price: formData.price || 0,
      vatRate: formData.vatRate || 20,
      unit: formData.unit || 'pièce',
      isService: formData.isService || false,
      // Stock management fields
      manageStock: formData.manageStock || false, 
      currentStock: formData.currentStock || 0,
      minStock: formData.minStock || 0,
      alertStock: formData.alertStock || 0,
      locationId: formData.locationId || '',
      createdAt: product?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Product;
    
    onSave(newProduct);
  };
  
  // Calculate price with VAT
  const calculatePriceWithVat = () => {
    const price = formData.price || 0;
    const vatRate = formData.vatRate || 0;
    return price * (1 + (vatRate / 100));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('products.edit') : t('products.add')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('products.edit_description') : t('products.add_description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('products.general')}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t('products.pricing')}
            </TabsTrigger>
            <TabsTrigger 
              value="stock" 
              className="flex items-center gap-2"
              disabled={formData.isService}
            >
              <BoxIcon className="h-4 w-4" />
              {t('stock.title')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('products.name')} *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('products.product_description')}</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference">{t('products.reference')}</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder={t('products.reference_placeholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="barcode">{t('products.barcode')}</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder={t('products.barcode_placeholder')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t('products.category')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t('products.select_category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">{t('products.unit')} *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange('unit', value)}
                  required
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder={t('products.select_unit')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pièce">{t('products.units.piece')}</SelectItem>
                    <SelectItem value="heure">{t('products.units.hour')}</SelectItem>
                    <SelectItem value="jour">{t('products.units.day')}</SelectItem>
                    <SelectItem value="kg">{t('products.units.kg')}</SelectItem>
                    <SelectItem value="m²">{t('products.units.sqm')}</SelectItem>
                    <SelectItem value="forfait">{t('products.units.fixed')}</SelectItem>
                    <SelectItem value="mois">{t('products.units.month')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isService"
                checked={formData.isService}
                onCheckedChange={(checked) => handleSwitchChange('isService', checked)}
              />
              <Label htmlFor="isService">{t('products.is_service')}</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t('products.price')} *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleNumberChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vatRate">{t('products.vat_rate')} (%)</Label>
                <Select
                  value={String(formData.vatRate)}
                  onValueChange={(value) => handleSelectChange('vatRate', value)}
                >
                  <SelectTrigger id="vatRate">
                    <SelectValue placeholder={t('products.select_vat_rate')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="7">7%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="14">14%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="p-3 rounded bg-muted flex justify-between items-center">
              <span>{t('products.price_with_vat')}</span>
              <span className="font-semibold">
                {calculatePriceWithVat().toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minQuantity">{t('products.minQuantity')}</Label>
              <Input
                id="minQuantity"
                name="minQuantity"
                type="number"
                min="1"
                value={formData.minQuantity}
                onChange={handleNumberChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="stock" className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="manageStock"
                checked={formData.manageStock}
                onCheckedChange={(checked) => handleSwitchChange('manageStock', checked)}
              />
              <Label htmlFor="manageStock">{t('stock.manage_stock')}</Label>
            </div>
            
            {formData.manageStock && (
              <>
                <Separator className="my-2" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">{t('stock.current_stock')}</Label>
                    <Input
                      id="currentStock"
                      name="currentStock"
                      type="number"
                      min="0"
                      value={formData.currentStock}
                      onChange={handleNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="locationId">{t('stock.location')}</Label>
                    <Select
                      value={formData.locationId}
                      onValueChange={(value) => handleSelectChange('locationId', value)}
                    >
                      <SelectTrigger id="locationId">
                        <SelectValue placeholder={t('stock.select_location')} />
                      </SelectTrigger>
                      <SelectContent>
                        {stockLocations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minStock">{t('stock.min_stock')}</Label>
                    <Input
                      id="minStock"
                      name="minStock"
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={handleNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alertStock">{t('stock.alert_stock')}</Label>
                    <Input
                      id="alertStock"
                      name="alertStock"
                      type="number"
                      min="0"
                      value={formData.alertStock}
                      onChange={handleNumberChange}
                    />
                  </div>
                </div>
                
                <div className="p-3 rounded bg-muted">
                  <p className="text-sm">{t('stock.management_description')}</p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? t('common.save') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog; 