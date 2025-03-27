
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { InvoiceStatus, QuoteStatus } from '@/data/mockData';

interface StatusBadgeProps {
  status: InvoiceStatus | QuoteStatus;
  type: 'invoice' | 'quote';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const { t } = useLanguage();
  
  // Define color mapping for statuses
  const getColorClass = () => {
    switch (status) {
      case 'paid':
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'partial':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'sent':
        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      case 'overdue':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
      case 'converted':
        return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get translation key for status
  const getStatusKey = () => {
    return `${type}s.${status}`;
  };
  
  return (
    <Badge variant="outline" className={cn("font-normal transition-colors", getColorClass())}>
      {t(getStatusKey())}
    </Badge>
  );
};

export default StatusBadge;
