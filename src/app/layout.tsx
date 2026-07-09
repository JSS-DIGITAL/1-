import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";

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
  title: "1% — personal performance system",
  description:
    "Student records reality. Teacher evaluates the record. One correction, one mission, every day.",
};

export const viewport: Viewport = {
  themeColor: "#0f1411",
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
      </body>
    </html>
  );
}
