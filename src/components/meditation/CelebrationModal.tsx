import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'badge' | 'level';
  title: string;
  description: string;
  icon: string;
}

export const CelebrationModal = ({
  isOpen,
  onClose,
  type,
  title,
  description,
  icon,
}: CelebrationModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto border-none bg-gradient-to-b from-primary/10 to-background overflow-x-hidden">
        {/* Confetti particles */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center text-center py-6 relative z-10">
          {/* Glowing icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping-slow rounded-full bg-primary/20" />
            <div className="relative text-6xl animate-bounce-in celebration-icon">
              {icon}
            </div>
            {type === 'level' && (
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-spin-slow" />
            )}
          </div>

          {/* Title with animation */}
          <div className="animate-slide-up">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
              {type === 'badge' ? '🎉 Nova Conquista!' : '⭐ Subiu de Nível!'}
            </p>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {title}
            </h2>
            <p className="text-muted-foreground max-w-xs">
              {description}
            </p>
          </div>

          {/* Action button */}
          <Button
            onClick={onClose}
            className="mt-8 px-8 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            Incrível!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
