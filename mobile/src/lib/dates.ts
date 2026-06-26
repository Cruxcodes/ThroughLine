/** Date helpers for the Today screen's calendar strip and headings. */

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export interface WeekDay {
  label: string;
  date: number;
  isToday: boolean;
}

/** The current week (Sunday–Saturday), with today flagged. */
export function getWeekDates(): WeekDay[] {
  const today = new Date();
  const dow = today.getDay();
  return DAY_LABELS.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + i);
    return { label, date: d.getDate(), isToday: i === dow };
  });
}

/** Today as e.g. "Thursday 11 June". */
export function formatTodayLong(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
