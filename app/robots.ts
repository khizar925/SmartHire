import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://smarthire.website'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/onboarding', '/sign-in', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
