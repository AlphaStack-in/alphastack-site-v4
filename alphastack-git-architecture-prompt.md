# AlphaStack — Git & Architecture Setup Prompt

Context: the static site is already live at https://alphastack-site-v4.vercel.app/ (deployed to Vercel's free tier, likely via drag-and-drop or Vercel CLI without a connected Git repo yet). This prompt closes that gap and adds the minimum real backend the site needs (working contact form) plus production-hygiene basics.

Copy everything below into Claude Code, run from inside your project folder.

---

## PROMPT START

I have a static HTML/CSS/JS site (AlphaStack — a fintech SaaS marketing site) already deployed to Vercel's free tier at https://alphastack-site-v4.vercel.app/, but it is not yet connected to a Git repository — it was deployed directly. I need you to set up proper version control, connect it to Vercel for automatic deployments, and add the minimum backend architecture the site actually needs.

### 1. Git repository setup
- Initialize a Git repo in this project if one doesn't exist (`git init`).
- Create a sensible `.gitignore` for a Node/Vercel project (node_modules, .vercel, .env*, .DS_Store, etc.).
- Create a proper commit history: an initial commit with the current site as-is.
- Write a clear `README.md` covering: what the project is, local dev instructions, deployment process, and environment variables required.
- Guide me through creating a new GitHub repository (I'll do the actual GitHub account step — you tell me the exact `gh` CLI commands or manual steps) and pushing this repo to it.
- Once the GitHub repo exists, connect it to the existing Vercel project (`alphastack-site-v4`) via the Vercel dashboard or `vercel link` + `vercel git connect`, so that:
  - Every push to `main` triggers a production deployment.
  - Every pull request gets its own preview deployment URL automatically.
- Confirm the working setup by walking me through making a trivial change, pushing it, and checking that Vercel picks it up automatically.

### 2. Contact form backend
Right now the contact form just opens the user's email client via a `mailto:` link — no real backend. Replace this with a real, minimal serverless backend using Vercel's free tier:
- Add a Vercel Serverless Function (e.g. `/api/contact.ts` or `.js`, Node runtime) that:
  - Accepts a POST request with name, company, email, interest (SignalFlow / Trade Boost / Custom), and message.
  - Validates required fields server-side (not just client-side) and rejects malformed/empty submissions.
  - Sends an email notification using a free-tier-friendly email API (Resend is a good fit — generous free tier, simple API). Use an environment variable for the API key (`RESEND_API_KEY`), never hardcoded.
  - Returns a clear JSON success/error response.
- Update the frontend contact form's JS to POST to `/api/contact` instead of using `mailto:`, and show a real success/error state in the UI (e.g. a small inline confirmation message, not just an alert).
- Add basic abuse protection: a honeypot field (hidden input bots tend to fill) and simple rate limiting if straightforward on the free tier (e.g. a lightweight in-memory or Vercel KV-based limiter — skip if it adds real complexity, honeypot alone is an acceptable v1).
- Document in the README exactly which environment variables need to be set in the Vercel dashboard (Project Settings → Environment Variables) for this to work, since `.env` files aren't committed.

### 3. Domain & environment hygiene
- Confirm whether I want to keep the default `alphastack-site-v4.vercel.app` URL or add a custom domain later (e.g. `alphastack.in` or similar) — if I have a domain, walk me through adding it in Vercel's dashboard and what DNS records to set at my registrar. If I don't have one yet, skip this and note it as a future step.
- Set up a `vercel.json` (if useful) for:
  - Basic security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
  - Cache-control headers for static assets (CSS/JS/images) so repeat visits load fast on the free tier.

### 4. SEO & discoverability basics
- Add a `robots.txt` allowing indexing, pointing to the sitemap.
- Generate a simple `sitemap.xml` covering all current pages (home, SignalFlow, Trade Boost, About, Contact, Disclaimer).
- Add a shared Open Graph image (or confirm one exists) and correct `<meta property="og:*">` tags per page if not already present, so links shared on LinkedIn/WhatsApp/Slack show a proper preview card.
- Add a `favicon.ico` / `favicon.svg` if one isn't already in place.

### 5. Lightweight analytics
- Add Vercel Analytics (free tier, one-line integration, no cookie banner needed) so I can see real traffic once this is shared with prospects. Skip anything that requires a paid plan or a consent banner for a v1.

### 6. Final check
- Once everything above is done, give me a short checklist of exactly what I need to do manually (e.g. "add RESEND_API_KEY in Vercel dashboard", "verify sender domain in Resend", "point DNS if using a custom domain") versus what's already fully wired up in code.

## PROMPT END

---

### Notes before you run this
- **Resend needs a verified sender.** On the free tier you can send from a Resend-provided testing address immediately, but to send convincingly as `hello@alphastack.in` (or whatever address you use), you'll need to verify that domain in Resend — worth doing once you've settled on a real domain rather than the `.vercel.app` one.
- **GitHub account/repo creation is a manual step.** I can't create the GitHub repo for you from here — Claude Code will give you the exact commands, but you'll run the `gh repo create` (or use the GitHub website) and authenticate yourself.
- **Vercel free tier is fine for all of this** — serverless functions, preview deployments, and Vercel Analytics are all included at no cost for your usage level.
