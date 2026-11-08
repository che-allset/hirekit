import en from './en';
import de from './de';
import es from './es';
import fr from './fr';

export const LOCALES = ['en', 'de', 'es', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export type Dict = typeof en;

export const DICTS: Record<Locale, Dict> = { en, de, es, fr };
export const LOCALE_COOKIE = 'hk_lang';

/** Language name the AI should write in, per locale. */
export const AI_LANGUAGE: Record<Locale, string> = { en: 'English', de: 'German', es: 'Spanish', fr: 'French' };

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

/** Fill {placeholders} in a dictionary string. */
export function fmt(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/**
 * Singular or plural string for a count, by the language's own rules
 * (French uses the singular for 0 and 1; English, German and Spanish only for 1).
 */
export function plural(locale: string, n: number, one: string, other: string) {
  return new Intl.PluralRules(locale).select(n) === 'one' ? one : other;
}

/** Best match from an Accept-Language header. */
export function fromAcceptLanguage(header: string | null): Locale {
  if (!header) return 'en';
  for (const part of header.split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return 'en';
}
