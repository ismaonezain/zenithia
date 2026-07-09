1|// Zenithia — Client Entry Point
2|import * as THREE from 'three';
3|import { buildTerrain } from './terrain.js';
4|import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk } from './character.js';
5|import { DialogueSystem } from './dialogue_ui.js';
6|import { createMonsterModel, updateMonsterHPBar, animateMonster } from './monsters.js';
7|
8|// --- State ---
9|const state = {
10|  playerId: null,
11|  player: null,
12|  ws: null,
13|  scene: null,
14|  camera: null,
15|  renderer: null,
16|  clock: null,
17|  players: {},
18|  npcs: {},
19|  connected: false,
20|  targetPos: null,
21|  customization: {
22|    skinIdx: 0,
23|    hairColorIdx: 0,
24|    hairStyle: 'short',
25|    bodyIdx: 0,
26|  },
27|  previewScene: null,
28|  previewCamera: null,
29|  previewRenderer: null,
30|  previewModel: null,
31|  dialogue: null,
32|  monsters: {},
33|  damageNumbers: [],
34|};
35|
36|const canvas = document.getElementById('game-canvas');
37|const loadingScreen = document.getElementById('loading-screen');
38|const loginScreen = document.getElementById('login-screen');
39|const hud = document.getElementById('hud');
40|
41|// ============================
42|// THREE.JS SCENE
43|// ============================
44|function initScene() {
45|  state.scene = new THREE.Scene();
46|  state.scene.background = new THREE.Color(0x87CEEB);
47|  state.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
48|
49|  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
50|  state.camera.position.set(0, 15, 20);
51|
52|  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
53|  state.renderer.setSize(window.innerWidth, window.innerHeight);
54|  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
55|  state.renderer.shadowMap.enabled = true;
56|  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
57|
58|  state.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
59|  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
60|  sun.position.set(50, 100, 50);
61|  sun.castShadow = true;
62|  sun.shadow.mapSize.set(2048, 2048);
63|  state.scene.add(sun);
64|
65|  buildTerrain(state.scene);
66|  state.clock = new THREE.Clock();
67|
68|  // Init dialogue system
69|  state.dialogue = new DialogueSystem(null, { name: 'Adventurer' });
70|
71|  window.addEventListener('resize', () => {
72|    state.camera.aspect = window.innerWidth / window.innerHeight;
73|    state.camera.updateProjectionMatrix();
74|    state.renderer.setSize(window.innerWidth, window.innerHeight);
75|  });
76|}
77|
78|// ============================
79|// PREVIEW SCENE
80|// ============================
81|function initPreview() {
82|  const pCanvas = document.getElementById('preview-canvas');
83|  state.previewScene = new THREE.Scene();
84|  state.previewScene.background = new THREE.Color(0x2a2a3e);
85|
86|  state.previewCamera = new THREE.PerspectiveCamera(50, 200 / 250, 0.1, 10);
87|  state.previewCamera.position.set(0, 1.2, 3);
88|  state.previewCamera.lookAt(0, 0.8, 0);
89|
90|  state.previewRenderer = new THREE.WebGLRenderer({ canvas: pCanvas, antialias: true });
91|  state.previewRenderer.setSize(200, 250);
92|
93|  state.previewScene.add(new THREE.AmbientLight(0xffffff, 0.8));
94|  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
95|  dir.position.set(2, 3, 2);
96|  state.previewScene.add(dir);
97|
98|  updatePreviewModel();
99|}
100|
101|function updatePreviewModel() {
102|  if (state.previewModel) state.previewScene.remove(state.previewModel);
103|  const c = state.customization;
104|  state.previewModel = createPlayerModel({
105|    skinColor: PALETTES.skin[c.skinIdx],
106|    hairColor: PALETTES.hair[c.hairColorIdx],
107|    hairStyle: c.hairStyle,
108|    bodyColor: PALETTES.body[c.bodyIdx],
109|  });
110|  state.previewScene.add(state.previewModel);
111|}
112|
113|// ============================
114|// CUSTOMIZATION UI
115|// ============================
116|function initCustomization() {
117|  const skinPicker = document.getElementById('skin-picker');
118|  PALETTES.skin.forEach((color, i) => {
119|    const s = document.createElement('div');
120|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
121|    s.style.background = '#' + color.toString(16).padStart(6, '0');
122|    s.onclick = () => {
123|      skinPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
124|      s.classList.add('selected');
125|      state.customization.skinIdx = i;
126|      updatePreviewModel();
127|    };
128|    skinPicker.appendChild(s);
129|  });
130|
131|  const hairPicker = document.getElementById('hair-color-picker');
132|  PALETTES.hair.forEach((color, i) => {
133|    const s = document.createElement('div');
134|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
135|    s.style.background = '#' + color.toString(16).padStart(6, '0');
136|    s.onclick = () => {
137|      hairPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
138|      s.classList.add('selected');
139|      state.customization.hairColorIdx = i;
140|      updatePreviewModel();
141|    };
142|    hairPicker.appendChild(s);
143|  });
144|
145|  const stylePicker = document.getElementById('hair-style-picker');
146|  ['short', 'medium', 'long', 'spiky', 'ponytail'].forEach(style => {
147|    const o = document.createElement('div');
148|    o.className = 'option' + (style === 'short' ? ' selected' : '');
149|    o.textContent = style;
150|    o.onclick = () => {
151|      stylePicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
152|      o.classList.add('selected');
153|      state.customization.hairStyle = style;
154|      updatePreviewModel();
155|    };
156|    stylePicker.appendChild(o);
157|  });
158|
159|  const bodyPicker = document.getElementById('body-picker');
160|  PALETTES.body.forEach((color, i) => {
161|    const s = document.createElement('div');
162|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
163|    s.style.background = '#' + color.toString(16).padStart(6, '0');
164|    s.onclick = () => {
165|      bodyPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
166|      s.classList.add('selected');
167|      state.customization.bodyIdx = i;
168|      updatePreviewModel();
169|    };
170|    bodyPicker.appendChild(s);
171|  });
172|}
173|
174|// ============================
175|// WEBSOCKET
176|// ============================
177|function connectWebSocket(playerName, wallet) {
178|  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
179|  state.ws = new WebSocket(`${protocol}//${location.host}`);
180|
181|  state.ws.onopen = () => {
182|    console.log('[WS] Connected');
183|    state.connected = true;
184|  };
185|  state.ws.onmessage = (event) => {
186|    handleServerMessage(JSON.parse(event.data));
187|  };
188|  state.ws.onclose = () => {
189|    console.log('[WS] Disconnected');
190|    state.connected = false;
191|  };
192|}
193|
194|// ============================
195|// SERVER MESSAGES
196|// ============================
197|function handleServerMessage(msg) {
198|  switch (msg.type) {
199|    case 'welcome':
200|      state.playerId = msg.playerId;
201|      state.ws.send(JSON.stringify({
202|        type: 'join',
203|        name: document.getElementById('name-input').value || 'Adventurer',
204|        wallet: null,
205|      }));
206|      break;
207|
208|    case 'joined':
209|      state.player = msg.player;
210|      state.dialogue.ws = state.ws;
211|      state.dialogue.playerState = state.player;
212|
213|      if (msg.npcs) Object.values(msg.npcs).forEach(npc => {
214|        const model = createNPCModel(npc);
215|        state.scene.add(model);
216|        state.npcs[npc.id] = model;
217|      });
218|      if (msg.onlinePlayers) msg.onlinePlayers.forEach(p => createOtherPlayer(p));
219|      showHUD();
220|      createPlayerModelInWorld(state.player);
221|      break;
222|
223|    case 'player_joined':
224|      createOtherPlayer(msg.player);
225|      break;
226|
227|    case 'player_moved':
228|      if (state.players[msg.playerId]) {
229|        state.players[msg.playerId].position.set(msg.x, msg.y, msg.z);
230|      }
231|      break;
232|
233|    case 'player_left':
234|      if (state.players[msg.playerId]) {
235|        state.scene.remove(state.players[msg.playerId]);
236|        delete state.players[msg.playerId];
237|      }
238|      break;
239|
240|    case 'chat':
241|      addChatMessage(msg.name, msg.message);
242|      break;
243|
244|    case 'npc_dialogue':
245|      state.dialogue.open(msg.npcId, msg.name, msg.title);
246|      break;
247|
248|    case 'quest_started':
249|      addChatMessage('System', `Quest started: ${msg.questName}`);
250|      break;
251|
252|    case 'joined':
253|      // Spawn existing monsters
254|      if (msg.monsters) msg.monsters.forEach(m => spawnMonsterClient(m));
255|      break;
256|
257|    case 'monster_spawn':
258|      spawnMonsterClient(msg.monster);
259|      break;
260|
261|    case 'monster_move':
262|      if (state.monsters[msg.monsterId]) {
263|        state.monsters[msg.monsterId].position.set(msg.x, 0, msg.z);
264|      }
265|      break;
266|
267|    case 'monster_hit': {
268|      const mob = state.monsters[msg.monsterId];
269|      if (mob) updateMonsterHPBar(mob, msg.hp, msg.maxHp);
270|      showDamageNumber(msg.monsterId, msg.damage, msg.isCrit);
271|      break;
272|    }
273|
274|    case 'monster_died': {
275|      const mob = state.monsters[msg.monsterId];
276|      if (mob) {
277|        state.scene.remove(mob);
278|        delete state.monsters[msg.monsterId];
279|      }
280|      break;
281|    }
282|
283|    case 'monster_attack': {
284|      showDamageNumber(null, msg.damage, false, msg.targetId);
285|      break;
286|    }
287|
288|    case 'player_hit': {
289|      updatePlayerHP(msg.hp, msg.maxHp);
290|      break;
291|    }
292|
293|    case 'player_died': {
294|      updatePlayerHP(msg.hp, msg.hp);
295|      addChatMessage('System', 'You died! Respawning at village...');
296|      break;
297|    }
298|
299|    case 'monster_killed': {
300|      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP, +${msg.zen} Zen`);
301|      updatePlayerHP(msg.hp, msg.maxHp);
302|      updatePlayerMP(msg.mp, msg.maxMp);
303|      break;
304|    }
305|
306|    case 'level_up': {
307|      addChatMessage('System', `🎉 Level Up! You are now Level ${msg.level}!`);
308|      updatePlayerHP(msg.maxHp, msg.maxHp);
309|      updatePlayerMP(msg.maxMp, msg.maxMp);
310|      break;
311|    }
312|
313|    case 'combat_message': {
314|      addChatMessage('Combat', msg.text);
315|      break;
316|    }
317|  }
318|}
319|
320|// ============================
321|// PLAYER MODELS
322|// ============================
323|function createPlayerModelInWorld(player) {
324|  const c = state.customization;
325|  const model = createPlayerModel({
326|    skinColor: PALETTES.skin[c.skinIdx],
327|    hairColor: PALETTES.hair[c.hairColorIdx],
328|    hairStyle: c.hairStyle,
329|    bodyColor: PALETTES.body[c.bodyIdx],
330|  });
331|  model.position.set(player.x, player.y, player.z);
332|  model.userData = { id: player.id, name: player.name, type: 'player' };
333|  state.scene.add(model);
334|  state.players[player.id] = model;
335|}
336|
337|function createOtherPlayer(player) {
338|  const model = createPlayerModel({});
339|  model.position.set(player.x, player.y, player.z);
340|  model.userData = { id: player.id, name: player.name, type: 'player' };
341|  state.scene.add(model);
342|  state.players[player.id] = model;
343|}
344|
345|// ============================
346|// HUD
347|// ============================
348|function showHUD() {
349|  loadingScreen.style.display = 'none';
350|  loginScreen.style.display = 'none';
351|  hud.style.display = 'block';
352|}
353|
354|// ============================
355|// CHAT
356|// ============================
357|function addChatMessage(name, message) {
358|  const el = document.getElementById('chat-messages');
359|  const div = document.createElement('div');
360|  div.innerHTML = `<strong>${name}:</strong> ${message}`;
361|  el.appendChild(div);
362|  el.scrollTop = el.scrollHeight;
363|}
364|// ============================
365|// COMBAT HELPERS
366|// ============================
367|const MONSTER_DATA = {
368|  moss_beetle: { name: 'Moss Beetle', color: 0x4CAF50, size: 0.6 },
369|  dust_mouse: { name: 'Dust Mouse', color: 0xBCAAA4, size: 0.35 },
370|  thorn_lizard: { name: 'Thorn Lizard', color: 0x689F38, size: 0.7 },
371|  puddle_frog: { name: 'Puddle Frog', color: 0x00BCD4, size: 0.55 },
372|  wind_sprite: { name: 'Wind Sprite', color: 0x81D4FA, size: 0.4 },
373|  rock_crawler: { name: 'Rock Crawler', color: 0x9E9E9E, size: 0.45 },
374|  bramble_boar: { name: 'Bramble Boar', color: 0x5D4037, size: 1.2 },
375|};
376|
377|function spawnMonsterClient(m) {
378|  const data = MONSTER_DATA[m.type] || { name: m.name, color: 0x999999, size: 0.5 };
379|  const model = createMonsterModel(m.type, { ...data, name: m.name, size: data.size });
380|  model.position.set(m.x, 0, m.z);
381|  model.userData = { id: m.id, type: 'monster', monsterType: m.type };
382|  state.scene.add(model);
383|  state.monsters[m.id] = model;
384|}
385|
386|function showDamageNumber(monsterId, damage, isCrit, targetId) {
387|  let pos;
388|  if (monsterId && state.monsters[monsterId]) {
389|    pos = state.monsters[monsterId].position.clone();
390|    pos.y += 1.5;
391|  } else if (targetId && state.players[targetId]) {
392|    pos = state.players[targetId].position.clone();
393|    pos.y += 1.5;
394|  } else {
395|    return;
396|  }
397|
398|  // Create floating text sprite
399|  const canvas = document.createElement('canvas');
400|  canvas.width = 128;
401|  canvas.height = 64;
402|  const ctx = canvas.getContext('2d');
403|  ctx.fillStyle = isCrit ? '#FFD700' : '#FF5252';
404|  ctx.font = isCrit ? 'bold 36px Courier New' : '28px Courier New';
405|  ctx.textAlign = 'center';
406|  ctx.fillText(isCrit ? `${damage}!` : `-${damage}`, 64, 40);
407|
408|  const texture = new THREE.CanvasTexture(canvas);
409|  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
410|  sprite.position.copy(pos);
411|  sprite.scale.set(0.8, 0.4, 1);
412|  state.scene.add(sprite);
413|
414|  // Animate up and fade
415|  const startTime = Date.now();
416|  const animate = () => {
417|    const elapsed = (Date.now() - startTime) / 1000;
418|    if (elapsed > 1) {
419|      state.scene.remove(sprite);
420|      return;
421|    }
422|    sprite.position.y += 0.02;
423|    sprite.material.opacity = 1 - elapsed;
424|    requestAnimationFrame(animate);
425|  };
426|  animate();
427|}
428|
429|function updatePlayerHP(hp, maxHp) {
430|  const fill = document.getElementById('hp-fill');
431|  const text = document.getElementById('hp-text');
432|  if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
433|  if (text) text.textContent = `${Math.round(hp)}/${maxHp}`;
434|}
435|
436|function updatePlayerMP(mp, maxMp) {
437|  const fill = document.getElementById('mp-fill');
438|  const text = document.getElementById('mp-text');
439|  if (fill) fill.style.width = `${(mp / maxMp) * 100}%`;
440|  if (text) text.textContent = `${Math.round(mp)}/${maxMp}`;
441|}
442|
443|// ============================
444|// CLICK TO MOVE
445|// ============================
446|canvas.addEventListener('click', (e) => {
447|  if (!state.connected || !state.player) return;
448|  // Don't move if dialogue is open
449|  if (state.dialogue.container.style.display === 'block') return;
450|
451|  const mouse = new THREE.Vector2(
452|    (e.clientX / window.innerWidth) * 2 - 1,
453|    -(e.clientY / window.innerHeight) * 2 + 1
454|  );
455|
456|  const raycaster = new THREE.Raycaster();
457|  raycaster.setFromCamera(mouse, state.camera);
458|
459|  const ground = state.scene.getObjectByName('ground');
460|  if (!ground) return;
461|
462|  const intersects = raycaster.intersectObject(ground);
463|  if (intersects.length === 0) return;
464|
465|  const point = intersects[0].point;
466|
467|  // Check NPC proximity
468|  for (const npc of Object.values(state.npcs)) {
469|    if (npc.position.distanceTo(point) < 2) {
470|      state.ws.send(JSON.stringify({ type: 'interact_npc', npcId: npc.userData.id }));
471|      return;
472|    }
473|  }
474|
475|  // Check Monster proximity — attack
476|  for (const mob of Object.values(state.monsters)) {
477|    if (mob.position.distanceTo(point) < 2) {
478|      state.ws.send(JSON.stringify({ type: 'attack', monsterId: mob.userData.id }));
479|      // Face the monster
480|      const model = state.players[state.playerId];
481|      if (model) model.lookAt(mob.position);
482|      return;
483|    }
484|  }
485|
486|  state.targetPos = new THREE.Vector3(point.x, 0, point.z);
487|});
488|
489|// ============================
490|// SMOOTH MOVEMENT
491|// ============================
492|function updateMovement() {
493|  if (!state.targetPos) return;
494|  const model = state.players[state.playerId];
495|  if (!model) return;
496|
497|  const dir = new THREE.Vector3().subVectors(state.targetPos, model.position);
498|  if (dir.length() < 0.1) {
499|    model.position.copy(state.targetPos);
500|    state.ws.send(JSON.stringify({ type: 'move', x: state.targetPos.x, y: 0, z: state.targetPos.z }));
501|    state.targetPos = null;
502|    return;
503|  }
504|
505|  dir.normalize().multiplyScalar(0.15);
506|  model.position.add(dir);
507|  model.lookAt(state.targetPos);
508|
509|  state.ws.send(JSON.stringify({
510|    type: 'move',
511|    x: model.position.x,
512|    y: 0,
513|    z: model.position.z,
514|  }));
515|}
516|
517|// ============================
518|// CHAT INPUT
519|// ============================
520|document.getElementById('chat-input').addEventListener('keydown', (e) => {
521|  if (e.key === 'Enter') {
522|    const msg = e.target.value.trim();
523|    if (msg && state.connected) {
524|      state.ws.send(JSON.stringify({ type: 'chat', message: msg }));
525|      addChatMessage(state.player?.name || 'You', msg);
526|      e.target.value = '';
527|    }
528|  }
529|});
530|
531|// ============================
532|// START GAME
533|// ============================
534|document.getElementById('start-game').addEventListener('click', () => {
535|  const name = document.getElementById('name-input').value.trim();
536|  if (name) connectWebSocket(name, null);
537|});
538|
539|// ============================
540|// GAME LOOP
541|// ============================
542|function gameLoop() {
543|  requestAnimationFrame(gameLoop);
544|  updateMovement();
545|
546|  const playerModel = state.players[state.playerId];
547|  if (state.targetPos) animateWalk(playerModel, 1);
548|  else stopWalk(playerModel);
549|
550|  if (state.previewModel) {
551|    state.previewModel.rotation.y += 0.01;
552|    state.previewRenderer.render(state.previewScene, state.previewCamera);
553|  }
554|
555|  if (playerModel) {
556|    const t = playerModel.position;
557|    state.camera.position.x += (t.x - state.camera.position.x) * 0.05;
558|    state.camera.position.z += (t.z + 20 - state.camera.position.z) * 0.05;
559|    state.camera.lookAt(t.x, t.y + 1, t.z);
560|  }
561|
562|  // Monster animation
563|  const time = Date.now() * 0.001;
564|  Object.values(state.monsters).forEach(m => animateMonster(m, time));
565|
566|  if (state.scene && state.camera && state.renderer) {
567|    state.renderer.render(state.scene, state.camera);
568|  }
569|}
570|
571|// ============================
572|// BOOT
573|// ============================
574|function boot() {
575|  initScene();
576|  initPreview();
577|  initCustomization();
578|  gameLoop();
579|  setTimeout(() => {
580|    loadingScreen.style.display = 'none';
581|    loginScreen.style.display = 'flex';
582|  }, 1500);
583|}
584|
585|boot();
586|