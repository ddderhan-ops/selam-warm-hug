import { CitySelector } from "./CitySelector";
import { ThemeToggle } from "./ThemeToggle";
import type { City } from "@/lib/prayerTimes";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  selectedCity: City;
  onCityChange: (city: City) => void;
  date: string;
  hijriDate: string;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  notificationsEnabled: boolean;
  onNotificationToggle: () => void;
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
}: HeaderProps) {
  return (
    <header className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <CitySelector selectedCity={selectedCity} onCityChange={onCityChange} />
        <div className="flex items-center gap-1">
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
