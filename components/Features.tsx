'use client';

import { motion } from 'framer-motion';
import { Sparkles, Award, Gem, Headphones } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const FEATURES = [
  {
    Icon: Sparkles,
    title: 'AI Personalization',
    description: 'Smart recommendations tailored to your unique aesthetic preferences.',
  },
  {
    Icon: Award,
    title: 'Artisanal Craft',
    description: 'Hand-crafted by master artisans with decades of inherited expertise.',
  },
  {
    Icon: Gem,
    title: 'Premium Materials',
    description: 'Only the finest fabrics — silk, organza, cashmere, sourced ethically.',
  },
  {
    Icon: Headphones,
    title: 'Concierge Service',
    description: 'Personal stylists available for bespoke fittings and consultations.',
  },
];

export function Features() {
  return (
    <section className="section bg-cream-200">
      <div className="container-padded">
        <SectionHeader
          eyebrow="The Aurelle Promise"
          title={<>A New Era of <em className="text-accent italic font-normal">Fashion Retail</em></>}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-10 bg-cream border border-border transition-all duration-300 hover:border-accent hover:-translate-y-1 hover:shadow-medium"
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-accent">
                <Icon size={36} strokeWidth={1.2} />
              </div>
              <h4 className="font-display text-xl mb-3">{title}</h4>
              <p className="text-muted text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
