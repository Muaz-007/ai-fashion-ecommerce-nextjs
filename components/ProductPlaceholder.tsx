'use client';

/**
 * Elegant SVG placeholder for product images.
 *
 * Layers (back → front):
 *  1. Gradient background (passed via `gradient`)
 *  2. Soft radial highlight
 *  3. Decorative SVG motif (varies by `variant`)
 *  4. Corner accent lines
 *
 * Variants are chosen deterministically by product id so the same product
 * always gets the same motif (stable across renders).
 */

interface ProductPlaceholderProps {
  productId?: number;
  productName?: string;
  category?: string;
  gradient?: string | null;
  /** If provided, renders this image instead of the gradient + motif placeholder */
  imageUrl?: string | null;
  className?: string;
  /** Show the "Aurelle · Atelier 2026" wordmark at the bottom (default: true) */
  showWordmark?: boolean;
  /** Force a specific motif variant; otherwise picked from category/id */
  variant?: 'monogram' | 'silhouette' | 'damask' | 'paisley';
}

const DEFAULT_GRADIENT =
  'linear-gradient(135deg, #B08D5A 0%, #6B4F2E 100%)';

type Variant = 'monogram' | 'silhouette' | 'damask' | 'paisley';

function pickVariant(productId?: number, category?: string): Variant {
  // Category-specific defaults
  if (category === 'Bridal') return 'damask';
  if (category === 'Accessories') return 'paisley';

  // Fallback: rotate by id
  const variants: Variant[] = ['monogram', 'silhouette', 'damask', 'paisley'];
  return variants[(productId ?? 0) % variants.length];
}

export function ProductPlaceholder({
  productId,
  productName,
  category,
  gradient,
  imageUrl,
  className = '',
  showWordmark = true,
  variant: forcedVariant,
}: ProductPlaceholderProps) {
  // If a real image was uploaded, render it instead of the generated placeholder
  if (imageUrl) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        {/* Using img instead of next/image so we don't need to enumerate every
            user-uploaded path in next.config.js — admin-uploaded images
            live under /uploads/ which is served by Next.js automatically. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={productName || 'Product'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const variant = forcedVariant ?? pickVariant(productId, category);
  const initials = (productName || 'MA')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: gradient || DEFAULT_GRADIENT }}
    >
      {/* Soft directional highlight */}
      <div
        className="absolute inset-0 opacity-70 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, transparent 55%), radial-gradient(circle at 75% 80%, rgba(0,0,0,0.18) 0%, transparent 55%)',
        }}
      />

      {/* Decorative SVG motif (centered, ~50% width) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {variant === 'monogram' && <Monogram initials={initials} />}
        {variant === 'silhouette' && <DressSilhouette />}
        {variant === 'damask' && <DamaskPattern />}
        {variant === 'paisley' && <PaisleyMotif />}
      </div>

      {/* Corner accents (top-right + bottom-left) */}
      <svg
        className="absolute top-4 right-4 w-12 h-12 text-cream/40 pointer-events-none"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      >
        <path d="M40 0 L40 12 M40 0 L28 0" />
      </svg>
      <svg
        className="absolute bottom-4 left-4 w-12 h-12 text-cream/40 pointer-events-none"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      >
        <path d="M0 40 L0 28 M0 40 L12 40" />
      </svg>

      {/* Bottom-center brand wordmark */}
      {showWordmark && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="font-display italic text-cream/60 text-lg tracking-wide">
            Aurelle
          </div>
          <div className="text-cream/30 text-[8px] tracking-[0.3em] uppercase mt-0.5">
            Atelier · 2026
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MOTIF: Monogram (large stylized initials in a ring)
// ============================================
function Monogram({ initials }: { initials: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-1/2 max-w-[220px] text-cream/35"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="72" strokeDasharray="2 4" />
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', serif"
        fontSize="64"
        fontStyle="italic"
        fontWeight="400"
        fill="currentColor"
        stroke="none"
        opacity="0.7"
      >
        {initials}
      </text>
      {/* Top + bottom flourishes */}
      <path d="M65 30 Q100 22 135 30" />
      <path d="M65 170 Q100 178 135 170" />
    </svg>
  );
}

// ============================================
// MOTIF: Minimalist dress silhouette
// ============================================
function DressSilhouette() {
  return (
    <svg
      viewBox="0 0 120 200"
      className="h-3/4 max-h-[280px] text-cream/35"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
    >
      {/* Neckline */}
      <path d="M48 20 Q60 24 72 20" />
      {/* Shoulders → torso → flare to hem */}
      <path d="M48 20 L30 50 L40 90 L20 180 L100 180 L80 90 L90 50 L72 20" />
      {/* Center seam */}
      <line x1="60" y1="20" x2="60" y2="180" strokeDasharray="2 4" opacity="0.5" />
      {/* Subtle waist accent */}
      <path d="M40 90 Q60 95 80 90" opacity="0.6" />
      {/* Hem accent line */}
      <path d="M22 175 L98 175" opacity="0.4" />
    </svg>
  );
}

// ============================================
// MOTIF: Damask / Mughal-inspired arabesque
// ============================================
function DamaskPattern() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-3/5 max-w-[260px] text-cream/30"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      {/* Central medallion */}
      <circle cx="100" cy="100" r="40" />
      <circle cx="100" cy="100" r="32" />
      <circle cx="100" cy="100" r="6" fill="currentColor" opacity="0.5" />

      {/* 4-petal flourish */}
      <path d="M100 60 Q120 80 100 100 Q80 80 100 60 Z" />
      <path d="M100 140 Q120 120 100 100 Q80 120 100 140 Z" />
      <path d="M60 100 Q80 80 100 100 Q80 120 60 100 Z" />
      <path d="M140 100 Q120 80 100 100 Q120 120 140 100 Z" />

      {/* Diagonal mini-petals */}
      <path d="M72 72 Q100 70 100 100" opacity="0.6" />
      <path d="M128 72 Q100 70 100 100" opacity="0.6" />
      <path d="M72 128 Q100 130 100 100" opacity="0.6" />
      <path d="M128 128 Q100 130 100 100" opacity="0.6" />

      {/* Outer dotted circle */}
      <circle cx="100" cy="100" r="70" strokeDasharray="1 6" opacity="0.7" />
    </svg>
  );
}

// ============================================
// MOTIF: Paisley (boteh)
// ============================================
function PaisleyMotif() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-1/2 max-w-[220px] text-cream/35"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
    >
      {/* Outer paisley curve */}
      <path d="M100 30 C 60 30, 40 80, 60 130 C 80 170, 130 160, 140 120 C 145 90, 130 60, 100 30 Z" />
      {/* Inner echo */}
      <path
        d="M100 50 C 75 55, 60 90, 75 125 C 90 155, 125 145, 130 115 C 132 95, 122 70, 100 50 Z"
        opacity="0.7"
      />
      {/* Innermost detail */}
      <circle cx="100" cy="95" r="10" />
      <circle cx="100" cy="95" r="3" fill="currentColor" opacity="0.6" />
      {/* Decorative dots along the curve */}
      <circle cx="65" cy="100" r="1.5" fill="currentColor" />
      <circle cx="75" cy="135" r="1.5" fill="currentColor" />
      <circle cx="110" cy="150" r="1.5" fill="currentColor" />
      <circle cx="130" cy="120" r="1.5" fill="currentColor" />
    </svg>
  );
}
