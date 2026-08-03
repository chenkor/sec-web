import { PageHeader } from "@/components/PageHeader";

const posture = [
  {
    title: "No central account",
    body: "There is no SEC login server. Your identity is a keypair on your device. If you lose the vault, you lose access. That's intentional.",
  },
  {
    title: "Sealed at rest",
    body: "Data stays encrypted until you unlock. After a while idle, the app locks itself again.",
  },
  {
    title: "Hardened egress",
    body: "Cleartext HTTP is blocked. You can force Tor. Relay certificates can be pinned with TOFU.",
  },
  {
    title: "Device hygiene",
    body: "Where the OS allows it, SEC stays out of recents. Vault material is not backed up to Android cloud.",
  },
];

export default function SecurityPage() {
  return (
    <div className="page">
      <PageHeader
        kicker="Security"
        title="Keep the channel yours."
        lead="SEC is for private messaging when you don't want a platform account in the middle. Local keys, optional Tor, Bluetooth when the network is gone."
      />

      <div className="grid gap-x-10 md:grid-cols-2">
        {posture.map((item) => (
          <article key={item.title} className="panel">
            <h2 className="panel-title text-[1.15rem]">{item.title}</h2>
            <p className="panel-body">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="panel mt-4 max-w-3xl">
        <p className="panel-body !mt-0">
          SEC won't make you invisible to a global adversary. What it does give
          you is encrypted messaging with keys you hold, Tor if you want it, and
          a Bluetooth fallback when IP is dead.
        </p>
      </div>
    </div>
  );
}
