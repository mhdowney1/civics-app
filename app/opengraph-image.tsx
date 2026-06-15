import { ImageResponse } from 'next/og'

export const alt = 'US Civics Study — Citizenship Test Prep'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f0f0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#4ade80',
            }}
          />
          <span
            style={{
              color: '#4ade80',
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            civicsstudy.com
          </span>
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: '72px',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: '32px',
          }}
        >
          US Citizenship
          <br />
          Test Prep
        </div>
        <div
          style={{
            color: '#888888',
            fontSize: '28px',
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          128 official questions · Mock tests · Progress tracking
        </div>
      </div>
    ),
    { ...size },
  )
}
