import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface InvoiceLegalNoticesProps {
  isEditing?: boolean;
  customNotices?: string;
  onCustomNoticesChange?: (value: string) => void;
  disabled?: boolean;
}

const InvoiceLegalNotices: React.FC<InvoiceLegalNoticesProps> = ({
  isEditing = false,
  customNotices = '',
  onCustomNoticesChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [useCustomNotices, setUseCustomNotices] = useState(!!customNotices);
  
  // Default legal notices based on Moroccan law
  const defaultLegalNotices = {
    paymentTerms: t('invoices.legal_payment_terms'),
    lateFees: t('invoices.legal_late_fees'),
    taxInfo: t('invoices.legal_tax_info'),
    companyInfo: t('invoices.legal_company_info'),
  };
  
  const handleCustomNoticesToggle = (checked: boolean) => {
    setUseCustomNotices(checked);
    if (!checked && onCustomNoticesChange) {
      onCustomNoticesChange('');
    }
  };
  
  const handleCustomNoticesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onCustomNoticesChange) {
      onCustomNoticesChange(e.target.value);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('invoices.legal_notices')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="custom-notices" 
            checked={useCustomNotices}
            onCheckedChange={handleCustomNoticesToggle}
            disabled={disabled}
          />
          <Label htmlFor="custom-notices">
            {t('invoices.use_custom_notices')}
          </Label>
        </div>
        
        {useCustomNotices ? (
          <Textarea
            placeholder={t('invoices.enter_custom_notices')}
            value={customNotices}
            onChange={handleCustomNoticesChange}
            rows={6}
            disabled={disabled}
          />
        ) : (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="payment-terms">
              <AccordionTrigger>
                {t('invoices.payment_terms')}
              </AccordionTrigger>
              <AccordionContent>
                {defaultLegalNotices.paymentTerms}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="late-fees">
              <AccordionTrigger>
                {t('invoices.late_payment_fees')}
              </AccordionTrigger>
              <AccordionContent>
                {defaultLegalNotices.lateFees}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="tax-info">
              <AccordionTrigger>
                {t('invoices.tax_information')}
              </AccordionTrigger>
              <AccordionContent>
                {defaultLegalNotices.taxInfo}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="company-info">
              <AccordionTrigger>
                {t('invoices.company_information')}
              </AccordionTrigger>
              <AccordionContent>
                {defaultLegalNotices.companyInfo}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceLegalNotices; 