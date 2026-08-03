import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Source",
  description: "SEC source repositories, AGPL license, and credits.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
