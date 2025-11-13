import { Loader2 } from "lucide-react";

/**
 * LoadingScreen Component
 *
 * Full-screen loading indicator for initial app loading or auth initialization.
 * Shows a centered spinner with optional loading message.
 *
 * Use cases:
 * - Initial auth check on app mount
 * - Page transitions
 * - Data loading states
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <LoadingScreen message="Loading your session..." />;
 * }
 * ```
 */
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
