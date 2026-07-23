import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import type { HistoryEntry } from "@/types/content";
import { fetchHistoryEntries } from "@/lib/history";

function formatYear(date: string) {
  return date.slice(0, 4);
}

export default function Education() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetchHistoryEntries("education").then(setEntries).catch(() => {});
  }, []);

  if (entries.length === 0) return null;

  return (
    <section id="education" className="animate-fade-up py-14 scroll-mt-24">
      <h2 className="mb-6 text-xs font-medium uppercase tracking-wide text-ink/40">Education</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="card flex items-start gap-4 p-6">
            <div className="rounded-xl bg-accent-soft p-3 text-accent">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="font-semibold">{entry.title}</p>
              <p className="text-accent">{entry.org}</p>
              <p className="text-sm text-ink/50">
                {formatYear(entry.startDate)} – {entry.endDate ? formatYear(entry.endDate) : "Present"}
              </p>
              {entry.description && <p className="mt-2 text-sm text-ink/70">{entry.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
