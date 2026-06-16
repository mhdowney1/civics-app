import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const score = parseInt(searchParams.get('score') ?? '0', 10)
  const total = parseInt(searchParams.get('total') ?? '20', 10)
  const passed = score >= Math.ceil(total * 0.6)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f0f0f',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '64px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4ade80',
            }}
          />
          <span
            style={{
              color: '#4ade80',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            civicsstudy.com
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span
            style={{ color: '#666', fontSize: '18px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            US Civics Mock Test
          </span>
          <div
            style={{
              color: '#ffffff',
              fontSize: '96px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {score} / {total}
          </div>
          <div
            style={{
              color: passed ? '#4ade80' : '#f87171',
              fontSize: '32px',
              fontWeight: 700,
            }}
          >
            {passed ? '✓ Pass' : '✗ Fail'}
          </div>
        </div>

        <div style={{ color: '#888', fontSize: '20px' }}>
          Think you can beat this? Practice free at civicsstudy.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
