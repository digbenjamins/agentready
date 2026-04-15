import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - OkforAI",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center justify-between h-14 px-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">OKFOR</span>
            <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded-md">AI</span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-xs text-muted-foreground/60">Last updated: April 14, 2026</p>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">1. What we collect</h2>
            <p>When you use OkforAI, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Website URL</strong> you submit for scanning</li>
              <li><strong className="text-foreground">Email address</strong> if you provide one (via Stripe checkout or voluntarily)</li>
              <li><strong className="text-foreground">Payment data</strong> processed by Stripe. We do not store card numbers or payment credentials.</li>
              <li><strong className="text-foreground">IP address</strong> for rate limiting and abuse prevention (not stored permanently)</li>
              <li><strong className="text-foreground">Scan results</strong> including check outcomes and AI-generated analysis</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">2. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To generate and deliver your audit report</li>
              <li>To send you your report access link via email</li>
              <li>To process payments via Stripe</li>
              <li>To prevent abuse and enforce rate limits</li>
            </ul>
            <p>We do not sell your data. We do not use your data for advertising.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">3. Third-party services</h2>
            <p>We use the following third-party services that process your data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Stripe</strong> for payment processing</li>
              <li><strong className="text-foreground">Resend</strong> for transactional email delivery</li>
              <li><strong className="text-foreground">OpenRouter</strong> for AI model access (your website URL and public content may be sent to AI models for analysis)</li>
              <li><strong className="text-foreground">Supabase</strong> for database hosting (EU region)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">4. Data retention</h2>
            <p>Scan results and reports are stored indefinitely so you can access them via your report link. You can request deletion of your data by contacting us at hello@okfor.ai.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">5. Your rights (GDPR)</h2>
            <p>If you are located in the European Economic Area, you have the right to access, correct, delete, or export your personal data. To exercise these rights, contact us at hello@okfor.ai.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">6. Cookies</h2>
            <p>We use only essential cookies required for the service to function (e.g., admin session). We do not use tracking or advertising cookies.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">7. Contact</h2>
            <p>For privacy-related questions, contact us at hello@okfor.ai.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
