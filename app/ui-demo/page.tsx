"use client";

import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { BookOpen, Star, Clock, CheckCircle } from "lucide-react";

/**
 * UI Demo Page
 *
 * Demonstrates the new Version B (Yellow Accent) design system
 * with all updated components following Medium-inspired principles.
 */
export default function UIDemo() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif text-[#202124] dark:text-[#E8EAED] mb-4">
          LEXIA Design System
        </h1>
        <p className="text-lg text-[#5F6368] dark:text-[#9AA0A6] max-w-2xl mx-auto">
          Version B (Yellow Accent) - Medium-inspired design with Deep Blue
          primary and Warm Yellow accent colors. Clean, minimal, and focused on
          content.
        </p>
      </section>

      {/* Color Palette */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED] mb-6">
          Color Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-[#1A73E8] dark:bg-[#8AB4F8] shadow-lg" />
            <div>
              <p className="font-medium text-[#202124] dark:text-[#E8EAED]">
                Primary
              </p>
              <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                Deep Blue
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-[#FFB300] dark:bg-[#FDD663] shadow-lg" />
            <div>
              <p className="font-medium text-[#202124] dark:text-[#E8EAED]">
                Accent
              </p>
              <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                Warm Yellow
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-[#34A853] dark:bg-[#81C995] shadow-lg" />
            <div>
              <p className="font-medium text-[#202124] dark:text-[#E8EAED]">
                Success
              </p>
              <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                Green
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-[#EA4335] dark:bg-[#F28B82] shadow-lg" />
            <div>
              <p className="font-medium text-[#202124] dark:text-[#E8EAED]">
                Error
              </p>
              <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">Red</p>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED] mb-6">
          Buttons
        </h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="accent">Accent Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Star className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              With Icon
            </Button>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED] mb-6">
          Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Primary</Badge>
          <Badge variant="accent">Featured</Badge>
          <Badge variant="success">Completed</Badge>
          <Badge variant="secondary">Draft</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED] mb-6">
          Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course Card Example */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    Business English
                  </CardTitle>
                  <CardDescription>
                    Professional communication skills for the workplace
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="accent">Featured</Badge>
                <Badge variant="outline">Intermediate</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  <Clock className="h-4 w-4" />
                  <span>24 lessons • 8 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  <Star className="h-4 w-4 fill-[#FFB300] dark:fill-[#FDD663] text-[#FFB300] dark:text-[#FDD663]" />
                  <span>4.8 (1,234 reviews)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Start Learning</Button>
            </CardFooter>
          </Card>

          {/* Progress Card Example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Your Progress</CardTitle>
              <CardDescription>Keep up the great work!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#5F6368] dark:text-[#9AA0A6]">
                      Course Completion
                    </span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      75%
                    </span>
                  </div>
                  <div className="h-2 bg-[#E0E0E0] dark:bg-[#2E2E2E] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A73E8] dark:bg-[#8AB4F8] rounded-full"
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#34A853] dark:text-[#81C995]" />
                  <span className="text-[#5F6368] dark:text-[#9AA0A6]">
                    18 of 24 lessons completed
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="accent" className="w-full">
                Continue Learning
              </Button>
            </CardFooter>
          </Card>

          {/* Stats Card Example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">This Week</CardTitle>
              <CardDescription>Your learning statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#5F6368] dark:text-[#9AA0A6]">
                    Study time
                  </span>
                  <span className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
                    4.5h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5F6368] dark:text-[#9AA0A6]">
                    Lessons completed
                  </span>
                  <span className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
                    12
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5F6368] dark:text-[#9AA0A6]">
                    Streak
                  </span>
                  <span className="text-2xl font-bold text-[#FFB300] dark:text-[#FDD663]">
                    7 days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Typography */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED] mb-6">
          Typography
        </h2>
        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-[#202124] dark:text-[#E8EAED]">
            Heading 1 - Georgia Serif
          </h1>
          <h2 className="text-4xl font-serif text-[#202124] dark:text-[#E8EAED]">
            Heading 2 - Georgia Serif
          </h2>
          <h3 className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED]">
            Heading 3 - Georgia Serif
          </h3>
          <p className="text-lg text-[#202124] dark:text-[#E8EAED]">
            Body text - System UI Sans-serif. This is a larger paragraph with
            comfortable line-height (1.6) for optimal readability. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit.
          </p>
          <p className="text-base text-[#5F6368] dark:text-[#9AA0A6]">
            Secondary text color for less emphasis, but still readable with
            proper contrast ratio.
          </p>
          <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
            Small text for captions, metadata, and supplementary information.
          </p>
        </div>
      </section>

      {/* Design Principles */}
      <section className="mb-16">
        <h2 className="text-3xl font-serif text-[#202124] dark:text-[#E8EAED] mb-6">
          Design Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content-First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                Learning content is the center of attention. UI elements support
                without distracting.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Minimalist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                Clean, simple interface with generous white space and clear
                visual hierarchy.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Readable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                Typography with proper sizing, line-height, and contrast for
                comfortable reading.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Responsive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                Adapts beautifully from 320px mobile to 1920px desktop displays.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
