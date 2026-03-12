import { getDailyVerse } from "@/lib/verses";
import { BookOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/contexts/LanguageContext";

const APP_URL = "https://selam-warm-hug.lovable.app";

export function DailyVerse() {
  const { t, language } = useTranslation();
  const verse = getDailyVerse(language);

  const handleShare = async () => {
    const shareText = `📖 ${t.dailyVerse}\n\n"${verse.arabic}"\n\n${verse.text}\n\n— ${verse.source}\n\n🕌 ${t.shareAppText}: ${APP_URL}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t.dailyVerse,
          text: shareText,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Ayet panoya kopyalandı!");
    } catch {
      toast.error("Kopyalama başarısız oldu");
    }
  };

  return (
    <div className="bg-[hsl(var(--verse-bg))] border border-[hsl(var(--verse-border))] rounded-2xl p-6 animate-slide-up relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">{t.dailyVerse}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="h-9 w-9 rounded-full hover:bg-primary/10"
          title={t.share}
        >
          <Share2 className="w-4 h-4 text-primary" />
        </Button>
      </div>

      <p className="font-arabic text-2xl text-foreground leading-relaxed text-right mb-4 direction-rtl">
        {verse.arabic}
      </p>

      <p className="text-foreground/90 text-base leading-relaxed mb-3">{verse.text}</p>

      <p className="text-muted-foreground text-sm">— {verse.source}</p>
    </div>
  );
}
