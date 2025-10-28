import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://sipzy.coffee';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/profile/edit',
          '/profile/submissions',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
