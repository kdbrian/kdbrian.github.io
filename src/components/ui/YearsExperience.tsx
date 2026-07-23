import { useEffect, useRef, useState } from "react";

const FIRST_COMMIT = new Date(2022, 0, 30); // Jan 30, 2022
const MS_PER_DAY = 86_400_000;

function calculateYoe(): number {
  const daysCoded = (Date.now() - FIRST_COMMIT.getTime()) / MS_PER_DAY;
  const years = daysCoded / 365.25;
  return Math.ceil(years * 2) / 2; // round up to the nearest half-year
}

function OdometerDigit({ char }: { char: string }) {
  if (!/[0-9]/.test(char)) {
    return <span className="inline-block">{char}</span>;
  }
  const digit = Number(char);
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-top">
      <span
        className="absolute inset-x-0 top-0 transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

// A slow, endless breathe: count up, hold at the real value, count back
// down, hold at zero, repeat — for as long as the card is in view and not
// being looked at. Hovering (or focusing) freezes it on the true value.
const PHASE_DURATIONS = { up: 3200, holdTop: 1800, down: 2600, holdBottom: 1000 } as const;
const PHASES = ["up", "holdTop", "down", "holdBottom"] as const;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function YearsExperience() {
  const target = useRef(calculateYoe()).current;
  const [value, setValue] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    if (hovered) {
      setValue(target);
      return;
    }

    let frame: number;
    let phaseIndex = 0;
    let phaseStart = performance.now();

    const tick = (now: number) => {
      const phase = PHASES[phaseIndex];
      const t = Math.min((now - phaseStart) / PHASE_DURATIONS[phase], 1);

      if (phase === "up") setValue(target * easeOutCubic(t));
      else if (phase === "down") setValue(target * (1 - easeOutCubic(t)));
      else if (phase === "holdTop") setValue(target);
      else setValue(0);

      if (t >= 1) {
        phaseIndex = (phaseIndex + 1) % PHASES.length;
        phaseStart = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [revealed, hovered, target]);

  const formatted = `${value.toFixed(1)}+`;

  return (
    <div
      ref={ref}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={`mt-8 inline-flex flex-col gap-1 rounded-2xl border border-line bg-white px-5 py-3 outline-none transition-[opacity,transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 ${
        revealed ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink/40">
        Years coding
      </p>
      <span className="group/tooltip relative inline-block w-fit">
        <span
          aria-hidden="true"
          className="font-display flex text-2xl font-semibold tabular-nums text-accent"
        >
          {formatted.split("").map((char, i) => (
            <OdometerDigit key={i} char={char} />
          ))}
        </span>
        <span className="sr-only">
          {formatted} years of experience.
        </span>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max max-w-[200px] -translate-x-1/2 translate-y-1 rounded-lg bg-ink px-2.5 py-1.5 text-[11px] leading-snug text-white opacity-0 shadow-lg transition-[opacity,transform] duration-200 ease-out group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100"
        >
          .
        </span>
      </span>
    </div>
  );
}
