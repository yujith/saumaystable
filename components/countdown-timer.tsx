"use client";

import { useState, useEffect } from "react";
import { getTimeUntilCutoff, isAfterCutoff } from "@/lib/cutoff";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [afterCutoff, setAfterCutoff] = useState(false);

  useEffect(() => {
    function update() {
      setAfterCutoff(isAfterCutoff());
      setTimeLeft(getTimeUntilCutoff());
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft === null) return null;

  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalHours = totalSeconds / 3600;

  // Timer colour: green >24h, amber 4-24h, red <4h
  let timerColor = "text-tertiary";
  if (totalHours <= 4) timerColor = "text-error";
  else if (totalHours <= 24) timerColor = "text-primary-container";

  const timeDisplay = [
    days > 0 ? `${days}d` : "",
    hours > 0 || days > 0 ? `${String(hours).padStart(2, "0")}h` : "",
    `${String(minutes).padStart(2, "0")}m`,
    `${String(seconds).padStart(2, "0")}s`,
  ]
    .filter(Boolean)
    .join(" ");

  if (afterCutoff) {
    return (
      <section className="mb-10 mx-6 max-w-screen-xl xl:mx-auto">
        <div className="relative overflow-hidden rounded-xl bg-primary-container/10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-headline font-bold mb-3 uppercase tracking-widest">
              Cutoff Passed
            </span>
            <h2 className="font-body text-2xl md:text-3xl text-on-surface mb-2">
              Orders now preparing for next weekend…
            </h2>
            <p className="font-body text-on-surface-variant leading-relaxed">
              You can still order ahead — your meals will be delivered the following Saturday or Sunday.
            </p>
          </div>
          <div className="z-10 glass-card px-8 py-5 rounded-xl border border-white/20 sun-shadow flex flex-col items-center min-w-[200px]">
            <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">
              Next Batch Opens
            </span>
            <span className="font-headline font-black text-4xl text-primary">Soon™</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10 mx-6 max-w-screen-xl xl:mx-auto">
      <div className="relative overflow-hidden rounded-xl bg-primary-container/10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10 max-w-xl">
          <span className="inline-block px-4 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-headline font-bold mb-3 uppercase tracking-widest">
            Live Kitchen Status
          </span>
          <h2 className="font-body text-2xl md:text-3xl text-on-surface mb-2">
            The pots are simmering…
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed">
            Place your order before Thursday 7 PM Sri Lanka time to catch this week&apos;s batch.
          </p>
        </div>

        <div className="z-10 glass-card px-8 py-6 rounded-xl border border-white/20 sun-shadow flex flex-col items-center min-w-[220px]">
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
            Ordering closes in
          </span>
          <div className={`font-headline font-black text-4xl tracking-tighter animate-breathing ${timerColor}`}>
            {timeDisplay}
          </div>
        </div>
      </div>
    </section>
  );
}
