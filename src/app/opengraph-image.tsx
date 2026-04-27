import { ImageResponse } from 'next/og';

// Open Graph card — what Facebook, LinkedIn, Slack, Discord, iMessage, and
// most link-unfurlers render when someone shares a Weavy URL. Generated at
// request time so the look stays in sync with the brand without shipping a
// binary asset.

export const alt = 'Weavy — Visual AI Workflow Builder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          justifyContent: 'space-between',
          background:
            'linear-gradient(135deg, #0a0a0f 0%, #1e1b4b 55%, #0a0a0f 100%)',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 38,
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 12px 40px rgba(124,58,237,0.5)',
            }}
          >
            W
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Weavy
          </div>
        </div>

        {/* Headline + subhead — every parent <div> with more than one child
            needs explicit display:flex per Satori (the OG renderer). */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              backgroundImage:
                'linear-gradient(95deg, #f8fafc 0%, #a78bfa 55%, #22d3ee 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            <span>Drag nodes. Connect them.</span>
            <span>Run with AI.</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              lineHeight: 1.4,
              color: '#94a3b8',
              maxWidth: 940,
            }}
          >
            A visual canvas for AI workflows — text, images, and Gemini or
            OpenAI in a single graph.
          </div>
        </div>

        {/* Footer chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {['Nano Banana 2', 'Imagen 4', 'GPT Image 1', 'BYOK'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                fontSize: 18,
                fontWeight: 600,
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
