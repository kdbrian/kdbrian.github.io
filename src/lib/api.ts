import { getValidToken, touchSession } from "@/lib/auth";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function call<T>(path: string, body: unknown, requireAuth = true): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (requireAuth) {
    const token = getValidToken();
    if (!token) throw new ApiError("Session expired — please log in again.", 401);
    headers.Authorization = `Bearer ${token}`;
    touchSession();
  }

  const res = await fetch(`${FUNCTIONS_URL}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  return data as T;
}

export const api = {
  login: (password: string) => call<{ token: string }>("auth", { password }, false),

  publishPost: (post: {
    slug: string;
    title: string;
    body: string;
    format: "html" | "markdown";
    excerpt?: string;
    tags?: string[];
    cover?: string;
    date?: string;
    isNew: boolean;
  }) => call<{ commitUrl: string }>("publish-blog", post),

  deletePost: (slug: string, deleteMedia: boolean) =>
    call<{ ok: true }>("delete-blog", { slug, deleteMedia }),

  publishProject: (project: {
    slug: string;
    title: string;
    description: string;
    images: string[];
    tags?: string[];
    repoUrl?: string;
    playStoreUrl?: string;
    featured?: boolean;
    isNew: boolean;
  }) => call<{ commitUrl: string }>("publish-project", project),

  deleteProject: (slug: string, deleteMedia: boolean) =>
    call<{ ok: true }>("delete-project", { slug, deleteMedia }),

  uploadMedia: (filename: string, base64: string, folder: "blog-images" | "projects", slug: string) =>
    call<{ path: string; url: string }>("upload-media", { filename, base64, folder, slug }),
};
