/**
 * Minimal YAML-ish frontmatter parser. Handles the flat key: value shape
 * the Studio writes — strings, numbers, booleans, and simple [a, b, c]
 * arrays. Not a general YAML parser on purpose: keeping this dependency-free
 * means it's safe to run in the browser bundle, not just at build time.
 */
export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const [, block, content] = match;
  const data: Record<string, unknown> = {};

  for (const line of block.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value: unknown = line.slice(idx + 1).trim();

    if (typeof value === "string") {
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else if (/^".*"$|^'.*'$/.test(value)) {
        value = value.slice(1, -1);
      } else if (value === "true" || value === "false") {
        value = value === "true";
      }
    }

    data[key] = value;
  }

  return { data, content: content.trim() };
}

export function stringifyFrontmatter(data: Record<string, unknown>, body: string): string {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: [${v.map((x) => `"${x}"`).join(", ")}]`;
      if (typeof v === "string") return `${k}: "${v.replace(/"/g, '\\"')}"`;
      return `${k}: ${v}`;
    });
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}
