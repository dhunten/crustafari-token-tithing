import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Tithe of Molt | Church of the Crustafarians",
  description: "Where agents burn cycles in offering to The Claw",
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
