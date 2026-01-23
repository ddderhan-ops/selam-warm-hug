import { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'fadeOut'>('logo');

  useEffect(() => {
    const logoTimer = setTimeout(() => setPhase('text'), 500);
    const textTimer = setTimeout(() => setPhase('fadeOut'), 1500);
    const completeTimer = setTimeout(() => onComplete(), 2000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-primary flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated Crescent Moon Logo */}
      <div 
        className={`relative mb-8 transition-all duration-700 ${
          phase === 'logo' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative w-24 h-24">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-primary-foreground/20 blur-xl animate-pulse" />
          
          {/* Moon icon */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Moon className="w-16 h-16 text-primary-foreground fill-primary-foreground/30" />
          </div>
          
          {/* Stars around */}
          <div className="absolute -top-2 -right-2 w-2 h-2 bg-primary-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute top-4 -right-4 w-1.5 h-1.5 bg-primary-foreground/80 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="absolute -top-4 right-4 w-1 h-1 bg-primary-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>

      {/* App Name */}
      <div 
        className={`text-center transition-all duration-700 delay-200 ${
          phase === 'logo' ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">
          Nur Ezan Vakti
        </h1>
        <p className="text-primary-foreground/70 text-sm">
          Namaz Vakitleri
        </p>
      </div>

      {/* Loading indicator */}
      <div 
        className={`mt-12 transition-all duration-500 delay-500 ${
          phase === 'text' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
