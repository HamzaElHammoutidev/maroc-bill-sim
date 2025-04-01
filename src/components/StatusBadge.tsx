import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus, QuoteStatus, PaymentStatus, CreditNoteStatus } from '@/data/mockData';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface StatusBadgeProps {
  status: InvoiceStatus | QuoteStatus | PaymentStatus | CreditNoteStatus | string;
  type: 'invoice' | 'quote' | 'payment' | 'credit_note';
  className?: string;
}

export default function StatusBadge({ status, type, className = '' }: StatusBadgeProps) {
  const { t } = useTranslation();

  const getColorClass = (): BadgeVariant => {
    if (type === 'invoice') {
      switch (status) {
        case 'draft':
          return 'secondary';
        case 'sent':
          return 'default';
        case 'paid':
          return 'success';
        case 'partial':
          return 'warning';
        case 'overdue':
          return 'destructive';
        case 'cancelled':
          return 'outline';
        default:
          return 'default';
      }
    } else if (type === 'quote') {
      switch (status) {
        case 'draft':
          return 'secondary';
        case 'sent':
          return 'default';
        case 'accepted':
          return 'success';
        case 'rejected':
          return 'destructive';
        case 'expired':
          return 'outline';
        case 'invoiced':
          return 'warning';
        default:
          return 'default';
      }
    } else if (type === 'payment') {
      switch (status) {
        case 'pending':
          return 'warning';
        case 'completed':
          return 'success';
        case 'failed':
          return 'destructive';
        case 'refunded':
          return 'outline';
        default:
          return 'default';
      }
    } else if (type === 'credit_note') {
      switch (status) {
        case 'draft':
          return 'secondary';
        case 'issued':
          return 'default';
        case 'applied':
          return 'success';
        case 'refunded':
          return 'warning';
        case 'cancelled':
          return 'destructive';
        default:
          return 'default';
      }
    }
    
    return 'default';
  };

  const getStatusKey = (): string => {
    if (type === 'credit_note') {
      return `credit_notes.${status}`;
    }
    return `${type}s.${status}`;
  };

  return (
    <Badge variant={getColorClass()} className={className}>
      {t(getStatusKey())}
    </Badge>
  );
}
