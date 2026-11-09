/**
 * GitHub Gists Cloud Storage Client for BladeLab
 *
 * Provides cross-device cloud persistence and instant URL sharing using GitHub Gists.
 * Gists are stored under the user's GitHub account with 100% free storage, built-in Git
 * version history, and direct browser-to-GitHub HTTPS API calls (no backend server required).
 */

import { parseLoadedProjectJson, type WorkbenchSnapshot } from "./state.ts";

export const GITHUB_TOKEN_STORAGE_KEY = "bladelab.github_token";
export const BLADELAB_GIST_PREFIX = "[BladeLab] ";
export const BLADELAB_GIST_FILENAME = "bladelab-design.json";

export interface GitHubUser {
  login: string;
  name?: string;
  avatar_url?: string;
  html_url?: string;
}

export interface BladeLabGistSummary {
  id: string;
  name: string;
  description: string;
  updated_at: string;
  created_at: string;
  html_url: string;
  is_public: boolean;
  raw_url?: string;
}

/**
 * Retrieves the stored personal access token from localStorage.
 */
export function getStoredGitHubToken(): string | null {
  try {
    const token = localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY);
    return token ? token.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Stores or clears the personal access token in localStorage.
 */
export function setStoredGitHubToken(token: string | null): void {
  try {
    if (token && token.trim().length > 0) {
      localStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token.trim());
    } else {
      localStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore localStorage failures
  }
}

/**
 * Verifies the GitHub token against /user and returns the authenticated user profile.
 */
export async function verifyGitHubUser(token: string): Promise<GitHubUser> {
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.trim()}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!resp.ok) {
    if (resp.status === 401) {
      throw new Error("Invalid GitHub token. Please verify token permissions (needs 'gist' scope).");
    }
    throw new Error(`GitHub API error: ${resp.status} ${resp.statusText}`);
  }

  const data = (await resp.json()) as GitHubUser;
  return {
    login: data.login,
    name: data.name,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
  };
}

/**
 * Lists all BladeLab Gists for the authenticated user.
 */
export async function listBladeLabGists(token: string): Promise<BladeLabGistSummary[]> {
  const resp = await fetch("https://api.github.com/gists?per_page=100", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.trim()}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!resp.ok) {
    throw new Error(`Failed to list Gists: ${resp.status} ${resp.statusText}`);
  }

  const rawGists = (await resp.json()) as Array<{
    id: string;
    description: string | null;
    updated_at: string;
    created_at: string;
    html_url: string;
    public: boolean;
    files: Record<string, { filename: string; raw_url: string }>;
  }>;

  const results: BladeLabGistSummary[] = [];

  for (const g of rawGists) {
    const desc = g.description || "";
    const hasBladeLabFile = Boolean(g.files && g.files[BLADELAB_GIST_FILENAME]);
    const isBladeLabDesc = desc.startsWith(BLADELAB_GIST_PREFIX);

    if (hasBladeLabFile || isBladeLabDesc) {
      let displayName = desc;
      if (displayName.startsWith(BLADELAB_GIST_PREFIX)) {
        displayName = displayName.slice(BLADELAB_GIST_PREFIX.length).trim();
      }
      if (!displayName && hasBladeLabFile) {
        displayName = `Design-${g.id.slice(0, 7)}`;
      }

      results.push({
        id: g.id,
        name: displayName || "Untitled Blade",
        description: desc,
        updated_at: g.updated_at,
        created_at: g.created_at,
        html_url: g.html_url,
        is_public: g.public,
        raw_url: g.files[BLADELAB_GIST_FILENAME]?.raw_url,
      });
    }
  }

  return results;
}

/**
 * Saves a WorkbenchSnapshot to a GitHub Gist (create new or update existing).
 */
export async function saveBladeLabGist(
  token: string,
  name: string,
  snapshot: WorkbenchSnapshot,
  isPublic = false,
  existingGistId?: string
): Promise<{ id: string; html_url: string; description: string }> {
  const cleanName = name.trim() || `Rotor-R${snapshot.design.rotor.radius_mm}-B${snapshot.design.rotor.blade_count}`;
  const description = `${BLADELAB_GIST_PREFIX}${cleanName}`;
  const content = JSON.stringify(snapshot, null, 2);

  const payload: Record<string, unknown> = {
    description,
    files: {
      [BLADELAB_GIST_FILENAME]: {
        content,
      },
    },
  };

  const url = existingGistId
    ? `https://api.github.com/gists/${encodeURIComponent(existingGistId)}`
    : "https://api.github.com/gists";

  const method = existingGistId ? "PATCH" : "POST";

  if (!existingGistId) {
    payload.public = isPublic;
  }

  const resp = await fetch(url, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.trim()}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errorBody = await resp.text().catch(() => "");
    throw new Error(`Failed to save Gist (${resp.status}): ${errorBody || resp.statusText}`);
  }

  const data = (await resp.json()) as { id: string; html_url: string; description: string };
  return {
    id: data.id,
    html_url: data.html_url,
    description: data.description,
  };
}

/**
 * Fetches and parses a BladeLab design from a GitHub Gist by ID.
 * Works anonymously for public or unlisted gists; authenticated if token provided.
 */
export async function fetchBladeLabGist(
  gistId: string,
  token?: string | null
): Promise<{ name: string; snapshot: WorkbenchSnapshot; html_url: string }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const resp = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId.trim())}`, {
    headers,
  });

  if (!resp.ok) {
    if (resp.status === 404) {
      throw new Error(`Gist not found (${gistId}). Make sure the Gist ID is correct and accessible.`);
    }
    throw new Error(`GitHub error loading Gist (${resp.status}): ${resp.statusText}`);
  }

  const data = (await resp.json()) as {
    id: string;
    description: string | null;
    html_url: string;
    files: Record<string, { filename: string; content?: string; raw_url: string }>;
  };

  // Find the bladelab json file, or the first json file in the gist
  let jsonContent: string | null = null;

  if (data.files[BLADELAB_GIST_FILENAME]?.content) {
    jsonContent = data.files[BLADELAB_GIST_FILENAME].content;
  } else {
    for (const key of Object.keys(data.files)) {
      if (key.endsWith(".json")) {
        const fileObj = data.files[key];
        if (fileObj.content) {
          jsonContent = fileObj.content;
          break;
        } else if (fileObj.raw_url) {
          const rawResp = await fetch(fileObj.raw_url);
          if (rawResp.ok) {
            jsonContent = await rawResp.text();
            break;
          }
        }
      }
    }
  }

  if (!jsonContent) {
    throw new Error(`No JSON design file found in Gist ${gistId}.`);
  }

  const snapshot = parseLoadedProjectJson(jsonContent);
  let name = data.description || "";
  if (name.startsWith(BLADELAB_GIST_PREFIX)) {
    name = name.slice(BLADELAB_GIST_PREFIX.length).trim();
  }
  if (!name) {
    name = `Gist-${gistId.slice(0, 7)}`;
  }

  return {
    name,
    snapshot,
    html_url: data.html_url,
  };
}

/**
 * Deletes a Gist by ID.
 */
export async function deleteBladeLabGist(token: string, gistId: string): Promise<void> {
  const resp = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId.trim())}`, {
    method: "DELETE",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.trim()}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!resp.ok) {
    throw new Error(`Failed to delete Gist (${resp.status}): ${resp.statusText}`);
  }
}

/**
 * Builds a shareable URL to load this specific Gist in BladeLab.
 */
export function buildGistShareUrl(gistId: string): string {
  if (typeof window !== "undefined" && window.location) {
    const url = new URL(window.location.href);
    url.searchParams.set("gist", gistId.trim());
    return url.toString();
  }
  return `https://pannawat2008.github.io/BladeLab/?gist=${encodeURIComponent(gistId.trim())}`;
}
