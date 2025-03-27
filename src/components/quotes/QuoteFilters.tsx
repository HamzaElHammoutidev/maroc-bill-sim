
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockClients, QuoteStatus } from '@/data/mockData';

interface QuoteFiltersProps {
  onApplyFilters: (filters: {
    status: string | null;
    clientId: string | null;
    dateRange: { from: Date | null; to: Date | null };
  }) => void;
  onResetFilters: () => void;
}

const QuoteFilters: React.FC<QuoteFiltersProps> = ({
  onApplyFilters,
  onResetFilters,
}) => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  
  // Status options for filter
  const statusOptions: { value: QuoteStatus; label: string }[] = [
    { value: 'draft', label: t('quotes.draftStatus') },
    { value: 'sent', label: t('quotes.sentStatus') },
    { value: 'accepted', label: t('quotes.acceptedStatus') },
    { value: 'rejected', label: t('quotes.rejectedStatus') },
    { value: 'expired', label: t('quotes.expiredStatus') },
    { value: 'converted', label: t('quotes.convertedStatus') },
  ];
  
  const handleApply = () => {
    onApplyFilters({
      status,
      clientId,
      dateRange,
    });
  };
  
  const handleReset = () => {
    setStatus(null);
    setClientId(null);
    setDateRange({ from: null, to: null });
    onResetFilters();
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium block mb-2">{t('quotes.statusFilter')}</label>
            <Select
              value={status || 'all'}
              onValueChange={(value) => setStatus(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('quotes.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('quotes.allStatuses')}</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Client Filter */}
          <div>
            <label className="text-sm font-medium block mb-2">{t('quotes.clientFilter')}</label>
            <Select
              value={clientId || 'all'}
              onValueChange={(value) => setClientId(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('quotes.allClients')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('quotes.allClients')}</SelectItem>
                {mockClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium block mb-2">{t('quotes.dateFilter')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "P")} - {format(dateRange.to, "P")}
                      </>
                    ) : (
                      format(dateRange.from, "P")
                    )
                  ) : (
                    t('quotes.selectDate')
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: dateRange.from || undefined,
                    to: dateRange.to || undefined,
                  }}
                  onSelect={(range) => 
                    setDateRange({
                      from: range?.from || null,
                      to: range?.to || null,
                    })
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 items-end">
            <Button 
              variant="default" 
              className="flex-1" 
              onClick={handleApply}
            >
              {t('form.apply')}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleReset}
            >
              {t('form.reset')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteFilters;
