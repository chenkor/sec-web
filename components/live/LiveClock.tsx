"use client";

import { useEffect, useState } from "react";
import { formatUtcClock } from "@/lib/github";

export function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  const ms = String(now.getUTCMilliseconds()).padStart(3, "0");

  return (
    <span className="live-num" suppressHydrationWarning>
      {formatUtcClock(now)}
      <span className="live-ms">.{ms}</span>
      <span className="live-unit"> UTC</span>
    </span>
  );
}
