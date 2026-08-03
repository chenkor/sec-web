"use client";

import { PageHeader } from "@/components/PageHeader";
import { useSecData } from "@/components/SecDataProvider";
import { SITE } from "@/lib/site";

const repos = [
  {
    name: "sec-android",
    href: SITE.androidRepo,
    status: "Primary",
    note: "The main client. Local vault, Tor, Bluetooth, private channels.",
  },
  {
    name: "sec-desktop",
    href: SITE.desktopRepo,
    status: "Under development",
    note: "Desktop companion. Early and buggy. Fine to look at, not the focus.",
  },
];

export default function SourcePage() {
  const { apkUrl, versionLabel } = useSecData();

  return (
    <div className="page">
      <PageHeader
        kicker="Source"
        title="Code and license."
        lead="SEC is open under AGPL-3.0-or-later. Fork it, change it, run it."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {repos.map((repo) => (
          <a
            key={repo.name}
            href={repo.href}
            target="_blank"
            rel="noreferrer"
            className="panel-solid"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="panel-title">{repo.name}</h2>
              <span className="meta">{repo.status}</span>
            </div>
            <p className="panel-body">{repo.note}</p>
          </a>
        ))}
      </div>

      <div className="mt-4 grid gap-x-10 md:grid-cols-2">
        <div className="panel">
          <div className="panel-label">License</div>
          <div>AGPL-3.0-or-later</div>
        </div>
        <div className="panel">
          <div className="panel-label">Version</div>
          <div>{versionLabel}</div>
        </div>
      </div>

      <div className="panel-solid mt-10">
        <div className="panel-label">Android APK</div>
        <p className="panel-body !mt-0">
          Direct download for {versionLabel}. Install the APK on your device.
        </p>
        <div className="btn-row">
          <a href={apkUrl} className="btn btn-primary">
            Download APK
          </a>
          <a
            href={SITE.androidReleases}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            All releases
          </a>
        </div>
      </div>
    </div>
  );
}
