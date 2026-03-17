import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ImageUploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface ImageUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  bucket?: string;
}

const DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
  maxSizeBytes: 10 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  bucket: 'property-images',
};

export async function validateImageFile(
  file: File,
  options: ImageUploadOptions = {}
): Promise<{ valid: boolean; error?: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!opts.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${opts.allowedTypes.join(', ')}`,
    };
  }

  if (file.size > opts.maxSizeBytes) {
    const maxSizeMB = opts.maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
}

export async function compressImage(file: File, maxWidth = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          0.85
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

export async function uploadPropertyImage(
  file: File,
  userId: string,
  propertyId?: string
): Promise<ImageUploadResult> {
  try {
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      return { url: '', path: '', error: validation.error };
    }

    const compressedFile = await compressImage(file);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${propertyId || 'temp'}/${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: '', path: '', error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('property-images').getPublicUrl(fileName);

    return {
      url: publicUrl,
      path: fileName,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

export async function uploadMultipleImages(
  files: File[],
  userId: string,
  propertyId?: string,
  onProgress?: (index: number, total: number) => void
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadPropertyImage(files[i], userId, propertyId);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }

  return results;
}

export async function deletePropertyImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from('property-images').remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image delete error:', error);
    return false;
  }
}

export async function deleteMultipleImages(paths: string[]): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from('property-images').remove(paths);

    if (error) {
      console.error('Bulk delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bulk delete error:', error);
    return false;
  }
}

export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<ImageUploadResult> {
  try {
    const validation = await validateImageFile(file, {
      maxSizeBytes: 5 * 1024 * 1024,
      bucket: 'profile-images',
    });
    if (!validation.valid) {
      return { url: '', path: '', error: validation.error };
    }

    const compressedFile = await compressImage(file, 800);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: '', path: '', error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-images').getPublicUrl(fileName);

    return {
      url: publicUrl,
      path: fileName,
    };
  } catch (error) {
    console.error('Profile image upload error:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Failed to upload profile image',
    };
  }
}

export async function deleteProfileImage(userId: string): Promise<boolean> {
  try {
    const { data: files } = await supabase.storage
      .from('profile-images')
      .list(userId);

    if (!files || files.length === 0) {
      return true;
    }

    const paths = files.map((file) => `${userId}/${file.name}`);
    const { error } = await supabase.storage.from('profile-images').remove(paths);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Profile image delete error:', error);
    return false;
  }
}
