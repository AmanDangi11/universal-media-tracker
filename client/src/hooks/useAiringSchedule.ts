import { useState, useEffect } from "react";
import { MediaItem, AiringSchedule, CalendarEntry } from "../types/media";

export function useAiringSchedule(mediaList: MediaItem[]) {
  const [airingCalendar, setAiringCalendar] = useState<CalendarEntry[]>([]);

  useEffect(() => {
    const calendarEntries: CalendarEntry[] = [];

    mediaList.forEach((item) => {
      if (item.currentProgress < item.totalProgress && item.nextAiringEpisode) {
        const date = new Date(item.nextAiringEpisode.airingAt * 1000);
        const timeLabel =
          date.toLocaleDateString([], { weekday: "short" }) +
          " " +
          date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

        const daysLeft = Math.ceil(item.nextAiringEpisode.timeUntilAiring / 3600 / 24);
        const noun = item.type === "ANIME" || item.type === "TV_SHOW" ? "Episode" : "Chapter";
        const actionVerb = item.type === "ANIME" || item.type === "TV_SHOW" ? "airs" : "releases";
        const actionGerund = item.type === "ANIME" || item.type === "TV_SHOW" ? "airing" : "releasing";

        let details = `${noun} ${item.nextAiringEpisode.episode} ${actionVerb} in ${daysLeft} days`;
        if (daysLeft <= 0) {
          details = `${noun} ${item.nextAiringEpisode.episode} is ${actionGerund} now/soon!`;
        } else if (daysLeft === 1) {
          details = `${noun} ${item.nextAiringEpisode.episode} ${actionVerb} tomorrow!`;
        }

        calendarEntries.push({
          id: item.id,
          title: item.title,
          schedule: {
            timeLabel,
            details
          }
        });
      }
    });

    setAiringCalendar(calendarEntries);
  }, [mediaList]);

  return { airingCalendar };
}
