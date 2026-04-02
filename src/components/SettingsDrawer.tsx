import { Bell, BellOff, Volume2, VolumeX, Globe, Palette } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { languageNames, type Language } from '@/lib/i18n';
import type { Theme } from '@/hooks/useTheme';

interface SettingsDrawerProps {
  notificationsEnabled: boolean;
  onNotificationToggle: () => void;
  soundAlertEnabled: boolean;
  onSoundAlertToggle: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function SettingsDrawer({
  notificationsEnabled,
  onNotificationToggle,
  soundAlertEnabled,
  onSoundAlertToggle,
  theme,
  onThemeChange,
}: SettingsDrawerProps) {
  const { t, language, setLanguage } = useTranslation();

  const languages: Language[] = ['tr', 'en', 'de', 'fr', 'ar'];

  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'ocean', label: 'Ocean Blue' },
    { value: 'midnight', label: 'Midnight' },
  ];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10 hover:bg-secondary"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>{t.settings}</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 space-y-6 pb-8">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="font-medium">{t.notifications}</span>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={onNotificationToggle}
              />
            </div>

            {/* Sound Alert */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundAlertEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <span className="font-medium block">{t.soundAlert}</span>
                  <span className="text-xs text-muted-foreground">{t.soundAlertDesc}</span>
                </div>
              </div>
              <Switch
                checked={soundAlertEnabled}
                onCheckedChange={onSoundAlertToggle}
              />
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{t.themeLabel || 'Tema'}</span>
              </div>
              <Select value={theme} onValueChange={(v) => onThemeChange(v as Theme)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{t.language}</span>
              </div>
              <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {languageNames[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
