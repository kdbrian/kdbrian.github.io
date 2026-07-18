import { useEffect, useState } from "react";
import { Github, Linkedin, Twitter, Instagram, Youtube, Mail, Link as LinkIcon } from "lucide-react";
import { fetchSocialLinks } from "@/lib/social";
import type { SocialLink } from "@/types/content";

function iconFor(url: string) {
  if (url.startsWith("mailto:")) return Mail;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("github.com")) return Github;
    if (host.includes("linkedin.com")) return Linkedin;
    if (host.includes("twitter.com") || host.includes("x.com")) return Twitter;
    if (host.includes("instagram.com")) return Instagram;
    if (host.includes("youtube.com")) return Youtube;
  } catch {
    /* fall through to generic icon */
  }
  return LinkIcon;
}

export default function Footer() {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetchSocialLinks().then(setLinks).catch(() => {});
  }, []);

  return (
    <footer className="mx-auto max-w-content px-6 py-10 text-sm text-ink/30">
      {links.length > 0 && (
        <div className="mb-4 flex gap-4">
          {links.map((link) => {
            const Icon = iconFor(link.url);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label || link.url}
                className="text-ink/50 hover:text-ink"
              >
                <Icon size={18} />
              </a>
            );
          })}
        </div>
      )}
      © {new Date().getFullYear()} Brian Kidiga
    </footer>
  );
}
