import React, { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from 'react-i18next';

export interface DeleteConfirmationDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Callback when dialog open state changes
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * The title for the confirmation dialog
   */
  title?: string;
  
  /**
   * The warning message
   */
  description?: string;
  
  /**
   * Additional description content
   */
  descriptionContent?: ReactNode;
  
  /**
   * Callback when delete is confirmed
   */
  onConfirm: () => void;
  
  /**
   * Callback when delete is canceled
   */
  onCancel?: () => void;
  
  /**
   * Custom text for the cancel button
   */
  cancelText?: string;
  
  /**
   * Custom text for the delete button
   */
  confirmText?: string;
}

/**
 * A reusable confirmation dialog for deleting entities
 */
const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  descriptionContent,
  onConfirm,
  onCancel,
  cancelText,
  confirmText,
}) => {
  const { t } = useTranslation();
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || t('delete.confirmation')}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || t('delete.warning')}
            {descriptionContent}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText || t('form.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {confirmText || t('form.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog; 