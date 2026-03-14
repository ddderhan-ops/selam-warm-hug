import { useEffect, useState } from 'react';
import { ArrowLeft, Compass, Navigation2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateQiblaDirection, calculateDistanceToKaaba } from '@/lib/qibla';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useTranslation } from '@/contexts/LanguageContext';

interface QiblaCompassProps {
  latitude: number | null;
  longitude: number | null;
  onBack: () => void;
}

export function QiblaCompass({ latitude, longitude, onBack }: QiblaCompassProps) {
  const { t } = useTranslation();
  const { heading, hasPermission, isSupported, requestPermission } = useDeviceOrientation();
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      setQiblaDirection(calculateQiblaDirection(latitude, longitude));
      setDistance(calculateDistanceToKaaba(latitude, longitude));
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (isSupported && !hasPermission) {
      requestPermission();
    }
  }, [isSupported, hasPermission, requestPermission]);

  // Calculate rotation angle for compass needle
  const needleRotation = qiblaDirection !== null && heading !== null
    ? qiblaDirection - heading
    : qiblaDirection || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">{t.qiblaCompass}</h1>
      </div>

      {/* Compass Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Compass */}
        <div className="relative w-72 h-72 mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          
          {/* Compass markings */}
          <div className="absolute inset-2 rounded-full border-2 border-border/50">
            {/* Cardinal directions */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">N</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</div>
          </div>

          {/* Inner compass face */}
          <div 
            className="absolute inset-8 rounded-full bg-gradient-to-b from-secondary to-muted flex items-center justify-center"
            style={{ 
              transform: heading !== null ? `rotate(${-heading}deg)` : 'rotate(0deg)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Compass lines */}
            {[...Array(36)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-3 bg-border/50"
                style={{
                  transform: `rotate(${i * 10}deg) translateY(-85px)`,
                }}
              />
            ))}
          </div>

          {/* Qibla indicator (Kaaba icon) */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
            style={{ 
              transform: `rotate(${needleRotation}deg)`,
            }}
          >
            <div className="absolute top-6 flex flex-col items-center">
              {/* Kaaba icon */}
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 border-2 border-primary-foreground rounded-sm" />
              </div>
              {/* Arrow pointing to Kaaba */}
              <Navigation2 className="w-6 h-6 text-primary fill-primary mt-1" />
            </div>
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary shadow-lg" />
          </div>
        </div>

        {/* Info Cards */}
        <div className="w-full max-w-xs space-y-3">
          {/* Qibla Direction */}
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.qiblaDirection}</p>
              <p className="text-xl font-semibold">
                {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '-'}
              </p>
            </div>
          </div>

          {/* Distance to Kaaba */}
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.distanceToKaaba}</p>
              <p className="text-xl font-semibold">
                {distance !== null ? `${distance.toLocaleString()} ${t.km}` : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Calibration hint */}
        {isSupported && !hasPermission && (
          <Button
            onClick={requestPermission}
            className="mt-6"
            variant="outline"
          >
            <Compass className="w-4 h-4 mr-2" />
            Pusula İzni Ver
          </Button>
        )}
        
        {!isSupported && (
          <p className="text-sm text-muted-foreground mt-6 text-center">
            Cihazınız pusula özelliğini desteklemiyor.
            <br />
            Kıble yönü: {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '-'}
          </p>
        )}
      </div>
    </div>
  );
}
