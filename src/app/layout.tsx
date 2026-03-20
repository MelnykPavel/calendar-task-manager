import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DM_Mono, DM_Sans, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import Providers from "./providers";
import "./globals.css";
import type { ThemeMode } from "@/src/lib/store/types/common";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Calendar Task Manager",
  description: "Calendar task manager with inline tasks and drag & drop",
};

const THEME_COOKIE = "ctm-theme";

function resolveThemeMode(value: string | undefined): ThemeMode {
  return value === "dark" ? "dark" : "light";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialThemeMode = resolveThemeMode(
    cookieStore.get(THEME_COOKIE)?.value,
  );

  return (
    <html
      lang="en"
      data-theme={initialThemeMode}
      suppressHydrationWarning
    >
      <body className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
        <Providers initialThemeMode={initialThemeMode}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
