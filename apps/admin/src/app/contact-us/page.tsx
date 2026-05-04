import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | TrueNearby",
  description:
    "Get in touch with the TrueNearby team for support, billing, privacy, and grievance-related queries.",
};

const lastUpdated = "May 4, 2026";

export default function ContactUsPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#070305] text-[#F4E6EC]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(160deg,#11070A_0%,#100508_55%,#070305_100%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-8 md:px-10 md:py-12">
        <header className="mt-5 space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">Contact Us</h1>
          <p className="text-sm text-[#C6AEB8]">Last updated: {lastUpdated}</p>
          <p className="text-sm leading-relaxed text-[#D9C3CD] md:text-base">
            We&apos;re here to help with anything related to your TrueNearby
            account, payments, safety concerns, or data and privacy queries.
            Please use the most relevant channel below so we can route your
            request to the right place quickly.
          </p>
        </header>

        <div className="mt-8 space-y-7 text-sm leading-relaxed md:text-base">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              General Support
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              For general questions, account help, technical issues, or
              feedback about the app, please email us. Including your
              registered email, device model, and a short description of the
              issue helps us respond faster.
            </p>
            <div className="mt-3 space-y-1 text-[#E8D2DB]">
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                <a
                  href="mailto:deepjyoti120281@gmail.com"
                  className="text-[#F7DDE8] underline decoration-[#F7DDE8]/40 underline-offset-4 hover:decoration-[#F7DDE8]"
                >
                  deepjyoti120281@gmail.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-white">
                  Response time:
                </span>{" "}
                Typically within 3-7 business days.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              Billing, Refunds, and Subscriptions
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              For questions about charges, cancellations, auto-renewal, or
              refund requests, please first review our refund policy and the
              steps to raise a request through Google Play.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/refund-cancellation"
                className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#E9D3DC] transition hover:bg-white/15"
              >
                Refund &amp; Cancellation Policy
              </Link>
              <a
                href="mailto:deepjyoti120281@gmail.com?subject=Billing%20Query%20-%20TrueNearby"
                className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#E9D3DC] transition hover:bg-white/15"
              >
                Email Billing Support
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              Privacy and Data Requests
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              For data access, correction, erasure, or any other rights under
              applicable Indian data protection laws, please contact our
              Grievance Officer below. You can also review our Privacy Policy
              and Account Deletion process.
            </p>
            <div className="mt-3 space-y-1 text-[#E8D2DB]">
              <p>
                <span className="font-semibold text-white">
                  Grievance Officer:
                </span>{" "}
                Product Owner and Grievance Contact, TrueNearby
              </p>
              <p>
                <span className="font-semibold text-white">Entity:</span>{" "}
                Individual Developer (TrueNearby)
              </p>
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                <a
                  href="mailto:deepjyoti120281@gmail.com"
                  className="text-[#F7DDE8] underline decoration-[#F7DDE8]/40 underline-offset-4 hover:decoration-[#F7DDE8]"
                >
                  deepjyoti120281@gmail.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-white">
                  Response timelines:
                </span>{" "}
                As required by applicable law, including intermediary
                grievance timelines where applicable.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/privacy-policy"
                className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#E9D3DC] transition hover:bg-white/15"
              >
                Privacy Policy
              </Link>
              <Link
                href="/account-delete"
                className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#E9D3DC] transition hover:bg-white/15"
              >
                Account Deletion Request
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              Trust, Safety, and Abuse Reports
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              If you have encountered harassment, impersonation, scams,
              underage users, or any conduct that violates our Community
              Guidelines, please report the user from within the app and
              additionally email us with screenshots and the offending
              user&apos;s profile details. Reports involving safety are
              prioritized for review.
            </p>
            <div className="mt-3 space-y-1 text-[#E8D2DB]">
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                <a
                  href="mailto:deepjyoti120281@gmail.com?subject=Safety%20Report%20-%20TrueNearby"
                  className="text-[#F7DDE8] underline decoration-[#F7DDE8]/40 underline-offset-4 hover:decoration-[#F7DDE8]"
                >
                  deepjyoti120281@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              Business and Legal
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              For partnership enquiries, press, or formal legal notices,
              please email us with the subject line clearly indicating the
              nature of your request. We will route your message to the
              appropriate point of contact.
            </p>
            <div className="mt-3 space-y-1 text-[#E8D2DB]">
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                <a
                  href="mailto:deepjyoti120281@gmail.com"
                  className="text-[#F7DDE8] underline decoration-[#F7DDE8]/40 underline-offset-4 hover:decoration-[#F7DDE8]"
                >
                  deepjyoti120281@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
