import Link from "next/link"

import { cn } from "@/lib/utils"

type CreativeAttributionNoticeProps = {
  variant?: "dark" | "light"
  className?: string
}

const variantClasses = {
  dark: {
    wrapper:
      "border-white/15 bg-white/5 text-[#D9C3CD] backdrop-blur-sm",
    link: "text-[#F7DDE8] hover:text-white",
    label: "text-white",
  },
  light: {
    wrapper:
      "border-emerald-200/80 bg-emerald-50/80 text-slate-600",
    link: "text-emerald-700 hover:text-emerald-800",
    label: "text-slate-900",
  },
} as const

export function CreativeAttributionNotice({
  variant = "dark",
  className,
}: CreativeAttributionNoticeProps) {
  const styles = variantClasses[variant]

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-xs leading-6",
        styles.wrapper,
        className
      )}
    >
      <span className={cn("font-semibold", styles.label)}>
        Asset attribution:
      </span>{" "}
      Some icons, stickers, and visual assets used in this product are credited
      to Flaticon authors and other external creators. Full credits are listed
      in{" "}
      <Link
        href="/creative-links"
        className={cn("font-medium underline underline-offset-4 transition", styles.link)}
      >
        Creative Links
      </Link>
      .
    </div>
  )
}
