import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';

interface DeleteConfirmationOptions {
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}

interface DeleteConfirmationContextType {
  showDeleteConfirmation: (options: DeleteConfirmationOptions) => void;
  hideDeleteConfirmation: () => void;
}

const DeleteConfirmationContext = createContext<DeleteConfirmationContextType | undefined>(
  undefined
);

export function useDeleteConfirmation() {
  const context = useContext(DeleteConfirmationContext);
  if (!context) {
    throw new Error('useDeleteConfirmation must be used within DeleteConfirmationProvider');
  }
  return context;
}

interface DeleteConfirmationProviderProps {
  children: ReactNode;
}

export function DeleteConfirmationProvider({ children }: DeleteConfirmationProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [options, setOptions] = useState<DeleteConfirmationOptions>({
    onConfirm: () => {},
  });

  const showDeleteConfirmation = useCallback((newOptions: DeleteConfirmationOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
    setIsDeleting(false);
  }, []);

  const hideDeleteConfirmation = useCallback(() => {
    if (!isDeleting) {
      setIsOpen(false);
      setTimeout(() => {
        setOptions({ onConfirm: () => {} });
      }, 300);
    }
  }, [isDeleting]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await options.onConfirm();
      setIsOpen(false);
      setTimeout(() => {
        setOptions({ onConfirm: () => {} });
        setIsDeleting(false);
      }, 300);
    } catch (error) {
      console.error('Error during deletion:', error);
      setIsDeleting(false);
    }
  };

  return (
    <DeleteConfirmationContext.Provider
      value={{ showDeleteConfirmation, hideDeleteConfirmation }}
    >
      {children}
      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={hideDeleteConfirmation}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        itemName={options.itemName}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        isDeleting={isDeleting}
      />
    </DeleteConfirmationContext.Provider>
  );
}
