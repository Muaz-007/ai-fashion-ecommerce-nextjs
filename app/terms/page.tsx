import { PolicyPage } from '@/components/PolicyPage';

export const metadata = { title: 'Terms of Service' };
export const dynamic = 'force-static';

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="The Fine Print, Honestly"
      title={<>Terms of <em className="text-accent italic font-normal">Service</em></>}
      lastUpdated="May 2026"
      intro="By accessing or using Maison Aurelle, you agree to the terms below. We've kept them straightforward — no jargon, no hidden clauses."
      sections={[
        {
          heading: 'Acceptance of Terms',
          body: (
            <p>By creating an account, placing an order, or browsing our site, you accept these terms in full. If you don&apos;t agree with any part, please discontinue use.</p>
          ),
        },
        {
          heading: 'Your Account',
          body: (
            <>
              <p>You&apos;re responsible for keeping your account credentials secure and for all activity under your account. Notify us immediately at <a href="mailto:hello@maisonaurelle.pk" className="text-accent border-b border-accent">hello@maisonaurelle.pk</a> if you suspect unauthorised access.</p>
              <p>You must be at least 18 years old to register.</p>
            </>
          ),
        },
        {
          heading: 'Orders & Pricing',
          body: (
            <>
              <p>All prices are in Pakistani Rupees (PKR) and include applicable taxes. We reserve the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Refuse or cancel any order at our discretion (e.g., suspected fraud, pricing errors).</li>
                <li>Adjust prices and product availability without notice.</li>
                <li>Limit quantities per customer for high-demand items.</li>
              </ul>
              <p>Orders are confirmed only after payment is successfully processed.</p>
            </>
          ),
        },
        {
          heading: 'Shipping & Delivery',
          body: (
            <>
              <p>Standard delivery within Pakistan is 3–5 business days. International shipping varies by region. Delivery dates are estimates, not guarantees.</p>
              <p>Risk of loss passes to you upon delivery to your address. Please inspect items immediately and report any damage within 48 hours.</p>
            </>
          ),
        },
        {
          heading: 'Returns & Exchanges',
          body: (
            <>
              <p>Unworn items in original condition can be returned within <strong>14 days</strong> of delivery for a full refund or exchange. The following are non-returnable:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Bespoke, made-to-order, or customised pieces.</li>
                <li>Sale items marked &ldquo;final sale&rdquo;.</li>
                <li>Intimates and accessories that have been worn.</li>
              </ul>
              <p>Refunds are processed to the original payment method within 7–10 business days.</p>
            </>
          ),
        },
        {
          heading: 'Intellectual Property',
          body: (
            <p>All designs, photography, text, and branding on this site are property of Maison Aurelle. You may not copy, reproduce, or use any content commercially without our written permission.</p>
          ),
        },
        {
          heading: 'User Conduct',
          body: (
            <>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Use the platform for unlawful purposes.</li>
                <li>Attempt to gain unauthorised access to our systems.</li>
                <li>Post or transmit harmful content via reviews or messages.</li>
                <li>Use automated scrapers, bots, or harvesters.</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'Limitation of Liability',
          body: (
            <p>Maison Aurelle is provided &ldquo;as is&rdquo;. We are not liable for indirect, incidental, or consequential damages arising from use of our service. Our total liability for any claim shall not exceed the amount you paid for the product in question.</p>
          ),
        },
        {
          heading: 'Governing Law',
          body: (
            <p>These terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes shall be resolved in the courts of Lahore.</p>
          ),
        },
        {
          heading: 'Changes',
          body: (
            <p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance. Material changes will be notified by email to registered users.</p>
          ),
        },
      ]}
    />
  );
}
