"use client"

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {children}
    </div>
  )
}
