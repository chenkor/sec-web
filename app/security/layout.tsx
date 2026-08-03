import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description: "How SEC keeps messaging private on your device.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
