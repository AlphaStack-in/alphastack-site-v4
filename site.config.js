// Single source of truth for the site's canonical base URL, used to generate
// <link rel="canonical">, og:url, og:image, and twitter:image across every page.
//
// When a real custom domain is connected, change SITE_URL here and run:
//   node scripts/set-site-url.js
// to rewrite it across all HTML pages in one shot.
module.exports = {
  SITE_URL: 'https://alphastack-site.vercel.app',
};
