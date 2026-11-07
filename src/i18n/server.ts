import 'server-only';
import { cookies, headers } from 'next/headers';
import { DICTS, LOCALE_COOKIE, fromAcceptLanguage, isLocale, type Locale } from './index';

/**
 * Locale for this request: explicit ?lang= (used by the embed widget), then the
 * visitor's saved choice, then their browser language, then English.
 */
export function getLocale(explicit?: string | null): Locale {
  if (isLocale(explicit)) return explicit;
  const saved = cookies().get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return fromAcceptLanguage(headers().get('accept-language'));
}

export function getDict(explicit?: string | null) {
  const locale = getLocale(explicit);
  return { locale, t: DICTS[locale] };
}
