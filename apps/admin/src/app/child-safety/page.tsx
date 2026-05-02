import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Child Safety Standards | TrueNearby",
  description:
    "Child Safety Standards for the TrueNearby dating app, covering prohibition of CSAE, in-app reporting, content moderation, and legal compliance.",
};

const lastUpdated = "April 26, 2026";

export default function ChildSafetyStandardsPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#070305] text-[#F4E6EC]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(160deg,#11070A_0%,#100508_55%,#070305_100%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-8 md:px-10 md:py-12">
        <header className="mt-5 space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Child Safety Standards
          </h1>
          <p className="text-sm text-[#C6AEB8]">Last updated: {lastUpdated}</p>
          <p className="text-sm leading-relaxed text-[#D9C3CD] md:text-base">
            TrueNearby is an adults-only dating app and is committed to a safe,
            respectful environment that is free of child sexual abuse and
            exploitation (CSAE), including child sexual abuse material (CSAM).
            These standards describe how we prohibit such content and conduct,
            how users can report it, how we moderate the platform, and how we
            cooperate with law enforcement under applicable Indian law and
            international obligations.
          </p>
        </header>

        <div className="mt-8 space-y-7 text-sm leading-relaxed md:text-base">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              1. Age Restriction (Adults Only)
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              TrueNearby is strictly for users aged 18 years and above. Minors
              are not permitted on the platform under any circumstances. We
              require users to confirm their date of birth at sign-up and may
              use additional checks to detect and remove underage accounts.
              Accounts found or reasonably suspected to belong to a minor are
              suspended and removed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              2. Prohibited Content and Conduct
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We have a zero-tolerance policy against child sexual abuse and
              exploitation. The following are strictly prohibited on TrueNearby:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                Any form of child sexual abuse material (CSAM), including
                images, videos, audio, text, drawings, animations, or AI- or
                computer-generated content depicting minors.
              </li>
              <li>
                Sexual exploitation, grooming, solicitation, sextortion, or
                endangerment of any person under the age of 18.
              </li>
              <li>
                Nudity, sexually suggestive content, or sexualized
                conversations involving minors.
              </li>
              <li>
                Sharing, requesting, or linking to CSAM, including off-platform
                links, contact handles, or services that distribute such
                material.
              </li>
              <li>
                Impersonating a minor, creating fake profiles depicting minors,
                or attempting to misrepresent age.
              </li>
            </ul>
            <p className="mt-3 text-[#D9C3CD]">
              Any account engaging in the above conduct is permanently banned,
              and the relevant content and account information are preserved
              and reported to authorities as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              3. In-App Reporting Mechanism
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              Every user can report profiles, messages, photos, or other
              content directly within the app:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                Open the profile, chat, or content you want to report and use
                the &ldquo;Report&rdquo; option.
              </li>
              <li>
                Choose a category (such as &ldquo;Underage user&rdquo; or
                &ldquo;Sexual content involving a minor&rdquo;) and provide
                additional details if you can.
              </li>
              <li>
                You can also email{" "}
                <a
                  href="mailto:deepjyoti120281@gmail.com"
                  className="underline decoration-[#E9D3DC]/50 underline-offset-2 hover:decoration-white"
                >
                  deepjyoti120281@gmail.com
                </a>{" "}
                with the subject line &ldquo;Child Safety&rdquo; for urgent
                concerns.
              </li>
            </ul>
            <p className="mt-3 text-[#D9C3CD]">
              All child-safety reports are prioritized. We acknowledge reports
              and take action as soon as reasonably practicable, typically
              within 24 hours for credible CSAE reports.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              4. Content Moderation and Enforcement
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We actively moderate user-generated content using a combination
              of automated checks and human review:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                Profile photos and shared media are screened for nudity,
                sexually explicit content, and indicators of minors.
              </li>
              <li>
                Reported content is reviewed by trained reviewers; CSAE-related
                reports are escalated on priority.
              </li>
              <li>
                Confirmed violations result in immediate removal of content,
                permanent ban of the user, device-level signals where lawful,
                and preservation of evidence.
              </li>
              <li>
                We continuously improve our detection, reporting, and
                enforcement systems and update these standards as needed.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              5. Compliance with Child Safety Laws
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              TrueNearby complies with applicable child safety and intermediary
              laws, including:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                Protection of Children from Sexual Offences (POCSO) Act, 2012,
                and rules notified thereunder.
              </li>
              <li>
                Information Technology Act, 2000, including provisions on
                publication and transmission of obscene material involving
                children (Section 67B) and intermediary obligations.
              </li>
              <li>
                Information Technology (Intermediary Guidelines and Digital
                Media Ethics Code) Rules, 2021, including time-bound takedown
                obligations for child sexual abuse content.
              </li>
              <li>
                Indian Penal Code / Bharatiya Nyaya Sanhita provisions relating
                to sexual offences against children, where applicable.
              </li>
              <li>
                Google Play Developer Program Policies, including the Child
                Safety Standards policy for Social and Dating apps.
              </li>
            </ul>
            <p className="mt-3 text-[#D9C3CD]">
              Where users or content are subject to other jurisdictions, we
              also act consistently with internationally recognized child
              protection norms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              6. Cooperation with Authorities
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We cooperate with law enforcement and competent authorities in
              cases involving child safety, including:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[#E3CDD6]">
              <li>
                Reporting confirmed or strongly suspected CSAE to appropriate
                authorities, including the National Cyber Crime Reporting
                Portal (cybercrime.gov.in) in India where applicable.
              </li>
              <li>
                Preserving relevant content, account, and log information for
                legally required periods.
              </li>
              <li>
                Responding to lawful requests for information from courts and
                authorized agencies.
              </li>
            </ul>
            <p className="mt-3 text-[#D9C3CD]">
              We encourage users who become aware of any child in immediate
              danger to also contact local law enforcement or child helplines
              (such as Childline India: 1098).
            </p>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              7. Child Safety Point of Contact
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              For child safety concerns, abuse reports, or law enforcement
              requests related to CSAE, please contact:
            </p>
            <div className="mt-3 space-y-1 text-[#E8D2DB]">
              <p>
                <span className="font-semibold text-white">Entity:</span>{" "}
                Individual Developer (TrueNearby)
              </p>
              <p>
                <span className="font-semibold text-white">
                  Child Safety Contact:
                </span>{" "}
                TrueNearby Trust &amp; Safety
              </p>
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                <a
                  href="mailto:deepjyoti120281@gmail.com"
                  className="underline decoration-[#E9D3DC]/50 underline-offset-2 hover:decoration-white"
                >
                  deepjyoti120281@gmail.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-white">
                  Response timelines:
                </span>{" "}
                Credible CSAE reports are prioritized and typically actioned
                within 24 hours, subject to applicable legal timelines.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              8. Updates to These Standards
            </h2>
            <p className="mt-3 text-[#D9C3CD]">
              We may update these Child Safety Standards from time to time to
              reflect legal, operational, or product changes. Material updates
              will be communicated in-app or through other appropriate
              channels. Continued use of TrueNearby after an update constitutes
              acknowledgement of the revised standards.
            </p>
            <p className="mt-3 text-[#D9C3CD]">
              See also our{" "}
              <Link
                href="/privacy-policy"
                className="underline decoration-[#E9D3DC]/50 underline-offset-2 hover:decoration-white"
              >
                Privacy Policy
              </Link>{" "}
              for how we handle personal data, including data collected as part
              of safety enforcement.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
