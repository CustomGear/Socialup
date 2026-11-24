// Records proposal opens: one event when the page opens, one when the reader leaves.
import { getStore } from '@netlify/blobs';
const BOT = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|headless/i;
const clean = (v, n = 60) => String(v ?? '').replace(/[^\w .:/@-]/g, '').slice(0, n);
export default async (req, context) => {
  if (req.method !== 'POST') return new Response('', { status: 405 });
  const ua = req.headers.get('user-agent') || '';
  if (BOT.test(ua)) return new Response('', { status: 204 });
  let b = {}; try { b = JSON.parse(await req.text()); } catch {}
  const p = clean(b.p, 40); if (!p) return new Response('', { status: 400 });
  const ev = {
    t: new Date().toISOString(), type: b.type === 'leave' ? 'leave' : 'open', p, r: clean(b.r) || 'direct', sid: clean(b.sid, 24),
    secs: Math.min(36000, Math.max(0, Number(b.secs) || 0)), scroll: Math.min(100, Math.max(0, Number(b.scroll) || 0)), pricing: !!b.pricing,
    city: clean(context.geo?.city), country: clean(context.geo?.country?.code, 4),
    device: /iphone|ipad/i.test(ua) ? 'iPhone/iPad' : /android/i.test(ua) ? 'Android' : /mac/i.test(ua) ? 'Mac' : /windows/i.test(ua) ? 'Windows' : 'Other',
    app: /instagram/i.test(ua) ? 'Instagram' : /fban|fbav/i.test(ua) ? 'Facebook' : '',
  };
  await getStore('proposal-opens').setJSON(`${p}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ev);
  return new Response('', { status: 204 });
};
export const config = { path: '/api/track' };
