import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DollarSign } from 'lucide-react';

interface MarkAsSoldRentedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalPrice: number) => void;
  propertyTitle: string;
  askingPrice: number;
  mode: 'sold' | 'rented';
}

export function MarkAsSoldRentedModal({
  isOpen,
  onClose,
  onConfirm,
  propertyTitle,
  askingPrice,
  mode,
}: MarkAsSoldRentedModalProps) {
  const [finalPrice, setFinalPrice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const price = parseFloat(finalPrice);

    if (!finalPrice || isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(price);
      handleClose();
    } catch (err) {
      setError('Failed to update property status. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFinalPrice('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  const modeText = mode === 'sold' ? 'Sold' : 'Rented';
  const modeAction = mode === 'sold' ? 'sale' : 'rental';

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Mark Property as {modeText}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enter the final {modeAction} price for this property
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {propertyTitle}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Asking Price:
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              ${askingPrice.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Final {modeText} Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder="Enter final price"
                className="pl-10"
                min="0"
                step="0.01"
                required
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Important:</strong> This action will mark the property as {modeText.toLowerCase()} and it will no longer appear in active listings. This helps track your conversion rate and sales performance.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Updating...' : `Mark as ${modeText}`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
