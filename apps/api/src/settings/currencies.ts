// Comprehensive ISO 4217 currency list. We prefer the runtime list from
// `Intl.supportedValuesOf('currency')` (Node 18+, modern browsers — ~157
// active codes) and fall back to a curated subset only if the runtime
// doesn't expose it (older Node, restricted ICU builds).
//
// This avoids a third-party currency package: the platform already ships
// the canonical list.

const FALLBACK_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'SGD', 'AED', 'BRL',
  'CHF', 'CNY', 'HKD', 'KRW', 'MXN', 'NZD', 'NOK', 'SEK', 'TRY', 'ZAR',
  'IDR', 'MYR', 'THB', 'PHP', 'VND', 'PKR', 'BDT', 'EGP', 'SAR', 'NGN',
] as const;

function loadCurrencies(): string[] {
  const intlAny = Intl as unknown as {
    supportedValuesOf?: (key: string) => string[];
  };
  if (typeof intlAny.supportedValuesOf === 'function') {
    try {
      const codes = intlAny.supportedValuesOf('currency');
      if (Array.isArray(codes) && codes.length > 0) {
        return codes;
      }
    } catch {
      // fall through to static list
    }
  }
  return [...FALLBACK_CURRENCIES];
}

const SUPPORTED_CURRENCIES_LIST: string[] = loadCurrencies().slice().sort();
const SUPPORTED_CURRENCIES_SET: Set<string> = new Set(SUPPORTED_CURRENCIES_LIST);

export function getSupportedCurrencies(): string[] {
  return SUPPORTED_CURRENCIES_LIST;
}

export function isSupportedCurrency(code: string): boolean {
  return SUPPORTED_CURRENCIES_SET.has(code);
}
