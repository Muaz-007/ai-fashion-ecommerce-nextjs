'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ProductPlaceholder } from './ProductPlaceholder';
import { cn } from '@/lib/utils';

export function Hero() {
  // Mouse-tracking for subtle parallax depth on the visual blocks
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the motion with a spring
  const springX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 18 });

  // Map mouse to layer translations (back layer moves less, front moves more)
  const backX = useTransform(springX, [-1, 1], [-12, 12]);
  const backY = useTransform(springY, [-1, 1], [-8, 8]);
  const frontX = useTransform(springX, [-1, 1], [-22, 22]);
  const frontY = useTransform(springY, [-1, 1], [-14, 14]);
  const ornamentX = useTransform(springX, [-1, 1], [6, -6]);
  const ornamentY = useTransform(springY, [-1, 1], [6, -6]);

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      // Normalize to [-1, 1]
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    }
    function handleMouseLeave() {
      mouseX.set(0);
      mouseY.set(0);
    }
    const el = heroRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <section
      ref={heroRef}
      className="relative md:min-h-screen flex items-center overflow-hidden pt-44 md:pt-[120px] pb-12 md:pb-0 bg-gradient-to-br from-cream-200 via-cream to-cream-300"
    >
      {/* Decorative oversized text (desktop only) */}
      <div
        aria-hidden
        className="absolute top-[10%] -left-[5%] font-display italic text-[12rem] text-accent/[0.08] leading-none pointer-events-none hidden md:block select-none"
      >
        Aurelle
      </div>

      {/* Mobile decorative ornament — top-right, subtle */}
      <div
        aria-hidden
        className="absolute top-[100px] -right-12 md:hidden pointer-events-none opacity-60"
      >
        <FiligreeOrnament size={160} />
      </div>

      {/* Floating animated ornament (desktop) */}
      <motion.div
        style={{ x: ornamentX, y: ornamentY }}
        className="absolute top-[14%] right-[4%] hidden lg:block pointer-events-none"
      >
        <FiligreeOrnament />
      </motion.div>

      <div className="container-padded grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center w-full relative z-10">
        {/* Text content — centered on mobile (balanced), left on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 text-center md:text-left"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="eyebrow mb-4 flex items-center gap-3 justify-center md:justify-start"
          >
            <span className="w-8 h-px bg-accent" />
            Spring · Summer 2026 Collection
            <span className="w-8 h-px bg-accent md:hidden" />
          </motion.div>

          <h1 className="text-display-xl mb-6 leading-[1.05] text-balance">
            Where{' '}
            <span className="relative inline-block">
              <em className="text-accent font-normal italic">Heritage</em>
              {/* Underline flourish that draws in */}
              <motion.svg
                viewBox="0 0 200 12"
                className="absolute left-0 -bottom-2 w-full h-3 text-accent/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              >
                <motion.path
                  d="M2 6 Q 50 1 100 6 T 198 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
                />
              </motion.svg>
            </span>
            <br />
            Meets the Modern Woman
          </h1>

          <p className="text-lg text-muted max-w-md mb-10 leading-relaxed mx-auto md:mx-0">
            Discover timeless silhouettes, hand-crafted by Pakistan&apos;s master artisans — now curated for you by intelligent personalization.
          </p>

          {/* Buttons: stacked & full-width on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 sm:flex-wrap">
            <Link
              href="/shop"
              className="btn btn-primary group/btn w-full sm:w-auto justify-center"
            >
              <span>Explore Collection</span>
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                →
              </motion.span>
            </Link>
            <Link href="/about" className="btn btn-secondary w-full sm:w-auto justify-center">
              Our Atelier
            </Link>
          </div>
        </motion.div>

        {/* Visual area — desktop parallax product cards (hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="relative h-[75vh] min-h-[500px] hidden md:block"
        >
          {/* Main image — back layer */}
          <motion.div
            style={{ x: backX, y: backY }}
            className="absolute right-0 top-0 w-[75%] h-full shadow-large overflow-hidden"
          >
            <ProductPlaceholder
              category="Bridal"
              productName="Maison Aurelle"
              gradient="linear-gradient(160deg, #C9B398 0%, #8B6F47 100%)"
            />
          </motion.div>

          {/* Secondary image — front layer (moves more) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ x: frontX, y: frontY }}
            className="absolute left-0 -bottom-12 w-[45%] h-[55%] shadow-large overflow-hidden z-10"
          >
            <ProductPlaceholder
              category="Formal"
              productName="Aurelle Atelier"
              gradient="linear-gradient(135deg, #1A1614 0%, #3A2E26 100%)"
            />
          </motion.div>
        </motion.div>

        {/* MOBILE EDITORIAL COMPOSITION — replaces fake placeholder cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="md:hidden relative mt-2 pt-8"
        >
          {/* Top hairline divider with center diamond */}
          <div className="flex items-center gap-3 mb-8">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/40 to-accent/40" />
            <span className="w-1.5 h-1.5 bg-accent rotate-45" />
            <span className="flex-1 h-px bg-gradient-to-l from-transparent via-accent/40 to-accent/40" />
          </div>

          {/* Roman numeral year — decorative, oversized */}
          <div className="text-center mb-6">
            <div className="font-display italic text-7xl leading-none text-accent/90 tracking-tighter">
              MMXXVI
            </div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-muted mt-2">
              The Spring Edit
            </div>
          </div>

          {/* Italianno script signature */}
          <p
            className="text-center text-3xl text-ink/80 mb-8 leading-tight"
            style={{ fontFamily: 'var(--font-script)' }}
          >
            an atelier where heritage breathes
          </p>

          {/* Three brand credential pillars */}
          <div className="grid grid-cols-3 gap-2 py-6 border-y border-accent/20">
            {[
              { num: '30+', label: 'Master Artisans' },
              { num: 'AI', label: 'Curated Picks' },
              { num: 'PK', label: 'Crafted Lahore' },
            ].map((pillar, i) => (
              <motion.div
                key={pillar.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                className={cn(
                  'text-center px-1',
                  i === 1 && 'border-x border-accent/15'
                )}
              >
                <div className="font-display italic text-2xl text-accent mb-1">
                  {pillar.num}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-muted leading-tight">
                  {pillar.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom flourish — drawn brush stroke */}
          <motion.svg
            viewBox="0 0 280 24"
            className="w-full h-6 mt-8 text-accent/40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
          >
            <motion.path
              d="M10 12 Q 60 4 100 12 Q 140 20 180 12 Q 220 4 270 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, delay: 1.2, ease: 'easeOut' }}
            />
            {/* Center diamond accent */}
            <motion.path
              d="M140 8 L143 12 L140 16 L137 12 Z"
              fill="currentColor"
              stroke="none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ duration: 0.5, delay: 2.4 }}
            />
          </motion.svg>
        </motion.div>
      </div>

      {/* Scroll indicator — desktop only (mobile uses natural scroll) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-10 hidden md:flex"
      >
        <span className="text-[10px] uppercase tracking-widest text-muted">Scroll</span>
        <div className="w-px h-12 bg-muted/40 relative overflow-hidden">
          <span className="absolute top-0 left-0 w-full h-1/2 bg-accent animate-scroll-down" />
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// Animated gold filigree ornament
// Draws itself in with stroke-dasharray on mount.
// ============================================
function FiligreeOrnament({ size = 180 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      stroke="#B08D5A"
      strokeWidth="0.6"
      className="text-accent"
    >
      {/* Outer circle */}
      <motion.circle
        cx="90"
        cy="90"
        r="78"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* Dotted inner ring */}
      <motion.circle
        cx="90"
        cy="90"
        r="68"
        strokeDasharray="1 5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: 2.4, delay: 0.3, ease: 'easeOut' }}
      />

      {/* Four corner flourishes */}
      {[0, 90, 180, 270].map((rotation, i) => (
        <motion.g
          key={rotation}
          transform={`rotate(${rotation} 90 90)`}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 + i * 0.15 }}
          style={{ transformOrigin: '90px 90px' }}
        >
          <path d="M90 12 Q98 22 90 30 Q82 22 90 12 Z" fill="currentColor" opacity="0.4" />
          <line x1="90" y1="30" x2="90" y2="42" />
        </motion.g>
      ))}

      {/* Center monogram */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
      >
        <circle cx="90" cy="90" r="22" fill="none" />
        <text
          x="90"
          y="100"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', serif"
          fontSize="28"
          fontStyle="italic"
          fill="currentColor"
          stroke="none"
          opacity="0.8"
        >
          MA
        </text>
      </motion.g>

      {/* Cross flourishes at cardinal points */}
      <motion.g
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 1.4, delay: 1.2 }}
      >
        <path d="M90 50 L90 60" />
        <path d="M90 120 L90 130" />
        <path d="M50 90 L60 90" />
        <path d="M120 90 L130 90" />
      </motion.g>
    </svg>
  );
}
