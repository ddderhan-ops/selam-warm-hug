import { useState, useEffect } from "react";
import type { PrayerTime } from "@/lib/prayerTimes";
import { formatTimeRemaining } from "@/lib/prayerTimes";

interface CountdownTimerProps {
  nextPrayer: PrayerTime | null;
}

export function CountdownTimer({ nextPrayer }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState("00:00:00");

  useEffect(() => {
    if (!nextPrayer) return;

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(nextPrayer.timestamp));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer]);

  if (!nextPrayer) {
    return null;
  }

  return (
    <div className="text-center py-8 animate-slide-up">
      <p className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">
        Sonraki Vakit
      </p>
      <h2 className="text-2xl font-semibold text-primary mb-4">
        {nextPrayer.name}
      </h2>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <p className="relative text-6xl md:text-7xl font-bold tabular-nums countdown-glow text-foreground">
          {timeRemaining}
        </p>
      </div>
      <p className="text-muted-foreground text-sm mt-4">
        {nextPrayer.time} saatinde
      </p>
    </div>
  );
}
