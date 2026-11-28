const LIBS = ['./three.min.js', './GLTFLoader.js'];
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
const rd = new T.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true}); rd.shadowMap.enabled = true; rd.shadowMap.type = T.PCFSoftShadowMap; rd.setPixelRatio(Math.min(devicePixelRatio, 2)); el.appendChild(rd.domElement);
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
function addUnderwear() {
 if (/[?&]under=0/.test(location.search)) return;
 const mt = new T.MeshStandardMaterial({color:0x1f2229, roughness:0.88, metalness:0.02});
 const hip = BM.hips;
 if (hip) {
  const s = hip.getWorldScale(V(0,0,0)).y || 1, k = 1 / s;
  const band = new T.Mesh(new T.CylinderGeometry(0.168 * k, 0.175 * k, 0.16 * k, 28, 1), mt);
  band.position.set(0, -0.03 * k, 0.005 * k); band.scale.set(1.06, 1, 0.72);
  band.castShadow = band.receiveShadow = true; hip.add(band);
  if (SEX !== 'female') {
   for (const q of [-1, 1]) {
    const leg = new T.Mesh(new T.CylinderGeometry(0.088 * k, 0.082 * k, 0.14 * k, 20), mt);
    leg.position.set(q * 0.088 * k, -0.12 * k, 0.005 * k); leg.scale.set(1, 1, 0.88);
    leg.castShadow = leg.receiveShadow = true; hip.add(leg);
   }
  }
 }
 if (SEX === 'female' && BM.spine2) {
  const s = BM.spine2.getWorldScale(V(0,0,0)).y || 1, k = 1 / s;
  const bra = new T.Mesh(new T.CylinderGeometry(0.148 * k, 0.142 * k, 0.11 * k, 28), mt);
  bra.position.set(0, 0.03 * k, 0.012 * k); bra.scale.set(1.08, 1, 0.78);
  bra.castShadow = bra.receiveShadow = true; BM.spine2.add(bra);
 }
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
 male:{idle:'male', ridle:'male_rifle_idle', firing:'male_firing_rifle', strafe:'male_strafe_right', pistol:'male_pistol_idle', grenade:'male_grenade_throw', reload:'male_reload', pfiring:'male_prone_firing_rifle', preload:'male_prone_reload'},
 female:{idle:'female', ridle:'female_rifle_idle', firing:'female_firing_rifle', strafe:'female_strafe_right', pistol:'female_pistol_idle', grenade:'female_grenade_throw', reload:'female_reloading', pfiring:'female_prone_firing_rifle', preload:'female_prone_reloading'}
};
let DOM_HAND = 'right', HELD = 'primary';
if ($('hr')) $('hr').onclick = () => {DOM_HAND = 'right'; $('hr').classList.add('on'); $('hl').classList.remove('on'); attachGear()};
if ($('hl')) $('hl').onclick = () => {DOM_HAND = 'left'; $('hl').classList.add('on'); $('hr').classList.remove('on'); attachGear()};
if ($('wp')) $('wp').onchange = e => {HELD = e.target.value; build(); attachGear(); if (POSE == 'idle') loadModel(SEX)};
const bname = n => strip(n).replace(/.*mixamorig\d*/, '').replace(/_\d+$/, '');
function chainLen(mdl) {
 mdl.updateMatrixWorld(true); const inv = mdl.matrixWorld.clone().invert(), p = k => BM[k] ? BM[k].getWorldPosition(V(0,0,0)).applyMatrix4(inv) : null; let L = 0;
 [['hips', 'spine', 'spine1', 'spine2', 'neck', 'head'], ['leftupleg', 'leftleg', 'leftfoot'], ['rightupleg', 'rightleg', 'rightfoot']].forEach(c => {for (let i = 0; i + 1 < c.length; i++) {const a = p(c[i]), b = p(c[i + 1]); if (a && b) L += a.distanceTo(b)}});
 return L;
}
function attachGear() {
 const P = k => RESTM[k] ? V(0,0,0).setFromMatrixPosition(RESTM[k]) : null, hd = P('head'), sp = P('spine2'), I = new T.Quaternion();
 const comp = (pos, q, sc) => new T.Matrix4().compose(pos, q, V(sc, sc, sc));
 const put = (grp, key, M) => {const b = BM[key]; grp.matrixAutoUpdate = false; if (b && RESTM[key]) {grp.matrix.copy(RESTM[key].clone().invert().multiply(M)); b.add(grp)} else {grp.matrix.copy(M); man.add(grp)} grp.matrixWorldNeedsUpdate = true};
 const c0 = V(0, 1.752, -.005), hc = hd ? hd.clone().add(V(0, .085, .012)) : V(0, 1.67, .01);
 put(HGRP, 'head', comp(hc.clone().sub(c0.clone().multiplyScalar(GS)), I, GS));
 const ch = V(0, 1.3, 0), cc = sp ? sp.clone().add(V(0, -.055, 0)) : V(0, 1.27, 0);
 put(cg, 'spine2', comp(cc.clone().sub(ch.clone().multiplyScalar(GS)), I, GS));
 RGRP.visible = HELD !== 'none';
 const isRifle = HELD === 'primary';
 const handSide = isRifle ? (DOM_HAND === 'right' ? 'left' : 'right') : DOM_HAND;
 const hKey = handSide + 'hand', mKey = handSide + 'handmiddle1', tKey = handSide + 'handthumb1';
 const rh = P(hKey), mid = P(mKey), th = P(tKey);
 let f = V(handSide === 'right' ? -1 : 1, 0, 0), t = V(0, 0, 1), hp = V(handSide === 'right' ? -.4 : .4, 1.45, 0);
 if (rh && mid) {f = mid.clone().sub(rh).normalize(); hp = rh.clone(); if (th) {const t0 = th.clone().sub(rh); t = t0.sub(f.clone().multiplyScalar(t0.dot(f))).normalize()}}
 const y = t, z = f, x = y.clone().cross(z).normalize(), q = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x, y, z)), up = new URLSearchParams(location.search);
 const nums = (k, n) => (up.get(k) || '').split(',').map(Number).concat(Array(n).fill(0)).slice(0, n).map(v => v || 0), rr = nums('rrot', 3), rp = nums('rpos', 3);
 q.multiply(new T.Quaternion().setFromEuler(new T.Euler(rr[0] * Math.PI / 180, rr[1] * Math.PI / 180, rr[2] * Math.PI / 180)));
 const s = .78 * GS, pg = V(0, -.09, -.105), grip = hp.clone().add(f.clone().multiplyScalar(.05));
 put(RGRP, hKey, comp(grip.sub(pg.multiplyScalar(s).applyQuaternion(q)).add(V(rp[0], rp[1], rp[2]).applyQuaternion(q)), q, s));
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
  if (big) {big.geometry.deleteAttribute('color'); (Array.isArray(big.material) ? big.material : [big.material]).forEach(m => {m.map = null; m.vertexColors = false; m.color.set(tone); m.needsUpdate = true;})}}
 const bb = bounds(mdl, true), sz = bb.getSize(V(0,0,0)), ct = bb.getCenter(V(0,0,0)), ok = !bb.isEmpty() && sz.y > 1e-6;
 if (ok && /[?&]slim=/.test(location.search)) try {slimMesh(mdl, bb, ct, sz, SEX == 'female' ? .155 : .17, SEX == 'female' ? .115 : .125, +new URLSearchParams(location.search).get('slim') || 1)} catch (err) {console.warn('Armory360: slimming skipped', err)}   // opt-in: it works in world space, so it is only right for upright poses
 if (!ok) {console.warn('Armory360: could not measure model, using scale 1'); MS = 1} else {MS = TARGET_H / sz.y; mdl.position.x -= ct.x; mdl.position.z -= ct.z; mdl.position.y -= bb.min.y}
 try {if (ok) addUnderwear(mdl, sz)} catch (err) {console.warn('Armory360: underwear skipped', err)}
 console.log('Armory360 model size (units):', sz.x.toFixed(3), sz.y.toFixed(3), sz.z.toFixed(3), 'scale:', MS, 'bones:', bones.length);
 wr.add(mdl); RIG = mdl;
 saved.forEach(([b, p, q, sc]) => {b.position.copy(p); b.quaternion.copy(q); b.scale.copy(sc)});
 const anims = gltf.animations || [];
 if (anims.length) {
  const clip = anims.slice().sort((a, b) => b.tracks.length - a.tracks.length)[0].clone();
  clip.tracks = clip.tracks.filter(t => !/\.scale$/i.test(t.name));
  clip.tracks.forEach(t => {if (/hips\.position$/i.test(t.name)) {const v = t.values; for (let i = 3; i < v.length; i += 3) {v[i] = v[0]; v[i + 2] = v[2]}}});
  MIX = new T.AnimationMixer(mdl); MIX.clipAction(clip).play(); MIX.update(0);
  mdl.position.set(0, 0, 0); wr.scale.setScalar(1); man.updateMatrixWorld(true); mdl.updateMatrixWorld(true);
 const b2 = bounds(mdl, true), s2 = b2.getSize(V(0,0,0)), Lnow = chainLen(mdl);
 if (!b2.isEmpty() && Math.max(s2.y, s2.z) > 1e-6) {
  const isProne = /^p(firing|reload)/i.test(POSE) || s2.z > s2.y * 1.4;
  MS = Lnow > 1e-6 ? (TARGET_H * 1.42) / Lnow : (isProne ? TARGET_H * 1.16 : TARGET_H) / Math.max(s2.y, s2.z);
 }
  wr.scale.setScalar(MS); man.updateMatrixWorld(true); mdl.updateMatrixWorld(true);
  const b3 = bounds(mdl, true);
  if (!b3.isEmpty()) {
   const c3 = b3.getCenter(V(0,0,0)), iw = wr.matrixWorld.clone().invert();
   const d = V(-c3.x, -b3.min.y, -c3.z).applyMatrix4(iw).sub(V(0,0,0).applyMatrix4(iw));
   mdl.position.add(d); mdl.updateMatrixWorld(true);
  }
 } else {
  wr.scale.setScalar(MS); man.updateMatrixWorld(true); mdl.updateMatrixWorld(true);
 }
 const mi = man.matrixWorld.clone().invert();
 ['head', 'spine2', 'lefthand', 'righthand', 'lefthandmiddle1', 'righthandmiddle1', 'lefthandthumb1', 'righthandthumb1'].forEach(k => {if (BM[k]) RESTM[k] = mi.clone().multiply(BM[k].matrixWorld)});
 console.log('Armory360 gear bones found:', Object.keys(RESTM).join(', ') || 'none');
 $('status').textContent = NOTE || (anims.length || !bones.length ? HINT : 'No animation found in this file, showing its default pose'); NOTE = '';
 apply(); build(); attachGear();
}
let gltfLoader = null;
function loadModel(sex) {
 if (!gltfLoader) gltfLoader = new T.GLTFLoader();
 const useRidle = POSE == 'idle' && S.rifle != null && HELD === 'primary' && FILES[sex].ridle;
 const key = useRidle ? 'ridle' : POSE;
 const t = ++LT, url = './' + FILES[sex][key] + '.glb'; SEX = sex; $('status').textContent = 'Loading 3D model…';
 gltfLoader.load(url, g => {if (t == LT) onModel(g)}, undefined, () => {
  if (t != LT) return;
  if (key == 'ridle') {gltfLoader.load('./' + FILES[sex].idle + '.glb', g => {if (t == LT) onModel(g)}); return}
  if (POSE != 'idle') {NOTE = url + ' not found, showing the idle pose'; POSE = 'idle'; $('ps').value = 'idle'; loadModel(sex); return}
  NOTE = url + ' not found, showing placeholder'; onModel({scene:dummy(), animations:[]});
 });
}

function layout() {
 const pr = /^p(firing|reload)/i.test(POSE);
 wr.scale.set(MS * BWm, MS * (pr ? BWm : 1), MS * (pr ? 1 : BWm));
}
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
let playing = true;
$('auto').onclick = () => {auto = !auto; ytg = null; $('auto').classList.toggle('on', auto)};
if ($('play')) $('play').onclick = () => {playing = !playing; $('play').classList.toggle('on', playing); $('play').textContent = playing ? 'Pause pose' : 'Play pose'};
$('views').querySelectorAll('[data-a]').forEach(b => b.onclick = () => {auto = false; $('auto').classList.remove('on'); yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw)); ytg = -(+b.dataset.a)});
$('dbg').onclick = async () => {const t = LOGS.join('\n'); try {await navigator.clipboard.writeText(t); $('dbg').textContent = 'Copied!'} catch (e) {prompt('Copy this debug info:', t)} setTimeout(() => $('dbg').textContent = 'Copy debug info', 2000)};
$('rv').onclick = () => {home(); ytg = 0; place()};
(function loop() {
 requestAnimationFrame(loop);
 {const dt = clk.getDelta(); if (MIX && playing) MIX.update(dt)}
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
function change() {renderMenu(); renderLoadout(); build(); if (POSE == 'idle') loadModel(SEX)}
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
(function () {   // dark/light toggle: follows the device until the visitor picks one, then remembers the choice
 const r = document.documentElement, b = document.getElementById('tg');
 const cur = () => r.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
 const paint = () => {const l = cur() == 'light'; b.textContent = l ? '☾ Dark mode' : '☀ Light mode'; b.setAttribute('aria-label', 'Switch to ' + (l ? 'dark' : 'light') + ' mode')};
 b.onclick = () => {const n = cur() == 'light' ? 'dark' : 'light'; r.dataset.theme = n; try {localStorage.setItem('a360theme', n)} catch (e) {} paint()};
 paint();
})();
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
/* ---------- accounts, named builds, snapshots & gallery ---------- */
const SB_URL = 'https://ddocwakcetsiymiecbxg.supabase.co';
const SB_KEY = 'sb_publishable_iV_nitvsNXmcstTaqNhKsg_9vEnUogf';
let _sb = null, USER = null, SAVED_ROWS = [], EDIT_ID = null;

function getSb() {
 if (!_sb && window.supabase) {
  _sb = window.supabase.createClient(SB_URL, SB_KEY);
  _sb.auth.onAuthStateChange((_ev, sess) => {
   USER = sess?.user || null;
   const ab = document.getElementById('auth-btn'); if (ab) ab.textContent = USER ? 'Log Out' : 'Log In';
   loadSavedBuilds();
  });
 }
 return _sb;
}
getSb();

const showModal = on => {const m = document.getElementById('auth-modal'); if (m) m.style.display = on ? 'flex' : 'none'};
const showGallery = on => {const g = document.getElementById('builds-page'); if (g) g.style.display = on ? 'block' : 'none'};

function requireAuth(fn) {
 if (!getSb()) {
  const s = document.createElement('script');
  s.src = 'https://unpkg.com';
  s.onload = () => {getSb(); requireAuth(fn)};
  s.onerror = () => alert('Could not load auth service—disable strict tracking prevention for this site.');
  document.head.appendChild(s);
  return;
 }
 if (USER) return fn();
 document.getElementById('auth-msg').textContent = 'Log in or create an account to save, share, or view builds.';
 showModal(true);
}

function captureSnapshot() {
 try {
  if (typeof rd !== 'undefined' && typeof sc !== 'undefined' && typeof cam !== 'undefined') rd.render(sc, cam);
  const c = document.querySelector('#stage canvas');
  return c ? c.toDataURL('image/jpeg', 0.72) : '';
 } catch (e) {return ''}
}

function nextDefaultName() {
 const used = new Set(SAVED_ROWS.map(r => r.name.toLowerCase()));
 let n = 1; while (used.has('new loadout ' + n)) n++;
 return 'New Loadout ' + n;
}

function getBuildPayload() {
 return {
  name: (document.getElementById('bname')?.value || '').trim() || nextDefaultName(),
  sex: SEX, pose: POSE, held: HELD, dom: DOM_HAND,
  h: document.getElementById('hs')?.value || 178, w: document.getElementById('ws')?.value || 72,
  gear: Object.assign({}, S)
 };
}

function applyBuildPayload(b, rowId) {
 if (!b) return;
 EDIT_ID = rowId || null;
 if (document.getElementById('bname')) document.getElementById('bname').value = b.name || nextDefaultName();
 Object.keys(S).forEach(k => delete S[k]);
 if (b.gear) Object.assign(S, b.gear);
 if (b.dom) {DOM_HAND = b.dom; document.getElementById('hr')?.classList.toggle('on', DOM_HAND == 'right'); document.getElementById('hl')?.classList.toggle('on', DOM_HAND == 'left')}
 if (b.held) {HELD = b.held; if (document.getElementById('wp')) document.getElementById('wp').value = HELD}
 if (b.h && document.getElementById('hs')) document.getElementById('hs').value = b.h;
 if (b.w && document.getElementById('ws')) document.getElementById('ws').value = b.w;
 if (b.pose) {POSE = b.pose; if (document.getElementById('ps')) document.getElementById('ps').value = POSE}
 apply(); change(); loadModel(b.sex || SEX);
}

function renderBuildsGrid() {
 const grid = document.getElementById('builds-grid'); if (!grid) return;
 const q = (document.getElementById('builds-search')?.value || '').trim().toLowerCase();
 const list = q ? SAVED_ROWS.filter(r => r.name.toLowerCase().includes(q)) : SAVED_ROWS;
 if (!list.length) {
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px 16px;color:#888">${q ? 'No saved loadouts match "' + esc(q) + '".' : 'No saved loadouts yet. Click "+ New Loadout" to build and save your first kit!'}</div>`;
  return;
 }
 grid.innerHTML = list.map(r => `
  <div class="bcard">
   <div style="aspect-ratio:4/3;background:#0e0e0c;display:flex;align-items:center;justify-content:center;overflow:hidden">
    ${r.thumb ? `<img src="${r.thumb}" alt="${esc(r.name)}" style="width:100%;height:100%;object-fit:cover">` : `<span style="color:#555;font-size:13px">3D Preview</span>`}
   </div>
   <div style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center">
   <strong style="font-size:16px;color:#fff">${esc(r.name)}</strong>
   </div>
   <div class="bcard-ov">
    <button type="button" class="b pri" data-bedit="${r.id}" style="width:160px;justify-content:center">Edit Loadout</button>
    <button type="button" class="b" data-bshare="${r.id}" style="width:160px;justify-content:center">Share</button>
    <button type="button" class="b" data-brename="${r.id}" style="width:160px;justify-content:center">Rename</button>
    <button type="button" class="b" data-bdel="${r.id}" style="width:160px;justify-content:center;border-color:#8b3a3a;color:#ff8a8a">Delete</button>
   </div>
  </div>`).join('');
}

let PROFILE = null;

function fallbackAvatar(name) {
 const ch = (name || 'OP').slice(0, 2).toUpperCase();
 return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://w3.org" width="96" height="96"><rect width="96" height="96" fill="#2b3024"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#d4a838" font-family="sans-serif" font-weight="bold" font-size="36">${ch}</text></svg>`);
}

function renderHeaderAccount() {
 const btn = document.getElementById('auth-btn');
 if (!btn) return;
 if (!USER) {
  btn.innerHTML = 'Log In';
  btn.style.padding = '';
  return;
 }
 const name = PROFILE?.callsign || USER.user_metadata?.full_name || USER.user_metadata?.name || USER.email?.split('@')[0] || 'Operator';
 const pic = PROFILE?.avatar_url || USER.user_metadata?.avatar_url || fallbackAvatar(name);
 btn.style.padding = '4px 10px 4px 5px';
 btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:7px"><img src="${pic}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;border:1px solid #d4a838"><span>${esc(name)}</span></span>`;
}

async function loadProfile() {
 const s = getSb();
 if (!s || !USER) { PROFILE = null; renderHeaderAccount(); return; }
 const {data} = await s.from('profiles').select('*').eq('id', USER.id).maybeSingle();
 PROFILE = data || {
  id: USER.id,
  callsign: USER.user_metadata?.full_name || USER.user_metadata?.name || USER.email?.split('@')[0] || 'Operator',
  avatar_url: USER.user_metadata?.avatar_url || '',
  default_gender: 'male',
  default_height: 178,
  default_weight: 72,
  default_terrain: 'woodland'
 };
 renderHeaderAccount();
 if (!new URLSearchParams(location.search).get('build') && !EDIT_ID) {
  if (document.getElementById('hs')) document.getElementById('hs').value = PROFILE.default_height || 178;
  if (document.getElementById('ws')) document.getElementById('ws').value = PROFILE.default_weight || 72;
  if (typeof apply === 'function') apply();
  if (PROFILE.default_gender && typeof loadModel === 'function') loadModel(PROFILE.default_gender);
 }
}

function openAccountView(show) {
 const v = document.getElementById('account-view');
 if (!v) return;
 v.style.display = show ? 'block' : 'none';
 if (!show || !USER) return;
 const name = PROFILE?.callsign || USER.user_metadata?.full_name || USER.email?.split('@')[0] || 'Operator';
 const pic = PROFILE?.avatar_url || USER.user_metadata?.avatar_url || fallbackAvatar(name);
 document.getElementById('acc-pfp-preview').src = pic;
 document.getElementById('acc-callsign').value = name;
 document.getElementById('acc-email').value = USER.email || '(OAuth Account)';
 document.getElementById('acc-gender').value = PROFILE?.default_gender || 'male';
 document.getElementById('acc-height').value = PROFILE?.default_height || 178;
 document.getElementById('acc-weight').value = PROFILE?.default_weight || 72;
 document.getElementById('acc-terrain').value = PROFILE?.default_terrain || 'woodland';
 document.getElementById('acc-status').textContent = '';
}

async function uploadAvatarDataUrl(dataUrl) {
 const s = getSb(); if (!s || !USER) return;
 const img = new Image();
 await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
 const c = document.createElement('canvas'); c.width = 256; c.height = 256;
 const ctx = c.getContext('2d'), min = Math.min(img.width, img.height);
 ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, 256, 256);
 const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.88));
 const path = `${USER.id}/avatar.jpg`;
 const {error} = await s.storage.from('avatars').upload(path, blob, {upsert: true, contentType: 'image/jpeg'});
 if (error) return alert('Avatar upload failed: ' + error.message);
 const {data} = s.storage.from('avatars').getPublicUrl(path);
 const freshUrl = data.publicUrl + '?t=' + Date.now();
 PROFILE = Object.assign({}, PROFILE, {avatar_url: freshUrl});
 await s.from('profiles').upsert({id: USER.id, avatar_url: freshUrl, updated_at: new Date().toISOString()});
 document.getElementById('acc-pfp-preview').src = freshUrl;
 renderHeaderAccount();
 toast('Profile picture updated!');
}

async function loadSavedBuilds() {
 const s = getSb(); if (!s || !USER) {SAVED_ROWS = []; renderBuildsGrid(); return}
 const {data} = await s.from('loadouts').select('id, name, data, thumb').eq('user_id', USER.id).order('created_at', {ascending:false});
 SAVED_ROWS = data || [];
 const bn = document.getElementById('bname');
 if (bn && (!bn.value || /^New Loadout \d+$/i.test(bn.value)) && !EDIT_ID) bn.value = nextDefaultName();
 renderBuildsGrid();
}

async function saveCurrentBuild(copyLink) {
 const s = getSb(); if (!s || !USER) return;
 const payload = getBuildPayload(), thumb = captureSnapshot();
 let rowId = EDIT_ID;
 if (rowId) {
  const {error} = await s.from('loadouts').update({name:payload.name, data:payload, thumb}).eq('id', rowId);
  if (error) return alert(error.message);
 } else {
  const {data, error} = await s.from('loadouts').insert({user_id:USER.id, name:payload.name, data:payload, thumb}).select('id').single();
  if (error) return alert(error.message);
  rowId = data.id; EDIT_ID = rowId;
 }
 await loadSavedBuilds();
 if (copyLink) {
  const url = location.origin + location.pathname + '?build=' + rowId;
  try {await navigator.clipboard.writeText(url); toast('Share link copied!')} catch (e) {prompt('Copy your loadout link:', url)}
 } else {
  toast('Saved "' + payload.name + '"');
 }
}

document.addEventListener('change', e => {
 if (e.target.id === 'acc-pfp-file' && e.target.files?.[0]) {
  const r = new FileReader();
  r.onload = () => uploadAvatarDataUrl(r.result);
  r.readAsDataURL(e.target.files[0]);
 }
});

document.addEventListener('click', async e => {
 const btn = e.target.closest('button');
 const id = btn ? btn.id : e.target.id;
 if (id === 'auth-btn') {
  if (USER) { openAccountView(true); return; }
  document.getElementById('auth-msg').textContent = ''; showModal(true);
 } else if (id === 'acc-back') openAccountView(false);
 else if (id === 'acc-signout') {
  const s = getSb(); if (s) await s.auth.signOut();
  USER = null; PROFILE = null; renderHeaderAccount(); openAccountView(false); toast('Logged out');
 } else if (id === 'acc-pfp-snap') {
  if (typeof captureSnapshot === 'function') await uploadAvatarDataUrl(captureSnapshot());
 } else if (id === 'acc-save') {
  const s = getSb(); if (!s || !USER) return;
  const row = {
   id: USER.id,
   callsign: document.getElementById('acc-callsign').value.trim() || 'Operator',
   avatar_url: PROFILE?.avatar_url || '',
   default_gender: document.getElementById('acc-gender').value,
   default_height: parseInt(document.getElementById('acc-height').value, 10) || 178,
   default_weight: parseInt(document.getElementById('acc-weight').value, 10) || 72,
   default_terrain: document.getElementById('acc-terrain').value,
   updated_at: new Date().toISOString()
  };
  const {error} = await s.from('profiles').upsert(row);
  if (error) return alert(error.message);
  PROFILE = row; renderHeaderAccount();
  document.getElementById('acc-status').textContent = 'Saved!';
  toast('Settings saved');
 } else if (id === 'acc-pass-btn') {
  const s = getSb(), pw = document.getElementById('acc-newpass').value;
  if (!s || pw.length < 6) return alert('Password must be at least 6 characters.');
  const {error} = await s.auth.updateUser({password: pw});
  if (error) return alert(error.message);
  document.getElementById('acc-newpass').value = '';
  toast('Password updated!');
 } else if (id === 'acc-export') {
  await loadSavedBuilds();
  const blob = new Blob([JSON.stringify(SAVED_ROWS, null, 2)], {type: 'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'armory360-builds.json'; a.click();
 } else if (id === 'auth-close') showModal(false);
 else if (id === 'auth-google' || id === 'auth-discord') {
  const s = getSb(); if (!s) return;
  const {error} = await s.auth.signInWithOAuth({provider:id === 'auth-google' ? 'google' : 'discord', options:{redirectTo:location.origin + location.pathname}});
  if (error) document.getElementById('auth-msg').textContent = error.message;
 } else if (id === 'auth-in' || id === 'auth-up') {
  const s = getSb(); if (!s) return;
  const creds = {email:document.getElementById('auth-email').value.trim(), password:document.getElementById('auth-pass').value};
  const {error} = id === 'auth-in' ? await s.auth.signInWithPassword(creds) : await s.auth.signUp(creds);
  if (error) {document.getElementById('auth-msg').textContent = error.message; return}
  showModal(false); await loadProfile(); toast(id === 'auth-in' ? 'Welcome back!' : 'Account created!');
 } else if (id === 'bsave') requireAuth(() => saveCurrentBuild(false));
 else if (id === 'bshare') requireAuth(() => saveCurrentBuild(true));
 else if (id === 'my-builds-btn') requireAuth(() => {loadSavedBuilds(); showGallery(true)});
 else if (id === 'builds-back') showGallery(false);
 else if (id === 'new-loadout-btn') {
  EDIT_ID = null; Object.keys(S).forEach(k => delete S[k]);
  POSE = 'idle'; HELD = 'primary'; DOM_HAND = 'right';
  if (document.getElementById('ps')) document.getElementById('ps').value = 'idle';
if (document.getElementById('wp')) document.getElementById('wp').value = 'primary';
if (document.getElementById('hs')) document.getElementById('hs').value = PROFILE?.default_height || 178;
if (document.getElementById('ws')) document.getElementById('ws').value = PROFILE?.default_weight || 72;
if (document.getElementById('bname')) document.getElementById('bname').value = nextDefaultName();
apply(); change(); loadModel(PROFILE?.default_gender || 'male'); showGallery(false);
} else if (btn?.dataset.bedit) {
const row = SAVED_ROWS.find(r => r.id === btn.dataset.bedit);
if (row) {applyBuildPayload(row.data, row.id); showGallery(false); toast('Editing "' + row.name + '"')}
} else if (btn?.dataset.bshare) {
const url = location.origin + location.pathname + '?build=' + btn.dataset.bshare;
try {await navigator.clipboard.writeText(url); toast('Share link copied!')} catch (err) {prompt('Copy your loadout link:', url)}
} else if (btn?.dataset.brename) {
const row = SAVED_ROWS.find(r => r.id === btn.dataset.brename); if (!row) return;
const nn = prompt('Rename loadout:', row.name); if (!nn || !nn.trim()) return;
const nextData = Object.assign({}, row.data, {name:nn.trim()});
await getSb().from('loadouts').update({name:nn.trim(), data:nextData}).eq('id', row.id);
if (EDIT_ID === row.id && document.getElementById('bname')) document.getElementById('bname').value = nn.trim();
loadSavedBuilds(); toast('Renamed to "' + nn.trim() + '"');
} else if (btn?.dataset.bdel) {
await getSb().from('loadouts').delete().eq('id', btn.dataset.bdel);
if (EDIT_ID === btn.dataset.bdel) EDIT_ID = null;
loadSavedBuilds();
}
});
if (document.getElementById('builds-search')) document.getElementById('builds-search').oninput = renderBuildsGrid;
(async () => {
const s = getSb();
if (s) {
const {data: {session}} = await s.auth.getSession();
if (session?.user) { USER = session.user; await loadProfile(); }
s.auth.onAuthStateChange((_ev, sess) => { USER = sess?.user || null; loadProfile(); });
}
const bid = new URLSearchParams(location.search).get('build');
if (bid && s) {
const {data} = await s.from('loadouts').select('data').eq('id', bid).single();
if (data?.data) applyBuildPayload(data.data);
}
})();
}
