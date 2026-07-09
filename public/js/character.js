1|1|// Zenithia — Character System
2|2|// Boxy player models + customization
3|3|
4|4|import * as THREE from 'three';
5|5|
6|6|// --- Color Palettes ---
7|7|export const PALETTES = {
8|8|  skin: [0xFFDBB4, 0xF5CBA7, 0xD4A574, 0xC68642, 0x8D5524, 0x5C3317],
9|9|  hair: [0x1A1A1A, 0x4E3524, 0x8B4513, 0xDAA520, 0xC0392B, 0x2C3E50, 0x7D3C98, 0xECEFF1],
10|10|  eyes: [0x000000, 0x1B5E20, 0x1565C0, 0x4E342E, 0x7B1FA2, 0x00838F],
11|11|  body: [0x2196F3, 0x4CAF50, 0xFF9800, 0x9C27B0, 0xF44336, 0x607D8B, 0x795548, 0x00BCD4],
12|12|};
13|13|
14|14|// --- Class Colors (tier 2) ---
15|15|export const CLASS_COLORS = {
16|16|  guardian:     { body: 0x455A64, trim: 0xB0BEC5 },
17|17|  blade_dancer: { body: 0xC62828, trim: 0xFFD600 },
18|18|  sage:         { body: 0x4A148C, trim: 0xFFFFFF },
19|19|  cleric:       { body: 0xF5F5F5, trim: 0xFFD600 },
20|20|  shadow:       { body: 0x212121, trim: 0xD32F2F },
21|21|};
22|22|
23|23|// --- Hair Styles ---
24|24|const HAIR_STYLES = {
25|  short: (group, color, scale) => {
26|    const geo = new THREE.BoxGeometry(0.52 * scale, 0.15 * scale, 0.52 * scale);
27|    const mat = new THREE.MeshLambertMaterial({ color });
28|    const hair = new THREE.Mesh(geo, mat);
29|    hair.position.y = 1.72 * scale;
30|    group.add(hair);
31|  },
32|  medium: (group, color, scale) => {
33|    const geo = new THREE.BoxGeometry(0.54 * scale, 0.25 * scale, 0.54 * scale);
34|    const mat = new THREE.MeshLambertMaterial({ color });
35|    const hair = new THREE.Mesh(geo, mat);
36|    hair.position.y = 1.7 * scale;
37|    group.add(hair);
38|    const sideGeo = new THREE.BoxGeometry(0.1 * scale, 0.3 * scale, 0.1 * scale);
39|    const side1 = new THREE.Mesh(sideGeo, mat);
40|    side1.position.set(-0.3 * scale, 1.5 * scale, 0);
41|    group.add(side1);
42|    const side2 = new THREE.Mesh(sideGeo, mat);
43|    side2.position.set(0.3 * scale, 1.5 * scale, 0);
44|    group.add(side2);
45|  },
46|  long: (group, color, scale) => {
47|    const geo = new THREE.BoxGeometry(0.54 * scale, 0.2 * scale, 0.6 * scale);
48|    const mat = new THREE.MeshLambertMaterial({ color });
49|    const hair = new THREE.Mesh(geo, mat);
50|    hair.position.y = 1.72 * scale;
51|    group.add(hair);
52|    const backGeo = new THREE.BoxGeometry(0.4 * scale, 0.8 * scale, 0.15 * scale);
53|    const back = new THREE.Mesh(backGeo, mat);
54|    back.position.set(0, 1.3 * scale, -0.3 * scale);
55|    group.add(back);
56|  },
57|  spiky: (group, color, scale) => {
58|    const mat = new THREE.MeshLambertMaterial({ color });
59|    for (let i = 0; i < 5; i++) {
60|      const geo = new THREE.BoxGeometry(0.1 * scale, 0.3 * scale, 0.1 * scale);
61|      const spike = new THREE.Mesh(geo, mat);
62|      const angle = (i / 5) * Math.PI - Math.PI / 2;
63|      spike.position.set(
64|        Math.sin(angle) * 0.2 * scale,
65|        1.85 * scale + (i % 2) * 0.1 * scale,
66|        Math.cos(angle) * 0.1 * scale
67|      );
68|      spike.rotation.z = Math.sin(angle) * 0.3;
69|      group.add(spike);
70|    }
71|  },
72|  ponytail: (group, color, scale) => {
73|    const geo = new THREE.BoxGeometry(0.52 * scale, 0.18 * scale, 0.52 * scale);
74|    const mat = new THREE.MeshLambertMaterial({ color });
75|    const hair = new THREE.Mesh(geo, mat);
76|    hair.position.y = 1.72 * scale;
77|    group.add(hair);
78|    const tailGeo = new THREE.BoxGeometry(0.12 * scale, 0.6 * scale, 0.12 * scale);
79|    const tail = new THREE.Mesh(tailGeo, mat);
80|    tail.position.set(0, 1.4 * scale, -0.35 * scale);
81|    tail.rotation.x = 0.3;
82|    group.add(tail);
83|  },
84|  mohawk: (group, color, scale) => {
85|    const mat = new THREE.MeshLambertMaterial({ color });
86|    const base = new THREE.Mesh(new THREE.BoxGeometry(0.15 * scale, 0.12 * scale, 0.4 * scale), mat);
87|    base.position.y = 1.75 * scale;
88|    group.add(base);
89|    for (let i = 0; i < 4; i++) {
90|      const spike = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.2 * scale, 0.08 * scale), mat);
91|      spike.position.set(0, 1.88 * scale + i * 0.05 * scale, -0.12 * scale + i * 0.08 * scale);
92|      group.add(spike);
93|    }
94|  },
95|  braids: (group, color, scale) => {
96|    const mat = new THREE.MeshLambertMaterial({ color });
97|    const top = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 0.5 * scale), mat);
98|    top.position.y = 1.72 * scale;
99|    group.add(top);
100|    for (let side = -1; side <= 1; side += 2) {
101|      for (let i = 0; i < 3; i++) {
102|        const braid = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.15 * scale, 0.08 * scale), mat);
103|        braid.position.set(side * 0.25 * scale, 1.5 * scale - i * 0.15 * scale, -0.1 * scale);
104|        group.add(braid);
105|      }
106|    }
107|  },
108|  bun: (group, color, scale) => {
109|    const mat = new THREE.MeshLambertMaterial({ color });
110|    const top = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 0.5 * scale), mat);
111|    top.position.y = 1.72 * scale;
112|    group.add(top);
113|    const bun = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.25 * scale, 0.25 * scale), mat);
114|    bun.position.set(0, 1.85 * scale, -0.15 * scale);
115|    group.add(bun);
116|  },
117|  buzz: (group, color, scale) => {
118|    const mat = new THREE.MeshLambertMaterial({ color });
119|    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.08 * scale, 0.52 * scale), mat);
120|    hair.position.y = 1.74 * scale;
121|    group.add(hair);
122|  },
123|  twin_tails: (group, color, scale) => {
124|    const mat = new THREE.MeshLambertMaterial({ color });
125|    const top = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 0.5 * scale), mat);
126|    top.position.y = 1.72 * scale;
127|    group.add(top);
128|    for (let side = -1; side <= 1; side += 2) {
129|      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.5 * scale, 0.1 * scale), mat);
130|      tail.position.set(side * 0.3 * scale, 1.4 * scale, -0.2 * scale);
131|      tail.rotation.x = 0.2;
132|      group.add(tail);
133|    }
134|  },
135|  bowl: (group, color, scale) => {
136|    const mat = new THREE.MeshLambertMaterial({ color });
137|    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.2 * scale, 0.56 * scale), mat);
138|    hair.position.y = 1.72 * scale;
139|    group.add(hair);
140|    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.48 * scale, 0.12 * scale, 0.08 * scale), mat);
141|    fringe.position.set(0, 1.65 * scale, 0.28 * scale);
142|    group.add(fringe);
143|  },
144|};
145|88|
146|89|// --- Build Player Model ---
147|90|export function createPlayerModel(options = {}) {
148|91|  const {
149|92|    skinColor = PALETTES.skin[0],
150|93|    hairColor = PALETTES.hair[0],
151|94|    hairStyle = 'short',
152|95|    eyeColor = PALETTES.eyes[0],
153|96|    bodyColor = PALETTES.body[0],
154|97|    trimColor = 0xFFFFFF,
155|98|    scale = 1,
156|99|    isNPC = false,
157|100|  } = options;
158|101|
159|102|  const group = new THREE.Group();
160|103|
161|104|  // === BODY ===
162|105|  const bodyGeo = new THREE.BoxGeometry(0.6 * scale, 0.8 * scale, 0.4 * scale);
163|106|  const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
164|107|  const body = new THREE.Mesh(bodyGeo, bodyMat);
165|108|  body.position.y = 0.8 * scale;
166|109|  body.castShadow = true;
167|110|  group.add(body);
168|111|
169|112|  // Trim (belt/waist detail)
170|113|  const trimGeo = new THREE.BoxGeometry(0.62 * scale, 0.08 * scale, 0.42 * scale);
171|114|  const trimMat = new THREE.MeshLambertMaterial({ color: trimColor });
172|115|  const trim = new THREE.Mesh(trimGeo, trimMat);
173|116|  trim.position.y = 0.55 * scale;
174|117|  group.add(trim);
175|118|
176|119|  // === HEAD ===
177|120|  const headGeo = new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale);
178|121|  const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
179|122|  const head = new THREE.Mesh(headGeo, headMat);
180|123|  head.position.y = 1.45 * scale;
181|124|  head.castShadow = true;
182|125|  group.add(head);
183|126|
184|127|  // === EYES ===
185|128|  const eyeGeo = new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.05 * scale);
186|129|  const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
187|130|  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
188|131|  leftEye.position.set(-0.12 * scale, 1.5 * scale, 0.26 * scale);
189|132|  group.add(leftEye);
190|133|  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
191|134|  rightEye.position.set(0.12 * scale, 1.5 * scale, 0.26 * scale);
192|135|  group.add(rightEye);
193|136|
194|137|  // Eye whites
195|138|  const whiteGeo = new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, 0.04 * scale);
196|139|  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
197|140|  const leftWhite = new THREE.Mesh(whiteGeo, whiteMat);
198|141|  leftWhite.position.set(-0.12 * scale, 1.5 * scale, 0.25 * scale);
199|142|  group.add(leftWhite);
200|143|  const rightWhite = new THREE.Mesh(whiteGeo, whiteMat);
201|144|  rightWhite.position.set(0.12 * scale, 1.5 * scale, 0.25 * scale);
202|145|  group.add(rightWhite);
203|146|
204|147|  // === HAIR ===
205|148|  if (HAIR_STYLES[hairStyle]) {
206|149|    HAIR_STYLES[hairStyle](group, hairColor, scale);
207|150|  }
208|151|
209|152|  // === LEGS ===
210|153|  const legGeo = new THREE.BoxGeometry(0.2 * scale, 0.5 * scale, 0.3 * scale);
211|154|  const legMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
212|155|  const leftLeg = new THREE.Mesh(legGeo, legMat);
213|156|  leftLeg.position.set(-0.15 * scale, 0.25 * scale, 0);
214|157|  leftLeg.castShadow = true;
215|158|  group.add(leftLeg);
216|159|  const rightLeg = new THREE.Mesh(legGeo, legMat);
217|160|  rightLeg.position.set(0.15 * scale, 0.25 * scale, 0);
218|161|  rightLeg.castShadow = true;
219|162|  group.add(rightLeg);
220|163|
221|164|  // === FEET ===
222|165|  const footGeo = new THREE.BoxGeometry(0.22 * scale, 0.1 * scale, 0.35 * scale);
223|166|  const footMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
224|167|  const leftFoot = new THREE.Mesh(footGeo, footMat);
225|168|  leftFoot.position.set(-0.15 * scale, 0.05 * scale, 0.03 * scale);
226|169|  group.add(leftFoot);
227|170|  const rightFoot = new THREE.Mesh(footGeo, footMat);
228|171|  rightFoot.position.set(0.15 * scale, 0.05 * scale, 0.03 * scale);
229|172|  group.add(rightFoot);
230|173|
231|174|  return group;
232|175|}
233|176|
234|177|// --- Create NPC with specific look ---
235|178|export function createNPCModel(npc) {
236|179|  const NPC_LOOKS = {
237|180|    elder_maren:     { skin: 5, hair: 1, hairStyle: 'medium', body: 0x8D6E63, trim: 0xFFD600 },
238|181|    sir_gendut:      { skin: 1, hair: 2, hairStyle: 'short', body: 0xFF8F00, trim: 0xFFFFFF },
239|182|    miss_lira:       { skin: 0, hair: 3, hairStyle: 'ponytail', body: 0xE91E63, trim: 0xFFFFFF },
240|183|    mr_tani:         { skin: 2, hair: 1, hairStyle: 'short', body: 0x689F38, trim: 0x8D6E63 },
241|184|    mrs_ningsih:     { skin: 1, hair: 0, hairStyle: 'medium', body: 0xAD1457, trim: 0xFFD600 },
242|185|    kris:            { skin: 0, hair: 4, hairStyle: 'spiky', body: 0x42A5F5, trim: 0xFFFFFF },
243|186|    guard_ren:       { skin: 3, hair: 0, hairStyle: 'short', body: 0x607D8B, trim: 0xB0BEC5 },
244|187|    herbalist_sari:  { skin: 2, hair: 6, hairStyle: 'long', body: 0x7B1FA2, trim: 0xFFFFFF },
245|188|  };
246|189|
247|190|  const look = NPC_LOOKS[npc.id] || {};
248|191|  const model = createPlayerModel({
249|192|    skinColor: PALETTES.skin[look.skin ?? 0],
250|193|    hairColor: PALETTES.hair[look.hair ?? 0],
251|194|    hairStyle: look.hairStyle || 'short',
252|195|    bodyColor: look.body || 0x9E9E9E,
253|196|    trimColor: look.trim || 0xFFFFFF,
254|197|    isNPC: true,
255|198|  });
256|199|
257|200|  model.position.set(npc.x, npc.y, npc.z);
258|201|  model.userData = { id: npc.id, name: npc.name, type: 'npc' };
259|202|
260|203|  // Name tag
261|204|  const tagGeo = new THREE.BoxGeometry(1.2, 0.2, 0.05);
262|205|  const tagMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });
263|206|  const tag = new THREE.Mesh(tagGeo, tagMat);
264|207|  tag.position.y = 2.0;
265|208|  model.add(tag);
266|209|
267|210|  return model;
268|211|}
269|212|
270|213|// --- Walk Animation ---
271|214|export function animateWalk(model, dt) {
272|215|  if (!model) return;
273|216|  const leftLeg = model.children.find(c => c.position.x < 0 && c.position.y < 0.4);
274|217|  const rightLeg = model.children.find(c => c.position.x > 0 && c.position.y < 0.4);
275|218|
276|219|  if (leftLeg && rightLeg) {
277|220|    const time = Date.now() * 0.005;
278|221|    leftLeg.rotation.x = Math.sin(time) * 0.3;
279|222|    rightLeg.rotation.x = -Math.sin(time) * 0.3;
280|223|  }
281|224|}
282|225|
283|226|// --- Blink Animation ---
export function blinkEyes(model) {
  if (!model) return;
  const leftEye = model.getObjectByName('leftEye');
  const rightEye = model.getObjectByName('rightEye');
  const leftWhite = model.getObjectByName('leftWhite');
  const rightWhite = model.getObjectByName('rightWhite');
  if (leftEye) leftEye.scale.y = 0.1;
  if (rightEye) rightEye.scale.y = 0.1;
  if (leftWhite) leftWhite.scale.y = 0.1;
  if (rightWhite) rightWhite.scale.y = 0.1;
  setTimeout(() => {
    if (leftEye) leftEye.scale.y = 1;
    if (rightEye) rightEye.scale.y = 1;
    if (leftWhite) leftWhite.scale.y = 1;
    if (rightWhite) rightWhite.scale.y = 1;
  }, 150);
}

// --- Wave Animation ---
export function waveHand(model) {
  if (!model) return;
  const rightArm = model.getObjectByName('rightArm');
  const rightHand = model.getObjectByName('rightHand');
  if (!rightArm || !rightHand) return;
  let t = 0;
  const anim = () => {
    t += 0.15;
    rightArm.rotation.z = -0.8 + Math.sin(t * 3) * 0.3;
    rightHand.position.y = 1.0 + Math.sin(t * 3) * 0.1;
    if (t < Math.PI * 2) requestAnimationFrame(anim);
    else {
      rightArm.rotation.z = 0;
      rightHand.position.y = 0.35;
    }
  };
  anim();
}

// --- Idle Arm Swing ---
export function idleArms(model, time) {
  if (!model) return;
  const leftArm = model.getObjectByName('leftArm');
  const rightArm = model.getObjectByName('rightArm');
  if (leftArm) leftArm.rotation.x = Math.sin(time * 1.5) * 0.1;
  if (rightArm) rightArm.rotation.x = -Math.sin(time * 1.5) * 0.1;
}

export function stopWalk(model) {
284|227|  if (!model) return;
285|228|  model.children.forEach(c => {
286|229|    if (c.position.y < 0.4) c.rotation.x = 0;
287|230|  });
288|231|}
289|232|
290|233|// --- Equipment Visuals ---
291|234|export function applyEquipment(model, equipment) {
292|235|  if (!model || !equipment) return;
293|236|
294|237|  // Remove old equipment visuals
295|238|  removeEquipment(model);
296|239|
297|240|  const eqGroup = new THREE.Group();
298|241|  eqGroup.name = 'equipment';
299|242|
300|243|  // WEAPON — attached to right hand
301|244|  if (equipment.weapon) {
302|245|    const weaponGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
303|246|    const weaponMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
304|247|    const weapon = new THREE.Mesh(weaponGeo, weaponMat);
305|248|    weapon.position.set(0.4, 0.6, 0.1);
306|249|    weapon.rotation.z = -0.3;
307|250|    eqGroup.add(weapon);
308|251|
309|252|    // Handle
310|253|    const handleGeo = new THREE.BoxGeometry(0.05, 0.15, 0.05);
311|254|    const handleMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
312|255|    const handle = new THREE.Mesh(handleGeo, handleMat);
313|256|    handle.position.set(0.4, 0.35, 0.1);
314|257|    handle.rotation.z = -0.3;
315|258|    eqGroup.add(handle);
316|259|  }
317|260|
318|261|  // SHIELD — attached to left hand
319|262|  if (equipment.shield) {
320|263|    const shieldGeo = new THREE.BoxGeometry(0.05, 0.35, 0.3);
321|264|    const shieldMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
322|265|    const shield = new THREE.Mesh(shieldGeo, shieldMat);
323|266|    shield.position.set(-0.45, 0.7, 0.15);
324|267|    eqGroup.add(shield);
325|268|  }
326|269|
327|270|  // HELMET — on top of head
328|271|  if (equipment.helmet) {
329|272|    const helmGeo = new THREE.BoxGeometry(0.55, 0.2, 0.55);
330|273|    const helmMat = new THREE.MeshLambertMaterial({ color: 0x78909C });
331|274|    const helm = new THREE.Mesh(helmGeo, helmMat);
332|275|    helm.position.set(0, 1.75, 0);
333|276|    eqGroup.add(helm);
334|277|  }
335|278|
336|279|  // ARMOR — change body color tint
337|280|  if (equipment.armor) {
338|281|    const body = model.children.find(c => c.position.y === 0.8 && c.geometry?.parameters?.width === 0.6);
339|282|    if (body) {
340|283|      body.material = new THREE.MeshLambertMaterial({ color: 0x607D8B });
341|284|    }
342|285|  }
343|286|
344|287|  // ACCESSORY — small glow
345|288|  if (equipment.accessory) {
346|289|    const glowGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
347|290|    const glowMat = new THREE.MeshBasicMaterial({ color: 0x7B1FA2, transparent: true, opacity: 0.6 });
348|291|    const glow = new THREE.Mesh(glowGeo, glowMat);
349|292|    glow.position.set(0, 1.2, 0.3);
350|293|    glow.name = 'accessory_glow';
351|294|    eqGroup.add(glow);
352|295|  }
353|296|
354|297|  model.add(eqGroup);
355|298|}
356|299|
357|300|export function removeEquipment(model) {
358|301|  if (!model) return;
359|302|  const eq = model.getObjectByName('equipment');
360|303|  if (eq) model.remove(eq);
361|304|}
362|305|