/* กดเปลี่ยนธีม = พระอาทิตย์ตก (สว่าง→มืด) / พระอาทิตย์ขึ้น (มืด→สว่าง) · ใช้ทุกหน้า *-b.html + home-map-b.html
   ทดลอง 3 แบบ (เจ้าของขอ 1 พ.ย. 69 — เลือกแล้วลบแบบที่ไม่ใช้):
     ?fx=1 ท้องฟ้าเต็มจอ (ดวงอาทิตย์ลับหลังแผงตลาด ดาวขึ้น ไฟร้านติด)
     ?fx=2 วงแสงขยายจากปุ่ม (ขอบวงเป็นสีส้ม-ชมพู)
     ?fx=3 แสงส้มกวาดทั้งหน้า (กลางคืนเลื่อนลงจากบน / เช้าเลื่อนขึ้นจากล่าง)
   ใส่ ?fx= ครั้งเดียว จำไว้ในเครื่อง · ตั้ง "ลดการเคลื่อนไหว" ในเครื่อง = เปลี่ยนทันทีไม่มีแอนิเมชัน */
(() => {
  const q = new URLSearchParams(location.search).get('fx');
  if (q) try { localStorage.setItem('themefx', q); } catch {}
  let fx = q; if (!fx) try { fx = localStorage.getItem('themefx'); } catch {}
  const FX = ['1', '2', '3'].includes(fx) ? fx : '1';
  const root = document.documentElement;
  const BG = { dark: '#15122b', light: '#e1dcf0' };   // = --bg ใน b/style.css
  const setTheme = t => { root.dataset.theme = t; try { localStorage.setItem('theme', t); } catch {} };
  const div = (cls, html = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; d.setAttribute('aria-hidden', 'true'); return d; };
  const all = list => Promise.all(list.map(a => a.finished));
  let busy = false;

  window.themeFx = e => {
    if (busy) return;
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return setTheme(t);
    busy = true;
    const btn = e?.currentTarget || document.getElementById('themeBtn');
    (FX === '2' ? ring : FX === '3' ? sweep : sky)(t, btn)
      .catch(() => setTheme(t))
      .finally(() => { busy = false; });
  };

  // ── แบบ 1: ท้องฟ้าเต็มจอ ── เล่นเดินหน้า = ตก · เล่นถอยหลัง = ขึ้น (ไฟร้านดับ ดาวหาย)
  const TOWN = (() => {
    // แผงตลาดหลังคาจั่ว สูงต่ำสลับกัน + สายไฟระย้า (เงาดำตัดกับฟ้า)
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
        const s = j / 5, bx = a + s * 100, by = (1 - s) * (1 - s) * 52 + 2 * (1 - s) * s * 74 + s * s * 52;
        bulbs += `<circle class="b" cx="${bx.toFixed(1)}" cy="${(by + 5).toFixed(1)}" r="4.2"/>`;
      }
    }
    return `<svg viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax slice"><path class="wire" d="${path}"/><path class="roof" d="${roofs}"/>${bulbs}</svg>`;
  })();
  const STARS = Array.from({ length: 46 }, () => {
    const s = (Math.random() * 1.6 + .8).toFixed(1);
    return `radial-gradient(${s}px ${s}px at ${(Math.random() * 100).toFixed(1)}% ${(Math.random() * 62).toFixed(1)}%,#fff 98%,transparent)`;
  }).join(',');

  function sky(t) {
    const o = div('tfx tfx-sky', `<i class="l day"></i><i class="l dusk"></i><i class="l night"></i><i class="stars"></i><i class="sun"></i><div class="town">${TOWN}</div>`);
    o.querySelector('.stars').style.backgroundImage = STARS;
    document.body.append(o);
    const set = t === 'dark', D = 2000;
    const opt = { duration: D, fill: 'both', direction: set ? 'normal' : 'reverse' };
    const $ = s => o.querySelector(s);
    const an = [
      o.animate([{ opacity: 0 }, { opacity: 1, offset: .14 }, { opacity: 1, offset: .84 }, { opacity: 0 }], opt),
      $('.dusk').animate([{ opacity: 0 }, { opacity: 0, offset: .1 }, { opacity: 1, offset: .46 }, { opacity: 1 }], opt),
      $('.night').animate([{ opacity: 0 }, { opacity: 0, offset: .44 }, { opacity: 1, offset: .76 }, { opacity: 1 }], opt),
      $('.sun').animate([{ transform: 'translate(-50%,0) scale(1)' }, { transform: 'translate(-50%,0) scale(1)', offset: .08 },
        { transform: 'translate(-50%,72vh) scale(1.12)', offset: .68 }, { transform: 'translate(-50%,72vh) scale(1.12)' }], { ...opt, easing: 'ease-in-out' }),
      $('.stars').animate([{ opacity: 0 }, { opacity: 0, offset: .56 }, { opacity: 1, offset: .8 }, { opacity: 1 }], opt),
      ...[...o.querySelectorAll('.b')].map((b, k, arr) => {
        const s = .5 + (k / arr.length) * .18;   // ไฟติดไล่จากซ้ายไปขวา
        return b.animate([{ opacity: .12 }, { opacity: .12, offset: s }, { opacity: 1, offset: s + .06 }, { opacity: 1 }], opt);
      }),
    ];
    setTimeout(() => setTheme(t), D * .5);   // เปลี่ยนสีหน้าเว็บตอนฟ้าบังเต็มจอ
    return all(an).finally(() => o.remove());
  }

  // ── แบบ 2: วงแสงขยายจากปุ่ม ──
  function ring(t, btn) {
    const r = btn?.getBoundingClientRect() || { left: innerWidth - 40, top: 20, width: 0, height: 0 };
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) / .62;   // ส่วนทึบ (62% ใน) ต้องคลุมทั้งจอ
    const warm = t === 'dark' ? '#ff7a3d,#ff4f8b' : '#ffd36b,#ff9a3d';
    const o = div('tfx tfx-ring');
    o.style.cssText = `left:${x}px;top:${y}px;background:radial-gradient(circle closest-side,${BG[t]} 0 62%,${warm.split(',')[0]} 72%,${warm.split(',')[1]} 82%,transparent 100%)`;
    document.body.append(o);
    const D = 1100;
    const grow = o.animate([{ width: '0px', height: '0px' }, { width: 2 * R + 'px', height: 2 * R + 'px' }], { duration: D * .7, easing: 'cubic-bezier(.55,0,.35,1)', fill: 'forwards' });
    return grow.finished.then(() => { setTheme(t); return o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D * .3, fill: 'forwards' }).finished; }).finally(() => o.remove());
  }

  // ── แบบ 3: แสงส้มกวาดทั้งหน้า ── ตก: ความมืดเลื่อนลงจากบน (ขอบนำสีส้ม) · ขึ้น: ความสว่างดันขึ้นจากล่าง
  function sweep(t, btn) {
    const set = t === 'dark';
    const o = div('tfx tfx-sweep' + (set ? ' down' : ' up'), '<i></i>');
    const band = o.firstChild;
    band.style.background = set
      ? `linear-gradient(to bottom,${BG.dark} 0 50%,#5b2a86 56%,#ff4f8b 63%,#ff9a3d 70%,transparent 78%)`
      : `linear-gradient(to top,${BG.light} 0 50%,#fff1d6 56%,#ffd36b 63%,#ff9a3d 70%,transparent 78%)`;
    document.body.append(o);
    const D = 1300, from = set ? '-100%' : '100%', mid = '0%';
    const icon = btn?.querySelector(set ? '.sun' : '.moon');
    icon?.animate([{ transform: 'none' }, { transform: set ? 'translateY(14px)' : 'translateY(-14px)', opacity: 0 }], { duration: D * .55, easing: 'ease-in' });
    const move = band.animate([{ transform: `translateY(${from})` }, { transform: `translateY(${mid})` }], { duration: D * .6, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    return move.finished.then(() => { setTheme(t); return o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D * .4, fill: 'forwards' }).finished; }).finally(() => o.remove());
  }
})();
