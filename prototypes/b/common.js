// ส่วนที่ใช้ร่วมทุกหน้า *-b.html: แถบบน/เมนู · ท้ายหน้า · ธีม · ไอคอน · แท็บสาขา · โหลดข้อมูล content/
// สาขาที่เลือกอยู่ใน URL (?b=korat) — ลิงก์ส่งต่อให้คนอื่นแล้วเปิดสาขาเดิม
const { esc, get, phr } = CMS;
const $ = id => document.getElementById(id);
const PAGES = [
  ['home-b.html', 'หน้าแรก'], ['branches-b.html', 'สาขา'], ['prices-b.html', 'ราคา'],
  ['booking-b.html', 'วิธีจอง'], ['rules-b.html', 'ระเบียบ'], ['faq-b.html', 'คำถามที่พบบ่อย'], ['contact-b.html', 'ติดต่อ'],
];
// ไอคอนวาดเอง (ชุดเดียวกับ home.html) · ไม่ใช้อีโมจิ
const ICON = {
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  store: '<path d="M3 9l2-5h14l2 5"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/><path d="M3 9a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  parking: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V7h3.5a3 3 0 0 1 0 6H10"/>',
  cam: '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/>',
  fb: '<path d="M16 3h-2.5A4.5 4.5 0 0 0 9 7.5V10H6v4h3v7h4v-7h3l1-4h-4V7.5A1 1 0 0 1 14 6.5h2z"/>',
  chat: '<path d="M4 5h16v11H10l-6 4z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  food: '<path d="M4 20L20 4"/><circle cx="9" cy="15" r="2.4"/><circle cx="12.5" cy="11.5" r="2.4"/><circle cx="16" cy="8" r="2.4"/>',
  car: '<path d="M3 16v-4l2.5-5h13l2.5 5v4z"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  leave: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  rain: '<path d="M7 14a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.3 3.3 0 0 1 17 14z"/><path d="M8 17.5l-1 3M12 17.5l-1 3M16 17.5l-1 3"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  size: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  online: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  walk: '<path d="M4 21V5l8-2v18"/><path d="M12 9h8v12"/><path d="M3 21h18"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  shirt: '<path d="M8 3L3 6l2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
  tag: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  smoke: '<path d="M8 21c-2-3 2-5 0-8s2-5 0-8M15 21c-2-3 2-5 0-8s2-5 0-8"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  area: '<path d="M4 4h16v16H4z" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="2"/>',
  arrow: '<path d="M7 17L17 7M9 7h8v8"/>',
  next: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
};
// โลโก้แพลตฟอร์มของจริง (ทรงจาก Simple Icons · CC0) — ทึบ ไม่ใช่เส้น · สีตามปุ่ม (เจ้าของ 31 ต.ค. 69)
const BRAND = {
  line: '<path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>',
  fb: '<path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>',
};
const ic = k => BRAND[k] ? `<i class="i brand"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${BRAND[k]}</svg></i>`
  : `<i class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[k] || ICON.check}</svg></i>`;
const digits = s => String(s || '').replace(/[^\d+]/g, '');
const lineUrl = id => 'https://line.me/R/ti/p/' + encodeURIComponent(String(id || '').trim());
const ext = h => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
const nums = s => String(s || '').match(/\d[\d,]*/g)?.map(n => +n.replace(/,/g, '')) || [];
const filled = v => Array.isArray(v) ? v.some(filled) : typeof v === 'string' && v.trim() !== '';
// "ขายพรุ่งนี้ / ขายวันนี้" ในเวลาจอง → ป้ายสี (เจ้าของ: ต้องบอกชัด อย่าให้เดา)
const dayTag = s => esc(s).replace(/ขาย(พรุ่งนี้|วันนี้)/g, (m, d) => `<span class="sell${d === 'วันนี้' ? ' td' : ''}">${m}</span>`);
const photos = (C, k) => (C[k].customer.photos || []).filter(([s]) => s);
const zonesOf = (C, k) => Object.entries(C[k].vendor.zones).filter(([, Z]) => Z.rows.some(r => nums(r.online).length));
// Cloudflare Pages ตัด .html ออกจาก URL (/prices-b) → เติมกลับก่อนเทียบกับลิงก์เมนู
const here = (location.pathname.split('/').pop() || 'home-b').replace(/\.html$/, '') + '.html';
// สาขาใส่ข้อมูลแล้วหรือยัง แยก 2 ส่วน (บางนา: มีกฎ/ราคาแล้ว แต่ยังไม่มีที่อยู่/เบอร์) · ยังไม่ใส่ = โชว์ชื่อ + "ยังไม่มีข้อมูล"
const hasInfo = (C, k) => filled(C[k].contact?.phone);            // ที่อยู่ เบอร์ LINE → หน้าแรก สาขา ติดต่อ
const hasVendor = (C, k) => zonesOf(C, k).length > 0;            // ราคา กฎ วิธีจอง → หน้าผู้ค้า
const waitBox = (C, k, what = '') => `<div class="empty"><b style="color:var(--head)">สาขา${esc(C[k].name)}</b> · ยังไม่มีข้อมูล${what} · เร็วๆ นี้</div>`;


// การ์ดลิงก์ด่วน (ลูกค้า/ผู้ค้า): ลิงก์มาจาก contact/links ของสาขา ถ้าไม่มีใช้ของส่วนกลาง · ยังไม่มีลิงก์ = จาง "รอลิงก์"
function quickHref(C, k, q) {
  const val = (kind, key) => get(C, `${k}.${kind}.${key}`) || get(C, `${kind}.${key}`) || '';
  return q.tel ? (val('contact', q.tel) && 'tel:' + digits(val('contact', q.tel))) : q.line ? (val('contact', q.line) && lineUrl(val('contact', q.line))) : q.link ? val('links', q.link) : q.href || '';
}
function quickCards(C, k, list) {
  return `<div class="quick">${list.filter(q => q.title).map(q => { const h = quickHref(C, k, q);
    return `<a class="q rv${q.main ? ' main' : ''}${h ? '' : ' off'}" href="${esc(h || '#')}"${ext(h)}>${ic(q.ic)}<div><b>${esc(q.title)}</b><small>${phr(q.sub)}${h ? '' : ' · รอลิงก์'}</small></div><span class="arr">${ic(ext(h) ? 'arrow' : 'next')}</span></a>`; }).join('')}</div>`;
}

// หัวหน้าของหน้าย่อย
const pageHead = (kick, icon, title, lead = '') => `<section class="phead"><div class="wrap">
  <span class="kick">${ic(icon)} ${esc(kick)}</span><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;

// ดรอปดาวน์เลือกสาขา (เจ้าของ 31 ต.ค. 69 แทนแท็บเดิม) = ลิงก์ ?b=… (เก็บพารามิเตอร์อื่นไว้) · จัดกลุ่มตามบริษัท · บอกสถานะเปิด/ปิดตอนนี้
// all = มีตัวเลือก "ทุกสาขา" (หน้าสาขา) · cur ว่าง = กำลังดูทุกสาขา
function branchTabs(C, cur, all = false) {
  const href = k => { const u = new URLSearchParams(location.search); k ? u.set('b', k) : u.delete('b'); return `?${u}`.replace(/\?$/, location.pathname.split('/').pop() || './'); };
  const B = C.story?.brand || {}, co = k => /market/i.test(B[k] || '') ? 'Saveone Market' : 'เซฟวัน โก';
  const st = k => { const h = C[k].facts?.find(f => f[0] === 'food')?.[2]; if (!h || !h.includes('–')) return '';
    const o = openStatus(h); return `<span class="bst${o.open ? ' open' : ''}"><i></i>${o.open ? 'เปิดอยู่' : esc(o.text)}</span>`; };
  const item = k => `<a href="${href(k)}"${k === cur ? ' class="on" aria-current="true"' : ''}>${ic('pin')}<span><b>${esc(C[k].name)}</b>${st(k)}</span>${k === cur ? '<em>✓</em>' : ''}</a>`;
  const groups = [...new Set(C.keys.map(co))].map(g => `<p class="bg">${g}</p>${C.keys.filter(k => co(k) === g).map(item).join('')}`).join('');
  return `<details class="bpick"><summary aria-label="เลือกสาขา"><small>สาขา</small><b>${cur ? esc(C[cur].name) : 'ทุกสาขา'}</b><span class="chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></summary>
    <div class="bmenu">${all ? `<a href="${href('')}"${cur ? '' : ' class="on" aria-current="true"'}>${ic('map')}<span><b>ทุกสาขา</b><span class="bst">${C.keys.length} สาขา</span></span>${cur ? '' : '<em>✓</em>'}</a>` : ''}${groups}</div></details>`;
}
// ปิดดรอปดาวน์เมื่อแตะข้างนอก / กด Esc
addEventListener('click', e => document.querySelectorAll('details.bpick[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }));
addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('details.bpick[open]').forEach(d => { d.open = false; d.querySelector('summary').focus(); }); });
// ── "อยู่ตรงไหน?" = เปิดผัง 3D ของสาขานั้น บินไปที่โซน (เจ้าของ 31 ต.ค. 69: คนดูงงว่าโซนอยู่ตรงไหน) ──
// MAP_READY = สาขาที่ผังเป็นของจริงแล้ว · บางนายังเป็นผังสมมติ → ไม่โชว์ปุ่ม (ไม่ชี้ผิดที่)
const MAP_READY = ['sg', 'korat'];
const whereBtn = (k, z) => MAP_READY.includes(k) && ['food', 'boot', 'court'].includes(z)
  ? `<button type="button" class="where" data-where="${k}:${z}">${ic('map')} อยู่ตรงไหน?</button>` : '';
addEventListener('click', e => {
  const t = e.target.closest('[data-where]'); if (!t) return;
  const [b, z] = t.dataset.where.split(':'), focus = { b, kind: z === 'court' ? 'food' : z, ...(z === 'court' ? { id: 'food-in' } : {}) };
  let d = document.getElementById('mapDlg');
  if (!d) { d = document.createElement('dialog'); d.id = 'mapDlg'; d.className = 'mapdlg';
    d.innerHTML = `<div class="mh"><b></b><button type="button" class="mx" aria-label="ปิดผัง">✕</button></div><div class="mf"></div>`;
    d.querySelector('.mx').onclick = () => d.close(); d.onclick = ev => { if (ev.target === d) d.close(); };
    d.addEventListener('close', () => { d.querySelector('.mf').innerHTML = ''; clearInterval(d._t); });
    document.body.append(d); }
  const zt = t.closest('.zt'); d.querySelector('b').textContent = `${zt ? [...zt.childNodes].filter(x => x !== t).map(x => x.textContent).join('').trim() : 'โซน'} อยู่ตรงนี้ · ผังตลาด 3D`;
  const f = document.createElement('iframe'); f.title = 'ผังตลาด 3D'; f.src = 'branch-flip.html?v=20261031c';
  // ผังยังโหลดไม่เสร็จจะไม่รับ → ส่งซ้ำจนผังตอบว่าพลิกมาถึงสาขานั้น แล้วส่ง focus
  f.onload = () => { let n = 0; clearInterval(d._t);
    d._t = setInterval(() => { if (++n > 50) return clearInterval(d._t); try { f.contentWindow.postMessage({ pinGroup: 'ven', goBranch: b }, location.origin); } catch {} }, 600); };
  addEventListener('message', function on(ev) { if (ev.source !== f.contentWindow || ev.data?.branch !== b) return;
    clearInterval(d._t); removeEventListener('message', on); f.contentWindow.postMessage({ focus }, location.origin); });
  d.querySelector('.mf').append(f); d.showModal();
});
const pickBranch = C => { const b = new URLSearchParams(location.search).get('b'); return C.keys.includes(b) ? b : C.keys[0]; };

// เมนู (เจ้าของเลือกแบบ 3 · 31 ต.ค. 69): จอคอม = เรียงครบแถวเดียว · จอแคบ/มือถือ = ปุ่ม ☰ กางเป็นปุ่มใหญ่ 2 คอลัมน์มีไอคอน
const NAV_IC = { 'home-b.html': 'home', 'branches-b.html': 'store', 'prices-b.html': 'tag', 'booking-b.html': 'cal', 'rules-b.html': 'shield', 'faq-b.html': 'search', 'contact-b.html': 'phone' };
const navHTML = () => PAGES.map(([h, t]) => `<a href="${h}"${h === here ? ' class="on" aria-current="page"' : ''}>${ic(NAV_IC[h])}<span>${t}</span></a>`).join('');
function header() {
  const top = document.createElement('header');
  top.className = 'top nav3';
  top.innerHTML = `<div class="wrap bar">
    <a class="brand" data-wm href="home-b.html" aria-label="ตลาดเซฟวัน GO หน้าแรก"></a>
    <nav id="mainNav" aria-label="เมนูหลัก">${navHTML()}</nav>
    <button class="burger" type="button" aria-label="เมนู" aria-expanded="false" aria-controls="mainNav"><b></b><b></b><b></b></button>
    <button class="theme" id="themeBtn" title="สลับธีมสว่าง/มืด" aria-label="สลับธีมสว่าง/มืด">
      <i class="i sun"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></i>
      <i class="i moon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></i>
    </button>
    <a class="btn pri sm" href="booking-b.html">จองล็อก</a></div>`;
  document.body.prepend(top);
  $('themeBtn').onclick = toggleTheme;
  // ☰ เปิด-ปิดแผงเมนู · กดนอกแถบบน / Esc = ปิด
  const bg = top.querySelector('.burger');
  const shut = () => { top.classList.remove('open'); bg.setAttribute('aria-expanded', 'false'); };
  bg.onclick = () => { const o = top.classList.toggle('open'); bg.setAttribute('aria-expanded', o); };
  document.addEventListener('click', e => { if (!top.contains(e.target)) shut(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
}
function toggleTheme() {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch {}
}

function footer(C) {
  const f = document.createElement('footer'); f.innerHTML = footHTML(C);   // b/parts.js (แบบ 2 ใช้ชุดเดียวกัน)
  document.body.append(f);
}

let WM = null;
async function fillWordmarks() {
  try { WM = WM || await (await fetch('img/wordmark.svg')).text(); } catch { return; }
  document.querySelectorAll('[data-wm]').forEach(el => { if (!el.firstChild) el.innerHTML = WM; });
}
let io;
function reveal() {
  io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));
}

// เริ่มหน้า: render(C, สาขา) คืน HTML ของ <main> · after(C, สาขา) ผูกปุ่มหลังวาด (ถ้ามี) · bar: false = ไม่มีแถบเมนูบน (หน้า A+D)
function page(render, after, { bar = true } = {}) {
  if (bar) header();
  fillWordmarks();
  CMS.load().then(async C => {
    // siteKeys = ลำดับสาขาบนเว็บนี้ รวมสาขาที่ยังไม่อยู่ใน branchKeys (เช่น บางนา) → โหลดไฟล์ของสาขานั้นเพิ่มเอง
    C.keys = C.siteKeys || C.branchKeys;
    await Promise.all(C.keys.filter(k => !C[k]).map(async k => { C[k] = await (await fetch(`content/${k}/data.json`, { cache: 'no-store' })).json(); }));
    const k = pickBranch(C);
    $('main').innerHTML = render(C, k);
    footer(C);
    after?.(C, k);
    fillWordmarks(); reveal();
  }).catch(e => { $('main').innerHTML = `<p class="wrap sec">โหลดข้อมูลไม่ได้: ${esc(e.message)}</p>`; });
}
