import Link from "next/link";
import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Privacy Policy | LEXIA",
    description: "LEXIA Privacy Policy - How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
                <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            LEXIA ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
                            explains how we collect, use, disclose, and safeguard your information when you use our
                            AI-powered English learning platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <div className="space-y-4 text-muted-foreground">
                            <div>
                                <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Name, email address, and profile information</li>
                                    <li>Payment information (processed securely via Stripe)</li>
                                    <li>Learning preferences and goals</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-foreground">Usage Data</h3>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Learning progress and performance data</li>
                                    <li>Interaction with AI features</li>
                                    <li>Device and browser information</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>To provide and personalize our learning services</li>
                            <li>To process payments and manage subscriptions</li>
                            <li>To improve our AI models and content</li>
                            <li>To send notifications about your learning progress</li>
                            <li>To respond to your inquiries and support requests</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures to protect your personal information,
                            including encryption, secure servers, and regular security audits. However, no method
                            of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Access and download your personal data</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your account and data</li>
                            <li>Opt-out of marketing communications</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use cookies and similar technologies to enhance your experience, analyze usage,
                            and maintain your session. You can manage cookie preferences in your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have questions about this Privacy Policy or your personal data, please contact us at:{" "}
                            <a href="mailto:privacy@lexia.edu" className="text-primary hover:underline">
                                privacy@lexia.edu
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
