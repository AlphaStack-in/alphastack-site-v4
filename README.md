# AlphaStack

Marketing site for AlphaStack — the parent company behind **SignalFlow** (a white-label trading signal platform) and **Trade Boost** (a live options signal engine). Static HTML/CSS/JS, deployed on Vercel.

## Project structure

```
index.html          Homepage
signalflow.html      SignalFlow product page
tradeboost.html      Trade Boost product page
about.html           About AlphaStack
contact.html         Contact form
disclaimer.html      Risk & regulatory disclaimer
privacy.html         Privacy policy
terms.html           Terms of service
style.css            Shared styles
script.js            Shared interactions (nav, reveals, accordion, contact form, cursor blob)
api/contact.js       Serverless function backing the contact form
images/              Product screenshots (compressed; originals/ kept locally, gitignored)
logos/               SignalFlow / Trade Boost product logos
favicon.svg, robots.txt, sitemap.xml
```

No build step — this is plain static HTML/CSS/JS plus one Vercel serverless function for the contact form.

## Local development

Any static file server works. For example:

```bash
python -m http.server 8791
# then open http://localhost:8791
```

To also test the `/api/contact` serverless function locally, use the Vercel CLI instead:

```bash
npm i -g vercel   # if not already installed
vercel dev
```

## Deployment

Deployed on Vercel. Once this repo is connected to the Vercel project (see below), every push to `main` deploys to production automatically, and every pull request gets its own preview URL.

To deploy manually from the CLI:

```bash
vercel --prod
```

## Environment variables

Set these in the Vercel dashboard (Project Settings → Environment Variables) — they are **not** committed to this repo:

| Variable | Required for | Notes |
|---|---|---|
| `RESEND_API_KEY` | Contact form email delivery | From [resend.com](https://resend.com). Free tier is sufficient. To send from your own domain (e.g. `hello@alphastack.in`) instead of a Resend testing address, verify that domain in the Resend dashboard first. |
| `CONTACT_TO_EMAIL` | Contact form email delivery | The inbox that should receive enquiry notifications, e.g. `hello@alphastack.in`. |

## Legal pages

`disclaimer.html`, `privacy.html`, and `terms.html` are solid drafts but have **not** been reviewed by a lawyer — get them reviewed before relying on them in a real dispute or customer contract.
