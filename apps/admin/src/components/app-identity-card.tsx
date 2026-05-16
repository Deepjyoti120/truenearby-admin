"use client"

import { useState } from "react"
import { Building2, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { getLocalSupportedCurrencies } from "@/features/settings/api"
import { useAdminProfileQuery } from "@/features/profile/query"
import { useIsEditAccess } from "@/features/read-only-admin/state"
import {
  useAppSettingsQuery,
  useUpdateSettingsMutation,
} from "@/features/settings/query"

export function AppIdentityCard() {
  const { data: profile } = useAdminProfileQuery()
  const { data: settings, isLoading } = useAppSettingsQuery()
  const mutation = useUpdateSettingsMutation()
  const isReadOnly = useIsEditAccess()

  // Track only user edits — derived values fall back to persisted settings.
  // Keeps the form in sync with server state without setState-in-effect.
  const [appNameEdit, setAppNameEdit] = useState<string | null>(null)
  const [currencyEdit, setCurrencyEdit] = useState<string | null>(null)

  // Hide entirely for non-admin accounts.
  if (profile && profile.account.role !== "admin") {
    return null
  }

  const persistedAppName = settings?.appName ?? "Dating Admin"
  const persistedCurrency = settings?.currency ?? "USD"
  const appName = appNameEdit ?? persistedAppName
  const currency = currencyEdit ?? persistedCurrency

  // Prefer the server's curated list (it's the authoritative validator),
  // but fall back to the local Intl list while the GET is still loading.
  // React 19's compiler handles memoization, so no useMemo here.
  const currencyOptions = settings?.supportedCurrencies?.length
    ? [...settings.supportedCurrencies].sort()
    : getLocalSupportedCurrencies()

  const dirty =
    appName.trim() !== persistedAppName || currency !== persistedCurrency
  const trimmedName = appName.trim()
  const validName = trimmedName.length >= 1 && trimmedName.length <= 60

  const handleSave = () => {
    if (isReadOnly) {
      toast.error("Editing is disabled for this account")
      return
    }
    if (!dirty || !validName) return

    const payload: { currency?: string; appName?: string } = {}
    if (currency !== persistedCurrency) payload.currency = currency
    if (trimmedName !== persistedAppName) payload.appName = trimmedName

    mutation.mutate(payload, {
      onSuccess: (next) => {
        setAppNameEdit(null)
        setCurrencyEdit(null)
        toast.success("Settings saved", {
          description: `Brand: ${next.appName} · Currency: ${next.currency}`,
        })
      },
      onError: (err) => {
        toast.error("Could not save settings", {
          description: err instanceof Error ? err.message : "Unknown error",
        })
      },
    })
  }

  return (
    <Card className="bg-white/94">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
          <Building2 className="size-5 text-emerald-600" />
          App identity
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-600">
          Brand name shown across the admin panel, and the global currency
          applied to all subscription plan prices. Admin only.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="app-name">App name</FieldLabel>
            <Input
              id="app-name"
              value={appName}
              maxLength={60}
              onChange={(e) => setAppNameEdit(e.target.value)}
              placeholder="Dating Admin"
              disabled={isLoading}
            />
            <FieldDescription>
              Displayed in the sidebar header and other branding spots in the
              admin app.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="currency-select">Currency</FieldLabel>
            <Select
              value={currency}
              onValueChange={(v) => setCurrencyEdit(v)}
              disabled={isLoading}
            >
              <SelectTrigger
                id="currency-select"
                className="sm:w-60"
                aria-label="Currency"
              >
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {currencyOptions.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              {isLoading
                ? "Loading…"
                : `Currently saved: ${persistedCurrency} · ${currencyOptions.length} ISO 4217 codes available`}
            </FieldDescription>
          </Field>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!dirty || !validName || mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
