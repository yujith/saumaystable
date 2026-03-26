"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { getNextCutoff, getTimeUntilCutoff, isAfterCutoff } from "@/lib/cutoff";

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

  if (timeLeft === null) {
    return null; // Avoid hydration mismatch
  }

  if (afterCutoff) {
    return (
      <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <div className="container flex items-center justify-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-amber-800 font-medium">
            Orders placed now will be delivered next weekend
          </span>
        </div>
      </div>
    );
  }

  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Colour logic: green > 24h, yellow 4-24h, red < 4h
  const totalHours = totalSeconds / 3600;
  let colorClass: string;
  let bgClass: string;
  let borderClass: string;

  if (totalHours > 24) {
    colorClass = "text-green-800";
    bgClass = "bg-green-50";
    borderClass = "border-green-200";
  } else if (totalHours > 4) {
    colorClass = "text-yellow-800";
    bgClass = "bg-yellow-50";
    borderClass = "border-yellow-200";
  } else {
    colorClass = "text-red-800";
    bgClass = "bg-red-50";
    borderClass = "border-red-200";
  }

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${String(seconds).padStart(2, "0")}s`);

  return (
    <div className={`w-full ${bgClass} border-b ${borderClass} px-4 py-2.5`}>
      <div className="container flex items-center justify-center gap-2 text-sm">
        <Clock className={`h-4 w-4 ${colorClass}`} />
        <span className={`${colorClass} font-medium`}>
          Order by Thursday 7 PM &mdash;{" "}
          <span className="font-mono tabular-nums">{parts.join(" ")}</span> left
        </span>
      </div>
    </div>
  );
}
