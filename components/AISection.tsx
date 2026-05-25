'use client';

import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { SectionHeader } from './SectionHeader';

interface AISectionProps {
  recommendations: Parameters<typeof ProductCard>[0]['product'][];
}

export function AISection({ recommendations }: AISectionProps) {
  return (
    <section className="section bg-ink text-cream relative overflow-hidden">
      <div className="container-padded">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent text-accent text-xs uppercase tracking-widest font-medium rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            AI Curated For You
          </div>
          <h2 className="text-display-lg mb-4 text-cream">
            Intelligently <em className="text-accent italic font-normal">Personalized</em>
          </h2>
          <p className="text-cream/70 max-w-xl mx-auto text-lg leading-relaxed">
            Our AI learns your style, refining recommendations with every visit — curated picks based on your taste and browsing patterns.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} theme="dark" />
          ))}
        </div>
      </div>
    </section>
  );
}
