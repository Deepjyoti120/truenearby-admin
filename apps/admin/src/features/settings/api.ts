import { apiFetch, parseApiError } from "@/lib/api"

// Keep this list in sync with apps/api/src/settings/dto/update-currency.dto.ts
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "CAD",
  "AUD",
  "JPY",
  "SGD",
  "AED",
  "BRL",
] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export type AppSettings = {
  currency: SupportedCurrency
  supportedCurrencies: SupportedCurrency[]
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

export async function updateCurrency(
  currency: SupportedCurrency,
): Promise<AppSettings> {
  const res = await apiFetch(`/api/v1/settings/currency`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currency }),
  })
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update currency"))
  }
  const body = (await res.json()) as Envelope<AppSettings>
  if (!body?.data) {
    throw new Error("Invalid currency update response returned from API")
  }
  return body.data
}

const CURRENCY_SYMBOLS: Partial<Record<SupportedCurrency, string>> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "$",
  AUD: "$",
  JPY: "¥",
  SGD: "$",
  AED: "د.إ",
  BRL: "R$",
}

export function formatPrice(amount: number, currency: SupportedCurrency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency
    return `${symbol}${amount.toFixed(2)}`
  }
}
