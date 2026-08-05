export const SITE = {
  name: "SEC",
  packageId: "com.sec.vault",
  tagline: "Private messaging with a local vault.",
  description:
    "Private messaging with a local vault. Android-first, keys on your device, optional Tor.",
  androidRepo: "https://github.com/chenkor/sec-android",
  androidReleases: "https://github.com/chenkor/sec-android/releases",
  desktopRepo: "https://github.com/chenkor/sec-desktop",
  /** Pushed by Android releases. One line, e.g. SEC-v1.0.0-beta.12 */
  versionRawUrl:
    "https://raw.githubusercontent.com/chenkor/sec-android/main/VERSION",
} as const;

/** APK + release tag share this label (from VERSION file). */
export function apkUrlFromVersionLabel(label: string): string {
  const v = label.trim();
  if (!v) return SITE.androidReleases;
  const enc = encodeURIComponent(v);
  return `https://github.com/chenkor/sec-android/releases/download/${enc}/${enc}.apk`;
}

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/builds", label: "Builds" },
  { href: "/security", label: "Security" },
  { href: "/us", label: "Us" },
  { href: "/source", label: "Source" },
] as const;
