import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, Send, Ban, CreditCard, FileWarning } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { InvoiceStatus } from '@/data/mockData';
import { formatDate } from '@/lib/utils';

const stepVariants = cva(
  "flex flex-col items-center justify-center py-2",
  {
    variants: {
      status: {
        active: "text-primary",
        completed: "text-primary",
        inactive: "text-muted-foreground opacity-70",
      },
    },
    defaultVariants: {
      status: "inactive",
    },
  }
);

const lineVariants = cva(
  "h-1 w-full",
  {
    variants: {
      status: {
        active: "bg-primary",
        completed: "bg-primary",
        inactive: "bg-muted",
      },
    },
    defaultVariants: {
      status: "inactive",
    },
  }
);

interface InvoiceStatusWorkflowProps {
  status: InvoiceStatus;
  createdAt?: string;
  sentAt?: string;
  paidAt?: string;
  cancelledAt?: string;
  className?: string;
}

const InvoiceStatusWorkflow: React.FC<InvoiceStatusWorkflowProps> = ({
  status,
  createdAt,
  sentAt,
  paidAt,
  cancelledAt,
  className,
}) => {
  const { t } = useTranslation();
  
  // Define workflow steps
  const steps = [
    {
      icon: <Clock className="w-5 h-5" />,
      label: t('invoices.draft'),
      date: createdAt,
      isCompleted: ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'].includes(status),
      isActive: status === 'draft',
    },
    {
      icon: <Send className="w-5 h-5" />,
      label: t('invoices.sent'),
      date: sentAt,
      isCompleted: ['sent', 'partial', 'paid', 'overdue', 'cancelled'].includes(status),
      isActive: status === 'sent' || status === 'overdue',
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: t('invoices.paid'),
      date: paidAt,
      isCompleted: ['paid'].includes(status),
      isActive: status === 'partial',
    },
    {
      icon: status === 'cancelled' ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />,
      label: status === 'cancelled' ? t('invoices.cancelled') : t('invoices.completed'),
      date: status === 'cancelled' ? cancelledAt : paidAt,
      isCompleted: ['paid', 'cancelled'].includes(status),
      isActive: status === 'paid' || status === 'cancelled',
    },
  ];
  
  if (status === 'overdue') {
    steps[1].icon = <FileWarning className="w-5 h-5 text-warning" />;
  }
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-start justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className={cn(
              stepVariants({ 
                status: step.isActive 
                  ? 'active' 
                  : step.isCompleted 
                    ? 'completed' 
                    : 'inactive' 
              }),
              'w-20 text-center'
            )}>
              <div 
                className={cn(
                  "rounded-full p-1.5 mb-1", 
                  step.isActive 
                    ? "bg-primary text-primary-foreground" 
                    : step.isCompleted 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                )}
              >
                {step.icon}
              </div>
              <span className="text-xs font-medium">{step.label}</span>
              {step.date && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(step.date)}
                </span>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex items-center flex-1 pt-3">
                <div 
                  className={cn(
                    lineVariants({ 
                      status: steps[index + 1].isCompleted || steps[index + 1].isActive
                        ? 'completed'
                        : 'inactive'
                    })
                  )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default InvoiceStatusWorkflow; 