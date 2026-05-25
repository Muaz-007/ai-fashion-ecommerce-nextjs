import { PolicyPage } from '@/components/PolicyPage';

export const metadata = { title: 'Privacy Policy' };
export const dynamic = 'force-static';

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Your Trust, Our Promise"
      title={<>Privacy <em className="text-accent italic font-normal">Policy</em></>}
      lastUpdated="May 2026"
      intro="At Maison Aurelle, your privacy is not a legal requirement — it's a measure of trust. This policy explains what information we collect, why we collect it, and the control you have over it."
      sections={[
        {
          heading: 'Information We Collect',
          body: (
            <>
              <p>We collect only what we need to serve you with care:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account details:</strong> name, email, phone, and shipping address when you register.</li>
                <li><strong>Order history:</strong> products purchased, sizes, and delivery details.</li>
                <li><strong>Browsing behaviour:</strong> pages visited, products viewed, and items added to your bag — used to power our AI recommendations.</li>
                <li><strong>Payment information:</strong> processed by our payment partners; we never store full card numbers.</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'How We Use Your Information',
          body: (
            <>
              <p>Your data helps us:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Fulfil orders and provide concierge support.</li>
                <li>Personalise your shopping experience through AI-driven recommendations.</li>
                <li>Notify you of new arrivals, restocks, and exclusive previews (only if you opt in).</li>
                <li>Improve our products, service, and platform.</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'AI & Personalisation',
          body: (
            <p>Our recommendation engine analyses your browsing patterns and purchase history to suggest pieces tailored to your taste. This processing happens on our servers and is never sold or shared with third parties. You can request a full export or deletion of your activity history at any time.</p>
          ),
        },
        {
          heading: 'Data Sharing',
          body: (
            <>
              <p>We share information only with partners essential to fulfilling your order:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Logistics providers (TCS, Leopard, M&P) for delivery.</li>
                <li>Payment processors (JazzCash, EasyPaisa, card networks).</li>
                <li>Email service providers for transactional and marketing emails.</li>
              </ul>
              <p>We never sell your data. Ever.</p>
            </>
          ),
        },
        {
          heading: 'Your Rights',
          body: (
            <>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Access the personal data we hold about you.</li>
                <li>Correct inaccurate information.</li>
                <li>Request deletion of your account and all associated data.</li>
                <li>Withdraw consent for marketing communications at any time.</li>
                <li>Export your data in a portable format.</li>
              </ul>
              <p>Email <a href="mailto:privacy@maisonaurelle.pk" className="text-accent border-b border-accent">privacy@maisonaurelle.pk</a> to exercise any of these rights.</p>
            </>
          ),
        },
        {
          heading: 'Security',
          body: (
            <p>Your data is encrypted in transit (TLS 1.3) and at rest. Passwords are hashed with industry-standard bcrypt. Sessions use signed, HTTP-only cookies. Our infrastructure is regularly audited for vulnerabilities.</p>
          ),
        },
        {
          heading: 'Children',
          body: (
            <p>Maison Aurelle is intended for adults aged 18 and over. We do not knowingly collect information from children. If you believe a child has provided us information, contact us and we&apos;ll remove it immediately.</p>
          ),
        },
        {
          heading: 'Changes to This Policy',
          body: (
            <p>We may update this policy as our service evolves. Material changes will be communicated via email to registered users. The &ldquo;last updated&rdquo; date at the top of this page reflects the most recent revision.</p>
          ),
        },
      ]}
    />
  );
}
