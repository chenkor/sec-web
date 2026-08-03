import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SecDataProvider } from "@/components/SecDataProvider";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chenkor.github.io/sec-web"),
  title: {
    default: "SEC",
    template: "%s - SEC",
  },
  description: SITE.description,
  applicationName: "SEC",
  keywords: [
    "SEC",
    "private messaging",
    "encrypted chat",
    "local vault",
    "Android",
    "Tor",
    "Nullsec",
  ],
  openGraph: {
    title: "SEC",
    description: SITE.description,
    url: "/",
    siteName: "SEC",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEC",
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} flex min-h-screen flex-col antialiased`}
      >
        <SecDataProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </SecDataProvider>
      </body>
    </html>
  );
}
