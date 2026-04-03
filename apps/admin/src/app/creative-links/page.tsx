import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { CreativeAttributionNotice } from "@/components/creative-attribution-notice"
import { creativeResourceGroups } from "@/lib/creative-resources"

export const metadata: Metadata = {
  title: "Creative Links | TrueNearby",
  description:
    "Curated design links and inspiration references for the TrueNearby app.",
}

const lastUpdated = "April 3, 2026"

export default function CreativeLinksPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#070305] text-[#F4E6EC]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(160deg,#11070A_0%,#100508_55%,#070305_100%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-8 md:px-10 md:py-12">
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#E9D3DC] transition hover:bg-white/15"
        >
          Back to Home
        </Link>

        <header className="mt-5 space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">Creative Links</h1>
          <p className="text-sm text-[#C6AEB8]">Last updated: {lastUpdated}</p>
          <p className="text-sm leading-relaxed text-[#D9C3CD] md:text-base">
            This page collects the romantic icon, sticker, author, and
            wallpaper references for the TrueNearby app. Use it as a single
            source for design inspiration while building onboarding, banners,
            profile moments, empty states, and message-themed layouts.
          </p>
          <CreativeAttributionNotice className="max-w-3xl" />
        </header>

        <div className="mt-8 space-y-7 text-sm leading-relaxed md:text-base">
          {creativeResourceGroups.map((group, index) => (
            <section
              key={group.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h2 className="text-lg font-semibold text-white md:text-xl">
                {index + 1}. {group.title}
              </h2>
              <p className="mt-3 text-[#D9C3CD]">{group.description}</p>

              <div className="mt-4 space-y-3">
                {group.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-white/20 hover:bg-white/8"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#E9D3DC] uppercase">
                          {resource.source}
                        </span>
                        <span className="text-[11px] tracking-[0.16em] text-[#CFA8B8] uppercase">
                          External link
                        </span>
                      </div>
                      <p className="mt-3 font-semibold text-white">
                        {resource.title}
                      </p>
                      <p className="mt-1 text-[#D9C3CD]">
                        {resource.description}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#E9D3DC] transition group-hover:text-white" />
                  </a>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              {creativeResourceGroups.length + 1}. Attribution Notice
            </h2>
            <p className="mt-3 text-[#E3CDD6]">
              Some icons, stickers, and visual assets used in this app are
              provided by Flaticon authors and other external creators. These
              assets are used under their respective licenses and are credited
              accordingly. For full attribution details, please refer to the
              Creative Links above.
            </p>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              {creativeResourceGroups.length + 2}. Usage Notes
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>Use icon references for likes, profile actions, and chat UI.</li>
              <li>Use sticker references for promos, seasonal campaigns, and empty states.</li>
              <li>Use the wallpaper reference for pink gradients and romantic mood direction.</li>
              <li>Use the author links when you want more assets in a similar visual style.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
