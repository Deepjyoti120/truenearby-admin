import { AppSidebarLayout } from "@/components/app-sidebar-layout"

export default function SettingsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Settings" },
  ]

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="text-xl font-semibold">Settings</div>
    </AppSidebarLayout>
  )
}
