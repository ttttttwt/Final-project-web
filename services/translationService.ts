/**
 * Translation Service using MyMemory Free API
 * Free tier: 5000 characters/day, no API key required
 */

// Cache key prefix for localStorage
const CACHE_PREFIX = "lexia_translation_";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface TranslationCache {
  translation: string;
  timestamp: number;
}

interface MyMemoryResponse {
  responseStatus: number;
  responseData: {
    translatedText: string;
    match: number;
  };
  quotaFinished?: boolean;
  mtLangSupported?: boolean;
}

/**
 * Get cached translation from localStorage
 */
function getCachedTranslation(
  text: string,
  targetLang: string
): string | null {
  if (typeof window === "undefined") return null;

  try {
    const key = `${CACHE_PREFIX}${targetLang}_${btoa(encodeURIComponent(text))}`;
    const cached = localStorage.getItem(key);

    if (cached) {
      const { translation, timestamp }: TranslationCache = JSON.parse(cached);
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
        return translation;
      }
      // Remove expired cache
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore cache errors
  }

  return null;
}

/**
 * Save translation to localStorage cache
 */
function setCachedTranslation(
  text: string,
  targetLang: string,
  translation: string
): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${CACHE_PREFIX}${targetLang}_${btoa(encodeURIComponent(text))}`;
    const cache: TranslationCache = {
      translation,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cache));
  } catch {
    // Ignore cache errors (e.g., quota exceeded)
  }
}

/**
 * Translate text to target language using MyMemory API
 * @param text - Text to translate (max 500 characters recommended)
 * @param targetLang - Target language code (default: "vi" for Vietnamese)
 * @param sourceLang - Source language code (default: "en" for English)
 * @returns Translated text
 */
export async function translateText(
  text: string,
  targetLang: string = "vi",
  sourceLang: string = "en"
): Promise<string> {
  // Validate input
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("Text cannot be empty");
  }

  // Check cache first
  const cached = getCachedTranslation(trimmedText, targetLang);
  if (cached) {
    return cached;
  }

  // Limit text length to avoid API issues
  const textToTranslate = trimmedText.slice(0, 500);

  try {
    const encodedText = encodeURIComponent(textToTranslate);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLang}|${targetLang}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data: MyMemoryResponse = await response.json();

    // Check for quota exceeded
    if (data.quotaFinished) {
      throw new Error("Daily translation quota exceeded");
    }

    // Check response status
    if (data.responseStatus !== 200) {
      throw new Error("Translation failed");
    }

    const translation = data.responseData.translatedText;

    // Cache the result
    setCachedTranslation(trimmedText, targetLang, translation);

    return translation;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Translation failed. Please try again.");
  }
}

/**
 * Get the selected text from the window
 */
export function getSelectedText(): string {
  if (typeof window === "undefined") return "";
  return window.getSelection()?.toString()?.trim() || "";
}

/**
 * Clear translation cache (useful for testing or storage management)
 */
export function clearTranslationCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore errors
  }
}
