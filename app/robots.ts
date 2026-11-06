import type { MetadataRoute } from 'next'

// Signed-in app routes and APIs are private. Everything else is public.
const PRIVATE_PATHS = [
  '/dashboard',
  '/study',
  '/test',
  '/progress',
  '/billing',
  '/settings',
  '/api/',
]

// AI search and answer-engine crawlers. Listed explicitly so they are
// clearly welcome even if a host or CDN default ever changes.
const AI_CRAWLERS = [
  'OAI-SearchBot', // ChatGPT search
  'ChatGPT-User', // ChatGPT fetching a page for a user
  'GPTBot', // OpenAI training
  'Claude-SearchBot', // Claude search
  'Claude-User', // Claude fetching a page for a user
  'ClaudeBot', // Anthropic training
  'PerplexityBot', // Perplexity search
  'Perplexity-User', // Perplexity fetching a page for a user
  'Google-Extended', // Gemini / Google AI
  'Applebot-Extended', // Apple Intelligence
  'Bingbot', // Bing index, which also feeds ChatGPT and Copilot
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: 'https://civicsstudy.com/sitemap.xml',
    host: 'https://civicsstudy.com',
  }
}
