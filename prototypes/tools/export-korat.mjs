// ดึง "พิกัดผัง" โคราชจากโปรเจกต์ผังโซน (Desktop/3D ตลาด) → prototypes/korat-layout.js
// เอาแค่รูปทรง/ตำแหน่ง (ที่ดิน ถนน ตึก โซน ล็อก ต้นไม้) · ไม่เอาโลโก้ ชื่อร้าน ราคา โมเดลของคนอื่น
// รัน: node prototypes/tools/export-korat.mjs "../3D ตลาด/ผังโซนโคราช.html"
import fs from 'node:fs';
import path from 'node:path';

const src = fs.readFileSync(process.argv[2], 'utf8');
const cut = (a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('หาไม่เจอ: ' + a); return src.slice(i, j); };

// ส่วนผัง: ตั้งแต่ตัวช่วย R() จนก่อนป้ายชื่อ (ข้อมูลล้วน ไม่แตะ DOM)
const geo = cut('const R=(x,y,w,d)', '// ป้ายชื่อ');
// ถนนซอย + ต้นไม้ อยู่ในฟังก์ชันสร้างฉาก → ตัดเฉพาะอาร์เรย์
const roads = cut('[[395,88,395,724,14]', '.forEach(([x0,y0,x1,y1,w])');
const trees = cut('[[748,214],[1020,212]', '.forEach(([x,y],i)=>tree(');

// ป้ายชื่อโซน + ป้ายห้องน้ำ/สำนักงาน/น้ำพุ (ไม่เอาป้ายชื่อร้านอื่น)
const lbl = cut('const LBL=[', '// โลโก้บนหลังคา');
const roofTxt = cut('const ROOF_TXT=', '// ══ ราคา');
// โลโก้ร้านบนหลังคา (เจ้าของ 28 ต.ค.: เอามาด้วย ไม่งั้นตึกโล้น) · ม้าบนน้ำพุไม่เอา มีโมเดลม้าแล้ว
const roofLogo = cut('const ROOF_LOGO=', '// ร้าน/จุดที่ไม่มีโลโก้');
// รายละเอียดโซน: content.js ข้างไฟล์ผัง
const ctx = { window: {} };
new Function('window', fs.readFileSync(path.join(path.dirname(process.argv[2]), 'content.js'), 'utf8'))(ctx.window);
const C = ctx.window.CONTENT;

const KIND = { 'food-sf1': 'food', 'food-sf2': 'food', 'food-in': 'food', 'boot-a': 'boot', 'boot-b': 'boot', event: 'event' };
const run = new Function('KIND', `
  ${geo}
  const byId = Object.fromEntries(Object.keys(ZG).map(id => [id, { kind: KIND[id] || 'park' }]));   // slots() ในผังเรียกใช้ตอนคำนวณ
  const roads = (${roads.replace(/\/\/[^\n]*/g, '')});   // รวม LANE, GATE อยู่แล้ว
  ${lbl}
  ${roofTxt}
  ${roofLogo}
  // ช่องจอด/ล็อก/เต็นท์ "ตามแนวโซน": ผังเดิมวางเป็นตารางตรงแกน แต่โซนจริงเอียง → รถจอดเฉียงกับลาน
  // หมุนโซนกลับให้ตรง วางตารางแบบเดิม แล้วหมุนจุดกลับ · ตรวจชนตึก/ขอบโซนด้วย free() เดิม
  // มุม = ขอบที่ยาวที่สุดของโซน · แถวแรกเริ่มตรงไหนลองหลายตำแหน่ง เอาที่วางได้มากสุด (โซนมีมุมบาก เลื่อนนิดเดียวช่องหายทั้งแถว)
  const norm = a => { while (a > Math.PI / 4) a -= Math.PI / 2; while (a < -Math.PI / 4) a += Math.PI / 2; return a; };
  const tiltOf = id => { const b = ZG[id]; let a = 0, L = 0;
    b.forEach((p, i) => { const q = b[(i + 1) % b.length], l = Math.hypot(q[0] - p[0], q[1] - p[1]); if (l > L) { L = l; a = norm(Math.atan2(q[1] - p[1], q[0] - p[0])); } });
    return a; };
  const tilt = b => tiltOf(Object.keys(ZG).find(id => ZG[id] === b));
  const bestGrid = (id, a) => { let best = [];
    for (let k = 0; k < 12; k++) { const g = grid(id, a, k / 12); if (g.length > best.length) best = g; }
    return best; };
  const rslots = id => bestGrid(id, tiltOf(id));
  function grid(id, a, ph = 0) {   // ph = เลื่อนจุดเริ่มแถว (สัดส่วนของระยะแถว)
    const b = ZG[id], cs = Math.cos(a), sn = Math.sin(a), kind = byId[id].kind;
    const cx = b.reduce((s, p) => s + p[0], 0) / b.length, cy = b.reduce((s, p) => s + p[1], 0) / b.length;
    const W = ([x, y]) => [cx + x * cs - y * sn, cy + x * sn + y * cs];                          // แกนโซน → ผัง
    const L = ([x, y]) => [(x - cx) * cs + (y - cy) * sn, -(x - cx) * sn + (y - cy) * cs];        // ผัง → แกนโซน
    const [x0, x1, y0, y1] = bbx(b.map(L)), out = [];
    const ok = (x, y, w, d) => free(b, [[x, y], [x + w, y], [x + w, y + d], [x, y + d]].map(W), id);
    const push = (x, y, extra) => { const [X, Y] = W([x, y]); out.push({ x: X, y: Y, a, ...extra }); };
    if (kind === 'boot') { const w = 2.4 * U, d = 8 * U, ai = 6 * U;
      for (let x = x0 + ai + ph * (2 * d + ai) - (2 * d + ai) * (ph > 0); x + 2 * d <= x1 + 1; x += 2 * d + ai) for (const [xx, dir] of [[x, -1], [x + d, 1]])
        for (let y = y0 + 2; y + w <= y1; y += w) if (ok(xx, y, d, w)) push(xx + d / 2, y + w / 2, { dir });
    } else if (kind === 'food') { const t = 3 * U, ai = 4 * U;
      for (let x = x0 + 1 + ph * (2 * t + ai) - (2 * t + ai) * (ph > 0); x + 2 * t + ai <= x1 + 1; x += 2 * t + ai) for (const [xx, face] of [[x, 1], [x + t + ai, -1]])
        for (let y = y0 + 2; y + t <= y1; y += t) if (ok(xx, y, t, t)) push(xx + t / 2, y + t / 2, { face });
    } else { const w = 2.5 * U, d = 5 * U, ai = 6 * U;
      for (let y = y0 + ai / 2 + ph * (2 * d + ai) - (2 * d + ai) * (ph > 0); y + d <= y1; y += 2 * d + ai) for (const [yy, f] of [[y, 0], [y + d, 1]])
        for (let x = x0 + 2; x + w <= x1; x += w) if (ok(x, yy, w, d)) push(x + w / 2, yy + d / 2, { f });
    }
    return out;
  }
  return { SITE, ANNEX, ROAD, DIRT, CORNER, ZG, BLD, U, M_PER, absA, byId, slots, rslots, tilt, roads, trees: ${trees}, LBL, ROOF_TXT, ROOF_LOGO };
`);
const K = run(KIND);

const r1 = v => Math.round(v * 10) / 10;
const r4 = v => Math.round(v * 1e4) / 1e4;   // มุม (เรเดียน)
const poly = b => b.map(([x, y]) => [r1(x), r1(y)]);
const out = {
  note: 'พิกัดจากผังโซนโคราช (แผนที่ตลาด 28 ส.ค. 69 + ดาวเทียม 25 ต.ค. 69) · y = ทิศใต้ · U = หน่วยต่อ 1 ม.',
  U: K.U,
  site: [poly(K.SITE), poly(K.ANNEX)],
  road: poly(K.ROAD),
  lanes: K.roads.map(a => a.map(r1)),   // ถนนซอย + ทางรถเข้า + ทางเข้าหลัก [x0,y0,x1,y1,กว้าง]
  dirt: poly(K.DIRT),
  corner: poly(K.CORNER),
  zones: Object.entries(K.ZG).map(([id, b]) => ({ id, kind: K.byId[id].kind, b: poly(b), a: r4(K.tilt(b)) })),   // a = มุมเอียงของโซน
  bld: K.BLD.map(B => ({ b: poly(B.b), h: B.h, sign: B.sign, roof: B.roof, wall: B.wall, ac: B.ac })),   // สีแถบป้าย/หลังคา ตามผังเดิม
  logos: K.ROOF_LOGO.filter(([n]) => n !== 'fountain-horse'),      // [ไฟล์, x, y, กว้าง, สูงหลังคา, มุม]
  signs: K.ROOF_TXT.filter(([L]) => !/สำนักงาน|ห้องน้ำ|น้ำพุ/.test(L[0])),   // ป้ายตัวหนังสือ [บรรทัด, x, y, กว้าง, สูง, พื้น, สีอักษร]
  // ช่องตามแนวโซน (rslots) · ตัวท้าย = มุมเอียง
  food: ['food-sf1', 'food-sf2'].flatMap(id => K.rslots(id).map(q => [r1(q.x), r1(q.y), q.face, r4(q.a)])),
  boot: ['boot-a', 'boot-b'].flatMap(id => K.rslots(id).map(q => [r1(q.x), r1(q.y), q.dir, r4(q.a)])),
  park: Object.keys(K.ZG).filter(id => /^park|^event/.test(id)).flatMap(id => K.rslots(id).map(q => [r1(q.x), r1(q.y), q.f, id === 'event' ? 1 : 0, r4(q.a)])),
  trees: K.trees,
  fountain: [656, 489],
  roof: { x: 866, y: 620, w: 166, d: 62, h: 40 },              // หลังคาเหล็กเหนือสตรีทฟู้ด 2
  // หมุด: [x, y, สูง, ข้อความ, ชนิด, โซน] · โซนจาก LBL · จุดบริการจาก ROOF_TXT (เฉพาะสำนักงาน น้ำพุ · ห้องน้ำเจ้าของสั่งเอาออก)
  pins: [
    ...K.LBL.map(([x, y, h, t, cls, id]) => [x, y, h, t, cls.split(' ')[1], id]),
    ...K.ROOF_TXT.filter(([L]) => /สำนักงาน|น้ำพุ/.test(L[0])).map(([L, x, y, w, h]) =>
      [x, y, Math.max(h, 2), L[0], 'spot', /สำนักงาน/.test(L[0]) ? 'office' : 'fountain']),
  ],
  // รายละเอียดโซน (content.js · ข้อมูลจากหน้าเว็บ "มาขาย" ของตลาด) + พื้นที่/จำนวนช่องที่คำนวณจากผัง
  info: Object.fromEntries(C.zones.map(z => {
    const g = { ...(C.groups[z.group] || {}), ...z };
    const keep = ['kind', 'name', 'where', 'lot', 'ok', 'no', 'noTo', 'tiers', 'facts', 'steps', 'tel', 'warn', 'price', 'priceNote', 'hours', 'near'];
    const o = Object.fromEntries(keep.filter(k => g[k] != null && g[k] !== '').map(k => [k, g[k]]));
    o.m2 = Math.round(K.absA(K.ZG[z.id]) * K.M_PER * K.M_PER / 100) * 100;
    if (g.kind !== 'food') o.count = K.rslots(z.id).length;
    return [z.id, o];
  })),
  about: { kinds: C.kinds, season: C.season, elec: C.elec, feeNote: C.feeNote, office: C.site.office, calls: C.site.calls, steps: C.site.firstSteps },
};

const dst = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', 'korat-layout.js');
fs.writeFileSync(dst, '// สร้างจาก tools/export-korat.mjs — อย่าแก้มือ\nwindow.KORAT = ' + JSON.stringify(out) + ';\n');
// โมเดลที่เราทำเอง (Blender · ม้าน้ำพุจากรูปเจ้าของ) ฝังเป็น base64 → ดับเบิลคลิกเปิดไฟล์ได้โดยไม่ต้องมีเซิร์ฟเวอร์
// ไม่เอาโมเดล Kenney / คน Meshy (เจ้าของ 28 ต.ค.: ใช้ของที่ทำเองเท่านั้น ไม่ติดลิขสิทธิ์)
const MOD = path.join(path.dirname(process.argv[2]), 'models', 'blender');
const OURS = { tent: 'tent-white', cart: 'food-cart', umb: 'umbrella', horse: 'horse-fountain' };
const emb = Object.fromEntries(Object.entries(OURS).map(([k, f]) => [k, fs.readFileSync(path.join(MOD, f + '.glb')).toString('base64')]));
// หมุดแบบ D (เจ้าของเลือก 28 ต.ค. · Blender ของเรา brand/3d/pins) + ไอคอนที่วาดเอง
const PINS = path.join(path.dirname(dst), '..', 'brand', '3d', 'pins');
emb.pin = fs.readFileSync(path.join(PINS, 'glb', 'pin-d.glb')).toString('base64');
const pinIcon = Object.fromEntries(['food', 'boot', 'event', 'park', 'spot', 'moto', 'wc'].map(k => [k, 'data:image/png;base64,' + fs.readFileSync(path.join(PINS, 'icons', k + '.png')).toString('base64')]));
const dstM = path.join(path.dirname(dst), 'models-embed.js');
const LOGOS = path.join(path.dirname(process.argv[2]), 'logos');
const logo = Object.fromEntries(out.logos.map(([n]) => [n, 'data:image/png;base64,' + fs.readFileSync(path.join(LOGOS, n + '.png')).toString('base64')]));
fs.writeFileSync(dstM, '// สร้างจาก tools/export-korat.mjs — โมเดลของเราเอง (Blender) + โลโก้ร้านบนหลังคา ฝังเป็น base64\nwindow.GLB = ' + JSON.stringify(emb) + ';\nwindow.LOGO = ' + JSON.stringify(logo) + ';\nwindow.PIN_ICON = ' + JSON.stringify(pinIcon) + ';\n');
console.log('wrote', dstM, (fs.statSync(dstM).size / 1024).toFixed(0) + ' KB');

console.log('มุมโซน (องศา):', out.zones.map(z => `${z.id} ${(z.a * 180 / Math.PI).toFixed(1)}`).join(' · '));
console.log('จำนวนช่อง เดิม→ตามแนว:', Object.keys(K.ZG).map(id => `${id} ${K.slots(id).length}→${K.rslots(id).length}`).join(' · '));
console.log('wrote', dst, (fs.statSync(dst).size / 1024).toFixed(0) + ' KB',
  '| ตึก', out.bld.length, 'เต็นท์', out.food.length, 'เปิดท้าย', out.boot.length, 'ช่องจอด', out.park.length, 'ต้นไม้', out.trees.length);
