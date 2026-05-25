import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Maison Aurelle — Luxury Fashion, Intelligently Curated';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #1a1714 0%, #2a2420 50%, #1a1714 100%)',
          position: 'relative',
          padding: '80px',
        }}
      >
        {/* Decorative diagonal accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background:
              'linear-gradient(135deg, transparent 40%, rgba(193, 154, 107, 0.08) 100%)',
            display: 'flex',
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 22,
            color: '#c19a6b',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          Maison · Atelier · est. 2026
        </div>

        {/* Brand mark */}
        <div
          style={{
            fontSize: 140,
            fontWeight: 300,
            color: '#f5f1e8',
            letterSpacing: '-2px',
            fontFamily: 'serif',
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
          }}
        >
          <span>Maison</span>
          <span
            style={{
              fontStyle: 'italic',
              color: '#c19a6b',
              fontWeight: 400,
            }}
          >
            Aurelle
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: '#a8a29e',
            marginTop: 36,
            textAlign: 'center',
            maxWidth: 900,
            display: 'flex',
            lineHeight: 1.3,
          }}
        >
          Luxury Fashion, Intelligently Curated
        </div>

        {/* Bottom rule + meta */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 80,
            right: 80,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 30,
            borderTop: '1px solid rgba(245, 241, 232, 0.2)',
            color: '#a8a29e',
            fontSize: 18,
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>AI · Atelier · Couture</div>
          <div style={{ display: 'flex' }}>Crafted in Lahore</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
