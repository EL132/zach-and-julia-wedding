"""Maryhill miniature landscape props. Blender 5.x, no external dependencies.

Every public factory returns a list of one-material mesh objects. Positions are
world coordinates, Z is up, and lounger angle is radians around Z. Nothing is
deleted; no render, camera, world, or export settings are changed. `setup()` may
receive overrides keyed by the short material names defined below.
"""

import bpy
import math
import random
from collections import defaultdict
from mathutils import Vector, Euler

TAU = math.tau
_MATERIALS = {}
_SPECS = {
    "bark": ((0.19, 0.145, 0.085, 1), .93, 0),
    "leaf_deep": ((0.095, 0.16, 0.052, 1), .87, 0),
    "leaf_olive": ((0.235, 0.30, 0.087, 1), .82, 0),
    "leaf_sage": ((0.32, 0.40, 0.155, 1), .83, 0),
    "leaf_light": ((0.415, 0.46, 0.19, 1), .85, 0),
    "canvas": ((0.91, 0.857, 0.718, 1), .91, 0),
    "canvas_seam": ((0.69, 0.62, 0.44, 1), .85, 0),
    "cushion": ((0.78, 0.684, 0.49, 1), .91, 0),
    "linen": ((0.96, 0.917, 0.812, 1), .99, 0),
    "blush": ((0.63, 0.33, 0.24, 1), .87, 0),
    "wood": ((0.32, 0.20, 0.11, 1), .79, 0),
    "bronze": ((0.105, 0.12, 0.09, 1), .48, .65),
    "lamp_glass": ((0.95, 0.83, 0.55, 1), .3, .05),
    "stone": ((0.69, 0.64, 0.52, 1), .91, 0),
    "copper_green": ((0.25, 0.40, 0.31, 1), .64, .45),
    "copper_rib": ((0.165, 0.26, 0.195, 1), .53, .55),
    "shadow": ((0.07, 0.092, 0.068, 1), .94, 0),
    "soil": ((0.23, 0.205, 0.13, 1), 1, 0),
    "flower_cream": ((0.87, 0.843, 0.66, 1), .9, 0),
    "flower_lavender": ((0.45, 0.43, 0.55, 1), .9, 0),
}


def setup(materials=None):
    """Create/reuse shared GLB-compatible PBR materials and optional overrides."""
    materials = materials or {}
    for short, (color, rough, metal) in _SPECS.items():
        if short in materials:
            _MATERIALS[short] = materials[short]
            continue
        mat = bpy.data.materials.get("Maryhill garden / " + short)
        if mat is None:
            mat = bpy.data.materials.new("Maryhill garden / " + short)
            mat.use_nodes = True
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            bsdf.inputs["Base Color"].default_value = color
            bsdf.inputs["Roughness"].default_value = rough
            bsdf.inputs["Metallic"].default_value = metal
            mat.diffuse_color = color
        _MATERIALS[short] = mat
    return _MATERIALS


class _Parts:
    """Collect disconnected geometry by material to minimize draw calls."""
    def __init__(self):
        self.data = defaultdict(lambda: [[], [], []])

    def add(self, material, vertices, faces, smooth=False):
        verts, polys, shading = self.data[material]
        offset = len(verts)
        verts.extend(tuple(v) for v in vertices)
        polys.extend(tuple(i + offset for i in f) for f in faces)
        shading.extend([smooth] * len(faces))

    def emit(self, name, origin=(0, 0, 0), angle=0):
        if not _MATERIALS:
            setup()
        result = []
        co, si = math.cos(angle), math.sin(angle)
        ox, oy, oz = origin
        for material, (verts, faces, shading) in self.data.items():
            verts = [(ox + x*co-y*si, oy+x*si+y*co, oz+z) for x, y, z in verts]
            mesh = bpy.data.meshes.new(name + " / " + material)
            mesh.from_pydata(verts, [], faces)
            mesh.materials.append(_MATERIALS[material])
            mesh.update()
            obj = bpy.data.objects.new(name + " / " + material, mesh)
            bpy.context.collection.objects.link(obj)
            for poly, smooth in zip(mesh.polygons, shading):
                poly.use_smooth = smooth
            result.append(obj)
        return result


def _tube(p, material, a, b, radius, end_radius=None, sides=8):
    a, b = Vector(a), Vector(b)
    axis = b-a
    if axis.length < 1e-7:
        return
    direction = axis.normalized()
    side = direction.cross(Vector((0, 0, 1)))
    if side.length < .01:
        side = Vector((1, 0, 0))
    side.normalize()
    up = direction.cross(side).normalized()
    end_radius = radius if end_radius is None else end_radius
    verts = []
    for center, r in ((a, radius), (b, end_radius)):
        verts.extend(center + r*(side*math.cos(TAU*i/sides)+up*math.sin(TAU*i/sides)) for i in range(sides))
    faces = [(i, (i+1)%sides, (i+1)%sides+sides, i+sides) for i in range(sides)]
    faces += [tuple(range(sides-1, -1, -1)), tuple(range(sides, sides*2))]
    p.add(material, verts, faces, True)


def _ellipsoid(p, material, center, radii, rng=None, seg=10, rings=6, noise=.08):
    cx, cy, cz = center
    rx, ry, rz = radii
    rng = rng or random.Random(0)
    verts = [(cx, cy, cz+rz)]
    for j in range(1, rings):
        theta = math.pi*j/rings
        for i in range(seg):
            phi = TAU*i/seg
            d = 1 + rng.uniform(-noise, noise)
            verts.append((cx+rx*math.sin(theta)*math.cos(phi)*d,
                          cy+ry*math.sin(theta)*math.sin(phi)*d,
                          cz+rz*math.cos(theta)*d))
    verts.append((cx, cy, cz-rz))
    bottom = len(verts)-1
    faces = [(0, 1+i, 1+(i+1)%seg) for i in range(seg)]
    for j in range(rings-2):
        for i in range(seg):
            a = 1+j*seg+i
            b = 1+j*seg+(i+1)%seg
            faces.append((a, a+seg, b+seg, b))
    faces.extend((bottom, 1+(rings-2)*seg+(i+1)%seg, 1+(rings-2)*seg+i) for i in range(seg))
    p.add(material, verts, faces, True)


def _box(p, material, center, size, rotation=(0, 0, 0)):
    sx, sy, sz = (v/2 for v in size)
    verts = [Vector((x*sx, y*sy, z*sz)) for x, y, z in
             [(-1,-1,-1), (1,-1,-1), (1,1,-1), (-1,1,-1),
              (-1,-1,1), (1,-1,1), (1,1,1), (-1,1,1)]]
    matrix = Euler(rotation).to_matrix()
    verts = [matrix @ v + Vector(center) for v in verts]
    p.add(material, verts, [(0,3,2,1), (4,5,6,7), (0,1,5,4),
                             (1,2,6,5), (2,3,7,6), (3,0,4,7)])


def _cushion(p, material, center, size, rotation=(0, 0, 0), bevel=.025):
    # Four rounded rectangular rings approximate a soft tailored cushion.
    sx, sy, sz = size
    verts, faces = [], []
    matrix = Euler(rotation).to_matrix()
    for z, inset in [(-sz/2, bevel), (-sz/2+bevel, 0),
                      (sz/2-bevel, 0), (sz/2, bevel)]:
        w, d = sx/2-inset, sy/2-inset
        r = min(bevel, w*.3, d*.3)
        ring = []
        for corner in range(4):
            phi = corner*math.pi/2
            cx = (w-r)*(1 if corner in (0,3) else -1)
            cy = (d-r)*(1 if corner in (0,1) else -1)
            # Counterclockwise rounded rectangle, beginning at top-right.
            start = corner*math.pi/2
            for k in range(3):
                angle = start+k*math.pi/4
                ring.append((cx+r*math.cos(angle), cy+r*math.sin(angle), z))
        verts.extend(matrix @ Vector(v)+Vector(center) for v in ring)
    n = 12
    for j in range(3):
        faces.extend((j*n+i, j*n+(i+1)%n, (j+1)*n+(i+1)%n, (j+1)*n+i) for i in range(n))
    faces += [tuple(range(n-1,-1,-1)), tuple(range(3*n,4*n))]
    p.add(material, verts, faces, True)


def tree(x, y, z=0, scale=1, seed=1):
    """Broadleaf tree, ~3.2m tall with a ~1m-radius layered natural crown."""
    rng, p = random.Random(seed), _Parts()
    def v(q):
        return tuple(a*scale for a in q)
    lean = (rng.uniform(-.15,.15), rng.uniform(-.15,.15))
    fork = (lean[0]*.6, lean[1]*.6, 1.45)
    _tube(p, "bark", v((0,0,0)), v(fork), .085*scale, .045*scale, 9)
    _tube(p, "bark", v(fork), v((lean[0],lean[1],2.55)), .045*scale, .011*scale, 7)
    # Visible root flares and branches give the crown a deliberate structure.
    for i in range(5):
        a = TAU*i/5+rng.uniform(-.2,.2)
        _tube(p, "bark", v((0,0,.23)), v((math.cos(a)*.28,math.sin(a)*.28,.015)),
              .045*scale, .01*scale, 6)
    centers = []
    for i in range(9):
        a = TAU*i/9+rng.uniform(-.2,.2)
        radial = rng.uniform(.46,.69)
        c = (lean[0]+math.cos(a)*radial, lean[1]+math.sin(a)*radial, rng.uniform(1.95,2.48))
        centers.append(c)
        branch_start = (lean[0]*.7,lean[1]*.7,1.10+i*.07)
        elbow = (c[0]*.65,c[1]*.65,c[2]-.35)
        _tube(p, "bark", v(branch_start),v(elbow), .03*scale,.015*scale,6)
        _tube(p, "bark", v(elbow),v(c), .015*scale,.004*scale,6)
    centers += [(lean[0]+rng.uniform(-.24,.24), lean[1]+rng.uniform(-.24,.24), h)
                for h in (2.47,2.68,2.82)]
    palette = ("leaf_deep", "leaf_olive", "leaf_sage", "leaf_light")
    for i,c in enumerate(centers):
        size = rng.uniform(.36,.51)
        mat = palette[min(3, max(0, int((c[2]-1.9)*2.5)+rng.choice((-1,0,0,1))))]
        _ellipsoid(p,mat,v(c),v((size,size*.86,size*.85)),rng,seg=10,rings=6,noise=.13)
        # Smaller, offset shoots break the silhouette and prevent balloon crowns.
        for j in range(3):
            a = TAU*j/3+rng.random()*.8
            q = (c[0]+math.cos(a)*size*.73,c[1]+math.sin(a)*size*.73,
                 c[2]+rng.uniform(-.08,.22))
            sr = size*rng.uniform(.37,.54)
            _ellipsoid(p,rng.choice((mat,"leaf_olive","leaf_sage")),v(q),
                       v((sr,sr*.85,sr*.8)),rng,seg=8,rings=5,noise=.14)
    return p.emit("Estate broadleaf %s" % seed, (x,y,z))


def shrub(x, y, z=0, scale=1, seed=1):
    """A low, loose evergreen shrub, ~0.4m tall."""
    rng, p = random.Random(seed), _Parts()
    for i in range(6):
        a = i*TAU/6
        c = (math.cos(a)*.13*scale,math.sin(a)*.13*scale,rng.uniform(.16,.24)*scale)
        r = rng.uniform(.13,.19)*scale
        _ellipsoid(p,rng.choice(("leaf_deep","leaf_olive","leaf_sage")),c,(r,r,r*.85),rng,8,5,.12)
    return p.emit("Garden shrub %s" % seed,(x,y,z))


def parasol(x, y, z=0, radius=.55, height=1.05):
    """Maryhill's ivory domed eight-panel pool umbrella, with scalloped fringe."""
    p = _Parts()
    _tube(p,"wood",(0,0,.02),(0,0,height+.025),.009,.008,8)
    _tube(p,"bronze",(0,0,.0),(0,0,.035),radius*.15,radius*.15,12)
    n = 64
    verts = [(0,0,height)]
    profile = [(radius*.30, height-.012),(radius*.64,height-.055),
               (radius*.88,height-.115),(radius,height-.19)]
    for ring,(r,h) in enumerate(profile):
        for i in range(n):
            a = i*TAU/n
            sag = math.sin((i%8)/8*math.pi)**2
            verts.append((r*math.cos(a),r*math.sin(a),h-.042*sag*(ring/3)**2))
    faces = [(0,1+i,1+(i+1)%n) for i in range(n)]
    for ring in range(3):
        faces.extend((1+ring*n+i,1+(ring+1)*n+i,1+(ring+1)*n+(i+1)%n,1+ring*n+(i+1)%n) for i in range(n))
    p.add("canvas",verts,faces,True)
    for i in range(n):
        a,b = i*TAU/n,(i+1)*TAU/n
        za = height-.19-.042*math.sin((i%8)/8*math.pi)**2
        zb = height-.19-.042*math.sin(((i+1)%8)/8*math.pi)**2
        aa=(radius*math.cos(a),radius*math.sin(a),za)
        bb=(radius*math.cos(b),radius*math.sin(b),zb)
        p.add("canvas",[aa,bb,(bb[0],bb[1],zb-.055),(aa[0],aa[1],za-.055)],[(0,1,2,3)])
        # Fine, dimensional fringe accents instead of an opaque flat skirt.
        for j in range(2):
            ang = a+(b-a)*(j+.5)/2
            hh = height-.19-.042*math.sin((i+j*.5)/8*math.pi)**2
            rr = radius+.002
            _tube(p,"canvas_seam",(rr*math.cos(ang),rr*math.sin(ang),hh-.039),
                  (rr*math.cos(ang),rr*math.sin(ang),hh-.073),.0015,sides=3)
    for i in range(8):
        a = TAU*i/8
        last=(0,0,height-.006)
        for r,h in profile:
            nxt=(r*math.cos(a),r*math.sin(a),h-.007)
            _tube(p,"canvas_seam",last,nxt,.0025,sides=4)
            last=nxt
    _ellipsoid(p,"wood",(0,0,height+.021),(.015,.015,.025),seg=8,rings=4,noise=0)
    return p.emit("Scalloped ivory parasol",(x,y,z))


def lounger(x, y, z=0, angle=0):
    """Cream floral chaise, 0.48m × 1.25m; raised head is toward +Y."""
    p = _Parts()
    _box(p,"wood",(0,0,.14),(.48,1.25,.065))
    for xx in (-.19,.19):
        for yy in (-.50,.49):
            _box(p,"wood",(xx,yy,.075),(.045,.055,.15))
    _cushion(p,"cushion",(0,-.20,.218),(.465,.83,.11))
    tilt = .50
    back=(0,.435,.335)
    _cushion(p,"cushion",back,(.465,.48,.095),(tilt,0,0))
    # Small olive and muted coral textile motifs sit on the raised cushion.
    rotation = Euler((tilt,0,0)).to_matrix()
    rng = random.Random(14)
    for j in range(13):
        xx,yy = rng.uniform(-.195,.195),rng.uniform(-.19,.19)
        center=rotation @ Vector((xx,yy,.049))+Vector(back)
        _ellipsoid(p,"blush" if j%3==0 else "leaf_olive",center,(.013,.008,.005),rng,6,3,0)
    _cushion(p,"linen",(0,-.40,.295),(.23,.12,.045),bevel=.012)
    # Thin pale mattress piping catches the afternoon light at miniature scale.
    for xx in (-.231,.231):
        _tube(p,"canvas",(xx,-.59,.235),(xx,.18,.235),.004,sides=4)
    return p.emit("Poolside floral chaise",(x,y,z),angle)


def lamp(x, y, z=0, height=1.3):
    """Slender old-estate bronze lantern with warm glass and a pointed cap."""
    p = _Parts()
    _tube(p,"bronze",(0,0,0),(0,0,.06),.060,.052,10)
    _tube(p,"bronze",(0,0,.06),(0,0,.20),.032,.023,8)
    _tube(p,"bronze",(0,0,.18),(0,0,height-.25),.013,.010,8)
    _tube(p,"bronze",(0,0,height-.30),(0,0,height-.25),.035,.053,8)
    _box(p,"lamp_glass",(0,0,height-.15),(.087,.087,.18))
    for xx in (-.048,.048):
        for yy in (-.048,.048):
            _tube(p,"bronze",(xx,yy,height-.25),(xx,yy,height-.047),.006,sides=4)
    _tube(p,"bronze",(0,0,height-.25),(0,0,height-.237),.07,.062,4)
    _tube(p,"bronze",(0,0,height-.047),(0,0,height+.015),.086,.008,4)
    _ellipsoid(p,"bronze",(0,0,height+.028),(.012,.012,.025),seg=6,rings=4,noise=0)
    return p.emit("Bronze garden lantern",(x,y,z))


def gazebo(x, y, z=0, radius=.7, height=1.2):
    """Enclosed octagonal stone pavilion, round windows, verdigris ribbed roof."""
    p = _Parts()
    wall = height*.59
    _tube(p,"stone",(0,0,0),(0,0,.07),radius*1.04,radius*1.04,8)
    _tube(p,"stone",(0,0,.07),(0,0,wall),radius*.92,radius*.92,8)
    _tube(p,"stone",(0,0,wall-.035),(0,0,wall+.025),radius*.97,radius*.97,8)
    # Circular windows on each flat face and trim pilasters at each corner.
    for i in range(8):
        a = TAU*(i+.5)/8
        normal=Vector((math.cos(a),math.sin(a),0))
        center=normal*(radius*.92*math.cos(math.pi/8)+.002)+Vector((0,0,wall*.69))
        _tube(p,"copper_rib",center-normal*.007,center+normal*.004,radius*.12,sides=16)
        _tube(p,"shadow",center+normal*.005,center+normal*.007,radius*.092,sides=16)
        aa=TAU*i/8
        _tube(p,"stone",(math.cos(aa)*radius*.905,math.sin(aa)*radius*.905,.08),
              (math.cos(aa)*radius*.905,math.sin(aa)*radius*.905,wall-.02),radius*.034,sides=6)
    # The real tiny pavilion has a stepped, curved, weathered green roof.
    roof = height-wall
    rings=[(radius*1.02,wall+.025),(radius*1.05,wall+roof*.14),
           (radius*.81,wall+roof*.34),(radius*.64,wall+roof*.63),
           (radius*.43,wall+roof*.74),(radius*.26,wall+roof*.91),(radius*.03,height)]
    verts=[]
    for r,h in rings:
        verts.extend((r*math.cos(TAU*i/16),r*math.sin(TAU*i/16),h) for i in range(16))
    faces=[]
    for j in range(len(rings)-1):
        faces.extend((j*16+i,j*16+(i+1)%16,(j+1)*16+(i+1)%16,(j+1)*16+i) for i in range(16))
    p.add("copper_green",verts,faces)
    for i in range(16):
        a=i*TAU/16
        for (r1,h1),(r2,h2) in zip(rings[:-1],rings[1:]):
            _tube(p,"copper_rib",(r1*math.cos(a),r1*math.sin(a),h1+.004),
                  (r2*math.cos(a),r2*math.sin(a),h2+.004),.004,sides=4)
    for r,h in (rings[1],rings[3]):
        for i in range(16):
            a,b=TAU*i/16,TAU*(i+1)/16
            _tube(p,"copper_rib",(r*math.cos(a),r*math.sin(a),h+.004),
                  (r*math.cos(b),r*math.sin(b),h+.004),.007,sides=4)
    _tube(p,"copper_rib",(0,0,height),(0,0,height+.085),.012,.004,8)
    return p.emit("Octagonal garden pavilion",(x,y,z))


def flowerbed(x, y, z=0, width=2, depth=.5, seed=1):
    """A loose rectangular bed of cream hydrangeas, muted lavender, and leaves."""
    rng, p = random.Random(seed), _Parts()
    _box(p,"soil",(0,0,.018),(width,depth,.036))
    count=max(3,int(width*depth*10))
    for i in range(count):
        xx,yy=rng.uniform(-width*.45,width*.45),rng.uniform(-depth*.40,depth*.40)
        height=rng.uniform(.18,.38)
        _ellipsoid(p,rng.choice(("leaf_deep","leaf_olive","leaf_sage")),
                   (xx,yy,height*.43),(.12,.12,height*.5),rng,8,5,.1)
        _tube(p,"leaf_deep",(xx,yy,.05),(xx,yy,height),.006,.002,5)
        # Hydrangea clusters, legible as small flowers even from the wide view.
        for j in range(4):
            a=TAU*j/4
            _ellipsoid(p,"flower_cream" if i%4 else "flower_lavender",
                       (xx+math.cos(a)*.034,yy+math.sin(a)*.034,height+rng.uniform(-.01,.02)),
                       (.035,.035,.040),rng,6,4,.13)
    return p.emit("Herbaceous border %s" % seed,(x,y,z))
