'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={cn(
        'mb-16',
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && <div className="eyebrow mb-4">{eyebrow}</div>}
      <h2 className="text-display-lg mb-4">{title}</h2>
      {subtitle && (
        <p
          className={cn(
            'text-muted text-lg leading-relaxed',
            align === 'center' ? 'max-w-xl mx-auto' : ''
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
