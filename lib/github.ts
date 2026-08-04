import baked from "@/lib/release.generated.json";
import { SITE, apkUrlFromVersionLabel } from "@/lib/site";

export type SecLiveData = {
  /** Exact VERSION file contents, e.g. SEC-v1.0.0-beta.12 */
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

function sameRelease(a: string, b: string) {
  return normalizeSemver(a) === normalizeSemver(b);
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

type LiveExtras = {
  apkBytes: number | null;
  publishedAt: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string | null;
};

async function extrasFromGithub(versionLabel: string): Promise<Partial<LiveExtras> | null> {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "sec-web",
    };
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

    // Rate-limit / auth failures must not look like "success with stale blanks".
    if (!releaseRes.ok && !repoRes.ok) return null;

    const out: Partial<LiveExtras> = {};
    if (releaseRes.ok) {
      const release = (await releaseRes.json()) as GhRelease;
      out.publishedAt = release.published_at ?? null;
      const apk =
        release.assets?.find((a) => a.name === `${versionLabel}.apk`) ??
        release.assets?.find((a) => a.name?.toLowerCase().endsWith(".apk"));
      if (typeof apk?.size === "number") out.apkBytes = apk.size;
    }
    if (repoRes.ok) {
      const repo = (await repoRes.json()) as GhRepo;
      out.stars = repo.stargazers_count ?? 0;
      out.forks = repo.forks_count ?? 0;
      out.openIssues = repo.open_issues_count ?? 0;
      out.pushedAt = repo.pushed_at ?? null;
    }
    return out;
  } catch {
    return null;
  }
}

/** CORS-friendly mirror used when api.github.com is rate-limited. */
async function extrasFromUngh(versionLabel: string): Promise<Partial<LiveExtras> | null> {
  try {
    const [repoRes, relRes] = await Promise.all([
      fetch("https://ungh.cc/repos/chenkor/sec-android", { cache: "no-store" }),
      fetch("https://ungh.cc/repos/chenkor/sec-android/releases/latest", {
        cache: "no-store",
      }),
    ]);
    if (!repoRes.ok && !relRes.ok) return null;

    const out: Partial<LiveExtras> = {};
    if (repoRes.ok) {
      const body = (await repoRes.json()) as {
        repo?: {
          stars?: number;
          forks?: number;
          pushedAt?: string;
        };
      };
      out.stars = body.repo?.stars ?? 0;
      out.forks = body.repo?.forks ?? 0;
      out.pushedAt = body.repo?.pushedAt ?? null;
    }
    if (relRes.ok) {
      const body = (await relRes.json()) as {
        release?: {
          tag?: string;
          publishedAt?: string;
          assets?: Array<{ size?: number; downloadUrl?: string }>;
        };
      };
      const release = body.release;
      if (release && sameRelease(release.tag ?? "", versionLabel)) {
        out.publishedAt = release.publishedAt ?? null;
        const apk = release.assets?.find((a) =>
          a.downloadUrl?.toLowerCase().endsWith(".apk"),
        );
        if (typeof apk?.size === "number") out.apkBytes = apk.size;
      }
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * Live VERSION for the download URL + best-effort repo extras.
 * GitHub API first; ungh.cc if rate-limited; bake only as last resort
 * for the same release (never wipe known stats to zeros).
 */
export async function fetchSecLiveData(): Promise<SecLiveData> {
  const bakedSnap = getBakedRelease();
  const versionLabel = await fetchVersionLabel();

  const bakedExtras = sameRelease(versionLabel, bakedSnap.versionLabel)
    ? {
        apkBytes: bakedSnap.apkBytes,
        publishedAt: bakedSnap.publishedAt,
        stars: bakedSnap.stars,
        forks: bakedSnap.forks,
        openIssues: bakedSnap.openIssues,
        pushedAt: bakedSnap.pushedAt,
      }
    : {};

  const base = fromVersionLabel(versionLabel, bakedExtras);
  const fromGh = await extrasFromGithub(versionLabel);
  const needsMirror =
    !fromGh || fromGh.pushedAt == null || fromGh.publishedAt == null;
  const fromMirror = needsMirror ? await extrasFromUngh(versionLabel) : null;
  // Bake < mirror < GitHub (only defined fields win via spread order + ?? below)
  const extras = { ...bakedExtras, ...fromMirror, ...fromGh };

  return {
    ...base,
    apkBytes: extras.apkBytes ?? base.apkBytes,
    publishedAt: extras.publishedAt ?? base.publishedAt,
    stars: extras.stars ?? base.stars,
    forks: extras.forks ?? base.forks,
    openIssues: extras.openIssues ?? base.openIssues,
    pushedAt: extras.pushedAt ?? base.pushedAt,
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

const berlinClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Berlin",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function formatBerlinClock(date: Date): string {
  const parts = berlinClock.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("hour")}:${get("minute")}:${get("second")}`;
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
