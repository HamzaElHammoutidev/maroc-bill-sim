import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { currencies, defaultCurrency } from '@/config/moroccoConfig';

interface CurrencySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  variant?: 'dropdown' | 'select';
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value = defaultCurrency,
  onChange,
  disabled = false,
  variant = 'dropdown'
}) => {
  const { t, i18n } = useTranslation();
  
  const handleCurrencyChange = (newCurrency: string) => {
    onChange?.(newCurrency);
  };
  
  const selectedCurrency = currencies.find(c => c.code === value) || currencies[0];
  
  if (variant === 'select') {
    return (
      <div className="w-full">
        <Select
          value={value}
          onValueChange={handleCurrencyChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('common.select_currency')} />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.code} - {currency.name[i18n.language]} ({currency.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9" disabled={disabled}>
          <CreditCard className="h-4 w-4 mr-2" />
          <span>{selectedCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem 
            key={currency.code}
            onClick={() => handleCurrencyChange(currency.code)}
            className={value === currency.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{currency.symbol}</span>
            <span>{currency.name[i18n.language]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector; 