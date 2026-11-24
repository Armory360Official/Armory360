const LIBS = ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
              'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js'];
(function chain(i){
 if (i >= LIBS.length) return main();
 const s = document.createElement('script'); s.src = LIBS[i]; s.onload = () => chain(i + 1);
 s.onerror = () => { document.getElementById('status').textContent = 'Could not load ' + LIBS[i]; };
 document.head.appendChild(s);
})(0);

function main() {
const LOGS = []; ['log', 'warn'].forEach(k => {const f = console[k]; console[k] = (...a) => {if (String(a[0]).startsWith('Armory360')) LOGS.push(a.map(x => typeof x == 'object' ? JSON.stringify(x) : String(x)).join(' ')); f.apply(console, a)}});
const CFG = { base: 'https://www.evike.com/products/', affiliate: '' };
const D = [
{k:'helmet',l:'Helmet',i:[
   {id:45747,n:'Matrix Basic PJ Type Tactical Airsoft Bump Helmet (Black)',p:40,c:0x1a1a1a,img:'e'},
   {id:45749,n:'Matrix Basic PJ Type Bump Helmet (Foliage Green)',p:40,c:0x4a5a36},
   {id:116108,n:'Matrix Vented High Cut Airsoft Helmet',p:62,c:0x6b5f45}]},
{k:'eyes',l:'Eye & Face Protection',i:[
   {id:35748,n:'Matrix Wide View Goggles (Black / Smoke Lens)',p:25,c:0x1a1a1a},
   {id:62888,n:'Matrix Full Seal Goggles w/ Face Shield (Dark Earth)',p:16,c:0x8a7550,f:1}]},
{k:'carrier',l:'Plate Carrier',i:[
   {id:101761,n:'Matrix Lightweight Plate Carrier (Coyote Brown)',p:89,c:0x7a6244},
   {id:34669,n:'Evike.com Laser Cut BAMF Skull Alpha High Speed Plate Carrier (Black)',p:59.95,c:0x1c1c1c,img:'d'}]},
{k:'gloves',l:'Gloves',i:[
   {id:49301,n:'Matrix Sentinel Hard Knuckle Tactical Gloves (Black / Medium)',p:19.95,c:0x1a1a1a},
   {id:114185,n:'Matrix Nexus Tactical Gloves (Evike.com Black / Small)',p:14.95,c:0x222222,img:'c'}]},
{k:'rifle',l:'Primary Replica (AEG)',i:[]}];
const S = {};
const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c])), SUBT = {'m16-dmr':'M16 / DMR', 'm4-carbine':'M4 Carbine', 'm4-sbr':'M4 SBR', 'm4-pcc':'M4 PCC / SMG'};
let SUB = '';
function addGuns() {   // GUNS rows become items in the rifle category, tagged with their sub-category; ids already present are skipped
 let d = D.find(x => x.k == 'rifle'); if (!d) {d = {k:'rifle', l:'Primary Replica (AEG)', i:[]}; D.push(d)}
 for (const sub in GUNS) GUNS[sub].forEach(([id, pt, n, tag, img, specs]) => {
  if (d.i.some(x => x.id == id)) return;
  const m = /\$([\d,]+\.\d{2})/.exec(pt);
  d.i.push({id, n, p:m ? +m[1].replace(',', '') : 0, pt, tag, oos:!pt, image:img ? 'https://www.evike.com/images/' + img : '', c:0x2b2e2a, sub, specs});
 });
}
async function loadCatalog() {   // optional ./catalog.json: same shape as D (array, or {categories:[...]}); colors may be "#rrggbb"
 try {
  const r = await fetch('./catalog.json', {cache:'no-cache'}); if (!r.ok) return;
  const j = await r.json(), a = Array.isArray(j) ? j : j.categories;
  const ok = (a || []).filter(d => d && d.k && d.l && Array.isArray(d.i)).map(d => ({k:String(d.k), l:String(d.l), i:d.i.filter(x => x && x.n && isFinite(+x.p) && (x.id || x.url)).map(x => ({...x, p:+x.p, c:typeof x.c == 'string' ? (parseInt(x.c.replace('#', ''), 16) || 0x333333) : (x.c ?? 0x333333)}))})).filter(d => d.i.length);
  if (ok.length) {D.splice(0, D.length, ...ok); TAB = D[0].k}
 } catch (e) {console.warn('catalog.json not used, keeping built-in gear', e)}
}
const $ = s => document.getElementById(s), f$ = n => '$' + n.toFixed(2), hex = n => '#' + n.toString(16).padStart(6, '0'), cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ---------- scene ---------- */
const T = THREE, el = $('stage'), sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, .1, 50);
const rd = new T.WebGLRenderer({antialias:true,alpha:true}); rd.shadowMap.enabled = true; rd.shadowMap.type = T.PCFSoftShadowMap; rd.setPixelRatio(Math.min(devicePixelRatio, 2)); el.appendChild(rd.domElement);
sc.add(new T.HemisphereLight(0xffffff, 0x39402f, .5));
const d1 = new T.DirectionalLight(0xfff4e6, 1.0); d1.position.set(2, 4, 3); d1.castShadow = true; d1.shadow.mapSize.set(2048, 2048); Object.assign(d1.shadow.camera, {left:-1.6,right:1.6,top:2.6,bottom:-.6,near:.5,far:12}); d1.shadow.bias = -.0006; d1.shadow.normalBias = .02; sc.add(d1);
const d2 = new T.DirectionalLight(0xdadde0, .5); d2.position.set(-3, 2.5, -3); sc.add(d2);
const d3 = new T.DirectionalLight(0xdfe8ff, .3); d3.position.set(-4, 1.5, 3); sc.add(d3);
{const pm = new T.PMREMGenerator(rd), es = new T.Scene(); es.background = new T.Color(0x14171a);
 const bx = (w,h,d,x,y,z,v) => {const o = new T.Mesh(new T.BoxGeometry(w,h,d), new T.MeshBasicMaterial({color:new T.Color(v,v,v)})); o.position.set(x,y,z); o.lookAt(0,0,0); es.add(o)};
 bx(4,3,.1,3,4,4,1); bx(2,4,.1,-5,2,2,.55); bx(6,.1,2,0,5,-1,.8); bx(.3,4,.1,-3,2,-5,.9); bx(8,.1,8,0,-2,0,.18);
 sc.environment = pm.fromScene(es, .03).texture}

const man = new T.Group(); sc.add(man);
const V = (x, y, z) => new T.Vector3(x, y, z);
const M = (c, r=.75, m=.05) => new T.MeshStandardMaterial({color:c, roughness:r, metalness:m});
const mkTex = (draw, rep) => {const c = document.createElement('canvas'); c.width = c.height = 64; draw(c.getContext('2d')); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 4; return t};
const TXW = mkTex(x => {x.fillStyle='#c8c8c8'; x.fillRect(0,0,64,64); for(let i=0;i<64;i+=4)for(let j=0;j<64;j+=4){x.fillStyle=((i+j)/4)%2?'#f2f2f2':'#c4c4c4'; x.fillRect(i,j,4,4); x.fillStyle='#8c8c8c'; x.fillRect(i,j,4,1); x.fillRect(i,j,1,4)}}, 4);
const TXP = mkTex(x => {x.fillStyle='#dcdcdc'; x.fillRect(0,0,64,64); for(let n=0;n<700;n++){const v=150+Math.random()*105|0; x.fillStyle='rgb('+v+','+v+','+v+')'; x.fillRect(Math.random()*64, Math.random()*64, 1.5, 1.5)}}, 6);
const MAT = {
 fabric: c => new T.MeshStandardMaterial({color:c, roughness:.96, metalness:0, map:TXW, bumpMap:TXW, bumpScale:1.2, envMapIntensity:.5}),
 poly: c => new T.MeshStandardMaterial({color:c, roughness:.5, metalness:.05, map:TXP, bumpMap:TXP, bumpScale:.6, envMapIntensity:.9}),
 gun: c => new T.MeshStandardMaterial({color:c, roughness:.5, metalness:.55, envMapIntensity:.45})};
const mk = (g, m, x, y, z, p=man) => {const o = new T.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o};
const C = (a, b, h, s=20) => new T.CylinderGeometry(a, b, h, s), B = (x, y, z) => new T.BoxGeometry(x, y, z);

// base platform + soft shadow
mk(C(.42, .44, .025, 56), M(0x1b1e19, .35, .6), 0, -.0125, 0); const ring = mk(new T.TorusGeometry(.4, .006, 8, 64), M(0xc8a24a, .4, .7), 0, .002, 0); ring.rotation.x = Math.PI / 2;
const fl = new T.Mesh(new T.PlaneGeometry(8, 8), new T.ShadowMaterial({opacity:.35})); fl.rotation.x = -Math.PI / 2; fl.position.y = .003; fl.receiveShadow = true; sc.add(fl);
{const cs = document.createElement('canvas'); cs.width = cs.height = 128; const x = cs.getContext('2d'), g = x.createRadialGradient(64, 64, 6, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
const bl = new T.Mesh(new T.PlaneGeometry(1.7, 1.7), new T.MeshBasicMaterial({map:new T.CanvasTexture(cs), transparent:true, depthWrite:false})); bl.rotation.x = -Math.PI / 2; bl.position.y = .001; sc.add(bl)}

/* ---------- human model: ./male.glb, ./female.glb, or a placeholder dummy ---------- */
// Height: man.scale (uniform HF). Weight: BW = body thickness (x/z only). BWm = BW / HF cancels the height scale on x/z,
// so the height slider never changes width and the weight slider never changes height.
const wr = new T.Group(); man.add(wr);
let MS = 1, HF = 1, BW = 1, BWm = 1, SLX = 1, SLZ = 1, GL = [], RIG = null, RG = null, SEX = 'male', LT = 0, POSE = 'idle', MIX = null, BM = {}, RESTM = {}, NOTE = '';
const TARGET_H = 1.78, GS = TARGET_H / 1.86, HINT = 'Scroll to zoom at the cursor · drag to orbit · right-drag or Shift-drag to pan';
const cg = new T.Group(), HGRP = new T.Group(), RGRP = new T.Group(), clk = new T.Clock();   // gear groups; they get parented to the Mixamo bones on load

const strip = raw => raw.replace(/^.*[|:]/, '').replace(/\.\d{3}$/, '').toLowerCase();   // drop "Armature|" / "mixamorig:" prefixes and Blender ".001" suffixes
function dummy() {   // simple stand-in until the .glb files exist
 const g = new T.Group(), m = M(0x8a9481, .8, 0);
 mk(B(.36, .55, .2), m, 0, 1.3, 0, g); mk(new T.SphereGeometry(.11, 20, 14), m, 0, 1.74, 0, g); mk(B(.1, .06, .1), m, 0, 1.6, 0, g);
 for (const q of [-1, 1]) {mk(B(.12, .86, .14), m, q * .1, .43, 0, g); mk(B(.08, .62, .08), m, q * .25, 1.27, 0, g)}
 return g;
}
function clearModel() {MIX = null; BM = {}; RESTM = {}; while (wr.children.length) wr.remove(wr.children[0]); GL = []; RIG = null}
function bounds(root, log, n) {   // true world-space bounds of the posed mesh (skinned vertices included); ignores hidden or ground/stand-like helper meshes
 root.updateMatrixWorld(true); const box = new T.Box3(), v = V(0,0,0), info = [];
 root.traverse(o => {
  if (!o.isMesh || !o.geometry.attributes.position) return;
  const pos = o.geometry.attributes.position, sk = o.isSkinnedMesh && typeof o.boneTransform == 'function' && o.geometry.attributes.skinIndex, step = Math.max(1, Math.floor(pos.count / (n || 20000))), mb = new T.Box3();
  for (let i = 0; i < pos.count; i += step) {if (sk) {v.set(0,0,0); o.boneTransform(i, v)} else v.fromBufferAttribute(pos, i); mb.expandByPoint(v.applyMatrix4(o.matrixWorld))}
  const skip = o.visible === false || /ground|floor|plane|shadow|backdrop|background|pedestal/i.test(o.name), sz = mb.isEmpty() ? V(0,0,0) : mb.getSize(V(0,0,0));
  if (log) info.push({mesh:o.name || '(unnamed)', skinned:!!o.isSkinnedMesh, ignored:skip, w:+sz.x.toFixed(3), h:+sz.y.toFixed(3), d:+sz.z.toFixed(3)});
  if (!skip && !mb.isEmpty()) box.union(mb);
 });
 if (log) {console.groupCollapsed('Armory360 meshes'); console.table(info); console.groupEnd()}
 return box;
}
function slimMesh(mdl, bb, ct, sz, tw, td, mul) {
 // Slimming is done in the vertex shader, in world x/z about the body axis, weighted per vertex (arms/hands and head/neck keep their size).
 // Measurement uses the same skinned (rendered) positions as bounds(), so it cannot disagree with what is drawn.
 mdl.updateMatrixWorld(true);
 const AR = /arm|hand|shoulder|clav|thumb|index|middle|ring|pinky|pinkie|little|finger/, HD = /head|neck/, v = V(0,0,0), X = [], Z = [], lo = bb.min.y + sz.y * .59, hi = bb.min.y + sz.y * .73, ms = [];
 mdl.traverse(o => {if (o.isSkinnedMesh && o.geometry.attributes.skinIndex && o.skeleton && typeof o.boneTransform == 'function') ms.push(o)});
 ms.forEach(o => {
  const g = o.geometry, n = g.attributes.position.count, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, ws = sw.array instanceof Uint8Array ? 255 : sw.array instanceof Uint16Array ? 65535 : 1, bn = o.skeleton.bones.map(b => strip(b.name)), k = new Float32Array(n);
  for (let i = 0; i < n; i++) {
   let a = 0, h = 0; for (let j = 0; j < 4; j++) {const w = sw.array[i * sw.itemSize + j] / ws, nm = bn[si.array[i * si.itemSize + j]] || ''; if (AR.test(nm)) a += w; else if (HD.test(nm)) h += w}
   k[i] = (1 - Math.min(a, 1)) * (1 - Math.min(h, 1));
   if (k[i] > .9) {v.set(0,0,0); o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); if (v.y > lo && v.y < hi) {X.push(Math.abs(v.x - ct.x)); Z.push(v.z - ct.z)}}
  }
  g.setAttribute('slimK', new T.BufferAttribute(k, 1));
 });
 console.log('Armory360 slim: skinned meshes', ms.length, 'chest samples', X.length, 'slab y', lo.toFixed(1), hi.toFixed(1));
 if (X.length < 50) {console.warn('Armory360: chest not measurable, mesh not slimmed'); return}
 X.sort((a, b) => a - b); Z.sort((a, b) => a - b);
 const cw = 2 * X[Math.floor(X.length * .95)], cd = Z[Math.floor(Z.length * .97)] - Z[Math.floor(Z.length * .03)];
 const fx = cl(tw * sz.y / cw * mul, .45, 1), fz = cl(td * sz.y / cd * mul, .45, 1); SLX = fx; SLZ = fz;
 console.log('Armory360 chest width/height', (cw / sz.y).toFixed(3), 'depth/height', (cd / sz.y).toFixed(3), '-> slim x', fx.toFixed(2), 'z', fz.toFixed(2), '(?slim=0.9 scales this)');
 ms.forEach(o => (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
  m.onBeforeCompile = sh => {
   sh.uniforms.uS = {value:new T.Vector2(fx, fz)};
   sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float slimK;\nuniform vec2 uS;')
    .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n{vec4 wp = modelMatrix * vec4(transformed, 1.0); wp.x *= 1.0 - (1.0 - uS.x) * slimK; wp.z *= 1.0 - (1.0 - uS.y) * slimK; transformed = (inverse(modelMatrix) * wp).xyz;}');
  };
  m.customProgramCacheKey = () => 'slim'; m.needsUpdate = true;
 }));
}
function addUnderwear(mdl, sz) {
 // Separate skinned garment meshes built from the body's own faces, lifted a few mm off the skin, with a fabric material, a thicker trim at the hems
 // and no change to the body mesh. They share the body's skeleton and slimming, so they deform with it. Region heights are estimated from body proportions.
 if (/[?&]under=0/.test(location.search)) return;
 const ms = []; mdl.traverse(o => {if (o.isSkinnedMesh && o.skeleton && o.geometry.index && o.geometry.attributes.normal && typeof o.boneTransform == 'function') ms.push(o)});
 const H = sz.y, v = V(0,0,0); mdl.updateMatrixWorld(true);
 const ext = o => {let lo = 1e9, hi = -1e9, n = o.geometry.attributes.position.count, st = Math.max(1, Math.floor(n / 1500)); for (let i = 0; i < n; i += st) {v.set(0,0,0); o.boneTransform(i, v).applyMatrix4(o.matrixWorld); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y)} return hi - lo};
 let body = null, be = 0; ms.forEach(o => {const e = ext(o); if (e > be) {be = e; body = o}});
 if (!body || be < H * .6) {console.warn('Armory360: no full-body mesh found, no underwear added'); return}
 const g = body.geometry, n = g.attributes.position.count, Rx = new Float32Array(n), Ry = new Float32Array(n), Rz = new Float32Array(n);
 for (let i = 0; i < n; i++) {v.set(0,0,0); body.boneTransform(i, v).applyMatrix4(body.matrixWorld); Rx[i] = v.x; Ry[i] = v.y; Rz[i] = v.z}
 let cf = 9, bz = -9, by = .72;   // crotch height (lowest point on the centre line above the knees) and bust height (most forward point of the chest)
 for (let i = 0; i < n; i++) {const fy = Ry[i] / H, ax = Math.abs(Rx[i]) / H; if (ax < .012 && fy > .3 && fy < .6 && fy < cf) cf = fy; if (ax < .1 && fy > .64 && fy < .8 && Rz[i] / H > bz) {bz = Rz[i] / H; by = fy}}
 cf = cf == 9 ? .46 : cl(cf, .42, .5); by = cl(by, .66, .78);
 console.log('Armory360 underwear landmarks (fractions of height): crotch', cf.toFixed(3), 'bust', by.toFixed(3), 'body mesh', body.name || '(unnamed)');
 const fem = SEX == 'female', top = cf + (fem ? .095 : .105), ylo = ax => Math.min(cf + .07, cf - .005 + .86 * Math.max(0, ax - .02));
 if (!fem) {
  // Paint the area black with a per-vertex field that is interpolated across each triangle, so the edge is a clean line whatever the mesh density; texture is ignored there.
  const F = new Float32Array(n);
  for (let i = 0; i < n; i++) {const fy = Ry[i] / H, ax = Math.abs(Rx[i]) / H; F[i] = ax < .17 ? Math.min(fy - (cf - .065), top - fy) : -1}
  g.setAttribute('paintF', new T.BufferAttribute(F, 1));
  (Array.isArray(body.material) ? body.material : [body.material]).forEach(m => {
   const prev = m.onBeforeCompile, pk = m.customProgramCacheKey;
   m.onBeforeCompile = (sh, r) => {
    if (prev) prev.call(m, sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float paintF;\nvarying float vPaint;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvPaint = paintF;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vPaint;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.015), smoothstep(-0.0012, 0.0012, vPaint));');
   };
   m.customProgramCacheKey = () => (pk ? pk.call(m) : '') + 'paint'; m.needsUpdate = true;
  });
  console.log('Armory360 boxer area painted black on the male body (no garment mesh)'); return;
 }
 const specs = fem ? [
  {inc:(y, a) => a < .17 && y > ylo(a) && y < top, trim:(y, a) => y > top - .013 || y < ylo(a) + .012, col:0x2a2d33, tc:0x464b55},
  {inc:(y, a, z) => (a < .115 && y > by - .052 && y < by - .02) || (z > -.004 && a > .012 && a < .115 && y > by - .052 && y < by + .045) || (a > .05 && a < .068 && y > by + .045 && y < by + .118), trim:(y, a, z) => y < by - .04 || (y > by + .033 && y < by + .046), col:0x2a2d33, tc:0x464b55}
 ] : [{inc:(y, a) => a < .17 && y > cf - .065 && y < top, trim:(y, a) => y > top - .014 || y < cf - .053, col:0x2d3446, tc:0x434b60}];
 const gi = g.index.array, bm = Array.isArray(body.material) ? body.material[0] : body.material;
 const A = V(0,0,0), Bv = V(0,0,0); let a0 = 0, a1 = 0; for (let i = 0; i < n; i++) {if (Ry[i] < Ry[a0]) a0 = i; if (Ry[i] > Ry[a1]) a1 = i}
 A.fromBufferAttribute(g.attributes.position, a0); Bv.fromBufferAttribute(g.attributes.position, a1);
 const d = .0022 * H / (Math.hypot(Rx[a1] - Rx[a0], Ry[a1] - Ry[a0], Rz[a1] - Rz[a0]) / (A.distanceTo(Bv) || 1));   // lift in bind-space units (about 4 mm on a 1.8 m body)
 const ft = TXW.clone(); ft.needsUpdate = true; ft.repeat.set(40, 40);
 specs.forEach(sp => {
  const sel = []; for (let t = 0; t < gi.length; t += 3) {const a = gi[t], b = gi[t + 1], c = gi[t + 2]; if (sp.inc((Ry[a] + Ry[b] + Ry[c]) / 3 / H, Math.abs(Rx[a] + Rx[b] + Rx[c]) / 3 / H, (Rz[a] + Rz[b] + Rz[c]) / 3 / H)) sel.push(a, b, c)}
  if (sel.length < 90) {console.warn('Armory360: garment region too small, skipped', sel.length); return}
  const G = new T.BufferGeometry(), P = g.attributes.position.clone(), N = g.attributes.normal, C = new Float32Array(n * 3), c1 = new T.Color(sp.col), c2 = new T.Color(sp.tc);
  for (const k of ['skinIndex', 'skinWeight', 'uv', 'slimK']) if (g.attributes[k]) G.setAttribute(k, g.attributes[k]);
  for (let i = 0; i < n; i++) {const tr = sp.trim(Ry[i] / H, Math.abs(Rx[i]) / H, Rz[i] / H), m = d * (tr ? 1.9 : 1), c = tr ? c2 : c1; P.setXYZ(i, P.getX(i) + N.getX(i) * m, P.getY(i) + N.getY(i) * m, P.getZ(i) + N.getZ(i) * m); C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b}
  G.setAttribute('position', P); G.setAttribute('normal', N); G.setAttribute('color', new T.BufferAttribute(C, 3)); G.setIndex(sel);
  const mat = new T.MeshStandardMaterial({vertexColors:true, roughness:.92, metalness:0, bumpMap:ft, bumpScale:1.2, envMapIntensity:.4, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2});
  if (G.attributes.slimK) {mat.onBeforeCompile = bm.onBeforeCompile; mat.customProgramCacheKey = bm.customProgramCacheKey}
  const gm = new T.SkinnedMesh(G, mat); gm.bind(body.skeleton, body.bindMatrix); gm.position.copy(body.position); gm.quaternion.copy(body.quaternion); gm.scale.copy(body.scale);
  gm.frustumCulled = false; gm.castShadow = true; gm.receiveShadow = true; body.parent.add(gm);
  console.log('Armory360 garment added:', sel.length / 3, 'triangles');
 });
}
function bindPose(mdl, sm) {
 // Put every bone exactly at the pose the skin was bound to (world = inverse of its inverse-bind matrix), so skeleton and mesh agree.
 // The file's own node pose had per-bone scales that stretch the head and arms (loaded-vs-bind matrix was diag 17.1, 20.5, 31.9, not identity).
 mdl.updateMatrixWorld(true);
 const bs = sm.skeleton.bones, W = new Map(bs.map((b, i) => [b, mdl.matrixWorld.clone().multiply(sm.skeleton.boneInverses[i].clone().invert())]));
 bs.forEach(b => {const pw = W.has(b.parent) ? W.get(b.parent) : b.parent.matrixWorld; pw.clone().invert().multiply(W.get(b)).decompose(b.position, b.quaternion, b.scale)});
 mdl.updateMatrixWorld(true);
}
const POSES = [['idle', 'Idle'], ['firing', 'Firing Rifle'], ['strafe', 'Strafe Right'], ['pistol', 'Pistol Idle'], ['grenade', 'Grenade Throw'], ['reload', 'Reloading'], ['pfiring', 'Prone Firing Rifle'], ['preload', 'Prone Reloading']];
const FILES = {
 male:{idle:'male', firing:'male_firing_rifle', strafe:'male_strafe_right', pistol:'male_pistol_idle', grenade:'male_grenade_throw', reload:'male_reload', pfiring:'male_prone_firing_rifle', preload:'male_prone_reload'},
 female:{idle:'female', firing:'female_firing_rifle', strafe:'female_strafe_right', pistol:'female_pistol_idle', grenade:'female_grenade_throw', reload:'female_reloading', pfiring:'female_prone_firing_rifle', preload:'female_prone_reloading'}};
const bname = n => strip(n).replace(/^mixamorig/, '').replace(/_\d+$/, '');   // "mixamorigLeftHand_011" -> "lefthand"
function chainLen(mdl) {   // total length of the spine and leg bone chains in the model's own frame; rotation does not change it, a scale difference does
 mdl.updateMatrixWorld(true); const inv = mdl.matrixWorld.clone().invert(), p = k => BM[k] ? BM[k].getWorldPosition(V(0,0,0)).applyMatrix4(inv) : null; let L = 0;
 [['hips', 'spine', 'spine1', 'spine2', 'neck', 'head'], ['leftupleg', 'leftleg', 'leftfoot'], ['rightupleg', 'rightleg', 'rightfoot']].forEach(c => {for (let i = 0; i + 1 < c.length; i++) {const a = p(c[i]), b = p(c[i + 1]); if (a && b) L += a.distanceTo(b)}});
 return L;
}
function attachGear() {
 // Gear is authored for an upright 1.86 figure (units scaled by GS). Each group is placed once against the bind-pose bone transforms, then parented to its bone so it follows every animation frame.
 const P = k => RESTM[k] ? V(0,0,0).setFromMatrixPosition(RESTM[k]) : null, hd = P('head'), sp = P('spine2'), rh = P('righthand'), mid = P('righthandmiddle1'), th = P('righthandthumb1'), I = new T.Quaternion();
 const comp = (pos, q, sc) => new T.Matrix4().compose(pos, q, V(sc, sc, sc));
 const put = (grp, key, M) => {const b = BM[key]; grp.matrixAutoUpdate = false; if (b && RESTM[key]) {grp.matrix.copy(RESTM[key].clone().invert().multiply(M)); b.add(grp)} else {grp.matrix.copy(M); man.add(grp); console.warn('Armory360: bone not found for', key, '(gear stays fixed)')} grp.matrixWorldNeedsUpdate = true};
 const c0 = V(0, 1.752, -.005), hc = hd ? hd.clone().add(V(0, .085, .012)) : V(0, 1.67, .01);   // helmet centre in gear units -> a point just above the head bone
 put(HGRP, 'head', comp(hc.clone().sub(c0.clone().multiplyScalar(GS)), I, GS));
 const ch = V(0, 1.3, 0), cc = sp ? sp.clone().add(V(0, -.055, 0)) : V(0, 1.27, 0);   // plate centre -> a point just below the chest bone
 put(cg, 'spine2', comp(cc.clone().sub(ch.clone().multiplyScalar(GS)), I, GS));
 // rifle: barrel along the right hand's finger direction, rifle "up" toward the thumb side, pistol grip at the palm
 let f = V(-1, 0, 0), t = V(0, 0, 1), hp = V(-.4, 1.45, 0);
 if (rh && mid) {f = mid.clone().sub(rh).normalize(); hp = rh.clone(); if (th) {const t0 = th.clone().sub(rh); t = t0.sub(f.clone().multiplyScalar(t0.dot(f))).normalize()}}
 const y = t, z = f, x = y.clone().cross(z).normalize(), q = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x, y, z)), up = new URLSearchParams(location.search);
 const nums = (k, n) => (up.get(k) || '').split(',').map(Number).concat(Array(n).fill(0)).slice(0, n).map(v => v || 0), rr = nums('rrot', 3), rp = nums('rpos', 3);   // ?rrot=deg,deg,deg and ?rpos=x,y,z (rifle-local) tune the hold
 q.multiply(new T.Quaternion().setFromEuler(new T.Euler(rr[0] * Math.PI / 180, rr[1] * Math.PI / 180, rr[2] * Math.PI / 180)));
 const s = .78 * GS, pg = V(0, -.09, -.105), grip = hp.clone().add(f.clone().multiplyScalar(.05));
 put(RGRP, 'righthand', comp(grip.sub(pg.multiplyScalar(s).applyQuaternion(q)).add(V(rp[0], rp[1], rp[2]).applyQuaternion(q)), q, s));
}
function onModel(gltf) {
 clearModel();
 const mdl = gltf.scene, bones = [], sms = []; mdl.updateMatrixWorld(true);
 mdl.traverse(o => {
  if (o.isMesh) {
   o.castShadow = o.receiveShadow = true; o.frustumCulled = false; if (o.isSkinnedMesh) sms.push(o);
   if (o.morphTargetInfluences && o.morphTargetInfluences.length) o.morphTargetInfluences.fill(0);
   (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
    if (m.envMapIntensity !== undefined) m.envMapIntensity = .45;
    if (m.metalness !== undefined) m.metalness = Math.min(m.metalness, .1);
    if (m.roughness !== undefined) m.roughness = Math.max(m.roughness, .5);
    m.needsUpdate = true;
   });
  }
  if (o.isBone) {bones.push(o); const k = bname(o.name); if (!BM[k]) BM[k] = o}
 });
 // measure, ground, dress and place gear against the bind pose, so the result does not depend on which frame the file's own pose is
 const saved = bones.map(b => [b, b.position.clone(), b.quaternion.clone(), b.scale.clone()]);
 try {if (sms[0]) bindPose(mdl, sms[0])} catch (err) {console.warn('Armory360: bind pose skipped', err)}
 mdl.updateMatrixWorld(true); const Lb = chainLen(mdl);
 {let big = null; mdl.traverse(o => {if (o.isMesh && (!big || o.geometry.attributes.position.count > big.geometry.attributes.position.count)) big = o});
  const sp = new URLSearchParams(location.search).get('skin'), tone = sp ? parseInt(sp.replace('#', ''), 16) : SEX == 'female' ? 0xd9a07f : 0xc68e6e;   // ?skin=c8906e forces a color
  if (big) (Array.isArray(big.material) ? big.material : [big.material]).forEach(m => {const c = m.color; if (c && !m.map && !m.vertexColors && (sp || Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < .08)) {m.color.set(tone); m.needsUpdate = true; console.log('Armory360 skin tone applied to', big.name || '(unnamed mesh)')}})}
 const bb = bounds(mdl, true), sz = bb.getSize(V(0,0,0)), ct = bb.getCenter(V(0,0,0)), ok = !bb.isEmpty() && sz.y > 1e-6;
 if (ok && /[?&]slim=/.test(location.search)) try {slimMesh(mdl, bb, ct, sz, SEX == 'female' ? .155 : .17, SEX == 'female' ? .115 : .125, +new URLSearchParams(location.search).get('slim') || 1)} catch (err) {console.warn('Armory360: slimming skipped', err)}   // opt-in: it works in world space, so it is only right for upright poses
 if (!ok) {console.warn('Armory360: could not measure model, using scale 1'); MS = 1} else {MS = TARGET_H / sz.y; mdl.position.x -= ct.x; mdl.position.z -= ct.z; mdl.position.y -= bb.min.y}
 try {if (ok) addUnderwear(mdl, sz)} catch (err) {console.warn('Armory360: underwear skipped', err)}
 console.log('Armory360 model size (units):', sz.x.toFixed(3), sz.y.toFixed(3), sz.z.toFixed(3), 'scale:', MS, 'bones:', bones.length);
 wr.add(mdl); RIG = mdl; wr.scale.setScalar(MS); man.updateMatrixWorld(true);
 const mi = man.matrixWorld.clone().invert();
 ['head', 'spine2', 'lefthand', 'righthand', 'lefthandmiddle1', 'righthandmiddle1', 'lefthandthumb1', 'righthandthumb1'].forEach(k => {if (BM[k]) RESTM[k] = mi.clone().multiply(BM[k].matrixWorld)});
 console.log('Armory360 gear bones found:', Object.keys(RESTM).join(', ') || 'none');
 saved.forEach(([b, p, q, sc]) => {b.position.copy(p); b.quaternion.copy(q); b.scale.copy(sc)});   // back to the file's own pose
 // play the embedded Mixamo clip; root motion on the hips is removed so the character stays in place
 const anims = gltf.animations || [];
 if (anims.length) {
  const clip = anims.slice().sort((a, b) => b.tracks.length - a.tracks.length)[0].clone();
  clip.tracks.forEach(t => {if (/hips\.position$/i.test(t.name)) {const v = t.values; for (let i = 3; i < v.length; i += 3) {v[i] = v[0]; v[i + 2] = v[2]}}});
  MIX = new T.AnimationMixer(mdl); MIX.clipAction(clip).play(); MIX.update(0);
  console.log('Armory360 animation:', clip.name, clip.duration.toFixed(2) + 's', clip.tracks.length, 'tracks');
 }
 // Some pose files carry a different overall scale in their own pose than in their bind pose, which made them render far too big. Measure that ratio and cancel it.
 {const La = chainLen(mdl), sr = Lb > 0 && La > 0 ? La / Lb : 1; console.log('Armory360 pose scale ratio (own pose / bind pose):', sr.toFixed(3)); if (sr > 1.03 || sr < .97) MS /= cl(sr, .001, 1000)}
 // centre the posed body on the pedestal and put its lowest point on y = 0 (prone poses included)
 wr.scale.setScalar(MS); man.updateMatrixWorld(true); mdl.updateMatrixWorld(true);
 const b2 = bounds(mdl, false, 6000);
 if (!b2.isEmpty()) {const c = b2.getCenter(V(0,0,0)), iw = wr.matrixWorld.clone().invert(), d = V(-c.x, -b2.min.y, -c.z); d.applyMatrix4(iw).sub(V(0,0,0).applyMatrix4(iw)); mdl.position.add(d); mdl.updateMatrixWorld(true)}
 attachGear();
 $('status').textContent = NOTE || (anims.length || !bones.length ? HINT : 'No animation found in this file, showing its default pose'); NOTE = '';
 apply(); build();
}
const gltfLoader = new T.GLTFLoader();
function loadModel(sex) {
 const t = ++LT, url = './' + FILES[sex][POSE] + '.glb'; SEX = sex; $('status').textContent = 'Loading 3D model…';
 gltfLoader.load(url, g => {if (t == LT) onModel(g)}, undefined, () => {
  if (t != LT) return;
  if (POSE != 'idle') {NOTE = url + ' not found, showing the idle pose'; POSE = 'idle'; $('ps').value = 'idle'; loadModel(sex); return}
  NOTE = url + ' not found, showing placeholder'; onModel({scene:dummy(), animations:[]});
 });
}

function layout() {wr.scale.set(MS * BWm, MS, MS * BWm)}   // weight = thickness on x/z, height = uniform scale on the whole figure

/* ---------- gear ---------- */
function setGlove(gv) {   // gloves are small shells on the hand bones, sized from the measured hand length
 GL.forEach(g => g.parent && g.parent.remove(g)); GL = [];
 if (!gv || !RIG) return;
 const mt = MAT.fabric(gv.c); man.updateMatrixWorld(true);
 for (const sd of ['left', 'right']) {
  const h = BM[sd + 'hand']; if (!h) continue;
  const m0 = BM[sd + 'handmiddle1'], off = m0 && m0.parent == h ? m0.position.clone() : V(0, 0, 0);
  const hlw = m0 ? h.getWorldPosition(V(0,0,0)).distanceTo(m0.getWorldPosition(V(0,0,0))) : .08 * HF, bs = h.getWorldScale(V(0,0,0)).y || 1;
  const o = new T.Mesh(new T.SphereGeometry(1, 14, 10), mt); o.scale.setScalar(cl(hlw * .85, .03 * HF, .06 * HF) / bs); o.position.copy(off.multiplyScalar(.5)); o.castShadow = true; h.add(o); GL.push(o);
 }
}
function build() {
 for (const g of [HGRP, cg, RGRP]) while (g.children.length) g.remove(g.children.at(0));
 const hg = HGRP;
 const it = k => {const d = D.find(x => x.k == k); return S[k] != null ? d.i.at(S[k]) : null};
 let h = it('helmet'); if (h) {
  const dk = MAT.poly(0x0b0b0b), rl = MAT.poly(h.c), dm = MAT.poly(h.c), hel = new T.Group(); dm.side = T.DoubleSide; hel.matrixAutoUpdate = false; hel.matrix.set(1,0,0,0,0,1,.6,0,0,0,1,0,0,0,0,1); hg.add(hel);
  const c0 = V(0, 1.752, -.005), rr = V(.118, .13, .135);
  const dome = new T.Mesh(new T.SphereGeometry(1, 44, 28, 0, 6.283, 0, 1.95), dm); dome.scale.set(rr.x, rr.y, rr.z); dome.position.copy(c0); dome.castShadow = true; hel.add(dome);
  const on = (a, b, o) => {const x = rr.x*Math.sin(a)*Math.sin(b), y = rr.y*Math.cos(a), z = rr.z*Math.sin(a)*Math.cos(b), n = V(x/(rr.x*rr.x), y/(rr.y*rr.y), z/(rr.z*rr.z)).normalize(); return {p:V(x, y, z).add(c0).add(n.clone().multiplyScalar(o)), n}};
  const ft = (g, mt, a, b, o) => {const res = on(a, b, o), m2 = mk(g, mt, res.p.x, res.p.y, res.p.z, hel); m2.quaternion.setFromUnitVectors(V(0, 0, 1), res.n); return m2};
  ft(B(.056, .05, .014), rl, .82, 0, .004); ft(B(.034, .034, .004), dk, .82, 0, .012); ft(B(.07, .05, .004), dk, .9, Math.PI, .002);
  for (const q of [-1, 1]) {
   ft(new T.SphereGeometry(.014, 10, 8), dk, .42, q * .55, .001).scale.set(1.4, 1, .25); ft(B(.06, .07, .004), dk, .72, q * 1.15, .002);
   const r = ft(B(.09, .05, .014), rl, 1.38, q * 1.5, .006); for (let k = -1; k <= 1; k++) mk(B(.012, .034, .004), dk, k * .026, 0, .008, r);
   const cv = new T.CatmullRomCurve3([V(q * .118, 1.71, .005), V(q * .1, 1.655, .05), V(q * .05, 1.618, .088), V(0, 1.612, .092)]); mk(new T.TubeGeometry(cv, 16, .004, 6), dk, 0, 0, 0, hg);
  }
  const vz = mk(B(.14, .004, .05), dm, 0, 1.7, .15, hel); vz.rotation.x = -.25; mk(B(.02, .016, .012), dk, .09, 1.64, .06, hg);
 }
 let e = it('eyes'); if (e) {
  const m = MAT.poly(e.c), l = M(0x15181a, .1, .3);
  const t = mk(new T.TorusGeometry(.118, .014, 8, 28), m, 0, 1.745, 0, hg); t.rotation.x = Math.PI / 2; t.scale.set(1, 1.1, 1);
  mk(B(.2, .065, .05), m, 0, 1.745, .125, hg); mk(B(.17, .048, .012), l, 0, 1.745, .152, hg);
  if (e.f) mk(B(.19, .09, .05), m, 0, 1.665, .118, hg);
 }
 let c = it('carrier'); if (c) {
  const m = MAT.fabric(c.c), p = MAT.fabric(c.c), bk = MAT.poly(0x151515), dk = MAT.fabric(0x060606), md = m.clone(); md.side = T.DoubleSide; p.color.multiplyScalar(.7);
  const pl = (zc, sg) => {const g = new T.BoxGeometry(.33, .4, .045, 12, 10, 1), P = g.attributes.position; for (let i = 0; i < P.count; i++) {const x = P.getX(i), y = P.getY(i); P.setX(i, x * (1 - .1 * (y + .2) / .4)); P.setZ(i, P.getZ(i) - sg * 1.7 * Math.pow(x, 2) * Math.pow(1 - .1 * (y + .2) / .4, 2))} g.computeVertexNormals(); mk(g, m, 0, 1.3, zc, cg)};
  pl(.128, 1); pl(-.128, -1);
  const arc = (y, h) => {for (const q of [-1, 1]) {const a = new T.Mesh(new T.CylinderGeometry(.182, .182, h, 24, 1, true, q > 0 ? 1.0 : -2.14, 1.14), md); a.scale.z = .62; a.position.y = y; a.castShadow = true; cg.add(a)}};
  for (const q of [-1, 1]) {
   const cv = new T.CatmullRomCurve3([V(q * .1, 1.47, .12), V(q * .105, 1.56, .085), V(q * .112, 1.602, 0), V(q * .105, 1.56, -.085), V(q * .1, 1.47, -.12)]);
   mk(new T.TubeGeometry(cv, 28, .02, 10), m, 0, 0, 0, cg); mk(new T.TorusGeometry(.012, .0035, 6, 12), dk, q * .108, 1.628, .03, cg);
  }
  if (c.id == 34669) {
   for (let r = 0; r < 7; r++) for (let k = -2; k <= 2; k++) {const x = k * .058; mk(B(.046, .006, .002), dk, x, 1.14 + r * .04, .1515 - 1.7 * Math.pow(x, 2), cg)}
   mk(B(.12, .07, .005), dk, 0, 1.44, .152, cg); mk(B(.05, .014, .003), M(0x6a6d6a, .4, .5), 0, 1.445, .155, cg);
   arc(1.24, .035); arc(1.13, .035); for (const q of [-1, 1]) for (const y of [1.24, 1.13]) mk(B(.02, .032, .03), bk, q * .188, y, .045, cg);
  } else {
   const cb = mk(C(.172, .172, .13, 32), m, 0, 1.07, 0, cg); cb.scale.z = .64; arc(1.2, .2);
   for (let i = -1; i <= 1; i++) mk(B(.085, .12, .05), p, i * .095, 1.18, .168, cg); mk(B(.1, .07, .03), p, 0, 1.37, .158, cg);
  }
 }
 setGlove(it('gloves'));
 const r = it('rifle'); RG = null;
 if (r) {
  const m = MAT.gun(0x303234), b = MAT.gun(0x1c1d1f), rg = RGRP; const pd = !!r.pdw, hl = pd ? .2 : .3, hz = pd ? .26 : .3;
  mk(B(.05, .085, .3), m, 0, 0, 0, rg);
  mk(C(.033, .033, hl), m, 0, .005, hz, rg).rotation.x = Math.PI / 2;
  mk(C(.009, .009, .14), b, 0, .005, pd ? .42 : .52, rg).rotation.x = Math.PI / 2;
  if (r.s) {mk(C(.03, .03, .26, 20), b, 0, .005, .49, rg).rotation.x = Math.PI / 2; mk(C(.031, .031, .03, 20), M(0xff6a1a, .5, 0), 0, .005, .62, rg).rotation.x = Math.PI / 2} else mk(C(.018, .018, pd ? .065 : .05), pd ? M(0xff6a1a, .5, 0) : b, 0, .005, pd ? .46 : .6, rg).rotation.x = Math.PI / 2;
  mk(B(.028, .014, pd ? .46 : .56), b, 0, .045, pd ? .1 : .15, rg);
  mk(B(.03, .02, .03), b, 0, .062, -.1, rg); for (const q of [-1, 1]) mk(B(.006, .03, .012), b, q * .01, .087, -.1, rg);
  const fz = hz + hl / 2 - .03; mk(B(.03, .02, .026), b, 0, .062, fz, rg); mk(B(.005, .035, .005), b, 0, .0895, fz, rg);
  mk(C(.022, .022, .14, 12), b, 0, 0, -.2, rg).rotation.x = Math.PI / 2;
  {const sh = new T.Shape(); sh.moveTo(.19, .05); sh.lineTo(.385, .05); sh.lineTo(.385, -.1); sh.lineTo(.19, -.03); sh.lineTo(.19, .05); const ho = new T.Path(); ho.absarc(.305, -.01, .022, 0, 6.283, true); sh.holes.push(ho);
   const sg = new T.ExtrudeGeometry(sh, {depth:.036, bevelEnabled:true, bevelSize:.005, bevelThickness:.005, bevelSegments:2, curveSegments:20}); sg.translate(0, 0, -.018); sg.rotateY(Math.PI / 2); mk(sg, m, 0, 0, 0, rg)}
  mk(B(.03, .085, .042), b, 0, -.088, -.105, rg).rotation.x = .3;
  mk(B(.006, .006, .085), b, 0, -.1, -.04, rg); mk(B(.006, .05, .006), b, 0, -.075, .0, rg); mk(B(.007, .028, .012), b, 0, -.065, -.035, rg).rotation.x = .3;
  mk(B(.034, .17, .065), b, 0, -.135, .04, rg).rotation.x = -.22;
  if (pd) {mk(B(.032, .02, .05), b, 0, .067, .06, rg); mk(C(.026, .026, .075, 16), b, 0, .098, .06, rg).rotation.x = Math.PI / 2; mk(C(.021, .021, .008, 14), M(0x6fa0c8, .1, .3), 0, .098, .1, rg).rotation.x = Math.PI / 2}
  RG = rg;
 }
}

/* ---------- camera: orbit + pan + zoom toward the cursor ---------- */
let yaw = 0, pitch = .05, dist = 3.7, ytg = null, auto = true, pan = false, lx = 0, ly = 0, pd0 = 0, zoomed = false; const tgt = V(0, .93, 0), ptr = new Map();
function home() {const w = el.clientWidth || 1, h = el.clientHeight || 1; tgt.set(0, .93, 0); dist = w / h < .8 ? 5.2 : 3.9; pitch = .05; zoomed = false}   // fixed framing: the height slider must change the figure, not the camera
function place() {const cp = Math.cos(pitch); cam.position.set(tgt.x + dist * Math.sin(yaw) * cp, tgt.y + dist * Math.sin(pitch), tgt.z + dist * Math.cos(yaw) * cp); cam.lookAt(tgt)}
function rs() {const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; rd.setSize(w, h); cam.aspect = w / h; if (!zoomed) home(); cam.updateProjectionMatrix(); place()}
function zoomAt(cx, cy, s) {   // keep the world point under the cursor fixed on screen while the distance changes
 const r = el.getBoundingClientRect(), nx = (cx - r.left) / r.width * 2 - 1, ny = -((cy - r.top) / r.height * 2 - 1);
 const nd = cl(dist * s, .45, 9); s = nd / dist; cam.updateMatrixWorld();
 const f = cam.getWorldDirection(V(0,0,0)), ray = V(nx, ny, .5).unproject(cam).sub(cam.position).normalize();
 const t = tgt.clone().sub(cam.position).dot(f) / ray.dot(f), P = cam.position.clone().add(ray.multiplyScalar(t));
 tgt.add(P.sub(tgt).multiplyScalar(1 - s)); tgt.set(cl(tgt.x, -1.5, 1.5), cl(tgt.y, .05, 2.4), cl(tgt.z, -1.5, 1.5)); dist = nd; zoomed = true; ytg = null; place();
}
const pm = () => {const p = [...ptr.values()]; return {x:(p[0].x + p[1].x) / 2, y:(p[0].y + p[1].y) / 2, d:Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)}};
addEventListener('resize', rs); rs();
el.addEventListener('contextmenu', e => e.preventDefault());
el.addEventListener('wheel', e => {e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(e.deltaY * (e.deltaMode ? 33 : 1) * .0015))}, {passive:false});
el.addEventListener('pointerdown', e => {ptr.set(e.pointerId, {x:e.clientX, y:e.clientY}); el.setPointerCapture(e.pointerId); ytg = null; pan = e.button == 2 || e.shiftKey; lx = e.clientX; ly = e.clientY; if (ptr.size == 2) pd0 = pm().d});
el.addEventListener('pointermove', e => {
 if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId, {x:e.clientX, y:e.clientY});
 if (ptr.size == 2) {const m = pm(); if (pd0 > 0 && m.d > 0) zoomAt(m.x, m.y, pd0 / m.d); pd0 = m.d; return}
 const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
 if (pan) {cam.updateMatrixWorld(); const k = 2 * dist * Math.tan(cam.fov * Math.PI / 360) / el.clientHeight; tgt.addScaledVector(V(0,0,0).setFromMatrixColumn(cam.matrixWorld, 0), -dx * k).addScaledVector(V(0,0,0).setFromMatrixColumn(cam.matrixWorld, 1), dy * k); tgt.set(cl(tgt.x, -1.5, 1.5), cl(tgt.y, .05, 2.4), cl(tgt.z, -1.5, 1.5)); zoomed = true}
 else {yaw -= dx * .01; if (e.pointerType == 'mouse') pitch = cl(pitch + dy * .008, -.45, 1.25)}   // touch: vertical drag stays page scroll
 place();
});
const up = e => ptr.delete(e.pointerId); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
$('auto').onclick = () => {auto = !auto; ytg = null; $('auto').classList.toggle('on', auto)};
$('views').querySelectorAll('[data-a]').forEach(b => b.onclick = () => {auto = false; $('auto').classList.remove('on'); yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw)); ytg = -(+b.dataset.a)});
$('dbg').onclick = async () => {const t = LOGS.join('\n'); try {await navigator.clipboard.writeText(t); $('dbg').textContent = 'Copied!'} catch (e) {prompt('Copy this debug info:', t)} setTimeout(() => $('dbg').textContent = 'Copy debug info', 2000)};
$('rv').onclick = () => {home(); ytg = 0; place()};
(function loop() {
 requestAnimationFrame(loop);
 {const dt = clk.getDelta(); if (MIX) MIX.update(dt)}
 if (!ptr.size) {
  if (ytg !== null) {let d = ytg - yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); yaw += d * .12; pitch += (.05 - pitch) * .12; if (Math.abs(d) < .002) ytg = null; place()}
  else if (auto) {yaw -= .006; place()}
 }
 rd.render(sc, cam);
})();

/* ---------- menu / loadout UI ---------- */
const buyUrl = x => x.url || CFG.base + x.id + '/' + (CFG.affiliate ? '?' + CFG.affiliate : '');
let TAB = D.at(0).k, Q = '';
const picked = () => D.filter(d => S[d.k] != null).map(d => d.i.at(S[d.k]));
const thumb = (x, d) => x.image ? '<img src="' + x.image + '" alt="" loading="lazy" data-fb="' + d.l.charAt(0) + '" data-bg="' + hex(x.c) + '">' : x.img && IMGS[x.img] ? '<img src="' + IMGS[x.img] + '" alt="">' : '<span style="background:' + hex(x.c) + '">' + d.l.charAt(0) + '</span>';
function renderMenu() {
 $('tabs').innerHTML = D.map(d => '<button class="tab' + (d.k == TAB && !Q ? ' on' : '') + '" data-t="' + d.k + '">' + d.l + (S[d.k] != null ? '<i></i>' : '') + '</button>').join('');
 const L = D.flatMap(d => (Q || d.k == TAB ? d.i : []).map((x, j) => ({d, x, j})).filter(o => Q ? o.x.n.toLowerCase().includes(Q) : !SUB || o.x.sub == SUB)), sv = SUB && !Q;
 $('vh').className = 'vh' + (sv ? ' on' : ''); $('vh').innerHTML = sv ? 'Showing <b>AR-15 / M4 / M16 › ' + esc(SUBT[SUB] || SUB) + '</b> (' + L.length + ') <button type="button" class="b" id="vall">Show all rifles</button>' : '';
 $('cards').innerHTML = L.length ? L.map(({d, x, j}) => {
  const on = S[d.k] === j;
  return '<div class="card' + (on ? ' on' : '') + '"><div class="th">' + thumb(x, d) + '</div><div class="ci">' + (x.tag ? '<span class="bg">' + esc(x.tag) + '</span>' : '') + '<div class="cn">' + esc(x.n) + '</div><div class="cp">' + (x.oos ? 'Out of stock' : x.pt || f$(x.p)) + '</div><div class="ca">' +
   (x.oos ? '<button class="b" disabled>Unavailable</button>' : '<button class="b' + (on ? '' : ' pri') + '" data-k="' + d.k + '" data-j="' + j + '">' + (on ? 'Remove' : 'Equip') + '</button>') +
   '<a class="b" href="' + buyUrl(x) + '" target="_blank" rel="noopener">See on Evike ↗</a></div></div></div>';
 }).join('') : '<div class="empty">' + (sv ? 'No guns added to this category yet.' : 'No gear matches your search.') + '</div>';
}
function renderTiles() {
 const cl2 = D.map(d => '<a href="#planner" data-t="' + d.k + '">' + d.l + '</a>').join(''); $('fcat').innerHTML = cl2;
 $('tiles').innerHTML = D.map(d => '<a class="tile" href="#planner" data-t="' + d.k + '"><div class="th">' + thumb(d.i[0], d) + '</div><b>' + d.l + '</b><small>' + d.i.length + (d.i.length == 1 ? ' item' : ' items') + '</small></a>').join('');
}
function renderLoadout() {
 const p = picked();
 $('lo').innerHTML = p.length ? D.filter(d => S[d.k] != null).map(d => {const x = d.i.at(S[d.k]);
  return '<div class="row2"><div class="th sm">' + thumb(x, d) + '</div><div class="ci"><div class="tag">' + d.l + '</div><div class="cn">' + esc(x.n) + '</div><div class="ln"><b>' + (x.pt || f$(x.p)) + '</b><a class="b pri" href="' + buyUrl(x) + '" target="_blank" rel="noopener">Buy on Evike ↗</a></div></div></div>'}).join('')
  : '<div class="empty">Nothing equipped yet. Pick gear from the menu on the left.</div>';
 $('cnt').textContent = p.length + (p.length == 1 ? ' item' : ' items'); $('tot').textContent = f$(p.reduce((a, x) => a + x.p, 0)); $('ht').textContent = $('tot').textContent;
}
function change() {renderMenu(); renderLoadout(); build()}
$('tabs').onclick = e => {const b = e.target.closest('[data-t]'); if (b) {TAB = b.dataset.t; SUB = ''; Q = ''; $('q').value = ''; renderMenu()}};
const goCat = e => {const b = e.target.closest('[data-t]'); if (b) {TAB = b.dataset.t; SUB = ''; Q = ''; $('q').value = ''; renderMenu()}};
$('fcat').onclick = goCat; $('tiles').onclick = goCat;
$('vh').onclick = e => {if (e.target.id == 'vall') {SUB = ''; renderMenu()}};
document.addEventListener('a360sub', e => {TAB = 'rifle'; SUB = e.detail; Q = ''; $('q').value = ''; renderMenu(); if (location.hash != '#planner') location.hash = '#planner'; else $('planner').scrollIntoView({behavior:'smooth'})});
document.addEventListener('error', e => {const t = e.target; if (t.tagName == 'IMG' && t.dataset.fb) {const sp = document.createElement('span'); sp.textContent = t.dataset.fb; sp.style.background = t.dataset.bg; t.replaceWith(sp)}}, true);
$('cards').onclick = e => {const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k, j = +b.dataset.j; if (S[k] === j) delete S[k]; else S[k] = j; change()};
$('clr').onclick = () => {for (const k in S) delete S[k]; change()};
$('co').onclick = () => {
 const p = picked(); if (!p.length) {alert('Equip at least one item first.'); return}
 $('ol').innerHTML = p.map(x => '<li><a href="' + buyUrl(x) + '" target="_blank" rel="noopener">' + esc(x.n) + '</a> — ' + (x.pt || f$(x.p)) + '</li>').join(''); $('md').classList.add('on');
};
$('x').onclick = () => $('md').classList.remove('on');
$('all').onclick = () => picked().forEach(x => window.open(buyUrl(x), '_blank', 'noopener'));
$('cp').onclick = async () => {const t = picked().map(x => x.n + ' - ' + f$(x.p) + ' - ' + buyUrl(x)).join('\n'); try {await navigator.clipboard.writeText(t); $('mm').textContent = 'Copied to clipboard.'} catch (e) {$('mm').textContent = 'Copy failed. Select the links above instead.'}};
const pick = s => {if (s == SEX && RIG) return; $('gm').classList.toggle('on', s == 'male'); $('gf').classList.toggle('on', s == 'female'); loadModel(s)};
$('gm').onclick = () => pick('male'); $('gf').onclick = () => pick('female');
$('ps').innerHTML = POSES.map(([k, l]) => '<option value="' + k + '">' + l + '</option>').join(''); $('ps').onchange = e => {POSE = e.target.value; loadModel(SEX)};

/* ---------- body sliders (independent) ---------- */
let HS = 178, WT = 72;
function apply() {
 HF = HS / 178; man.scale.setScalar(HF);                    // height only: uniform scale, so rigid gear is never warped
 BW = WT >= 72 ? 1 + .15 * (WT - 72) / 78 : 1 - .15 * (72 - WT) / 27; BWm = BW / HF;   // 45 kg = 0.85, 72 kg = 1.00, 150 kg = 1.15       // weight only: thickness on x/z, independent of height
                                  // fabric carrier follows body thickness
 const inch = Math.round(HS / 2.54); $('hv').textContent = HS + " cm / " + Math.floor(inch / 12) + "\u2032" + (inch % 12) + "\u2033"; $('wv').textContent = WT + " kg / " + Math.round(WT * 2.2046) + " lb"; rs(); layout();
}
$('hs').oninput = e => {HS = +e.target.value; apply()}; $('ws').oninput = e => {WT = +e.target.value; apply()};
/* ---------- search, product pages, cart ---------- */
let CART = []; try {CART = JSON.parse(localStorage.getItem('a360cart') || '[]')} catch (e) {}
const saveCart = () => {try {localStorage.setItem('a360cart', JSON.stringify(CART))} catch (e) {}};
const all = () => D.flatMap(d => d.i.map((x, j) => ({d, x, j}))), byId = id => all().find(o => String(o.x.id) == String(id));
const money = x => x.oos ? 'Out of stock' : x.pt || f$(x.p), terms = q => q.toLowerCase().split(/\s+/).filter(Boolean);
const find = q => {const t = terms(q); return t.length ? all().filter(o => t.every(w => o.x.n.toLowerCase().includes(w))) : []};
const hl = (t, q) => {const w = terms(q); if (!w.length) return esc(t); const re = new RegExp('(' + w.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi'); return t.split(re).map((p, i) => i % 2 ? '<mark>' + esc(p) + '</mark>' : esc(p)).join('')};
let tt; const toast = (msg, href, label) => {const t = $('toast'); t.innerHTML = esc(msg) + (href ? '<a href="' + href + '">' + esc(label) + '</a>' : ''); t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3500)};
const inCart = o => CART.includes(String(o.x.id)), inLo = o => S[o.d.k] === o.j, buy = x => buyUrl(x);
const btns = o => o.x.oos ? '<button class="b" disabled>Out of stock</button>' : '<button class="b pri" data-cart="' + o.x.id + '">' + (inCart(o) ? 'Remove From Cart' : 'Add To Cart') + '</button><button class="b" data-lo="' + o.x.id + '">' + (inLo(o) ? 'Remove From Loadout' : 'Add To Loadout') + '</button>';
const badge = x => x.tag ? '<span class="bg">' + esc(x.tag) + '</span>' : '';
const prod = (o, q) => '<article class="pc"><a class="th" href="#/product/' + o.x.id + '">' + thumb(o.x, o.d) + '</a><div class="pb">' + badge(o.x) + '<a class="pn" href="#/product/' + o.x.id + '">' + hl(o.x.n, q) + '</a><div class="pp">' + esc(money(o.x)) + '</div><div class="pa">' + btns(o) + '<a class="b" href="' + buy(o.x) + '" target="_blank" rel="noopener">See on Evike ↗</a></div></div></article>';
const SPEC_ROWS = [['Manufacturer', 'mfr'], ['Length / weight', 'size'], ['FPS range', 'fps'], ['Inner barrel', 'barrel'], ['Magazine capacity', 'mag'], ['Gearbox / motor', 'gb'], ['Fire modes', 'fire'], ['Recommended battery', 'batt'], ["What's in the box", 'incl']];
const specsHtml = x => '<section class="spx"><h2>Specs</h2>' + (x.specs ? '<table>' + SPEC_ROWS.map(([l, k]) => '<tr><th>' + l + '</th><td>' + esc(x.specs[k] || 'Not listed') + '</td></tr>').join('') + '</table>' : '<p class="mu">Specs for this model are coming soon.</p>') + '<p class="mu">A quick summary, as last seen on Evike. <a class="lk" href="' + buy(x) + '" target="_blank" rel="noopener">See the full description on Evike.com ↗</a></p></section>';
const cartItems = () => CART.map(byId).filter(Boolean), renderCart = () => {$('hb').textContent = CART.length};
function showOrder(xs) {$('ol').innerHTML = xs.map(x => '<li><a href="' + buy(x) + '" target="_blank" rel="noopener">' + esc(x.n) + '</a> — ' + esc(x.pt || f$(x.p)) + '</li>').join(''); $('md').classList.add('on')}
function route(keep) {
 const m = /^#\/(search|product|cart)(?:\/([^?]*))?(?:\?(.*))?$/.exec(location.hash), home = $('home'), rp = $('rp');
 if (!m) {const was = home.hidden; rp.hidden = true; home.hidden = false; if (was) rs(); const t = !keep && location.hash.length > 1 && document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); return}
 home.hidden = true; rp.hidden = false;
 if (m[1] == 'search') {
  const q = new URLSearchParams(m[3] || '').get('q') || '', r = find(q); $('q').value = q;
  rp.innerHTML = '<nav class="bc"><a href="#planner">Home</a> › Search</nav><h1 class="rh">' + (q ? r.length + ' result' + (r.length == 1 ? '' : 's') + ' for “' + esc(q) + '”' : 'Search') + '</h1>' + (r.length ? r.map(o => prod(o, q)).join('') : '<p class="mu">' + (q ? 'No gear matches your search. Try a different word.' : 'Type something in the search bar above.') + '</p>');
 } else if (m[1] == 'product') {
  const o = byId(decodeURIComponent(m[2] || '')); if (!o) {rp.innerHTML = '<h1 class="rh">Product not found</h1><p><a class="lk" href="#planner">Back to the planner</a></p>'; return}
  const x = o.x, path = x.sub ? 'Airsoft Guns › Shop By Rifle Models › AR-15 / M4 / M16 › ' + (SUBT[x.sub] || x.sub) : o.d.l;
  rp.innerHTML = '<nav class="bc"><button type="button" class="lk" data-back>‹ Back</button> · ' + esc(path) + '</nav><div class="pd"><div class="th">' + thumb(x, o.d) + '</div><div>' + badge(x) + '<h1>' + esc(x.n) + '</h1><div class="pp">' + esc(money(x)) + '</div>' + (x.pt && x.pt.includes('–') ? '<p class="mu">Price varies by option. The cart and loadout totals use the lowest price.</p>' : '') + '<div class="pa">' + btns(o) + '<a class="b" href="' + buy(x) + '" target="_blank" rel="noopener">See on Evike ↗</a></div><p class="mu">Prices as last seen on Evike. Confirm size, color, stock and eye-protection rating on the product page.</p></div></div>' + specsHtml(x);
 } else {
  const its = cartItems(), tot = its.reduce((a, o) => a + o.x.p, 0);
  rp.innerHTML = '<nav class="bc"><a href="#planner">Home</a> › Cart</nav><h1 class="rh">Your cart</h1>' + (its.length ? its.map(o => '<article class="pc"><a class="th" href="#/product/' + o.x.id + '">' + thumb(o.x, o.d) + '</a><div class="pb"><a class="pn" href="#/product/' + o.x.id + '">' + esc(o.x.n) + '</a><div class="pp">' + esc(money(o.x)) + '</div><div class="pa"><button class="b" data-cart="' + o.x.id + '">Remove</button></div></div></article>').join('') + '<div class="ct"><span>' + its.length + (its.length == 1 ? ' item' : ' items') + '</span><b>' + f$(tot) + '</b></div><div class="pa"><button class="b pri" id="ckc" style="padding:12px 24px;font-size:14px">Checkout on Evike.com</button><button class="b" id="clc">Clear cart</button></div><p class="mu">Evike has its own cart and checkout, so this opens each item on Evike.com for you to add there. Price ranges count at their lowest price.</p>' : '<p class="mu">Your cart is empty. Use “Add To Cart” on any product.</p>');
 }
 if (!keep) window.scrollTo(0, 0);
}
function toggleCart(id) {const k = String(id), i = CART.indexOf(k); if (i < 0) {CART.push(k); toast('Added to cart', '#/cart', 'View cart')} else {CART.splice(i, 1); toast('Removed from cart')} saveCart(); renderCart(); route(true)}
function toggleLo(id) {const o = byId(id); if (!o) return; if (S[o.d.k] === o.j) {delete S[o.d.k]; toast('Removed from loadout')} else {S[o.d.k] = o.j; toast('Added to loadout', '#loadout', 'View loadout')} change(); route(true)}
$('rp').onclick = e => {
 if (e.target.closest('[data-back]')) {history.length > 1 ? history.back() : location.hash = '#planner'; return}
 const c = e.target.closest('[data-cart]'), l = e.target.closest('[data-lo]'); if (c) toggleCart(c.dataset.cart); else if (l) toggleLo(l.dataset.lo);
 else if (e.target.id == 'ckc') showOrder(cartItems().map(o => o.x)); else if (e.target.id == 'clc') {CART = []; saveCart(); renderCart(); route(true)}
};
const sd = $('sd');
function drop() {
 const q = $('q').value.trim(); if (!q) {sd.className = 'sd'; return}
 const r = find(q);
 sd.innerHTML = r.length ? r.slice(0, 5).map(o => '<a class="sdr" href="#/product/' + o.x.id + '"><div class="th sm">' + thumb(o.x, o.d) + '</div><span class="sdn">' + hl(o.x.n, q) + '</span><b>' + esc(money(o.x)) + '</b></a>').join('') + (r.length > 5 ? '<a class="sdm" href="#/search?q=' + encodeURIComponent(q) + '">See ' + (r.length - 5) + ' More Results</a>' : '') : '<div class="sdn0">No results for “' + esc(q) + '”</div>';
 sd.className = 'sd on';
}
const goSearch = () => {const q = $('q').value.trim(); if (q) {sd.className = 'sd'; location.hash = '#/search?q=' + encodeURIComponent(q)}};
$('q').addEventListener('input', drop); $('q').addEventListener('focus', drop); $('sb').onclick = goSearch;
$('q').addEventListener('keydown', e => {if (e.key == 'Enter') goSearch(); else if (e.key == 'Escape') sd.className = 'sd'});
document.addEventListener('click', e => {if (!e.target.closest('.sr') || e.target.closest('.sdr,.sdm')) sd.className = 'sd'});
addEventListener('hashchange', () => route());
loadCatalog().then(() => {addGuns(); CART = CART.map(String).filter(id => byId(id)); renderCart(); renderTiles(); apply(); change(); route(); loadModel('male')});
}
(function () {   // dark/light toggle: follows the device until the visitor picks one, then remembers the choice
 const r = document.documentElement, b = document.getElementById('tg');
 const cur = () => r.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
 const paint = () => {const l = cur() == 'light'; b.textContent = l ? '☾ Dark mode' : '☀ Light mode'; b.setAttribute('aria-label', 'Switch to ' + (l ? 'dark' : 'light') + ' mode')};
 b.onclick = () => {const n = cur() == 'light' ? 'dark' : 'light'; r.dataset.theme = n; try {localStorage.setItem('a360theme', n)} catch (e) {} paint()};
 paint();
})();
</script>
<script>
(function () {
 const CONTACT_EMAIL = '', CONTACT_ENDPOINT = '';   // set ONE later: CONTACT_EMAIL = 'you@yourdomain.com' (opens the visitor's mail app), or CONTACT_ENDPOINT = a form service URL such as Formspree (sends directly)
 const $ = id => document.getElementById(id), st = $('cx');
 const say = (t, c) => {st.textContent = t; st.className = c || ''};
 $('cf').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('cn').value.trim(), email = $('ce').value.trim(), message = $('cm').value.trim();
  [$('cn'), $('ce'), $('cm')].forEach(x => x.classList.remove('bad'));
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !okEmail || !message) {if (!name) $('cn').classList.add('bad'); if (!okEmail) $('ce').classList.add('bad'); if (!message) $('cm').classList.add('bad'); say('Please fill in your name, a valid email and a message.', 'err'); return}
  if ($('cw').value) {say('Thanks! Your message was sent.', 'ok'); return}   // spam trap: bots fill the hidden field
  if (CONTACT_ENDPOINT) {
   $('cs').disabled = true; say('Sending...');
   try {
    const r = await fetch(CONTACT_ENDPOINT, {method:'POST', headers:{'Accept':'application/json', 'Content-Type':'application/json'}, body:JSON.stringify({name, email, message})});
    if (!r.ok) throw new Error(r.status);
    say('Thanks! Your message was sent.', 'ok'); $('cf').reset();
   } catch (err) {say('Sorry, the message could not be sent. Please try again later.', 'err')}
   $('cs').disabled = false;
  } else if (CONTACT_EMAIL) {
   location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Armory 360 message from ' + name) + '&body=' + encodeURIComponent(message + '\n\n' + name + '\n' + email);
   say('Opening your email app to send this message.', 'ok');
  } else {say('The contact form is not connected yet, so this message was not sent.', 'err')}
 });
})();
</script><script>
(function () {   // dropdowns: hover on desktop, click/tap or keyboard everywhere; Esc or an outside click closes them
 const closeAll = keep => document.querySelectorAll('.dm.open,.sm.open').forEach(x => {if (!keep || !x.contains(keep)) {x.classList.remove('open'); const b = x.querySelector(':scope > button'); if (b) b.setAttribute('aria-expanded', 'false')}});
 document.addEventListener('click', e => {
  const b = e.target.closest('.dt,.st');
  if (b) {const p = b.parentElement, o = !p.classList.contains('open'); closeAll(p); p.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o))}
  else if (!e.target.closest('.dp')) closeAll();
 });
 document.addEventListener('keydown', e => {if (e.key === 'Escape') closeAll()});
 document.addEventListener('click', e => {
  const t = e.target.closest('.s3'); if (t) {const g = t.parentElement, o = !g.classList.contains('open'); g.classList.toggle('open', o); t.setAttribute('aria-expanded', String(o)); return}
  const c = e.target.closest('.c3'); if (c) {closeAll(); const nv = document.querySelector('.mainnav'); nv.classList.add('shut'); nv.addEventListener('mouseleave', () => nv.classList.remove('shut'), {once:true}); document.dispatchEvent(new CustomEvent('a360sub', {detail:c.dataset.sub}))}
 });
})();
