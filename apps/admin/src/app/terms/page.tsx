import type { Metadata } from "next";

import { CreativeAttributionNotice } from "@/components/creative-attribution-notice";

export const metadata: Metadata = {
  title: "Terms of Service | TrueNearby",
  description:
    "Terms of Service for the TrueNearby Dating app, including account, safety, and Google Sign-In terms.",
};

const lastUpdated = "April 16, 2026";

export default function TermsPage() {
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
          <h1 className="text-3xl font-semibold md:text-4xl">Terms of Service</h1>
          <p className="text-sm text-[#C6AEB8]">Last updated: {lastUpdated}</p>
          <p className="text-sm leading-relaxed text-[#D9C3CD] md:text-base">
            These Terms of Service govern your access to and use of TrueNearby
            Dating, an independently operated adults-only dating platform. By
            creating an account, signing in with Google, or using the app, you
            agree to these terms, our safety rules, and our applicable privacy
            practices.
          </p>
          <CreativeAttributionNotice className="max-w-3xl" />
        </header>

        <div className="mt-8 space-y-7 text-sm leading-relaxed md:text-base">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              1. Eligibility
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>You must be at least 18 years old to use TrueNearby Dating.</li>
              <li>
                You may use the app only if dating services are lawful in your
                location.
              </li>
              <li>
                You must have the legal capacity to agree to a binding contract.
              </li>
              <li>
                You may not use the service if your account has previously been
                suspended or removed for policy violations, unless we expressly
                allow it.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              2. Account Registration and Google Sign-In
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              You may create or access your TrueNearby Dating account using
              supported sign-in methods, including Google Sign-In. When you sign
              in with Google, you authorize us to receive basic profile details
              made available by Google, such as your name, email address, and
              profile photo, subject to your Google account settings and our
              privacy policy.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                You are responsible for ensuring your account details are
                accurate and up to date.
              </li>
              <li>
                You are responsible for all activity that happens through your
                account.
              </li>
              <li>
                You must keep your sign-in credentials and connected devices
                secure.
              </li>
              <li>
                We may ask for additional verification where needed for safety,
                fraud prevention, or compliance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              3. Acceptable Use
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              You agree to use the app respectfully and lawfully. You must not:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>Impersonate another person or use false identity details.</li>
              <li>
                Harass, threaten, stalk, exploit, defraud, or abuse any user.
              </li>
              <li>
                Upload nudity, sexual exploitation material, hateful content,
                violent threats, or illegal content.
              </li>
              <li>
                Share another person&apos;s private information without permission.
              </li>
              <li>
                Use bots, scraping tools, automation, or reverse engineering to
                access or misuse the service.
              </li>
              <li>
                Solicit money, run scams, or promote commercial services without
                authorization.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              4. User Content and Profile Responsibility
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              You retain ownership of the content you upload, including profile
              photos, biographies, prompts, and messages where applicable.
              However, you grant TrueNearby Dating a limited, non-exclusive,
              worldwide license to host, store, reproduce, display, and process
              that content for the purpose of operating, securing, moderating,
              and improving the service.
            </p>
            <p className="mt-3 text-[#D9C3CD]">
              You are solely responsible for the content you post and for making
              sure you have all necessary rights and permissions to share it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              5. Safety, Moderation, and Enforcement
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              To protect users and comply with platform requirements, we may
              review reports, moderate content, restrict visibility, suspend
              features, or remove accounts that appear to violate these terms,
              community standards, or applicable law.
            </p>
            <p className="mt-3 text-[#D9C3CD]">
              We may take action without prior notice where necessary to address
              urgent safety risks, fraud, impersonation, or legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              6. Matching and Location-Based Features
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              TrueNearby Dating may use profile preferences, activity, and
              location information to show potential matches and nearby users.
              Match availability, compatibility, and user activity are not
              guaranteed, and we do not promise that the service will result in
              any relationship, meeting, or response.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              7. Paid Features and Billing
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              If the app offers paid memberships, boosts, or other digital
              features on Android, eligible purchases are processed through
              Google Play Billing in accordance with Google Play policies. Prices,
              billing cycles, renewals, cancellation rights, and refund handling
              may depend on the purchase flow and the rules of the platform
              through which you subscribed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              8. Privacy and Data Use
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Your use of TrueNearby Dating is also subject to our Privacy
              Policy, which explains how we collect, use, store, and protect
              personal data, including information received through Google
              Sign-In and dating-related profile activity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              9. Service Availability and Changes
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We may update, modify, limit, suspend, or discontinue parts of the
              service at any time for product, safety, legal, or operational
              reasons. We do not guarantee uninterrupted availability or that the
              app will always function on every device or platform version.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              10. Disclaimers
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              The service is provided on an &quot;as is&quot; and &quot;as available&quot;
              basis to the extent permitted by law. We do not guarantee the
              identity, intentions, conduct, compatibility, or honesty of any
              user, and you remain responsible for your own interactions, online
              and offline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              11. Limitation of Liability
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              To the maximum extent permitted by applicable law, TrueNearby
              Dating and its operator will not be liable for indirect,
              incidental, special, consequential, exemplary, or punitive damages,
              or for any loss of data, reputation, profits, or business arising
              out of or related to your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              12. Termination
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              You may stop using the app at any time. We may suspend or
              terminate your access if we reasonably believe you have violated
              these terms, created risk for other users, exposed us to legal
              liability, or misused the service.
            </p>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              13. Contact
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              For account issues, safety reports, legal notices, or terms-related
              questions, please contact:
            </p>
            <div className="mt-3 space-y-1 text-[#E8D2DB]">
              <p>
                <span className="font-semibold text-white">Entity:</span>{" "}
                Individual Developer (TrueNearby Dating)
              </p>
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                deepjyoti120281@gmail.com
              </p>
              <p>
                <span className="font-semibold text-white">Support:</span>{" "}
                Official TrueNearby support channel shared through the app and
                support email
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              14. Updates to These Terms
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We may revise these Terms of Service from time to time to reflect
              product updates, legal requirements, or safety practices. Your
              continued use of the app after updated terms become effective means
              you accept the revised terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
