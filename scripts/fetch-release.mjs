/**
 * Bake VERSION (+ optional GitHub extras) at build time.
 * Prefers local./sec-android/VERSION when building from the sec monorepo,
 * else raw.githubusercontent.com/chenkor/sec-android/main/VERSION.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "lib", "release.generated.json");
const localVersion = join(__dirname, "..", "..", "sec-android", "VERSION");
const remoteVersion =
  "https://raw.githubusercontent.com/chenkor/sec-android/main/VERSION";

function apkUrlFromLabel(label) {
  const enc = encodeURIComponent(label);
  return `https://github.com/chenkor/sec-android/releases/download/${enc}/${enc}.apk`;
}

function semver(label) {
  return label.replace(/^SEC-v/i, "").replace(/^v/i, "");
}

async function readVersionLabel() {
  if (existsSync(localVersion)) {
    const t = readFileSync(localVersion, "utf8").trim().split(/\r?\n/)[0]?.trim();
    if (t) {
      console.log(`[fetch-release] local VERSION: ${t}`);
      return t;
    }
  }
  const headers = { Accept: "text/plain", "User-Agent": "sec-web-build" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(remoteVersion, { headers });
  if (!res.ok) throw new Error(`VERSION HTTP ${res.status}`);
  const t = (await res.text()).trim().split(/\r?\n/)[0]?.trim();
  if (!t) throw new Error("VERSION empty");
  console.log(`[fetch-release] remote VERSION: ${t}`);
  return t;
}

function oldestIso(values) {
  const stamps = values
    .filter((s) => typeof s === "string" && !Number.isNaN(Date.parse(s)))
    .sort((a, b) => Date.parse(a) - Date.parse(b));
  return stamps[0] ?? null;
}

/** Previous snapshot, so a rate-limited build never downgrades to nulls. */
function previousSnapshot() {
  try {
    return JSON.parse(readFileSync(outPath, "utf8"));
  } catch {
    return null;
  }
}

async function extrasFromGithub(label) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "sec-web-build",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  try {
    const [relRes, repoRes, listRes] = await Promise.all([
      fetch(
        `https://api.github.com/repos/chenkor/sec-android/releases/tags/${encodeURIComponent(label)}`,
        { headers },
      ),
      fetch("https://api.github.com/repos/chenkor/sec-android", { headers }),
      fetch(
        "https://api.github.com/repos/chenkor/sec-android/releases?per_page=100",
        { headers },
      ),
    ]);
    if (!relRes.ok && !repoRes.ok && !listRes.ok) return null;

    let apkBytes = null;
    let publishedAt = null;
    if (relRes.ok) {
      const release = await relRes.json();
      publishedAt = release.published_at ?? null;
      const apk =
        (release.assets ?? []).find((a) => a.name === `${label}.apk`) ??
        (release.assets ?? []).find((a) => a.name?.endsWith(".apk"));
      if (typeof apk?.size === "number") apkBytes = apk.size;
    }
    let stars = null;
    let forks = null;
    let openIssues = null;
    let pushedAt = null;
    let createdAt = null;
    if (repoRes.ok) {
      const repo = await repoRes.json();
      stars = repo.stargazers_count ?? null;
      forks = repo.forks_count ?? null;
      openIssues = repo.open_issues_count ?? null;
      pushedAt = repo.pushed_at ?? null;
      createdAt = repo.created_at ?? null;
    }
    let firstReleaseAt = createdAt;
    if (listRes.ok) {
      const list = await listRes.json();
      firstReleaseAt =
        oldestIso(
          (Array.isArray(list) ? list : []).map(
            (r) => r.published_at ?? r.created_at,
          ),
        ) ?? createdAt;
    }
    return {
      apkBytes,
      publishedAt,
      firstReleaseAt,
      stars,
      forks,
      openIssues,
      pushedAt,
    };
  } catch {
    return null;
  }
}

/** CORS-free mirror, used when api.github.com rate-limits the build. */
async function extrasFromUngh(label) {
  try {
    const [repoRes, listRes, latestRes] = await Promise.all([
      fetch("https://ungh.cc/repos/chenkor/sec-android"),
      fetch("https://ungh.cc/repos/chenkor/sec-android/releases"),
      fetch("https://ungh.cc/repos/chenkor/sec-android/releases/latest"),
    ]);
    if (!repoRes.ok && !listRes.ok && !latestRes.ok) return null;

    let stars = null;
    let forks = null;
    let pushedAt = null;
    let createdAt = null;
    if (repoRes.ok) {
      const { repo } = await repoRes.json();
      stars = repo?.stars ?? null;
      forks = repo?.forks ?? null;
      pushedAt = repo?.pushedAt ?? null;
      createdAt = repo?.createdAt ?? null;
    }
    let firstReleaseAt = createdAt;
    if (listRes.ok) {
      const { releases } = await listRes.json();
      firstReleaseAt =
        oldestIso((releases ?? []).map((r) => r.publishedAt)) ?? createdAt;
    }
    let apkBytes = null;
    let publishedAt = null;
    if (latestRes.ok) {
      const { release } = await latestRes.json();
      if (release && semver(release.tag ?? "") === semver(label)) {
        publishedAt = release.publishedAt ?? null;
        const apk = (release.assets ?? []).find((a) =>
          a.downloadUrl?.toLowerCase().endsWith(".apk"),
        );
        if (typeof apk?.size === "number") apkBytes = apk.size;
      }
    }
    return { apkBytes, publishedAt, firstReleaseAt, stars, forks, pushedAt };
  } catch {
    return null;
  }
}

async function extras(label) {
  const prev = previousSnapshot();
  const gh = await extrasFromGithub(label);
  const needsMirror =
    !gh ||
    gh.firstReleaseAt == null ||
    gh.publishedAt == null ||
    gh.pushedAt == null;
  const mirror = needsMirror ? await extrasFromUngh(label) : null;
  if (!gh && !mirror) console.warn("[fetch-release] stats unavailable");

  // Release-specific leftovers only apply to the same release.
  const sameRelease = semver(prev?.versionLabel ?? "") === semver(label);
  const pick = (key, fallback) =>
    gh?.[key] ?? mirror?.[key] ?? prev?.[key] ?? fallback;
  const pickRelease = (key) =>
    gh?.[key] ?? mirror?.[key] ?? (sameRelease ? prev?.[key] : null) ?? null;

  return {
    apkBytes: pickRelease("apkBytes"),
    publishedAt: pickRelease("publishedAt"),
    firstReleaseAt: pick("firstReleaseAt", null),
    stars: pick("stars", 0),
    forks: pick("forks", 0),
    openIssues: pick("openIssues", 0),
    pushedAt: pick("pushedAt", null),
  };
}

async function main() {
  const versionLabel = await readVersionLabel();
  const x = await extras(versionLabel);
  const data = {
    versionLabel,
    version: semver(versionLabel),
    tag: versionLabel,
    apkUrl: apkUrlFromLabel(versionLabel),
    apkName: `${versionLabel}.apk`,
   ...x,
    fetchedAt: new Date().toISOString(),
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`[fetch-release] ${data.apkUrl}`);
}

main().catch((err) => {
  console.warn(`[fetch-release] ${err.message}. Writing stub`);
  const stub = {
    versionLabel: "SEC-v0.0.0",
    version: "0.0.0",
    tag: "SEC-v0.0.0",
    apkUrl: apkUrlFromLabel("SEC-v0.0.0"),
    apkName: "SEC-v0.0.0.apk",
    apkBytes: null,
    publishedAt: null,
    firstReleaseAt: null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    pushedAt: null,
    fetchedAt: new Date(0).toISOString(),
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(stub, null, 2)}\n`, "utf8");
});
