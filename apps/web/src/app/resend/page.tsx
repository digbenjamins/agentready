"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ResendPage() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const honeypot = (form.elements.namedItem("company") as HTMLInputElement)?.value;
    if (honeypot) return;
    if (!email.trim() || !website.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/submission/resend-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Could not resend. Check your email and website.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center justify-between h-14 px-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">OKFOR</span>
            <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded-md">AI ✓</span>
          </Link>
          <Link href="/" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            Scan a site
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-md px-6 py-20">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              If a report exists for that email and website, we sent a new unlock link.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-bold">Resend unlock link</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Enter the email and website you used when scanning. We will send a new unlock link if a report exists.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="website" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Website
                </label>
                <Input
                  id="website"
                  type="text"
                  placeholder="example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <input type="text" name="company" autoComplete="off" tabIndex={-1} aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none" />
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend link"}
              </Button>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </form>
          </>
        )}
      </div>
    </main>
  );
}
