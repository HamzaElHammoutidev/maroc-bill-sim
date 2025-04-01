
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Payment } from '@/data/mockData';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DownloadReceiptPopoverProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (format: string, payment: Payment) => void;
}

const DownloadReceiptPopover: React.FC<DownloadReceiptPopoverProps> = ({
  payment,
  open,
  onOpenChange,
  onDownload,
}) => {
  const { t } = useTranslation();

  if (!payment) return null;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent className="w-56 p-0" side="bottom" align="end">
        <div className="p-3">
          <h4 className="font-medium text-sm mb-1">{t('payments.select_format')}</h4>
          <p className="text-xs text-muted-foreground mb-2">{t('payments.download_description')}</p>
        </div>
        <div className="border-t">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-none h-9 px-3"
            onClick={() => onDownload('PDF', payment)}
          >
            PDF
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-none h-9 px-3"
            onClick={() => onDownload('CSV', payment)}
          >
            CSV
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DownloadReceiptPopover;
