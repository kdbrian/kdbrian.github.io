import type { ActivityEntry } from "@/types/content";
import raw from "@/content/activity/updates.json?raw";

function loadManualActivity(): ActivityEntry[] {
  try {
    const entries = JSON.parse(raw) as ActivityEntry[];
    return entries.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  } catch (err) {
    console.warn("Could not parse activity/updates.json:", err);
    return [];
  }
}

export const manualActivity = loadManualActivity();
