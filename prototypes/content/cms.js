// เนื้อหาเว็บอยู่ไฟล์เดียว content/site.json · หน้าเว็บอ่านไฟล์นี้แล้ววาด
// โหมดแก้ (?edit): ทุกช่องที่ผูกด้วย data-p="ทาง.ใน.json" พิมพ์แก้ได้ตรงบนหน้าจริง · ใช้ร่วมกันทั้ง home.html และผัง 3D (branch-flip.html)
(() => {
  const EDIT = new URLSearchParams(location.search).has('edit');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const keys = p => String(p).split('.');
  const get = (o, p) => keys(p).reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, p, v) => { const k = keys(p), last = k.pop(); const t = k.reduce((a, x) => a[x], o); t[last] = v; };
  // ช่องข้อความผูก json · ว่าง = "รอข้อมูล" (กรอบเส้นประ)
  const T = (C, p, tag = 'span', cls = '') => {
    const v = get(C, p), empty = v == null || v === '';
    return `<${tag} data-p="${esc(p)}" class="${cls}${empty ? ' empty' : ''}"${EDIT ? ' contenteditable="plaintext-only" spellcheck="false"' : ''}>${empty ? (EDIT ? '' : 'รอข้อมูล') : esc(v)}</${tag}>`;
  };
  // ปุ่มเพิ่ม/ลบรายการ (โชว์เฉพาะโหมดแก้)
  const del = p => EDIT ? `<button type="button" class="ed-del" data-del="${esc(p)}" title="ลบ" aria-label="ลบรายการนี้">×</button>` : '';
  const add = (p, label = '+ เพิ่ม') => EDIT ? `<button type="button" class="ed-add" data-add="${esc(p)}">${esc(label)}</button>` : '';
  const blank = v => Array.isArray(v) ? v.map(blank) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'ic' ? x : blank(x)])) : typeof v === 'string' ? '' : v;
  // ผูกเหตุการณ์แก้ · onPatch(path, value) เรียกทุกครั้งที่พิมพ์ · onShape() เมื่อเพิ่ม/ลบรายการ (ให้หน้าวาดใหม่)
  function bind(root, C, onPatch, onShape) {
    if (!EDIT) return;
    root.addEventListener('input', e => {
      const el = e.target.closest('[data-p]'); if (!el) return;
      const v = el.matches('input,textarea') ? el.value : el.innerText.replace(/\n+$/, '');
      el.classList.toggle('empty', !v);
      set(C, el.dataset.p, v); onPatch(el.dataset.p, v);
      sync(root, el.dataset.p, v, el);
    });
    root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[contenteditable]')) { e.preventDefault(); e.target.blur(); } });   // ข้อความบรรทัดเดียว
    root.addEventListener('click', e => {
      const d = e.target.closest('[data-del],[data-add]'); if (!d) return;
      e.preventDefault(); e.stopPropagation();
      if (d.dataset.del) { const k = keys(d.dataset.del), i = +k.pop(); get(C, k.join('.')).splice(i, 1); }
      else { const a = get(C, d.dataset.add); a.push(blank(a[a.length - 1] ?? '')); }
      onShape();
    }, true);
    // โหมดแก้: ลิงก์ไม่พาออกจากหน้า (คลิกเพื่อพิมพ์แก้)
    root.addEventListener('click', e => { if (e.target.closest('a') && !e.target.closest('.ed-keep')) e.preventDefault(); });
  }
  // ช่องอื่นที่ผูกทางเดียวกัน อัปเดตตาม (ยกเว้นช่องที่กำลังพิมพ์)
  function sync(root, p, v, except) {
    root.querySelectorAll(`[data-p="${CSS.escape(p)}"]`).forEach(el => {
      if (el === except || el === document.activeElement) return;
      if (el.matches('input,textarea')) el.value = v; else el.textContent = v || (EDIT ? '' : 'รอข้อมูล');
      el.classList.toggle('empty', !v);
    });
  }
  // ฤดูราคา: from/to = "ดด-วว" · ข้ามปีได้ (พ.ย.–ก.พ.)
  function seasonNow(seasons, d = new Date()) {
    const md = (d.getMonth() + 1) * 100 + d.getDate(), n = s => +s.replace('-', '');
    for (const [k, s] of Object.entries(seasons || {})) {
      const a = n(s.from), b = n(s.to);
      if (a <= b ? md >= a && md <= b : md >= a || md <= b) return k;
    }
    return '';
  }
  const dowNow = (d = new Date()) => [1, 2, 3, 4].includes(d.getDay()) ? 'weekday' : 'weekend';   // ศ–อา = weekend
  async function load(url = 'content/site.json') {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('โหลด ' + url + ' ไม่ได้ (' + r.status + ')');
    return r.json();
  }
  window.CMS = { EDIT, esc, get, set, T, del, add, bind, sync, seasonNow, dowNow, load };
})();
