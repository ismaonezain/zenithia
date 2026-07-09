1|// Zenithia — Character System
2|// Boxy player models + customization
3|
4|import * as THREE from 'three';
5|
6|// --- Color Palettes ---
7|export const PALETTES = {
8|  skin: [0xFFDBB4, 0xF5CBA7, 0xD4A574, 0xC68642, 0x8D5524, 0x5C3317],
9|  hair: [0x1A1A1A, 0x4E3524, 0x8B4513, 0xDAA520, 0xC0392B, 0x2C3E50, 0x7D3C98, 0xECEFF1],
10|  eyes: [0x000000, 0x1B5E20, 0x1565C0],
11|  body: [0x2196F3, 0x4CAF50, 0xFF9800, 0x9C27B0, 0xF44336, 0x607D8B, 0x795548, 0x00BCD4],
12|};
13|
14|// --- Class Colors (tier 2) ---
15|export const CLASS_COLORS = {
16|  guardian:     { body: 0x455A64, trim: 0xB0BEC5 },
17|  blade_dancer: { body: 0xC62828, trim: 0xFFD600 },
18|  sage:         { body: 0x4A148C, trim: 0xFFFFFF },
19|  cleric:       { body: 0xF5F5F5, trim: 0xFFD600 },
20|  shadow:       { body: 0x212121, trim: 0xD32F2F },
21|};
22|
23|// --- Hair Styles ---
24|const HAIR_STYLES = {
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
38|    // Side pieces
39|    const sideGeo = new THREE.BoxGeometry(0.1 * scale, 0.3 * scale, 0.1 * scale);
40|    const side1 = new THREE.Mesh(sideGeo, mat);
41|    side1.position.set(-0.3 * scale, 1.5 * scale, 0);
42|    group.add(side1);
43|    const side2 = new THREE.Mesh(sideGeo, mat);
44|    side2.position.set(0.3 * scale, 1.5 * scale, 0);
45|    group.add(side2);
46|  },
47|  long: (group, color, scale) => {
48|    const geo = new THREE.BoxGeometry(0.54 * scale, 0.2 * scale, 0.6 * scale);
49|    const mat = new THREE.MeshLambertMaterial({ color });
50|    const hair = new THREE.Mesh(geo, mat);
51|    hair.position.y = 1.72 * scale;
52|    group.add(hair);
53|    // Back flow
54|    const backGeo = new THREE.BoxGeometry(0.4 * scale, 0.8 * scale, 0.15 * scale);
55|    const back = new THREE.Mesh(backGeo, mat);
56|    back.position.set(0, 1.3 * scale, -0.3 * scale);
57|    group.add(back);
58|  },
59|  spiky: (group, color, scale) => {
60|    const mat = new THREE.MeshLambertMaterial({ color });
61|    for (let i = 0; i < 5; i++) {
62|      const geo = new THREE.BoxGeometry(0.1 * scale, 0.3 * scale, 0.1 * scale);
63|      const spike = new THREE.Mesh(geo, mat);
64|      const angle = (i / 5) * Math.PI - Math.PI / 2;
65|      spike.position.set(
66|        Math.sin(angle) * 0.2 * scale,
67|        1.85 * scale + (i % 2) * 0.1 * scale,
68|        Math.cos(angle) * 0.1 * scale
69|      );
70|      spike.rotation.z = Math.sin(angle) * 0.3;
71|      group.add(spike);
72|    }
73|  },
74|  ponytail: (group, color, scale) => {
75|    const geo = new THREE.BoxGeometry(0.52 * scale, 0.18 * scale, 0.52 * scale);
76|    const mat = new THREE.MeshLambertMaterial({ color });
77|    const hair = new THREE.Mesh(geo, mat);
78|    hair.position.y = 1.72 * scale;
79|    group.add(hair);
80|    // Ponytail
81|    const tailGeo = new THREE.BoxGeometry(0.12 * scale, 0.6 * scale, 0.12 * scale);
82|    const tail = new THREE.Mesh(tailGeo, mat);
83|    tail.position.set(0, 1.4 * scale, -0.35 * scale);
84|    tail.rotation.x = 0.3;
85|    group.add(tail);
86|  },
87|};
88|
89|// --- Build Player Model ---
90|export function createPlayerModel(options = {}) {
91|  const {
92|    skinColor = PALETTES.skin[0],
93|    hairColor = PALETTES.hair[0],
94|    hairStyle = 'short',
95|    eyeColor = PALETTES.eyes[0],
96|    bodyColor = PALETTES.body[0],
97|    trimColor = 0xFFFFFF,
98|    scale = 1,
99|    isNPC = false,
100|  } = options;
101|
102|  const group = new THREE.Group();
103|
104|  // === BODY ===
105|  const bodyGeo = new THREE.BoxGeometry(0.6 * scale, 0.8 * scale, 0.4 * scale);
106|  const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
107|  const body = new THREE.Mesh(bodyGeo, bodyMat);
108|  body.position.y = 0.8 * scale;
109|  body.castShadow = true;
110|  group.add(body);
111|
112|  // Trim (belt/waist detail)
113|  const trimGeo = new THREE.BoxGeometry(0.62 * scale, 0.08 * scale, 0.42 * scale);
114|  const trimMat = new THREE.MeshLambertMaterial({ color: trimColor });
115|  const trim = new THREE.Mesh(trimGeo, trimMat);
116|  trim.position.y = 0.55 * scale;
117|  group.add(trim);
118|
119|  // === HEAD ===
120|  const headGeo = new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale);
121|  const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
122|  const head = new THREE.Mesh(headGeo, headMat);
123|  head.position.y = 1.45 * scale;
124|  head.castShadow = true;
125|  group.add(head);
126|
127|  // === EYES ===
128|  const eyeGeo = new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.05 * scale);
129|  const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
130|  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
131|  leftEye.position.set(-0.12 * scale, 1.5 * scale, 0.26 * scale);
132|  group.add(leftEye);
133|  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
134|  rightEye.position.set(0.12 * scale, 1.5 * scale, 0.26 * scale);
135|  group.add(rightEye);
136|
137|  // Eye whites
138|  const whiteGeo = new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, 0.04 * scale);
139|  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
140|  const leftWhite = new THREE.Mesh(whiteGeo, whiteMat);
141|  leftWhite.position.set(-0.12 * scale, 1.5 * scale, 0.25 * scale);
142|  group.add(leftWhite);
143|  const rightWhite = new THREE.Mesh(whiteGeo, whiteMat);
144|  rightWhite.position.set(0.12 * scale, 1.5 * scale, 0.25 * scale);
145|  group.add(rightWhite);
146|
147|  // === HAIR ===
148|  if (HAIR_STYLES[hairStyle]) {
149|    HAIR_STYLES[hairStyle](group, hairColor, scale);
150|  }
151|
152|  // === LEGS ===
153|  const legGeo = new THREE.BoxGeometry(0.2 * scale, 0.5 * scale, 0.3 * scale);
154|  const legMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
155|  const leftLeg = new THREE.Mesh(legGeo, legMat);
156|  leftLeg.position.set(-0.15 * scale, 0.25 * scale, 0);
157|  leftLeg.castShadow = true;
158|  group.add(leftLeg);
159|  const rightLeg = new THREE.Mesh(legGeo, legMat);
160|  rightLeg.position.set(0.15 * scale, 0.25 * scale, 0);
161|  rightLeg.castShadow = true;
162|  group.add(rightLeg);
163|
164|  // === FEET ===
165|  const footGeo = new THREE.BoxGeometry(0.22 * scale, 0.1 * scale, 0.35 * scale);
166|  const footMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
167|  const leftFoot = new THREE.Mesh(footGeo, footMat);
168|  leftFoot.position.set(-0.15 * scale, 0.05 * scale, 0.03 * scale);
169|  group.add(leftFoot);
170|  const rightFoot = new THREE.Mesh(footGeo, footMat);
171|  rightFoot.position.set(0.15 * scale, 0.05 * scale, 0.03 * scale);
172|  group.add(rightFoot);
173|
174|  return group;
175|}
176|
177|// --- Create NPC with specific look ---
178|export function createNPCModel(npc) {
179|  const NPC_LOOKS = {
180|    elder_maren:     { skin: 5, hair: 1, hairStyle: 'medium', body: 0x8D6E63, trim: 0xFFD600 },
181|    sir_gendut:      { skin: 1, hair: 2, hairStyle: 'short', body: 0xFF8F00, trim: 0xFFFFFF },
182|    miss_lira:       { skin: 0, hair: 3, hairStyle: 'ponytail', body: 0xE91E63, trim: 0xFFFFFF },
183|    mr_tani:         { skin: 2, hair: 1, hairStyle: 'short', body: 0x689F38, trim: 0x8D6E63 },
184|    mrs_ningsih:     { skin: 1, hair: 0, hairStyle: 'medium', body: 0xAD1457, trim: 0xFFD600 },
185|    kris:            { skin: 0, hair: 4, hairStyle: 'spiky', body: 0x42A5F5, trim: 0xFFFFFF },
186|    guard_ren:       { skin: 3, hair: 0, hairStyle: 'short', body: 0x607D8B, trim: 0xB0BEC5 },
187|    herbalist_sari:  { skin: 2, hair: 6, hairStyle: 'long', body: 0x7B1FA2, trim: 0xFFFFFF },
188|  };
189|
190|  const look = NPC_LOOKS[npc.id] || {};
191|  const model = createPlayerModel({
192|    skinColor: PALETTES.skin[look.skin ?? 0],
193|    hairColor: PALETTES.hair[look.hair ?? 0],
194|    hairStyle: look.hairStyle || 'short',
195|    bodyColor: look.body || 0x9E9E9E,
196|    trimColor: look.trim || 0xFFFFFF,
197|    isNPC: true,
198|  });
199|
200|  model.position.set(npc.x, npc.y, npc.z);
201|  model.userData = { id: npc.id, name: npc.name, type: 'npc' };
202|
203|  // Name tag
204|  const tagGeo = new THREE.BoxGeometry(1.2, 0.2, 0.05);
205|  const tagMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });
206|  const tag = new THREE.Mesh(tagGeo, tagMat);
207|  tag.position.y = 2.0;
208|  model.add(tag);
209|
210|  return model;
211|}
212|
213|// --- Walk Animation ---
214|export function animateWalk(model, dt) {
215|  if (!model) return;
216|  const leftLeg = model.children.find(c => c.position.x < 0 && c.position.y < 0.4);
217|  const rightLeg = model.children.find(c => c.position.x > 0 && c.position.y < 0.4);
218|
219|  if (leftLeg && rightLeg) {
220|    const time = Date.now() * 0.005;
221|    leftLeg.rotation.x = Math.sin(time) * 0.3;
222|    rightLeg.rotation.x = -Math.sin(time) * 0.3;
223|  }
224|}
225|
226|export function stopWalk(model) {
227|  if (!model) return;
228|  model.children.forEach(c => {
229|    if (c.position.y < 0.4) c.rotation.x = 0;
230|  });
231|}
232|
233|// --- Equipment Visuals ---
234|export function applyEquipment(model, equipment) {
235|  if (!model || !equipment) return;
236|
237|  // Remove old equipment visuals
238|  removeEquipment(model);
239|
240|  const eqGroup = new THREE.Group();
241|  eqGroup.name = 'equipment';
242|
243|  // WEAPON — attached to right hand
244|  if (equipment.weapon) {
245|    const weaponGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
246|    const weaponMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
247|    const weapon = new THREE.Mesh(weaponGeo, weaponMat);
248|    weapon.position.set(0.4, 0.6, 0.1);
249|    weapon.rotation.z = -0.3;
250|    eqGroup.add(weapon);
251|
252|    // Handle
253|    const handleGeo = new THREE.BoxGeometry(0.05, 0.15, 0.05);
254|    const handleMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
255|    const handle = new THREE.Mesh(handleGeo, handleMat);
256|    handle.position.set(0.4, 0.35, 0.1);
257|    handle.rotation.z = -0.3;
258|    eqGroup.add(handle);
259|  }
260|
261|  // SHIELD — attached to left hand
262|  if (equipment.shield) {
263|    const shieldGeo = new THREE.BoxGeometry(0.05, 0.35, 0.3);
264|    const shieldMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
265|    const shield = new THREE.Mesh(shieldGeo, shieldMat);
266|    shield.position.set(-0.45, 0.7, 0.15);
267|    eqGroup.add(shield);
268|  }
269|
270|  // HELMET — on top of head
271|  if (equipment.helmet) {
272|    const helmGeo = new THREE.BoxGeometry(0.55, 0.2, 0.55);
273|    const helmMat = new THREE.MeshLambertMaterial({ color: 0x78909C });
274|    const helm = new THREE.Mesh(helmGeo, helmMat);
275|    helm.position.set(0, 1.75, 0);
276|    eqGroup.add(helm);
277|  }
278|
279|  // ARMOR — change body color tint
280|  if (equipment.armor) {
281|    const body = model.children.find(c => c.position.y === 0.8 && c.geometry?.parameters?.width === 0.6);
282|    if (body) {
283|      body.material = new THREE.MeshLambertMaterial({ color: 0x607D8B });
284|    }
285|  }
286|
287|  // ACCESSORY — small glow
288|  if (equipment.accessory) {
289|    const glowGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
290|    const glowMat = new THREE.MeshBasicMaterial({ color: 0x7B1FA2, transparent: true, opacity: 0.6 });
291|    const glow = new THREE.Mesh(glowGeo, glowMat);
292|    glow.position.set(0, 1.2, 0.3);
293|    glow.name = 'accessory_glow';
294|    eqGroup.add(glow);
295|  }
296|
297|  model.add(eqGroup);
298|}
299|
300|export function removeEquipment(model) {
301|  if (!model) return;
302|  const eq = model.getObjectByName('equipment');
303|  if (eq) model.remove(eq);
304|}
305|