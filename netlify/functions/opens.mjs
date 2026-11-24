// Private report of proposal opens: /api/opens?key=...
import { getStore } from '@netlify/blobs';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export default async (req) => {
  const u = new URL(req.url), key = process.env.PROPOSAL_STATS_KEY;
  if (!key || u.searchParams.get('key') !== key) return new Response('Not found', { status: 404 });
  const store = getStore('proposal-opens'), { blobs } = await store.list();
  const evs = (await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })))).filter(Boolean);
  const visits = new Map();
  for (const e of evs) { const k = e.sid || e.t; const v = visits.get(k) || { ...e, secs: 0, scroll: 0, pricing: false }; if (e.type === 'open' && e.t < v.t) v.t = e.t; v.secs = Math.max(v.secs, e.secs || 0); v.scroll = Math.max(v.scroll, e.scroll || 0); v.pricing ||= e.pricing; visits.set(k, v); }
  const rows = [...visits.values()].sort((a, b) => b.t.localeCompare(a.t));
  const fmt = (t) => new Date(t).toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' });
  const dur = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Proposal opens</title>
<style>body{margin:0;background:#0a0908;color:#f5f1ea;font:15px/1.5 system-ui,sans-serif;padding:24px max(16px,env(safe-area-inset-left))}h1{font-size:22px;margin:0 0 4px}p{color:#8f877c;margin:0 0 18px}.w{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:720px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #222}th{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8f877c}.y{color:#c8ff00;font-weight:700}</style>
<h1>Proposal opens</h1><p>${rows.length} visit${rows.length === 1 ? '' : 's'} · times in Toronto time · link previews and bots are not counted</p>
<div class="w"><table><tr><th>When</th><th>Proposal</th><th>Link</th><th>Where</th><th>Device</th><th>Time on page</th><th>Scrolled</th><th>Saw pricing</th></tr>
${rows.map((v) => `<tr><td>${esc(fmt(v.t))}</td><td>${esc(v.p)}</td><td>${esc(v.r)}</td><td>${esc([v.city, v.country].filter(Boolean).join(', ') || '—')}</td><td>${esc(v.device)}${v.app ? ` · ${esc(v.app)}` : ''}</td><td>${v.secs ? dur(v.secs) : '—'}</td><td>${v.scroll}%</td><td class="${v.pricing ? 'y' : ''}">${v.pricing ? 'Yes' : 'No'}</td></tr>`).join('')}
</table></div>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
};
export const config = { path: '/api/opens' };
