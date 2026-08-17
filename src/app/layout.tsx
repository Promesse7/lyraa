import type { Metadata, Viewport } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  weight: "400",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lyraa — Every line, every meaning.",
    template: "%s · Lyraa",
  },
  description:
    "Rwanda's living lyric library — read the words, unlock the poetry, share the lines you love.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lyraa",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5ead8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${caprasimo.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="app-shell">{children}</div>
        <PwaRegister />
      </body>
    </html>
  );
}
