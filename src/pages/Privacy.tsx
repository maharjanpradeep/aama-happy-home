import Header from "@/components/Header";
import { usePageMeta } from "@/hooks/use-page-meta";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

const LAST_UPDATED = "October 6, 2026";

const formattedPhone = `${CONTACT_PHONE.slice(0, 3)}-${CONTACT_PHONE.slice(3, 6)}-${CONTACT_PHONE.slice(6)}`;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-foreground">{title}</h2>
    {children}
  </section>
);

const Privacy = () => {
  usePageMeta({
    title: "Privacy Policy | Aama Day Care Center",
    description: "How Aama Day Care Center collects, uses and protects information on aamadaycare.com.",
    path: "/privacy",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6 space-y-8 text-muted-foreground leading-relaxed">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-sm">Last updated: {LAST_UPDATED}</p>
            <p>
              Aama Day Care Center ("we", "us") is a licensed home daycare in San Ramon, California. This policy
              explains what information we collect through aamadaycare.com and how we use it.
            </p>
          </header>

          <Section title="Information we collect">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Google sign-in.</strong> Parents, guardians and staff sign in to the check-in page with
                their Google account. We receive their name, email address and profile picture from Google, and
                use the email address only to confirm they are allowed to check a child in or out.
              </li>
              <li>
                <strong>Enrollment and check-in records.</strong> For enrolled families we keep the child's name
                and date of birth, guardian names, emails and phone numbers, address, physician contact,
                check-in and check-out times, and notes shared with parents. Staff enter this information; it is
                stored in Google Workspace (Google Sheets) and is visible only to our staff.
              </li>
              <li>
                <strong>Emails.</strong> We send check-out reminders and notices to guardians' email addresses
                through our email provider.
              </li>
              <li>
                <strong>Website analytics.</strong> We use Google Analytics to see how many people visit the site
                and which pages they view. It uses cookies and does not tell us who you are.
              </li>
            </ul>
          </Section>

          <Section title="Photos on social media">
            <p>
              Our staff choose and edit the photos we share on our Facebook Page, Instagram account and Google
              Business Profile. Photo captions may be drafted with AI (Google Gemini), and location information
              stored inside photo files is removed before posting. If you would like a photo of your child taken
              down, contact us and we will remove it.
            </p>
          </Section>

          <Section title="How we use and share information">
            <p>
              We use this information only to run the daycare: checking children in and out, contacting
              families, and sharing updates about our program. We do not sell or rent personal information, and
              we do not share it with anyone except the service providers that run our systems (Google,
              Meta for Facebook and Instagram, our email provider and our website host), or when required by law
              or by California child care licensing.
            </p>
            <p>
              Our use of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </Section>

          <Section title="Keeping information safe">
            <p>
              Access to family records is limited to our staff and protected by Google sign-in. Records are kept
              while a child is enrolled and afterwards for as long as licensing rules require.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>
              This website is meant for parents, guardians and staff. We do not knowingly collect information
              directly from children through the website.
            </p>
          </Section>

          <Section title="Your choices">
            <p>
              You can ask to see, correct or delete your family's information, or ask us to remove a photo, by
              contacting us. California residents may have additional rights under state law.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Aama Day Care Center, 737 Birdwood Ct, San Ramon, CA 94582
              <br />
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
                {CONTACT_EMAIL}
              </a>
              <br />
              Phone:{" "}
              <a href={`tel:${CONTACT_PHONE}`} className="text-primary underline">
                {formattedPhone}
              </a>
            </p>
          </Section>
        </article>
      </main>
    </div>
  );
};

export default Privacy;
