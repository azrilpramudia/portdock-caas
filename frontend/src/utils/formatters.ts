import { useSettingsStore } from "@/store/settings";

/**
 * Formats a given date using the globally configured timezone, date format, and time format.
 */
export function formatDateTime(dateInput: string | Date): { date: string; time: string } {
  if (!dateInput) return { date: "-", time: "-" };
  
  const date = new Date(dateInput);
  const { timezone, language, timeFormat } = useSettingsStore.getState().settings;
  
  const is24Hour = timeFormat === "24-hour" || timeFormat === "24h";
  const locale = language === "id" ? "id-ID" : "en-US";

  try {
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const timeFormatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone || "UTC",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !is24Hour,
    });
    
    return {
      date: dateFormatter.format(date),
      time: timeFormatter.format(date)
    };
  } catch (error) {
    // Fallback if timezone is invalid
    return {
      date: date.toLocaleDateString(locale),
      time: date.toLocaleTimeString(locale, { hour12: !is24Hour })
    };
  }
}
