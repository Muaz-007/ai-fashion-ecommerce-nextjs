'use client';

import { motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toast } from './Toast';

interface Section {
  heading: string;
  body: React.ReactNode;
}

interface PolicyPageProps {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  lastUpdated: string;
  sections: Section[];
}

export function PolicyPage({ eyebrow, title, intro, lastUpdated, sections }: PolicyPageProps) {
  return (
    <>
      <Header />
      <Toast />
      <main>
        {/* Hero */}
        <section className="pt-44 md:pt-52 pb-16 text-center bg-gradient-to-b from-cream-200 to-cream">
          <div className="container-padded">
            <div className="eyebrow mb-5">{eyebrow}</div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-display-xl mb-4 text-balance max-w-3xl mx-auto"
            >
              {title}
            </motion.h1>
            <p className="text-muted text-sm uppercase tracking-widest mt-6">
              Last updated · {lastUpdated}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="container-padded max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-lg text-muted leading-relaxed mb-16 font-display italic"
            >
              {intro}
            </motion.p>

            <div className="space-y-14">
              {sections.map((section, i) => (
                <motion.div
                  key={section.heading}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="grid md:grid-cols-[80px_1fr] gap-6 md:gap-10 items-start"
                >
                  <div className="font-display text-3xl text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl mb-4">{section.heading}</h2>
                    <div className="text-muted leading-relaxed space-y-4 text-[15px]">
                      {section.body}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-20 pt-10 border-t border-border text-sm text-muted">
              Questions about this policy? Contact us at{' '}
              <a
                href="mailto:hello@maisonaurelle.pk"
                className="text-accent border-b border-accent hover:opacity-70 transition-opacity"
              >
                hello@maisonaurelle.pk
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
