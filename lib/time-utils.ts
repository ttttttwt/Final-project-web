/**
 * Format seconds into a mm:ss display string.
 * @param seconds - Total seconds to format
 * @returns Formatted time string (e.g., "5:30")
 */
export function formatTimeDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format seconds into a human-readable duration.
 * @param seconds - Total seconds to format
 * @returns Human-readable duration (e.g., "2m 30s" or "45s")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format seconds into hours and minutes.
 * @param seconds - Total seconds to format
 * @returns Human-readable duration (e.g., "2h 30m" or "45 min")
 */
export function formatHoursDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
}
