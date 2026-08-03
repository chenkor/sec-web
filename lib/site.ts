export const SITE = {
  name: "SEC",
  packageId: "com.sec.vault",
  tagline: "Private Nostr messaging with a local vault.",
  androidRepo: "https://github.com/chenkor/sec-android",
  androidReleases: "https://github.com/chenkor/sec-android/releases",
  desktopRepo: "https://github.com/chenkor/sec-desktop",
  /** Fallback until GitHub live data loads */
  fallbackVersion: "1.0.0-beta.10",
  fallbackApk:
    "https://github.com/chenkor/sec-android/releases/download/v1.0.0-beta.10/SEC-v1.0.0-beta.10.apk",
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/builds", label: "Builds" },
  { href: "/security", label: "Security" },
  { href: "/us", label: "Us" },
  { href: "/source", label: "Source" },
] as const;
