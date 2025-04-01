import React, { useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import PageHeader from '@/components/PageHeader';
import EntityFormDialog from './EntityFormDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { exportEntitiesAsCsv } from './EntityDataExport';

export interface EntityManagerProps<T extends { id: string }> {
  /**
   * Title for the entity management page
   */
  title: string;
  
  /**
   * Add button text
   */
  addButtonText: string;
  
  /**
   * Export button text
   */
  exportButtonText?: string;
  
  /**
   * DataTable columns configuration
   */
  columns: Column<T>[];
  
  /**
   * Entity data array
   */
  data: T[];
  
  /**
   * Key to search in data
   */
  searchKey: string;
  
  /**
   * Search placeholder text
   */
  searchPlaceholder: string;
  
  /**
   * Message to display when no results are found
   */
  noResultsMessage: string;
  
  /**
   * Message to display when no data is available
   */
  noDataMessage: string;
  
  /**
   * Initial sort field
   */
  initialSortField?: string;
  
  /**
   * Initial sort direction
   */
  initialSortDirection?: 'asc' | 'desc';
  
  /**
   * Filter component rendered above the data table
   */
  filterComponent?: ReactNode;
  
  /**
   * Whether to show the export button
   */
  showExport?: boolean;
  
  /**
   * Export configuration - headers mapping
   */
  exportHeaders?: Record<string, string>;
  
  /**
   * Export filename prefix
   */
  exportFilename?: string;
  
  /**
   * Transform function for export
   */
  exportTransform?: (entity: T) => Record<string, any>;
  
  /**
   * Currently selected entity for editing
   */
  selectedEntity: T | null;
  
  /**
   * Handler to set the selected entity
   */
  setSelectedEntity: (entity: T | null) => void;
  
  /**
   * Add Dialog Form content
   */
  renderAddForm: () => ReactNode;
  
  /**
   * Edit Dialog Form content
   */
  renderEditForm: () => ReactNode;
  
  /**
   * Handler when entity is added
   */
  onEntityAdd: () => void;
  
  /**
   * Handler when entity is edited
   */
  onEntityEdit: () => void;
  
  /**
   * Handler when entity is deleted
   */
  onEntityDelete: () => void;
  
  /**
   * Message shown when entity is added successfully
   */
  addSuccessMessage: string;
  
  /**
   * Message shown when entity is edited successfully
   */
  editSuccessMessage: string;
  
  /**
   * Message shown when entity is deleted successfully
   */
  deleteSuccessMessage: string;
  
  /**
   * Custom filtering for entity data
   */
  filterData?: (data: T[]) => T[];
  
  /**
   * Title for add dialog
   */
  addDialogTitle: string;
  
  /**
   * Description for add dialog
   */
  addDialogDescription?: string;
  
  /**
   * Title for edit dialog
   */
  editDialogTitle: string;
  
  /**
   * Description for edit dialog
   */
  editDialogDescription?: string;
  
  /**
   * Title for delete dialog
   */
  deleteDialogTitle?: string;
  
  /**
   * Description for delete dialog
   */
  deleteDialogDescription?: string;
}

/**
 * A reusable component for managing entities (listing, adding, editing, deleting)
 */
const EntityManager = <T extends { id: string }>({
  title,
  addButtonText,
  exportButtonText,
  columns,
  data,
  searchKey,
  searchPlaceholder,
  noResultsMessage,
  noDataMessage,
  initialSortField,
  initialSortDirection,
  filterComponent,
  showExport = false,
  exportHeaders,
  exportFilename,
  exportTransform,
  selectedEntity,
  setSelectedEntity,
  renderAddForm,
  renderEditForm,
  onEntityAdd,
  onEntityEdit,
  onEntityDelete,
  addSuccessMessage,
  editSuccessMessage,
  deleteSuccessMessage,
  filterData,
  addDialogTitle,
  addDialogDescription,
  editDialogTitle,
  editDialogDescription,
  deleteDialogTitle,
  deleteDialogDescription,
}: EntityManagerProps<T>) => {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Apply custom filtering if provided
  const displayData = filterData ? filterData(data) : data;
  
  const handleAdd = () => {
    onEntityAdd();
    setIsAddDialogOpen(false);
    toast.success(addSuccessMessage);
  };
  
  const handleEdit = () => {
    onEntityEdit();
    setIsEditDialogOpen(false);
    toast.success(editSuccessMessage);
  };
  
  const handleDelete = () => {
    onEntityDelete();
    setIsDeleteDialogOpen(false);
    toast.success(deleteSuccessMessage);
  };
  
  const handleExport = () => {
    if (!showExport || !exportHeaders || !exportFilename) return;
    
    exportEntitiesAsCsv(
      displayData,
      exportHeaders,
      exportFilename,
      exportTransform
    );
    
    toast.success(t('export.success'));
  };
  
  const openEditDialog = (entity: T) => {
    setSelectedEntity(entity);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (entity: T) => {
    setSelectedEntity(entity);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <div className="staggered-fade-in">
      <PageHeader 
        title={title} 
        action={{
          label: addButtonText,
          onClick: () => setIsAddDialogOpen(true)
        }}
      />
      
      <div className="flex justify-between items-center mb-4">
        {filterComponent}
        
        {showExport && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {exportButtonText || t('export.button')}
          </Button>
        )}
      </div>
      
      <DataTable
        data={displayData}
        columns={columns}
        searchPlaceholder={searchPlaceholder}
        searchKey={searchKey}
        noResultsMessage={noResultsMessage}
        noDataMessage={noDataMessage}
        initialSortField={initialSortField}
        initialSortDirection={initialSortDirection}
        cardClassName="shadow-sm"
      />
      
      {/* Add Dialog */}
      <EntityFormDialog
        title={addDialogTitle}
        description={addDialogDescription}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAdd}
        formClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {renderAddForm()}
      </EntityFormDialog>
      
      {/* Edit Dialog */}
      <EntityFormDialog
        title={editDialogTitle}
        description={editDialogDescription}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEdit}
        formClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {selectedEntity && renderEditForm()}
      </EntityFormDialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={deleteDialogTitle}
        description={deleteDialogDescription}
        descriptionContent={
          selectedEntity && (
            <strong className="font-semibold block mt-2">
              {(selectedEntity as any).name || selectedEntity.id}
            </strong>
          )
        }
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EntityManager; 