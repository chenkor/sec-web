"use client";

import { useEffect, useState } from "react";
import { formatBerlinClock } from "@/lib/github";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <span className="live-num">
        --:--:--
        <span className="live-ms">.---</span>
        <span className="live-unit"> Berlin</span>
      </span>
    );
  }

  const ms = String(now.getMilliseconds()).padStart(3, "0");

  return (
    <span className="live-num">
      {formatBerlinClock(now)}
      <span className="live-ms">.{ms}</span>
      <span className="live-unit"> Berlin</span>
    </span>
  );
}
