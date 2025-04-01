import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

export type ActionItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  danger?: boolean;
  hidden?: boolean;
};

export interface TableActionsProps {
  actions: ActionItem[];
  label?: string;
  placement?: 'left' | 'right';
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'icon';
  tooltipContent?: string;
}

const TableActions: React.FC<TableActionsProps> = ({
  actions,
  label = 'Actions',
  placement = 'right',
  variant = 'ghost',
  size = 'icon',
  tooltipContent,
}) => {
  // Filter out hidden actions
  const visibleActions = actions.filter(action => !action.hidden);
  
  if (visibleActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size === 'default' ? 'default' : 'icon'}
          title={tooltipContent || label}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={placement === 'left' ? 'start' : 'end'} className="bg-background border-border shadow-md z-50">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visibleActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              action.onClick();
            }}
            className={`${action.className || ''} ${action.danger ? 'text-destructive hover:text-destructive' : ''}`}
            disabled={action.disabled}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableActions;
