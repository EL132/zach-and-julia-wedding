import bpy, math, random, os, sys, json, time
from mathutils import Vector
from collections import defaultdict
from pathlib import Path
# Run with Blender: blender --background --python scripts/maryhill/build_estate.py -- [options]
import argparse
WORK = Path(__file__).resolve().parent
SITE = WORK.parent.parent
parser = argparse.ArgumentParser(description='Build the Maryhill miniature and export its browser model.')
parser.add_argument('--assets-dir', type=Path, default=SITE / 'public/rendering')
parser.add_argument('--output-dir', type=Path, default=SITE / '.generated/maryhill')
parser.add_argument('--skip-render', action='store_true')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
OUT = args.output_dir.resolve()
ASSET = args.assets_dir.resolve()
OUT.mkdir(parents=True, exist_ok=True)
ASSET.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(WORK))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for m in list(bpy.data.materials):bpy.data.materials.remove(m)
random.seed(27)
M={}; BUCKET=defaultdict(lambda:[[],[]]); PART='Estate'
def rgb(h):
 h=h.lstrip('#');c=[int(h[i:i+2],16)/255 for i in (0,2,4)];return tuple(((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in c)
def mat(n,h,rough=.7,metal=0):
 m=bpy.data.materials.new(n);m.diffuse_color=(*rgb(h),1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;M[n]=m;return m
for n,h,r,me in [('Limestone','#d8c9ac',.84,0),('Facade','#d9cdbb',.82,0),('Trim','#ede2ce',.66,0),('Foundation','#b0a995',.87,0),('Slate','#444c4c',.68,.12),('SlateSeams','#626969',.72,.1),('PatinatedCopper','#638b7e',.58,.6),('Copper','#bb8153',.4,.75),('Glass','#486769',.24,.35),('WindowWarm','#917c54',.4,.1),('WindowFrames','#d2c6af',.5,0),('Bronze','#3b473d',.5,.6),('Timber','#6e5140',.88,0),('RedRoof','#aa6647',.8,0),('TileSeams','#c08a64',.8,0),('SugarWalls','#dad5be',.8,0),('RoofBeige','#827b67',.8,0),('Gravel','#d4cbb5',1,0),('Pavers','#c7c5ae',.9,0),('PoolEdge','#e6dcc7',.64,0),('PoolTile','#2c6a61',.35,0),('PoolWater','#397c78',.2,.28),('CourtGreen','#5c8068',.96,0),('CourtLine','#e0debe',.78,0),('Ivory','#f8f4ea',.9,0),('FoliageIvy','#637349',.9,0),('Soil','#625848',1,0)]:mat(n,h,r,me)
# An exportable translucent glass roof, restrained to preserve legibility.
p=M['Glass'].node_tree.nodes.get('Principled BSDF');p.inputs['Alpha'].default_value=.78
M['Glass'].surface_render_method='DITHERED'
def mesh(name,verts,faces,ma):
 v,f=BUCKET[(PART,ma)];k=len(v);v.extend(verts);f.extend(tuple(k+i for i in face) for face in faces)
def box(n,c,d,ma,angle=0):
 x,y,z=c;w,l,h=(v/2 for v in d);co=math.cos(angle);si=math.sin(angle)
 vv=[(x+a*co-b*si,y+a*si+b*co,z+cc) for a,b,cc in [(-w,-l,-h),(w,-l,-h),(w,l,-h),(-w,l,-h),(-w,-l,h),(w,-l,h),(w,l,h),(-w,l,h)]]
 mesh(n,vv,[(0,3,2,1),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)],ma)
def beam(a,b,r,ma,n='detail',sides=6):
 a,b=Vector(a),Vector(b);d=b-a;u=d.normalized().cross(Vector((0,0,1)))
 if u.length<.1:u=d.normalized().cross(Vector((0,1,0)))
 u.normalize();v=d.normalized().cross(u);verts=[]
 for p in (a,b):
  for i in range(sides):verts.append(tuple(p+r*(u*math.cos(i*math.tau/sides)+v*math.sin(i*math.tau/sides))))
 mesh(n,verts,[tuple(range(sides-1,-1,-1)),tuple(range(sides,2*sides))]+[(i,(i+1)%sides,(i+1)%sides+sides,i+sides) for i in range(sides)],ma)
def cone(n,x,y,z,r1,r2,h,ma,segments=20):
 verts=[(x+r*math.cos(i*math.tau/segments),y+r*math.sin(i*math.tau/segments),zz) for zz,r in [(z,r1),(z+h,r2)] for i in range(segments)]
 mesh(n,verts,[tuple(range(segments-1,-1,-1)),tuple(range(segments,2*segments))]+[(i,(i+1)%segments,(i+1)%segments+segments,i+segments) for i in range(segments)],ma)
def poly(n,pts,z,ma):mesh(n,[(x,y,z) for x,y in pts],[tuple(range(len(pts)))],ma)
def annulus(n,outer,inner,z,ma):
 pts=[(x,y,z) for x,y in outer+inner];N=len(outer);mesh(n,pts,[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)],ma)
def rr(x,y,w,d,r=.2,N=8):
 return [(x+sx*(w/2-r)+r*math.cos(a),y+sy*(d/2-r)+r*math.sin(a)) for sx,sy,a0 in [(1,1,0),(-1,1,math.pi/2),(-1,-1,math.pi),(1,-1,math.pi*1.5)] for a in [a0+i*math.pi/2/N for i in range(N+1)]]
def path(pts,width=.75,z=.045,ma='Gravel'):
 for a,b in zip(pts,pts[1:]):
  ax,ay=a;bx,by=b;angle=math.atan2(by-ay,bx-ax);box('Garden path',((ax+bx)/2,(ay+by)/2,z),(math.hypot(bx-ax,by-ay)+.08,width,.025),ma,angle)
 for x,y in pts:cone('Path join',x,y,z-.012,width/2,width/2,.025,ma,16)
def window(x,y,z,w=.45,h=1.0,face=-1,arch=False,ma='WindowFrames'):
 # front-facing local window; face = -1 garden, +1 entrance.
 box('Window surround',(x,y,z),(w+.13,.10,h+.15),'Trim')
 yy=y+face*.061;box('Recessed glazing',(x,yy,z),(w,.025,h),'Glass')
 yy+=face*.022
 for dx in [-w/2,0,w/2]:box('Window mullion',(x+dx,yy,z),(.035,.035,h),ma)
 for dz in [-h/2,-h/6,h/6,h/2]:box('Window transom',(x,yy,z+dz),(w,.034,.028),ma)
 box('Stone sill',(x,y+face*.03,z-h/2-.09),(w+.25,.23,.09),'Trim')
 if arch:
  for i in range(12):
   a=i*math.pi/12;b=(i+1)*math.pi/12;beam((x+w*.53*math.cos(a),yy,z+h/2+.01+w*.3*math.sin(a)),(x+w*.53*math.cos(b),yy,z+h/2+.01+w*.3*math.sin(b)),.035,'Trim',sides=5)
def roof_face(verts,ma='Slate',seams='SlateSeams'):
 mesh('Roof plane',verts,[tuple(range(len(verts)))],ma)
 if len(verts)!=4:return
 a,b,c,d=[Vector(v) for v in verts];length=(b-a).length;rise=(d-a).length
 # Fine courses across each roof slope, with staggered short seams.
 for j in range(1,max(2,int(rise/.19))):
  t=j/max(2,int(rise/.19));u=a.lerp(d,t);v=b.lerp(c,t);u.z+=.012;v.z+=.012;beam(u,v,.012,seams,sides=4)
 for j in range(1,max(2,int(length/.24))):
  t=j/max(2,int(length/.24));u=a.lerp(b,t);v=d.lerp(c,t);u.z+=.009;v.z+=.009;beam(u,v,.009,seams,sides=4)
def gable(x,y,w,d,z,h,ma='RedRoof',angle=0):
 def T(a,b,c):return (x+a*math.cos(angle)-b*math.sin(angle),y+a*math.sin(angle)+b*math.cos(angle),c)
 W=w/2+.14;D=d/2+.16
 roof_face([T(-W,-D,z),T(W,-D,z),T(W,0,z+h),T(-W,0,z+h)],ma,'TileSeams' if ma=='RedRoof' else 'SlateSeams')
 roof_face([T(W,D,z),T(-W,D,z),T(-W,0,z+h),T(W,0,z+h)],ma,'TileSeams' if ma=='RedRoof' else 'SlateSeams')
 for xx in [-w/2,w/2]:mesh('Gable infill',[T(xx,-d/2,z),T(xx,d/2,z),T(xx,0,z+h)],[(0,1,2)],'SugarWalls')
 beam(T(-W,0,z+h+.015),T(W,0,z+h+.015),.052,ma,sides=8)
def hipped(x,y,w,d,z,h):
 W=w/2;D=d/2;Kx=W-.75;Ky=D-.65;Z=z+h*.63;top=z+h
 lower=[(x-W,y-D,z),(x+W,y-D,z),(x+W,y+D,z),(x-W,y+D,z)]
 knee=[(x-Kx,y-Ky,Z),(x+Kx,y-Ky,Z),(x+Kx,y+Ky,Z),(x-Kx,y+Ky,Z)]
 for i in range(4):roof_face([lower[i],lower[(i+1)%4],knee[(i+1)%4],knee[i]])
 a=(x-Kx+.6,y,top);b=(x+Kx-.6,y,top)
 roof_face([knee[0],knee[1],b,a]);roof_face([knee[2],knee[3],a,b]);mesh('Roof hips',[knee[1],knee[2],b],[(0,1,2)],'Slate');mesh('Roof hips',[knee[3],knee[0],a],[(0,1,2)],'Slate');beam(a,b,.055,'SlateSeams')
def balustrade(x,y,z,w,depth=0):
 for zz in [z,z+.43]:box('Balcony coping',(x,y,zz),(w,.12,.09),'Trim')
 for i in range(int(w/.16)+1):cone('Baluster',x-w/2+i*w/int(w/.16),y,z,.026,.025,.4,'Trim',8)
def curved_pediment(x,y,z,w,face):
 # semicircular crest on each end bay
 for r in [w/2,w/2-.09]:
  for j in range(24):
   a=j*math.pi/24;b=(j+1)*math.pi/24
   beam((x+r*math.cos(a),y,z+r*.68*math.sin(a)),(x+r*math.cos(b),y,z+r*.68*math.sin(b)),.055,'Trim')
 polypts=[(x-w/2,y,z),(x+w/2,y,z)]+[(x+w/2*math.cos(j*math.pi/24),y,z+w*.34*math.sin(j*math.pi/24)) for j in range(25)]
 mesh('Curved pediment',polypts,[tuple(range(len(polypts)))],'PatinatedCopper')
def manor():
 global PART;PART='Hill House';x=16;y=-1.5;w=9.6;d=4.8;bottom=.12
 box('Footing',(x,y,.27),(w+.35,d+.3,.5),'Foundation');box('Pale masonry',(x,y,2.35),(w,d,4.25),'Facade')
 for zz,th,extra in [(.55,.16,.13),(2.02,.1,.12),(4.36,.14,.18),(4.52,.13,.35),(4.63,.08,.44)]:box('String course',(x,y,zz),(w+extra,d+extra,th),'Trim')
 for face in [-1,1]:
  fy=y+face*d/2
  for j in range(11):
   wx=x-4.35+j*.87
   window(wx,fy+face*.025,1.24,.43,1.05,face,True)
   window(wx,fy+face*.025,3.04,.45,1.12,face)
  for dx in [-4.65,-3.55,3.55,4.65]:
   box('Corner pilaster',(x+dx,fy+face*.07,2.54),(.19,.14,3.57),'Trim')
   box('Pilaster capital',(x+dx,fy+face*.1,4.25),(.32,.23,.16),'Trim')
  for dx in [-3.95,3.95]:curved_pediment(x+dx,fy+face*.1,4.7,1.78,face)
 # End walls have projecting central bays.
 for side in [-1,1]:
  sx=x+side*w/2
  for yy in [y-1.4,y,y+1.4]:
   for zz in [1.23,3.03]:
    box('End window trim',(sx+side*.055,yy,zz),(.12,.56,1.22),'Trim');box('End window glass',(sx+side*.121,yy,zz),(.025,.43,1.07),'Glass')
    for off in [-.21,0,.21]:box('End mullion',(sx+side*.14,yy+off,zz),(.026,.03,1.07),'WindowFrames')
    for off in [-.52,-.17,.17,.52]:box('End transom',(sx+side*.14,yy,zz+off),(.027,.43,.025),'WindowFrames')
 # Garden terrace balcony and its slender classical rail.
 box('Garden balcony',(x,y-d/2-.4,2.04),(4.95,.88,.18),'Trim');balustrade(x,y-d/2-.81,2.16,4.8)
 for dx in [-2.15,2.15]:cone('Balcony pillar',x+dx,y-d/2-.56,.54,.11,.09,1.42,'Trim',16)
 for dx in [-1.42,0,1.42]:
  box('Garden awning',(x+dx,y-d/2-.36,.99),(.83,.72,.045),'Ivory',0)
 # Entrance portico and triangular pediment on opposite elevation.
 for dx in [-1.45,-.5,.5,1.45]:
  xx=x+dx;yy=y+d/2+.63
  cone('Column plinth',xx,yy,.5,.20,.20,.16,'Trim',20);cone('Portico column',xx,yy,.66,.15,.115,3.58,'Trim',20);cone('Capital',xx,yy,4.22,.23,.23,.18,'Trim',20)
 box('Portico entablature',(x,y+d/2+.3,4.53),(3.9,1.18,.28),'Trim')
 v=[(x-2.06,y+d/2+.92,4.68),(x+2.06,y+d/2+.92,4.68),(x,y+d/2+.92,5.75)]
 mesh('Entrance pediment',v,[(0,1,2)],'Facade')
 for a,b in [(v[0],v[2]),(v[2],v[1]),(v[1],v[0])]:beam(a,b,.09,'Trim')
 for i in range(5):box('Entrance stair',(x,y+d/2+1.15+i*.15,.5-i*.09),(3.5,.35,.15),'Limestone')
 hipped(x,y,10.04,5.17,4.64,1.93)
 # Green copper dormers, repeated along both roof slopes.
 for face in [-1,1]:
  for dx in [-3.05,-2.04,-1.02,0,1.02,2.04,3.05]:
   xx=x+dx;yy=y+face*2.01
   box('Dormer green casing',(xx,yy,5.14),(.65,.60,.83),'PatinatedCopper')
   window(xx,yy+face*.33,5.13,.4,.59,face)
   # gently arched copper dormer cover
   for j in range(12):
    a=j*math.pi/12;b=(j+1)*math.pi/12;xx1=xx+.39*math.cos(a);xx2=xx+.39*math.cos(b);zz1=5.53+.16*math.sin(a);zz2=5.53+.16*math.sin(b)
    mesh('Curved copper dormer hood',[(xx1,yy-.4,zz1),(xx2,yy-.4,zz2),(xx2,yy+.4,zz2),(xx1,yy+.4,zz1)],[(0,1,2,3)],'PatinatedCopper')
 for dx in [-3.4,-1.8,1.8,3.4]:
  for yy in [y-.8,y+.8]:box('Roof chimney',(x+dx,yy,6.27),(.28,.38,.7),'Limestone');box('Chimney cap',(x+dx,yy,6.64),(.38,.46,.09),'Trim')
 # Signature square pedestal, open bell cupola, dome, spire.
 box('Cupola pedestal',(x,y,6.86),(.92,.91,.83),'PatinatedCopper')
 for face in [-1,1]:
  box('Cupola pedestal panel',(x,y+face*.465,6.82),(.56,.027,.45),'Trim')
 box('Cupola balcony',(x,y,7.26),(1.26,1.22,.13),'Trim')
 for dx in [-.5,.5]:
  for dy in [-.48,.48]:cone('Cupola pillar',x+dx,y+dy,7.34,.065,.06,.83,'PatinatedCopper',10)
 for face in [-1,1]:balustrade(x,y+face*.53,7.36,1.1)
 cone('Cupola cornice',x,y,8.12,.72,.69,.14,'PatinatedCopper',8)
 for j in range(8):
  a=j/8*math.pi/2;b=(j+1)/8*math.pi/2
  cone('Cupola dome',x,y,8.26+.57*math.sin(a),.7*math.cos(a),.7*math.cos(b),.57*(math.sin(b)-math.sin(a)),'PatinatedCopper',20)
 cone('Spire',x,y,8.82,.12,0,.58,'Bronze',12)
 beam((x-.26,y,9.22),(x+.26,y,9.22),.023,'Bronze')
 print('Hill House geometry complete',flush=True)
manor()
def building(name,x,y,w,d,height=1.65,rise=1.2,roof='RedRoof',angle=0,dormers=False,curve=0):
 global PART;PART=name
 starts={k:len(v[0]) for k,v in BUCKET.items()}
 box(name,(0,0,.15),(w+.15,d+.12,.28),'Foundation');box(name,(0,0,height/2+.14),(w,d,height),'SugarWalls')
 box('Eaves',(0,0,height+.17),(w+.18,d+.2,.12),'Trim')
 for face in [-1,1]:
  N=max(2,int(w/.92))
  for j in range(N):
   xx=-w/2+.48+j*(w-.96)/max(1,N-1);window(xx,face*(d/2+.01),.95,.42,.92,face)
  box('Long facade band',(0,face*(d/2+.055),.46),(w,.085,.08),'Trim')
 gable(0,0,w,d,height+.25,rise,roof)
 if dormers:
  N=max(2,int(w/1.5))
  for face in [-1,1]:
   for j in range(N):
    xx=-w/2+.9+j*(w-1.8)/max(1,N-1);yy=face*(d/2-.23)
    box('Guest dormer',(xx,yy,height+.57),(.51,.55,.58),'SugarWalls');window(xx,yy+face*.3,height+.59,.28,.37,face)
    gable(xx,yy,.63,.65,height+.88,.24,roof)
 # Dark timber gable trim and small central end windows.
 for face in [-1,1]:
  xx=face*(w/2+.05)
  for yy in [-d/2,d/2]:beam((xx,yy,height+.25),(xx,0,height+.25+rise),.04,'Timber')
  box('End window',(xx,0,1.05),(.08,.55,.92),'Glass')
 co=math.cos(angle);si=math.sin(angle)
 for key,v in BUCKET.items():
  start=starts.get(key,0)
  for i in range(start,len(v[0])):
   xx,yy,zz=v[0][i];yy+=curve*xx*xx;v[0][i]=(x+xx*co-yy*si,y+xx*si+yy*co,zz)
# Reconstructed footprint from the supplied aerial: two distinct destinations and broad lawns.
building('Sugar Club restaurant',-12.4,-3.7,10.5,3.1,2.05,1.45)
building('West guest wing',-17.4,1.45,10.5,2.7,1.58,1.22,'RedRoof',math.pi/2,True)
building('Garden guest wing',-12.3,6.1,10.3,2.55,1.5,1.02,'RoofBeige',0,True)
building('Sugar Club lobby',-7.0,3.6,5.1,2.4,1.86,1.14,'RedRoof',math.pi/2)
building('Curved pool wing',-3.0,5.0,8.8,2.6,1.65,1.08,'RoofBeige',-.22,True,curve=-.025)
building('East accommodation wing',1.4,-1.7,10.7,2.7,1.68,1.05,'RoofBeige',math.pi/2-.36,True)
building('Meetings north wing',-13.0,10.5,9.7,2.8,1.45,1.17,'RedRoof')
building('Health club',-10.5,13.3,5.9,2.7,1.45,1.2,'RedRoof')
building('Grounds cottage',5.8,12.5,2.2,1.55,1.05,.62,'RoofBeige')
building('Woodland cottage',10.8,10.2,2.2,1.55,1.05,.62,'RoofBeige',.2)
building('Hill House annex',22.75,-1.05,4.0,3.2,1.65,1.05,'Slate',0,True)
# Central greenhouse hall; detailed frame and a glimpse of the fireplace/pool.
PART='Sugar Pool glasshouse'
mat('RoofGlass','#a2c2b4',.22,.1);p=M['RoofGlass'].node_tree.nodes.get('Principled BSDF');p.inputs['Alpha'].default_value=.17;M['RoofGlass'].surface_render_method='DITHERED'
x=-12.1;y=1.2;w=6.8;d=5.7;z=2.0;h=1.55
box('Poolhall stone floor',(x,y,.17),(w,d,.24),'Limestone')
for face in [-1,1]:
 box('Poolhall lower wall',(x,y+face*d/2,.53),(w,.15,.86),'SugarWalls')
 box('Glass wall',(x,y+face*d/2,1.45),(w,.06,1.1),'RoofGlass')
for face in [-1,1]:
 yy=y+face*d/2
 mesh('Glass roof',[(x-w/2,yy,z),(x+w/2,yy,z),(x+w/2,y,z+h),(x-w/2,y,z+h)],[(0,1,2,3)],'RoofGlass')
 for i in range(12):
  xx=x-w/2+i*w/11;beam((xx,yy,z),(xx,y,z+h),.047,'PatinatedCopper')
 for j in range(1,5):
  t=j/5;beam((x-w/2,yy*(1-t)+y*t,z+h*t),(x+w/2,yy*(1-t)+y*t,z+h*t),.032,'PatinatedCopper')
for dx in [-w/2,-w/4,0,w/4,w/2]:
 for dy in [-d/2,0,d/2]:beam((x+dx,y+dy,.2),(x+dx,y+dy,z+(h if dy==0 else 0)),.068,'Timber')
beam((x-w/2,y,z+h),(x+w/2,y,z+h),.075,'PatinatedCopper')
# Copper hearth visible beneath the roof.
cone('Green tiled hearth',x+1.65,y+.65,.29,.59,.59,.32,'PoolTile',32)
cone('Copper hood',x+1.65,y+.65,1.15,.66,.15,.59,'Copper',32)
cone('Copper flue',x+1.65,y+.65,1.74,.15,.15,1.5,'Copper',24)
for dx in [-.4,.4]:
 for dy in [-.4,.4]:beam((x+1.65+dx,y+.65+dy,.55),(x+1.65+dx,y+.65+dy,1.22),.026,'Bronze')
# Pools and generous warm stone terraces.
def pool(x,y,w,d,shape='rect'):
 global PART
 if shape=='rect': outer=rr(x,y,w+.32,d+.32,.24,8);inner=rr(x,y,w,d,.2,8)
 else:
  N=64;inner=[];outer=[]
  for i in range(N):
   a=i*math.tau/N;rx=w/2*(1+.10*math.sin(3*a));ry=d/2*(1+.13*math.sin(2*a))
   inner.append((x+rx*math.cos(a),y+ry*math.sin(a)));outer.append((x+(rx+.18)*math.cos(a),y+(ry+.18)*math.sin(a)))
 poly('Pool dark basin',outer,.185,'PoolTile');poly('Pool water',inner,.245,'PoolWater');annulus('Pale pool coping',outer,inner,.28,'PoolEdge')
 # underwater tile grid remains subtle under the surface
 if shape=='rect':
  for j in range(1,int(w/.28)):
   xx=x-w/2+j*.28;beam((xx,y-d/2+.12,.247),(xx,y+d/2-.12,.247),.008,'PoolTile',sides=4)
  for j in range(1,int(d/.28)):
   yy=y-d/2+j*.28;beam((x-w/2+.12,yy,.247),(x+w/2-.12,yy,.247),.008,'PoolTile',sides=4)
 for xx in [x-w/2+.35,x-w/2+.7]:
  beam((xx,y+d/2+.24,.29),(xx,y+d/2+.22,.61),.022,'Bronze');beam((xx,y+d/2+.22,.61),(xx,y+d/2-.12,.62),.022,'Bronze');beam((xx,y+d/2-.12,.62),(xx,y+d/2-.18,.33),.022,'Bronze')
PART='Hill House pool terrace'
# Elevated dining terrace, planted middle garden, and long pool deck visible in the aerial.
poly('Full terrace footprint',rr(16,-8.35,12.6,9.6,.45),.13,'Gravel')
box('Upper terrace masonry',(16,-5.1,.33),(10.35,2.55,.61),'Limestone')
box('Upper terrace cap',(16,-5.1,.64),(10.55,2.68,.08),'PoolEdge')
for xx in [10.77,21.23]:box('Upper terrace parapet',(xx,-5.12,.89),(.17,2.7,.48),'Trim')
# Low balustrades flank the generous central staircase.
for xx in [12.4,19.6]:balustrade(xx,-6.43,.72,3.0)
for j in range(6):box('Central terrace stairs',(16,-6.58-j*.15,.58-j*.075),(2.45,.32,.13),'PoolEdge')
pool(16,-11.0,8.6,1.7)
for i in range(23):
 xx=9.9+i*.55;beam((xx,-12.9,.141),(xx,-6.75,.141),.007,'Pavers',sides=4)
for j in range(12):
 yy=-12.85+j*.54;beam((9.87,yy,.142),(22.13,yy,.142),.007,'Pavers',sides=4)
for j in range(4):box('Lawn terrace steps',(16,-13.18-j*.17,.14-j*.03),(2.6,.3,.06),'PoolEdge')
# Raised planted islands form the lush, asymmetric terrace garden.
for xx,yy,ww,dd in [(11.9,-7.75,1.5,1.65),(13.7,-9.25,1.4,.8),(18.55,-7.65,1.35,1.7),(20.6,-9.15,1.55,.75)]:
 poly('Terrace garden border',rr(xx,yy,ww+.17,dd+.17,.33),.28,'PoolEdge')
 poly('Terrace garden soil',rr(xx,yy,ww,dd,.27),.30,'Soil')
PART='Sugar Club pools';poly('Courtyard paving',rr(-3.1,-.8,8.2,9.6,.75),.13,'Gravel');pool(-3.1,-.9,4.2,5.9,'organic')
poly('Hot spring terrace',rr(-13.8,-6.4,6.25,2.4,.35),.12,'Gravel');pool(-14.4,-6.3,2.9,1.05)
PART='Indoor Sugar Pool';pool(-13.8,.6,1.9,3.8)
PART='Estate paths'
# The connector follows the back edge of the lawn, leaving the broad foreground open.
path([(2.6,4.4),(6.5,2.8),(11.2,1.0),(16,1.0)],.9)
path([(-18,-8.9),(-11,-9.7),(-4,-10.7),(3,-12.7),(9,-14.9),(16,-14.4)],.8)
path([(16,-13.7),(16,-14.4),(23.6,-12.4),(25.5,-6.4),(24,1.7),(18,5),(13,7.5),(8,11.9)],.83)
path([(-20,-7.4),(-21,1),(-20,9),(-16,15.6),(-9,16),(0,15.5),(6,13.8),(13,7.5)],.8)
path([(3.1,3.9),(4.4,-1),(3.4,-6.4),(3,-12.7)],.65)
path([(11.2,1),(10.4,-5.2),(8.8,-9.8),(9,-14.9)],.65)
path([(6,13.8),(5.8,11.7)],.5)
path([(13,7.5),(11,9.4)],.5)
PART='Covered walkway';a=(2.6,4.4);b=(11.2,1.0);ang=math.atan2(b[1]-a[1],b[0]-a[0]);length=math.dist(a,b)
box('Walkway roof',((a[0]+b[0])/2,(a[1]+b[1])/2,1.43),(length,.7,.06),'RoofGlass',ang)
for i in range(18):
 t=i/17;xx=a[0]*(1-t)+b[0]*t;yy=a[1]*(1-t)+b[1]*t
 for face in [-1,1]:
  px=xx-face*.34*math.sin(ang);py=yy+face*.34*math.cos(ang);beam((px,py,.06),(px,py,1.46),.033,'Trim')
for face in [-1,1]:beam((a[0]-face*.34*math.sin(ang),a[1]+face*.34*math.cos(ang),1.46),(b[0]-face*.34*math.sin(ang),b[1]+face*.34*math.cos(ang),1.46),.045,'Trim')
# Two visible tennis courts sit behind the curved pool wing, as shown in the reference.
PART='Tennis courts'
for xx in [-3.5,.85]:
 yy=10.;box('Court border',(xx,yy,.075),(4.02,6.82,.15),'Pavers');box('Court surface',(xx,yy,.157),(3.7,6.5,.028),'CourtGreen')
 for dx in [-1.58,-1.23,1.23,1.58]:beam((xx+dx,yy-2.65,.178),(xx+dx,yy+2.65,.178),.018,'CourtLine',sides=4)
 for yoff in [-2.65,2.65]:beam((xx-1.58,yy+yoff,.178),(xx+1.58,yy+yoff,.178),.018,'CourtLine',sides=4)
 for yoff in [-1.2,1.2]:beam((xx-1.23,yy+yoff,.178),(xx+1.23,yy+yoff,.178),.016,'CourtLine',sides=4)
 beam((xx,yy-1.2,.178),(xx,yy+1.2,.178),.015,'CourtLine',sides=4)
 for dx in [-1.86,1.86]:
  for yoff in [-3.25,-1.6,0,1.6,3.25]:beam((xx+dx,yy+yoff,.17),(xx+dx,yy+yoff,1.08),.022,'Bronze')
  for zz in [.35,.72,1.08]:beam((xx+dx,yy-3.25,zz),(xx+dx,yy+3.25,zz),.012,'Bronze')
 # Fine lattice and white net tape; no opaque fencing obscures the players.
 for i in range(29):
  off=-1.73+i*3.46/28;beam((xx+off,yy,.19),(xx+off,yy,.64),.008,'Bronze',sides=4)
 for zz in [.25,.38,.51]:beam((xx-1.74,yy,zz),(xx+1.74,yy,zz),.008,'Bronze',sides=4)
 beam((xx-1.75,yy,.66),(xx+1.75,yy,.66),.021,'CourtLine')
 for dx in [-1.77,1.77]:beam((xx+dx,yy,.17),(xx+dx,yy,.75),.035,'Bronze')
print('Sugar Club, pools and grounds geometry complete',flush=True)
# Build accumulated meshes; group architecture semantically for the editable file.
for (part,ma),(vv,ff) in BUCKET.items():
 coll=bpy.data.collections.get(part)
 if not coll:coll=bpy.data.collections.new(part);bpy.context.scene.collection.children.link(coll)
 me=bpy.data.meshes.new(part+' '+ma);me.from_pydata(vv,[],ff);me.materials.append(M[ma]);me.update();ob=bpy.data.objects.new(part+' | '+ma,me);coll.objects.link(ob)
# Terrain is a softly irregular ellipse with an actual alpha perimeter.
PART='Ground';m=mat('Ground_Fade','#ffffff',.97,0);p=m.node_tree.nodes.get('Principled BSDF');vc=m.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='TerrainColor';m.node_tree.links.new(vc.outputs['Color'],p.inputs['Base Color']);m.node_tree.links.new(vc.outputs['Alpha'],p.inputs['Alpha']);m.surface_render_method='DITHERED'
vv=[(0,0,-.02)];colors=[(*rgb('#536f32'),1)];ff=[];NT=160;NR=40
for ring in range(1,NR+1):
 rad=ring/NR
 for i in range(NT):
  t=i*math.tau/NT;edge=1+.045*math.sin(3*t+.4)+.018*math.sin(7*t);xx=34*rad*math.cos(t)*edge;yy=25*rad*math.sin(t)*edge
  height=-.025+max(0,rad-.45)*(.07*math.sin(xx*.5)+.05*math.cos(yy*.6));vv.append((xx,yy,height))
  fade=max(0,min(1,(1-rad)/.17));fade=fade*fade*(3-2*fade);base=rgb('#536f32');variation=.97+.09*math.sin(xx*.53)*math.cos(yy*.47)+random.uniform(-.025,.025)
  colors.append(tuple(v*variation for v in base)+(fade,))
for i in range(NT):ff.append((0,1+i,1+(i+1)%NT))
for ring in range(NR-1):
 a=1+ring*NT;b=a+NT
 for i in range(NT):j=(i+1)%NT;ff.append((a+i,b+i,b+j,a+j))
me=bpy.data.meshes.new('Feathered landscape');me.from_pydata(vv,[],ff);me.materials.append(m);attr=me.color_attributes.new(name='TerrainColor',type='FLOAT_COLOR',domain='POINT')
for i,col in enumerate(colors):attr.data[i].color=col
ob=bpy.data.objects.new('Ground_Fade',me);bpy.context.collection.objects.link(ob)
# Gardens and terrace furniture.
import garden_assets as G
import interior_assets as I
leaf_overrides={}
for key,hue in [('leaf_deep','#304c27'),('leaf_olive','#46672d'),('leaf_sage','#5a7836'),('leaf_light','#78904a')]:leaf_overrides[key]=mat('Garden '+key,hue,.9,0)
G.setup(leaf_overrides);I.setup();random.seed(16)
I.glasshouse()
# Main-house dining terrace: tables, scalloped umbrellas, flowers and clipped green planting.
for n,(xx,yy) in enumerate([(11.85,-5.12),(13.7,-5.12),(18.3,-5.12),(20.15,-5.12)]):
 I.cafe_table(xx,yy,.685,angle=math.pi/2,seed=n+8);G.parasol(xx,yy,.685,radius=.7,height=1.26)
for n,(xx,yy) in enumerate([(11,-9.1),(14.45,-7.9),(18.3,-9.25),(20.85,-7.7)]):
 I.cafe_table(xx,yy,.15,angle=.3+n*.7,seed=n+24);G.parasol(xx,yy,.15,radius=.64,height=1.3)
for i in range(9):
 xx=10.9+i*1.27;G.lounger(xx,-12.35,.16,angle=0)
 if i%2==0:G.parasol(xx+.35,-12.3,.16,radius=.56,height=1.17)
for n,xx in enumerate([11.0,12.9,14.6,17.4,19.1,21.0]):I.planter(xx,-4.08,.68,scale=.72,seed=n+52)
for xx,yy in [(11.8,-7.6),(12.2,-8.3),(13.5,-9.2),(18.6,-7.6),(18.3,-8.2),(20.8,-9.2)]:
 G.shrub(xx,yy,.3,scale=.8,seed=int(abs(xx*yy)));I.planter(xx+.36,yy+.17,.31,scale=.62,seed=int(xx*11))
for i in range(16):
 for xx in [9.73,22.28]:G.shrub(xx,-6.7-i*.4,.1,scale=.53,seed=i+int(xx)*50)
I.wedding_sign(17.25,-6.7,.16)
# Pool-courtyard perimeter, retaining walkable gaps and views into the lounge.
for n,yy in enumerate([-3.9,-2.4,-.9,.6,2.1]):
 G.lounger(-6.22,yy,.17,angle=math.pi/2);G.parasol(-6.6,yy+.3,.16,radius=.56,height=1.15)
for yy in [-3.7,-2.05,-.4,1.25,2.9]:G.lounger(-.2,yy,.17,angle=math.pi/2)
for n,(xx,yy) in enumerate([(-5.2,3.25),(-3.4,3.45),(-1.65,3.0)]):I.cafe_table(xx,yy,.16,seed=40+n);G.parasol(xx,yy,.16,radius=.51,height=1.13)
for xx in [-14.3,-12.8]:G.parasol(xx,-7.2,.15,radius=.53,height=1.05)
for n,(xx,yy,ww,dd) in enumerate([(-8,-6,3,.55),(-17,-7.9,2,.6),(-6.5,5.8,1.1,.5),(9.2,-6.1,.55,2.6),(22.85,-9,.6,5.2),(16,2.3,5.8,.55),(-5.2,-5.45,3.6,.55),(-.2,-5.7,1,.65)]):G.flowerbed(xx,yy,.08,ww,dd,seed=21+n)
# Preserve one transformable canopy mesh per tree for gentle browser movement.
canopy_material=mat('Summer Foliage','#ffffff',.94,0)
cn=canopy_material.node_tree.nodes.new('ShaderNodeVertexColor');cn.layer_name='TreeColor';canopy_material.node_tree.links.new(cn.outputs['Color'],canopy_material.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
def estate_tree(index,xx,yy,scale):
 objects=G.tree(xx,yy,.015,scale=scale,seed=50+index)
 leaves=[ob for ob in objects if ob.data.materials[0].name.startswith('Garden leaf_')]
 origin=Vector((xx,yy,1.6*scale));verts=[];faces=[];colors=[]
 for ob in leaves:
  offset=len(verts);color=tuple(ob.data.materials[0].node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value)
  verts.extend(tuple(v.co-origin) for v in ob.data.vertices);colors.extend([color]*len(ob.data.vertices));faces.extend(tuple(offset+i for i in face.vertices) for face in ob.data.polygons)
  bpy.data.objects.remove(ob,do_unlink=True)
 me=bpy.data.meshes.new('Summer tree foliage');me.from_pydata(verts,[],faces);me.materials.append(canopy_material)
 color_attr=me.color_attributes.new(name='TreeColor',type='FLOAT_COLOR',domain='POINT')
 for j,color in enumerate(colors):color_attr.data[j].color=color
 for face in me.polygons:face.use_smooth=True
 pivot=bpy.data.objects.new(f'Canopy_{index:03d}',None);bpy.context.collection.objects.link(pivot);pivot.location=origin;pivot['preserve_animation']=True
 ob=bpy.data.objects.new(f'CanopyLeaves_{index:03d}',me);bpy.context.collection.objects.link(ob);ob.parent=pivot
# Mature trees define the broad park between the two venues; front terraces remain readable.
placements=[(-20,-7.4,1.12),(-21.6,-2.6,1.0),(-21.5,4.5,1.15),(-20.7,10.7,1.0),(-17.9,14.3,.9),(-12.8,16.0,.94),(-7.7,15.9,.8),(-1.2,16.3,1.0),(3.9,15.5,1.05),(8.2,14.4,1.15),(11.7,13.3,1.16),(15.1,10.5,1.2),(19.9,7.4,1.15),(23.9,4.6,1.14),(26.8,.2,1.15),(26.5,-5.6,1.05),(26,-10.2,1.0),(23.7,-14.8,1.07),(17.9,-17.1,.9),(11.7,-17.5,1.12),(5,-16.7,1.1),(-.5,-15.7,1.12),(-6.8,-13.6,1.15),(-12.1,-12.1,1.0),(-17.7,-11,.97),(6.8,-1.5,1.35),(6.15,-6.7,1.5),(7.7,-11,1.3),(1.8,-9.2,1.1),(-2.9,-8.4,1.12),(10.4,4.9,1.12),(14.3,5.8,1.05)]
for i,(xx,yy,scale) in enumerate(placements):estate_tree(i,xx,yy,scale)
for i in range(55):
 a=random.random()*math.tau;rad=random.uniform(.70,.82);xx=31*rad*math.cos(a);yy=22*rad*math.sin(a)
 G.shrub(xx,yy,.03,random.uniform(.55,.95),seed=200+i)
for i in range(9):G.shrub(-5.5+i*.99,13.6,.06,.62,seed=380+i)
for i,(xx,yy) in enumerate([(11,1.5),(12,-14.4),(20,-14),(23.5,-4),(19,4),(-8,-6),(-16,-7.8),(-3,-7),(4,-8),(6,13)]):G.lamp(xx,yy,.07,height=1.15)
# A hollow, furnished sauna and a small living fire beneath the copper hood.
import sauna_assets as S
import fire_assets as F
S.build_sauna(origin=(-18.4,-6.75,0))
F.build_fireplace_fire()
import people_assets as P
bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=193;bpy.context.scene.render.fps=24
P.build_people(cupola=(16,-1.5,7.33),court=(-3.5,10,.17))
print('All garden assets and people created',flush=True)
# Lighting and camera for the review still; excluded from GLB.
scene=bpy.context.scene;world=scene.world or bpy.data.worlds.new('Estate daylight');scene.world=world;world.use_nodes=True;world.node_tree.nodes.get('Background').inputs['Color'].default_value=(*rgb('#e6eee3'),1);world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.6
bpy.ops.object.light_add(type='AREA',location=(-12,-15,27));sun=bpy.context.object;sun.name='Studio_Key';sun.data.energy=4200;sun.data.shape='DISK';sun.data.size=14;sun.rotation_euler=(Vector((0,0,0))-sun.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.light_add(type='SUN',location=(0,0,20));sun=bpy.context.object;sun.name='Studio_Sun';sun.data.energy=2.6;sun.data.angle=.14;sun.rotation_euler=(math.radians(28),math.radians(-24),math.radians(-35))
bpy.ops.object.camera_add(location=(44,-63,49));cam=bpy.context.object;cam.name='Studio_Camera';target=Vector((1,-.5,1));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=68;scene.camera=cam
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.09));plane=bpy.context.object;plane.name='Studio_Backdrop';plane.is_shadow_catcher=True;plane.data.materials.append(M['Ivory'])
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True
try:
 prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='METAL';prefs.get_devices()
 for dev in prefs.devices:dev.use=dev.type=='METAL'
 scene.cycles.device='GPU'
except Exception as e:print('GPU setup:',e)
scene.render.resolution_x=1800;scene.render.resolution_y=1400;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True;scene.render.image_settings.color_mode='RGBA'
# Keep a fully editable, semantically grouped Blender file.
scene['reference_note']='Revised from the user-supplied Maryhill aerial and official gallery: broader lawns, curved pool wing, courts, layered planted terrace. Interpretive miniature, not surveyed architecture.'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'maryhill-estate.blend'))
# Merge one-material geometry by material for a low draw-call web model.
bpy.ops.object.select_all(action='DESELECT')
groups=defaultdict(list)
for ob in list(scene.objects):
 if ob.type=='MESH' and not ob.name.startswith('Studio_'):
  if len(ob.data.materials)==1 and ob.data.materials[0].name!='Ground_Fade' and not ob.parent and not ob.animation_data and not ob.name.startswith(('Animated_', 'Tennis', 'Julia', 'Zach', 'Bride', 'Canopy')):groups[ob.data.materials[0].name].append(ob)
for material,objects in groups.items():
 if len(objects)>1:
  bpy.ops.object.select_all(action='DESELECT')
  for ob in objects:ob.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name=material
bpy.ops.object.select_all(action='DESELECT')
for ob in scene.objects:
 if ob.type in {'MESH','EMPTY'} and not ob.name.startswith('Studio_'):ob.select_set(True)
scene['reference_note']='Interpretive miniature based on Maryhill Estate official gallery (108 indexed photos) and the illustrated estate map; not a surveyed architectural reconstruction.'
pathglb=ASSET/'maryhill-estate.glb'
bpy.ops.export_scene.gltf(filepath=str(pathglb),export_format='GLB',use_selection=True,export_yup=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_cameras=False,export_lights=False,export_extras=True,export_animations=True)
print('GLB export:',pathglb.stat().st_size,'bytes',flush=True)
if not args.skip_render:
 scene.render.filepath=str(OUT/'maryhill-estate-preview.png');bpy.ops.render.render(write_still=True)
 print('Preview complete',flush=True)
