import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Builds",
  description: "SEC Android and desktop builds.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
