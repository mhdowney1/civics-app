import type { MetadataRoute } from 'next'
import { QUESTIONS } from '@/lib/questions'

export default function sitemap(): MetadataRoute.Sitemap {
  const questionPages: MetadataRoute.Sitemap = QUESTIONS.map((q) => ({
    url: `https://civicsstudy.com/civics-questions/${q.id}`,
    lastModified: new Date('2026-01-01'),
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: 'https://civicsstudy.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://civicsstudy.com/civics-questions',
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.9,
    },
    {
      url: 'https://civicsstudy.com/sign-up',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://civicsstudy.com/sign-in',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...questionPages,
  ]
}
