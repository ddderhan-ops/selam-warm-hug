import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationPermissionCardProps {
  onRequestLocation: () => void;
  loading?: boolean;
}

export function LocationPermissionCard({
  onRequestLocation,
  loading,
}: LocationPermissionCardProps) {
  return (
    <div className="bg-secondary/50 border border-border rounded-2xl p-6 text-center animate-slide-up">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">Konum İzni Gerekli</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Bulunduğunuz konuma göre doğru namaz vakitlerini görmek için konum
        izninize ihtiyacımız var.
      </p>
      <Button
        onClick={onRequestLocation}
        disabled={loading}
        className="bg-primary hover:bg-primary/90"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Konum Alınıyor...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            Konum İzni Ver
          </>
        )}
      </Button>
    </div>
  );
}
