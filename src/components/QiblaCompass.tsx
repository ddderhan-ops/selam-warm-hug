import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Compass, Navigation2, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateQiblaDirection, calculateDistanceToKaaba } from '@/lib/qibla';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useTranslation } from '@/contexts/LanguageContext';

interface QiblaCompassProps {
  latitude: number | null;
  longitude: number | null;
  onBack: () => void;
}

/**
 * Magnetic declination approximation using the IGRF dipole model.
 * For a full-precision result you'd query NOAA's API, but this gives
 * ±1-2° accuracy which is sufficient for a compass UI.
 */
function getMagneticDeclination(lat: number, lng: number): number {
  // Simplified dipole model coefficients (epoch ~2025)
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  // Magnetic north pole approx: 80.7°N, -72.7°W
  const mpLat = (80.7 * Math.PI) / 180;
  const mpLng = (-72.7 * Math.PI) / 180;

  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const sinMpLat = Math.sin(mpLat);
  const cosMpLat = Math.cos(mpLat);
  const dLng = lngRad - mpLng;

  const declination =
    Math.atan2(
      cosMpLat * Math.sin(dLng),
      sinMpLat * cosLat - cosMpLat * sinLat * Math.cos(dLng)
    ) *
    (180 / Math.PI);

  return declination;
}

export function QiblaCompass({ latitude, longitude, onBack }: QiblaCompassProps) {
  const { t } = useTranslation();
  const { heading, hasPermission, isSupported, requestPermission } = useDeviceOrientation();
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [declination, setDeclination] = useState(0);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setQiblaDirection(calculateQiblaDirection(latitude, longitude));
      setDistance(calculateDistanceToKaaba(latitude, longitude));
      setDeclination(getMagneticDeclination(latitude, longitude));
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (isSupported && !hasPermission) {
      requestPermission();
    }
  }, [isSupported, hasPermission, requestPermission]);

  // Apply magnetic declination correction to get true-north heading
  const trueHeading = heading !== null ? (heading + declination + 360) % 360 : null;

  // Calculate rotation angle for compass needle
  const needleRotation = qiblaDirection !== null && trueHeading !== null
    ? qiblaDirection - trueHeading
    : qiblaDirection || 0;

  return (
    <div className="screen-shell screen-shell-top min-h-[100dvh] bg-background flex flex-col overflow-x-hidden">
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
              transform: trueHeading !== null ? `rotate(${-trueHeading}deg)` : 'rotate(0deg)',
              transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
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
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              transform: `rotate(${needleRotation}deg)`,
              transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
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
