import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(path?: string | null) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  
  // Get API URL from env
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088/api/v1";
  
  try {
    const url = new URL(apiUrl);
    // If path starts with /, append it to origin
    if (path.startsWith("/")) {
      return `${url.origin}${path}`;
    }
    // Otherwise, append to origin with /
    return `${url.origin}/${path}`;
  } catch {
    return path;
  }
}
