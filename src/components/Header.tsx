import { ThemeToggle } from "./ThemeToggle";
import { MapPin } from "lucide-react";
import { ReactNode } from "react";

interface HeaderProps {
  locationName: string;
  date: string;
  hijriDate: string;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  settingsButton?: ReactNode;
}

export function Header({
  locationName,
  date,
  hijriDate,
  darkMode,
  onDarkModeToggle,
  settingsButton,
}: HeaderProps) {
  return (
    <header className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-lg font-semibold truncate max-w-[220px]">{locationName}</span>
        </div>
        <div className="flex items-center gap-1">
          {settingsButton}
          <ThemeToggle darkMode={darkMode} onToggle={onDarkModeToggle} />
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-muted-foreground text-sm">{date}</p>
        <p className="text-muted-foreground/70 text-xs">{hijriDate}</p>
      </div>
    </header>
  );
}
