import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1714',
          color: '#c19a6b',
          fontSize: 22,
          fontWeight: 600,
          fontFamily: 'serif',
          fontStyle: 'italic',
          letterSpacing: '-1px',
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
