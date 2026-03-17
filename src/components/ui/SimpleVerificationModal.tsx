import { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

export interface VisitorInfo {
  name: string;
  phone: string;
  email: string;
}

interface SimpleVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (visitorInfo: VisitorInfo) => void;
}

export function SimpleVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: SimpleVerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'info' | 'verify'>('info');

  useEffect(() => {
    if (isOpen) {
      generateCode();
      setUserInput('');
      setError('');
      setName('');
      setPhone('');
      setEmail('');
      setStep('info');
    }
  }, [isOpen]);

  const generateCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
  };

  const handleContinueToVerification = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setStep('verify');
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setError('');

    if (userInput.trim() === verificationCode) {
      setTimeout(() => {
        setIsVerifying(false);
        onVerified({ name, phone, email });
      }, 300);
    } else {
      setTimeout(() => {
        setError('Code does not match. Please try again.');
        setUserInput('');
        setIsVerifying(false);
      }, 300);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setUserInput(value);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userInput.length === 4) {
      handleVerify();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 'info' ? 'Your Contact Information' : 'Verify You\'re Human'}>
      <div className="space-y-6">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {step === 'info' ? (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Please provide your contact information so the agent can follow up with you.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPhone(value);
                    setError('');
                  }}
                  placeholder="868-123-4567"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinueToVerification}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                To complete verification, please enter the code displayed below:
              </p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-8 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Enter this code:
                </p>
                <div className="text-6xl font-bold text-green-600 dark:text-green-400 tracking-[0.5em] pl-4">
                  {verificationCode}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Code Here:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] pl-4 px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('info')}
                variant="outline"
                className="flex-1"
                disabled={isVerifying}
              >
                Back
              </Button>
              <Button
                onClick={handleVerify}
                className="flex-1"
                disabled={userInput.length !== 4 || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
