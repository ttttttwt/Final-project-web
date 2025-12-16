import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Role-Play Practice | LEXIA",
  description:
    "Practice English conversations in realistic business scenarios with AI-powered role-play.",
  openGraph: {
    title: "Role-Play Practice | LEXIA",
    description:
      "Practice English conversations in realistic business scenarios with AI-powered role-play.",
  },
};

export default function RolePlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
