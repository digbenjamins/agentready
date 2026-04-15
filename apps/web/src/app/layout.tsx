import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-WEP5V9KNEM" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-WEP5V9KNEM');`}
      </Script>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
