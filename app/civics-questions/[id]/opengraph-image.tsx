import { ImageResponse } from 'next/og'
import { getQuestionById, QUESTIONS } from '@/lib/questions'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams(): Array<{ id: string }> {
  return QUESTIONS.map((q) => ({ id: String(q.id) }))
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const question = getQuestionById(parseInt(id, 10))

  const questionText = question
    ? question.question.length > 80
      ? question.question.slice(0, 77) + '…'
      : question.question
    : 'USCIS Civics Question'

  const categoryText = question?.category ?? ''
  const questionNum = question?.id ?? ''

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span
            style={{
              color: '#666',
              fontSize: '16px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Question #{questionNum} · {categoryText}
          </span>
          <div
            style={{
              color: '#ffffff',
              fontSize: '52px',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {questionText}
          </div>
        </div>

        <div
          style={{
            color: '#888',
            fontSize: '20px',
          }}
        >
          128 official USCIS civics questions · Free to practice
        </div>
      </div>
    ),
    { ...size },
  )
}
