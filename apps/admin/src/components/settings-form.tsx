"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, LockKeyhole, Mail, Save, UserRound } from "lucide-react"
import { toast } from "sonner"

import {
  getProfileDisplayModel,
  updateProfileSettings,
} from "@/features/profile/api"
import {
  adminProfileQueryKey,
  useAdminProfileQuery,
} from "@/features/profile/query"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FormState = {
  profileName: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const initialFormState: FormState = {
  profileName: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export function SettingsForm() {
  const queryClient = useQueryClient()
  const { data: profileData, isLoading, error } = useAdminProfileQuery()
  const [form, setForm] = useState<FormState>(initialFormState)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const profileDisplay = useMemo(
    () => (profileData ? getProfileDisplayModel(profileData) : null),
    [profileData]
  )
  const loadError = error instanceof Error ? error.message : ""

  useEffect(() => {
    if (!profileDisplay) {
      return
    }

    setForm((current) => ({
      ...current,
      profileName: profileDisplay.profileName,
      email: profileDisplay.email,
    }))
  }, [profileDisplay])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError("")

    const normalizedProfileName = form.profileName.trim()
    const wantsPasswordChange = Boolean(form.currentPassword || form.newPassword || form.confirmPassword)
    const currentProfileName = profileDisplay?.profileName ?? ""
    const profileNameChanged = normalizedProfileName !== currentProfileName

    if (wantsPasswordChange) {
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        setSubmitError("Fill in all password fields to change your password.")
        return
      }

      if (form.newPassword !== form.confirmPassword) {
        setSubmitError("New password and confirm password must match.")
        return
      }
    }

    if (!profileNameChanged && !wantsPasswordChange) {
      setSubmitError("There are no changes to save.")
      return
    }

    setIsSaving(true)

    try {
      const response = await updateProfileSettings({
        ...(profileNameChanged ? { profileName: normalizedProfileName } : {}),
        ...(wantsPasswordChange
          ? {
              currentPassword: form.currentPassword,
              newPassword: form.newPassword,
            }
          : {}),
      })

      setForm((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: adminProfileQueryKey })
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update settings"
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-panel flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Loading account settings...
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <Card className="rounded-[2rem] border-red-200 bg-red-50/80">
        <CardHeader>
          <CardTitle className="text-red-700">Unable to load settings</CardTitle>
          <CardDescription className="text-red-600">
            {loadError}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <section className="admin-hero p-6 md:p-8">
        <div className="max-w-3xl space-y-3">
          <span className="admin-kicker">
            Account settings
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Update your admin profile and password from one place.
          </h1>
          <p className="text-sm leading-6 text-slate-600 md:text-base">
            Email stays locked for now. You can change the profile name stored in
            your profile and update the account password here.
          </p>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="bg-white/94">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <UserRound className="size-5 text-emerald-600" />
              Profile details
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-slate-600">
              Keep the visible profile name up to date while leaving email read-only.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="profileName">Profile name</FieldLabel>
                <Input
                  id="profileName"
                  name="profileName"
                  value={form.profileName}
                  onChange={(event) => updateField("profileName", event.target.value)}
                  placeholder="Enter profile name"
                />
                <FieldDescription>
                  This saves to your profile&apos;s `name` field.
                </FieldDescription>
              </Field>

              <Field data-disabled="true">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    disabled
                    className="pl-9"
                  />
                </div>
                <FieldDescription>
                  Email updates are disabled on this screen.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card className="bg-white/94">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <LockKeyhole className="size-5 text-emerald-600" />
              Password
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-slate-600">
              Leave these blank if you only want to update the profile name.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={(event) => updateField("currentPassword", event.target.value)}
                  autoComplete="current-password"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => updateField("newPassword", event.target.value)}
                  autoComplete="new-password"
                />
                <FieldDescription>
                  Use at least 8 characters.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  autoComplete="new-password"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/94">
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">
              Save your account changes
            </p>
            <p className="text-sm text-slate-500">
              Password changes require your current password for confirmation.
            </p>
          </div>

          <div className="w-full max-w-md space-y-3">
            <FieldError>{submitError}</FieldError>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
