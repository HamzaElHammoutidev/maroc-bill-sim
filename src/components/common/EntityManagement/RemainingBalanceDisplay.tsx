
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Wallet, AlertCircle } from 'lucide-react';

export interface RemainingBalanceDisplayProps {
  total: number;
  amountPaid: number;
  depositAmount?: number;
  depositPercentage?: number;
  isDeposit?: boolean;
}

const RemainingBalanceDisplay: React.FC<RemainingBalanceDisplayProps> = ({
  total,
  amountPaid,
  depositAmount,
  depositPercentage,
  isDeposit = false
}) => {
  const { t } = useTranslation();
  
  const remainingBalance = total - amountPaid;
  const paidPercentage = (amountPaid / total) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-primary" />
            {isDeposit ? t('invoices.deposit_balance') : t('invoices.payment_balance')}
          </CardTitle>
          <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {paidPercentage.toFixed(0)}%
          </span>
        </div>
        <CardDescription>
          {isDeposit ? t('invoices.deposit_explanation') : t('invoices.balance_explanation')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Progress value={paidPercentage} className="h-2 mb-2" />
        
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="text-sm">
            <p className="text-muted-foreground">{t('invoices.total_amount')}</p>
            <p className="text-lg font-semibold">{formatCurrency(total)}</p>
          </div>
          <div className="text-sm text-right">
            <p className="text-muted-foreground">{t('invoices.amount_paid')}</p>
            <p className="text-lg font-semibold">{formatCurrency(amountPaid)}</p>
          </div>
        </div>
        
        {isDeposit && depositAmount && depositPercentage && (
          <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/10">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{t('invoices.deposit_details')}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('invoices.deposit_percentage')}: {depositPercentage}%
                </p>
              </div>
              <div className="text-right">
                <span className="font-medium">{formatCurrency(depositAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {remainingBalance > 0 && (
        <CardFooter className="pt-2 border-t flex justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-sm">{t('invoices.remaining_to_pay')}</span>
          </div>
          <span className="font-bold">{formatCurrency(remainingBalance)}</span>
        </CardFooter>
      )}
    </Card>
  );
};

export default RemainingBalanceDisplay;
