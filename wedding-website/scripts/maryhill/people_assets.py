"""Small, animated inhabitants for the Maryhill miniature (Blender 5.x).

build_people() adds meshes and parent empties without changing the camera, world,
frame range, or selection. Coordinates are Blender world coordinates (Z up).
Preserve every Animated_ / Julia_ / Zach_ / Tennis_ object during mesh merging and
export its parent empties. Animation is an eight-second loop at the scene FPS.
The GLTF viewer can play every exported clip together with one AnimationMixer.
"""

import math
import bpy
from mathutils import Vector

TAU = math.tau
_M = {}
_COLLECTION = None
_OBJECTS = []


def _linear(v):
    return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4


def _materials():
    specifications = {
        'skin': ('#d9ac89', .69, 0, 1),
        'hair': ('#30251f', .8, 0, 1),
        'suit': ('#263b37', .85, 0, 1),
        'lapel': ('#344d45', .75, 0, 1),
        'ivory': ('#fff3d9', .88, 0, 1),
        'silk': ('#e5d6b6', .65, 0, 1),
        'shoes': ('#322c26', .57, 0, 1),
        'veil': ('#fff4dc', .96, 0, .39),
        'tennis_green': ('#375f50', .83, 0, 1),
        'tennis_sand': ('#d6a272', .88, 0, 1),
        'racket': ('#163f32', .55, .2, 1),
        'strings': ('#d4cbb0', .72, 0, 1),
        'ball': ('#c6d75c', .9, 0, 1),
        'rose': ('#d9b4a2', .83, 0, 1),
        'leaf': ('#3d6940', .87, 0, 1),
    }
    for name, (hexcolor, roughness, metallic, alpha) in specifications.items():
        name_full = 'Maryhill people / ' + name
        mat = bpy.data.materials.get(name_full) or bpy.data.materials.new(name_full)
        mat.use_nodes = True
        color = tuple(_linear(int(hexcolor[i:i + 2], 16) / 255) for i in (1, 3, 5))
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Base Color'].default_value = (*color, 1)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Alpha'].default_value = alpha
        mat.diffuse_color = (*color, alpha)
        if alpha < 1:
            mat.surface_render_method = 'DITHERED'
            mat.use_backface_culling = False
        _M[name] = mat


class _Geometry:
    def __init__(self):
        self.vertices = []
        self.faces = []
        self.indices = []
        self.materials = []

    def add(self, material, vertices, faces):
        if material not in self.materials:
            self.materials.append(material)
        index = self.materials.index(material)
        offset = len(self.vertices)
        self.vertices.extend(tuple(v) for v in vertices)
        self.faces.extend(tuple(i + offset for i in f) for f in faces)
        self.indices.extend([index] * len(faces))

    def emit(self, name, parent=None, origin=(0, 0, 0)):
        mesh = bpy.data.meshes.new(name + '_Geometry')
        mesh.from_pydata(self.vertices, [], self.faces)
        for mat in self.materials:
            mesh.materials.append(_M[mat])
        for polygon, index in zip(mesh.polygons, self.indices):
            polygon.material_index = index
            polygon.use_smooth = True
        mesh.update()
        ob = bpy.data.objects.new(name, mesh)
        _COLLECTION.objects.link(ob)
        ob.parent = parent
        ob.location = origin
        _OBJECTS.append(ob)
        return ob


def _sphere(p, mat, center, radii, segments=12, rings=8):
    cx, cy, cz = center
    rx, ry, rz = radii
    verts = [(cx, cy, cz + rz)]
    for j in range(1, rings):
        t = math.pi * j / rings
        for i in range(segments):
            a = TAU * i / segments
            verts.append((cx + rx * math.sin(t) * math.cos(a), cy + ry * math.sin(t) * math.sin(a), cz + rz * math.cos(t)))
    verts.append((cx, cy, cz - rz))
    bottom = len(verts) - 1
    faces = [(0, 1 + i, 1 + (i + 1) % segments) for i in range(segments)]
    for j in range(rings - 2):
        for i in range(segments):
            a = 1 + j * segments + i
            b = 1 + j * segments + (i + 1) % segments
            faces.append((a, a + segments, b + segments, b))
    faces.extend((bottom, 1 + (rings - 2) * segments + (i + 1) % segments, 1 + (rings - 2) * segments + i) for i in range(segments))
    p.add(mat, verts, faces)


def _tube(p, mat, a, b, radius, end_radius=None, segments=8):
    a, b = Vector(a), Vector(b)
    direction = (b - a).normalized()
    side = direction.cross(Vector((0, 0, 1)))
    if side.length < .001:
        side = Vector((1, 0, 0))
    side.normalize()
    up = direction.cross(side).normalized()
    r2 = radius if end_radius is None else end_radius
    vertices = [center + r * (side * math.cos(TAU * i / segments) + up * math.sin(TAU * i / segments)) for center, r in ((a, radius), (b, r2)) for i in range(segments)]
    faces = [(i, (i + 1) % segments, (i + 1) % segments + segments, i + segments) for i in range(segments)]
    faces.extend([tuple(range(segments - 1, -1, -1)), tuple(range(segments, 2 * segments))])
    p.add(mat, vertices, faces)


def _profile(p, mat, levels, segments=20, pleat=0):
    vertices = []
    for z, rx, ry in levels:
        for i in range(segments):
            angle = TAU * i / segments
            offset = 1 + pleat * (i % 2)
            vertices.append((rx * math.cos(angle) * offset, ry * math.sin(angle) * offset, z))
    faces = []
    for j in range(len(levels) - 1):
        for i in range(segments):
            a = j * segments + i
            b = j * segments + (i + 1) % segments
            faces.append((a, b, b + segments, a + segments))
    faces.extend([tuple(range(segments - 1, -1, -1)), tuple(range((len(levels) - 1) * segments, len(levels) * segments))])
    p.add(mat, vertices, faces)


def _limb(p, mat, points, radii, segments=12):
    """A continuous bent limb avoids intersecting cap seams at the joints."""
    centers = [Vector(point) for point in points]
    vertices = []
    for i, (center, radius) in enumerate(zip(centers, radii)):
        previous = centers[max(0, i - 1)]
        following = centers[min(len(centers) - 1, i + 1)]
        axis = (following - previous).normalized()
        side = axis.cross(Vector((0, 1, 0))).normalized()
        up = axis.cross(side).normalized()
        vertices.extend(center + radius * (side * math.cos(TAU * j / segments) + up * math.sin(TAU * j / segments)) for j in range(segments))
    faces = []
    for i in range(len(centers) - 1):
        for j in range(segments):
            a = i * segments + j
            b = i * segments + (j + 1) % segments
            faces.append((a, b, b + segments, a + segments))
    faces.extend([tuple(range(segments - 1, -1, -1)), tuple(range((len(centers) - 1) * segments, len(centers) * segments))])
    p.add(mat, vertices, faces)


def _empty(name, parent=None, origin=(0, 0, 0)):
    ob = bpy.data.objects.new(name, None)
    _COLLECTION.objects.link(ob)
    ob.parent = parent
    ob.location = origin
    _OBJECTS.append(ob)
    return ob


def _hair(p, long=False):
    # The hair cap has a low rear hairline and a high, curved forehead.
    segments, rings = 20, 7
    vertices = [(0, .007, .649)]
    for j in range(1, rings + 1):
        for i in range(segments):
            a = TAU * i / segments
            # Front is -Y; shorten that part of the cap to leave the face visible.
            max_theta = 1.50 + .46 * math.sin(a)
            theta = max_theta * j / rings
            vertices.append((.065 * math.sin(theta) * math.cos(a), .006 + .062 * math.sin(theta) * math.sin(a), .573 + .076 * math.cos(theta)))
    faces = [(0, 1 + i, 1 + (i + 1) % segments) for i in range(segments)]
    for j in range(rings - 1):
        for i in range(segments):
            a = 1 + j * segments + i
            b = 1 + j * segments + (i + 1) % segments
            faces.append((a, a + segments, b + segments, b))
    p.add('hair', vertices, faces)
    if long:
        for i in range(7):
            a = i * math.pi / 6
            x, y = .050 * math.cos(a), .015 + .040 * math.sin(a)
            _sphere(p, 'hair', (x, y, .516), (.023, .025, .106), 10, 8)
    else:
        _sphere(p, 'hair', (-.022, -.006, .628), (.052, .046, .024))


def _head(p, long=False):
    _tube(p, 'skin', (0, 0, .465), (0, 0, .52), .022)
    _sphere(p, 'skin', (0, 0, .573), (.060, .053, .069))
    _sphere(p, 'skin', (0, -.053, .567), (.008, .012, .012), 8, 6)
    for x in [-.061, .061]:
        _sphere(p, 'skin', (x, .002, .568), (.012, .009, .018), 8, 6)
    for x in [-.020, .020]:
        _sphere(p, 'hair', (x, -.0515, .585), (.004, .0028, .004), 6, 4)
    _hair(p, long)


def _arm(p, sleeve, points, skin_only=False):
    shoulder, elbow, wrist = points
    _limb(p, 'skin' if skin_only else sleeve, points, [.021, .018, .013])
    _sphere(p, 'skin', wrist, (.018, .014, .018), 8, 6)


def _action_name(ob, label):
    if ob.animation_data and ob.animation_data.action:
        ob.animation_data.action.name = label


def _key(ob, frame, **values):
    for channel, value in values.items():
        setattr(ob, channel, value)
        ob.keyframe_insert(data_path=channel, frame=frame)


def _linear_keys(ob):
    action = ob.animation_data.action
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    for key in curve.keyframe_points:
                        key.interpolation = 'LINEAR'


def _couple(cupola, fps):
    x, y, z = cupola
    groom = _empty('Animated_Zach', origin=(x - .16, y - .19, z))
    p = _Geometry()
    _profile(p, 'suit', [(.265, .060, .041), (.39, .068, .043), (.459, .082, .046), (.473, .060, .038)])
    for side in [-1, 1]:
        _limb(p, 'suit', [(side * .035, 0, .286), (side * .038, 0, .157), (side * .039, 0, .042)], [.031, .024, .020])
        _sphere(p, 'shoes', (side * .039, -.013, .026), (.026, .050, .026))
    p.add('ivory', [(-.033, -.047, .461), (.033, -.047, .461), (0, -.05, .385)], [(0, 1, 2)])
    p.add('lapel', [(-.03, -.049, .467), (-.061, -.05, .430), (-.032, -.05, .388), (0, -.05, .393), (.03, -.049, .467), (.061, -.05, .430), (.032, -.05, .388)], [(0, 1, 2, 3), (4, 3, 6, 5)])
    for xx in [-.012, .012]:
        _sphere(p, 'suit', (xx, -.051, .453), (.014, .005, .008), 8, 6)
    _arm(p, 'suit', [(-.074, 0, .441), (-.098, -.015, .358), (-.105, -.029, .289)])
    _arm(p, 'suit', [(.074, 0, .441), (.123, -.025, .366), (.16, -.040, .325)])
    _sphere(p, 'ivory', (-.044, -.049, .431), (.012, .006, .012), 8, 6)
    _head(p)
    p.emit('Zach_SuitAndShortDarkHair', groom)

    bride = _empty('Animated_Julia', origin=(x + .16, y - .19, z))
    p = _Geometry()
    _profile(p, 'ivory', [(.016, .117, .093), (.045, .127, .105), (.18, .097, .081), (.30, .062, .051), (.36, .049, .038)], 32, .036)
    _profile(p, 'ivory', [(.33, .048, .037), (.39, .059, .041), (.441, .073, .043), (.460, .047, .035)], 20)
    _tube(p, 'silk', (-.049, -.011, .355), (.049, -.011, .355), .005)
    _arm(p, 'ivory', [(-.068, 0, .440), (-.117, -.025, .365), (-.16, -.040, .325)], skin_only=True)
    _arm(p, 'ivory', [(.068, 0, .440), (.101, -.043, .367), (.085, -.100, .326)], skin_only=True)
    _head(p, long=True)
    # A small bouquet in her free hand, muted cream roses and olive foliage.
    for i in range(7):
        a = i * 2.39996
        px, py = .088 + .027 * math.cos(a), -.10 + .018 * math.sin(a)
        _tube(p, 'leaf', (.085, -.10, .315), (px, py, .372), .0025, segments=5)
        _sphere(p, 'ivory' if i % 3 else 'rose', (px, py, .379 + .008 * math.sin(a)), (.016, .015, .014), 8, 6)
    p.emit('Julia_IvoryDressAndLongDarkHair', bride)
    # Veil coordinates are relative to the crown; the loose end gently moves.
    v = _Geometry()
    vertices, faces = [], []
    for j in range(9):
        t = j / 8
        width = .026 + .103 * t
        for i in range(9):
            q = (i / 8 - .5) * 2
            vertices.append((q * width, .018 + .074 * t + .018 * math.cos(q * math.pi) * math.sin(t * math.pi), -.36 * t + .009 * math.cos(q * math.pi * 3) * t))
    for j in range(8):
        for i in range(8):
            a = j * 9 + i
            faces.append((a, a + 1, a + 10, a + 9))
    v.add('veil', vertices, faces)
    veil = v.emit('Animated_JuliaVeil', bride, (0, .039, .622))
    for i in range(17):
        t = i / 16
        frame = 1 + t * fps * 8
        _key(groom, frame, rotation_euler=(0, .012 * math.sin(TAU * t), -.018 * math.sin(TAU * t)))
        _key(bride, frame, rotation_euler=(0, -.010 * math.sin(TAU * t), -.018 * math.sin(TAU * t)))
        _key(veil, frame, rotation_euler=(.035 * math.sin(TAU * t * 2), .025 * math.sin(TAU * t), .025 * math.sin(TAU * t * 2)))
    for ob in [groom, bride, veil]:
        _action_name(ob, 'Maryhill_' + ob.name.replace('Animated_', ''))


def _racket(p):
    _tube(p, 'shoes', (0, 0, -.03), (0, 0, .075), .009)
    _tube(p, 'racket', (0, 0, .055), (-.035, 0, .11), .007)
    _tube(p, 'racket', (0, 0, .055), (.035, 0, .11), .007)
    center = (0, 0, .197)
    points = [(.075 * math.cos(TAU * i / 32), 0, .197 + .099 * math.sin(TAU * i / 32)) for i in range(32)]
    for i in range(32):
        _tube(p, 'racket', points[i], points[(i + 1) % 32], .0065, segments=6)
    for i in range(-3, 4):
        dx = i * .018
        extent = .096 * math.sqrt(max(0, 1 - (dx / .073) ** 2))
        _tube(p, 'strings', (dx, 0, center[2] - extent), (dx, 0, center[2] + extent), .0014, segments=4)
    for i in range(-4, 5):
        dz = i * .02
        extent = .072 * math.sqrt(max(0, 1 - (dz / .097) ** 2))
        _tube(p, 'strings', (-extent, 0, center[2] + dz), (extent, 0, center[2] + dz), .0014, segments=4)


def _player(number, origin, angle):
    rig = _empty('Animated_TennisPlayer' + str(number), origin=origin)
    rig.rotation_euler.z = angle
    p = _Geometry()
    shirt = 'tennis_green' if number == 1 else 'ivory'
    shorts = 'ivory' if number == 1 else 'tennis_sand'
    _profile(p, shirt, [(.29, .063, .041), (.385, .068, .043), (.459, .079, .046), (.473, .056, .037)])
    for side in [-1, 1]:
        _tube(p, shorts, (side * .036, 0, .303), (side * .052, -.01, .221), .037, .033)
    p.add('ivory', [(-.035, -.044, .460), (0, -.048, .432), (.035, -.044, .460), (0, -.052, .452)], [(0, 1, 3), (3, 1, 2)])
    _arm(p, shirt, [(-.075, 0, .443), (-.105, -.02, .367), (-.060, -.081, .330)])
    _head(p, long=False)
    # Slim sweatband makes the sporting figures read clearly at miniature scale.
    band = [(.059 * math.cos(TAU * i / 32), .006 + .056 * math.sin(TAU * i / 32), .610) for i in range(32)]
    for i in range(32):
        _tube(p, 'ivory', band[i], band[(i + 1) % 32], .006, segments=6)
    p.emit('Tennis_Player' + str(number) + '_Torso', rig)
    limbs = []
    for side in [-1, 1]:
        p = _Geometry()
        _limb(p, 'skin', [(0, 0, 0), (side * .008, -.022, -.093), (side * .015, .010, -.165)], [.023, .020, .014])
        _tube(p, 'ivory', (side * .015, .010, -.14), (side * .015, .010, -.182), .017)
        _sphere(p, 'ivory', (side * .015, -.009, -.190), (.024, .048, .022))
        leg = p.emit('Animated_TennisPlayer' + str(number) + '_Leg' + str(side), rig, (side * .055, -.01, .22))
        limbs.append(leg)
    arm = _empty('Animated_TennisPlayer' + str(number) + '_RacketArm', rig, (.075, 0, .444))
    p = _Geometry()
    _tube(p, shirt, (0, 0, 0), (.032, -.027, -.055), .023, .021)
    _tube(p, 'skin', (.032, -.027, -.055), (.083, -.060, -.053), .018, .014)
    _sphere(p, 'skin', (.083, -.06, -.053), (.018, .016, .018), 8, 6)
    p.emit('Tennis_Player' + str(number) + '_ArmMesh', arm)
    p = _Geometry()
    _racket(p)
    racket = p.emit('Tennis_Player' + str(number) + '_Racket', arm, (.084, -.063, -.036))
    racket.rotation_euler.y = .70
    racket.rotation_euler.x = .12
    return rig, arm, limbs


def _tennis(court, fps):
    x, y, z = court
    # Near player faces toward the net, far player faces back toward the viewer.
    near, near_arm, near_legs = _player(1, (x - .45, y - 2.4, z), math.pi)
    far, far_arm, far_legs = _player(2, (x + .42, y + 2.4, z), 0)
    ball_geo = _Geometry()
    _sphere(ball_geo, 'ball', (0, 0, 0), (.035, .035, .035), 12, 8)
    # Fine cream seams distinguish the tennis ball from floating garden pollen.
    for side in [-1, 1]:
        points = []
        for i in range(25):
            a = TAU * i / 24
            points.append((.0353 * math.cos(a) * math.cos(.55 * math.sin(a) + side * .6), .0353 * math.cos(a) * math.sin(.55 * math.sin(a) + side * .6), .0353 * math.sin(a)))
        for a, b in zip(points, points[1:]):
            _tube(ball_geo, 'ivory', a, b, .0012, segments=4)
    ball = ball_geo.emit('Animated_TennisBall')
    # Four returns in eight seconds; each trajectory clears the net, bounces
    # once inside the service end and then rises to the opponent's racket.
    contacts = [(-.45, -2.384), (.42, 2.384), (-.12, -2.384), (.16, 2.384), (-.45, -2.384)]
    total = int(round(fps * 8))
    for i in range(total + 1):
        seconds = i / fps
        segment = min(3, int(seconds / 2))
        t = seconds - segment * 2
        start, end = contacts[segment], contacts[segment + 1]
        u = t / 2
        bx = x + start[0] * (1 - u) + end[0] * u
        by = y + start[1] * (1 - u) + end[1] * u
        gravity = 2.8
        bounce_time = 1.64
        contact_height, bounce_height = .55, .035
        initial_velocity = (bounce_height - contact_height + .5 * gravity * bounce_time ** 2) / bounce_time
        if t <= bounce_time:
            height = contact_height + initial_velocity * t - .5 * gravity * t * t
        else:
            after = t - bounce_time
            remaining = 2 - bounce_time
            rebound = (contact_height - bounce_height + .5 * gravity * remaining ** 2) / remaining
            height = bounce_height + rebound * after - .5 * gravity * after * after
        _key(ball, 1 + i, location=(bx, by, z + height), rotation_euler=(seconds * TAU, seconds * TAU / 2, 0))
    _linear_keys(ball)
    _action_name(ball, 'Maryhill_TennisBall_Rally')

    for rig, arm, legs, player, angle in [(near, near_arm, near_legs, 0, math.pi), (far, far_arm, far_legs, 1, 0)]:
        for step in range(97):
            seconds = 8 * step / 96
            phase = (seconds - player * 2) % 4
            # Shift between the two reachable returns without sliding far away.
            if player == 0:
                center_x = -.285 - .165 * math.cos(math.pi * seconds / 4)
                # Racket extends to the player's right (world negative X).
                center_x += .306
            else:
                center_x = .29 + .13 * math.sin(math.pi * seconds / 4)
                center_x -= .306
            pulse = math.exp(-((min(phase, 4 - phase)) / .20) ** 2)
            sway = .018 * math.sin(seconds * math.pi * 2)
            _key(rig, 1 + seconds * fps, location=(x + center_x, y + (-2.4 if player == 0 else 2.4), z + .005 * (1 - math.cos(seconds * math.pi * 4))), rotation_euler=(.035, sway, angle + .11 * math.sin(phase * math.pi / 2)))
            # Compact forehand: shoulder turns as the ball arrives, then returns.
            swing = -.55 * math.sin(TAU * ((phase + .26) / 4)) + .37 * pulse
            _key(arm, 1 + seconds * fps, rotation_euler=(-.15 - .28 * pulse, .1 + swing * .35, swing))
            for j, leg in enumerate(legs):
                _key(leg, 1 + seconds * fps, rotation_euler=(.08 * math.sin(seconds * math.pi * 2 + j * math.pi), 0, .018 * math.sin(seconds * math.pi * 2)))
        for ob in [rig, arm, *legs]:
            _action_name(ob, 'Maryhill_' + ob.name.replace('Animated_', ''))
    # Two spare tennis balls rest beyond the baseline.
    for i in range(2):
        p = _Geometry()
        _sphere(p, 'ball', (0, 0, 0), (.032, .032, .032), 10, 6)
        p.emit('Tennis_SpareBall' + str(i + 1), origin=(x - 1.46 + i * .13, y - 2.92, z + .032))


def build_people(cupola=(16, -1.5, 7.33), court=(-3.5, 10, .17)):
    """Return every added mesh/empty, with synchronized eight-second actions.

    Bride and groom height is .65 world units; couple is .58 units across.
    Tennis court axes: X width 3.7, Y length 6.5, net at court[1].
    The caller owns frame range, export, scene lighting and camera.
    """
    global _COLLECTION, _OBJECTS
    scene = bpy.context.scene
    frame = scene.frame_current
    fps = scene.render.fps / scene.render.fps_base
    _OBJECTS = []
    _COLLECTION = bpy.data.collections.new('Maryhill / people and wedding couple')
    scene.collection.children.link(_COLLECTION)
    _materials()
    try:
        _couple(cupola, fps)
        _tennis(court, fps)
        return list(_OBJECTS)
    finally:
        scene.frame_set(frame)
