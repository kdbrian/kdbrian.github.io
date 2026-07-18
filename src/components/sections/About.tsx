import { Github, Linkedin, MapPin } from "lucide-react";

const SKILLS = [
  "Kotlin", "Jetpack Compose", "MVVM", "Retrofit", "Room DB", "Coroutines", "Firebase", "Git",
];

export default function About() {
  return (
    <section className="animate-fade-up grid gap-10 py-14 sm:grid-cols-[220px_1fr] sm:py-20">
      <div className="flex flex-col items-center gap-4 sm:items-start">
        <img
          src="/profile.jpg"
          alt="Brian Kidiga"
          className="h-32 w-32 rounded-2xl object-cover ring-1 ring-line sm:h-40 sm:w-40"
        />
        <div className="flex gap-3 text-ink/50">
          <a href="https://github.com/kdbrian" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-ink">
            <Github size={18} />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-ink">
            <Linkedin size={18} />
          </a>
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm text-ink/50">
          <MapPin size={14} /> Earth 🌍
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Hey, I'm Brian 👋</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          A passionate <span className="font-medium text-accent">Android developer</span> crafting
          smooth, elegant mobile experiences — from pixel-perfect UIs to rock-solid architecture.
        </p>
        <p className="mt-3 max-w-xl text-ink/60">
          I live and breathe Kotlin, Jetpack Compose, and the Android ecosystem. When I'm not
          pushing commits, I'm exploring AI integrations, tinkering with backends, or making apps
          a little more delightful.
        </p>

        <p className="mb-2 mt-8 text-xs font-medium uppercase tracking-wide text-ink/40">
          Stack &amp; tools
        </p>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-line bg-white px-3 py-1 text-sm text-ink/70"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-8 inline-flex items-baseline gap-2 rounded-2xl border border-line bg-white px-5 py-3">
          <span className="font-display text-2xl font-semibold text-accent">3+</span>
          <span className="text-sm text-ink/50">years experience</span>
        </div>
      </div>
    </section>
  );
}
