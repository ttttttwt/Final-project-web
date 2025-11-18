import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Sparkles,
  Target,
  Users,
  Zap,
  CheckCircle2,
  Quote,
  TrendingUp,
  Award,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LEXIA</span>
          </Link>
          <nav className="hidden items-center space-x-6 md:flex">
            <Link
              href="/courses"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Courses
            </Link>
            <Link
              href="/learning-paths"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Learning Paths
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 md:py-28 lg:py-36">
          <div className="flex max-w-[980px] flex-col items-center gap-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              AI-Powered English Learning Platform
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Master Business English
              <br />
              <span className="bg-linear-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                with AI Personalization
              </span>
            </h1>
            <p className="max-w-[700px] text-xl leading-relaxed text-muted-foreground md:text-2xl">
              Transform your career with LEXIA's AI-powered lessons, interactive
              conversations, and real-world business scenarios designed for
              working professionals.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-14 gap-2 px-8 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
                >
                  Start Learning Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 gap-2 border-2 px-8 text-base font-semibold"
                >
                  <BookOpen className="h-5 w-5" />
                  Explore Courses
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Free forever
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Start in 2 minutes
              </div>
            </div>
          </div>
        </div>
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary md:text-5xl">
                10K+
              </div>
              <div className="text-sm text-muted-foreground md:text-base">
                Active Learners
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary md:text-5xl">
                500+
              </div>
              <div className="text-sm text-muted-foreground md:text-base">
                Expert Lessons
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary md:text-5xl">
                95%
              </div>
              <div className="text-sm text-muted-foreground md:text-base">
                Success Rate
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary md:text-5xl">
                A1-C2
              </div>
              <div className="text-sm text-muted-foreground md:text-base">
                CEFR Levels
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full">
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Award className="h-4 w-4" />
              Premium Features
            </div>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Why Choose LEXIA?
            </h2>
            <p className="mt-6 text-xl text-muted-foreground">
              Advanced AI technology meets proven language learning methodology
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">AI-Powered Learning</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Personalized lessons that adapt to your level and learning style
                using advanced AI technology. Get real-time feedback and
                guidance.
              </p>
            </div>

            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Business Focused</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Master professional English for meetings, presentations, emails,
                and workplace communication. Build real-world skills.
              </p>
            </div>

            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-purple-600 shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Fast Progress</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Track your improvement with detailed analytics and achieve your
                goals faster with structured learning paths and milestones.
              </p>
            </div>

            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-green-600 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Interactive Practice</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Engage in realistic role-play scenarios and conversations
                powered by AI to build confidence and fluency.
              </p>
            </div>

            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-orange-600 shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Flexible Learning</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Learn at your own pace with bite-sized lessons that fit your
                busy professional schedule. Study anytime, anywhere.
              </p>
            </div>

            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-pink-600 shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">CEFR Aligned</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Follow internationally recognized standards from A1 to C2 with
                certified progress tracking and detailed assessments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" />
              Success Stories
            </div>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Loved by Professionals Worldwide
            </h2>
            <p className="mt-6 text-xl text-muted-foreground">
              See how LEXIA is transforming careers and communication skills
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-8 shadow-sm">
              <Quote className="mb-4 h-8 w-8 text-primary/40" />
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">
                "LEXIA's AI-powered lessons helped me land my dream job at an
                international company. The business English focus was exactly
                what I needed."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  SA
                </div>
                <div>
                  <div className="font-semibold">Sarah Anderson</div>
                  <div className="text-sm text-muted-foreground">
                    Marketing Manager
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-8 shadow-sm">
              <Quote className="mb-4 h-8 w-8 text-primary/40" />
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">
                "The interactive role-play scenarios boosted my confidence in
                client meetings. I can now present in English without
                hesitation."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  MC
                </div>
                <div>
                  <div className="font-semibold">Michael Chen</div>
                  <div className="text-sm text-muted-foreground">
                    Sales Director
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-8 shadow-sm">
              <Quote className="mb-4 h-8 w-8 text-primary/40" />
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">
                "From B1 to C1 in just 6 months! The structured learning path
                and personalized feedback made all the difference."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  EP
                </div>
                <div>
                  <div className="font-semibold">Elena Popova</div>
                  <div className="text-sm text-muted-foreground">
                    Software Engineer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-blue-500/10" />
        <div className="container relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Ready to Transform Your English Skills?
            </h2>
            <p className="text-xl leading-relaxed text-muted-foreground">
              Join thousands of professionals who are advancing their careers
              with better English communication. Start your journey today.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 gap-2 px-8 text-base font-semibold shadow-xl transition-all hover:shadow-2xl"
              >
                Create Your Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Start learning in 2 minutes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">LEXIA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered English learning platform for working professionals.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/courses" className="hover:text-foreground">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link
                    href="/learning-paths"
                    className="hover:text-foreground"
                  >
                    Learning Paths
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 LEXIA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
