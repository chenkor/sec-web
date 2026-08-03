/**
 * Bake VERSION (+ optional GitHub extras) at build time.
 * Prefers local ../sec-android/VERSION when building from the sec monorepo,
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

async function extras(label) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "sec-web-build",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  try {
    const [relRes, repoRes] = await Promise.all([
      fetch(
        `https://api.github.com/repos/chenkor/sec-android/releases/tags/${encodeURIComponent(label)}`,
        { headers },
      ),
      fetch("https://api.github.com/repos/chenkor/sec-android", { headers }),
    ]);
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
    let stars = 0;
    let forks = 0;
    let openIssues = 0;
    let pushedAt = null;
    if (repoRes.ok) {
      const repo = await repoRes.json();
      stars = repo.stargazers_count ?? 0;
      forks = repo.forks_count ?? 0;
      openIssues = repo.open_issues_count ?? 0;
      pushedAt = repo.pushed_at ?? null;
    }
    return { apkBytes, publishedAt, stars, forks, openIssues, pushedAt };
  } catch {
    return {
      apkBytes: null,
      publishedAt: null,
      stars: 0,
      forks: 0,
      openIssues: 0,
      pushedAt: null,
    };
  }
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
  console.warn(`[fetch-release] ${err.message} — writing stub`);
  const stub = {
    versionLabel: "SEC-v0.0.0",
    version: "0.0.0",
    tag: "SEC-v0.0.0",
    apkUrl: apkUrlFromLabel("SEC-v0.0.0"),
    apkName: "SEC-v0.0.0.apk",
    apkBytes: null,
    publishedAt: null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    pushedAt: null,
    fetchedAt: new Date(0).toISOString(),
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(stub, null, 2)}\n`, "utf8");
});
