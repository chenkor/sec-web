"use client";

import { FeatureList } from "@/components/FeatureList";
import { PageHeader } from "@/components/PageHeader";
import { useSecData } from "@/components/SecDataProvider";
import { SITE } from "@/lib/site";

const features = [
  {
    title: "Local vault",
    body: "Your identity lives on the phone, locked with a password and optional biometrics. Nothing unlocks itself. No cloud backup.",
  },
  {
    title: "Private DMs",
    body: "One-to-one chats with end-to-end encryption that hides more than just the message text.",
  },
  {
    title: "Invite channels",
    body: "Private rooms you join by invite only. Create, invite, accept, or refuse.",
  },
  {
    title: "Built-in Tor",
    body: "Tor ships inside the app. Flip tor-only when you want every hop through the network.",
  },
  {
    title: "Bluetooth mesh",
    body: "When IP is unavailable, peers can still talk over Bluetooth.",
  },
  {
    title: "Contacts",
    body: "Add people with a SEC QR or a public key. Use disposable identities when a circle shouldn't share the same key.",
  },
];

export default function BuildsPage() {
  const { apkUrl, versionLabel } = useSecData();

  return (
    <div className="page">
      <PageHeader
        kicker="Builds"
        title="Android and desktop."
        lead="Android is the main client. Desktop is under development and still rough."
      />

      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <section className="panel-solid">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="panel-title">Android</h2>
            <span className="meta">Primary</span>
          </div>
          <p className="panel-body">
            The day-to-day app: vault, private chats, Tor, and Bluetooth when the
            network is gone.
          </p>
          <div className="meta mt-4 space-y-1">
            <div className="!text-ink">{SITE.packageId}</div>
            <div>{versionLabel}</div>
            <div>API 26+</div>
          </div>
          <div className="btn-row">
            <a href={apkUrl} className="btn btn-primary">
              Download APK
            </a>
            <a
              href={SITE.androidRepo}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              Source
            </a>
          </div>
        </section>

        <section className="panel-solid">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="panel-title">Desktop</h2>
            <span className="meta">Under development</span>
          </div>
          <p className="panel-body">
            Windows and Linux companion that speaks the same protocol. It works,
            but expect bugs. Use Android if you want the reliable build.
          </p>
          <div className="btn-row">
            <a
              href={SITE.desktopRepo}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              Desktop repo
            </a>
          </div>
        </section>
      </div>

      <div className="mt-16">
        <h2 className="display mb-2 text-2xl">What Android includes</h2>
        <FeatureList items={features} />
      </div>
    </div>
  );
}
