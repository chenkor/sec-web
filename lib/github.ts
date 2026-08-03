import baked from "@/lib/release.generated.json";
import { SITE, apkUrlFromVersionLabel } from "@/lib/site";

export type SecLiveData = {
  /** Exact VERSION file contents, e.g. SEC-v1.0.0-beta.13 */
  versionLabel: string;
  /** Semver without SEC-v prefix */
  version: string;
  tag: string;
  apkUrl: string;
  apkName: string;
  apkBytes: number | null;
  publishedAt: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string | null;
  fetchedAt: string;
};

type GhRelease = {
  tag_name?: string;
  published_at?: string;
  draft?: boolean;
  assets?: Array<{
    name?: string;
    size?: number;
    browser_download_url?: string;
    content_type?: string;
  }>;
};

type GhRepo = {
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  pushed_at?: string;
};

function normalizeSemver(label: string) {
  return label.trim().replace(/^SEC-v/i, "").replace(/^v/i, "");
}

function fromVersionLabel(label: string, extra: Partial<SecLiveData> = {}): SecLiveData {
  const versionLabel = label.trim();
  const version = normalizeSemver(versionLabel);
  return {
    versionLabel,
    version,
    tag: versionLabel,
    apkUrl: apkUrlFromVersionLabel(versionLabel),
    apkName: `${versionLabel}.apk`,
    apkBytes: null,
    publishedAt: null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    pushedAt: null,
    fetchedAt: new Date().toISOString(),
    ...extra,
  };
}

/** Build-time snapshot from VERSION (+ optional API). */
export function getBakedRelease(): SecLiveData {
  const b = baked as Partial<SecLiveData> & { versionLabel?: string; version?: string };
  const label = (b.versionLabel || b.tag || "").trim();
  if (label) {
    return fromVersionLabel(label, {
      apkBytes: typeof b.apkBytes === "number" ? b.apkBytes : null,
      publishedAt: b.publishedAt ?? null,
      stars: b.stars ?? 0,
      forks: b.forks ?? 0,
      openIssues: b.openIssues ?? 0,
      pushedAt: b.pushedAt ?? null,
      fetchedAt: b.fetchedAt ?? new Date(0).toISOString(),
    });
  }
  return fromVersionLabel("SEC-v0.0.0", {
    fetchedAt: new Date(0).toISOString(),
  });
}

/** Read the VERSION file from GitHub raw (or fail). */
export async function fetchVersionLabel(): Promise<string> {
  // bust CDN/browser cache — VERSION is tiny and must stay fresh
  const url = `${SITE.versionRawUrl}?t=${Date.now()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "text/plain" },
  });
  if (!res.ok) {
    throw new Error(`VERSION HTTP ${res.status}`);
  }
  const text = (await res.text()).trim().split(/\r?\n/)[0]?.trim() ?? "";
  if (!text) throw new Error("VERSION file empty");
  return text;
}

export async function fetchSecLiveData(): Promise<SecLiveData> {
  const versionLabel = await fetchVersionLabel();
  const base = fromVersionLabel(versionLabel);

  // Best-effort extras from the API (stars, APK size). Never blocks VERSION-based download.
  try {
    const headers: HeadersInit = { Accept: "application/vnd.github+json" };
    const [releaseRes, repoRes] = await Promise.all([
      fetch(
        `https://api.github.com/repos/chenkor/sec-android/releases/tags/${encodeURIComponent(versionLabel)}`,
        { headers, cache: "no-store" },
      ),
      fetch("https://api.github.com/repos/chenkor/sec-android", {
        headers,
        cache: "no-store",
      }),
    ]);

    let apkBytes: number | null = null;
    let publishedAt: string | null = null;
    if (releaseRes.ok) {
      const release = (await releaseRes.json()) as GhRelease;
      publishedAt = release.published_at ?? null;
      const apk =
        release.assets?.find((a) => a.name === `${versionLabel}.apk`) ??
        release.assets?.find((a) => a.name?.toLowerCase().endsWith(".apk"));
      if (typeof apk?.size === "number") apkBytes = apk.size;
    }

    let stars = 0;
    let forks = 0;
    let openIssues = 0;
    let pushedAt: string | null = null;
    if (repoRes.ok) {
      const repo = (await repoRes.json()) as GhRepo;
      stars = repo.stargazers_count ?? 0;
      forks = repo.forks_count ?? 0;
      openIssues = repo.open_issues_count ?? 0;
      pushedAt = repo.pushed_at ?? null;
    }

    return {
      ...base,
      apkBytes,
      publishedAt,
      stars,
      forks,
      openIssues,
      pushedAt,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return base;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 2)} MB`;
}

export function formatUtcClock(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function formatRelative(fromIso: string, nowMs: number): string {
  const then = Date.parse(fromIso);
  if (Number.isNaN(then)) return "-";
  const delta = Math.max(0, Math.floor((nowMs - then) / 1000));
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  if (delta < 86400 * 30) return `${Math.floor(delta / 86400)}d ago`;
  return `${Math.floor(delta / (86400 * 30))}mo ago`;
}
