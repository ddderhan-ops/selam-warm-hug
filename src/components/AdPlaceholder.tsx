import { useEffect } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { showBanner, hideBanner, isNativePlatform } from "@/lib/admob";

export function AdPlaceholder() {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isNativePlatform()) return;
    void showBanner();
    return () => {
      void hideBanner();
    };
  }, []);

  // On native, the real AdMob banner is overlaid by the OS at the bottom.
  // We still render a spacer on web so the layout shows where ads will be.
  if (isNativePlatform()) {
    return <div className="w-full h-16 mb-6" aria-hidden="true" />;
  }

  return (
    <div className="w-full h-24 bg-muted/50 border border-border rounded-xl flex items-center justify-center mb-6">
      <span className="text-muted-foreground text-sm font-medium">
        {t.adPlaceholder}
      </span>
    </div>
  );
}
