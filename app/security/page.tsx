import { NetworkDiagram } from "@/components/network/NetworkDiagram";
import { PageHeader } from "@/components/PageHeader";

const posture = [
  {
    title: "No central account",
    body: "There is no SEC login server. Your identity is a keypair on your device. If you lose the vault, you lose access. That's intentional.",
  },
  {
    title: "Sealed at rest",
    body: "Messages, contacts, voice, relays, and outbox are sealed with your vault key. An optional password gate helps if you don't trust the phone OS (Samsung and similar) — still not 100% OS-proof. Idle auto-lock on phone and desktop.",
  },
  {
    title: "Hardened egress",
    body: "Tor is on by default with no clearnet fallback. Per-relay SOCKS isolation on desktop. Bridges supported. Media and links fail closed off Tor.",
  },
  {
    title: "Panic and stealth",
    body: "Duress password destroys the vault while looking like a wrong unlock. Android stealth launcher. Screenshots blocked where the OS allows.",
  },
];

export default function SecurityPage() {
  return (
    <div className="page">
      <PageHeader
        kicker="Security"
        title="Keep the channel yours."
        lead="Local keys. Tor by default. Sealed until unlock. Panic wipe when you need it. No platform account in the middle."
      />

      <NetworkDiagram />

      <div className="mt-16 grid gap-x-10 md:grid-cols-2">
        {posture.map((item) => (
          <article key={item.title} className="panel">
            <h2 className="panel-title text-[1.15rem]">{item.title}</h2>
            <p className="panel-body">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="panel mt-4 max-w-3xl">
        <p className="panel-body !mt-0">
          Locked means sealed. Tor hides the path when you leave it on. Bluetooth
          has no branded name tag. Kind 0 profiles stay local unless you publish.
          A password gate is optional — useful on untrusted OEM phones, never a
          claim that the app beats a compromised OS. No platform can hand over
          what it never held.
        </p>
      </div>
    </div>
  );
}
