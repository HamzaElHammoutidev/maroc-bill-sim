import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FilterX } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockClients } from '@/data/mockData';

interface InvoiceFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clientFilter: string;
  setClientFilter: (clientId: string) => void;
  dateFilter: { from: Date | null; to: Date | null };
  setDateFilter: (dateRange: { from: Date | null; to: Date | null }) => void;
  onResetFilters: () => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  clientFilter,
  setClientFilter,
  dateFilter,
  setDateFilter,
  onResetFilters
}) => {
  const { t } = useTranslation();

  const formatDateRange = () => {
    if (dateFilter.from && dateFilter.to) {
      return `${format(dateFilter.from, "PP")} - ${format(dateFilter.to, "PP")}`;
    } else if (dateFilter.from) {
      return `${format(dateFilter.from, "PP")} →`;
    } else if (dateFilter.to) {
      return `← ${format(dateFilter.to, "PP")}`;
    }
    return t('invoices.dateFilter');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="flex flex-1 gap-2">
        {/* Status Filter */}
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('invoices.statusFilter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="draft">{t('invoices.draft')}</SelectItem>
              <SelectItem value="sent">{t('invoices.sent')}</SelectItem>
              <SelectItem value="paid">{t('invoices.paid')}</SelectItem>
              <SelectItem value="partial">{t('invoices.partial')}</SelectItem>
              <SelectItem value="overdue">{t('invoices.overdue')}</SelectItem>
              <SelectItem value="cancelled">{t('invoices.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client Filter */}
        <div className="flex-1">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('invoices.clientFilter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {mockClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateFilter.from && !dateFilter.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: dateFilter.from || undefined,
                  to: dateFilter.to || undefined
                }}
                onSelect={(range) => setDateFilter({ 
                  from: range?.from || null, 
                  to: range?.to || null 
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Reset Filters Button */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onResetFilters}
        title={t('form.reset')}
      >
        <FilterX className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InvoiceFilters; 