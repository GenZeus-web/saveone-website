// ชิ้นส่วนที่เว็บแบบ 1 (หลายหน้า) และแบบ 2 (ผัง 3D) ใช้ร่วมกัน → หน้าตาเหมือนกันทั้งสองแบบ (เจ้าของ 31 ต.ค. 69)
// ต้องโหลดหลัง content/cms.js · ใช้ ic() ของหน้านั้น (ประกาศทีหลังได้ เรียกตอนวาด)

// ชื่อฤดูราคา (เจ้าของสั่งให้มีคำ High/Low Season) · key ตาม vendor.seasons
const SEASON = { high: 'High Season', low: 'Low Season' };

// ตารางราคาเส้นทึบ: วัน | จองออนไลน์ | Walk-in · แถวฤดู (ฤดูปัจจุบันขึ้นก่อน + "ช่วงนี้") · แถววันนี้พื้นเขียว
// cell(r, i, key) = HTML ของช่อง (โหมดแก้ส่งตัวแก้ได้มา) · all = แสดงแถวว่างด้วย (โหมดแก้)
function priceTable(rows, V, { cell, all = false } = {}) {
  const now = CMS.seasonNow(V.seasons), dow = CMS.dowNow(), e = CMS.esc;
  cell = cell || ((r, i, key) => e(r[key] || ''));
  const list = rows.map((r, i) => [r, i]).filter(([r]) => all || r.online);
  const ss = [...new Set(list.map(([r]) => r.season || ''))].sort((x, y) => (y === now) - (x === now));
  const walk = all || list.some(([r]) => r.walkin), cols = walk ? 3 : 2;
  const isToday = (s, r) => (!s || s === now) && r.dow === dow;
  const body = ss.map(s => { const dim = s && s !== now ? ' dim' : '';
    const head = s ? `<tr class="sh${dim}"><th colspan="${cols}" scope="colgroup">${SEASON[s] ? SEASON[s] + ' · ' : ''}${e(CMS.get(V.seasons, s + '.label') || s)}${s === now ? '<span class="tag">ช่วงนี้</span>' : ''}</th></tr>` : '';
    return head + list.filter(([r]) => (r.season || '') === s).map(([r, i]) => `<tr class="${isToday(s, r) ? 'td' : ''}${dim}">
      <th scope="row">${cell(r, i, 'days')}${isToday(s, r) ? '<span class="tag">วันนี้</span>' : ''}</th>
      <td class="on">${cell(r, i, 'online')}</td>${walk ? `<td class="wk">${cell(r, i, 'walkin') || '–'}</td>` : ''}</tr>`).join(''); }).join('');
  return `<table class="ptbl"><thead><tr><th scope="col">วัน</th><th scope="col">จองออนไลน์<small>บาท/ล็อก/วัน</small></th>${walk ? '<th scope="col">Walk-in<small>บาท/ล็อก/วัน</small></th>' : ''}</tr></thead><tbody>${body}</tbody></table>`;
}

// ── แกลเลอรีแบบต่อกัน (เจ้าของ 31 ต.ค. 69: "ตรงกลางชัด แล้วมีรูปซ้ายขวาซ้อนกันไปเรื่อยๆ แต่เบลอ" · เลื่อนเอง · ปัดได้ · แตะดูได้) ──
// slides = [[src, alt, figcaptionHTML?], …] · cls = คลาสเพิ่ม (hero = หน้าแรก · lots = ตัวอย่างการจอง) · top = HTML ลอยบนรูป (เช่น ป้ายเปิดอยู่)
function gallery(slides, { cls = '', label = '', note = '', top = '' } = {}) {
  const e = CMS.esc; if (!slides.length) return '';
  const many = slides.length > 1;
  return `<div class="gal ${cls}" data-gal>${label ? `<span class="lbl">${label}</span>` : ''}
    <div class="gstack">${slides.map(([src, alt, cap], i) => `<figure class="gs" data-i="${i}"><div class="gimg"><img src="${e(src)}" alt="${e(alt)}"${i ? ' loading="lazy"' : ''} draggable="false"></div>${cap ?? `<figcaption><span>${e(alt)}</span></figcaption>`}</figure>`).join('')}${top}</div>
    ${many ? `<div class="gnav"><button type="button" class="gb" data-d="-1" aria-label="รูปก่อนหน้า">‹</button><div class="gdots">${slides.map((_, i) => `<button type="button" data-to="${i}" aria-label="รูปที่ ${i + 1}"></button>`).join('')}</div><button type="button" class="gb" data-d="1" aria-label="รูปถัดไป">›</button></div>` : ''}
    ${note ? `<p class="lnote">${note}</p>` : ''}</div>`;
}
// ตัวอย่างการจอง = รูปเรนเดอร์ 3D (blender/lot-guide.py · ความกว้างคำนวณจากขนาดล็อกของสาขานั้น) + รูปของโซน (vendor.zones.<z>.photos)
const LOTS = { food: [['img/lots/food.jpg', [1, 2, 3], '1fr 1fr 1fr']], boot: [['img/lots/boot-12.jpg', [1, 2], '4fr 6fr'], ['img/lots/boot-34.jpg', [3, 4], '1fr 1fr']] };
function lotExamples(z, Z) {
  const e = CMS.esc, w = parseFloat(Z.facts.find(f => f[0] === 'size')?.[2]?.match(/[\d.]+/)?.[0] || '');
  const slides = [
    ...(LOTS[z === 'court' ? 'food' : z] || []).map(([src, ns, cols]) => [src, `ตัวอย่างจอง ${ns.join(' และ ')} ล็อก`,
      `<figcaption style="grid-template-columns:${cols}">${ns.map(n => `<span><b>${n} ล็อก</b>${w ? `กว้าง ${+(w * n).toFixed(2)} ม.` : ''}</span>`).join('')}</figcaption>`]),
    ...(Z.photos || []).filter(([src]) => src).map(([src, alt]) => [src, alt, `<figcaption><span><b>${e(alt || Z.name)}</b></span></figcaption>`]),
  ];
  return gallery(slides, { cls: 'lots', label: 'ตัวอย่างการจอง', note: `แตะรูปเพื่อขยาย${slides.length > 1 ? ' · ปัดเพื่อเลื่อน' : ''} · ภาพประกอบ ขนาดจริงดูที่ "ขนาดล็อก"` });
}
// ตำแหน่งรูป: d = ห่างจากรูปกลางกี่รูป (ลบ = ซ้าย) · เกิน 2 = ซ่อน
function galSet(g, i) {
  const fs = [...g.querySelectorAll('.gs')], n = fs.length; g._i = ((i % n) + n) % n;
  fs.forEach((f, j) => { let d = (j - g._i + n) % n; if (d > n / 2) d -= n;
    f.dataset.d = Math.abs(d) > 2 ? 'x' : d; f.setAttribute('aria-hidden', d ? 'true' : 'false'); });
  g.querySelectorAll('.gdots button').forEach((b, j) => b.classList.toggle('on', j === g._i));
}
function galInit(g) {
  g.dataset.gal = 'on'; galSet(g, 0);
  const n = g.querySelectorAll('.gs').length; if (n < 2) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x0 = null, hold = false, seen = false;
  g.addEventListener('click', e => { const b = e.target.closest('.gb,[data-to]'); if (!b) return;
    galSet(g, b.dataset.to != null ? +b.dataset.to : g._i + +b.dataset.d); g._t = Date.now(); });
  const st = g.querySelector('.gstack');
  st.addEventListener('pointerdown', e => { x0 = e.clientX; hold = true; });
  st.addEventListener('pointerup', e => { hold = false; if (x0 == null) return; const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) { g._swiped = true; galSet(g, g._i + (dx < 0 ? 1 : -1)); g._t = Date.now(); } });
  st.addEventListener('pointercancel', () => { hold = false; x0 = null; });
  st.addEventListener('click', e => { if (g._swiped) { e.stopImmediatePropagation(); e.preventDefault(); g._swiped = false; } }, true);   // ปัดแล้วไม่นับเป็นแตะ
  g.addEventListener('mouseenter', () => hold = true); g.addEventListener('mouseleave', () => hold = false);
  new IntersectionObserver(es => seen = es[0].isIntersecting).observe(g);
  if (!still) setInterval(() => { if (seen && !hold && !document.hidden && !document.querySelector('dialog[open]') && Date.now() - (g._t || 0) > 6000) galSet(g, g._i + 1); }, 4000);
}
new MutationObserver(() => document.querySelectorAll('[data-gal=""]').forEach(galInit)).observe(document.documentElement, { childList: true, subtree: true });
// แตะรูปกลาง = ขยายเต็มจอ (มือถือ: รูปสูง 60% จอ ปัดซ้ายขวาดูได้) · แตะรูปข้างๆ = เลื่อนมาตรงกลาง
// .kind img = รูปปก "ขายอะไรได้บ้าง" ในแบบ 2 (โดนตัด → แตะดูเต็ม)
addEventListener('click', e => {
  const im = e.target.closest('.gal img, .kind img'); if (!im) return;
  const gs = im.closest('.gs');
  if (gs && gs.dataset.d !== '0') { const g = gs.closest('[data-gal]'); galSet(g, +gs.dataset.i); g._t = Date.now(); return; }
  let d = document.getElementById('zoomDlg');
  if (!d) { d = document.createElement('dialog'); d.id = 'zoomDlg'; d.className = 'zoomdlg';
    d.innerHTML = '<button type="button" class="mx" aria-label="ปิด">✕</button><div class="zw"><img alt=""></div><p></p>';
    d.onclick = () => d.close(); document.body.append(d); }
  const cap = [...(im.closest('figure')?.querySelector('figcaption')?.children || [])].map(x => x.innerText.replace(/\s+/g, ' ').trim()).join('  ·  ') || im.alt;
  d.querySelector('img').src = im.currentSrc || im.src; d.querySelector('img').alt = im.alt; d.querySelector('p').textContent = cap;
  d.showModal();
});

// เวลา (จอง/วันขาย) = การ์ดละโซน · ในการ์ดเป็นตารางเส้นทึบ 2 คอลัมน์ (หัวข้อ | เวลา) → มือถือไม่ต้องเลื่อนข้าง
// list = [[zoneKey, ชื่อโซน, [[หัวข้อ, ค่า(HTML)], …]], …] · k = สาขา (มีปุ่ม "อยู่ตรงไหน?" ถ้าหน้านั้นมี whereBtn)
const ZIC = { food: 'food', boot: 'car', court: 'food' };
const zoneTimes = (list, k = '') => `<div class="ztimes">${list.map(([z, name, rows]) => `<div class="ztc z-${z} rv"><div class="zt">${ic(ZIC[z] || 'pin')} ${CMS.esc(name)}${typeof whereBtn === 'function' ? whereBtn(k, z) : ''}</div>
  <table class="ptbl tt"><tbody>${rows.map(([h, v]) => `<tr><th scope="row">${CMS.esc(h)}</th><td>${v}</td></tr>`).join('')}</tbody></table></div>`).join('')}</div>`;

// ท้ายเว็บ: 2 บริษัทแยกบรรทัด (SaveoneGo = สาขาที่ story.brand เป็น GO · Saveone Market = โคราช) + ลิงก์ "ติดต่อ · เกี่ยวกับเรา"
// t(path) = HTML ของข้อความ (โหมดแก้ส่งตัวแก้ได้มา)
function footHTML(C, t) {
  t = t || (p => CMS.phr(CMS.get(C, p) || ''));
  const keys = C.keys || C.siteKeys || C.branchKeys, B = C.story?.brand || {}, ofCo = re => keys.filter(k => C[k] && re.test(B[k] || ''));
  const go = ofCo(/go/i), mk = ofCo(/market/i), nm = ks => ks.map(k => CMS.esc(C[k].name)).join(' · ');
  return `<div class="wrap"><span class="brand" data-wm></span>
    <nav aria-label="เกี่ยวกับเรา"><a href="contact-b.html">ติดต่อ · เกี่ยวกับเรา</a></nav>
    <p class="fine"><b>${t('contact.company')}</b>${go.length ? ` (${nm(go)})` : ''}<br>${t('contact.address')}
    ${mk.length ? `<br><br><b>Saveone Market</b> (${nm(mk)})<br>${CMS.phr(C[mk[0]].where)}` : ''}<br><br>${t('contact.footnote')}</p></div>`;
}
