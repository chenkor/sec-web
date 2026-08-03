"use client";

import Link from "next/link";
import { useSecData } from "@/components/SecDataProvider";
import { SITE } from "@/lib/site";

export function Footer() {
  const { versionLabel } = useSecData();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__links">
          <Link href="/builds">Builds</Link>
          <Link href="/security">Security</Link>
          <Link href="/us">Us</Link>
          <Link href="/source">Source</Link>
          <a href={SITE.androidRepo} target="_blank" rel="noreferrer">
            Android repo
          </a>
          <a href={SITE.desktopRepo} target="_blank" rel="noreferrer">
            Desktop repo
          </a>
        </div>
        <div className="site-footer__meta">
          <span>AGPL-3.0-or-later</span>
          <span>{versionLabel}</span>
        </div>
      </div>
    </footer>
  );
}
