import { getDailyVerse } from "@/lib/verses";
import { BookOpen } from "lucide-react";

export function DailyVerse() {
  const verse = getDailyVerse();

  return (
    <div className="bg-[hsl(var(--verse-bg))] border border-[hsl(var(--verse-border))] rounded-2xl p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-primary">Günün Ayeti</span>
      </div>
      
      <p className="font-arabic text-2xl text-foreground leading-relaxed text-right mb-4 direction-rtl">
        {verse.arabic}
      </p>
      
      <p className="text-foreground/90 text-base leading-relaxed mb-3">
        {verse.turkish}
      </p>
      
      <p className="text-muted-foreground text-sm">
        — {verse.source}
      </p>
    </div>
  );
}
