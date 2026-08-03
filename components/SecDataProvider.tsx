"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchSecLiveData, type SecLiveData } from "@/lib/github";
import { SITE } from "@/lib/site";

type SecState = {
  data: SecLiveData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  apkUrl: string;
  version: string;
  versionLabel: string;
};

const SecContext = createContext<SecState | null>(null);

const FALLBACK: SecLiveData = {
  version: SITE.fallbackVersion,
  tag: `v${SITE.fallbackVersion}`,
  apkUrl: SITE.fallbackApk,
  apkName: `SEC-v${SITE.fallbackVersion}.apk`,
  apkBytes: null,
  publishedAt: null,
  stars: 0,
  forks: 0,
  openIssues: 0,
  pushedAt: null,
  fetchedAt: new Date(0).toISOString(),
};

export function SecDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SecLiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const json = await fetchSecLiveData();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Live data unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const value = useMemo<SecState>(() => {
    const live = data ?? FALLBACK;
    return {
      data,
      loading,
      error,
      refresh: () => void load(),
      apkUrl: live.apkUrl,
      version: live.version,
      versionLabel: live.version.startsWith("v")
        ? live.version
        : `v${live.version}`,
    };
  }, [data, loading, error, load]);

  return <SecContext.Provider value={value}>{children}</SecContext.Provider>;
}

export function useSecData() {
  const ctx = useContext(SecContext);
  if (!ctx) throw new Error("useSecData must be used within SecDataProvider");
  return ctx;
}
