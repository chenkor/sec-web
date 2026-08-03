import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Us",
  description: "Who we are and why SEC exists.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
