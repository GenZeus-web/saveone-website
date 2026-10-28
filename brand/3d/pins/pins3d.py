# หมุด 3D 4 แบบให้เจ้าของเลือก → ภาพเทียบ + ภาพใกล้ทีละแบบ + .glb (ไว้ใช้ในเว็บ ทาสีตามชนิดในเว็บเอง)
# รัน: "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P brand/3d/pins/pins3d.py
#   A หมุดหยดน้ำ · B โคมตลาดบนเสาแขวน · C ป้ายปักตลาด · D เหรียญลอย
import bpy, os, math
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
ICON = os.path.join(HERE, 'icons')
REN = os.path.join(HERE, 'renders'); os.makedirs(REN, exist_ok=True)
GLB = os.path.join(HERE, 'glb'); os.makedirs(GLB, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

KIND = {'food': '#ff8a3d', 'boot': '#b48cf0', 'event': '#2cc9b5', 'park': '#5aaeea', 'spot': '#f6f1e7'}
ICON_OF = {'food': 'food', 'boot': 'boot', 'event': 'event', 'park': 'park', 'spot': 'spot'}


def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c)


MATS = {}
def mat(name, col, rough=.4, metal=0., emit=0., emit_col=None):
    k = (name, col, rough, metal, emit)
    if k in MATS: return MATS[k]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*lin(col), 1)
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*lin(emit_col or col), 1)
        b.inputs['Emission Strength'].default_value = emit
    MATS[k] = m; return m


def icon_mat(kind):
    k = ('icon', kind)
    if k in MATS: return MATS[k]
    m = bpy.data.materials.new('icon'); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(ICON, ICON_OF[kind] + '.png'))
    nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha'])
    b.inputs['Roughness'].default_value = .5
    nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = .35   # ไอคอนสว่างนิดๆ อ่านออกตอนค่ำ
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    MATS[k] = m; return m


def obj(o, m, coll, smooth=True):
    o.data.materials.clear(); o.data.materials.append(m)
    if smooth and hasattr(o.data, 'polygons'):
        for p in o.data.polygons: p.use_smooth = True
    for c in o.users_collection: c.objects.unlink(o)
    coll.objects.link(o); return o


def bevel(o, w, seg=4):
    md = o.modifiers.new('bev', 'BEVEL'); md.width = w; md.segments = seg; md.limit_method = 'ANGLE'
    return o


A = bpy.ops.mesh
def sphere(r, loc, scale=(1, 1, 1)):
    A.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24); o = bpy.context.object; o.scale = scale; return o
def cyl(r, h, loc, rot=(0, 0, 0), v=48):
    A.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=v); return bpy.context.object
def cone(r1, r2, h, loc, rot=(0, 0, 0)):
    A.primitive_cone_add(radius1=r1, radius2=r2, depth=h, location=loc, rotation=rot, vertices=48); return bpy.context.object
def box(sx, sy, sz, loc):
    A.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.scale = (sx, sy, sz); return o
def torus(R, r, loc, rot=(0, 0, 0)):
    A.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=64, minor_segments=12); return bpy.context.object
def face(size, loc):   # แผ่นไอคอน หันเข้ากล้อง (−Y) · UV ตั้งตรง
    A.primitive_plane_add(size=size, location=loc, rotation=(math.pi / 2, 0, 0)); return bpy.context.object


CREAM, DARK, METAL, WOOD, GO = '#f6f1e7', '#2a2440', '#8d939b', '#5a3a26', '#84e62d'
X90 = (math.pi / 2, 0, 0)


def pin_a(kind, coll, at):   # หมุดหยดน้ำ: หัวกลม + ปลายแหลม + หน้าขาวมีไอคอน + วงเรืองที่พื้น
    x, y = at; col = KIND[kind]; body = mat('body', col, .28)
    obj(sphere(.34, (x, y, 1.0)), body, coll)
    obj(cone(.285, 0, .78, (x, y, .52), rot=(math.pi, 0, 0)), body, coll)
    obj(cyl(.25, .06, (x, y - .345, 1.0), rot=X90), mat("face", "#ffffff", .5), coll)
    obj(face(.36, (x, y - .38, 1.0)), icon_mat(kind), coll, False)
    obj(torus(.2, .018, (x, y, .01)), mat('glow', col, emit=3), coll)


def pin_b(kind, coll, at):   # โคมตลาด: เสาไม้ + แขนแขวน + โคมเรืองแสง + พู่
    x, y = at; col = KIND[kind]
    wood = mat('wood', WOOD, .7)
    obj(cyl(.035, 1.62, (x - .42, y, .81), v=16), wood, coll)
    obj(cyl(.025, .46, (x - .2, y, 1.6), rot=(0, math.pi / 2, 0), v=16), wood, coll)
    obj(cyl(.006, .14, (x, y, 1.53), v=8), mat('string', DARK, .8), coll)
    glow = mat('lantern', col, .5, emit=2.2)
    obj(sphere(.3, (x, y, 1.08), (1, 1, 1.22)), glow, coll)
    for i in range(6):   # ซี่โคม
        t = torus(.3, .011, (x, y, 1.08), rot=(math.pi / 2, 0, i * math.pi / 6)); t.scale = (1, 1, 1.22)
        obj(t, mat('rib', '#7a2f1f', .6), coll)
    for z in (1.46, .7):
        obj(cyl(.13, .07, (x, y, z)), mat('cap', '#3a2418', .5), coll)
    obj(cone(.07, 0, .22, (x, y, .55), rot=(math.pi, 0, 0)), mat('tassel', col, .6), coll)
    obj(face(.3, (x, y - .37, 1.08)), icon_mat(kind), coll, False)
    obj(torus(.2, .018, (x, y, .01)), mat('glow', col, emit=3), coll)


def pin_c(kind, coll, at):   # ป้ายปักตลาด: เสา + ป้ายสีขอบมน + แผ่นขาว + คิ้ว GO
    x, y = at; col = KIND[kind]
    obj(cyl(.035, 1.0, (x, y, .5), v=16), mat('metal', METAL, .35, .6), coll)
    obj(cyl(.12, .05, (x, y, .025)), mat('metal', METAL, .35, .6), coll)
    obj(bevel(box(.66, .07, .5, (x, y, 1.18)), .05), mat('body', col, .35), coll, False)
    obj(bevel(box(.52, .02, .36, (x, y - .04, 1.18)), .04), mat('face', '#ffffff', .5), coll, False)
    obj(face(.32, (x, y - .055, 1.18)), icon_mat(kind), coll, False)
    obj(bevel(box(.7, .09, .05, (x, y, 1.45)), .02), mat('go', GO, .4, emit=.6), coll, False)


def pin_d(kind, coll, at):   # เหรียญลอย: เหรียญหนาขอบมน + หน้าขาว + ปลายชี้ + เส้นแสงลงพื้น
    x, y = at; col = KIND[kind]; body = mat('body', col, .25, .1)
    obj(bevel(cyl(.33, .1, (x, y, 1.05), rot=X90), .03), body, coll)
    obj(cyl(.26, .03, (x, y - .05, 1.05), rot=X90), mat('face', '#ffffff', .5), coll)
    obj(face(.36, (x, y - .068, 1.05)), icon_mat(kind), coll, False)
    obj(cone(.1, 0, .16, (x, y, .66), rot=(math.pi, 0, 0)), body, coll)
    obj(cyl(.012, .56, (x, y, .3), v=8), mat('beam', col, emit=2.5), coll)
    obj(torus(.2, .018, (x, y, .01)), mat('glow', col, emit=3), coll)
    obj(cyl(.17, .004, (x, y, .006)), mat('pool', col, .9, emit=.8), coll)


DESIGNS = {'a': pin_a, 'b': pin_b, 'c': pin_c, 'd': pin_d}
NAMES = {'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D'}

# ── ฉาก: พื้นลานเย็นสีม่วงเทา (เหมือนในเว็บ) · ไฟอุ่นซ้าย + ฟ้าเย็นขวา ──
base = bpy.data.collections.new('base'); sc.collection.children.link(base)
A.primitive_plane_add(size=60, location=(0, 0, 0)); obj(bpy.context.object, mat('ground', '#4a4462', .9), base, False)
world = bpy.data.worlds.new('w'); sc.world = world
world.use_nodes = True; bg = world.node_tree.nodes['Background']
bg.inputs[0].default_value = (*lin('#241d4d'), 1); bg.inputs[1].default_value = .9


def light(name, kind, loc, energy, col, size=2):
    d = bpy.data.lights.new(name, kind); d.energy = energy; d.color = lin(col)
    if kind == 'AREA': d.size = size
    o = bpy.data.objects.new(name, d); base.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, .8)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
light('key', 'AREA', (-6, -6, 7), 1800, '#ffe0c4', 6)
light('rim', 'AREA', (6, 5, 5), 900, '#8f86c8', 6)

try: sc.render.engine = 'BLENDER_EEVEE'
except TypeError: sc.render.engine = 'BLENDER_EEVEE_NEXT'
sc.view_settings.view_transform = 'AgX'
sc.render.film_transparent = False
# เรืองแสงฟุ้ง (คอมโพสิเตอร์ Blender 5)
sc.render.use_compositing = True
ng = bpy.data.node_groups.new('comp', 'CompositorNodeTree'); sc.compositing_node_group = ng
ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
rl = ng.nodes.new('CompositorNodeRLayers'); gl = ng.nodes.new('CompositorNodeGlare'); out = ng.nodes.new('NodeGroupOutput')
for k, v in (('Type', 'Bloom'), ('Quality', 'High'), ('Threshold', .8), ('Strength', .55), ('Size', .5)):
    if k in gl.inputs:
        try: gl.inputs[k].default_value = v
        except Exception as e: print('glare', k, e)
ng.links.new(rl.outputs['Image'], gl.inputs['Image']); ng.links.new(gl.outputs['Image'], out.inputs[0])

cam_d = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_d); base.objects.link(cam); sc.camera = cam
def aim(loc, tgt, lens):
    cam.location = loc; cam_d.lens = lens
    cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


def text(s, loc, coll, size=.42):
    bpy.ops.object.text_add(location=loc, rotation=(math.radians(62), 0, 0)); t = bpy.context.object
    t.data.body = s; t.data.size = size; t.data.align_x = 'CENTER'; t.data.extrude = .01
    obj(t, mat('label', CREAM, .5, emit=.4), coll, False)


# ── ภาพเทียบ: 4 แบบ × 3 ชนิด (อาหาร · เปิดท้าย · ลานจอด) ──
SHOW = ['food', 'boot', 'park']
cols = {}
for i, (k, fn) in enumerate(DESIGNS.items()):
    c = bpy.data.collections.new('cmp_' + k); sc.collection.children.link(c); cols['cmp_' + k] = c
    cx = (i - 1.5) * 3.1
    for j, kind in enumerate(SHOW):
        fn(kind, c, (cx + (j - 1) * .95, (j % 2) * .35))
    text(NAMES[k], (cx, -1.25, .02), c)
# ── ภาพใกล้: แบบละ 5 สี ──
for k, fn in DESIGNS.items():
    c = bpy.data.collections.new('one_' + k); sc.collection.children.link(c); cols['one_' + k] = c
    for j, kind in enumerate(KIND):
        fn(kind, c, ((j - 2) * 1.05, 0))


def only(names):
    for n, c in cols.items(): c.hide_render = n not in names
    base.hide_render = False


sc.render.resolution_x, sc.render.resolution_y = 1920, 900
only(['cmp_' + k for k in DESIGNS]); aim((0, -12.5, 6.2), (0, 0, .7), 38)
sc.render.filepath = os.path.join(REN, 'compare.png'); bpy.ops.render.render(write_still=True); print('wrote compare')
sc.render.resolution_x, sc.render.resolution_y = 1600, 800
for k in DESIGNS:
    only(['one_' + k]); aim((0, -6.8, 3.0), (0, 0, .85), 40)
    sc.render.filepath = os.path.join(REN, f'pin-{k}.png'); bpy.ops.render.render(write_still=True); print('wrote', k)

# ── .glb: แบบละ 1 ตัวที่จุดศูนย์ สีขาว (เว็บทาสีตามชนิด) · แผ่นไอคอนชื่อวัสดุ "icon" ให้เว็บใส่ภาพเอง ──
for k, fn in DESIGNS.items():
    c = bpy.data.collections.new('glb_' + k); sc.collection.children.link(c)
    MATS.clear(); KIND['white'] = '#ffffff'; ICON_OF['white'] = 'park'
    fn('white', c, (0, 0))
    bpy.ops.object.select_all(action='DESELECT')
    for o in c.objects: o.select_set(True)
    bpy.context.view_layer.objects.active = c.objects[0]
    bpy.ops.export_scene.gltf(filepath=os.path.join(GLB, f'pin-{k}.glb'), use_selection=True, export_apply=True)
    print('glb', k)
