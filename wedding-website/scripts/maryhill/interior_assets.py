"""Maryhill miniature lounge and terrace furniture, authored for this estate.

Factory results are one-material mesh lists, all in world coordinates with
identity transforms. No scene, lighting or render changes. All dimensions are
Blender units, Z up. `glasshouse()` has a pool-safe fixed layout and can be
translated as a group with x_offset/y_offset/z_offset.
"""
import bpy
import math
import random
from collections import defaultdict
from mathutils import Vector
import garden_assets as G

_MATERIALS = {}
_SPECS = {
    'linen': ('e8dcc6', .97, 0), 'floral_cream': ('dfd3b9', .97, 0),
    'floral_moss': ('667951', .95, 0), 'floral_rose': ('b98362', .95, 0),
    'moss': ('75835e', .96, 0), 'terracotta': ('aa6345', .94, 0),
    'rattan': ('a98555', .77, 0), 'rattan_dark': ('71563b', .85, 0),
    'wood': ('654b32', .84, 0), 'brass': ('a3884e', .38, .72),
    'marble': ('e0d5ba', .38, .02), 'ceramic': ('e8ddc8', .5, 0),
    'pot_green': ('294e3e', .38, .05), 'pot_clay': ('a15c40', .83, 0),
    'soil': ('453d2a', 1, 0), 'leaf': ('426632', .85, 0),
    'leaf_light': ('6b8143', .83, 0), 'leaf_dark': ('2d512d', .91, 0),
    'flower_white': ('f0e7cf', .87, 0), 'flower_rose': ('c28c94', .87, 0),
    'water_glass': ('82958c', .19, .21), 'sign_ink': ('405244', .86, 0),
}

def setup(materials=None):
    """Reuse/create PBR materials. Overrides use the short keys in _SPECS."""
    overrides = materials or {}
    for key, (color, roughness, metallic) in _SPECS.items():
        if key in overrides:
            _MATERIALS[key] = overrides[key]
            continue
        material = bpy.data.materials.get('Maryhill interiors / ' + key)
        if not material:
            material = bpy.data.materials.new('Maryhill interiors / ' + key)
            material.use_nodes = True
            srgb = [int(color[i:i+2], 16)/255 for i in (0,2,4)]
            linear = [c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4 for c in srgb]
            material.diffuse_color = (*linear, 1)
            shader = material.node_tree.nodes.get('Principled BSDF')
            shader.inputs['Base Color'].default_value = (*linear, 1)
            shader.inputs['Roughness'].default_value = roughness
            shader.inputs['Metallic'].default_value = metallic
        _MATERIALS[key] = material
    return _MATERIALS

class _Parts:
    def __init__(self):
        self.data = defaultdict(lambda: [[], [], []])

    def add(self, material, vertices, faces, smooth=False):
        verts, polys, shading = self.data[material]
        offset = len(verts)
        verts.extend(tuple(v) for v in vertices)
        polys.extend(tuple(i+offset for i in face) for face in faces)
        shading.extend([smooth] * len(faces))

    def absorb(self, other, origin=(0,0,0), angle=0):
        co, si = math.cos(angle), math.sin(angle)
        ox, oy, oz = origin
        for material, (verts, faces, shading) in other.data.items():
            moved = [(ox+x*co-y*si, oy+x*si+y*co, oz+z) for x,y,z in verts]
            v, f, s = self.data[material]
            offset = len(v)
            v.extend(moved)
            f.extend(tuple(i+offset for i in face) for face in faces)
            s.extend(shading)

    def emit(self, name, origin=(0,0,0), angle=0):
        if not _MATERIALS:
            setup()
        moved = _Parts()
        moved.absorb(self, origin, angle)
        objects = []
        for material, (verts, faces, shading) in moved.data.items():
            mesh = bpy.data.meshes.new(name+' / '+material)
            mesh.from_pydata(verts, [], faces)
            mesh.materials.append(_MATERIALS[material])
            mesh.update()
            obj = bpy.data.objects.new(name+' / '+material, mesh)
            bpy.context.collection.objects.link(obj)
            for face, smooth in zip(mesh.polygons, shading):
                face.use_smooth = smooth
            objects.append(obj)
        return objects


def _cylinder(p, material, x,y,z,radius,height,sides=16,upper_radius=None):
    G._tube(p, material, (x,y,z), (x,y,z+height), radius,
            radius if upper_radius is None else upper_radius, sides)

def _flower(p, x,y,z, scale=.035, color='floral_rose', seed=0):
    # Deliberately small stitched botanical motifs on the upholstered seats.
    rng = random.Random(seed)
    for i in range(5):
        a = math.tau*i/5
        G._ellipsoid(p,color,(x+scale*.55*math.cos(a),y+scale*.55*math.sin(a),z),
                     (scale*.47,scale*.36,.007),rng,seg=6,rings=3,noise=0)
    G._ellipsoid(p,'floral_moss',(x+scale*1.1,y+scale*.5,z),
                 (scale*.82,scale*.3,.006),rng,seg=6,rings=3,noise=0)
    G._ellipsoid(p,'brass',(x,y,z+.003),(scale*.19,scale*.19,.007),rng,seg=6,rings=3,noise=0)

def _sofa(width=1.65, seed=0):
    """Faces toward local -Y; scaled to architectural furniture proportions."""
    p, rng = _Parts(), random.Random(seed)
    for x in (-width/2+.08,width/2-.08):
        for y in (-.22,.22):
            G._tube(p,'wood',(x,y,.02),(x,y,.2),.025,.018,6)
    G._cushion(p,'rattan_dark',(0,0,.21),(width,.63,.13),bevel=.024)
    G._cushion(p,'floral_cream',(0,.225,.49),(width,.19,.48),bevel=.04)
    for x in (-width/2+.06,width/2-.06):
        G._cushion(p,'floral_cream',(x,-.02,.37),(.17,.65,.37),bevel=.04)
    n = 3 if width>1.6 else 2
    cushion_w = (width-.32)/n
    for i in range(n):
        x = -width/2+.16+cushion_w*(i+.5)
        G._cushion(p,'floral_cream',(x,-.075,.315),(cushion_w-.015,.4,.14),bevel=.035)
        for j in range(6):
            _flower(p,x+rng.uniform(-cushion_w*.37,cushion_w*.37),rng.uniform(-.23,.07),.387,
                    scale=rng.uniform(.025,.04),seed=j+seed*7)
        # Back pillows have enough volume to be clearly visible through glazing.
        G._cushion(p,'linen' if i%2 else 'moss',(x,.14,.51),(cushion_w*.75,.14,.30),
                   rotation=(math.radians(14),0,0),bevel=.027)
    # Cane piping along the base subtly outlines the cream upholstery.
    G._tube(p,'rattan',(-width/2,-.32,.25),(width/2,-.32,.25),.013,sides=6)
    return p


def _armchair(color='moss', wicker=False):
    p = _Parts()
    for x in (-.20,.20):
        for y in (-.20,.20):
            G._tube(p,'wood',(x,y,.02),(x*.87,y*.9,.3),.018,.014,6)
    G._cushion(p,'linen' if wicker else color,(0,-.04,.3),(.48,.51,.14),bevel=.028)
    G._cushion(p,'linen' if wicker else color,(0,.19,.52),(.5,.13,.4),
               rotation=(math.radians(11),0,0),bevel=.04)
    for x in (-.27,.27):
        G._tube(p,'rattan' if wicker else 'wood',(x,-.23,.3),(x,-.23,.52),.018,sides=6)
        G._tube(p,'rattan' if wicker else 'wood',(x,-.23,.52),(x,.25,.56),.021,sides=7)
        if wicker:
            for i in range(7):
                y = -.20+i*.066
                G._tube(p,'rattan',(x,y,.3),(x,y,.525),.007,sides=4)
    if wicker:
        for i in range(9):
            x = -.23+i*.057
            G._tube(p,'rattan',(x,.26,.33),(x,.3,.71),.009,sides=5)
        G._tube(p,'rattan',(-.27,.3,.71),(.27,.3,.71),.023,sides=7)
        for z in (.38,.47,.56,.65):
            G._tube(p,'rattan_dark',(-.255,.3,z),(.255,.3,z),.006,sides=4)
    return p


def _lounger():
    p = _armchair(wicker=True)
    # Footstool repeats the woven seat material with rolled pool towel.
    for x in (-.21,.21):
        for y in (-.90,-.51):
            G._tube(p,'rattan',(x,y,.02),(x,y,.26),.019,sides=6)
    G._cushion(p,'rattan',(0,-.705,.245),(.51,.49,.09),bevel=.015)
    G._cushion(p,'linen',(0,-.705,.31),(.48,.46,.10),bevel=.035)
    for i in range(9):
        G._tube(p,'rattan_dark',(-.23+i*.056,-.935,.11),(-.23+i*.056,-.935,.25),.006,sides=4)
    G._tube(p,'linen',(-.15,-.85,.405),(.15,-.85,.405),.07,sides=12)
    return p


def _table(radius=.28,height=.43,terrace=False):
    p = _Parts()
    _cylinder(p,'brass',0,0,.04,.06,height-.04,10)
    _cylinder(p,'brass',0,0,.025,radius*.61,.035,16)
    _cylinder(p,'marble' if terrace else 'brass',0,0,height,radius,.035,24)
    # Tiny ceramics, a water glass and bud vase make tabletops feel occupied.
    _cylinder(p,'ceramic',-.08,-.035,height+.036,.047,.017,12)
    _cylinder(p,'ceramic',-.08,-.035,height+.053,.028,.037,10)
    _cylinder(p,'water_glass',.087,-.075,height+.035,.026,.085,10)
    _cylinder(p,'pot_green',.04,.09,height+.036,.03,.095,10,upper_radius=.019)
    G._tube(p,'leaf_dark',(.04,.09,height+.11),(.065,.087,height+.18),.006,sides=5)
    G._ellipsoid(p,'flower_white',(.065,.087,height+.18),(.035,.03,.025),seg=7,rings=4,noise=0)
    return p


def _plant(scale=1,seed=1,palm=False):
    p, rng = _Parts(), random.Random(seed)
    radius=.145*scale
    height=.31*scale
    _cylinder(p,'pot_green' if palm else 'pot_clay',0,0,0,radius*.74,height,16,upper_radius=radius)
    _cylinder(p,'pot_green' if palm else 'pot_clay',0,0,height-.035*scale,radius*1.08,.045*scale,16)
    _cylinder(p,'soil',0,0,height+.007*scale,radius*.90,.009*scale,16)
    if palm:
        tipz=height+1.0*scale
        for trunk in range(3):
            a=trunk*math.tau/3
            end=(math.cos(a)*.07*scale,math.sin(a)*.07*scale,tipz+trunk*.15*scale)
            G._tube(p,'wood',(0,0,height),end,.014*scale,.007*scale,6)
            for i in range(7):
                angle=i*math.tau/7+trunk*.4
                for j in range(5):
                    t0=j/5;t1=(j+1)/5
                    def point(t):
                        return Vector((end[0]+math.cos(angle)*.6*scale*t,
                                       end[1]+math.sin(angle)*.6*scale*t,
                                       end[2]+(.3*math.sin(t*math.pi)-.19*t)*scale))
                    aa,bb=point(t0),point(t1)
                    G._tube(p,'leaf_dark',aa,bb,.006*scale,sides=4)
                    for side in (-1,1):
                        feather=Vector((math.cos(angle+side*1.0),math.sin(angle+side*1.0),-.22))*.14*scale*(1-t0*.6)
                        leaf=[tuple(aa),tuple((aa+bb)*.5+feather),tuple(bb),tuple((aa+bb)*.5+feather*.6+Vector((0,0,.012)))]
                        p.add('leaf_light' if i%3==0 else 'leaf',leaf,[(0,1,2),(0,2,3)],True)
    else:
        for i in range(10):
            a=i*math.tau/10+rng.random()*.3;r=rng.uniform(.04,.18)*scale
            c=(math.cos(a)*r,math.sin(a)*r,height+rng.uniform(.15,.29)*scale)
            G._ellipsoid(p,'leaf_light' if i%4==0 else 'leaf_dark',c,(.11*scale,.09*scale,.12*scale),rng,seg=8,rings=4,noise=.09)
            if i%2==0:
                for k in range(4):
                    phi=k*math.tau/4
                    G._ellipsoid(p,'flower_white' if seed%3 else 'flower_rose',(c[0]+math.cos(phi)*.035*scale,c[1]+math.sin(phi)*.035*scale,c[2]+.105*scale),(.035*scale,.035*scale,.028*scale),rng,seg=6,rings=3,noise=.06)
    return p


def planter(x,y,z=0,scale=1,seed=1,palm=False):
    """Flowering terracotta planter, or a tall glazed-pot palm; origin is floor."""
    return _plant(scale,seed,palm).emit('Conservatory palm' if palm else 'Terrace flowering planter',(x,y,z))


def cafe_table(x,y,z=0,angle=0,seed=1):
    """A .8m round marble bistro table with two cushioned woven chairs."""
    p = _Parts()
    p.absorb(_table(radius=.38,height=.60,terrace=True))
    p.absorb(_armchair(wicker=True),(0,.69,0))
    p.absorb(_armchair(wicker=True),(0,-.69,0),math.pi)
    return p.emit('Terrace cafe setting %d'%seed,(x,y,z),angle)


def glasshouse(x_offset=0,y_offset=0,z_offset=0):
    """Furnish fixed glasshouse around its pool and copper hearth.

    Pool keep-out x=[-14.75,-12.85], y=[-1.30,2.50].
    Hearth keep-out centered [-10.45,1.85], radius .64.
    """
    p = _Parts()
    floor=.29
    p.absorb(_sofa(1.75,seed=11),(-13.85,3.55,floor))
    p.absorb(_sofa(1.7,seed=12),(-10.80,3.52,floor))
    # Two distinct seating zones flank the fireplace without occupying the pool.
    p.absorb(_armchair('terracotta'),(-11.74,1.83,floor),-.40)
    p.absorb(_armchair('moss'),(-9.15,2.09,floor),-math.pi/2)
    p.absorb(_armchair('terracotta'),(-9.15,.88,floor),-math.pi/2)
    p.absorb(_table(.24,.41),(-9.46,1.45,floor))
    p.absorb(_table(.29,.39),(-11.28,2.75,floor))
    p.absorb(_table(.25,.39),(-14.94,3.13,floor))
    p.absorb(_lounger(),(-12.02,-.47,floor),math.pi)
    p.absorb(_lounger(),(-10.96,-.47,floor),math.pi)
    p.absorb(_table(.25,.38),(-11.49,-.30,floor))
    p.absorb(_armchair('moss'),(-9.36,-.71,floor),-.48)
    p.absorb(_table(.25,.42),(-10.0,-.69,floor))
    for i,(x,y,s) in enumerate([(-15.09,3.66,.80),(-12.32,3.67,.86),(-9.09,3.70,.9),(-8.98,-1.14,.84)]):
        p.absorb(_plant(s,30+i,palm=True),(x,y,floor))
    for i,(x,y) in enumerate([(-15.13,-1.05),(-12.46,2.89),(-9.04,.12),(-10.05,3.68)]):
        p.absorb(_plant(.7,42+i),(x,y,floor))
    return p.emit('Glasshouse furnished lounge',(x_offset,y_offset,z_offset))


def wedding_sign(x,y,z=0,angle=0):
    """One discreet ivory easel with the single inscription J&Z (Julia first).

    Local front faces -Y. The two sided physical board only has text on its front.
    """
    p = _Parts()
    # A modest .62 wide welcome plaque on an oak easel.
    G._cushion(p,'linen',(0,0,.66),(.64,.065,.65),bevel=.023)
    for xx in (-.26,.26):
        G._tube(p,'wood',(xx,-.13,0),(xx,0,.91),.019,sides=7)
    G._tube(p,'wood',(0,.27,0),(0,.04,.84),.02,sides=7)
    G._tube(p,'wood',(-.36,-.065,.37),(.36,-.065,.37),.022,sides=7)
    # A tiny foliage sprig frames the inscription without extra written content.
    for i in range(5):
        xx=-.14+i*.068
        G._ellipsoid(p,'leaf',(xx,-.039,.44),(.033,.009,.016),seg=7,rings=3,noise=0)
    objects = p.emit('Wedding welcome easel',(x,y,z),angle)
    text = bpy.data.curves.new('Julia and Zach initials','FONT')
    text.body='J&Z'
    text.align_x='CENTER';text.align_y='CENTER'
    text.size=.225;text.extrude=.0009;text.bevel_depth=.0005;text.resolution_u=5
    text.materials.append(_MATERIALS['sign_ink'])
    obj=bpy.data.objects.new('Wedding initials J&Z',text)
    bpy.context.collection.objects.link(obj)
    obj.rotation_euler=(math.pi/2,0,angle)
    obj.location=(x+.041*math.sin(angle),y-.041*math.cos(angle),z+.69)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True);bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    objects.append(obj)
    return objects
