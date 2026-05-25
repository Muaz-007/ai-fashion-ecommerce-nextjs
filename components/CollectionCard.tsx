'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProductPlaceholder } from './ProductPlaceholder';

interface CollectionCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  gradient: string;
  /** Map title → which motif to show */
  variant?: 'monogram' | 'silhouette' | 'damask' | 'paisley';
  index?: number;
}

export function CollectionCard({
  href,
  eyebrow,
  title,
  description,
  gradient,
  variant,
  index = 0,
}: CollectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        href={href}
        className="group relative aspect-[3/4] overflow-hidden cursor-pointer flex items-end p-10"
      >
        {/* Placeholder background (gradient + motif) */}
        <div className="absolute inset-0 transition-transform duration-700 ease-smooth group-hover:scale-110">
          <ProductPlaceholder
            productName={title}
            gradient={gradient}
            variant={variant}
            showWordmark={false}
          />
        </div>

        {/* Bottom dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 text-cream">
          <div className="text-eyebrow uppercase tracking-widest text-accent-light font-medium mb-2">
            {eyebrow}
          </div>
          <h3 className="font-display text-3xl mb-2 text-cream">{title}</h3>
          <p className="text-sm opacity-90 mb-5">{description}</p>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium pb-2 border-b border-cream group-hover:text-accent group-hover:border-accent transition-colors">
            Discover <ArrowRight size={14} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
