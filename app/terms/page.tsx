import Link from "next/link";
import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Terms of Service | LEXIA",
    description: "LEXIA Terms of Service - Rules and guidelines for using our platform.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <Brain className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">LEXIA</span>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto max-w-4xl px-4 py-16">
                <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using LEXIA's AI-powered English learning platform, you agree to be
                            bound by these Terms of Service. If you do not agree to these terms, please do not
                            use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            LEXIA provides an AI-powered English learning platform designed for working professionals.
                            Our services include interactive lessons, AI-generated content, role-play scenarios,
                            flashcards, and grammar exercises.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>You must provide accurate and complete registration information</li>
                            <li>You are responsible for maintaining the security of your account</li>
                            <li>You must be at least 16 years old to use our services</li>
                            <li>One person may not maintain more than one account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payments</h2>
                        <div className="space-y-4 text-muted-foreground">
                            <p className="leading-relaxed">
                                LEXIA offers both free and paid subscription plans. For paid subscriptions:
                            </p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Payments are processed securely through Stripe</li>
                                <li>Subscriptions automatically renew unless cancelled</li>
                                <li>You may cancel your subscription at any time</li>
                                <li>Refunds are handled on a case-by-case basis</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You agree not to:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Use the service for any illegal purpose</li>
                            <li>Share your account credentials with others</li>
                            <li>Attempt to access other users' accounts</li>
                            <li>Interfere with or disrupt the service</li>
                            <li>Use automated tools to access the service without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            All content on LEXIA, including lessons, AI-generated materials, and software,
                            is the property of LEXIA or its licensors. You may not reproduce, distribute,
                            or create derivative works without our express permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. AI-Generated Content</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our AI features generate content to assist your learning. While we strive for accuracy,
                            AI-generated content may occasionally contain errors. LEXIA is not responsible for
                            decisions made based on AI-generated content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to suspend or terminate your account if you violate these terms.
                            You may also delete your account at any time through your profile settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            LEXIA is provided "as is" without warranties of any kind. We shall not be liable
                            for any indirect, incidental, or consequential damages arising from your use of
                            our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            For questions about these Terms, please contact us at:{" "}
                            <a href="mailto:legal@lexia.edu" className="text-primary hover:underline">
                                legal@lexia.edu
                            </a>
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t mt-16">
                <div className="container mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>© 2025 LEXIA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
