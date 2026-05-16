import { apiFetch, parseApiError } from "@/lib/api"

// Curated fallback list used only if the runtime doesn't expose
// `Intl.supportedValuesOf('currency')`. The browser/Node 18+ runtime
// gives us ~157 active ISO 4217 codes.
const FALLBACK_CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "SGD", "AED", "BRL",
  "CHF", "CNY", "HKD", "KRW", "MXN", "NZD", "NOK", "SEK", "TRY", "ZAR",
] as const

export function getLocalSupportedCurrencies(): string[] {
  const intlAny = Intl as unknown as {
    supportedValuesOf?: (key: string) => string[]
  }
  if (typeof intlAny.supportedValuesOf === "function") {
    try {
      const list = intlAny.supportedValuesOf("currency")
      if (Array.isArray(list) && list.length > 0) {
        return [...list].sort()
      }
    } catch {
      // fall through
    }
  }
  return [...FALLBACK_CURRENCIES].sort()
}

export type AppSettings = {
  appName: string
  currency: string
  supportedCurrencies: string[]
}

type Envelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await apiFetch(`/api/v1/settings`)
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load app settings"))
  }
  const body = (await res.json()) as Envelope<AppSettings>
  if (!body?.data) {
    throw new Error("Invalid settings response returned from API")
  }
  return body.data
}

export type UpdateSettingsInput = {
  currency?: string
  appName?: string
}

export async function updateSettings(
  input: UpdateSettingsInput,
): Promise<AppSettings> {
  const res = await apiFetch(`/api/v1/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update settings"))
  }
  const body = (await res.json()) as Envelope<AppSettings>
  if (!body?.data) {
    throw new Error("Invalid settings update response returned from API")
  }
  return body.data
}

// Currency symbol overrides for codes Intl.NumberFormat doesn't render
// nicely in narrow contexts. Intl handles 99% of cases on its own.
const CURRENCY_SYMBOL_OVERRIDES: Record<string, string> = {
  AED: "د.إ",
}

export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    const symbol = CURRENCY_SYMBOL_OVERRIDES[currency] ?? currency
    return `${symbol}${amount.toFixed(2)}`
  }
}
