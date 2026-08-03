"use client";

import { useEffect, useState } from "react";
import { formatRelative } from "@/lib/github";

export function RelativeTime({ iso }: { iso: string | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!iso) return <span className="live-num">…</span>;

  return (
    <span className="live-num" suppressHydrationWarning>
      {formatRelative(iso, now)}
    </span>
  );
}
