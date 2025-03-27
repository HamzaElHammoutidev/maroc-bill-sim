
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  colorClass = 'bg-primary text-primary-foreground'
}) => {
  const { t } = useLanguage();
  
  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t(title)}</p>
            <h3 className="text-2xl font-bold mt-2 tracking-tight">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{t(description)}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "p-2 rounded-full",
            colorClass
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
