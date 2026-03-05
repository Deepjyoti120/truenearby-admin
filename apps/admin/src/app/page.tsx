import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const trustPills = [
  "Verified members",
  "Private by design",
  "No swipe fatigue",
];

const quickStats = [
  { label: "Meaningful Matches", value: "12K+" },
  { label: "Avg. Reply Rate", value: "89%" },
  { label: "Safety Score", value: "4.9/5" },
];

const storeLinks = {
  playStore:
    "https://play.google.com/store/apps/details?id=com.baraxuntech.truenearby",
  appStore: "https://apps.apple.com/us/search?term=truenearby",
};

function GooglePlayIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 3v18l12-9L5 3z" fill="currentColor" />
      <path d="M17 9l3 3-3 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AppStoreIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 18h8M8 15l4-8 4 8M10 11h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type StoreButtonProps = {
  href: string;
  overline: string;
  title: string;
  icon: ReactNode;
};

function StoreButton({ href, overline, title, icon }: StoreButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex w-full min-w-[250px] overflow-hidden rounded-2xl p-[1.5px] transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span
        aria-hidden
        className="store-ring-spin absolute inset-0 rounded-2xl bg-[conic-gradient(from_160deg,#FF6CAB,#FF3E7F,#6A00F4,#FF6CAB)]"
      />
      <span
        aria-hidden
        className="store-glow-pulse absolute -inset-2 rounded-[1.2rem] bg-[#FF3E7F]/30 blur-xl opacity-70 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="absolute inset-[1.5px] rounded-[15px] bg-[#150C14]"
      />
      <span className="relative z-10 inline-flex w-full items-center gap-3 rounded-[15px] px-4 py-3.5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#FFE8EF]">
          {icon}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] tracking-[0.16em] text-[#D8C7CB] uppercase">
            {overline}
          </span>
          <span className="text-base font-bold text-white">{title}</span>
        </span>
      </span>
    </a>
  );
}

function StoreButtons({ className }: { className: string }) {
  return (
    <div className={className}>
      <StoreButton
        href={storeLinks.playStore}
        overline="Get It On"
        title="Google Play"
        icon={<GooglePlayIcon />}
      />
      {/* <StoreButton
        href={storeLinks.appStore}
        overline="Download On The"
        title="App Store"
        icon={<AppStoreIcon />}
      /> */}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#070305] text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(160deg,#11070A_0%,#100508_55%,#070305_100%)]"
      />
      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col justify-between gap-6 px-6 py-6 md:flex-row md:items-center md:gap-10 md:px-12 md:py-10">
        <section className="max-w-xl space-y-3 md:space-y-6">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Image
                src="/brand/app-logo.png"
                alt="TrueNearby app logo"
                width={28}
                height={28}
                className="h-7 w-7 rounded-md object-cover"
                priority
              />
            </div>
            <div className="flex flex-col gap-1">
              {/* <p className="text-sm font-semibold text-white">TrueNearby</p> */}
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.18em] text-[#E7D5D9] font-bold">
                TrueNearby
              </p>
            </div>
          </div>
          <h1 className="text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] font-semibold">
            Find love that feels calm, not chaotic.
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-[#D8C7CB] md:text-base">
            Meet emotionally mature people looking for meaningful, long-term
            connection. One elegant app, zero endless scrolling.
          </p>

          <div className="flex flex-wrap gap-2">
            {trustPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-[#E7D5D9]"
              >
                {pill}
              </span>
            ))}
          </div>

          <div className="grid max-w-md grid-cols-3 gap-2 pt-1 md:pt-3">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
              >
                <p className="text-base font-semibold text-white md:text-lg">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] leading-tight text-[#D8C7CB]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <StoreButtons className="w-full max-w-2xl grid-cols-1 gap-3 pt-1 md:grid md:grid-cols-2" />
          <p className="max-w-lg text-xs leading-relaxed text-[#C6AEB8]">
            By using TrueNearby, you agree to our{" "}
            <Link
              href="/privacy-policy"
              className="font-semibold text-[#F7DDE8] underline underline-offset-4 transition hover:text-white"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="mx-auto flex w-full flex-1 items-end justify-center md:justify-end">
          <div className="relative aspect-[9/19.5] h-[640px] rounded-[2.3rem] border border-white/20 bg-[#1A1118] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="h-full overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,#271221_0%,#140C17_58%,#0D080E_100%)] px-3 pt-3">
              <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-white/35" />

              <div className="mb-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] tracking-[0.18em] text-[#E7D5D9] uppercase">
                      Today
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      Welcome back, Aanya
                    </p>
                    <p className="text-[11px] text-[#D8C7CB]">
                      3 curated introductions waiting
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                    <Image
                      src="/brand/app-logo.png"
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] rounded-[4px] object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#21101B] p-3">
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-[#FF6CAB]/80" />
                    <div>
                      <p className="text-sm font-semibold">Maya, 27</p>
                      <p className="text-[11px] text-[#D8C7CB]">
                        Designer • Loves poetry nights
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-24 rounded-xl border border-white/10 bg-[#2A1623]" />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] text-[#E7D5D9]">
                      Kind communicator
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] text-[#E7D5D9]">
                      Weekend hikes
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] text-[#E7D5D9]">
                      Serious dating
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <p className="text-[10px] text-[#E7D5D9]">Compatibility</p>
                  <p className="text-lg font-semibold text-[#FF9CBD]">96%</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <p className="text-[10px] text-[#E7D5D9]">First Date Ideas</p>
                  <p className="text-xs">Coffee tasting</p>
                </div>
              </div>

              <div className="absolute right-3 bottom-3 left-3 rounded-2xl border border-[#3A2A35] bg-[#170D15]/95 p-2">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="rounded-lg bg-[#2A1825] py-1 text-[#E7D5D9]">
                    Home
                  </div>
                  <div className="rounded-lg py-1 text-[#D8C7CB]">Chat</div>
                  <div className="rounded-lg py-1 text-[#D8C7CB]">Likes</div>
                  <div className="rounded-lg py-1 text-[#D8C7CB]">Profile</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
