"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import {
  PLAN_TIERS,
  type AdminSubscriptionPlanRow,
  type CreatePlanInput,
  type PlanTier,
  type UpdatePlanInput,
} from "@/features/subscriptions/api"
import {
  useCreatePlanMutation,
  useUpdatePlanMutation,
} from "@/features/subscriptions/query"

type Mode = "create" | "edit"

type FormState = {
  code: PlanTier
  name: string
  description: string
  durationDays: string
  sortOrder: string
  dailySwipeLimit: string
  dailySuperLikes: string
  monthlyBoosts: string
  isActive: boolean
  canReverseLastSwipe: boolean
  canChangeSwipeDecision: boolean
  canSeeWhoLikedYou: boolean
  showLikesInAdvancedHome: boolean
  canUnblurLikes: boolean
  canPassport: boolean
  hideAds: boolean
}

const EMPTY: FormState = {
  code: "PLUS",
  name: "",
  description: "",
  durationDays: "30",
  sortOrder: "1",
  dailySwipeLimit: "20",
  dailySuperLikes: "0",
  monthlyBoosts: "0",
  isActive: true,
  canReverseLastSwipe: false,
  canChangeSwipeDecision: false,
  canSeeWhoLikedYou: false,
  showLikesInAdvancedHome: false,
  canUnblurLikes: false,
  canPassport: false,
  hideAds: false,
}

function planToForm(plan: AdminSubscriptionPlanRow): FormState {
  return {
    code: plan.plan,
    name: plan.name,
    description: plan.description ?? "",
    durationDays: String(plan.durationDays),
    sortOrder: String(plan.sortOrder),
    dailySwipeLimit: String(plan.features.dailySwipeLimit),
    dailySuperLikes: String(plan.features.dailySuperLikes),
    monthlyBoosts: String(plan.features.monthlyBoosts),
    isActive: plan.isActive,
    canReverseLastSwipe: plan.features.canReverseLastSwipe,
    canChangeSwipeDecision: plan.features.canChangeSwipeDecision,
    canSeeWhoLikedYou: plan.features.canSeeWhoLikedYou,
    showLikesInAdvancedHome: plan.features.showLikesInAdvancedHome,
    canUnblurLikes: plan.features.canUnblurLikes,
    canPassport: plan.features.canPassport,
    hideAds: plan.features.hideAds,
  }
}

function toInt(value: string, fallback: number): number {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

const BOOLEAN_FEATURES: Array<{
  key: keyof Pick<
    FormState,
    | "canReverseLastSwipe"
    | "canChangeSwipeDecision"
    | "canSeeWhoLikedYou"
    | "showLikesInAdvancedHome"
    | "canUnblurLikes"
    | "canPassport"
    | "hideAds"
  >
  title: string
  description: string
}> = [
  {
    key: "canReverseLastSwipe",
    title: "Rewind last swipe",
    description: "User can undo their most recent swipe.",
  },
  {
    key: "canChangeSwipeDecision",
    title: "Change swipe decision",
    description: "Allow switching like ↔ pass after the fact.",
  },
  {
    key: "canSeeWhoLikedYou",
    title: "See who liked you",
    description: "Show the list of profiles that liked the user.",
  },
  {
    key: "canUnblurLikes",
    title: "Unblur likes",
    description: "Show clear photos in the likes screen (instead of blurred).",
  },
  {
    key: "showLikesInAdvancedHome",
    title: "Likes on advanced home",
    description: "Surface likes in the advanced home feed.",
  },
  {
    key: "canPassport",
    title: "Passport (change location)",
    description: "Allow browsing profiles in other cities or countries.",
  },
  {
    key: "hideAds",
    title: "Hide ads",
    description: "Ad-free experience for premium subscribers.",
  },
]

export type SubscriptionFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: Mode
  plan?: AdminSubscriptionPlanRow | null
}

export function SubscriptionFormSheet({
  open,
  onOpenChange,
  mode,
  plan,
}: SubscriptionFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-xl">
        {open ? (
          // Remount the body whenever the editing target changes so the
          // lazy initializer below picks up the right seed without an effect.
          <FormBody
            key={mode === "edit" ? (plan?.planId ?? "edit") : "create"}
            mode={mode}
            plan={plan ?? null}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

type FormBodyProps = {
  mode: Mode
  plan: AdminSubscriptionPlanRow | null
  onClose: () => void
}

function FormBody({ mode, plan, onClose }: FormBodyProps) {
  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" && plan ? planToForm(plan) : EMPTY,
  )
  const createMutation = useCreatePlanMutation()
  const updateMutation = useUpdatePlanMutation()

  const isFreeEdit = mode === "edit" && plan?.plan === "FREE"
  const isPending = createMutation.isPending || updateMutation.isPending
  const codeOptions = useMemo(
    () =>
      mode === "create"
        ? PLAN_TIERS.filter((tier) => tier !== "FREE")
        : PLAN_TIERS,
    [mode],
  )

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      toast.error("Name is required")
      return
    }
    const durationDays = toInt(form.durationDays, 0)
    if (durationDays < 1) {
      toast.error("Duration must be at least 1 day")
      return
    }

    const payload = {
      name: trimmedName,
      description: form.description.trim() || null,
      durationDays,
      isActive: form.isActive,
      sortOrder: toInt(form.sortOrder, 0),
      dailySwipeLimit: toInt(form.dailySwipeLimit, 0),
      dailySuperLikes: toInt(form.dailySuperLikes, 0),
      monthlyBoosts: toInt(form.monthlyBoosts, 0),
      canReverseLastSwipe: form.canReverseLastSwipe,
      canChangeSwipeDecision: form.canChangeSwipeDecision,
      canSeeWhoLikedYou: form.canSeeWhoLikedYou,
      showLikesInAdvancedHome: form.showLikesInAdvancedHome,
      canUnblurLikes: form.canUnblurLikes,
      canPassport: form.canPassport,
      hideAds: form.hideAds,
    }

    if (mode === "create") {
      const createPayload: CreatePlanInput = { code: form.code, ...payload }
      createMutation.mutate(createPayload, {
        onSuccess: (created) => {
          toast.success("Subscription plan created", {
            description: `${created.name} · ${created.durationDays} days`,
          })
          onClose()
        },
        onError: (err) => {
          toast.error("Could not create plan", {
            description: err instanceof Error ? err.message : "Unknown error",
          })
        },
      })
    } else if (plan) {
      // For FREE we still allow editing limits/features but the API blocks
      // any attempt to set isActive=false — mirror that here.
      const updatePayload: UpdatePlanInput = {
        ...payload,
        ...(isFreeEdit ? { isActive: true } : {}),
      }
      updateMutation.mutate(
        { id: plan.planId, input: updatePayload },
        {
          onSuccess: (updated) => {
            toast.success("Subscription plan updated", {
              description: updated.name,
            })
            onClose()
          },
          onError: (err) => {
            toast.error("Could not update plan", {
              description: err instanceof Error ? err.message : "Unknown error",
            })
          },
        },
      )
    }
  }

  return (
    <>
      <SheetHeader className="border-b border-slate-100">
        <SheetTitle>
          {mode === "create" ? "New subscription plan" : "Edit plan"}
        </SheetTitle>
        <SheetDescription>
          {mode === "create"
            ? "Create a new SKU. You can sell multiple durations per tier (e.g. 7-day Gold and 30-day Gold)."
            : isFreeEdit
              ? "Tune the FREE plan's limits and features. It cannot be deactivated."
              : "Update plan details and features."}
        </SheetDescription>
      </SheetHeader>

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
            <FieldSet>
              <FieldLegend>Plan details</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="plan-code">Tier type</FieldLabel>
                  <Select
                    value={form.code}
                    onValueChange={(v) => set("code")(v as PlanTier)}
                    disabled={mode === "edit"}
                  >
                    <SelectTrigger id="plan-code" aria-label="Tier type">
                      <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {codeOptions.map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {tier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {mode === "edit"
                      ? "Tier cannot be changed once created."
                      : "FREE is reserved for the system default and cannot be created manually."}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="plan-name">Name</FieldLabel>
                  <Input
                    id="plan-name"
                    value={form.name}
                    onChange={(e) => set("name")(e.target.value)}
                    placeholder="e.g. Gold 7-Day"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="plan-description">
                    Description
                  </FieldLabel>
                  <Input
                    id="plan-description"
                    value={form.description}
                    onChange={(e) => set("description")(e.target.value)}
                    placeholder="Optional marketing copy"
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="plan-duration">
                      Duration (days)
                    </FieldLabel>
                    <Input
                      id="plan-duration"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={form.durationDays}
                      onChange={(e) => set("durationDays")(e.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="plan-sort">Sort order</FieldLabel>
                    <Input
                      id="plan-sort"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={form.sortOrder}
                      onChange={(e) => set("sortOrder")(e.target.value)}
                    />
                  </Field>
                </div>

                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Active</FieldTitle>
                    <FieldDescription>
                      Inactive plans are hidden from the mobile catalog.
                      {isFreeEdit
                        ? " The FREE plan cannot be deactivated."
                        : ""}
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={set("isActive")}
                    disabled={isFreeEdit}
                    aria-label="Active"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Daily limits</FieldLegend>
              <FieldDescription>
                These caps are stored here and enforced by the mobile app
                (per-day counters live on-device).
              </FieldDescription>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="swipe-limit">Daily swipes</FieldLabel>
                    <Input
                      id="swipe-limit"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={form.dailySwipeLimit}
                      onChange={(e) => set("dailySwipeLimit")(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="super-likes">
                      Daily super likes
                    </FieldLabel>
                    <Input
                      id="super-likes"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={form.dailySuperLikes}
                      onChange={(e) => set("dailySuperLikes")(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="monthly-boosts">
                      Monthly boosts
                    </FieldLabel>
                    <Input
                      id="monthly-boosts"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={form.monthlyBoosts}
                      onChange={(e) => set("monthlyBoosts")(e.target.value)}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Features</FieldLegend>
              <FieldGroup>
                {BOOLEAN_FEATURES.map((feature) => (
                  <Field key={feature.key} orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{feature.title}</FieldTitle>
                      <FieldDescription>{feature.description}</FieldDescription>
                    </FieldContent>
                    <Switch
                      checked={form[feature.key]}
                      onCheckedChange={set(feature.key)}
                      aria-label={feature.title}
                    />
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
          </div>

          <SheetFooter className="border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving…"
                : mode === "create"
                  ? "Create plan"
                  : "Save changes"}
            </Button>
          </SheetFooter>
      </form>
    </>
  )
}
