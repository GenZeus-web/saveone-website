# โลโก้ 3D ลุค B (ป้ายไฟกลางคืน · เจ้าของเลือก) สำหรับวางบนเว็บ: พื้นหลังใส · ครอปพอดีตัวอักษร · ความละเอียดสูงให้คมบนจอมือถือ
# รัน: "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P brand/3d/logo3d-web.py -- brand/ref-logos/logo-wordmark.svg prototypes/img
# ได้ logo-3d-night.png + .webp (ชื่อตัวพิมพ์เล็ก)
import bpy, sys, os, re, tempfile
from mathutils import Vector, Matrix

svg, out = sys.argv[sys.argv.index('--') + 1:][:2]
out = os.path.abspath(out); os.makedirs(out, exist_ok=True)
txt = re.sub(r'var\(--[\w-]+,(#[0-9a-fA-F]{3,6})\)', r'\1', open(svg, encoding='utf-8').read())
svg = os.path.join(tempfile.gettempdir(), 'wm-plain.svg'); open(svg, 'w', encoding='utf-8').write(txt)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
try:
    bpy.ops.import_curve.svg(filepath=svg)
except AttributeError:
    import addon_utils
    addon_utils.enable('io_curve_svg', default_set=True)
    bpy.ops.import_curve.svg(filepath=svg)
curves = [o for o in sc.objects if o.type == 'CURVE']

def bbox(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    return Vector([min(p[i] for p in pts) for i in range(3)]), Vector([max(p[i] for p in pts) for i in range(3)])
lo, hi = bbox(curves)
s = 4.0 / (hi.x - lo.x); ctr = (lo + hi) / 2
for o in curves:
    o.location = (o.location - ctr) * s; o.scale = o.scale * s
bpy.context.view_layer.update()

EXT, BEV = 0.07, 0.006   # เท่ากับ logo3d.py (ภาพที่เจ้าของเลือก)
for o in curves:
    d = o.data; d.dimensions = '2D'; d.fill_mode = 'BOTH'
    d.extrude = EXT / s; d.bevel_depth = BEV / s; d.bevel_resolution = 4; d.offset = -BEV / s; d.resolution_u = 24
def is_go(o):
    m = o.data.materials[0] if o.data.materials else None
    return bool(m) and m.diffuse_color[1] > m.diffuse_color[0] * 1.5
ink = [o for o in curves if not is_go(o)]; go = [o for o in curves if is_go(o)]

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c)
def mat(name, base, rough, emit=None, estr=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1); b.inputs['Roughness'].default_value = rough
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = estr
    return m
def setmat(objs, m):
    for o in objs: o.data.materials.clear(); o.data.materials.append(m)
# หน้าตัวอักษรเรืองแสงอ่อนกว่าภาพโปสเตอร์ (ไม่ฟุ้ง = ขอบคม) · ด้านข้างได้แสงจากไฟ เห็นความหนา 3D
setmat(ink, mat('ink', srgb('#f6f1e7'), .35, emit=srgb('#fff4e0'), estr=.35))
setmat(go, mat('go', srgb('#84e62d'), .3, emit=srgb('#84e62d'), estr=.45))

def look(obj, target, up=Vector((0, 1, 0))):
    f = (Vector(target) - obj.location).normalized(); r = f.cross(up).normalized(); u = r.cross(f)
    obj.rotation_euler = Matrix((r, u, -f)).transposed().to_euler()
def light(name, kind, loc, energy, color=(1, 1, 1), size=1.0):
    d = bpy.data.lights.new(name, kind); d.energy = energy; d.color = color
    if kind == 'AREA': d.size = size
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc; look(o, (0, 0, 0))
light('front', 'AREA', (0, -.5, 6), 260, (1, 1, 1), 5)      # หน้าตัวอักษรสว่างสะอาด
light('key', 'AREA', (-3, -3, 4), 120, (.55, .6, 1), 4)    # สันซ้ายล่างอมฟ้า (กลางคืน)
light('warm', 'AREA', (0, -3, 1.5), 160, (1, .7, .4), 6)   # สันล่างอุ่น (ไฟร้าน)

# กล้องตั้งฉากแบบเอียงนิดๆ (มองจากล่างซ้าย) ให้เห็นสันตัวอักษร · ครอปพอดีตัว
cam_d = bpy.data.cameras.new('cam'); cam_d.type = 'ORTHO'
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam.location = Vector((-0.55, -0.9, 6.0)); look(cam, (0, 0, 0))
bpy.context.view_layer.update()
# ขอบเขตตัวอักษรในมุมกล้อง → กำหนดขนาดภาพ
inv = cam.matrix_world.inverted()
pts = [inv @ (o.matrix_world @ Vector(c)) for o in curves for c in o.bound_box]
x0, x1 = min(p.x for p in pts), max(p.x for p in pts); y0, y1 = min(p.y for p in pts), max(p.y for p in pts)
pad = 0.04 * (x1 - x0); w, h = x1 - x0 + 2 * pad, y1 - y0 + 2 * pad
cam.location = cam.matrix_world @ Vector(((x0 + x1) / 2, (y0 + y1) / 2, 0))
cam_d.ortho_scale = max(w, h)
W = 1600
sc.render.resolution_x, sc.render.resolution_y = (W, round(W * h / w)) if w >= h else (round(W * w / h), W)

try: sc.render.engine = 'BLENDER_EEVEE'
except TypeError: sc.render.engine = 'BLENDER_EEVEE_NEXT'
try: sc.eevee.taa_render_samples = 128
except AttributeError: pass
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'   # สีตรงแบรนด์ (AgX ทำซีด)
world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True
bg = world.node_tree.nodes['Background']; bg.inputs[0].default_value = (.03, .03, .08, 1); bg.inputs[1].default_value = 1

sc.render.image_settings.color_mode = 'RGBA'
sc.render.image_settings.file_format = 'PNG'
sc.render.filepath = os.path.join(out, 'logo-3d-night.png')
bpy.ops.render.render(write_still=True)
img = bpy.data.images.load(sc.render.filepath)
sc.render.image_settings.file_format = 'WEBP'; sc.render.image_settings.quality = 90
img.save_render(os.path.join(out, 'logo-3d-night.webp'), scene=sc)
print('wrote', sc.render.filepath, sc.render.resolution_x, sc.render.resolution_y)
