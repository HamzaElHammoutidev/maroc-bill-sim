import React, { useState } from 'react';
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
import { ProductCategory } from '@/data/mockData';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ProductCategory;
  onSave: (category: ProductCategory) => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  onSave
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.companyId || '101';
  
  // Form state
  const [formData, setFormData] = useState<Partial<ProductCategory>>(
    category || {
      companyId,
      name: '',
      description: '',
      isActive: true
    }
  );
  
  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Save handler
  const handleSave = () => {
    // Validate required fields
    if (!formData.name) {
      // Show validation error
      return;
    }
    
    // Create the category object
    const newCategory: ProductCategory = {
      ...formData,
      id: category?.id || `cat-${Date.now()}`,
      companyId: formData.companyId || companyId,
      name: formData.name || '',
      description: formData.description,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      createdAt: category?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as ProductCategory;
    
    onSave(newCategory);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category ? t('products.category.edit') : t('products.category.add')}
          </DialogTitle>
          <DialogDescription>
            {category ? t('products.category.edit_description') : t('products.category.add_description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('products.category.name')} *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('products.category.description')}</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
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

export default CategoryDialog; 