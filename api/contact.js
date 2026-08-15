// Vercel serverless function backing the contact form.
// Validates the submission server-side, rejects honeypot hits, and emails the enquiry via Resend.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_INTERESTS = new Set(['SignalFlow', 'Trade Boost', 'Custom project']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  const { name, company, email, interest, message, website } = body;

  // Honeypot: a hidden field real users never fill in. Any value here means a bot.
  if (website) {
    return res.status(200).json({ ok: true });
  }

  const errors = [];
  if (!name || typeof name !== 'string' || !name.trim()) errors.push('Name is required.');
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) errors.push('A valid email is required.');
  if (interest && !ALLOWED_INTERESTS.has(interest)) errors.push('Invalid interest value.');
  if (message && typeof message !== 'string') errors.push('Invalid message.');

  if (errors.length) {
    return res.status(400).json({ ok: false, error: errors.join(' ') });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'hello@alphastack.in';

  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.');
    return res.status(500).json({ ok: false, error: 'Email delivery is not configured yet. Please email us directly instead.' });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AlphaStack Website <onboarding@resend.dev>',
        to: [toEmail],
        reply_to: email.trim(),
        subject: `Website enquiry — ${interest || 'General'}`,
        text: [
          `Name: ${name.trim()}`,
          `Company: ${company ? String(company).trim() : '—'}`,
          `Email: ${email.trim()}`,
          `Interested in: ${interest || 'General'}`,
          '',
          message ? String(message).trim() : '(no message)',
        ].join('\n'),
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      console.error('Resend API error:', resendRes.status, detail);
      return res.status(502).json({ ok: false, error: 'Could not send your message right now. Please try again shortly.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact form send failed:', err);
    return res.status(500).json({ ok: false, error: 'Unexpected error sending your message.' });
  }
}

function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return {}; }
}
