import { GraduationCap } from "lucide-react";

export default function Education() {
  return (
    <section id="education" className="animate-fade-up py-14 scroll-mt-24">
      <h2 className="mb-6 text-xs font-medium uppercase tracking-wide text-ink/40">Education</h2>
      <div className="card flex items-start gap-4 p-6">
        <div className="rounded-xl bg-accent-soft p-3 text-accent">
          <GraduationCap size={22} />
        </div>
        <div>
          <p className="font-semibold">B.Sc. Computer Science</p>
          <p className="text-accent">Karatina University</p>
          <p className="text-sm text-ink/50">2020 – 2024</p>
          <p className="mt-2 text-sm text-ink/70">
            Graduated with honours. Focused on software engineering, algorithms, and distributed
            systems.
          </p>
        </div>
      </div>
    </section>
  );
}
