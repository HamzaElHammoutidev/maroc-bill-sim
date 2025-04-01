import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Callback when the open state changes
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Callback when the delete is confirmed
   */
  onConfirm: () => void;
  
  /**
   * Title of the dialog
   */
  title?: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Text for the cancel button
   */
  cancelText?: string;
  
  /**
   * Text for the confirm button
   */
  confirmText?: string;
  
  /**
   * Whether the dialog is pending (loading state)
   */
  isPending?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  cancelText,
  confirmText,
  isPending = false,
}) => {
  const { t } = useTranslation();
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash className="h-5 w-5 text-destructive" />
            {title || t('common.confirm_delete')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || t('common.confirm_delete_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelText || t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              disabled={isPending}
            >
              {confirmText || t('common.delete')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog; 