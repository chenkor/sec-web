export type SecLiveData = {
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

function pickApk(release: GhRelease) {
  const assets = release.assets ?? [];
  const apk =
    assets.find((a) => a.name?.toLowerCase().endsWith(".apk")) ??
    assets.find((a) => a.content_type?.includes("android")) ??
    assets[0];
  return apk ?? null;
}

export async function fetchSecLiveData(): Promise<SecLiveData> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  const [releaseRes, repoRes] = await Promise.all([
    // /releases/latest ignores prereleases; SEC ships betas as prerelease.
    fetch(
      "https://api.github.com/repos/chenkor/sec-android/releases?per_page=10",
      { headers, cache: "no-store" },
    ),
    fetch("https://api.github.com/repos/chenkor/sec-android", {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!releaseRes.ok) {
    throw new Error(`GitHub release HTTP ${releaseRes.status}`);
  }
  if (!repoRes.ok) {
    throw new Error(`GitHub repo HTTP ${repoRes.status}`);
  }

  const releases = (await releaseRes.json()) as GhRelease[];
  const release =
    releases.find((r) => !r.draft && pickApk(r)) ??
    releases.find((r) => !r.draft) ??
    null;
  if (!release) {
    throw new Error("No published GitHub release found");
  }

  const repo = (await repoRes.json()) as GhRepo;
  const apk = pickApk(release);
  const tag = release.tag_name ?? "v0.0.0";
  const version = tag.replace(/^v/i, "");

  return {
    version,
    tag,
    apkUrl:
      apk?.browser_download_url ??
      `https://github.com/chenkor/sec-android/releases/tag/${encodeURIComponent(tag)}`,
    apkName: apk?.name ?? `SEC-${version}.apk`,
    apkBytes: typeof apk?.size === "number" ? apk.size : null,
    publishedAt: release.published_at ?? null,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    pushedAt: repo.pushed_at ?? null,
    fetchedAt: new Date().toISOString(),
  };
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
