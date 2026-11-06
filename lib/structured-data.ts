import { SITE_TAGLINE } from './guides'

export const SITE_URL = 'https://civicsstudy.com'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Civics Study',
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  description: SITE_TAGLINE,
  founder: {
    '@type': 'Person',
    name: 'Michael Downey',
    url: 'https://vampcreatives.com',
  },
}

export function jsonLdScript(data: unknown): { __html: string } {
  // Escape "<" so content can never close the surrounding script tag.
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') }
}
