/**
 * Messages index - exports all translation bundles
 */
export { en, type Messages } from "./en";
export { vi } from "./vi";

import { en } from "./en";
import { vi } from "./vi";

export const messages = {
  en,
  vi,
} as const;

export type Locale = keyof typeof messages;
export const locales: Locale[] = ["en", "vi"];
export const defaultLocale: Locale = "en";
