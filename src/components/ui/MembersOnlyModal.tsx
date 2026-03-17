import { Modal } from './Modal';
import { Button } from './Button';
import { MessageSquare, Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MembersOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MembersOnlyModal({ isOpen, onClose }: MembersOnlyModalProps) {
  const navigate = useNavigate();

  const handleSignUp = () => {
    onClose();
    navigate('/signup');
  };

  const handleSignIn = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
          <Lock className="w-8 h-8 text-green-600 dark:text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          AI Chat is a Members-Only Feature
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Register Today. It's Free!
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Intelligent Property Search
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chat naturally with our AI to discover properties that match your exact needs
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Personalized Recommendations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get tailored property suggestions based on your preferences and budget
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-500 text-xl font-bold">+</span>
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Save Your Conversations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access your chat history anytime to continue your property search
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSignUp}
            className="min-w-[160px]"
          >
            Sign Up Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSignIn}
            className="min-w-[160px]"
          >
            Sign In
          </Button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
}
