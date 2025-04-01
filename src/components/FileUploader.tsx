import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploaderProps {
  /**
   * Function to handle selected files
   */
  onFilesSelected: (files: File[]) => void;
  
  /**
   * Maximum number of files that can be uploaded
   * @default 5
   */
  maxFiles?: number;
  
  /**
   * Maximum file size in MB
   * @default 10
   */
  maxSize?: number;
  
  /**
   * Accepted file types
   * @example ['.pdf', '.jpg', '.png']
   */
  acceptedTypes?: string[];
  
  /**
   * Custom class name for the uploader
   */
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'],
  className = '',
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFiles = (files: File[]): { valid: File[], errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    // Check if exceeding max files
    if (files.length > maxFiles) {
      errors.push(t('uploader.too_many_files', { max: maxFiles }));
      return { valid: validFiles, errors };
    }
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name}: ${t('uploader.file_too_large', { max: maxSize })}`);
        continue;
      }
      
      // Check file type
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExt)) {
        errors.push(`${file.name}: ${t('uploader.invalid_file_type')}`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    return { valid: validFiles, errors };
  };
  
  const processFiles = (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    const { valid, errors } = validateFiles(filesArray);
    
    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
      onFilesSelected(valid);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const acceptedTypesString = acceptedTypes.join(',');
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypesString}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-2 p-4">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('uploader.drop_files')}</p>
            <p className="text-xs text-muted-foreground">
              {t('uploader.max_size', { size: maxSize })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('uploader.accepted_types', { types: acceptedTypes.join(', ') })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('uploader.max_files', { max: maxFiles })}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleButtonClick}>
            {t('uploader.select_files')}
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUploader; 