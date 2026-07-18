import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "About", end: true },
  { to: "/#education", label: "Education", end: false },
  { to: "/projects", label: "Projects", end: false },
  { to: "/activity", label: "Activity", end: false },
  { to: "/blog", label: "Blog", end: false },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <a href="/" className="font-display text-lg font-semibold tracking-tight">
          Brian<span className="text-accent">.</span>
        </a>
        <nav className="flex items-center gap-1 rounded-full border border-line bg-white/60 px-1.5 py-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <a
          href="https://github.com/kdbrian"
          target="_blank"
          rel="noreferrer"
          className="hidden text-sm font-medium text-ink/60 hover:text-ink sm:block"
        >
          GitHub ↗
        </a>
      </div>
    </header>
  );
}
