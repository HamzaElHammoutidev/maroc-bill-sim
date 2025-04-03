import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export default function InventoryHelp() {
  const { t } = useTranslation();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('stock.help.title')}</DialogTitle>
          <DialogDescription>
            {t('stock.help.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('stock.help.stock_title')}</h3>
            <p className="text-muted-foreground">
              {t('stock.help.stock_description')}
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>{t('stock.help.stock_point1')}</li>
              <li>{t('stock.help.stock_point2')}</li>
              <li>{t('stock.help.stock_point3')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('stock.help.inventory_title')}</h3>
            <p className="text-muted-foreground">
              {t('stock.help.inventory_description')}
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>{t('stock.help.inventory_point1')}</li>
              <li>{t('stock.help.inventory_point2')}</li>
              <li>{t('stock.help.inventory_point3')}</li>
            </ul>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-md font-semibold mb-2">{t('stock.help.key_differences')}</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('stock.help.difference1')}</li>
              <li>{t('stock.help.difference2')}</li>
              <li>{t('stock.help.difference3')}</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline">{t('common.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 