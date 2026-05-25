'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Info } from 'lucide-react';
import { Select } from '@/components/Select';
import { cn } from '@/lib/utils';

type GarmentKey = 'kurta' | 'lehenga' | 'sharara' | 'saree' | 'shawl';
type Unit = 'in' | 'cm';

interface SizeRow {
  size: string;
  bust: [number, number];
  waist: [number, number];
  hip: [number, number];
  length?: [number, number];
}

const KURTA_SIZES: SizeRow[] = [
  { size: 'XS', bust: [32, 34], waist: [26, 28], hip: [34, 36], length: [42, 44] },
  { size: 'S',  bust: [34, 36], waist: [28, 30], hip: [36, 38], length: [42, 44] },
  { size: 'M',  bust: [36, 38], waist: [30, 32], hip: [38, 40], length: [44, 46] },
  { size: 'L',  bust: [38, 40], waist: [32, 34], hip: [40, 42], length: [44, 46] },
  { size: 'XL', bust: [40, 42], waist: [34, 36], hip: [42, 44], length: [46, 48] },
  { size: 'XXL', bust: [42, 44], waist: [36, 38], hip: [44, 46], length: [46, 48] },
];

const LEHENGA_SIZES: SizeRow[] = [
  { size: 'XS', bust: [32, 34], waist: [26, 28], hip: [34, 36], length: [40, 42] },
  { size: 'S',  bust: [34, 36], waist: [28, 30], hip: [36, 38], length: [40, 42] },
  { size: 'M',  bust: [36, 38], waist: [30, 32], hip: [38, 40], length: [40, 42] },
  { size: 'L',  bust: [38, 40], waist: [32, 34], hip: [40, 42], length: [40, 42] },
  { size: 'XL', bust: [40, 42], waist: [34, 36], hip: [42, 44], length: [40, 42] },
];

const SHARARA_SIZES: SizeRow[] = [
  { size: 'XS', bust: [32, 34], waist: [26, 28], hip: [34, 36], length: [40, 42] },
  { size: 'S',  bust: [34, 36], waist: [28, 30], hip: [36, 38], length: [40, 42] },
  { size: 'M',  bust: [36, 38], waist: [30, 32], hip: [38, 40], length: [42, 44] },
  { size: 'L',  bust: [38, 40], waist: [32, 34], hip: [40, 42], length: [42, 44] },
  { size: 'XL', bust: [40, 42], waist: [34, 36], hip: [42, 44], length: [42, 44] },
];

const GARMENTS: Record<
  GarmentKey,
  { label: string; description: string; sizes: SizeRow[]; oneSize?: boolean }
> = {
  kurta: {
    label: 'Kurta & Suit',
    description: 'Cotton, lawn, silk kurtas and 2-3 piece suits.',
    sizes: KURTA_SIZES,
  },
  lehenga: {
    label: 'Lehenga',
    description: 'Bridal and engagement lehengas — choli sized by bust.',
    sizes: LEHENGA_SIZES,
  },
  sharara: {
    label: 'Sharara & Gharara',
    description: 'Flowing wide-leg silhouettes worn with a fitted kameez.',
    sizes: SHARARA_SIZES,
  },
  saree: {
    label: 'Saree',
    description:
      'Sarees are universally sized — the blouse piece included can be tailored to fit by your local stitcher.',
    sizes: [],
    oneSize: true,
  },
  shawl: {
    label: 'Shawl & Dupatta',
    description:
      'Shawls and dupattas come in one universal size. Standard dimensions: 30" × 100" (76 cm × 254 cm).',
    sizes: [],
    oneSize: true,
  },
};

const GARMENT_OPTIONS = (Object.keys(GARMENTS) as GarmentKey[]).map((k) => ({
  value: k,
  label: GARMENTS[k].label,
}));

function toUnit([min, max]: [number, number], unit: Unit): string {
  if (unit === 'in') return `${min}–${max}"`;
  const cmMin = Math.round(min * 2.54);
  const cmMax = Math.round(max * 2.54);
  return `${cmMin}–${cmMax} cm`;
}

export function SizeGuideClient() {
  const [garment, setGarment] = useState<GarmentKey>('kurta');
  const [unit, setUnit] = useState<Unit>('in');

  const current = GARMENTS[garment];

  return (
    <div className="container-padded py-16">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
        {/* Sidebar — measurement guide + how to measure */}
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <div className="bg-cream border border-border p-6">
            <h3 className="font-display text-xl mb-4 pb-4 border-b border-border flex items-center gap-3">
              <Ruler size={18} className="text-accent" />
              How to Measure
            </h3>
            <ol className="space-y-4 text-sm text-muted leading-relaxed">
              <Measure
                step={1}
                title="Bust"
                description="Wrap the tape across the fullest part of your bust, keeping it level under your arms."
              />
              <Measure
                step={2}
                title="Waist"
                description="Measure at the narrowest part of your natural waist — usually just above the belly button."
              />
              <Measure
                step={3}
                title="Hip"
                description="Stand with feet together. Wrap the tape around the fullest part of your hips."
              />
              <Measure
                step={4}
                title="Length"
                description="For kurtas, measure from the shoulder seam to the desired hem line."
              />
            </ol>
          </div>

          <div className="bg-accent/5 border-l-2 border-accent p-5 text-sm leading-relaxed">
            <div className="flex items-start gap-2.5">
              <Info size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="text-muted">
                <strong className="text-ink">Between two sizes?</strong> We
                recommend sizing up — most pieces are lightly fitted and a touch of room sits beautifully.
              </p>
            </div>
          </div>
        </aside>

        {/* Main — size table + garment switcher */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="min-w-[240px] flex-1">
              <label className="form-label">Garment</label>
              <Select
                options={GARMENT_OPTIONS}
                value={garment}
                onChange={(v) => setGarment(v as GarmentKey)}
                ariaLabel="Garment type"
              />
            </div>

            {/* Unit toggle */}
            <div className="flex border border-border self-end">
              {(['in', 'cm'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={cn(
                    'px-5 py-2.5 text-xs uppercase tracking-widest transition-colors',
                    unit === u ? 'bg-ink text-cream' : 'text-ink hover:bg-cream-200'
                  )}
                >
                  {u === 'in' ? 'Inches' : 'Centimetres'}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={garment}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-cream border border-border"
            >
              <div className="px-6 py-5 border-b border-border">
                <h3 className="font-display text-2xl">{current.label}</h3>
                <p className="text-sm text-muted mt-1">{current.description}</p>
              </div>

              {current.oneSize ? (
                <div className="px-6 py-12 text-center text-muted">
                  <div className="inline-block px-4 py-2 bg-cream-200 text-xs uppercase tracking-widest font-medium text-ink mb-4">
                    One Universal Size
                  </div>
                  <p className="max-w-md mx-auto leading-relaxed">
                    {current.description}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-cream-200 text-[11px] uppercase tracking-widest text-muted">
                      <tr>
                        <th className="text-left p-4 font-semibold">Size</th>
                        <th className="text-left p-4 font-semibold">Bust</th>
                        <th className="text-left p-4 font-semibold">Waist</th>
                        <th className="text-left p-4 font-semibold">Hip</th>
                        {current.sizes[0]?.length && (
                          <th className="text-left p-4 font-semibold">Length</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {current.sizes.map((row) => (
                        <tr key={row.size} className="border-t border-border">
                          <td className="p-4 font-medium">{row.size}</td>
                          <td className="p-4 text-muted">{toUnit(row.bust, unit)}</td>
                          <td className="p-4 text-muted">{toUnit(row.waist, unit)}</td>
                          <td className="p-4 text-muted">{toUnit(row.hip, unit)}</td>
                          {row.length && (
                            <td className="p-4 text-muted">{toUnit(row.length, unit)}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bespoke note */}
          <div className="mt-10 bg-cream-200 p-8 text-center">
            <div className="eyebrow mb-3">Bespoke Service</div>
            <h3 className="font-display text-2xl mb-3">
              Need a <em className="text-accent italic font-normal">Tailored Fit?</em>
            </h3>
            <p className="text-muted text-sm leading-relaxed max-w-xl mx-auto mb-6">
              For pieces that hug like they were made for you alone, our atelier offers bespoke fittings with master tailors in Lahore.
            </p>
            <a href="/contact#contact-form" className="btn btn-secondary text-xs">
              Book a Consultation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Measure({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="w-7 h-7 rounded-full bg-accent text-cream flex items-center justify-center text-xs font-semibold shrink-0">
        {step}
      </div>
      <div>
        <h4 className="font-medium text-ink mb-0.5">{title}</h4>
        <p className="text-xs">{description}</p>
      </div>
    </li>
  );
}
