import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { ContactForm } from './ContactForm';
import { MapPin, Phone, Mail } from 'lucide-react';

export const metadata = { title: 'Contact' };

// Static — form action is client-side
export const dynamic = 'force-static';

export default function ContactPage() {
  return (
    <>
      <Header />
      <Toast />
      <main id="main-content">
        <section className="pt-44 md:pt-52 pb-16 text-center bg-gradient-to-b from-cream-200 to-cream">
          <div className="container-padded">
            <div className="eyebrow mb-4">Get in Touch</div>
            <h1 className="text-display-xl mb-6">
              We&apos;re <em className="text-accent italic font-normal">Listening</em>
            </h1>
            <p className="max-w-xl mx-auto text-muted text-lg">
              For inquiries, bespoke fittings, or simply to say hello — we&apos;d love to hear from you.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-padded">
            <div className="grid md:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24 items-start">
              {/* Contact info */}
              <div>
                <h2 className="text-display-md mb-8">
                  Visit the <em className="text-accent italic font-normal">Atelier</em>
                </h2>

                <div className="space-y-8">
                  {[
                    {
                      Icon: MapPin,
                      eyebrow: 'Flagship Store',
                      title: '12 MM Alam Road',
                      lines: ['Gulberg III, Lahore 54000', 'Pakistan'],
                    },
                    {
                      Icon: Phone,
                      eyebrow: 'Concierge',
                      title: '+92 42 1234 5678',
                      lines: ['Mon–Sat: 10am – 9pm', 'Sunday: 12pm – 7pm'],
                    },
                    {
                      Icon: Mail,
                      eyebrow: 'Email',
                      title: 'hello@maisonaurelle.pk',
                      lines: ['press@maisonaurelle.pk', 'careers@maisonaurelle.pk'],
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <item.Icon size={22} />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-widest text-accent mb-2 font-medium">
                          {item.eyebrow}
                        </div>
                        <h4 className="font-display text-xl mb-1">{item.title}</h4>
                        <div className="text-muted text-sm leading-relaxed">
                          {item.lines.map((l, i) => (
                            <div key={i}>{l}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-cream-200">
                  <h4 className="font-display text-xl mb-3">Bespoke Appointments</h4>
                  <p className="text-muted leading-relaxed mb-6 text-sm">
                    For private fittings and bespoke consultations with our master tailors, book a one-on-one appointment with our concierge.
                  </p>
                  <a
                    href="#contact-form"
                    className="text-xs uppercase tracking-wider border-b border-ink pb-1 font-medium hover:text-accent hover:border-accent transition-colors"
                  >
                    Book Appointment
                  </a>
                </div>
              </div>

              {/* Form */}
              <div id="contact-form" className="bg-cream p-10 border border-border scroll-mt-32">
                <h2 className="text-display-md mb-2">
                  Send a <em className="text-accent italic font-normal">Message</em>
                </h2>
                <p className="text-muted mb-10">We respond to all inquiries within 24 hours.</p>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
