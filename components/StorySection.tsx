'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductPlaceholder } from './ProductPlaceholder';

export function StorySection() {
  return (
    <section className="section-lg">
      <div className="container-padded">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] overflow-hidden"
          >
            <ProductPlaceholder
              productName="The Atelier"
              gradient="linear-gradient(160deg, #C9B398 0%, #8B6F47 100%)"
              variant="damask"
            />
            <div className="absolute -bottom-12 -right-12 w-1/2 aspect-square shadow-large overflow-hidden">
              <ProductPlaceholder
                productName="Heritage"
                gradient="linear-gradient(135deg, #1A1614 0%, #3A2E26 100%)"
                variant="monogram"
                showWordmark={false}
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="eyebrow mb-4">Our Atelier</div>
            <h2 className="text-display-lg mb-6">
              Crafted with <em className="text-accent italic font-normal">Soul</em>, Stitched with Story
            </h2>
            <p className="text-muted mb-6 leading-loose text-lg">
              Every Maison Aurelle piece begins in a small atelier in Lahore, where third-generation artisans transform yards of fabric into wearable poetry. Our embroideries are not printed — they are whispered into being, thread by patient thread.
            </p>
            <p className="text-muted mb-6 leading-loose text-lg">
              We blend this ancient craft with modern intelligence — our platform learns your preferences, suggesting pieces that feel uniquely yours. Heritage and innovation, intertwined.
            </p>

            <Link href="/about" className="btn btn-primary mt-4">
              Our Story
            </Link>

            <div className="font-script text-5xl text-accent mt-8">— The Aurelle Family</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
