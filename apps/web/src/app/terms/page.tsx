import Link from "next/link";

export const metadata = {
  title: "Terms of Service - OkforAI",
};

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-xs text-muted-foreground/60">Last updated: April 14, 2026</p>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">1. Service description</h2>
            <p>OkforAI ("we", "us", "our") provides an automated website audit service that analyzes how discoverable a website is by AI-powered search and recommendation systems. Our service includes automated technical checks and AI-generated analysis reports.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">2. AI-generated content</h2>
            <p>Parts of our reports are generated using third-party AI models (including but not limited to GPT, Claude, Gemini, Grok, Perplexity, Mistral, and Meta Llama). This AI-generated content is provided for informational purposes only. Results may vary between scans, even for the same website, due to the non-deterministic nature of AI models and changes in their underlying training data and algorithms.</p>
            <p>We do not guarantee the accuracy, completeness, or reliability of AI-generated findings. You should independently verify any recommendations before implementing them.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">3. Acceptable use</h2>
            <p>You may only scan websites that you own or have explicit authorization to audit. You agree not to use our service to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Scan websites without the owner's consent</li>
              <li>Attempt to overload, disrupt, or exploit our infrastructure</li>
              <li>Reverse-engineer, scrape, or extract our proprietary check logic</li>
              <li>Resell or redistribute reports without our written permission</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">4. Payments and refunds</h2>
            <p>Pro audit purchases are one-time payments processed via Stripe. All prices are in EUR and include applicable taxes. Due to the instant digital delivery of reports, refunds are handled on a case-by-case basis. Contact us at hello@okfor.ai for refund requests.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">5. Intellectual property</h2>
            <p>The audit methodology, check definitions, scoring system, and platform design are the intellectual property of OkforAI. Your report data belongs to you, but the underlying analysis framework remains ours.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">6. Limitation of liability</h2>
            <p>Our service is provided "as is" without warranties of any kind. We are not liable for any damages resulting from your use of or inability to use our service, including but not limited to losses caused by implementing recommendations from our reports.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">7. Changes to these terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">8. Contact</h2>
            <p>Questions about these terms? Reach us at hello@okfor.ai.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
