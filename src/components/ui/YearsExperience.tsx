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
        className="absolute inset-x-0 top-0 transition-transform duration-150 ease-out"
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

export default function YearsExperience() {
  const target = useRef(calculateYoe()).current;
  const [value, setValue] = useState(0);
  const [revealed, setRevealed] = useState(false);
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
    const duration = 1400;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [revealed, target]);

  const formatted = `${value.toFixed(1)}+`;

  return (
    <div
      ref={ref}
      className={`mt-8 inline-flex flex-col gap-1 rounded-2xl border border-line bg-white px-5 py-3 transition-[opacity,transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 ${
        revealed ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink/40">
        Years coding
      </p>
      <span
        aria-hidden="true"
        className="font-display flex text-2xl font-semibold tabular-nums text-accent"
      >
        {formatted.split("").map((char, i) => (
          <OdometerDigit key={i} char={char} />
        ))}
      </span>
      <span className="sr-only">
        {formatted} years of experience, calculated from days elapsed since my first commit
      </span>
      <p className="text-[11px] leading-snug text-ink/40">
        every day tallied since my first commit &middot; Jan 30, 2022, rounded up
      </p>
    </div>
  );
}
