# ทดลองโลโก้ตัวอักษร 3D: SVG → เส้นโค้ง → ยกนูน + ลบมุม → เรนเดอร์ 3 ลุค
# รัน: "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P brand/3d/logo3d.py -- brand/ref-logos/logo-wordmark.svg brand/3d/logo-renders
import bpy, sys, math, os, re, tempfile
from mathutils import Vector

svg, out = sys.argv[sys.argv.index('--') + 1:][:2]
out = os.path.abspath(out); os.makedirs(out, exist_ok=True)
# ตัวนำเข้า SVG ของ Blender อ่าน fill:var(--x,#hex) ไม่ได้ → แปลงเป็น #hex ในไฟล์ชั่วคราว
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
print('curves:', [(o.name, len(o.data.splines)) for o in curves])

# จัดขนาด: กว้าง 4 ม. กลางจุดศูนย์
def bbox(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)])
    hi = Vector([max(p[i] for p in pts) for i in range(3)])
    return lo, hi
lo, hi = bbox(curves)
s = 4.0 / (hi.x - lo.x)
ctr = (lo + hi) / 2
for o in curves:
    o.location = (o.location - ctr) * s
    o.scale = o.scale * s
bpy.context.view_layer.update()

EXT, BEV = 0.07, 0.006
for o in curves:
    d = o.data
    d.dimensions = '2D'
    d.fill_mode = 'BOTH'
    d.extrude = EXT / s          # ค่าในหน่วยของวัตถุ (ก่อนย่อ)
    d.bevel_depth = BEV / s
    d.bevel_resolution = 4
    d.offset = -BEV / s          # ลบมุมเข้าด้านใน ไม่ให้ตัวหนาขึ้น
    d.resolution_u = 12
# แยกตามสีที่ importer อ่านได้: ตัวแรก = หมึก, ตัวที่สอง = GO
def is_go(o):
    m = o.data.materials[0] if o.data.materials else None
    if m: c = m.diffuse_color; return c[1] > c[0] * 1.5
    return False
ink = [o for o in curves if not is_go(o)]
go = [o for o in curves if is_go(o)]
print('ink', [o.name for o in ink], 'go', [o.name for o in go])

def mat(name, base, rough=0.5, metal=0.0, emit=None, estr=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if coat: b.inputs['Coat Weight'].default_value = coat
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = estr
    return m
def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c)
def setmat(objs, m):
    for o in objs:
        o.data.materials.clear(); o.data.materials.append(m)

# พื้นหลังเป็นแผ่นโค้ง (ฉากถ่ายสตูดิโอ) วางหลังตัวอักษร
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -EXT - 0.001))
wall = bpy.context.object

# ตัวอักษรตั้งบนผนัง (นูนออกมาทางกล้อง): ผนัง = ระนาบ XY, กล้องมองลง -Z
cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 50
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
def look(obj, target, up=Vector((0, 1, 0))):
    # ตั้งกล้อง/ไฟให้มองเป้า โดยให้ "ข้างบน" ของภาพ = แกน Y ของโลก (หัวตัวอักษร)
    from mathutils import Matrix
    f = (Vector(target) - obj.location).normalized()
    r = f.cross(up).normalized(); u = r.cross(f)
    obj.rotation_euler = Matrix((r, u, -f)).transposed().to_euler()

def light(name, kind, loc, energy, color=(1, 1, 1), size=1.0):
    d = bpy.data.lights.new(name, kind); d.energy = energy; d.color = color
    if kind == 'AREA': d.size = size
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o)
    o.location = loc; look(o, (0, 0, 0)); return o

try: sc.render.engine = 'BLENDER_EEVEE'
except TypeError: sc.render.engine = 'BLENDER_EEVEE_NEXT'
sc.render.resolution_x, sc.render.resolution_y = 1600, 900
sc.view_settings.view_transform = 'AgX'
world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True
bg = world.node_tree.nodes['Background']

def clear_lights():
    for o in [o for o in sc.objects if o.type == 'LIGHT']: bpy.data.objects.remove(o)

LOOKS = {
  # 1 ครีมด้าน บนผนังขาวอุ่น — ตัวป้ายนูนแบบป้ายร้านหน้าตึก กลางวัน
  'a-cream': dict(wall='#efe8dc', ink=mat('ink_a', srgb('#2a2440'), .55),
                  go=mat('go_a', srgb('#6fc22a'), .45), world=(.9, .88, .85), wstr=.6,
                  lights=[('key', 'AREA', (-3, -2, 5), 900, (1, .96, .9), 4),
                          ('rim', 'AREA', (4, 3, 3), 300, (1, 1, 1), 3)]),
  # 2 ป้ายไฟกลางคืน — ผนังกรมท่า ตัวหนังสือขาวเรืองแสง GO เขียวเรือง
  'b-night': dict(wall='#17133a', ink=mat('ink_b', srgb('#f6f1e7'), .4, emit=srgb('#fff1d6'), estr=.9),
                  go=mat('go_b', srgb('#84e62d'), .35, emit=srgb('#84e62d'), estr=1.6), world=(.03, .03, .08), wstr=1,
                  bloom=True,
                  lights=[('key', 'AREA', (-3, -3, 4), 250, (.55, .6, 1), 4),
                          ('warm', 'AREA', (0, -3, 1.5), 300, (1, .7, .4), 6)]),
  # 3 โลหะทอง + เขียวเคลือบเงา บนผนังดำ — แบบหรู
  'c-brass': dict(wall='#1a1814', ink=mat('ink_c', srgb('#d9b779'), .25, metal=1),
                  go=mat('go_c', srgb('#84e62d'), .2, coat=1), world=(.5, .45, .4), wstr=.35,
                  lights=[('key', 'AREA', (-4, -3, 4), 900, (1, .92, .8), 5),
                          ('rim', 'AREA', (4, 2, 2.5), 500, (1, 1, 1), 2),
                          ('top', 'AREA', (0, 3, 6), 300, (1, 1, 1), 6)]),
}
cams = {'front': (Vector((0.0, -0.4, 6.2)), (0, 0, 0)),
        'angle': (Vector((-2.6, -0.7, 6.6)), (-0.35, -0.05, 0))}

def set_bloom(on):
    sc.render.use_compositing = on
    if not on: return
    ng = sc.compositing_node_group
    if ng is None:
        ng = bpy.data.node_groups.new('comp', 'CompositorNodeTree'); sc.compositing_node_group = ng
        ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
        rl = ng.nodes.new('CompositorNodeRLayers'); gl = ng.nodes.new('CompositorNodeGlare')
        go_ = ng.nodes.new('NodeGroupOutput')
        print('glare inputs:', [(i.name, getattr(i, 'default_value', None)) for i in gl.inputs])
        for k, v in (('Type', 'Bloom'), ('Quality', 'High'), ('Threshold', .6), ('Strength', .7), ('Size', .6)):
            if k in gl.inputs:
                try: gl.inputs[k].default_value = v
                except Exception as e: print('glare', k, e)
        ng.links.new(rl.outputs['Image'], gl.inputs['Image'])
        ng.links.new(gl.outputs['Image'], go_.inputs[0])

for name, L in LOOKS.items():
    clear_lights()
    set_bloom(L.get('bloom', False))
    setmat([wall], mat('wall_' + name, srgb(L['wall']), .85))
    setmat(ink, L['ink']); setmat(go, L['go'])
    bg.inputs[0].default_value = (*L['world'], 1); bg.inputs[1].default_value = L['wstr']
    for args in L['lights']: light(*args)
    for cn, (loc, tgt) in cams.items():
        cam.location = loc; look(cam, tgt)
        sc.render.filepath = os.path.join(out, f'{name}-{cn}.png')
        bpy.ops.render.render(write_still=True)
        print('wrote', sc.render.filepath)

