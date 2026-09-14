"""A hollow, glass-fronted miniature sauna beside Maryhill's hot spring.

Coordinates are Blender Z-up. The east (+X) facade is the transparent front;
the timber back/side walls and roof are actual thin shells. Each returned mesh
has a single PBR material, so the estate export can batch the opaque geometry.
No scene, camera, render, or export settings are changed by this module.
"""

import bpy
import math
import random
from collections import defaultdict
import garden_assets as G


def _linear(hex_color):
    color = [int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in color)


def _materials():
    specs = {
        'cedar': ('775136', .84, 0),
        'cedar_light': ('916346', .80, 0),
        'cedar_dark': ('513c2d', .88, 0),
        'honey': ('c68d4c', .82, 0),
        'honey_light': ('dca66b', .80, 0),
        'honey_dark': ('ad7540', .84, 0),
        'slate': ('364441', .73, .05),
        'metal': ('414947', .48, .65),
        'stone': ('686861', .94, 0),
        'stone_light': ('929187', .92, 0),
        'linen': ('e9debe', .94, 0),
        'amber': ('ffbd65', .44, 0),
        'glass': ('d2e4d9', .10, 0),
    }
    result = {}
    for key, (color, roughness, metallic) in specs.items():
        name = 'SaunaGlass' if key == 'glass' else 'Maryhill sauna / ' + key
        material = bpy.data.materials.get(name)
        if material is None:
            material = bpy.data.materials.new(name)
            material.use_nodes = True
            shader = material.node_tree.nodes.get('Principled BSDF')
            rgba = (*_linear(color), .10 if key == 'glass' else 1)
            material.diffuse_color = rgba
            shader.inputs['Base Color'].default_value = rgba
            shader.inputs['Roughness'].default_value = roughness
            shader.inputs['Metallic'].default_value = metallic
            if key == 'glass':
                shader.inputs['Alpha'].default_value = .10
                shader.inputs['IOR'].default_value = 1.45
                material.surface_render_method = 'DITHERED'
                material.use_backface_culling = False
            if key == 'amber':
                shader.inputs['Emission Color'].default_value = (*_linear('ffb457'), 1)
                shader.inputs['Emission Strength'].default_value = 2.2
        result[key] = material
    return result


class _Parts:
    def __init__(self):
        self.data = defaultdict(lambda: [[], [], []])

    def add(self, material, vertices, faces, smooth=False):
        verts, polys, shading = self.data[material]
        offset = len(verts)
        verts.extend(tuple(v) for v in vertices)
        polys.extend(tuple(i + offset for i in f) for f in faces)
        shading.extend([smooth] * len(faces))

    def emit(self, origin):
        materials = _materials()
        objects = []
        for material, (verts, faces, shading) in self.data.items():
            mesh = bpy.data.meshes.new('Sauna / ' + material)
            mesh.from_pydata([(x + origin[0], y + origin[1], z + origin[2]) for x, y, z in verts], [], faces)
            mesh.materials.append(materials[material])
            mesh.update()
            obj = bpy.data.objects.new('Sauna / ' + material, mesh)
            bpy.context.collection.objects.link(obj)
            for polygon, smooth in zip(mesh.polygons, shading):
                polygon.use_smooth = smooth
            objects.append(obj)
        return objects


def _box(p, material, center, size):
    x, y, z = center
    w, d, h = (v / 2 for v in size)
    vertices = [(x + a, y + b, z + c) for a, b, c in
                [(-w, -d, -h), (w, -d, -h), (w, d, -h), (-w, d, -h),
                 (-w, -d, h), (w, -d, h), (w, d, h), (-w, d, h)]]
    p.add(material, vertices, [(0, 3, 2, 1), (0, 1, 5, 4), (1, 2, 6, 5),
                              (2, 3, 7, 6), (3, 0, 4, 7), (4, 5, 6, 7)])


def _ring(p, material, x, y, z, radius, thickness=.01, sides=16):
    for i in range(sides):
        a, b = i * math.tau / sides, (i + 1) * math.tau / sides
        G._tube(p, material, (x + radius * math.cos(a), y + radius * math.sin(a), z),
                (x + radius * math.cos(b), y + radius * math.sin(b), z), thickness, sides=5)


def build_sauna(origin=(-18.4, -6.0, 0)):
    """Return 13 meshes for a 1.64 × 2.55 m timber sauna, roof at Z=1.67.

    Discovery camera (glTF Y-up): target [-18.38, .79, 6.0], with an offset
    [4.35, 1.10, 1.10]. This low east-side angle reveals the interior through
    the glass front. Door and window are single planes to avoid alpha overlap.
    """
    p = _Parts()
    rng = random.Random(619)

    # Raised stone plinth, floor boards, and a small deck on the pool side.
    _box(p, 'slate', (0, 0, .075), (1.64, 2.55, .15))
    for i in range(16):
        _box(p, 'honey_light' if i % 4 else 'honey', (.025, -1.15 + i * .153, .169),
             (1.48, .146, .039))
    for i in range(4):
        _box(p, 'cedar_light' if i % 2 else 'cedar', (.86 + i * .145, 0, .10), (.138, 2.46, .11))
    _box(p, 'slate', (1.08, 0, .033), (.61, 2.48, .043))

    # Thin dark backings create visible grooves between the exterior slats.
    _box(p, 'cedar_dark', (-.777, 0, .89), (.067, 2.45, 1.43))
    for side in (-1, 1):
        _box(p, 'cedar_dark', (0, side * 1.208, .89), (1.57, .067, 1.43))
        for i in range(17):
            _box(p, ('cedar', 'cedar_light', 'cedar')[i % 3],
                 (-.756 + i * .092, side * 1.253, .89), (.081, .031, 1.43))
    for i in range(26):
        _box(p, ('cedar', 'cedar_light', 'cedar_dark')[i % 3],
             (-.822, -1.193 + i * .095, .89), (.032, .083, 1.43))

    # Honey-colored horizontal interior boards, including the visible rear wall.
    for i in range(13):
        z = .22 + i * .103
        timber = ('honey', 'honey_light', 'honey', 'honey_dark')[i % 4]
        _box(p, timber, (-.726, 0, z), (.028, 2.365, .096))
        for side in (-1, 1):
            _box(p, timber, (.01, side * 1.166, z), (1.45, .029, .096))
    for i in range(15):
        _box(p, 'honey_dark' if i % 3 else 'honey', (.015, -1.10 + i * .157, 1.535),
             (1.48, .15, .035))
    _box(p, 'slate', (-.01, 0, 1.62), (1.82, 2.71, .105))
    _box(p, 'cedar_dark', (.84, 0, 1.555), (.075, 2.60, .082))

    # Upper bench against the rear wall and lower step, with individually
    # separated boards. The open legs let the amber strip read beneath it.
    for x, z, width in ((-.474, .676, .465), (-.09, .407, .39)):
        for y in (-.995, .74):
            for leg_x in (x - width / 2 + .04, x + width / 2 - .04):
                _box(p, 'honey_dark', (leg_x, y, (.19 + z) / 2), (.046, .055, z - .19))
        for i in range(5):
            xx = x - width / 2 + width * (i + .5) / 5
            _box(p, 'honey_light' if i % 2 else 'honey', (xx, -.13, z), (width / 5 - .012, 1.95, .046))
        _box(p, 'honey_dark', (x + width / 2 - .013, -.13, z - .065), (.025, 1.96, .085))
    for z in (.90, 1.035):
        _box(p, 'honey_light', (-.684, -.15, z), (.042, 1.97, .079))
    # Hidden warm strips sit just beneath the bench and behind the backrest.
    _box(p, 'amber', (-.261, -.13, .63), (.018, 1.83, .012))
    _box(p, 'amber', (-.706, -.15, 1.093), (.012, 1.88, .014))
    _box(p, 'amber', (.697, 1.13, 1.39), (.045, .025, .12))
    _box(p, 'cedar_dark', (.725, 1.10, 1.39), (.024, .034, .155))

    # Stone-filled heater behind a low timber guard at the right-hand end.
    hx, hy = .37, .79
    _box(p, 'slate', (hx, hy, .21), (.47, .55, .052))
    _box(p, 'metal', (hx, hy, .39), (.29, .34, .33))
    for side in (-1, 1):
        for i in range(6):
            _box(p, 'slate', (hx + side * .15, hy - .13 + i * .052, .405), (.012, .019, .24))
    for i in range(18):
        xx, yy = hx + rng.uniform(-.125, .125), hy + rng.uniform(-.15, .15)
        zz = .572 + rng.uniform(-.01, .061)
        G._ellipsoid(p, 'stone_light' if i % 4 == 0 else 'stone', (xx, yy, zz),
                     (rng.uniform(.035, .057), rng.uniform(.031, .052), rng.uniform(.030, .049)),
                     rng, seg=7, rings=4, noise=.13)
    for x in (.105, .655):
        for y in (.51, 1.06):
            _box(p, 'honey_dark', (x, y, .418), (.034, .034, .45))
    for z in (.475, .61):
        _box(p, 'honey', (.665, .785, z), (.032, .585, .035))
        _box(p, 'honey', (.38, .50, z), (.60, .032, .035))

    # An open stave bucket with bands and a resting ladle on the lower bench.
    bx, by, bz = -.045, -.78, .434
    G._tube(p, 'honey_dark', (bx, by, bz), (bx, by, bz + .012), .078, sides=16)
    for i in range(16):
        a, b = i * math.tau / 16, (i + 1) * math.tau / 16
        ro, ri = .092, .076
        vertices = [(bx + r * math.cos(t), by + r * math.sin(t), z)
                    for z, r in ((bz, .071), (bz + .125, ro), (bz + .125, ri), (bz + .015, .057))
                    for t in (a + .012, b - .012)]
        p.add('honey_light' if i % 3 else 'honey', vertices,
              [(0, 1, 3, 2), (2, 3, 5, 4), (4, 5, 7, 6), (0, 2, 4, 6), (1, 7, 5, 3)])
    _ring(p, 'metal', bx, by, bz + .026, .076, .0055)
    _ring(p, 'metal', bx, by, bz + .102, .089, .0055)
    G._tube(p, 'honey_dark', (bx - .065, by, bz + .115), (bx + .19, by + .06, bz + .206), .012, sides=7)
    G._ellipsoid(p, 'honey_dark', (bx - .065, by, bz + .112), (.046, .035, .016), seg=9, rings=5, noise=0)
    _ring(p, 'honey_light', bx - .065, by, bz + .129, .031, .006, 12)
    # Folded linen on the upper bench, with its edge softened into a roll.
    _box(p, 'linen', (-.48, -.73, .728), (.285, .36, .048))
    G._tube(p, 'linen', (-.355, -.89, .752), (-.355, -.57, .752), .033, sides=10)

    # Narrow bronze front frame and distinct window/door panes. Only the glass
    # is transparent: no opaque box fills the room or sits behind the opening.
    for y in (-1.188, -.265, 1.188):
        _box(p, 'metal', (.79, y, .87), (.038, .036, 1.39))
    for z in (.193, 1.55):
        _box(p, 'metal', (.79, 0, z), (.038, 2.39, .034))
    for ymin, ymax in ((-1.17, -.286), (-.244, 1.17)):
        p.add('glass', [(.793, ymin, .213), (.793, ymax, .213), (.793, ymax, 1.529), (.793, ymin, 1.529)],
              [(0, 1, 2, 3)])
    # Door pull, matching opposite timber grip, and two small hinge plates.
    for z in (.695, .935):
        G._tube(p, 'metal', (.795, -.383, z), (.862, -.383, z), .013, sides=8)
    G._tube(p, 'honey_light', (.86, -.383, .666), (.86, -.383, .965), .023, sides=10)
    G._tube(p, 'honey_light', (.741, -.383, .666), (.741, -.383, .965), .019, sides=10)
    for z in (.38, 1.32):
        _box(p, 'metal', (.81, -1.165, z), (.035, .09, .065))

    return p.emit(origin)
