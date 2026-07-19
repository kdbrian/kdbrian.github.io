import { Heart, Music2, Pause, Play, Search, SkipBack } from "lucide-react";

const SpotifyLogo = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34a.75.75 0 01-1.02.26c-2.79-1.71-6.3-2.1-10.44-1.14a.75.75 0 11-.33-1.464c4.53-1.04 8.42-.6 11.55 1.32a.75.75 0 01.24 1.024zm1.47-3.27a.938.938 0 01-1.29.31c-3.2-1.97-8.07-2.54-11.85-1.39a.938.938 0 11-.545-1.795c4.31-1.31 9.68-.67 13.36 1.6a.938.938 0 01.325 1.275zm.127-3.404c-3.84-2.28-10.17-2.49-13.83-1.38a1.125 1.125 0 11-.653-2.153c4.2-1.275 11.19-1.03 15.6 1.59a1.125 1.125 0 01-1.117 1.943z" />
  </svg>
);

const nowPlaying = {
  title: "Be Kind",
  artist: "Marshmello, Halsey",
  elapsed: "00:32",
  duration: "03:24",
  progress: 16,
};

const nextUp = {
  title: "Break My Heart",
  artist: "Dua Lipa",
};

export default function Listening() {
  return (
    <section id="listening" className="animate-fade-up py-14 scroll-mt-24">
      <h2 className="mb-6 text-xs font-medium uppercase tracking-wide text-ink/40">Listening</h2>

      <div className="max-w-sm rounded-[28px] bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 p-[3px] shadow-lg shadow-orange-900/10">
        <div className="rounded-[26px] bg-gradient-to-br from-zinc-800/95 to-zinc-900/95 p-5 text-white backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Music2 size={26} className="text-white/70" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-semibold">{nowPlaying.title}</p>
              <p className="truncate text-sm text-white/60">{nowPlaying.artist}</p>
            </div>
            <SpotifyLogo size={22} className="shrink-0 text-green-500" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-6">
            <SkipBack size={20} className="text-white/70" fill="currentColor" />
            <button
              type="button"
              aria-label="Play or pause"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-900"
            >
              <Pause size={20} fill="currentColor" />
            </button>
          </div>

          <div className="mt-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white" style={{ width: `${nowPlaying.progress}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-white/50">
              <span>{nowPlaying.elapsed}</span>
              <span>{nowPlaying.duration}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm text-white/80"
            >
              <Search size={16} /> Search
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm text-white/80"
            >
              <Heart size={16} /> Liked
            </button>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Next up</p>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Music2 size={16} className="text-white/60" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{nextUp.title}</p>
                <p className="truncate text-xs text-white/50">{nextUp.artist}</p>
              </div>
              <Play size={16} className="shrink-0 text-white/50" fill="currentColor" />
            </div>
          </div>

          <p className="mt-4 text-center text-xs font-medium text-white/30">Spotify</p>
        </div>
      </div>
    </section>
  );
}
