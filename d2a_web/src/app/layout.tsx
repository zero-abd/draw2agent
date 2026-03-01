import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "draw2agent — Draw Changes, Ship Faster",
  description:
    "Draw and annotate changes directly on your localhost website. MCP server that turns visual annotations into real code changes in real-time.",
  keywords: [
    "draw2agent",
    "MCP server",
    "web development",
    "visual coding",
    "annotation",
    "real-time",
    "cursor",
    "antigravity",
  ],
  openGraph: {
    title: "draw2agent — Draw Changes, Ship Faster",
    description:
      "Draw and annotate changes directly on your localhost website. Turn visual sketches into real code changes in real-time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
