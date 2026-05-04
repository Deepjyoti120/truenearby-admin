import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund and Cancellation | TrueNearby",
  description:
    "Refund and Cancellation policy for TrueNearby paid memberships, in-app purchases, and subscriptions.",
};

const lastUpdated = "May 4, 2026";

export default function RefundCancellationPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#070305] text-[#F4E6EC]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(160deg,#11070A_0%,#100508_55%,#070305_100%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-8 md:px-10 md:py-12">
        <header className="mt-5 space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Refund and Cancellation Policy
          </h1>
          <p className="text-sm text-[#C6AEB8]">Last updated: {lastUpdated}</p>
          <p className="text-sm leading-relaxed text-[#D9C3CD] md:text-base">
            This page explains how cancellations, auto-renewals, and refunds
            work for paid features, memberships, and in-app purchases on
            TrueNearby. It is intended for users in India and is designed to
            align with applicable Indian consumer protection laws and Google
            Play billing policies.
          </p>
        </header>

        <div className="mt-8 space-y-7 text-sm leading-relaxed md:text-base">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              1. How Payments Are Processed
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              All paid features, subscriptions, boosts, and other digital
              purchases offered through the TrueNearby Android app are
              processed by Google Play Billing in line with Google Play
              policies. TrueNearby does not directly store your card, UPI, or
              bank account credentials on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              2. Subscription Cancellation
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#E3CDD6]">
              <li>
                You can cancel an auto-renewing subscription at any time
                directly from your Google Play account under{" "}
                <span className="font-medium text-white">
                  Payments &amp; subscriptions → Subscriptions
                </span>
                .
              </li>
              <li>
                When you cancel, your subscription remains active until the end
                of the current billing cycle. You will not be charged for the
                next renewal period.
              </li>
              <li>
                Uninstalling the TrueNearby app does not automatically cancel
                an active subscription. You must cancel through Google Play.
              </li>
              <li>
                Once a subscription is cancelled, premium features tied to that
                plan will stop on the day the current billing period ends.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              3. Refund Eligibility
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Because purchases are completed through Google Play Billing,
              refund decisions are governed primarily by{" "}
              <a
                href="https://support.google.com/googleplay/answer/2479637"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F7DDE8] underline decoration-[#F7DDE8]/40 underline-offset-4 hover:decoration-[#F7DDE8]"
              >
                Google Play&apos;s refund policy
              </a>
              . In general:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#E3CDD6]">
              <li>
                Subscriptions and one-time digital purchases are typically
                non-refundable once delivered, except where required by
                applicable consumer law.
              </li>
              <li>
                Google may, at its discretion, issue a refund for charges that
                are unauthorized, duplicated, or made due to a verifiable
                technical error.
              </li>
              <li>
                Refunds for unused portions of an ongoing subscription are
                generally not provided after the billing cycle has started.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              4. How to Request a Refund
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              You can raise a refund request through either of the following
              channels:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#E3CDD6]">
              <li>
                <span className="font-medium text-white">Google Play:</span>{" "}
                Open the Play Store, go to{" "}
                <span className="font-medium text-white">
                  Account → Order history
                </span>
                , select the TrueNearby purchase, and choose{" "}
                <span className="font-medium text-white">
                  Request a refund
                </span>
                . Most refund requests should be submitted within 48 hours of
                purchase for the fastest review.
              </li>
              <li>
                <span className="font-medium text-white">TrueNearby support:</span>{" "}
                Email us at{" "}
                <a
                  href="mailto:deepjyoti120281@gmail.com"
                  className="text-[#F7DDE8] underline decoration-[#F7DDE8]/40 underline-offset-4 hover:decoration-[#F7DDE8]"
                >
                  deepjyoti120281@gmail.com
                </a>{" "}
                with your registered account, order ID, purchase date, amount,
                and a brief description of the issue. We will review and
                coordinate with Google Play where applicable.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              5. Non-Refundable Items
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              The following are generally not eligible for refunds, except
              where required by law:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#E3CDD6]">
              <li>
                Consumable in-app items that have already been used or
                redeemed (for example, profile boosts that were activated).
              </li>
              <li>
                Subscription periods that have already been delivered or
                accessed.
              </li>
              <li>
                Charges arising from violation of our Terms of Service,
                Community Guidelines, or account suspension for abuse, fraud,
                or safety reasons.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              6. Auto-Renewal
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Subscriptions on TrueNearby renew automatically at the end of
              each billing cycle at the then-current price unless cancelled at
              least 24 hours before the renewal date. You can review and
              manage auto-renewal at any time through your Google Play account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              7. Pricing and Taxes
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Prices shown in the app may include applicable taxes such as
              GST, depending on your billing region. TrueNearby may adjust
              prices, plan benefits, or available billing cycles from time to
              time. Material changes to existing subscriptions will be
              communicated through the app or by email before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              8. Account Termination and Refunds
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              If your account is suspended or terminated due to a violation of
              our Terms of Service, Community Guidelines, or applicable laws,
              you will not be entitled to a refund of any unused portion of a
              paid subscription or in-app purchase.
            </p>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              9. Need Help?
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              For billing disputes, unauthorized charges, or any questions
              about cancellations and refunds, please reach out to our support
              team. We typically respond within applicable statutory timelines.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/contact-us"
                className="inline-flex rounded-full border border-[#F7DDE8]/30 bg-[#F7DDE8] px-5 py-3 text-sm font-semibold text-[#12070C] transition hover:scale-[1.01] hover:bg-white"
              >
                Contact Support
              </Link>
              <Link
                href="/privacy-policy"
                className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-[#E9D3DC] transition hover:bg-white/15"
              >
                View Privacy Policy
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
