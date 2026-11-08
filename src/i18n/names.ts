import type { Locale } from './index';

/**
 * Language names for the language picker, which runs in the browser.
 * Kept here (and not read from the dictionaries) so the browser doesn't have to download
 * all four full dictionaries just to show four words. Same as `languageName` in each dictionary.
 */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
};
