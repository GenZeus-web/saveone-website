# สร้าง prototypes/home-v1.html, home-v2.html จาก home.html — ใช้ตรรกะ/ข้อมูลชุดเดิม เปลี่ยนแค่หน้าตา
# วิธีใช้: แก้ v1.css / v2.css แล้วรัน  python prototypes/tools/redesign/build.py  (อย่าแก้ home-v1/v2.html ตรงๆ จะโดนเขียนทับ)
import pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
PROTO = HERE.parents[1]   # prototypes/
src = (PROTO / "home.html").read_text(encoding="utf8")

EDIT_CSS = """
/* ── โหมดแก้ (admin) ── */
body.edit [data-p]{outline:1px dashed rgba(95,179,255,.6);outline-offset:2px;border-radius:2px;min-width:2em;cursor:text}
body.edit span[data-p],body.edit b[data-p],body.edit small[data-p]{display:inline-block}
body.edit [data-p]:focus{outline:2px solid var(--ed);background:rgba(95,179,255,.1)}
body.edit [data-p].empty{min-width:5em;background:rgba(255,207,107,.1)}
body.edit [data-p].empty:not(:focus)::after{content:"พิมพ์…";color:var(--warn);opacity:.8;font-weight:400}
.ed-del{position:absolute;top:-8px;right:-8px;z-index:2;width:22px;height:22px;border-radius:50%;border:0;background:#d9534f;color:#fff;font-weight:700;cursor:pointer;line-height:1}
.ed-add{margin-top:8px;padding:6px 12px;border:1px dashed var(--ed);background:none;color:var(--ed);font-weight:600;cursor:pointer}
.edbar{position:fixed;z-index:50;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 32px);padding:10px 12px;background:#0d0b1d;color:#f6f1e7;border:1px solid #5fb3ff;box-shadow:0 10px 40px rgba(0,0,0,.5);font-size:14px}
.edbar b{color:#5fb3ff}
.edbar button{padding:8px 14px;border:1px solid rgba(246,241,231,.2);background:#252050;color:#f6f1e7;font-weight:600;cursor:pointer}
.edbar button.pri{background:#5fb3ff;border-color:#5fb3ff;color:#0d0b1d}
.edbar .st{color:#b3aec6}.edbar .st.dirty{color:#ffcf6b}
.edpanel{display:none}
body.edit .edpanel{display:block}
.edpanel label{display:grid;gap:4px;font-size:12px;color:var(--muted)}
.edpanel input{width:100%;padding:8px 10px;border:1px solid var(--line2);background:var(--surface);color:var(--ink);font:inherit;font-size:14px;outline:0}
.edpanel input:focus{border-color:var(--ed)}
.edgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
body.edit{padding-bottom:90px}

/* ซ่อนแถบเลื่อน (ยังเลื่อนได้) */
*{scrollbar-width:none}
*::-webkit-scrollbar{display:none}
"""

V = {
  "v1": dict(
    name="V1 งาช้าง (Ivory Editorial)",
    fonts="family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Noto+Serif+Thai:wght@400;500;600&family=Cormorant+Garamond:wght@500;600",
    head="""<header class="top"><div class="wrap">
  <a class="brand" data-wm href="#" aria-label="ตลาดเซฟวัน GO"></a>
  <nav id="nav"></nav>
</div></header>
<div class="stage">
""",
    after_map="</div>\n",
    nav="""$('nav').innerHTML = `<a data-nav="cus">${esc(C.gate.cus.title)}</a><a data-nav="ven">${esc(C.gate.ven.title)}</a><a class="c" href="#foot">ติดต่อ</a>`;""",
    gate="""function renderGate() {
  const who = (g, n) => `<div data-g="${g}" tabindex="0" role="button"><span class="no">${n}</span><div><b>${T(C, `gate.${g}.title`)}</b><ul>${C.gate[g].items.map((_, i) => `<li>${T(C, `gate.${g}.items.${i}`)}</li>`).join('')}</ul></div><span class="go">${ic('next')}</span></div>`;
  $('gateIn').innerHTML = `${T(C, 'gate.kicker', 'p', 'kick')}${T(C, 'gate.title', 'h1')}<div class="who">${who('cus', '01')}${who('ven', '02')}</div><button class="skip" id="skip">${T(C, 'gate.skip')}</button>`;
}""",
  ),
  "v2": dict(
    name="V2 ราตรี (Midnight Gallery)",
    fonts="family=IBM+Plex+Sans+Thai:wght@300;400;500;600&family=Trirong:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500",
    head="""<header class="top"><div class="wrap">
  <nav class="l" id="navL"></nav>
  <a class="brand" data-wm href="#" aria-label="ตลาดเซฟวัน GO"></a>
  <nav class="r" id="nav"></nav>
</div></header>
""",
    after_map="",
    nav="""$('navL').innerHTML = `<a data-nav="cus">${esc(C.gate.cus.title)}</a><a data-nav="ven">${esc(C.gate.ven.title)}</a>`;
  $('nav').innerHTML = `<a class="m" data-nav="cus">${esc(C.gate.cus.title)}</a><a class="m" data-nav="ven">${esc(C.gate.ven.title)}</a><a class="c" href="#foot">ติดต่อ</a><a class="c" href="${esc(lineUrl(get(C, 'sg.contact.lineCustomer')))}" target="_blank" rel="noopener">LINE</a>`;""",
    gate="""function renderGate() {
  const who = g => `<div data-g="${g}" tabindex="0" role="button"><b>${T(C, `gate.${g}.title`)}</b><ul>${C.gate[g].items.map((_, i) => `<li>${T(C, `gate.${g}.items.${i}`)}</li>`).join('')}</ul><span class="go">เลือก ${ic('next')}</span></div>`;
  $('gateIn').innerHTML = `<img class="logo3d" src="img/logo-3d-night.webp" alt="${esc(C.gate.kicker)}">${T(C, 'gate.kicker', 'p', 'kick')}${T(C, 'gate.title', 'h1')}<div class="who">${who('cus')}${who('ven')}</div><button class="skip" id="skip">${T(C, 'gate.skip')}</button>`;
}""",
  ),
}

FOOT = """function renderFoot() {
  const ln = k => get(C, `sg.contact.${k}`);
  $('foot').innerHTML = `<div class="wrap"><div class="f-top"><span class="brand" data-wm></span><p class="f-kick">${esc(C.gate.kicker)}</p></div>
    <div class="f-cols">
      <div><small>บริษัท</small>${T(C, 'contact.company', 'b')}<p>${T(C, 'contact.address')}</p></div>
      <div><small>โทร</small><p><a href="tel:${digits(ln('phone'))}">${T(C, 'sg.contact.phone')}</a></p><p>${T(C, 'sg.contact.phoneHours')}</p></div>
      <div><small>LINE</small><p>ผู้ค้า <a href="${esc(lineUrl(ln('lineVendor')))}" target="_blank" rel="noopener">${T(C, 'sg.contact.lineVendor')}</a></p><p>ลูกค้า <a href="${esc(lineUrl(ln('lineCustomer')))}" target="_blank" rel="noopener">${T(C, 'sg.contact.lineCustomer')}</a></p></div>
      <div><small>สาขา</small>${C.branchKeys.map(k => `<p>${esc(C[k].name)}</p>`).join('')}</div>
    </div>
    ${T(C, 'contact.footnote', 'p', 'f-note')}</div>`;
  fillWordmarks();
}
// โลโก้ตัวอักษร (SVG ต้นฉบับ brand/ref-logos) ใส่ลงหน้าตรงๆ ให้สีตามธีมได้ (--wm-ink / --wm-go)
let WM = null;
async function fillWordmarks() {
  try { WM = WM || await (await fetch('img/wordmark.svg')).text(); } catch { return; }
  document.querySelectorAll('[data-wm]').forEach(el => { if (!el.firstChild) el.innerHTML = WM; });
}
// แถบบน: ไปส่วนลูกค้า/ผู้ค้า (ชื่อเมนูมาจากม่านเลือกกลุ่ม)
function renderHead() {
  NAV
  document.querySelectorAll('[data-nav]').forEach(a => a.onclick = e => { e.preventDefault(); pick(a.dataset.nav); $('g-' + a.dataset.nav).scrollIntoView({ behavior: 'smooth' }); });
  document.querySelector('.top .brand').onclick = e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); };
}"""

def sub(s, old, new, count=1):
    if s.count(old) != count:
        sys.exit(f"anchor not found exactly {count}x: {old[:70]!r} (found {s.count(old)})")
    return s.replace(old, new)

for key, v in V.items():
    s = src
    css = (HERE / f"{key}.css").read_text(encoding="utf8")
    a, b = s.index("<style>") + len("<style>\n"), s.index("</style>")
    s = s[:a] + css + EDIT_CSS + s[b:]
    s = sub(s, "<!-- หน้าแรกแบบ D", f"<!-- รีดีไซน์ {v['name']} (ทดลอง 29 ต.ค. 69 · สร้างจาก home.html ด้วยสคริปต์ — ตรรกะ/ข้อมูลเหมือนกัน ต่างแค่หน้าตา)\n     หน้าแรกแบบ D")
    s = sub(s, "family=IBM+Plex+Sans+Thai:wght@400;600;700", v["fonts"])
    s = sub(s, '<div class="map" id="map">', v["head"] + '<div class="map" id="map">')
    s = sub(s, '  <button class="chipg" id="chip" hidden></button>\n</div>\n', '  <button class="chipg" id="chip" hidden></button>\n</div>\n' + v["after_map"])
    s = sub(s, "  arrow: '<path d=\"M7 17L17 7M9 7h8v8\"/>',", "  arrow: '<path d=\"M7 17L17 7M9 7h8v8\"/>',\n  next: '<path d=\"M4 12h16M14 6l6 6-6 6\"/>',")
    g0 = s.index("function renderGate() {"); g1 = s.index("\n}\n", g0) + 2
    s = s[:g0] + v["gate"] + s[g1:]
    f0 = s.index("function renderFoot() {"); f1 = s.index("\n}\n", f0) + 2
    s = s[:f0] + FOOT.replace("NAV", v["nav"]) + s[f1:]
    s = sub(s, "function renderAll() { renderGate();", "function renderAll() { renderHead(); renderGate();")
    s = sub(s, "  document.querySelectorAll('.grp').forEach(m => m.classList.toggle('on', m.id === 'g-' + g));",
               "  document.querySelectorAll('.grp').forEach(m => m.classList.toggle('on', m.id === 'g-' + g));\n  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === g));")
    s = sub(s, "frame.src = 'branch-flip.html?v=20261028l' + (EDIT ? '&edit' : '');",
               f"frame.src = 'branch-flip.html?v=20261029a&theme={key}' + (EDIT ? '&edit' : '');")
    (PROTO / f"home-{key}.html").write_text(s, encoding="utf8", newline="\n")
    print("wrote", f"home-{key}.html", len(s))
