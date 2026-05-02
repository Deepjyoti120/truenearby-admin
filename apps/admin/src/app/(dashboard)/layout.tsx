import { AdminProfileBootstrap } from "@/components/admin-profile-bootstrap"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdminProfileBootstrap />
      {children}
    </>
  )
}
