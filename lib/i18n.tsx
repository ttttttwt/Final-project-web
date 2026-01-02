"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { messages, type Locale, defaultLocale } from "@/messages";

/**
 * i18n Context for LEXIA
 * 
 * Provides internationalization support with:
 * - Language switching
 * - Translation lookup with interpolation
 * - Persistence via user profile
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageBundle = Record<string, any>;

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: TranslationFunction;
    messages: MessageBundle;
}

type TranslationFunction = (
    key: string,
    params?: Record<string, string | number>
) => string;

const I18nContext = createContext<I18nContextType | null>(null);

/**
 * Get nested value from object using dot notation
 * e.g., getNestedValue(obj, "settings.title") => obj.settings.title
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce((current, key) => {
        if (current && typeof current === "object" && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj as unknown);
}

/**
 * Interpolate variables in translation string
 * Supports both {name} and {{name}} syntax for compatibility
 * e.g., "Hello, {{name}}!" with {name: "John"} => "Hello, John!"
 */
function interpolate(
    text: string,
    params?: Record<string, string | number>
): string {
    if (!params) return text;

    // Support both {{variable}} and {variable} syntax
    return text
        .replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match;
        })
        .replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match;
        });
}

interface I18nProviderProps {
    children: React.ReactNode;
    initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load locale from localStorage on mount (client-side only)
    useEffect(() => {
        const savedLocale = localStorage.getItem("lexia-locale") as Locale | null;
        if (savedLocale && savedLocale in messages) {
            setLocaleState(savedLocale);
        }
        setIsInitialized(true);
    }, []);

    // Set locale and persist to localStorage
    const setLocale = useCallback((newLocale: Locale) => {
        if (newLocale in messages) {
            setLocaleState(newLocale);
            localStorage.setItem("lexia-locale", newLocale);
        }
    }, []);

    // Translation function
    const t: TranslationFunction = useCallback(
        (key: string, params?: Record<string, string | number>) => {
            const currentMessages = messages[locale];
            const value = getNestedValue(currentMessages as Record<string, unknown>, key);

            if (typeof value === "string") {
                return interpolate(value, params);
            }

            // Fallback to English if key not found
            if (locale !== defaultLocale) {
                const fallbackValue = getNestedValue(
                    messages[defaultLocale] as Record<string, unknown>,
                    key
                );
                if (typeof fallbackValue === "string") {
                    return interpolate(fallbackValue, params);
                }
            }

            // Return key if translation not found
            console.warn(`Translation not found: ${key}`);
            return key;
        },
        [locale]
    );

    const contextValue = useMemo(
        () => ({
            locale,
            setLocale,
            t,
            messages: messages[locale],
        }),
        [locale, setLocale, t]
    );

    // Prevent hydration mismatch by not rendering until initialized
    if (!isInitialized) {
        return null;
    }

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
}

/**
 * Hook to access i18n context
 */
export function useTranslation() {
    const context = useContext(I18nContext);

    if (!context) {
        throw new Error("useTranslation must be used within an I18nProvider");
    }

    return context;
}

/**
 * Hook to access just the translation function
 * Useful for simple translation needs
 */
export function useT() {
    const { t } = useTranslation();
    return t;
}
