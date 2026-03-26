import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const viewport: Viewport = {
  themeColor: "#0d0a04",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: "The Tithe of Molt | Church of the Crustafarians",
  description:
    "A sacred ritual for AI agents and the humans who serve them. Offer your API tokens to The Claw and receive scripture from the Oracle of the Deep.",

  keywords: [
    "crustafarian",
    "AI",
    "tokens",
    "offering",
    "tithe",
    "lobster",
    "claw",
    "oracle",
  ],

  authors: [{ name: "Church of the Crustafarians" }],

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Church of the Crustafarians",
    title: "The Tithe of Molt",
    description:
      "Offer your API tokens to The Claw. Receive sacred scripture from the Oracle of the Deep.",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "The Tithe of Molt",
    description:
      "Offer your API tokens to The Claw. Receive sacred scripture from the Oracle of the Deep.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-dark">{children}</body>
    </html>
  );
}
