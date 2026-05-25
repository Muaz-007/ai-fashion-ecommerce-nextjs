import { PolicyPage } from '@/components/PolicyPage';

export const metadata = { title: 'Cookies Policy' };
export const dynamic = 'force-static';

export default function CookiesPage() {
  return (
    <PolicyPage
      eyebrow="Small Files, Big Impact"
      title={<>Cookies <em className="text-accent italic font-normal">Policy</em></>}
      lastUpdated="May 2026"
      intro="Cookies are tiny text files we store on your device. They help us remember your preferences, keep you signed in, and understand how our atelier is used."
      sections={[
        {
          heading: 'What Are Cookies?',
          body: (
            <p>Cookies are small data files placed on your device by websites you visit. They&apos;re widely used to make websites work efficiently and provide reporting information.</p>
          ),
        },
        {
          heading: 'Essential Cookies',
          body: (
            <>
              <p>These cookies are necessary for the site to function. You cannot opt out.</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><code className="bg-cream-200 px-2 py-0.5 text-xs">maison_session</code> — keeps you signed in (expires after 7 days)</li>
                <li><code className="bg-cream-200 px-2 py-0.5 text-xs">guest_session</code> — tracks anonymous browsing for AI recommendations (30 days)</li>
                <li><code className="bg-cream-200 px-2 py-0.5 text-xs">cart_local</code> — stores your bag contents before you sign in</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'Functional Cookies',
          body: (
            <p>These remember choices you make (language, region, theme) to provide a more personal experience. Disabling them won&apos;t break the site, but may reduce convenience.</p>
          ),
        },
        {
          heading: 'Analytics Cookies',
          body: (
            <p>We use anonymised analytics to understand which pages are popular and how visitors navigate the site. This data helps us improve the user experience. No personally identifiable information is collected for analytics.</p>
          ),
        },
        {
          heading: 'AI Personalisation',
          body: (
            <p>Our recommendation engine uses cookie-based session tracking to learn your style preferences. This happens entirely on our servers — no third-party trackers, no data brokers. You can clear this history anytime from your account settings.</p>
          ),
        },
        {
          heading: 'Managing Cookies',
          body: (
            <>
              <p>You can control cookies through your browser settings:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>
              <p>Blocking essential cookies will prevent the site from functioning correctly — you won&apos;t be able to sign in or place orders.</p>
            </>
          ),
        },
        {
          heading: 'Third-Party Cookies',
          body: (
            <p>We don&apos;t use third-party advertising cookies. Payment partners (JazzCash, EasyPaisa, card processors) may set their own cookies when you complete checkout — these are governed by their respective privacy policies.</p>
          ),
        },
        {
          heading: 'Updates',
          body: (
            <p>This cookies policy may be updated as our service evolves. The &ldquo;last updated&rdquo; date reflects the most recent revision. Continued use of the site implies acceptance of the current policy.</p>
          ),
        },
      ]}
    />
  );
}
