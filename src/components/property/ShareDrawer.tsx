import { X, Facebook, MessageCircle, Instagram } from 'lucide-react';
import { Button } from '../ui/Button';

interface ShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    price: number;
    city: string;
    region: string;
    bedrooms: number;
    bathrooms: number;
    images?: string[];
    listing_type: string;
  };
}

export function ShareDrawer({ isOpen, onClose, property }: ShareDrawerProps) {
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TT', {
      style: 'currency',
      currency: 'TTD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const propertyUrl = `${window.location.origin}/property/${property.id}`;
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200';

  const shareText = `Check out this amazing property for ${property.listing_type}! ${property.title} - ${formatPrice(property.price)} | ${property.bedrooms} beds, ${property.bathrooms} baths in ${property.city}, ${property.region}`;

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const whatsappText = `${shareText}\n\n${propertyUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInstagramShare = () => {
    alert('Instagram sharing works best through the Instagram app. The property link has been copied to your clipboard. You can paste it in your Instagram post or story!');
    navigator.clipboard.writeText(`${shareText}\n\n${propertyUrl}`);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Property</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex gap-4">
              <img
                src={imageUrl}
                alt={property.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {property.title}
                </h3>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                  {formatPrice(property.price)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {property.bedrooms} beds • {property.bathrooms} baths
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleFacebookShare}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 rounded-full transition-colors">
                <Facebook className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Share on Facebook</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share this property with your friends</p>
              </div>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 rounded-full transition-colors">
                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Share on WhatsApp</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send to WhatsApp contacts or groups</p>
              </div>
            </button>

            <button
              onClick={handleInstagramShare}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-pink-100 dark:bg-pink-900/30 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 rounded-full transition-colors">
                <Instagram className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Share on Instagram</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Copy link for Instagram post or story</p>
              </div>
            </button>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
