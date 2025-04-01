import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Percent, 
  DollarSign,
  Users,
  User,
  Tag
} from 'lucide-react';
import { 
  Product,
  ProductDiscount,
  mockClients, 
  Client
} from '@/data/mockData';

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  discount?: ProductDiscount;
  onSave: (discount: ProductDiscount) => void;
}

const DiscountDialog: React.FC<DiscountDialogProps> = ({
  open,
  onOpenChange,
  product,
  discount,
  onSave
}) => {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState<Partial<ProductDiscount>>(
    discount || {
      productId: product.id,
      name: '',
      type: 'percentage',
      value: 0,
      isActive: true
    }
  );
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    formData.startDate ? new Date(formData.startDate) : undefined
  );
  
  const [endDate, setEndDate] = useState<Date | undefined>(
    formData.endDate ? new Date(formData.endDate) : undefined
  );
  
  // Manage target selection
  const [discountTarget, setDiscountTarget] = useState<'all' | 'category' | 'client'>(
    formData.clientId ? 'client' : formData.clientCategory ? 'category' : 'all'
  );
  
  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  // Radio change handler for discount type
  const handleTypeChange = (value: 'percentage' | 'fixed') => {
    setFormData(prev => ({ ...prev, type: value }));
  };
  
  // Handle discount target change
  const handleTargetChange = (value: 'all' | 'category' | 'client') => {
    setDiscountTarget(value);
    
    // Reset client and category when changing target
    if (value === 'all') {
      setFormData(prev => ({ 
        ...prev, 
        clientCategory: undefined,
        clientId: undefined 
      }));
    }
  };
  
  // Save handler
  const handleSave = () => {
    // Validate required fields
    if (!formData.name || formData.value === undefined || formData.value < 0) {
      // Show validation error
      return;
    }
    
    // Create dates from selected date objects
    const discountData: Partial<ProductDiscount> = {
      ...formData
    };
    
    if (startDate) {
      discountData.startDate = startDate.toISOString();
    }
    
    if (endDate) {
      discountData.endDate = endDate.toISOString();
    }
    
    // Handle discount target
    if (discountTarget === 'all') {
      discountData.clientCategory = undefined;
      discountData.clientId = undefined;
    }
    
    // Create the discount object
    const newDiscount: ProductDiscount = {
      ...discountData,
      id: discount?.id || `disc-${Date.now()}`,
      productId: product.id,
      isActive: true,
      createdAt: discount?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as ProductDiscount;
    
    onSave(newDiscount);
  };
  
  // Get available client categories
  const clientCategories = Array.from(
    new Set(mockClients.map(client => client.category).filter(Boolean))
  ) as string[];
  
  // Get available clients
  const clients = mockClients.filter(client => !!client.name);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {discount ? t('products.discount.edit') : t('products.discount.add')}
          </DialogTitle>
          <DialogDescription>
            {discount 
              ? t('products.discount.edit_description', { product: product.name }) 
              : t('products.discount.add_description', { product: product.name })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('products.discount.name')} *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t('products.discount.name_placeholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('products.discount.type')} *</Label>
            <RadioGroup 
              value={formData.type} 
              onValueChange={handleTypeChange as (value: string) => void}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center">
                  <Percent className="w-4 h-4 mr-1" />
                  {t('products.discount.percentage')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {t('products.discount.fixed')}
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">{t('products.discount.value')} *</Label>
            <div className="relative">
              <Input
                id="value"
                name="value"
                type="number"
                min="0"
                step={formData.type === 'percentage' ? '1' : '0.01'}
                max={formData.type === 'percentage' ? '100' : undefined}
                value={formData.value}
                onChange={handleNumberChange}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {formData.type === 'percentage' ? '%' : 'DH'}
              </div>
            </div>
            {formData.type === 'percentage' && (
              <p className="text-xs text-muted-foreground">{t('products.discount.percentage_hint')}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">{t('products.discount.code')}</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder={t('products.discount.code_placeholder')}
            />
            <p className="text-xs text-muted-foreground">{t('products.discount.code_hint')}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('products.discount.start_date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, 'PPP')
                    ) : (
                      <span>{t('products.discount.select_date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>{t('products.discount.end_date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, 'PPP')
                    ) : (
                      <span>{t('products.discount.select_date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={date => 
                      startDate ? date < startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t('products.discount.applies_to')}</Label>
            <RadioGroup 
              value={discountTarget} 
              onValueChange={handleTargetChange as (value: string) => void}
              className="grid grid-cols-3 gap-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {t('products.discount.all_clients')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category" id="category" />
                <Label htmlFor="category" className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {t('products.discount.client_category')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" />
                <Label htmlFor="client" className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {t('products.discount.specific_client')}
                </Label>
              </div>
            </RadioGroup>
            
            {discountTarget === 'category' && (
              <div className="pt-2">
                <Select
                  value={formData.clientCategory}
                  onValueChange={(value) => handleSelectChange('clientCategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.discount.select_client_category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {clientCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {t(`clients.category.${category.toLowerCase()}`) || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {discountTarget === 'client' && (
              <div className="pt-2">
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => handleSelectChange('clientId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.discount.select_client')} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('form.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('form.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountDialog; 