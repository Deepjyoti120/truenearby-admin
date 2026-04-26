import type { Metadata } from "next";
import Link from "next/link";

import { CreativeAttributionNotice } from "@/components/creative-attribution-notice";

export const metadata: Metadata = {
  title: "Privacy Policy | TrueNearby",
  description: "Privacy Policy for the TrueNearby dating app.",
};

const lastUpdated = "March 4, 2026";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-semibold md:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-[#C6AEB8]">Last updated: {lastUpdated}</p>
          <p className="text-sm leading-relaxed text-[#D9C3CD] md:text-base">
            This Privacy Policy explains how TrueNearby, an independently
            operated product managed by an individual developer, collects,
            uses, stores, shares, and protects personal data. This policy is
            intended for users in India and is designed to align with
            applicable Indian data protection and information technology laws,
            Google Play policy requirements, and platform safety expectations
            for dating services.
          </p>
          <CreativeAttributionNotice className="max-w-3xl" />
        </header>

        <div className="mt-8 space-y-7 text-sm leading-relaxed md:text-base">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              1. Legal Framework
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              This policy is published in line with applicable requirements
              under Indian law, including:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                Digital Personal Data Protection Act, 2023 and rules notified
                thereunder.
              </li>
              <li>
                Information Technology Act, 2000 (including Section 43A and
                related provisions).
              </li>
              <li>
                Information Technology (Reasonable Security Practices and
                Procedures and Sensitive Personal Data or Information) Rules,
                2011.
              </li>
              <li>
                Information Technology (Intermediary Guidelines and Digital
                Media Ethics Code) Rules, 2021, as amended, where applicable.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              2. Data We Collect
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                Account and identity details: name, email, mobile number, date
                of birth, and profile credentials.
              </li>
              <li>
                Profile content: photos, biography, interests, preferences, and
                in-app prompts.
              </li>
              <li>
                Usage and device data: app activity logs, device identifiers,
                IP address, crash logs, and diagnostics.
              </li>
              <li>
                Location data (if enabled): approximate or precise location for
                match discovery.
              </li>
              <li>
                Sensitive or special category data only when voluntarily
                provided by you and allowed by law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              3. Why We Use Your Data
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>To create and maintain your account.</li>
              <li>To provide matching, chat, and safety features.</li>
              <li>To verify age, prevent abuse, and enforce platform rules.</li>
              <li>
                To respond to support requests and legal or regulatory
                obligations.
              </li>
              <li>To improve app quality, reliability, and user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              4. Consent and User Controls
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              By using the app, you consent to data processing as described in
              this policy. Where required by law, we request explicit consent.
              You may withdraw consent at any time by contacting us, though
              withdrawal may affect service availability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              5. Sharing and Disclosure
            </h2>
            <p className="mt-3 text-[#D9C3CD]">We may share data with:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                Service providers (cloud hosting, analytics, customer support)
                under contractual safeguards.
              </li>
              <li>Other users according to your profile visibility settings.</li>
              <li>
                Law enforcement or government agencies when legally required.
              </li>
              <li>
                A successor entity in case of merger, acquisition, or
                restructuring, subject to lawful protection of your data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              6. Payments and Billing Compliance
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Where paid features are offered in the Android app, payments for
              eligible digital services are processed through Google Play
              Billing in line with applicable Google Play policies. We do not
              store your full card or UPI credentials on TrueNearby servers.
              Billing records may be retained as required for tax, accounting,
              fraud prevention, and legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              7. Data Retention
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We retain personal data only for as long as necessary for service
              delivery, fraud prevention, dispute resolution, legal compliance,
              and legitimate business records. Data is deleted or anonymized
              when no longer required, subject to lawful retention periods.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              8. Your Rights
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Subject to applicable law, you may request:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>Access to a summary of your personal data.</li>
              <li>Correction, completion, or update of inaccurate data.</li>
              <li>Erasure of personal data, where legally permissible.</li>
              <li>Withdrawal of consent and account deletion.</li>
              <li>Grievance redressal and escalation mechanisms.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              9. Account Deletion Request
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              If you want to delete your TrueNearby account, you can submit a
              request through our dedicated account deletion page. It explains
              the immediate account deactivation process, the 90-day retention
              period, and when your personal data is permanently erased from
              our systems.
            </p>
            <Link
              href="/account-delete"
              className="mt-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-[#E9D3DC] transition hover:bg-white/15"
            >
              View Account Delete Request
            </Link>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              10. Children and Age Restriction
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              TrueNearby is an adults-only dating platform. You must be at
              least 18 years old to use this app. We do not knowingly process
              data of minors for dating services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              11. Security Practices
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We implement reasonable security practices and technical controls
              to protect data against unauthorized access, disclosure, loss,
              misuse, or alteration. However, no online system can guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              12. Cross-Border Transfers
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Where data is processed outside India, we apply contractual and
              technical safeguards and comply with transfer restrictions
              applicable under Indian law.
            </p>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              13. Grievance Officer and Contact
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              For privacy complaints, account safety concerns, or legal data
              requests, please contact:
            </p>
            <div className="mt-3 space-y-1 text-[#E8D2DB]">
              <p>
                <span className="font-semibold text-white">Entity:</span>{" "}
                Individual Developer (TrueNearby)
              </p>
              <p>
                <span className="font-semibold text-white">
                  Grievance Officer:
                </span>{" "}
                Product Owner and Grievance Contact, TrueNearby
              </p>
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                rubikalita2021@gmail.com
              </p>
              <p>
                <span className="font-semibold text-white">Website:</span>{" "}
                Official TrueNearby support channel (shared via app and support
                email)
              </p>
              <p>
                <span className="font-semibold text-white">
                  Response timelines:
                </span>{" "}
                As required by applicable law (including intermediary grievance
                timelines where applicable).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              14. Updates to This Policy
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We may update this Privacy Policy from time to time to reflect
              legal, operational, or product changes. Material updates will be
              communicated in-app or through other appropriate channels.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
