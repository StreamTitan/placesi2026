import { useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useDeleteConfirmation } from '../../contexts/DeleteConfirmationContext';

interface DocumentUploadProps {
  label: string;
  accept?: string;
  required?: boolean;
  maxSize?: number;
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

export function DocumentUpload({
  label,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  required = false,
  maxSize = 5 * 1024 * 1024,
  onFileSelect,
  file
}: DocumentUploadProps) {
  const { showDeleteConfirmation } = useDeleteConfirmation();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = accept.split(',').map(t => t.trim());

    if (!acceptedTypes.includes(extension)) {
      return `File type not accepted. Accepted types: ${accept}`;
    }

    return null;
  };

  const handleFile = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (!file) return;

    showDeleteConfirmation({
      title: 'Remove Document',
      message: 'Are you sure you want to remove this uploaded document?',
      itemName: file.name,
      confirmText: 'Remove Document',
      onConfirm: () => {
        setError(null);
        onFileSelect(null);
      },
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
            dragActive
              ? 'border-[#008DBF] bg-blue-50 dark:bg-blue-900/20'
              : error
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input
            type="file"
            onChange={handleChange}
            accept={accept}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-2">
            <Upload className={`w-12 h-12 sm:w-10 sm:h-10 mx-auto ${error ? 'text-red-500' : 'text-gray-400'}`} />
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <span className="font-medium text-[#008DBF] hover:text-[#006a94]">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {accept} (max {(maxSize / (1024 * 1024)).toFixed(0)}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <File className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="ml-3 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
