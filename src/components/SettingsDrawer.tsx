import { Bell, BellOff, Volume2, VolumeX, Globe, Palette, Clock, Play, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { languageNames, type Language } from '@/lib/i18n';
import {
  type ColorTheme,
  type AlertSound,
  ALERT_SOUND_FILES,
  ALERT_SOUND_LABELS,
} from '@/hooks/useTheme';

interface SettingsDrawerProps {
  notificationsEnabled: boolean;
  onNotificationToggle: () => void;
  soundAlertEnabled: boolean;
  onSoundAlertToggle: () => void;
  preAlertEnabled: boolean;
  onPreAlertToggle: () => void;
  colorTheme: ColorTheme;
  onColorThemeChange: (theme: ColorTheme) => void;
  preAlertMinutes: number;
  onPreAlertMinutesChange: (min: number) => void;
  alertSound: AlertSound;
  onAlertSoundChange: (sound: AlertSound) => void;
  onPreviewSound: (path: string) => void;
  autoDarkMode: boolean;
  onAutoDarkModeToggle: () => void;
}

export function SettingsDrawer({
  notificationsEnabled,
  onNotificationToggle,
  soundAlertEnabled,
  onSoundAlertToggle,
  preAlertEnabled,
  onPreAlertToggle,
  colorTheme,
  onColorThemeChange,
  preAlertMinutes,
  onPreAlertMinutesChange,
  alertSound,
  onAlertSoundChange,
  onPreviewSound,
  autoDarkMode,
  onAutoDarkModeToggle,
}: SettingsDrawerProps) {
  const { t, language, setLanguage } = useTranslation();

  const languages: Language[] = ['tr', 'en', 'de', 'fr', 'ar', 'es', 'pt'];

  const themeOptions: { value: ColorTheme; label: string }[] = [
    { value: 'default', label: t.themeDefault || 'Varsayılan' },
    { value: 'ocean', label: t.themeOcean || 'Deniz Mavisi' },
    { value: 'bronze', label: t.themeBronze || 'Beyaz & Bronz' },
  ];

  const soundOptions: AlertSound[] = ['uyari', 'uyari1', 'uyari2', 'uyari3'];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-secondary">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md max-h-[80vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>{t.settings}</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 space-y-5 pb-8">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notificationsEnabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
                <span className="font-medium">{t.notifications}</span>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={onNotificationToggle} />
            </div>

            {/* Sound Alert (Master) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundAlertEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                <div>
                  <span className="font-medium block">{t.soundAlert}</span>
                  <span className="text-xs text-muted-foreground">{t.soundAlertDesc}</span>
                </div>
              </div>
              <Switch checked={soundAlertEnabled} onCheckedChange={onSoundAlertToggle} />
            </div>

            {/* Pre-Alert Toggle + Minutes Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium block">{t.preAlert}</span>
                  </div>
                </div>
                <Switch checked={preAlertEnabled} onCheckedChange={onPreAlertToggle} />
              </div>
              {preAlertEnabled && (
                <div className="pl-8 pr-2">
                  <Slider
                    value={[preAlertMinutes]}
                    onValueChange={([v]) => onPreAlertMinutesChange(v)}
                    min={1}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {t.preAlertDesc.replace('{min}', String(preAlertMinutes))}
                  </p>
                </div>
              )}
            </div>

            {/* Alert Sound Selector */}
            {preAlertEnabled && (
              <div className="space-y-2 pl-8">
                <span className="text-sm font-medium text-muted-foreground">{t.alertSoundLabel}</span>
                <div className="space-y-1.5">
                  {soundOptions.map((key) => (
                    <div key={key} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="alertSound"
                          checked={alertSound === key}
                          onChange={() => onAlertSoundChange(key)}
                          className="accent-primary"
                        />
                        <span className="text-sm">{ALERT_SOUND_LABELS[key]}</span>
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={() => onPreviewSound(ALERT_SOUND_FILES[key])}
                      >
                        <Play className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{t.themeLabel}</span>
              </div>
              <Select value={colorTheme} onValueChange={(v) => onColorThemeChange(v as ColorTheme)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="font-medium block">{t.autoDarkMode}</span>
                  <span className="text-xs text-muted-foreground">{t.autoDarkModeDesc}</span>
                </div>
              </div>
              <Switch checked={autoDarkMode} onCheckedChange={onAutoDarkModeToggle} />
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
                    <SelectItem key={lang} value={lang}>{languageNames[lang]}</SelectItem>
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
