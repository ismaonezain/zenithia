1|1|// Zenithia — Client Entry Point
2|2|import * as THREE from 'three';
3|3|import { buildTerrain } from './terrain.js';
4|4|import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk } from './character.js';
5|5|import { DialogueSystem } from './dialogue_ui.js';
import { InventoryUI } from './inventory.js';
6|6|import { createMonsterModel, updateMonsterHPBar, animateMonster } from './monsters.js';
7|7|
8|8|// --- State ---
9|9|const state = {
10|10|  playerId: null,
11|11|  player: null,
12|12|  ws: null,
13|13|  scene: null,
14|14|  camera: null,
15|15|  renderer: null,
16|16|  clock: null,
17|17|  players: {},
18|18|  npcs: {},
19|19|  connected: false,
20|20|  targetPos: null,
21|21|  customization: {
22|22|    skinIdx: 0,
23|23|    hairColorIdx: 0,
24|24|    hairStyle: 'short',
25|25|    bodyIdx: 0,
26|26|  },
27|27|  previewScene: null,
28|28|  previewCamera: null,
29|29|  previewRenderer: null,
30|30|  previewModel: null,
31|31|  dialogue: null,
  inventoryUI: null,
32|32|  monsters: {},
33|33|  damageNumbers: [],
34|34|};
35|35|
36|36|const canvas = document.getElementById('game-canvas');
37|37|const loadingScreen = document.getElementById('loading-screen');
38|38|const loginScreen = document.getElementById('login-screen');
39|39|const hud = document.getElementById('hud');
40|40|
41|41|// ============================
42|42|// THREE.JS SCENE
43|43|// ============================
44|44|function initScene() {
45|45|  state.scene = new THREE.Scene();
46|46|  state.scene.background = new THREE.Color(0x87CEEB);
47|47|  state.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
48|48|
49|49|  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
50|50|  state.camera.position.set(0, 15, 20);
51|51|
52|52|  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
53|53|  state.renderer.setSize(window.innerWidth, window.innerHeight);
54|54|  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
55|55|  state.renderer.shadowMap.enabled = true;
56|56|  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
57|57|
58|58|  state.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
59|59|  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
60|60|  sun.position.set(50, 100, 50);
61|61|  sun.castShadow = true;
62|62|  sun.shadow.mapSize.set(2048, 2048);
63|63|  state.scene.add(sun);
64|64|
65|65|  buildTerrain(state.scene);
66|66|  state.clock = new THREE.Clock();
67|67|
68|68|  // Init dialogue system
69|69|  state.dialogue = new DialogueSystem(null, { name: 'Adventurer' });
  state.inventoryUI = new InventoryUI(null, { name: 'Adventurer', inventory: [], equipment: {}, zen: 50, atk: 10, def: 5, spd: 10, crit: 0.05 });
70|70|
71|71|  window.addEventListener('resize', () => {
72|72|    state.camera.aspect = window.innerWidth / window.innerHeight;
73|73|    state.camera.updateProjectionMatrix();
74|74|    state.renderer.setSize(window.innerWidth, window.innerHeight);
75|75|  });
76|76|}
77|77|
78|78|// ============================
79|79|// PREVIEW SCENE
80|80|// ============================
81|81|function initPreview() {
82|82|  const pCanvas = document.getElementById('preview-canvas');
83|83|  state.previewScene = new THREE.Scene();
84|84|  state.previewScene.background = new THREE.Color(0x2a2a3e);
85|85|
86|86|  state.previewCamera = new THREE.PerspectiveCamera(50, 200 / 250, 0.1, 10);
87|87|  state.previewCamera.position.set(0, 1.2, 3);
88|88|  state.previewCamera.lookAt(0, 0.8, 0);
89|89|
90|90|  state.previewRenderer = new THREE.WebGLRenderer({ canvas: pCanvas, antialias: true });
91|91|  state.previewRenderer.setSize(200, 250);
92|92|
93|93|  state.previewScene.add(new THREE.AmbientLight(0xffffff, 0.8));
94|94|  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
95|95|  dir.position.set(2, 3, 2);
96|96|  state.previewScene.add(dir);
97|97|
98|98|  updatePreviewModel();
99|99|}
100|100|
101|101|function updatePreviewModel() {
102|102|  if (state.previewModel) state.previewScene.remove(state.previewModel);
103|103|  const c = state.customization;
104|104|  state.previewModel = createPlayerModel({
105|105|    skinColor: PALETTES.skin[c.skinIdx],
106|106|    hairColor: PALETTES.hair[c.hairColorIdx],
107|107|    hairStyle: c.hairStyle,
108|108|    bodyColor: PALETTES.body[c.bodyIdx],
109|109|  });
110|110|  state.previewScene.add(state.previewModel);
111|111|}
112|112|
113|113|// ============================
114|114|// CUSTOMIZATION UI
115|115|// ============================
116|116|function initCustomization() {
117|117|  const skinPicker = document.getElementById('skin-picker');
118|118|  PALETTES.skin.forEach((color, i) => {
119|119|    const s = document.createElement('div');
120|120|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
121|121|    s.style.background = '#' + color.toString(16).padStart(6, '0');
122|122|    s.onclick = () => {
123|123|      skinPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
124|124|      s.classList.add('selected');
125|125|      state.customization.skinIdx = i;
126|126|      updatePreviewModel();
127|127|    };
128|128|    skinPicker.appendChild(s);
129|129|  });
130|130|
131|131|  const hairPicker = document.getElementById('hair-color-picker');
132|132|  PALETTES.hair.forEach((color, i) => {
133|133|    const s = document.createElement('div');
134|134|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
135|135|    s.style.background = '#' + color.toString(16).padStart(6, '0');
136|136|    s.onclick = () => {
137|137|      hairPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
138|138|      s.classList.add('selected');
139|139|      state.customization.hairColorIdx = i;
140|140|      updatePreviewModel();
141|141|    };
142|142|    hairPicker.appendChild(s);
143|143|  });
144|144|
145|145|  const stylePicker = document.getElementById('hair-style-picker');
146|146|  ['short', 'medium', 'long', 'spiky', 'ponytail'].forEach(style => {
147|147|    const o = document.createElement('div');
148|148|    o.className = 'option' + (style === 'short' ? ' selected' : '');
149|149|    o.textContent = style;
150|150|    o.onclick = () => {
151|151|      stylePicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
152|152|      o.classList.add('selected');
153|153|      state.customization.hairStyle = style;
154|154|      updatePreviewModel();
155|155|    };
156|156|    stylePicker.appendChild(o);
157|157|  });
158|158|
159|159|  const bodyPicker = document.getElementById('body-picker');
160|160|  PALETTES.body.forEach((color, i) => {
161|161|    const s = document.createElement('div');
162|162|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
163|163|    s.style.background = '#' + color.toString(16).padStart(6, '0');
164|164|    s.onclick = () => {
165|165|      bodyPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
166|166|      s.classList.add('selected');
167|167|      state.customization.bodyIdx = i;
168|168|      updatePreviewModel();
169|169|    };
170|170|    bodyPicker.appendChild(s);
171|171|  });
172|172|}
173|173|
174|174|// ============================
175|175|// WEBSOCKET
176|176|// ============================
177|177|function connectWebSocket(playerName, wallet) {
178|178|  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
179|179|  state.ws = new WebSocket(`${protocol}//${location.host}`);
180|180|
181|181|  state.ws.onopen = () => {
182|182|    console.log('[WS] Connected');
183|183|    state.connected = true;
184|184|  };
185|185|  state.ws.onmessage = (event) => {
186|186|    handleServerMessage(JSON.parse(event.data));
187|187|  };
188|188|  state.ws.onclose = () => {
189|189|    console.log('[WS] Disconnected');
190|190|    state.connected = false;
191|191|  };
192|192|}
193|193|
194|194|// ============================
195|195|// SERVER MESSAGES
196|196|// ============================
197|197|function handleServerMessage(msg) {
198|198|  switch (msg.type) {
199|199|    case 'welcome':
200|200|      state.playerId = msg.playerId;
201|201|      state.ws.send(JSON.stringify({
202|202|        type: 'join',
203|203|        name: document.getElementById('name-input').value || 'Adventurer',
204|204|        wallet: null,
205|205|      }));
206|206|      break;
207|207|
208|208|    case 'joined':
209|209|      state.player = msg.player;
210|210|      state.dialogue.ws = state.ws;
211|211|      state.dialogue.playerState = state.player;
212|212|
213|213|      if (msg.npcs) Object.values(msg.npcs).forEach(npc => {
214|214|        const model = createNPCModel(npc);
215|215|        state.scene.add(model);
216|216|        state.npcs[npc.id] = model;
217|217|      });
218|218|      if (msg.onlinePlayers) msg.onlinePlayers.forEach(p => createOtherPlayer(p));
219|219|      showHUD();
220|220|      createPlayerModelInWorld(state.player);
221|221|      break;
222|222|
223|223|    case 'player_joined':
224|224|      createOtherPlayer(msg.player);
225|225|      break;
226|226|
227|227|    case 'player_moved':
228|228|      if (state.players[msg.playerId]) {
229|229|        state.players[msg.playerId].position.set(msg.x, msg.y, msg.z);
230|230|      }
231|231|      break;
232|232|
233|233|    case 'player_left':
234|234|      if (state.players[msg.playerId]) {
235|235|        state.scene.remove(state.players[msg.playerId]);
236|236|        delete state.players[msg.playerId];
237|237|      }
238|238|      break;
239|239|
240|240|    case 'chat':
241|241|      addChatMessage(msg.name, msg.message);
242|242|      break;
243|243|
244|244|    case 'npc_dialogue':
245|245|      state.dialogue.open(msg.npcId, msg.name, msg.title);
246|246|      break;
247|247|
248|248|    case 'monster_killed': {
      const lootText = msg.loot?.length > 0 ? msg.loot.map(l => `${l.name} x${l.quantity}`).join(', ') : 'Nothing';
      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP | Loot: ${lootText}`);
      updatePlayerHP(msg.hp, msg.maxHp);
      updatePlayerMP(msg.mp, msg.maxMp);
      if (msg.loot) {
        msg.loot.forEach(l => {
          if (!state.player.inventory) state.player.inventory = [];
          const existing = state.player.inventory.find(i => i.id === l.id);
          if (existing) existing.quantity = (existing.quantity || 1) + l.quantity;
          else state.player.inventory.push({ ...l });
        });
        state.inventoryUI.player = state.player;
      }
      break;
    }

    case 'item_used': {
      state.player.hp = msg.hp;
      state.player.mp = msg.mp;
      state.player.inventory = msg.inventory;
      state.inventoryUI.player = state.player;
      updatePlayerHP(msg.hp, msg.maxHp);
      updatePlayerMP(msg.mp, msg.maxMp);
      break;
    }

    case 'item_equipped':
    case 'item_unequipped': {
      state.player.equipment = msg.equipment;
      state.player.inventory = msg.inventory;
      state.player.atk = msg.atk;
      state.player.def = msg.def;
      state.inventoryUI.player = state.player;
      break;
    }

    case 'quest_started':
249|249|      addChatMessage('System', `Quest started: ${msg.questName}`);
250|250|      break;
251|251|
252|252|    case 'joined':
253|253|      // Spawn existing monsters
254|254|      if (msg.monsters) msg.monsters.forEach(m => spawnMonsterClient(m));
255|255|      break;
256|256|
257|257|    case 'monster_spawn':
258|258|      spawnMonsterClient(msg.monster);
259|259|      break;
260|260|
261|261|    case 'monster_move':
262|262|      if (state.monsters[msg.monsterId]) {
263|263|        state.monsters[msg.monsterId].position.set(msg.x, 0, msg.z);
264|264|      }
265|265|      break;
266|266|
267|267|    case 'monster_hit': {
268|268|      const mob = state.monsters[msg.monsterId];
269|269|      if (mob) updateMonsterHPBar(mob, msg.hp, msg.maxHp);
270|270|      showDamageNumber(msg.monsterId, msg.damage, msg.isCrit);
271|271|      break;
272|272|    }
273|273|
274|274|    case 'monster_died': {
275|275|      const mob = state.monsters[msg.monsterId];
276|276|      if (mob) {
277|277|        state.scene.remove(mob);
278|278|        delete state.monsters[msg.monsterId];
279|279|      }
280|280|      break;
281|281|    }
282|282|
283|283|    case 'monster_attack': {
284|284|      showDamageNumber(null, msg.damage, false, msg.targetId);
285|285|      break;
286|286|    }
287|287|
288|288|    case 'player_hit': {
289|289|      updatePlayerHP(msg.hp, msg.maxHp);
290|290|      break;
291|291|    }
292|292|
293|293|    case 'player_died': {
294|294|      updatePlayerHP(msg.hp, msg.hp);
295|295|      addChatMessage('System', 'You died! Respawning at village...');
296|296|      break;
297|297|    }
298|298|
299|299|    case 'monster_killed': {
300|300|      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP, +${msg.zen} Zen`);
301|301|      updatePlayerHP(msg.hp, msg.maxHp);
302|302|      updatePlayerMP(msg.mp, msg.maxMp);
303|303|      break;
304|304|    }
305|305|
306|306|    case 'level_up': {
307|307|      addChatMessage('System', `🎉 Level Up! You are now Level ${msg.level}!`);
308|308|      updatePlayerHP(msg.maxHp, msg.maxHp);
309|309|      updatePlayerMP(msg.maxMp, msg.maxMp);
310|310|      break;
311|311|    }
312|312|
313|313|    case 'combat_message': {
314|314|      addChatMessage('Combat', msg.text);
315|315|      break;
316|316|    }
317|317|  }
318|318|}
319|319|
320|320|// ============================
321|321|// PLAYER MODELS
322|322|// ============================
323|323|function createPlayerModelInWorld(player) {
324|324|  const c = state.customization;
325|325|  const model = createPlayerModel({
326|326|    skinColor: PALETTES.skin[c.skinIdx],
327|327|    hairColor: PALETTES.hair[c.hairColorIdx],
328|328|    hairStyle: c.hairStyle,
329|329|    bodyColor: PALETTES.body[c.bodyIdx],
330|330|  });
331|331|  model.position.set(player.x, player.y, player.z);
332|332|  model.userData = { id: player.id, name: player.name, type: 'player' };
333|333|  state.scene.add(model);
334|334|  state.players[player.id] = model;
335|335|}
336|336|
337|337|function createOtherPlayer(player) {
338|338|  const model = createPlayerModel({});
339|339|  model.position.set(player.x, player.y, player.z);
340|340|  model.userData = { id: player.id, name: player.name, type: 'player' };
341|341|  state.scene.add(model);
342|342|  state.players[player.id] = model;
343|343|}
344|344|
345|345|// ============================
346|346|// HUD
347|347|// ============================
348|348|function showHUD() {
349|349|  loadingScreen.style.display = 'none';
350|350|  loginScreen.style.display = 'none';
351|351|  hud.style.display = 'block';
352|352|}
353|353|
354|354|// ============================
355|355|// CHAT
356|356|// ============================
357|357|function addChatMessage(name, message) {
358|358|  const el = document.getElementById('chat-messages');
359|359|  const div = document.createElement('div');
360|360|  div.innerHTML = `<strong>${name}:</strong> ${message}`;
361|361|  el.appendChild(div);
362|362|  el.scrollTop = el.scrollHeight;
363|363|}
364|364|// ============================
365|365|// COMBAT HELPERS
366|366|// ============================
367|367|const MONSTER_DATA = {
368|368|  moss_beetle: { name: 'Moss Beetle', color: 0x4CAF50, size: 0.6 },
369|369|  dust_mouse: { name: 'Dust Mouse', color: 0xBCAAA4, size: 0.35 },
370|370|  thorn_lizard: { name: 'Thorn Lizard', color: 0x689F38, size: 0.7 },
371|371|  puddle_frog: { name: 'Puddle Frog', color: 0x00BCD4, size: 0.55 },
372|372|  wind_sprite: { name: 'Wind Sprite', color: 0x81D4FA, size: 0.4 },
373|373|  rock_crawler: { name: 'Rock Crawler', color: 0x9E9E9E, size: 0.45 },
374|374|  bramble_boar: { name: 'Bramble Boar', color: 0x5D4037, size: 1.2 },
375|375|};
376|376|
377|377|function spawnMonsterClient(m) {
378|378|  const data = MONSTER_DATA[m.type] || { name: m.name, color: 0x999999, size: 0.5 };
379|379|  const model = createMonsterModel(m.type, { ...data, name: m.name, size: data.size });
380|380|  model.position.set(m.x, 0, m.z);
381|381|  model.userData = { id: m.id, type: 'monster', monsterType: m.type };
382|382|  state.scene.add(model);
383|383|  state.monsters[m.id] = model;
384|384|}
385|385|
386|386|function showDamageNumber(monsterId, damage, isCrit, targetId) {
387|387|  let pos;
388|388|  if (monsterId && state.monsters[monsterId]) {
389|389|    pos = state.monsters[monsterId].position.clone();
390|390|    pos.y += 1.5;
391|391|  } else if (targetId && state.players[targetId]) {
392|392|    pos = state.players[targetId].position.clone();
393|393|    pos.y += 1.5;
394|394|  } else {
395|395|    return;
396|396|  }
397|397|
398|398|  // Create floating text sprite
399|399|  const canvas = document.createElement('canvas');
400|400|  canvas.width = 128;
401|401|  canvas.height = 64;
402|402|  const ctx = canvas.getContext('2d');
403|403|  ctx.fillStyle = isCrit ? '#FFD700' : '#FF5252';
404|404|  ctx.font = isCrit ? 'bold 36px Courier New' : '28px Courier New';
405|405|  ctx.textAlign = 'center';
406|406|  ctx.fillText(isCrit ? `${damage}!` : `-${damage}`, 64, 40);
407|407|
408|408|  const texture = new THREE.CanvasTexture(canvas);
409|409|  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
410|410|  sprite.position.copy(pos);
411|411|  sprite.scale.set(0.8, 0.4, 1);
412|412|  state.scene.add(sprite);
413|413|
414|414|  // Animate up and fade
415|415|  const startTime = Date.now();
416|416|  const animate = () => {
417|417|    const elapsed = (Date.now() - startTime) / 1000;
418|418|    if (elapsed > 1) {
419|419|      state.scene.remove(sprite);
420|420|      return;
421|421|    }
422|422|    sprite.position.y += 0.02;
423|423|    sprite.material.opacity = 1 - elapsed;
424|424|    requestAnimationFrame(animate);
425|425|  };
426|426|  animate();
427|427|}
428|428|
429|429|function updatePlayerHP(hp, maxHp) {
430|430|  const fill = document.getElementById('hp-fill');
431|431|  const text = document.getElementById('hp-text');
432|432|  if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
433|433|  if (text) text.textContent = `${Math.round(hp)}/${maxHp}`;
434|434|}
435|435|
436|436|function updatePlayerMP(mp, maxMp) {
437|437|  const fill = document.getElementById('mp-fill');
438|438|  const text = document.getElementById('mp-text');
439|439|  if (fill) fill.style.width = `${(mp / maxMp) * 100}%`;
440|440|  if (text) text.textContent = `${Math.round(mp)}/${maxMp}`;
441|441|}
442|442|
443|443|// ============================
444|444|// CLICK TO MOVE
445|445|// ============================
446|446|canvas.addEventListener('click', (e) => {
447|447|  if (!state.connected || !state.player) return;
448|448|  // Don't move if dialogue is open
449|449|  if (state.dialogue.container.style.display === 'block') return;
450|450|
451|451|  const mouse = new THREE.Vector2(
452|452|    (e.clientX / window.innerWidth) * 2 - 1,
453|453|    -(e.clientY / window.innerHeight) * 2 + 1
454|454|  );
455|455|
456|456|  const raycaster = new THREE.Raycaster();
457|457|  raycaster.setFromCamera(mouse, state.camera);
458|458|
459|459|  const ground = state.scene.getObjectByName('ground');
460|460|  if (!ground) return;
461|461|
462|462|  const intersects = raycaster.intersectObject(ground);
463|463|  if (intersects.length === 0) return;
464|464|
465|465|  const point = intersects[0].point;
466|466|
467|467|  // Check NPC proximity
468|468|  for (const npc of Object.values(state.npcs)) {
469|469|    if (npc.position.distanceTo(point) < 2) {
470|470|      state.ws.send(JSON.stringify({ type: 'interact_npc', npcId: npc.userData.id }));
471|471|      return;
472|472|    }
473|473|  }
474|474|
475|475|  // Check Monster proximity — attack
476|476|  for (const mob of Object.values(state.monsters)) {
477|477|    if (mob.position.distanceTo(point) < 2) {
478|478|      state.ws.send(JSON.stringify({ type: 'attack', monsterId: mob.userData.id }));
479|479|      // Face the monster
480|480|      const model = state.players[state.playerId];
481|481|      if (model) model.lookAt(mob.position);
482|482|      return;
483|483|    }
484|484|  }
485|485|
486|486|  state.targetPos = new THREE.Vector3(point.x, 0, point.z);
487|487|});
488|488|
489|489|// ============================
490|490|// SMOOTH MOVEMENT
491|491|// ============================
492|492|function updateMovement() {
493|493|  if (!state.targetPos) return;
494|494|  const model = state.players[state.playerId];
495|495|  if (!model) return;
496|496|
497|497|  const dir = new THREE.Vector3().subVectors(state.targetPos, model.position);
498|498|  if (dir.length() < 0.1) {
499|499|    model.position.copy(state.targetPos);
500|500|    state.ws.send(JSON.stringify({ type: 'move', x: state.targetPos.x, y: 0, z: state.targetPos.z }));
501|501|    state.targetPos = null;
502|502|    return;
503|503|  }
504|504|
505|505|  dir.normalize().multiplyScalar(0.15);
506|506|  model.position.add(dir);
507|507|  model.lookAt(state.targetPos);
508|508|
509|509|  state.ws.send(JSON.stringify({
510|510|    type: 'move',
511|511|    x: model.position.x,
512|512|    y: 0,
513|513|    z: model.position.z,
514|514|  }));
515|515|}
516|516|
517|517|// ============================
518|518|// CHAT INPUT
519|519|// ============================
520|520|document.getElementById('chat-input').addEventListener('keydown', (e) => {
521|521|  if (e.key === 'Enter') {
522|522|    const msg = e.target.value.trim();
523|523|    if (msg && state.connected) {
524|524|      state.ws.send(JSON.stringify({ type: 'chat', message: msg }));
525|525|      addChatMessage(state.player?.name || 'You', msg);
526|526|      e.target.value = '';
527|527|    }
528|528|  }
529|529|});
530|530|
531|531|// ============================
532|532|// START GAME
533|533|// ============================
534|534|document.getElementById('start-game').addEventListener('click', () => {
535|535|  const name = document.getElementById('name-input').value.trim();
536|536|  if (name) connectWebSocket(name, null);
537|537|});
538|538|
539|539|// ============================
540|540|// GAME LOOP
541|541|// ============================
542|542|function gameLoop() {
543|543|  requestAnimationFrame(gameLoop);
544|544|  updateMovement();
545|545|
546|546|  const playerModel = state.players[state.playerId];
547|547|  if (state.targetPos) animateWalk(playerModel, 1);
548|548|  else stopWalk(playerModel);
549|549|
550|550|  if (state.previewModel) {
551|551|    state.previewModel.rotation.y += 0.01;
552|552|    state.previewRenderer.render(state.previewScene, state.previewCamera);
553|553|  }
554|554|
555|555|  if (playerModel) {
556|556|    const t = playerModel.position;
557|557|    state.camera.position.x += (t.x - state.camera.position.x) * 0.05;
558|558|    state.camera.position.z += (t.z + 20 - state.camera.position.z) * 0.05;
559|559|    state.camera.lookAt(t.x, t.y + 1, t.z);
560|560|  }
561|561|
562|562|  // Monster animation
563|563|  const time = Date.now() * 0.001;
564|564|  Object.values(state.monsters).forEach(m => animateMonster(m, time));
565|565|
566|566|  if (state.scene && state.camera && state.renderer) {
567|567|    state.renderer.render(state.scene, state.camera);
568|568|  }
569|569|}
570|570|
571|571|// ============================
572|572|// BOOT
573|573|// ============================
574|574|function boot() {
575|575|  initScene();
576|576|  initPreview();
577|577|  initCustomization();
578|578|  gameLoop();
579|579|  setTimeout(() => {
580|580|    loadingScreen.style.display = 'none';
581|581|    loginScreen.style.display = 'flex';
582|582|  }, 1500);
583|583|}
584|584|
585|585|boot();
586|586|