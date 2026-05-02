import { AppSidebarLayout } from "@/components/app-sidebar-layout"
import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Settings" },
  ]

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <SettingsForm />
    </AppSidebarLayout>
  )
}
