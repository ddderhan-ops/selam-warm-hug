import { CitySelector } from "./CitySelector";
import { ThemeToggle } from "./ThemeToggle";
import type { City } from "@/lib/prayerTimes";
import { Bell, BellOff, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  selectedCity: City;
  onCityChange: (city: City) => void;
  date: string;
  hijriDate: string;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  notificationsEnabled: boolean;
  onNotificationToggle: () => void;
  useCurrentLocation?: boolean;
  onUseCurrentLocation?: () => void;
  hasLocationPermission?: boolean;
}

export function Header({
  selectedCity,
  onCityChange,
  date,
  hijriDate,
  theme,
  onThemeToggle,
  notificationsEnabled,
  onNotificationToggle,
  useCurrentLocation,
  onUseCurrentLocation,
  hasLocationPermission,
}: HeaderProps) {
  return (
    <header className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {hasLocationPermission && onUseCurrentLocation && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onUseCurrentLocation}
                  className={`rounded-full w-9 h-9 ${
                    useCurrentLocation
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <Navigation
                    className={`w-4 h-4 ${useCurrentLocation ? "fill-primary" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {useCurrentLocation
                  ? "Mevcut konum kullanılıyor"
                  : "Mevcut konumu kullan"}
              </TooltipContent>
            </Tooltip>
          )}
          <CitySelector
            selectedCity={selectedCity}
            onCityChange={onCityChange}
            disabled={useCurrentLocation}
          />
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationToggle}
                className="rounded-full w-10 h-10 hover:bg-secondary"
              >
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {notificationsEnabled
                ? "Bildirimler ve ezan sesi aktif"
                : "Bildirimleri aç"}
            </TooltipContent>
          </Tooltip>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-muted-foreground text-sm">{date}</p>
        <p className="text-muted-foreground/70 text-xs">{hijriDate}</p>
      </div>
    </header>
  );
}
