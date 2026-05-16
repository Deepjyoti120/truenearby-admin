"use client"

import { useState } from "react"
import { Coins, Loader2, Save } from "lucide-react"
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
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from "@/features/settings/api"
import { useAdminProfileQuery } from "@/features/profile/query"
import { useIsEditAccess } from "@/features/read-only-admin/state"
import {
  useAppSettingsQuery,
  useUpdateCurrencyMutation,
} from "@/features/settings/query"

export function CurrencySettingsCard() {
  const { data: profile } = useAdminProfileQuery()
  const { data: settings, isLoading } = useAppSettingsQuery()
  const mutation = useUpdateCurrencyMutation()
  const isReadOnly = useIsEditAccess()

  // Track only the user's pending edit. The displayed value is derived
  // from `userEdit ?? settings.currency`, which avoids setState-in-effect
  // entirely (React 19's lint rule disallows it).
  const [userEdit, setUserEdit] = useState<SupportedCurrency | null>(null)

  // Hide the card entirely for non-admin accounts — there's nothing to
  // configure unless you have admin role.
  if (profile && profile.account.role !== "admin") {
    return null
  }

  const persisted: SupportedCurrency = settings?.currency ?? "USD"
  const value: SupportedCurrency = userEdit ?? persisted
  const dirty = value !== persisted

  const handleSave = () => {
    if (isReadOnly) {
      toast.error("Editing is disabled for this account")
      return
    }
    if (!dirty) return
    mutation.mutate(value, {
      onSuccess: (next) => {
        // Clear the edit so the derived value reflects the cache
        // (which `onSuccess` in the mutation hook has just updated).
        setUserEdit(null)
        toast.success("Currency updated", {
          description: `All subscription prices now display in ${next.currency}.`,
        })
      },
      onError: (err) => {
        toast.error("Could not update currency", {
          description: err instanceof Error ? err.message : "Unknown error",
        })
      },
    })
  }

  return (
    <Card className="bg-white/94">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
          <Coins className="size-5 text-emerald-600" />
          Store currency
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-600">
          Global currency applied to all subscription plan prices. Admin only.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="currency-select"
            className="text-sm font-medium text-slate-900"
          >
            Currency
          </label>
          <Select
            value={value}
            onValueChange={(v) => setUserEdit(v as SupportedCurrency)}
            disabled={isLoading}
          >
            <SelectTrigger
              id="currency-select"
              className="sm:w-60"
              aria-label="Currency"
            >
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            {isLoading
              ? "Loading…"
              : `Currently saved: ${persisted}`}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!dirty || mutation.isPending}
          className="sm:self-end"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save currency
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
