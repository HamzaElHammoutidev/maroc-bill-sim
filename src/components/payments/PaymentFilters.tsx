
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
}) => {
  const { t } = useLanguage();

  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'pending', label: t('payments.pending') },
    { value: 'completed', label: t('payments.completed') },
    { value: 'failed', label: t('payments.failed') },
    { value: 'refunded', label: t('payments.refunded') },
  ];

  return (
    <Card className="mb-8 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.status')} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentFilters;
