
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t(title)}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-lg">{t(description)}</p>
        )}
      </div>
      {action && (
        <Button 
          className="mt-4 md:mt-0 animate-slide-in shadow-md hover:shadow-lg transition-all" 
          onClick={action.onClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t(action.label)}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
