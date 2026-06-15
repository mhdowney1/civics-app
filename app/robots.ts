import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/study', '/test', '/progress', '/billing', '/api/'],
    },
    sitemap: 'https://civicsstudy.com/sitemap.xml',
  }
}
