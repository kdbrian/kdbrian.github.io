interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

function getConfig(): GithubConfig {
  const token = Deno.env.get("GITHUB_TOKEN");
  const owner = Deno.env.get("GITHUB_OWNER");
  const repo = Deno.env.get("GITHUB_REPO");
  const branch = Deno.env.get("GITHUB_BRANCH") || "master";

  if (!token || !owner || !repo) {
    throw new Error("Missing GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO secrets.");
  }
  return { token, owner, repo, branch };
}

function api(path: string) {
  const { owner, repo } = getConfig();
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
}

function authHeaders() {
  const { token } = getConfig();
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "blog-studio-edge-function",
  };
}

function toBase64(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/** Returns the file's sha if it exists, or null if it doesn't (404). */
export async function getFileSha(path: string): Promise<string | null> {
  const { branch } = getConfig();
  const res = await fetch(`${api(path)}?ref=${branch}`, { headers: authHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed for ${path}: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.sha as string;
}

/** Creates or updates a text or base64-encoded file. */
export async function putFile(
  path: string,
  content: string | Uint8Array,
  message: string,
  isBase64Encoded = false
): Promise<{ commitUrl: string }> {
  const { branch } = getConfig();
  const sha = await getFileSha(path);

  const res = await fetch(api(path), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      message,
      branch,
      sha: sha ?? undefined,
      content: isBase64Encoded ? (content as string) : toBase64(content as string),
    }),
  });

  if (!res.ok) throw new Error(`GitHub write failed for ${path}: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { commitUrl: data.commit?.html_url ?? "" };
}

export async function deleteFile(path: string, message: string): Promise<void> {
  const { branch } = getConfig();
  const sha = await getFileSha(path);
  if (!sha) return; // already gone

  const res = await fetch(api(path), {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ message, branch, sha }),
  });

  if (!res.ok) throw new Error(`GitHub delete failed for ${path}: ${res.status} ${await res.text()}`);
}

/** Lists files directly inside a directory (non-recursive — fine for our flat media folders). */
export async function listDir(path: string): Promise<{ path: string }[]> {
  const { branch } = getConfig();
  const res = await fetch(`${api(path)}?ref=${branch}`, { headers: authHeaders() });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list failed for ${path}: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map((f: any) => ({ path: f.path })) : [];
}

/** Deletes every file in a directory — used for "also delete media" on post/project delete. */
export async function deleteDir(path: string, message: string): Promise<void> {
  const files = await listDir(path);
  for (const file of files) {
    await deleteFile(file.path, message);
  }
}
