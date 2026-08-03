import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function UsPage() {
  return (
    <div className="page">
      <PageHeader
        kicker="Us"
        title="Where SEC comes from."
        lead="Nullsec needed a way to talk that didn't depend on someone else's app. SEC is what we built for that."
      />

      <div className="max-w-2xl">
        <div className="panel">
          <p className="text-[1.05rem] leading-relaxed text-ink">
            This isn't one person's project wearing a group name. Nullsec is all
            of us. The stack is open, and anyone can take it further.
          </p>
        </div>
        <div className="panel">
          <p className="panel-body !mt-0 text-[1.05rem]">
            It started as our first private channel. It can also be the last one
            you keep when everything else is noisy, watched, or down.
          </p>
        </div>
      </div>

      <div className="btn-row !mt-10 !pt-0">
        <Link href="/builds" className="btn btn-primary">
          Builds
        </Link>
        <Link href="/security" className="btn btn-secondary">
          Security
        </Link>
      </div>
    </div>
  );
}
