import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/shared/providers";
import { RouteProgress } from "@/components/shared/route-progress";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "TaskHorizon — Task workspace",
  description: "A focused workspace for task-based earning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}>
        <Providers>
          <RouteProgress />
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
