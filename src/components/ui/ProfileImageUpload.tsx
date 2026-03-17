import { useState, useRef } from 'react';
import { Camera, Loader2, X, User } from 'lucide-react';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<{ url: string; error?: string }>;
  onRemove?: () => Promise<void>;
  disabled?: boolean;
}

export function ProfileImageUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  disabled = false,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await onUpload(file);
      if (result.error) {
        setError(result.error);
      } else {
        setImageUrl(result.url);
      }
    } catch (err) {
      setError('Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    setUploading(true);
    setError('');

    try {
      await onRemove();
      setImageUrl(null);
    } catch (err) {
      setError('Failed to remove image');
      console.error('Remove error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {!disabled && !uploading && (
          <div className="absolute bottom-0 right-0 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-colors"
              title="Change photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {imageUrl && onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        Click the camera icon to upload a photo
        <br />
        Max size: 5MB (JPG, PNG, WEBP)
      </p>
    </div>
  );
}
