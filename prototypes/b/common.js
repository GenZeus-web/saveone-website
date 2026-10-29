// ส่วนที่ใช้ร่วมทุกหน้า *-b.html: แถบบน/เมนู · ท้ายหน้า · ธีม · ไอคอน · แท็บสาขา · โหลดข้อมูล content/
// สาขาที่เลือกอยู่ใน URL (?b=korat) — ลิงก์ส่งต่อให้คนอื่นแล้วเปิดสาขาเดิม
const { esc, get, phr } = CMS;
const $ = id => document.getElementById(id);
const PAGES = [
  ['home-b.html', 'หน้าแรก'], ['branches-b.html', 'สาขา'], ['prices-b.html', 'ราคา'],
  ['booking-b.html', 'วิธีจอง'], ['rules-b.html', 'ระเบียบ'], ['contact-b.html', 'ติดต่อ'],
];
// ไอคอนวาดเอง (ชุดเดียวกับ home.html) · ไม่ใช้อีโมจิ
const ICON = {
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  store: '<path d="M3 9l2-5h14l2 5"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/><path d="M3 9a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  parking: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V7h3.5a3 3 0 0 1 0 6H10"/>',
  cam: '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/>',
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
};
const ic = k => `<i class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[k] || ICON.check}</svg></i>`;
const digits = s => String(s || '').replace(/[^\d+]/g, '');
const lineUrl = id => 'https://line.me/R/ti/p/' + encodeURIComponent(String(id || '').trim());
const ext = h => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
const nums = s => String(s || '').match(/\d[\d,]*/g)?.map(n => +n.replace(/,/g, '')) || [];
const filled = v => Array.isArray(v) ? v.some(filled) : typeof v === 'string' && v.trim() !== '';
const photos = (C, k) => (C[k].customer.photos || []).filter(([s]) => s);
const zonesOf = (C, k) => Object.entries(C[k].vendor.zones).filter(([, Z]) => Z.rows.some(r => nums(r.online).length));
const here = location.pathname.split('/').pop() || 'home-b.html';
// สาขาที่ใส่ข้อมูลแล้ว (มีเบอร์หรือมีราคา) · ยังไม่ใส่ = โชว์ชื่อ + "ยังไม่มีข้อมูล"
const ready = (C, k) => filled(C[k].contact?.phone) || zonesOf(C, k).length > 0;
const waitBox = (C, k, what = '') => `<div class="empty"><b style="color:var(--head)">สาขา${esc(C[k].name)}</b> · ยังไม่มีข้อมูล${what} · เร็วๆ นี้</div>`;

// ตอนนี้ตลาดเปิดไหม (เวลาเครื่อง เทียบ "16:00–23:00")
function openStatus(hours) {
  const [o, c] = hours.split('–').map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); });
  const d = new Date(), n = d.getHours() * 60 + d.getMinutes(), open = n >= o && n < c, m = ((o - n) + 1440) % 1440;
  return { open, text: open ? `ตอนนี้เปิดอยู่ · ถึง ${hours.split('–')[1]}` : `เปิดอีก ${m >= 60 ? Math.floor(m / 60) + ' ชม. ' : ''}${m % 60 ? (m % 60) + ' นาที' : ''}` };
}

// การ์ดลิงก์ด่วน (ลูกค้า/ผู้ค้า): ลิงก์มาจาก contact/links ของสาขา ถ้าไม่มีใช้ของส่วนกลาง · ยังไม่มีลิงก์ = จาง "รอลิงก์"
function quickCards(C, k, list) {
  const val = (kind, key) => get(C, `${k}.${kind}.${key}`) || get(C, `${kind}.${key}`) || '';
  const href = q => q.tel ? (val('contact', q.tel) && 'tel:' + digits(val('contact', q.tel))) : q.line ? (val('contact', q.line) && lineUrl(val('contact', q.line))) : q.link ? val('links', q.link) : q.href || '';
  return `<div class="quick">${list.filter(q => q.title).map(q => { const h = href(q);
    return `<a class="q rv${q.main ? ' main' : ''}${h ? '' : ' off'}" href="${esc(h || '#')}"${ext(h)}>${ic(q.ic)}<div><b>${esc(q.title)}</b><small>${phr(q.sub)}${h ? '' : ' · รอลิงก์'}</small></div><span class="arr">${ic(ext(h) ? 'arrow' : 'next')}</span></a>`; }).join('')}</div>`;
}

// หัวหน้าของหน้าย่อย
const pageHead = (kick, icon, title, lead = '') => `<section class="phead"><div class="wrap">
  <span class="kick">${ic(icon)} ${esc(kick)}</span><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;

// แท็บสาขา = ลิงก์ ?b=… (เก็บพารามิเตอร์อื่นไว้)
function branchTabs(C, cur) {
  return `<nav class="tabs" aria-label="เลือกสาขา">${C.keys.map(k => {
    const u = new URLSearchParams(location.search); u.set('b', k);
    return `<a href="?${u}"${k === cur ? ' class="on" aria-current="true"' : ''}>${esc(C[k].name)}</a>`; }).join('')}</nav>`;
}
const pickBranch = C => { const b = new URLSearchParams(location.search).get('b'); return C.keys.includes(b) ? b : C.keys[0]; };

function header() {
  const top = document.createElement('header');
  top.className = 'top';
  top.innerHTML = `<div class="wrap bar">
    <a class="brand" data-wm href="home-b.html" aria-label="ตลาดเซฟวัน GO หน้าแรก"></a>
    <nav aria-label="เมนูหลัก">${PAGES.map(([h, t]) => `<a href="${h}"${h === here ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <button class="theme" id="themeBtn" title="สลับธีมสว่าง/มืด" aria-label="สลับธีมสว่าง/มืด">
      <i class="i sun"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></i>
      <i class="i moon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></i>
    </button>
    <a class="btn pri sm" href="booking-b.html">จองล็อก</a></div>`;
  document.body.prepend(top);
  $('themeBtn').onclick = () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch {}
  };
}

function footer(C) {
  const f = document.createElement('footer');
  f.innerHTML = `<div class="wrap"><span class="brand" data-wm></span>
    <nav aria-label="เมนูท้ายหน้า">${PAGES.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</nav>
    <p class="fine">${esc(C.contact.company)} · ${phr(C.contact.address)}<br>${phr(C.contact.footnote)}</p></div>`;
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

// เริ่มหน้า: render(C, สาขา) คืน HTML ของ <main> · after(C, สาขา) ผูกปุ่มหลังวาด (ถ้ามี)
function page(render, after) {
  header();
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
