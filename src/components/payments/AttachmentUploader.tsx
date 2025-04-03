import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paperclip, X, Image, FileText, FileArchive, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentUploaderProps {
  onAttachmentChange: (files: File[]) => void;
  existingAttachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  onDeleteExisting?: (id: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // In MB
  acceptedFileTypes?: string[];
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  onAttachmentChange,
  existingAttachments = [],
  onDeleteExisting,
  maxFiles = 5,
  maxFileSize = 10, // Default 10MB
  acceptedFileTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.zip', '.doc', '.docx', '.xls', '.xlsx']
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    onAttachmentChange(files);
  }, [files, onAttachmentChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(Array.from(e.target.files));
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const validateAndAddFiles = (selectedFiles: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    
    const totalFiles = files.length + existingAttachments.length + selectedFiles.length;
    if (totalFiles > maxFiles) {
      newErrors.push(t('attachments.too_many_files', { max: maxFiles }));
      return;
    }
    
    for (const file of selectedFiles) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        newErrors.push(t('attachments.file_too_large', { name: file.name, size: maxFileSize }));
        continue;
      }
      
      // Check file type
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedFileTypes.includes(fileExt)) {
        newErrors.push(t('attachments.invalid_file_type', { name: file.name }));
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
    
    setErrors(newErrors);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExisting = (id: string) => {
    if (onDeleteExisting) {
      onDeleteExisting(id);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="h-5 w-5 text-purple-500" />;
      default:
        return <Paperclip className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all",
          dragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Paperclip className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <div className="mt-2">
          <p className="text-sm font-medium">{t('attachments.drag_drop')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('attachments.file_types', { types: acceptedFileTypes.join(', ') })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('attachments.max_size', { size: maxFileSize })}
          </p>
        </div>
        <Input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(',')}
        />
      </div>
      
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          <p className="font-medium text-sm">{t('attachments.upload_errors')}:</p>
          <ul className="text-xs mt-1 pl-5 list-disc">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Existing attachments */}
      {existingAttachments.length > 0 && (
        <div className="mt-4">
          <Label>{t('attachments.existing_files')}</Label>
          <div className="space-y-2 mt-2">
            {existingAttachments.map(attachment => (
              <div 
                key={attachment.id}
                className="flex items-center justify-between p-2 border rounded-md bg-muted/20"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(attachment.name)}
                  <span className="text-sm truncate">{attachment.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(attachment.size)})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(attachment.url, '_blank');
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExisting(attachment.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Current files */}
      {files.length > 0 && (
        <div className="mt-4">
          <Label>{t('attachments.files_to_upload')}</Label>
          <div className="space-y-2 mt-2">
            {files.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 border rounded-md bg-muted/20"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(file.name)}
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-right">
        <p className="text-xs text-muted-foreground">
          {t('attachments.file_count', { current: files.length + existingAttachments.length, max: maxFiles })}
        </p>
      </div>
    </div>
  );
};

export default AttachmentUploader; 