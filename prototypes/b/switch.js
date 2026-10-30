// ปุ่มสลับแบบเว็บ (ชั่วคราว · เจ้าของยังไม่เลือก 29 ต.ค. 69): "หลายหน้า" (home-b.html …) ⇄ "ผัง 3D" (home-map-b.html) ⇄ "A+D" (home-ad.html · 30 ต.ค.)
// เลือกแบบได้แล้ว → ลบไฟล์นี้ + บรรทัด <script src="b/switch.js"> ในทุกหน้า + .ver ใน b/style.css
(() => {
  const here = location.pathname.split('/').pop().replace(/\.html$/, '') + '.html'; // Cloudflare ตัด .html ออก
  const VER = [['pages', 'หลายหน้า', 'home-b.html'], ['map', 'ผัง 3D', 'home-map-b.html'], ['ad', 'A+D', 'home-ad.html']];
  const cur = (VER.find(v => v[2] === here) || VER[0])[0];
  if (window !== top) {   // หน้าที่เปิดอยู่ในกรอบมือถือ → ไม่ต้องมีปุ่ม + ซ่อนแถบเลื่อนเหมือนมือถือจริง
    document.documentElement.classList.add('inphone');
    return;
  }
  try { localStorage.setItem('ver', cur); } catch {}
  const box = document.createElement('nav');
  box.className = 'ver';
  box.setAttribute('aria-label', 'เลือกแบบเว็บ');
  box.innerHTML = `<span>แบบ</span>${VER.map(([k, t, h]) => `<a href="${h}"${k === cur ? ' class="on" aria-current="true"' : ''}>${t}</a>`).join('')}<button class="phbtn" type="button" title="ดูหน้านี้ในจอมือถือ">มือถือ</button>`;
  document.body.append(box);
  // ดูแบบมือถือบนจอคอม: เปิดหน้าเดิมในกรอบ 390×844 (เลื่อน/กดได้จริง) · Esc หรือกดนอกกรอบ = ปิด
  let pv = null;
  const close = () => { pv?.remove(); pv = null; document.documentElement.style.overflow = ''; };
  const open = () => {
    if (pv) return close();
    const u = new URL(location.href); u.searchParams.delete('phone');
    pv = document.createElement('div');
    pv.className = 'phv';
    pv.innerHTML = `<div class="phv-dev"><iframe src="${u}" title="ตัวอย่างจอมือถือ"></iframe></div><p>จอมือถือ 390 × 844 · กดนอกกรอบหรือ Esc เพื่อปิด</p><button type="button" aria-label="ปิด">✕</button>`;
    pv.onclick = e => { if (e.target === pv || e.target.tagName === 'BUTTON') close(); };
    document.body.append(pv);
    document.documentElement.style.overflow = 'hidden';
  };
  box.querySelector('.phbtn').onclick = open;
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  if (new URLSearchParams(location.search).has('phone')) open();   // ลิงก์ ?phone = เปิดกรอบมือถือทันที (ส่งให้คนอื่นดูได้)
})();
