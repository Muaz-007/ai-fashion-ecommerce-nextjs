import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #1a1714 0%, #2a2420 100%)',
          color: '#c19a6b',
          fontSize: 110,
          fontWeight: 500,
          fontFamily: 'serif',
          fontStyle: 'italic',
          letterSpacing: '-2px',
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
