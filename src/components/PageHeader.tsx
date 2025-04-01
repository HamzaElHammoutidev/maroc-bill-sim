import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface ActionType {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface NavigationType {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ActionType;
  navigation?: NavigationType;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, icon, navigation, breadcrumbs }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col mb-8 animate-fade-in">
      {breadcrumbs && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              <a href={crumb.href} className="hover:underline">{t(crumb.label)}</a>
            </React.Fragment>
          ))}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t(title)}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-lg">{t(description)}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {navigation && (
            <Button
              variant="ghost"
              onClick={navigation.onClick}
            >
              {navigation.icon}
              {t(navigation.label)}
            </Button>
          )}
          
          {action && (
            <Button 
              className="animate-slide-in shadow-md hover:shadow-lg transition-all" 
              onClick={action.onClick}
            >
              {action.icon || (icon || <Plus className="mr-2 h-4 w-4" />)}
              {t(action.label)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
