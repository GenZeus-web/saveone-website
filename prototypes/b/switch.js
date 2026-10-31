// ปุ่มสลับแบบเว็บ (ชั่วคราว · รอเลือก): A = หลายหน้า (home-b.html …) ⇄ B = ผัง 3D (home-map-b.html) · A+D เอาออกแล้ว 31 ต.ค. 69
// เลือกแบบได้แล้ว → ลบไฟล์นี้ + บรรทัด <script src="b/switch.js"> ในทุกหน้า + .ver ใน b/style.css
(() => {
  const here = location.pathname.split('/').pop().replace(/\.html$/, '') + '.html'; // Cloudflare ตัด .html ออก
  const VER = [['pages', 'A', 'home-b.html', 'หลายหน้า'], ['map', 'B', 'home-map-b.html', 'ผัง 3D']];
  const cur = (VER.find(v => v[2] === here) || VER[0])[0];
  if (window !== top) {   // หน้าที่เปิดอยู่ในกรอบมือถือ → ไม่ต้องมีปุ่ม + ซ่อนแถบเลื่อนเหมือนมือถือจริง
    document.documentElement.classList.add('inphone');
    return;
  }
  const box = document.createElement('nav');
  box.className = 'ver';
  box.setAttribute('aria-label', 'เลือกแบบเว็บ');
  box.innerHTML = `<span>แบบ</span>${VER.map(([k, t, h, d]) => `<a href="${h}" title="แบบ ${t} · ${d}"${k === cur ? ' class="on" aria-current="true"' : ''}>${t}</a>`).join('')}<button class="phbtn" type="button" title="ดูหน้านี้ในจอมือถือ">มือถือ</button>`;
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
