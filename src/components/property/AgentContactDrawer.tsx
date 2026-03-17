import { useState } from 'react';
import { X, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { SimpleVerificationModal, type VisitorInfo } from '../ui/SimpleVerificationModal';
import { formatPhoneNumber } from '../../lib/formatters';
import { trackContactRequest } from '../../services/contactTracking';
import { supabase } from '../../lib/supabase';

interface AgentContactInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
}

interface AgentContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentContactInfo;
  listingId?: string;
}

export function AgentContactDrawer({ isOpen, onClose, agent, listingId }: AgentContactDrawerProps) {
  const [showVerification, setShowVerification] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    method: 'phone' | 'whatsapp' | 'email';
    action: () => void;
  } | null>(null);

  if (!isOpen) return null;

  const checkAuthAndProceed = async (contactMethod: 'phone' | 'whatsapp' | 'email', action: () => void) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setPendingAction({ method: contactMethod, action });
      setShowVerification(true);
    } else {
      try {
        await trackContactRequest({
          agentId: agent.id,
          agentName: agent.name,
          contactMethod,
          listingId,
        });
      } catch (error) {
        console.error('Error tracking contact:', error);
      }
      action();
    }
  };

  const handlePhoneClick = () => {
    if (agent.phone) {
      checkAuthAndProceed('phone', () => {
        window.location.href = `tel:${agent.phone}`;
      });
    }
  };

  const handleWhatsAppClick = () => {
    if (agent.whatsapp) {
      checkAuthAndProceed('whatsapp', () => {
        const cleanNumber = agent.whatsapp!.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanNumber}`, '_blank');
      });
    }
  };

  const handleEmailClick = () => {
    if (agent.email) {
      checkAuthAndProceed('email', () => {
        window.location.href = `mailto:${agent.email}`;
      });
    }
  };

  const handleVerified = async (visitorInfo: VisitorInfo) => {
    setShowVerification(false);
    if (pendingAction) {
      try {
        await trackContactRequest({
          agentId: agent.id,
          agentName: agent.name,
          contactMethod: pendingAction.method,
          listingId,
          visitorInfo: {
            name: visitorInfo.name,
            phone: visitorInfo.phone,
            email: visitorInfo.email,
          },
        });
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Agent</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">Reach out to {agent.name}</p>
          </div>

          <div className="space-y-3">
            {agent.phone && (
              <button
                onClick={handlePhoneClick}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 rounded-full transition-colors">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Phone Call</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatPhoneNumber(agent.phone)}</p>
                </div>
              </button>
            )}

            {agent.whatsapp && (
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 rounded-full transition-colors">
                  <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">WhatsApp</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatPhoneNumber(agent.whatsapp)}</p>
                </div>
              </button>
            )}

            {agent.email && (
              <button
                onClick={handleEmailClick}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 rounded-full transition-colors">
                  <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{agent.email}</p>
                </div>
              </button>
            )}
          </div>

          {!agent.phone && !agent.whatsapp && !agent.email && (
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
