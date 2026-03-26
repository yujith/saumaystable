import { nextThursday, isBefore, isEqual, addWeeks, nextSaturday, nextSunday, startOfWeek } from "date-fns";

const SLST_TIMEZONE = "Asia/Colombo";
const CUTOFF_HOUR = 19; // 7:00 PM
const CUTOFF_MINUTE = 0;

/**
 * Get the current time in Sri Lanka Standard Time (Asia/Colombo).
 * Returns a Date object representing the current SLST time.
 */
function getNowInSLST(): Date {
  const now = new Date();
  const slstString = now.toLocaleString("en-US", { timeZone: SLST_TIMEZONE });
  return new Date(slstString);
}

/**
 * Returns the next Thursday 7:00 PM SLST as a Date object.
 * If it's currently Thursday before 7 PM SLST, returns today at 7 PM.
 * If it's Thursday at or after 7 PM, returns next Thursday at 7 PM.
 */
export function getNextCutoff(): Date {
  const nowSLST = getNowInSLST();

  const dayOfWeek = nowSLST.getDay(); // 0=Sun, 4=Thu
  const hour = nowSLST.getHours();
  const minute = nowSLST.getMinutes();

  let cutoffDate: Date;

  if (dayOfWeek === 4) {
    // It's Thursday
    const isPastCutoff =
      hour > CUTOFF_HOUR || (hour === CUTOFF_HOUR && minute >= CUTOFF_MINUTE);

    if (isPastCutoff) {
      // Next Thursday
      cutoffDate = nextThursday(nowSLST);
    } else {
      // Today
      cutoffDate = new Date(nowSLST);
    }
  } else {
    // Find the next Thursday
    cutoffDate = nextThursday(nowSLST);
  }

  cutoffDate.setHours(CUTOFF_HOUR, CUTOFF_MINUTE, 0, 0);
  return cutoffDate;
}

/**
 * Returns true if the current SLST time is at or after the next cutoff.
 * Used to determine if orders should be queued for the following week.
 */
export function isAfterCutoff(): boolean {
  const nowSLST = getNowInSLST();
  const dayOfWeek = nowSLST.getDay();
  const hour = nowSLST.getHours();
  const minute = nowSLST.getMinutes();

  // Only "after cutoff" matters between Thursday 7PM and the following Thursday
  // i.e., Thu 7PM through the weekend until next Thu 7PM
  // Actually: if we're past this Thursday's cutoff but before next Thursday's cutoff
  // We're after cutoff from Thursday 7PM through Saturday/Sunday delivery

  if (dayOfWeek === 4) {
    // Thursday — check time
    return hour > CUTOFF_HOUR || (hour === CUTOFF_HOUR && minute >= CUTOFF_MINUTE);
  }

  if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
    // Friday, Saturday, Sunday — always after cutoff for this week
    return true;
  }

  // Monday through Wednesday — before cutoff for this week's Thursday
  return false;
}

/**
 * Returns the delivery weekend dates based on the current cutoff state.
 */
export function getDeliveryWeek(): {
  deliverySat: Date;
  deliverySun: Date;
  deliveryWeekStart: Date;
  isNextWeek: boolean;
} {
  const nowSLST = getNowInSLST();
  const afterCutoff = isAfterCutoff();

  let targetSat: Date;
  let targetSun: Date;

  if (afterCutoff) {
    // Delivery is NEXT weekend (the one after the coming weekend)
    const sat = nextSaturday(nowSLST);
    const sun = nextSunday(nowSLST);

    // If it's currently Sat or Sun, nextSaturday/nextSunday gives us next week already
    // But if it's Thu/Fri after cutoff, we need to skip to the weekend after next
    const dayOfWeek = nowSLST.getDay();

    if (dayOfWeek === 4 || dayOfWeek === 5) {
      // Thursday (after cutoff) or Friday — skip to next weekend
      targetSat = addWeeks(sat, 1);
      targetSun = addWeeks(sun, 1);
    } else if (dayOfWeek === 6) {
      // Saturday — nextSaturday gives us next Sat, nextSunday gives tomorrow
      // We need the FOLLOWING weekend
      targetSat = addWeeks(sat, 1);
      targetSun = addWeeks(nextSunday(addWeeks(nowSLST, 1)), 0);
      // Simpler: just add 1 week to the next occurrences
      targetSat = nextSaturday(addWeeks(nowSLST, 1));
      targetSun = nextSunday(nowSLST); // tomorrow is Sunday, but we want next week's
      targetSun = addWeeks(targetSun, 1);
    } else {
      // Sunday — nextSaturday gives next Sat, nextSunday gives next Sun
      targetSat = addWeeks(sat, 1);
      targetSun = addWeeks(sun, 1);
    }
  } else {
    // Before cutoff — delivery is THIS coming weekend
    targetSat = nextSaturday(nowSLST);
    targetSun = nextSunday(nowSLST);
  }

  // delivery_week_start = Monday of the delivery week
  const deliveryWeekStart = startOfWeek(targetSat, { weekStartsOn: 1 });

  return {
    deliverySat: targetSat,
    deliverySun: targetSun,
    deliveryWeekStart,
    isNextWeek: afterCutoff,
  };
}

/**
 * Returns milliseconds until the next cutoff.
 */
export function getTimeUntilCutoff(): number {
  const nowSLST = getNowInSLST();
  const cutoff = getNextCutoff();
  return cutoff.getTime() - nowSLST.getTime();
}

/**
 * Format a date as a short delivery label: "Sat 15 Mar" or "Sun 16 Mar"
 */
export function formatDeliveryDate(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}
