import { useState } from 'react';
import { X, Phone, Mail, MessageCircle, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { SimpleVerificationModal, type VisitorInfo } from '../ui/SimpleVerificationModal';
import { formatPhoneNumber } from '../../lib/formatters';
import { trackContractorClick } from '../../services/contractorManagement';
import { supabase } from '../../lib/supabase';

interface ContractorContactInfo {
  id: string;
  company_name: string;
  logo_url?: string | null;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website_url?: string;
}

interface ContractorContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contractor: ContractorContactInfo;
}

export function ContractorContactDrawer({ isOpen, onClose, contractor }: ContractorContactDrawerProps) {
  const [showVerification, setShowVerification] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    method: 'call' | 'whatsapp' | 'email' | 'website';
    action: () => void;
  } | null>(null);

  if (!isOpen) return null;

  const checkAuthAndProceed = async (contactMethod: 'call' | 'whatsapp' | 'email' | 'website', action: () => void) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setPendingAction({ method: contactMethod, action });
      setShowVerification(true);
    } else {
      try {
        await trackContractorClick(contractor.id, contactMethod);
      } catch (error) {
        console.error('Error tracking contact:', error);
      }
      action();
    }
  };

  const handlePhoneClick = () => {
    if (contractor.phone) {
      checkAuthAndProceed('call', () => {
        window.location.href = `tel:${contractor.phone}`;
      });
    }
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = contractor.whatsapp || contractor.phone;
    if (whatsappNumber) {
      checkAuthAndProceed('whatsapp', () => {
        const cleanNumber = whatsappNumber.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanNumber}`, '_blank');
      });
    }
  };

  const handleEmailClick = () => {
    if (contractor.email) {
      checkAuthAndProceed('email', () => {
        window.location.href = `mailto:${contractor.email}`;
      });
    }
  };

  const handleWebsiteClick = () => {
    if (contractor.website_url) {
      checkAuthAndProceed('website', () => {
        window.open(contractor.website_url!, '_blank');
      });
    }
  };

  const handleVerified = async (visitorInfo: VisitorInfo) => {
    setShowVerification(false);
    if (pendingAction) {
      try {
        await trackContractorClick(contractor.id, pendingAction.method);
      } catch (error) {
        console.error('Error tracking contact:', error);
      }
      pendingAction.action();
      setPendingAction(null);
    }
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
    setPendingAction(null);
  };

  return (
    <>
      <SimpleVerificationModal
        isOpen={showVerification}
        onClose={handleVerificationClose}
        onVerified={handleVerified}
      />
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Contractor</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="mb-6 flex items-center gap-4">
            {contractor.logo_url ? (
              <img
                src={contractor.logo_url}
                alt={contractor.company_name}
                className="w-16 h-16 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg p-2"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {contractor.company_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{contractor.company_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Choose how you'd like to connect</p>
            </div>
          </div>

          <div className="space-y-3">
            {contractor.phone && (
              <button
                onClick={handlePhoneClick}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 rounded-full transition-colors">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Phone Call</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatPhoneNumber(contractor.phone)}</p>
                </div>
              </button>
            )}

            {(contractor.whatsapp || contractor.phone) && (
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 rounded-full transition-colors">
                  <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">WhatsApp</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatPhoneNumber(contractor.whatsapp || contractor.phone!)}</p>
                </div>
              </button>
            )}

            {contractor.email && (
              <button
                onClick={handleEmailClick}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 rounded-full transition-colors">
                  <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{contractor.email}</p>
                </div>
              </button>
            )}

            {contractor.website_url && (
              <button
                onClick={handleWebsiteClick}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 rounded-full transition-colors">
                  <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Website</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Visit our website</p>
                </div>
              </button>
            )}
          </div>

          {!contractor.phone && !contractor.whatsapp && !contractor.email && !contractor.website_url && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No contact information available</p>
            </div>
          )}

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
