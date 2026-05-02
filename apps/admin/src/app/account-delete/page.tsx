import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Delete Request | TrueNearby",
  description:
    "Learn how account deletion works for TrueNearby and submit your deletion request form.",
};

const lastUpdated = "April 16, 2026";

export default function AccountDeletePage() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#070305] text-[#F4E6EC]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(160deg,#11070A_0%,#100508_55%,#070305_100%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-8 md:px-10 md:py-12">
        {/* <Link
          href="/"
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#E9D3DC] transition hover:bg-white/15"
        >
          Back to Home
        </Link> */}

        <header className="mt-5 space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Account Delete Request - TrueNearby
          </h1>
          <p className="text-sm text-[#C6AEB8]">Last updated: {lastUpdated}</p>
          <p className="text-sm leading-relaxed text-[#D9C3CD] md:text-base">
            When you request to delete your account on TrueNearby, your account
            will be deactivated immediately or within 2-7 days, and you will no longer be able to
            access your profile, matches, or messages.
          </p>
        </header>

        <div className="mt-8 space-y-7 text-sm leading-relaxed md:text-base">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-[#D9C3CD]">
              Your account and associated data will be permanently deleted after
              90 days from the date of the deletion request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              During this 90-day period
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#E3CDD6]">
              <li>
                Your account will remain inactive and not visible to other
                users.
              </li>
              <li>You cannot log in or recover your account.</li>
              <li>
                This retention period is maintained for security, fraud
                prevention, and legal compliance purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              After 90 days
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              All your personal data, including profile details, photos, chats,
              and subscriptions will be permanently erased from our systems.
            </p>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              Submit your request
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Complete the official account deletion request form to start the
              process.
            </p>
            <a
              href="https://forms.gle/ZTV51PTETa9zfLZK9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-full border border-[#F7DDE8]/30 bg-[#F7DDE8] px-5 py-3 text-sm font-semibold text-[#12070C] transition hover:scale-[1.01] hover:bg-white"
            >
              Complete This Form
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
