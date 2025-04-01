import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vatRates } from '@/config/moroccoConfig';

interface QuoteVATSelectorProps {
  value: number;
  onChange: (rate: number) => void;
  disabled?: boolean;
}

const QuoteVATSelector: React.FC<QuoteVATSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const { t, i18n } = useTranslation();
  
  const handleRateChange = (rateId: string) => {
    const rate = vatRates.find(rate => rate.id === rateId);
    onChange(rate ? rate.rate : 0);
  };
  
  // Find the rate ID from the numeric value
  const selectedRateId = vatRates.find(rate => rate.rate === value)?.id || 'standard';
  
  return (
    <Select 
      value={selectedRateId} 
      onValueChange={handleRateChange} 
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={t('quotes.vat_rate')} />
      </SelectTrigger>
      <SelectContent>
        {vatRates.map((rate) => (
          <SelectItem key={rate.id} value={rate.id}>
            {rate.label[i18n.language]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default QuoteVATSelector; 