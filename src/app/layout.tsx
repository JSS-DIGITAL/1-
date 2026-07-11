import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { SwRegister } from "@/components/sw-register";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://onepercent.jssdigital.com.au"),
  title: "1% — personal performance system",
  description:
    "Student records reality. Teacher evaluates the record. One correction, one mission, every day.",
  openGraph: {
    title: "1% — the floor, not the ceiling",
    description:
      "Record the day. Seal it. Judge it like a coach. One correction, one mission, every day — your data never leaves your device.",
    url: "/",
    siteName: "1%",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "1% — the floor, not the ceiling",
    description: "Student records reality. Teacher judges the record. One mission, every day.",
    images: ["/og.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "1%",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="student"
      className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body className="grain mode-fade min-h-dvh font-body antialiased">
        <AppProvider>{children}</AppProvider>
        <SwRegister />
      </body>
    </html>
  );
}
