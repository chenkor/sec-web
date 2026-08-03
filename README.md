<div align="center">

# SEC Web

Private Nostr messaging - project site for SEC.

[![Stars](https://img.shields.io/github/stars/chenkor/sec-web)](https://github.com/chenkor/sec-web/stargazers)
[![Forks](https://img.shields.io/github/forks/chenkor/sec-web)](https://github.com/chenkor/sec-web/network/members)
[![Issues](https://img.shields.io/github/issues/chenkor/sec-web)](https://github.com/chenkor/sec-web/issues)
[![License](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue)](./LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/chenkor/sec-web)](https://github.com/chenkor/sec-web/commits/main)
[![Top language](https://img.shields.io/github/languages/top/chenkor/sec-web)](https://github.com/chenkor/sec-web)
[![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20TypeScript%20%7C%20Tailwind-black)](#run)
[![Status](https://img.shields.io/badge/focus-Android%20client-3DFF9A)](#)

[SEC Android](https://github.com/chenkor/sec-android) · [SEC Desktop](https://github.com/chenkor/sec-desktop) (under development)

</div>

---

Marketing site for **SEC**: private Nostr messaging with a local vault. English UI. Android is the primary product surface. Desktop is listed as under development.

Live release data (version, APK download URL, size, stars, and related stats) is loaded from the [sec-android GitHub Releases](https://github.com/chenkor/sec-android/releases) API.

## Pages

| Route | Content |
|-------|---------|
| `/` | Home - product intro, live release feed, APK download |
| `/builds` | Android and desktop builds |
| `/security` | Security posture |
| `/us` | Origin / Nullsec |
| `/source` | Repositories, license, APK |

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- GitHub API (`/api/sec`) for live Android release metadata

## Prerequisites

- Node.js 20+
- npm

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Related

| Repository | Role |
|------------|------|
| [sec-android](https://github.com/chenkor/sec-android) | Android client (primary) |
| [sec-desktop](https://github.com/chenkor/sec-desktop) | Desktop client (under development) |
| [sec-web](https://github.com/chenkor/sec-web) | This site |

## License

[AGPL-3.0-or-later](./LICENSE)

## Credits

See [`credits.txt`](./credits.txt).
