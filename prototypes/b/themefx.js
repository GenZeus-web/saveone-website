/* กดเปลี่ยนธีม = พระอาทิตย์ตก (สว่าง→มืด) / พระอาทิตย์ขึ้น (มืด→สว่าง) · ใช้ทุกหน้า *-b.html + home-map-b.html
   เจ้าของเลือก 1 พ.ย. 69: แบบท้องฟ้า (ดวงอาทิตย์ลับหลังแผงตลาด ดาวขึ้น ไฟร้านติด) — อยู่ "หลัง" ตัวหนังสือ/การ์ด ห้ามบังหน้า
   วิธี: ฉากฟ้า z-index:-1 · ระหว่างเล่น html.tfx-on ทำพื้นหน้า/หัวหน้า/ท้ายเว็บโปร่ง ให้เห็นฟ้าผ่านช่องว่างระหว่างการ์ด
   เครื่องที่ตั้ง "ลดการเคลื่อนไหว" = เปลี่ยนทันที */
(() => {
  const root = document.documentElement;
  const D = 2200;   // ความยาวทั้งหมด (มิลลิวินาที)
  const setTheme = t => { root.dataset.theme = t; try { localStorage.setItem('theme', t); } catch {} };
  let busy = false;

  // แผงตลาดหลังคาจั่ว สูงต่ำสลับกัน + สายไฟระย้า (เงาตัดกับฟ้า)
  const TOWN = (() => {
    let roofs = '', bulbs = '', x = 0, i = 0;
    const H = [70, 96, 60, 84, 108, 66, 90, 74, 100, 62, 86, 78];
    while (x < 1200) {
      const w = 84 + (i % 3) * 18, h = H[i % H.length], top = 160 - h;
      roofs += `M${x} 160V${top + 22}L${x + w / 2} ${top}L${x + w} ${top + 22}V160Z`;
      x += w + 6; i++;
    }
    let path = 'M0 52';
    for (let k = 0; k < 12; k++) {
      const a = k * 100;
      path += ` Q${a + 50} 74 ${a + 100} 52`;
      for (let j = 1; j <= 4; j++) {
        const s = j / 5, by = (1 - s) * (1 - s) * 52 + 2 * (1 - s) * s * 74 + s * s * 52;
        bulbs += `<circle class="b" cx="${(a + s * 100).toFixed(1)}" cy="${(by + 5).toFixed(1)}" r="4.2"/>`;
      }
    }
    return `<svg viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax slice"><path class="wire" d="${path}"/><path class="roof" d="${roofs}"/>${bulbs}</svg>`;
  })();
  const STARS = Array.from({ length: 46 }, () => {
    const s = (Math.random() * 1.6 + .8).toFixed(1);
    return `radial-gradient(${s}px ${s}px at ${(Math.random() * 100).toFixed(1)}% ${(Math.random() * 62).toFixed(1)}%,#fff 98%,transparent)`;
  }).join(',');

  window.themeFx = () => {
    if (busy) return;
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return setTheme(t);
    busy = true;
    const o = document.createElement('div');
    o.className = 'tfx'; o.setAttribute('aria-hidden', 'true');
    o.innerHTML = `<i class="l day"></i><i class="l dusk"></i><i class="l night"></i><i class="stars"></i><i class="sun"></i><div class="town">${TOWN}</div>`;
    o.querySelector('.stars').style.backgroundImage = STARS;
    document.body.append(o);
    root.classList.add('tfx-on');
    // เล่นเดินหน้า = ตก · เล่นถอยหลัง = ขึ้น (ไฟร้านดับ ดาวหาย ดวงอาทิตย์โผล่)
    const opt = { duration: D, fill: 'both', direction: t === 'dark' ? 'normal' : 'reverse' };
    const $ = s => o.querySelector(s);
    const an = [
      o.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .86 }, { opacity: 0 }], opt),
      $('.dusk').animate([{ opacity: 0 }, { opacity: 0, offset: .1 }, { opacity: 1, offset: .46 }, { opacity: 1 }], opt),
      $('.night').animate([{ opacity: 0 }, { opacity: 0, offset: .44 }, { opacity: 1, offset: .76 }, { opacity: 1 }], opt),
      $('.sun').animate([{ transform: 'translate(-50%,0)' }, { transform: 'translate(-50%,0)', offset: .08 },
        { transform: 'translate(-50%,72vh) scale(1.12)', offset: .68 }, { transform: 'translate(-50%,72vh) scale(1.12)' }], { ...opt, easing: 'ease-in-out' }),
      $('.stars').animate([{ opacity: 0 }, { opacity: 0, offset: .56 }, { opacity: 1, offset: .8 }, { opacity: 1 }], opt),
      ...[...o.querySelectorAll('.b')].map((b, k, arr) => {
        const s = .5 + (k / arr.length) * .18;   // ไฟติดไล่จากซ้ายไปขวา
        return b.animate([{ opacity: .12 }, { opacity: .12, offset: s }, { opacity: 1, offset: s + .06 }, { opacity: 1 }], opt);
      }),
    ];
    // ตัวหนังสือต้องตัดกับฟ้าเสมอ: ตก = เปลี่ยนเป็นธีมมืด (ตัวขาว) ทันทีที่ฟ้าด้านบนเริ่มม่วง · ขึ้น = กลับเป็นตัวเข้มเมื่อฟ้าด้านบนสว่างแล้ว
    setTimeout(() => setTheme(t), D * (t === 'dark' ? .28 : .72));
    Promise.all(an.map(a => a.finished)).finally(() => { o.remove(); root.classList.remove('tfx-on'); busy = false; });
  };
})();
