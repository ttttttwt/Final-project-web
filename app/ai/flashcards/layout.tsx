import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards | LEXIA",
  description:
    "Study vocabulary with AI-generated flashcards and spaced repetition for optimal learning.",
  openGraph: {
    title: "Flashcards | LEXIA",
    description:
      "Study vocabulary with AI-generated flashcards and spaced repetition for optimal learning.",
  },
};

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
