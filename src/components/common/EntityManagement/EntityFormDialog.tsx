import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export interface EntityFormDialogProps {
  /**
   * Title of the dialog
   */
  title: string;
  
  /**
   * Optional description text
   */
  description?: string;
  
  /**
   * Whether the dialog is open or not
   */
  open: boolean;
  
  /**
   * Callback when the dialog open state changes
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Callback when the form is submitted
   */
  onSubmit: () => void;
  
  /**
   * Callback when the form is canceled
   */
  onCancel?: () => void;
  
  /**
   * Custom cancel button text
   */
  cancelText?: string;
  
  /**
   * Custom submit button text
   */
  submitText?: string;
  
  /**
   * Whether the submit button is disabled
   */
  submitDisabled?: boolean;
  
  /**
   * Additional CSS class for the form content
   */
  formClassName?: string;
  
  /**
   * The form content (inputs, selects, etc.)
   */
  children: ReactNode;
}

/**
 * A reusable dialog component for entity forms (adding or editing entities)
 */
const EntityFormDialog: React.FC<EntityFormDialogProps> = ({
  title,
  description,
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  cancelText,
  submitText,
  submitDisabled,
  formClassName,
  children,
}) => {
  const { t } = useTranslation();
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className={formClassName}>
          {children}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText || t('form.cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={submitDisabled}>
            {submitText || t('form.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EntityFormDialog; 