import { ImageResponse } from 'next/og';

// Apple touch icon — what shows up when an iOS user adds Weavy to their
// home screen. Generated dynamically so we don't need to ship a binary PNG.

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
          background: '#7c3aed',
          fontSize: 110,
          fontWeight: 800,
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-0.04em',
        }}
      >
        W
      </div>
    ),
    { ...size },
  );
}
