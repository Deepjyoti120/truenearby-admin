import { AppSidebarLayout } from "@/components/app-sidebar-layout"
import { AppIdentityCard } from "@/components/app-identity-card"
import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Settings" },
  ]

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <SettingsForm />
        <AppIdentityCard />
      </div>
    </AppSidebarLayout>
  )
}
