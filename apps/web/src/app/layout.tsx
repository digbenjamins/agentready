import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OkforAI - Is Your Website Visible to AI?",
  description:
    "People no longer just Google it. They ask ChatGPT, Grok, and Perplexity. OkforAI checks if AI agents can discover, read, and recommend your website. Get your free report.",
  openGraph: {
    title: "OkforAI - Is Your Website Visible to AI?",
    description: "People no longer just Google it. They ask ChatGPT, Grok, and Perplexity. Check if AI agents can find and recommend your website.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OkforAI - Is Your Website Visible to AI?",
    description: "People no longer just Google it. Check if AI agents can find and recommend your website.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
