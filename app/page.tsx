"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/live/AnimatedNumber";
import { LiveClock } from "@/components/live/LiveClock";
import { RelativeTime } from "@/components/live/RelativeTime";
import { useSecData } from "@/components/SecDataProvider";
import { formatBytes } from "@/lib/github";
import { SITE } from "@/lib/site";

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="home__aside-row">
      <span>{label}</span>
      <span className="home__value">{children}</span>
    </div>
  );
}

export default function HomePage() {
  const { data, apkUrl, versionLabel } = useSecData();
  const live = data;

  return (
    <section className="home">
      <div>
        <h1 className="display home__title">SEC</h1>
        <p className="lede mt-7">
          A private messenger with a local vault. Built for Nullsec, and for
          anyone who needs a channel away from the usual platforms.
        </p>
        <div className="btn-row !mt-8 !pt-0">
          <a href={apkUrl} className="btn btn-primary">
            Download APK
          </a>
          <Link href="/builds" className="btn btn-secondary">
            See builds
          </Link>
        </div>
      </div>

      <aside className="home__aside" aria-label="Live release and time">
        <Row label="Timezone">
          <LiveClock />
        </Row>
        <Row label="Version">
          <span className="live-num">{versionLabel}</span>
        </Row>
        <Row label="APK">
          <span className="live-num">
            {live?.apkBytes != null ? formatBytes(live.apkBytes) : "..."}
          </span>
        </Row>
        <Row label="Released">
          <RelativeTime iso={live?.publishedAt ?? null} />
        </Row>
        <Row label="Android push">
          <RelativeTime iso={live?.pushedAt ?? null} />
        </Row>
        <Row label="Stars">
          <AnimatedNumber value={live?.stars ?? 0} />
        </Row>
        <Row label="Forks">
          <AnimatedNumber value={live?.forks ?? 0} />
        </Row>
        <Row label="Open issues">
          <AnimatedNumber value={live?.openIssues ?? 0} />
        </Row>
        <Row label="Package">
          <span className="live-num">{SITE.packageId}</span>
        </Row>
      </aside>
    </section>
  );
}
