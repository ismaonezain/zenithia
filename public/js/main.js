1|1|1|// Zenithia — Client Entry Point
2|2|2|import * as THREE from 'three';
3|3|3|import { buildTerrain } from './terrain.js';
4|4|4|import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk, applyEquipment } from './character.js';
5|5|5|import { DialogueSystem } from './dialogue_ui.js';
6|import { InventoryUI } from './inventory.js';
7|6|6|import { createMonsterModel, updateMonsterHPBar, animateMonster } from './monsters.js';
8|7|7|
9|8|8|// --- State ---
10|9|9|const state = {
11|10|10|  playerId: null,
12|11|11|  player: null,
13|12|12|  ws: null,
14|13|13|  scene: null,
15|14|14|  camera: null,
16|15|15|  renderer: null,
17|16|16|  clock: null,
18|17|17|  players: {},
19|18|18|  npcs: {},
20|19|19|  connected: false,
21|20|20|  targetPos: null,
22|21|21|  customization: {
23|22|22|    skinIdx: 0,
24|23|23|    hairColorIdx: 0,
25|24|24|    hairStyle: 'short',
26|25|25|    bodyIdx: 0,
27|26|26|  },
28|27|27|  previewScene: null,
29|28|28|  previewCamera: null,
30|29|29|  previewRenderer: null,
31|30|30|  previewModel: null,
32|31|31|  dialogue: null,
33|  inventoryUI: null,
34|32|32|  monsters: {},
35|33|33|  damageNumbers: [],
36|34|34|};
37|35|35|
38|36|36|const canvas = document.getElementById('game-canvas');
39|37|37|const loadingScreen = document.getElementById('loading-screen');
40|38|38|const loginScreen = document.getElementById('login-screen');
41|39|39|const hud = document.getElementById('hud');
42|40|40|
43|41|41|// ============================
44|42|42|// THREE.JS SCENE
45|43|43|// ============================
46|44|44|function initScene() {
47|45|45|  state.scene = new THREE.Scene();
48|46|46|  state.scene.background = new THREE.Color(0x87CEEB);
49|47|47|  state.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
50|48|48|
51|49|49|  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
52|50|50|  state.camera.position.set(0, 15, 20);
53|51|51|
54|52|52|  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
55|53|53|  state.renderer.setSize(window.innerWidth, window.innerHeight);
56|54|54|  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
57|55|55|  state.renderer.shadowMap.enabled = true;
58|56|56|  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
59|57|57|
60|58|58|  state.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
61|59|59|  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
62|60|60|  sun.position.set(50, 100, 50);
63|61|61|  sun.castShadow = true;
64|62|62|  sun.shadow.mapSize.set(2048, 2048);
65|63|63|  state.scene.add(sun);
66|64|64|
67|65|65|  buildTerrain(state.scene);
68|66|66|  state.clock = new THREE.Clock();
69|67|67|
70|68|68|  // Init dialogue system
71|69|69|  state.dialogue = new DialogueSystem(null, { name: 'Adventurer' });
72|  state.inventoryUI = new InventoryUI(null, { name: 'Adventurer', inventory: [], equipment: {}, zen: 50, atk: 10, def: 5, spd: 10, crit: 0.05 });
73|70|70|
74|71|71|  window.addEventListener('resize', () => {
75|72|72|    state.camera.aspect = window.innerWidth / window.innerHeight;
76|73|73|    state.camera.updateProjectionMatrix();
77|74|74|    state.renderer.setSize(window.innerWidth, window.innerHeight);
78|75|75|  });
79|76|76|}
80|77|77|
81|78|78|// ============================
82|79|79|// PREVIEW SCENE
83|80|80|// ============================
84|81|81|function initPreview() {
85|82|82|  const pCanvas = document.getElementById('preview-canvas');
86|83|83|  state.previewScene = new THREE.Scene();
87|84|84|  state.previewScene.background = new THREE.Color(0x2a2a3e);
88|85|85|
89|86|86|  state.previewCamera = new THREE.PerspectiveCamera(50, 200 / 250, 0.1, 10);
90|87|87|  state.previewCamera.position.set(0, 1.2, 3);
91|88|88|  state.previewCamera.lookAt(0, 0.8, 0);
92|89|89|
93|90|90|  state.previewRenderer = new THREE.WebGLRenderer({ canvas: pCanvas, antialias: true });
94|91|91|  state.previewRenderer.setSize(200, 250);
95|92|92|
96|93|93|  state.previewScene.add(new THREE.AmbientLight(0xffffff, 0.8));
97|94|94|  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
98|95|95|  dir.position.set(2, 3, 2);
99|96|96|  state.previewScene.add(dir);
100|97|97|
101|98|98|  updatePreviewModel();
102|99|99|}
103|100|100|
104|101|101|function updatePreviewModel() {
105|102|102|  if (state.previewModel) state.previewScene.remove(state.previewModel);
106|103|103|  const c = state.customization;
107|104|104|  state.previewModel = createPlayerModel({
108|105|105|    skinColor: PALETTES.skin[c.skinIdx],
109|106|106|    hairColor: PALETTES.hair[c.hairColorIdx],
110|107|107|    hairStyle: c.hairStyle,
111|108|108|    bodyColor: PALETTES.body[c.bodyIdx],
112|109|109|  });
113|110|110|  state.previewScene.add(state.previewModel);
114|111|111|}
115|112|112|
116|113|113|// ============================
117|114|114|// CUSTOMIZATION UI
118|115|115|// ============================
119|116|116|function initCustomization() {
120|117|117|  const skinPicker = document.getElementById('skin-picker');
121|118|118|  PALETTES.skin.forEach((color, i) => {
122|119|119|    const s = document.createElement('div');
123|120|120|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
124|121|121|    s.style.background = '#' + color.toString(16).padStart(6, '0');
125|122|122|    s.onclick = () => {
126|123|123|      skinPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
127|124|124|      s.classList.add('selected');
128|125|125|      state.customization.skinIdx = i;
129|126|126|      updatePreviewModel();
130|127|127|    };
131|128|128|    skinPicker.appendChild(s);
132|129|129|  });
133|130|130|
134|131|131|  const hairPicker = document.getElementById('hair-color-picker');
135|132|132|  PALETTES.hair.forEach((color, i) => {
136|133|133|    const s = document.createElement('div');
137|134|134|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
138|135|135|    s.style.background = '#' + color.toString(16).padStart(6, '0');
139|136|136|    s.onclick = () => {
140|137|137|      hairPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
141|138|138|      s.classList.add('selected');
142|139|139|      state.customization.hairColorIdx = i;
143|140|140|      updatePreviewModel();
144|141|141|    };
145|142|142|    hairPicker.appendChild(s);
146|143|143|  });
147|144|144|
148|145|145|  const stylePicker = document.getElementById('hair-style-picker');
149|146|146|  ['short', 'medium', 'long', 'spiky', 'ponytail'].forEach(style => {
150|147|147|    const o = document.createElement('div');
151|148|148|    o.className = 'option' + (style === 'short' ? ' selected' : '');
152|149|149|    o.textContent = style;
153|150|150|    o.onclick = () => {
154|151|151|      stylePicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
155|152|152|      o.classList.add('selected');
156|153|153|      state.customization.hairStyle = style;
157|154|154|      updatePreviewModel();
158|155|155|    };
159|156|156|    stylePicker.appendChild(o);
160|157|157|  });
161|158|158|
162|159|159|  const bodyPicker = document.getElementById('body-picker');
163|160|160|  PALETTES.body.forEach((color, i) => {
164|161|161|    const s = document.createElement('div');
165|162|162|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
166|163|163|    s.style.background = '#' + color.toString(16).padStart(6, '0');
167|164|164|    s.onclick = () => {
168|165|165|      bodyPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
169|166|166|      s.classList.add('selected');
170|167|167|      state.customization.bodyIdx = i;
171|168|168|      updatePreviewModel();
172|169|169|    };
173|170|170|    bodyPicker.appendChild(s);
174|171|171|  });
175|172|172|}
176|173|173|
177|174|174|// ============================
178|175|175|// WEBSOCKET
179|176|176|// ============================
180|177|177|function connectWebSocket(playerName, wallet) {
181|178|178|  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
182|179|179|  state.ws = new WebSocket(`${protocol}//${location.host}`);
183|180|180|
184|181|181|  state.ws.onopen = () => {
185|182|182|    console.log('[WS] Connected');
186|183|183|    state.connected = true;
187|184|184|  };
188|185|185|  state.ws.onmessage = (event) => {
189|186|186|    handleServerMessage(JSON.parse(event.data));
190|187|187|  };
191|188|188|  state.ws.onclose = () => {
192|189|189|    console.log('[WS] Disconnected');
193|190|190|    state.connected = false;
194|191|191|  };
195|192|192|}
196|193|193|
197|194|194|// ============================
198|195|195|// SERVER MESSAGES
199|196|196|// ============================
200|197|197|function handleServerMessage(msg) {
201|198|198|  switch (msg.type) {
202|199|199|    case 'welcome':
203|200|200|      state.playerId = msg.playerId;
204|201|201|      state.ws.send(JSON.stringify({
205|202|202|        type: 'join',
206|203|203|        name: document.getElementById('name-input').value || 'Adventurer',
207|204|204|        wallet: null,
208|205|205|      }));
209|206|206|      break;
210|207|207|
211|208|208|    case 'joined':
212|209|209|      state.player = msg.player;
213|210|210|      state.dialogue.ws = state.ws;
214|211|211|      state.dialogue.playerState = state.player;
215|212|212|
216|213|213|      if (msg.npcs) Object.values(msg.npcs).forEach(npc => {
217|214|214|        const model = createNPCModel(npc);
218|215|215|        state.scene.add(model);
219|216|216|        state.npcs[npc.id] = model;
220|217|217|      });
221|218|218|      if (msg.onlinePlayers) msg.onlinePlayers.forEach(p => createOtherPlayer(p));
222|219|219|      showHUD();
223|220|220|      createPlayerModelInWorld(state.player);
224|221|221|      break;
225|222|222|
226|223|223|    case 'player_joined':
227|224|224|      createOtherPlayer(msg.player);
228|225|225|      break;
229|226|226|
230|227|227|    case 'player_moved':
231|228|228|      if (state.players[msg.playerId]) {
232|229|229|        state.players[msg.playerId].position.set(msg.x, msg.y, msg.z);
233|230|230|      }
234|231|231|      break;
235|232|232|
236|233|233|    case 'player_left':
237|234|234|      if (state.players[msg.playerId]) {
238|235|235|        state.scene.remove(state.players[msg.playerId]);
239|236|236|        delete state.players[msg.playerId];
240|237|237|      }
241|238|238|      break;
242|239|239|
243|240|240|    case 'chat':
244|241|241|      addChatMessage(msg.name, msg.message);
245|242|242|      break;
246|243|243|
247|244|244|    case 'npc_dialogue':
248|245|245|      state.dialogue.open(msg.npcId, msg.name, msg.title);
249|246|246|      break;
250|247|247|
251|248|248|    case 'monster_killed': {
252|      const lootText = msg.loot?.length > 0 ? msg.loot.map(l => `${l.name} x${l.quantity}`).join(', ') : 'Nothing';
253|      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP | Loot: ${lootText}`);
254|      updatePlayerHP(msg.hp, msg.maxHp);
255|      updatePlayerMP(msg.mp, msg.maxMp);
256|      if (msg.loot) {
257|        msg.loot.forEach(l => {
258|          if (!state.player.inventory) state.player.inventory = [];
259|          const existing = state.player.inventory.find(i => i.id === l.id);
260|          if (existing) existing.quantity = (existing.quantity || 1) + l.quantity;
261|          else state.player.inventory.push({ ...l });
262|        });
263|        state.inventoryUI.player = state.player;
264|      }
265|      break;
266|    }
267|
268|    case 'item_used': {
269|      state.player.hp = msg.hp;
270|      state.player.mp = msg.mp;
271|      state.player.inventory = msg.inventory;
272|      state.inventoryUI.player = state.player;
273|      updatePlayerHP(msg.hp, msg.maxHp);
274|      updatePlayerMP(msg.mp, msg.maxMp);
275|      break;
276|    }
277|
278|    case 'item_equipped':
279|    case 'item_unequipped': {
280|      state.player.equipment = msg.equipment;
281|      state.player.inventory = msg.inventory;
282|      state.player.atk = msg.atk;
283|      state.player.def = msg.def;
284|      state.inventoryUI.player = state.player;
285|      break;
286|    }
287|
288|    case 'quest_started':
289|249|249|      addChatMessage('System', `Quest started: ${msg.questName}`);
290|250|250|      break;
291|251|251|
292|252|252|    case 'joined':
293|253|253|      // Spawn existing monsters
294|254|254|      if (msg.monsters) msg.monsters.forEach(m => spawnMonsterClient(m));
295|255|255|      break;
296|256|256|
297|257|257|    case 'monster_spawn':
298|258|258|      spawnMonsterClient(msg.monster);
299|259|259|      break;
300|260|260|
301|261|261|    case 'monster_move':
302|262|262|      if (state.monsters[msg.monsterId]) {
303|263|263|        state.monsters[msg.monsterId].position.set(msg.x, 0, msg.z);
304|264|264|      }
305|265|265|      break;
306|266|266|
307|267|267|    case 'monster_hit': {
308|268|268|      const mob = state.monsters[msg.monsterId];
309|269|269|      if (mob) updateMonsterHPBar(mob, msg.hp, msg.maxHp);
310|270|270|      showDamageNumber(msg.monsterId, msg.damage, msg.isCrit);
311|271|271|      break;
312|272|272|    }
313|273|273|
314|274|274|    case 'monster_died': {
315|275|275|      const mob = state.monsters[msg.monsterId];
316|276|276|      if (mob) {
317|277|277|        state.scene.remove(mob);
318|278|278|        delete state.monsters[msg.monsterId];
319|279|279|      }
320|280|280|      break;
321|281|281|    }
322|282|282|
323|283|283|    case 'monster_attack': {
324|284|284|      showDamageNumber(null, msg.damage, false, msg.targetId);
325|285|285|      break;
326|286|286|    }
327|287|287|
328|288|288|    case 'player_hit': {
329|289|289|      updatePlayerHP(msg.hp, msg.maxHp);
330|290|290|      break;
331|291|291|    }
332|292|292|
333|293|293|    case 'player_died': {
334|294|294|      updatePlayerHP(msg.hp, msg.hp);
335|295|295|      addChatMessage('System', 'You died! Respawning at village...');
336|296|296|      break;
337|297|297|    }
338|298|298|
339|299|299|    case 'monster_killed': {
340|300|300|      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP, +${msg.zen} Zen`);
341|301|301|      updatePlayerHP(msg.hp, msg.maxHp);
342|302|302|      updatePlayerMP(msg.mp, msg.maxMp);
343|303|303|      break;
344|304|304|    }
345|305|305|
346|306|306|    case 'level_up': {
347|307|307|      addChatMessage('System', `🎉 Level Up! You are now Level ${msg.level}!`);
348|308|308|      updatePlayerHP(msg.maxHp, msg.maxHp);
349|309|309|      updatePlayerMP(msg.maxMp, msg.maxMp);
350|310|310|      break;
351|311|311|    }
352|312|312|
353|313|313|    case 'combat_message': {
354|314|314|      addChatMessage('Combat', msg.text);
355|315|315|      break;
356|316|316|    }
357|317|317|  }
358|318|318|}
359|319|319|
360|320|320|// ============================
361|321|321|// PLAYER MODELS
362|322|322|// ============================
363|323|323|function createPlayerModelInWorld(player) {
364|324|324|  const c = state.customization;
365|325|325|  const model = createPlayerModel({
366|326|326|    skinColor: PALETTES.skin[c.skinIdx],
367|327|327|    hairColor: PALETTES.hair[c.hairColorIdx],
368|328|328|    hairStyle: c.hairStyle,
369|329|329|    bodyColor: PALETTES.body[c.bodyIdx],
370|330|330|  });
371|331|331|  model.position.set(player.x, player.y, player.z);
372|332|332|  model.userData = { id: player.id, name: player.name, type: 'player' };
373|333|333|  state.scene.add(model);
374|334|334|  state.players[player.id] = model;
375|335|335|}
376|336|336|
377|337|337|function createOtherPlayer(player) {
378|338|338|  const model = createPlayerModel({});
379|339|339|  model.position.set(player.x, player.y, player.z);
380|340|340|  model.userData = { id: player.id, name: player.name, type: 'player' };
381|341|341|  state.scene.add(model);
382|342|342|  state.players[player.id] = model;
383|343|343|}
384|344|344|
385|345|345|// ============================
386|346|346|// HUD
387|347|347|// ============================
388|348|348|function showHUD() {
389|349|349|  loadingScreen.style.display = 'none';
390|350|350|  loginScreen.style.display = 'none';
391|351|351|  hud.style.display = 'block';
392|352|352|}
393|353|353|
394|354|354|// ============================
395|355|355|// CHAT
396|356|356|// ============================
397|357|357|function addChatMessage(name, message) {
398|358|358|  const el = document.getElementById('chat-messages');
399|359|359|  const div = document.createElement('div');
400|360|360|  div.innerHTML = `<strong>${name}:</strong> ${message}`;
401|361|361|  el.appendChild(div);
402|362|362|  el.scrollTop = el.scrollHeight;
403|363|363|}
404|364|364|// ============================
405|365|365|// COMBAT HELPERS
406|366|366|// ============================
407|367|367|const MONSTER_DATA = {
408|368|368|  moss_beetle: { name: 'Moss Beetle', color: 0x4CAF50, size: 0.6 },
409|369|369|  dust_mouse: { name: 'Dust Mouse', color: 0xBCAAA4, size: 0.35 },
410|370|370|  thorn_lizard: { name: 'Thorn Lizard', color: 0x689F38, size: 0.7 },
411|371|371|  puddle_frog: { name: 'Puddle Frog', color: 0x00BCD4, size: 0.55 },
412|372|372|  wind_sprite: { name: 'Wind Sprite', color: 0x81D4FA, size: 0.4 },
413|373|373|  rock_crawler: { name: 'Rock Crawler', color: 0x9E9E9E, size: 0.45 },
414|374|374|  bramble_boar: { name: 'Bramble Boar', color: 0x5D4037, size: 1.2 },
415|375|375|};
416|376|376|
417|377|377|function spawnMonsterClient(m) {
418|378|378|  const data = MONSTER_DATA[m.type] || { name: m.name, color: 0x999999, size: 0.5 };
419|379|379|  const model = createMonsterModel(m.type, { ...data, name: m.name, size: data.size });
420|380|380|  model.position.set(m.x, 0, m.z);
421|381|381|  model.userData = { id: m.id, type: 'monster', monsterType: m.type };
422|382|382|  state.scene.add(model);
423|383|383|  state.monsters[m.id] = model;
424|384|384|}
425|385|385|
426|386|386|function showDamageNumber(monsterId, damage, isCrit, targetId) {
427|387|387|  let pos;
428|388|388|  if (monsterId && state.monsters[monsterId]) {
429|389|389|    pos = state.monsters[monsterId].position.clone();
430|390|390|    pos.y += 1.5;
431|391|391|  } else if (targetId && state.players[targetId]) {
432|392|392|    pos = state.players[targetId].position.clone();
433|393|393|    pos.y += 1.5;
434|394|394|  } else {
435|395|395|    return;
436|396|396|  }
437|397|397|
438|398|398|  // Create floating text sprite
439|399|399|  const canvas = document.createElement('canvas');
440|400|400|  canvas.width = 128;
441|401|401|  canvas.height = 64;
442|402|402|  const ctx = canvas.getContext('2d');
443|403|403|  ctx.fillStyle = isCrit ? '#FFD700' : '#FF5252';
444|404|404|  ctx.font = isCrit ? 'bold 36px Courier New' : '28px Courier New';
445|405|405|  ctx.textAlign = 'center';
446|406|406|  ctx.fillText(isCrit ? `${damage}!` : `-${damage}`, 64, 40);
447|407|407|
448|408|408|  const texture = new THREE.CanvasTexture(canvas);
449|409|409|  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
450|410|410|  sprite.position.copy(pos);
451|411|411|  sprite.scale.set(0.8, 0.4, 1);
452|412|412|  state.scene.add(sprite);
453|413|413|
454|414|414|  // Animate up and fade
455|415|415|  const startTime = Date.now();
456|416|416|  const animate = () => {
457|417|417|    const elapsed = (Date.now() - startTime) / 1000;
458|418|418|    if (elapsed > 1) {
459|419|419|      state.scene.remove(sprite);
460|420|420|      return;
461|421|421|    }
462|422|422|    sprite.position.y += 0.02;
463|423|423|    sprite.material.opacity = 1 - elapsed;
464|424|424|    requestAnimationFrame(animate);
465|425|425|  };
466|426|426|  animate();
467|427|427|}
468|428|428|
469|429|429|function updatePlayerHP(hp, maxHp) {
470|430|430|  const fill = document.getElementById('hp-fill');
471|431|431|  const text = document.getElementById('hp-text');
472|432|432|  if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
473|433|433|  if (text) text.textContent = `${Math.round(hp)}/${maxHp}`;
474|434|434|}
475|435|435|
476|436|436|function updatePlayerMP(mp, maxMp) {
477|437|437|  const fill = document.getElementById('mp-fill');
478|438|438|  const text = document.getElementById('mp-text');
479|439|439|  if (fill) fill.style.width = `${(mp / maxMp) * 100}%`;
480|440|440|  if (text) text.textContent = `${Math.round(mp)}/${maxMp}`;
481|441|441|}
482|442|442|
483|443|443|// ============================
484|444|444|// CLICK TO MOVE
485|445|445|// ============================
486|446|446|canvas.addEventListener('click', (e) => {
487|447|447|  if (!state.connected || !state.player) return;
488|448|448|  // Don't move if dialogue is open
489|449|449|  if (state.dialogue.container.style.display === 'block') return;
490|450|450|
491|451|451|  const mouse = new THREE.Vector2(
492|452|452|    (e.clientX / window.innerWidth) * 2 - 1,
493|453|453|    -(e.clientY / window.innerHeight) * 2 + 1
494|454|454|  );
495|455|455|
496|456|456|  const raycaster = new THREE.Raycaster();
497|457|457|  raycaster.setFromCamera(mouse, state.camera);
498|458|458|
499|459|459|  const ground = state.scene.getObjectByName('ground');
500|460|460|  if (!ground) return;
501|461|461|
502|462|462|  const intersects = raycaster.intersectObject(ground);
503|463|463|  if (intersects.length === 0) return;
504|464|464|
505|465|465|  const point = intersects[0].point;
506|466|466|
507|467|467|  // Check NPC proximity
508|468|468|  for (const npc of Object.values(state.npcs)) {
509|469|469|    if (npc.position.distanceTo(point) < 2) {
510|470|470|      state.ws.send(JSON.stringify({ type: 'interact_npc', npcId: npc.userData.id }));
511|471|471|      return;
512|472|472|    }
513|473|473|  }
514|474|474|
515|475|475|  // Check Monster proximity — attack
516|476|476|  for (const mob of Object.values(state.monsters)) {
517|477|477|    if (mob.position.distanceTo(point) < 2) {
518|478|478|      state.ws.send(JSON.stringify({ type: 'attack', monsterId: mob.userData.id }));
519|479|479|      // Face the monster
520|480|480|      const model = state.players[state.playerId];
521|481|481|      if (model) model.lookAt(mob.position);
522|482|482|      return;
523|483|483|    }
524|484|484|  }
525|485|485|
526|486|486|  state.targetPos = new THREE.Vector3(point.x, 0, point.z);
527|487|487|});
528|488|488|
529|489|489|// ============================
530|490|490|// SMOOTH MOVEMENT
531|491|491|// ============================
532|492|492|function updateMovement() {
533|493|493|  if (!state.targetPos) return;
534|494|494|  const model = state.players[state.playerId];
535|495|495|  if (!model) return;
536|496|496|
537|497|497|  const dir = new THREE.Vector3().subVectors(state.targetPos, model.position);
538|498|498|  if (dir.length() < 0.1) {
539|499|499|    model.position.copy(state.targetPos);
540|500|500|    state.ws.send(JSON.stringify({ type: 'move', x: state.targetPos.x, y: 0, z: state.targetPos.z }));
541|501|501|    state.targetPos = null;
542|502|502|    return;
543|503|503|  }
544|504|504|
545|505|505|  dir.normalize().multiplyScalar(0.15);
546|506|506|  model.position.add(dir);
547|507|507|  model.lookAt(state.targetPos);
548|508|508|
549|509|509|  state.ws.send(JSON.stringify({
550|510|510|    type: 'move',
551|511|511|    x: model.position.x,
552|512|512|    y: 0,
553|513|513|    z: model.position.z,
554|514|514|  }));
555|515|515|}
556|516|516|
557|517|517|// ============================
558|518|518|// CHAT INPUT
559|519|519|// ============================
560|520|520|document.getElementById('chat-input').addEventListener('keydown', (e) => {
561|521|521|  if (e.key === 'Enter') {
562|522|522|    const msg = e.target.value.trim();
563|523|523|    if (msg && state.connected) {
564|524|524|      state.ws.send(JSON.stringify({ type: 'chat', message: msg }));
565|525|525|      addChatMessage(state.player?.name || 'You', msg);
566|526|526|      e.target.value = '';
567|527|527|    }
568|528|528|  }
569|529|529|});
570|530|530|
571|531|531|// ============================
572|532|532|// START GAME
573|533|533|// ============================
574|534|534|document.getElementById('start-game').addEventListener('click', () => {
575|535|535|  const name = document.getElementById('name-input').value.trim();
576|536|536|  if (name) connectWebSocket(name, null);
577|537|537|});
578|538|538|
579|539|539|// ============================
580|540|540|// GAME LOOP
581|541|541|// ============================
582|542|542|function gameLoop() {
583|543|543|  requestAnimationFrame(gameLoop);
584|544|544|  updateMovement();
585|545|545|
586|546|546|  const playerModel = state.players[state.playerId];
587|547|547|  if (state.targetPos) animateWalk(playerModel, 1);
588|548|548|  else stopWalk(playerModel);
589|549|549|
590|550|550|  if (state.previewModel) {
591|551|551|    state.previewModel.rotation.y += 0.01;
592|552|552|    state.previewRenderer.render(state.previewScene, state.previewCamera);
593|553|553|  }
594|554|554|
595|555|555|  if (playerModel) {
596|556|556|    const t = playerModel.position;
597|557|557|    state.camera.position.x += (t.x - state.camera.position.x) * 0.05;
598|558|558|    state.camera.position.z += (t.z + 20 - state.camera.position.z) * 0.05;
599|559|559|    state.camera.lookAt(t.x, t.y + 1, t.z);
600|560|560|  }
601|561|561|
602|562|562|  // Monster animation
603|563|563|  const time = Date.now() * 0.001;
604|564|564|  Object.values(state.monsters).forEach(m => animateMonster(m, time));
605|565|565|
606|566|566|  if (state.scene && state.camera && state.renderer) {
607|567|567|    state.renderer.render(state.scene, state.camera);
608|568|568|  }
609|569|569|}
610|570|570|
611|571|571|// ============================
612|572|572|// BOOT
613|573|573|// ============================
614|574|574|function boot() {
615|575|575|  initScene();
616|576|576|  initPreview();
617|577|577|  initCustomization();
618|578|578|  gameLoop();
619|579|579|  setTimeout(() => {
620|580|580|    loadingScreen.style.display = 'none';
621|581|581|    loginScreen.style.display = 'flex';
622|582|582|  }, 1500);
623|583|583|}
624|584|584|
625|585|585|boot();
626|586|586|