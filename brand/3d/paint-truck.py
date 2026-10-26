# ลงสีรถจากโลโก้ (โทนหม่น ไม่ฉูดฉาด) + แยกล้อเป็นชิ้น หมุนได้ + เรนเดอร์ตรวจ + ส่งออก GLB เบา
# รัน: "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P brand/3d/paint-truck.py -- <ต้นฉบับ Meshy .glb> brand/3d/truck-logo.glb <โฟลเดอร์รูปตรวจ>
# ต้นฉบับ: Desktop/Meshy_AI_Mobile_Scrap_Heap_1026144755_generate.glb (611k หน้า 14.7 MB ไม่เก็บใน repo)
# ผล: ย่อเหลือ ~61k หน้า · บีบ Draco · วัตถุ body + wheel_FL/FR/BL/BR (จุดหมุนกลางล้อ) · หน้ารถ = -X ใน Blender
import bpy, bmesh, sys, math, os
from mathutils import Vector
a = sys.argv[sys.argv.index('--') + 1:]
src, out_glb, out_dir = a[0], a[1], a[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
o = [x for x in bpy.context.scene.objects if x.type == 'MESH'][0]
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
m = o.modifiers.new('d', 'DECIMATE'); m.ratio = 0.1
bpy.ops.object.modifier_apply(modifier='d')
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))

PAL = {   # โทนหม่น เข้ากับ "เรียบหรู + ฟ้าเย็น"
    'body':   '#e9e1d1',  # ครีม
    'trim':   '#8f8a80',  # กันชน/ขอบล่าง เทาอุ่น
    'tyre':   '#2a2a2f',
    'rim':    '#bdb8ae',
    'shirt':  '#4b5872',  # คนขับ เสื้อน้ำเงินหม่น
    'skin':   '#c99a76',
    'hat':    '#5e4636',
    'bike':   '#7fa64a',  # เขียว GO แบบหม่น (จุดเดียวที่ใช้สีแบรนด์)
    'ladder': '#c4a57a',  # ไม้อ่อน
    'chair':  '#a8664a',  # ส้มอิฐหม่น
    'plant':  '#5d7350',
    'pot':    '#9a5d43',
}
def mat(name, hexc):
    mt = bpy.data.materials.new(name)
    c = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lin = [(x / 12.92) if x <= 0.04045 else ((x + .055) / 1.055) ** 2.4 for x in c]
    mt.diffuse_color = (*lin, 1)
    mt.use_nodes = True
    b = mt.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*lin, 1)
    b.inputs['Roughness'].default_value = .85 if name == 'tyre' else .55
    return mt
names = list(PAL)
o.data.materials.clear()
for n in names: o.data.materials.append(mat(n, PAL[n]))
I = {n: i for i, n in enumerate(names)}

bm = bmesh.new(); bm.from_mesh(o.data)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
# หาชิ้นที่ไม่ติดกัน
comp_of = {}; comps = []
for v in bm.verts:
    if v.index in comp_of: continue
    cid = len(comps); stack = [v]; comp_of[v.index] = cid; lst = []
    while stack:
        c = stack.pop(); lst.append(c)
        for e in c.link_edges:
            w = e.other_vert(c)
            if w.index not in comp_of: comp_of[w.index] = cid; stack.append(w)
    comps.append(lst)
def bbox(vs):
    xs = [v.co.x for v in vs]; ys = [v.co.y for v in vs]; zs = [v.co.z for v in vs]
    return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))
info = [(i, len(c), bbox(c)) for i, c in enumerate(comps)]
main = max(info, key=lambda t: t[1])[0]
kind = {}; wc = {}
for i, n, (x0, x1, y0, y1, z0, z1) in info:
    if i == main: kind[i] = 'main'
    elif z0 < .02 and z1 < .65 and (x1 - x0) < .7:
        kind[i] = 'wheel'; wc[i] = (Vector(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)), (z1 - z0) / 2)
    elif x0 > 1.8: kind[i] = 'bumper'      # กันชนท้าย (หน้ารถ = -X)
    elif z1 > 1.5: kind[i] = 'plant'       # ลำต้น+ใบ
    else: kind[i] = 'driver'               # ตัวคนขับ
print('KINDS', [(i, kind[i], n, [round(v, 2) for v in b]) for i, n, b in info])

for f in bm.faces:
    c = f.calc_center_median(); ci = comp_of[f.verts[0].index]; k = kind[ci]
    if k == 'wheel':
        ctr, r = wc[ci]
        f.material_index = I['rim'] if math.hypot(c.x - ctr.x, c.z - ctr.z) < r * .55 else I['tyre']
    elif k == 'bumper': f.material_index = I['trim']
    elif k == 'plant': f.material_index = I['plant']
    elif k == 'driver': f.material_index = I['shirt']
    else:
        # ก้อนหลัก (หน้ารถ = -X · ท้ายกระบะ = +X) ตำแหน่งวัดจากภาพมุมข้าง
        lx0, lz0, lx1, lz1 = 0.50, 1.92, 1.46, 0.875          # แนวกลางบันได
        dx, dz = lx1 - lx0, lz1 - lz0; L = math.hypot(dx, dz)
        dl = abs((c.x - lx0) * dz - (c.z - lz0) * dx) / L
        if -0.65 < c.x < -0.12 and -0.3 < c.y < 0.6 and 0.70 < c.z < 1.2:    # คนขับ (หัว + ตัว)
            f.material_index = I['hat'] if c.z > 1.02 else I['skin'] if c.z > 0.9 else I['shirt']
        elif c.x < -1.95 and c.z < 0.45: f.material_index = I['trim']        # กันชนหน้า
        elif c.x < 0.0 or c.z < 0.9: f.material_index = I['body']
        elif c.x < 0.36 and 0.9 < c.z < 1.3: f.material_index = I['pot']
        elif dl < 0.17 and c.z > 0.85: f.material_index = I['ladder']
        elif c.x > 0.88: f.material_index = I['bike']
        else: f.material_index = I['chair']
bm.to_mesh(o.data); bm.free()

# แยกชิ้น → ล้อเป็นวัตถุของตัวเอง (จุดหมุน = ศูนย์กลางล้อ) ที่เหลือรวมเป็น body
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
sc = bpy.context.scene
for p in [x for x in sc.objects if x.type == 'MESH']:
    pts = [p.matrix_world @ v.co for v in p.data.vertices]
    x0 = min(q.x for q in pts); x1 = max(q.x for q in pts); y0 = min(q.y for q in pts); y1 = max(q.y for q in pts)
    z0 = min(q.z for q in pts); z1 = max(q.z for q in pts)
    if z0 < .02 and z1 < .65 and (x1 - x0) < .7:
        p.name = 'wheel_' + ('B' if x0 > 0 else 'F') + ('L' if (y0 + y1) > 0 else 'R')
        sc.cursor.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
        bpy.ops.object.select_all(action='DESELECT'); p.select_set(True); bpy.context.view_layer.objects.active = p
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
rest = [p for p in sc.objects if p.type == 'MESH' and not p.name.startswith('wheel_')]
bpy.ops.object.select_all(action='DESELECT')
for p in rest: p.select_set(True)
bpy.context.view_layer.objects.active = rest[0]; bpy.ops.object.join(); bpy.context.object.name = 'body'
print('OBJECTS', [(x.name, [round(v, 3) for v in x.location]) for x in sc.objects if x.type == 'MESH'])

# เรนเดอร์ตรวจ (Workbench เร็ว ใช้สีวัสดุ)
sc.render.engine = 'BLENDER_WORKBENCH'
sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'MATERIAL'
sc.display.shading.show_cavity = True
sc.render.resolution_x, sc.render.resolution_y = 1200, 600
sc.world = bpy.data.worlds.new('w'); sc.world.color = (0.18, 0.14, 0.3)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
def shot(name, loc, rot, ortho=None):
    cam.location = loc; cam.rotation_euler = [math.radians(r) for r in rot]
    if ortho: cam.data.type = 'ORTHO'; cam.data.ortho_scale = ortho
    else: cam.data.type = 'PERSP'; cam.data.lens = 40
    sc.render.filepath = os.path.join(out_dir, name + '.png'); bpy.ops.render.render(write_still=True)
shot('side', (0, -10, 1.0), (90, 0, 0), 5.0)          # มองจาก -Y: หน้ารถไปทางขวา (เหมือนโลโก้)
shot('side2', (0, 10, 1.0), (90, 0, 180), 5.0)
shot('q34', (6.0, -6.5, 3.4), (70, 0, 43))
shot('rear', (-6.5, -5.0, 3.4), (70, 0, -52))

bpy.ops.object.select_all(action='DESELECT')
for x in sc.objects:
    if x.type == 'MESH': x.select_set(True)
bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB', use_selection=True,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7)
print('GLB KB', os.path.getsize(out_glb) // 1024)
