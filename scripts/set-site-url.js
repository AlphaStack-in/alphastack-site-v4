#!/usr/bin/env node
// Rewrites every hardcoded canonical/OG/Twitter URL across all HTML pages,
// plus robots.txt and sitemap.xml, to the single SITE_URL defined in
// site.config.js (or passed as a CLI arg).
//
// Usage:
//   node scripts/set-site-url.js                      # uses site.config.js
//   node scripts/set-site-url.js https://alphastack.in # overrides it for this run

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const { SITE_URL: configuredUrl } = require(path.join(root, 'site.config.js'));
const SITE_URL = (process.argv[2] || configuredUrl).replace(/\/$/, '');

// Matches any previously-hardcoded base URL used in canonical/OG/Twitter tags,
// e.g. https://alphastack.in or https://alphastack-site.vercel.app
const OLD_URL_PATTERN = /https:\/\/[a-z0-9.-]+\.(?:in|vercel\.app)/gi;

const targetFiles = fs
  .readdirSync(root)
  .filter((f) => f.endsWith('.html') || f === 'robots.txt' || f === 'sitemap.xml');

let totalReplacements = 0;
for (const file of targetFiles) {
  const filePath = path.join(root, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(OLD_URL_PATTERN);
  if (!matches) continue;
  const updated = content.replace(OLD_URL_PATTERN, SITE_URL);
  fs.writeFileSync(filePath, updated);
  totalReplacements += matches.length;
  console.log(`${file}: ${matches.length} replacement(s)`);
}

console.log(`\nDone. ${totalReplacements} total replacement(s) -> ${SITE_URL}`);
