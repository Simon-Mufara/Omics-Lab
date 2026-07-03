/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Resend Email API Route
   POST /api/send-email
   Body: { type, to, data }
   Types: 'welcome' | 'certificate' | 'streak-reminder' | 'mention'
   ═══════════════════════════════════════════════════════════════ */

const RESEND_API_KEY  = process.env.RESEND_API_KEY;
const FROM_EMAIL      = process.env.RESEND_FROM_EMAIL || 'noreply@omicsdatalab.tech';
const APP_URL         = process.env.NEXT_PUBLIC_APP_URL || 'https://omicsdatalab.tech';

const TEMPLATES = {
  welcome: ({ name }) => ({
    subject: `Welcome to OmicsLab, ${name}!`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:2rem;border-radius:12px">
        <div style="text-align:center;margin-bottom:1.5rem">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="1.75" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M2 9c6.667 6 13.333 0 20 6"/>
          </svg>
          <h1 style="color:#3fb950;margin:.5rem 0 0;font-size:1.4rem">OmicsLab</h1>
        </div>
        <h2 style="font-size:1.2rem;margin-bottom:.75rem">Welcome, ${name}!</h2>
        <p style="color:#8b949e;line-height:1.7">
          Africa's open genomics training platform is ready for you.
          14 interactive wet-lab simulations, 55+ bioinformatics tools, and a community of researchers across 54 countries.
        </p>
        <a href="${APP_URL}" style="display:inline-block;margin-top:1.5rem;background:#3fb950;color:#0d1117;font-weight:700;padding:.6rem 1.4rem;border-radius:8px;text-decoration:none">
          Start Learning →
        </a>
        <hr style="border:none;border-top:1px solid #21262d;margin:2rem 0">
        <p style="font-size:.75rem;color:#484f58">
          You're receiving this because you created an OmicsLab account.
          <a href="${APP_URL}/settings" style="color:#58a6ff">Manage notifications</a>
        </p>
      </div>`,
  }),

  certificate: ({ name, trackName, completedAt, score }) => ({
    subject: `Your OmicsLab Certificate — ${trackName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:2rem;border-radius:12px">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:64px;height:64px;background:rgba(63,185,80,.12);border:2px solid rgba(63,185,80,.4);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto">
            <span style="font-size:1.8rem">🏆</span>
          </div>
        </div>
        <h2 style="text-align:center;font-size:1.3rem">Certificate of Completion</h2>
        <p style="text-align:center;color:#8b949e">This certifies that</p>
        <p style="text-align:center;font-size:1.4rem;font-weight:700;color:#e6edf3">${name}</p>
        <p style="text-align:center;color:#8b949e">has successfully completed</p>
        <p style="text-align:center;font-size:1.1rem;font-weight:600;color:#3fb950">${trackName}</p>
        <p style="text-align:center;color:#8b949e;font-size:.85rem">Score: ${score}/100 &nbsp;·&nbsp; ${new Date(completedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}</p>
        <div style="text-align:center;margin-top:1.5rem">
          <a href="${APP_URL}/#/certification" style="display:inline-block;background:#3fb950;color:#0d1117;font-weight:700;padding:.6rem 1.4rem;border-radius:8px;text-decoration:none">
            View Certificate →
          </a>
        </div>
      </div>`,
  }),

  'streak-reminder': ({ name, streakDays }) => ({
    subject: `${name}, your ${streakDays}-day streak is waiting 🔥`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:2rem;border-radius:12px">
        <h2>Keep your streak alive, ${name}!</h2>
        <p style="color:#8b949e;line-height:1.7">
          You've built a <strong style="color:#f97316">${streakDays}-day learning streak</strong> on OmicsLab.
          Log in today and run a simulation to keep it going.
        </p>
        <a href="${APP_URL}" style="display:inline-block;margin-top:1.5rem;background:#f97316;color:#fff;font-weight:700;padding:.6rem 1.4rem;border-radius:8px;text-decoration:none">
          Continue Learning →
        </a>
      </div>`,
  }),

  mention: ({ recipientName, senderName, channel, preview }) => ({
    subject: `${senderName} mentioned you in #${channel}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:2rem;border-radius:12px">
        <h2 style="font-size:1.1rem">${senderName} mentioned you in <strong>#${channel}</strong></h2>
        <blockquote style="border-left:3px solid #3fb950;padding:.5rem 1rem;margin:1rem 0;color:#8b949e;font-style:italic">${preview}</blockquote>
        <a href="${APP_URL}/#/nexus" style="display:inline-block;background:#58a6ff;color:#0d1117;font-weight:700;padding:.6rem 1.4rem;border-radius:8px;text-decoration:none">
          View in Nexus →
        </a>
      </div>`,
  }),
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!RESEND_API_KEY)       return res.status(503).json({ error: 'Email service not configured' });

  const { type, to, data = {} } = req.body || {};

  if (!type || !to) return res.status(400).json({ error: 'Missing type or to' });

  const template = TEMPLATES[type];
  if (!template)  return res.status(400).json({ error: `Unknown email type: ${type}` });

  const { subject, html } = template(data);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: result.message || 'Resend error' });

    return res.status(200).json({ ok: true, id: result.id });
  } catch (err) {
    console.error('[send-email]', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
