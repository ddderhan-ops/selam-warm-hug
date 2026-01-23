import { useTranslation } from "@/contexts/LanguageContext";

export function AdPlaceholder() {
  const { t } = useTranslation();
  
  return (
    <div className="w-full h-24 bg-muted/50 border border-border rounded-xl flex items-center justify-center mb-6">
      <span className="text-muted-foreground text-sm font-medium">
        {t.adPlaceholder}
      </span>
    </div>
  );
}
