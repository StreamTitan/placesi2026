import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = 'Success!',
  message = 'Your action was completed successfully.'
}: SuccessModalProps) {
  const [confettiPieces, setConfettiPieces] = useState<Confetti[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const pieces: Confetti[] = [];

      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.3,
          duration: 2 + Math.random() * 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setConfettiPieces(pieces);

      setTimeout(() => setShowContent(true), 100);

      setTimeout(() => {
        setConfettiPieces([]);
      }, 3000);
    } else {
      setShowContent(false);
      setConfettiPieces([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto transform transition-all duration-300 ${
            showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className={`transform transition-all duration-500 ${showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
                <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={1.5} />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full bg-green-500/20 transform transition-all duration-700 ${
                  showContent ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {message}
            </p>

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>

      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="fixed top-0 w-2 h-2 animate-confetti pointer-events-none"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
