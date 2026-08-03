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
import {
  fetchSecLiveData,
  getBakedRelease,
  type SecLiveData,
} from "@/lib/github";

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

export function SecDataProvider({ children }: { children: ReactNode }) {
  const baked = useMemo(() => getBakedRelease(), []);
  const [data, setData] = useState<SecLiveData | null>(baked);
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
    const live = data ?? baked;
    return {
      data,
      loading,
      error,
      refresh: () => void load(),
      apkUrl: live.apkUrl,
      version: live.version,
      versionLabel: live.versionLabel,
    };
  }, [data, baked, loading, error, load]);

  return <SecContext.Provider value={value}>{children}</SecContext.Provider>;
}

export function useSecData() {
  const ctx = useContext(SecContext);
  if (!ctx) throw new Error("useSecData must be used within SecDataProvider");
  return ctx;
}
