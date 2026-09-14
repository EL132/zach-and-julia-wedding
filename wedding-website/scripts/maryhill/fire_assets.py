"""Small exportable hearth fire. Flame pivots remain separate for the viewer."""
import math
import bpy
from mathutils import Vector


def _material(name, color, emission=0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    shader = material.node_tree.nodes.get('Principled BSDF')
    srgb = [int(color[i:i+2], 16)/255 for i in (0, 2, 4)]
    linear = tuple(c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4 for c in srgb)
    material.diffuse_color = (*linear, 1)
    shader.inputs['Base Color'].default_value = (*linear, 1)
    shader.inputs['Roughness'].default_value = .9
    if emission:
        shader.inputs['Emission Color'].default_value = (*linear, 1)
        shader.inputs['Emission Strength'].default_value = emission
    return material


def _log(name, a, b, radius, material):
    a, b = Vector(a), Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=radius, depth=(b-a).length,
                                      location=(a+b)*.5)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = (b-a).to_track_quat('Z', 'Y').to_euler()
    obj.data.materials.append(material)
    return obj


def _tongue(name, radius, height, bend, material, parent):
    # A rounded base narrows into a curved tip; no billboard follows the camera.
    rings = [(0, .58), (.18, 1), (.48, .76), (.75, .4), (1, .015)]
    vertices = []
    for t, r in rings:
        for i in range(8):
            angle = i*math.tau/8
            vertices.append((radius*r*math.cos(angle)+bend*t*t,
                             radius*r*.7*math.sin(angle), height*t))
    faces = [tuple(range(7, -1, -1))]
    for ring in range(len(rings)-1):
        for i in range(8):
            j = (i+1) % 8
            faces.append((ring*8+i, ring*8+j, (ring+1)*8+j, (ring+1)*8+i))
    faces.append(tuple(range(32, 40)))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(material)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    return obj


def build_fireplace_fire(origin=(-10.45, 1.85, .645)):
    """Fit entirely between the existing green hearth and copper hood."""
    ox, oy, oz = origin
    charcoal = _material('Hearth charcoal', '30291f')
    ember = _material('Hearth embers', 'a34318', .6)
    flame = _material('HearthFlame amber', 'f98922', 1.6)
    core = _material('HearthFlame gold', 'ffd78c', 2.0)
    objects = []
    for i, (a, b) in enumerate([
        ((-.24, -.13, 0), (.24, -.05, .035)),
        ((-.20, .13, .012), (.23, .06, .035)),
        ((-.13, -.19, .062), (.13, .18, .067)),
    ]):
        a = tuple(v+o for v, o in zip(a, origin))
        b = tuple(v+o for v, o in zip(b, origin))
        objects.append(_log('Hearth charred log', a, b, .045, charcoal))
    for i in range(8):
        a = i*math.tau/8
        x, y = ox+.14*math.cos(a), oy+.10*math.sin(a)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.031,
                                            location=(x, y, oz+.043))
        obj = bpy.context.object
        obj.name = 'Hearth glowing ember'
        obj.scale = (1, .8, .45)
        obj.data.materials.append(ember)
        objects.append(obj)
    for i, (x, y, h, r, bend) in enumerate([
        (-.13, -.045, .23, .047, .035), (.02, .06, .31, .056, -.045),
        (.13, -.015, .255, .052, .025), (-.055, -.075, .28, .058, -.028),
        (.055, -.04, .19, .042, .034),
    ]):
        pivot = bpy.data.objects.new(f'HearthFlameRoot_{i:02d}', None)
        bpy.context.collection.objects.link(pivot)
        pivot.location = (ox+x, oy+y, oz+.05)
        pivot['preserve_animation'] = True
        objects.append(pivot)
        objects.append(_tongue(f'Hearth fire amber {i}', r, h, bend, flame, pivot))
        # Offset toward the opening so the warmer core is visible from outside.
        obj = _tongue(f'Hearth fire gold {i}', r*.5, h*.68, bend*.55, core, pivot)
        obj.location.y = -.018
        objects.append(obj)
    return objects
