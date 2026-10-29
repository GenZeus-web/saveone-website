// ปุ่มสลับแบบเว็บ (ชั่วคราว · เจ้าของยังไม่เลือก 29 ต.ค. 69): "หลายหน้า" (home-b.html …) ⇄ "ผัง 3D" (home-map-b.html)
// เลือกแบบได้แล้ว → ลบไฟล์นี้ + บรรทัด <script src="b/switch.js"> ในทุกหน้า + .ver ใน b/style.css
(() => {
  const here = location.pathname.split('/').pop();
  const cur = here === 'home-map-b.html' ? 'map' : 'pages';
  const VER = [['pages', 'หลายหน้า', 'home-b.html'], ['map', 'ผัง 3D', 'home-map-b.html']];
  try { localStorage.setItem('ver', cur); } catch {}
  const box = document.createElement('nav');
  box.className = 'ver';
  box.setAttribute('aria-label', 'เลือกแบบเว็บ');
  box.innerHTML = `<span>แบบ</span>${VER.map(([k, t, h]) => `<a href="${h}"${k === cur ? ' class="on" aria-current="true"' : ''}>${t}</a>`).join('')}`;
  document.body.append(box);
})();
