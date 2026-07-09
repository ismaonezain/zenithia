1|1|// Zenithia — Client Entry Point
2|2|import * as THREE from 'three';
3|3|import { buildTerrain } from './terrain.js';
4|4|import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk, applyEquipment, blinkEyes, waveHand, idleArms } from './character.js';
5|5|import { DialogueSystem } from './dialogue_ui.js';
6|6|import { InventoryUI } from './inventory.js';
7|7|import { QuestUI } from './quest_ui.js';
8|8|import { PartyUI } from './party_ui.js';
9|9|import { createMonsterModel, updateMonsterHPBar, animateMonster } from './monsters.js';
10|10|
11|11|// --- State ---
12|12|const state = {
13|13|  playerId: null,
14|14|  player: null,
15|15|  ws: null,
16|16|  scene: null,
17|17|  camera: null,
18|18|  renderer: null,
19|19|  clock: null,
20|20|  players: {},
21|21|  npcs: {},
22|22|  connected: false,
23|23|  targetPos: null,
24|24|  customization: {
25|25|    skinIdx: 0,
26|26|    hairColorIdx: 0,
27|27|    hairStyle: 'short',
28|28|    bodyIdx: 0,
29|29|  },
30|30|  previewScene: null,
31|31|  previewCamera: null,
32|32|  previewRenderer: null,
33|33|  previewModel: null,
34|34|  dialogue: null,
35|35|  inventoryUI: null,
36|36|  questUI: null,
37|37|  partyUI: null,
38|38|  monsters: {},
39|39|  damageNumbers: [],
40|40|};
41|41|
42|42|const canvas = document.getElementById('game-canvas');
43|43|const loadingScreen = document.getElementById('loading-screen');
44|44|const loginScreen = document.getElementById('login-screen');
45|45|const hud = document.getElementById('hud');
46|46|
47|47|// ============================
48|48|// THREE.JS SCENE
49|49|// ============================
50|50|function initScene() {
51|51|  state.scene = new THREE.Scene();
52|52|  state.scene.background = new THREE.Color(0x87CEEB);
53|53|  state.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
54|54|
55|55|  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
56|56|  state.camera.position.set(0, 15, 20);
57|57|
58|58|  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
59|59|  state.renderer.setSize(window.innerWidth, window.innerHeight);
60|60|  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
61|61|  state.renderer.shadowMap.enabled = true;
62|62|  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
63|63|
64|64|  state.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
65|65|  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
66|66|  sun.position.set(50, 100, 50);
67|67|  sun.castShadow = true;
68|68|  sun.shadow.mapSize.set(2048, 2048);
69|69|  state.scene.add(sun);
70|70|
71|71|  buildTerrain(state.scene);
72|72|  state.clock = new THREE.Clock();
73|73|
74|74|  // Init dialogue system
75|75|  state.dialogue = new DialogueSystem(null, { name: 'Adventurer' });
76|76|  state.inventoryUI = new InventoryUI(null, { name: 'Adventurer', inventory: [], equipment: {}, zen: 50, atk: 10, def: 5, spd: 10, crit: 0.05 });
77|77|  state.questUI = new QuestUI(null, { name: 'Adventurer' });
78|78|  state.partyUI = new PartyUI(null, { name: 'Adventurer' });
79|79|
80|80|  window.addEventListener('resize', () => {
81|81|    state.camera.aspect = window.innerWidth / window.innerHeight;
82|82|    state.camera.updateProjectionMatrix();
83|83|    state.renderer.setSize(window.innerWidth, window.innerHeight);
84|84|  });
85|85|}
86|86|
87|87|// ============================
88|88|// PREVIEW SCENE
89|89|// ============================
90|90|function initPreview() {
91|91|  const pCanvas = document.getElementById('preview-canvas');
92|92|  state.previewScene = new THREE.Scene();
93|93|  state.previewScene.background = new THREE.Color(0x2a2a3e);
94|94|
95|95|  state.previewCamera = new THREE.PerspectiveCamera(50, 200 / 250, 0.1, 10);
96|96|  state.previewCamera.position.set(0, 1.2, 3);
97|97|  state.previewCamera.lookAt(0, 0.8, 0);
98|98|
99|99|  state.previewRenderer = new THREE.WebGLRenderer({ canvas: pCanvas, antialias: true });
100|100|  state.previewRenderer.setSize(200, 250);
101|101|
102|102|  state.previewScene.add(new THREE.AmbientLight(0xffffff, 0.8));
103|103|  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
104|104|  dir.position.set(2, 3, 2);
105|105|  state.previewScene.add(dir);
106|106|
107|107|  updatePreviewModel();
108|108|}
109|109|
110|110|function updatePreviewModel() {
111|111|  if (state.previewModel) state.previewScene.remove(state.previewModel);
112|112|  const c = state.customization;
113|113|  state.previewModel = createPlayerModel({
114|114|    skinColor: PALETTES.skin[c.skinIdx],
115|115|    hairColor: PALETTES.hair[c.hairColorIdx],
116|116|    hairStyle: c.hairStyle,
117|117|    bodyColor: PALETTES.body[c.bodyIdx],
118|118|  });
119|119|  state.previewScene.add(state.previewModel);
120|120|}
121|121|
122|122|// ============================
123|123|// CUSTOMIZATION UI
124|124|// ============================
125|125|function initCustomization() {
126|126|  const skinPicker = document.getElementById('skin-picker');
127|127|  PALETTES.skin.forEach((color, i) => {
128|128|    const s = document.createElement('div');
129|129|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
130|130|    s.style.background = '#' + color.toString(16).padStart(6, '0');
131|131|    s.onclick = () => {
132|132|      skinPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
133|133|      s.classList.add('selected');
134|134|      state.customization.skinIdx = i;
135|135|      updatePreviewModel();
136|136|    };
137|137|    skinPicker.appendChild(s);
138|138|  });
139|139|
140|140|  const hairPicker = document.getElementById('hair-color-picker');
141|141|  PALETTES.hair.forEach((color, i) => {
142|142|    const s = document.createElement('div');
143|143|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
144|144|    s.style.background = '#' + color.toString(16).padStart(6, '0');
145|145|    s.onclick = () => {
146|146|      hairPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
147|147|      s.classList.add('selected');
148|148|      state.customization.hairColorIdx = i;
149|149|      updatePreviewModel();
150|150|    };
151|151|    hairPicker.appendChild(s);
152|152|  });
153|153|
154|154|  const stylePicker = document.getElementById('hair-style-picker');
155|155|  ['short', 'medium', 'long', 'spiky', 'ponytail', 'mohawk', 'braids', 'bun', 'buzz', 'twin_tails', 'bowl'].forEach(style => {
156|156|    const o = document.createElement('div');
157|157|    o.className = 'option' + (style === 'short' ? ' selected' : '');
158|158|    o.textContent = style;
159|159|    o.onclick = () => {
160|160|      stylePicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
161|161|      o.classList.add('selected');
162|162|      state.customization.hairStyle = style;
163|163|      updatePreviewModel();
164|164|    };
165|165|    stylePicker.appendChild(o);
166|166|  });
167|167|
168|168|  const bodyPicker = document.getElementById('body-picker');
169|169|  PALETTES.body.forEach((color, i) => {
170|170|    const s = document.createElement('div');
171|171|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
172|172|    s.style.background = '#' + color.toString(16).padStart(6, '0');
173|173|    s.onclick = () => {
174|174|      bodyPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
175|175|      s.classList.add('selected');
176|176|      state.customization.bodyIdx = i;
177|177|      updatePreviewModel();
178|178|    };
179|179|    bodyPicker.appendChild(s);
180|180|  });
181|181|}
182|182|
183|183|// ============================
184|184|// WEBSOCKET
185|185|// ============================
186|186|function connectWebSocket(playerName, wallet) {
187|187|  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
188|188|  state.ws = new WebSocket(`${protocol}//${location.host}`);
189|189|
190|190|  state.ws.onopen = () => {
191|191|    console.log('[WS] Connected');
192|192|    state.connected = true;
193|193|  };
194|194|  state.ws.onmessage = (event) => {
195|195|    handleServerMessage(JSON.parse(event.data));
196|196|  };
197|197|  state.ws.onclose = () => {
198|198|    console.log('[WS] Disconnected');
199|199|    state.connected = false;
200|200|  };
201|201|}
202|202|
203|203|// ============================
204|204|// SERVER MESSAGES
205|205|// ============================
206|206|function handleServerMessage(msg) {
207|207|  switch (msg.type) {
208|208|    case 'welcome':
209|209|      state.playerId = msg.playerId;
210|210|      state.ws.send(JSON.stringify({
211|211|        type: 'join',
212|212|        name: document.getElementById('name-input').value || 'Adventurer',
213|213|        wallet: null,
214|214|      }));
215|215|      break;
216|216|
217|217|    case 'joined':
218|218|      state.player = msg.player;
219|219|      state.dialogue.ws = state.ws;
220|220|      state.dialogue.playerState = state.player;
221|221|
222|222|      if (msg.npcs) Object.values(msg.npcs).forEach(npc => {
223|223|        const model = createNPCModel(npc);
224|224|        state.scene.add(model);
225|225|        state.npcs[npc.id] = model;
226|226|      });
227|227|      if (msg.onlinePlayers) msg.onlinePlayers.forEach(p => createOtherPlayer(p));
228|228|      showHUD();
229|229|      createPlayerModelInWorld(state.player);
230|230|      break;
231|231|
232|232|    case 'player_joined':
233|233|      createOtherPlayer(msg.player);
234|234|      break;
235|235|
236|236|    case 'player_moved':
237|237|      if (state.players[msg.playerId]) {
238|238|        state.players[msg.playerId].position.set(msg.x, msg.y, msg.z);
239|239|      }
240|240|      break;
241|241|
242|242|    case 'player_left':
243|243|      if (state.players[msg.playerId]) {
244|244|        state.scene.remove(state.players[msg.playerId]);
245|245|        delete state.players[msg.playerId];
246|246|      }
247|247|      break;
248|248|
249|249|    case 'chat':
250|250|      addChatMessage(msg.name, msg.message);
251|251|      break;
252|252|
253|253|    case 'npc_dialogue':
254|254|      state.dialogue.open(msg.npcId, msg.name, msg.title);
255|255|      break;
256|256|
257|257|    case 'monster_killed': {
258|258|      const lootText = msg.loot?.length > 0 ? msg.loot.map(l => `${l.name} x${l.quantity}`).join(', ') : 'Nothing';
259|259|      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP | Loot: ${lootText}`);
260|260|      updatePlayerHP(msg.hp, msg.maxHp);
261|261|      updatePlayerMP(msg.mp, msg.maxMp);
262|262|      if (msg.loot) {
263|263|        msg.loot.forEach(l => {
264|264|          if (!state.player.inventory) state.player.inventory = [];
265|265|          const existing = state.player.inventory.find(i => i.id === l.id);
266|266|          if (existing) existing.quantity = (existing.quantity || 1) + l.quantity;
267|267|          else state.player.inventory.push({ ...l });
268|268|        });
269|269|        state.inventoryUI.player = state.player;
270|270|      }
271|271|      break;
272|272|    }
273|273|
274|274|    case 'item_used': {
275|275|      state.player.hp = msg.hp;
276|276|      state.player.mp = msg.mp;
277|277|      state.player.inventory = msg.inventory;
278|278|      state.inventoryUI.player = state.player;
279|279|      updatePlayerHP(msg.hp, msg.maxHp);
280|280|      updatePlayerMP(msg.mp, msg.maxMp);
281|281|      break;
282|282|    }
283|283|
284|284|    case 'item_equipped':
285|285|    case 'item_unequipped': {
286|286|      state.player.equipment = msg.equipment;
287|287|      state.player.inventory = msg.inventory;
288|288|      state.player.atk = msg.atk;
289|289|      state.player.def = msg.def;
290|290|      state.inventoryUI.player = state.player;
291|291|      break;
292|292|    }
293|293|
294|294|    case 'party_update': {
295|295|      state.partyUI.updateParty(msg.party);
296|296|      break;
297|297|    }
298|298|    case 'party_invite': {
299|299|      if (confirm(`${msg.from} invites you to a party. Accept?`)) {
300|300|        state.ws.send(JSON.stringify({ type: 'party_accept', inviterId: msg.fromId }));
301|301|      }
302|302|      break;
303|303|    }
304|304|    case 'online_list': {
305|305|      state.partyUI.updateOnline(msg.players);
306|306|      break;
307|307|    }
308|308|    case 'quest_started':
309|309|      addChatMessage('System', `Quest started: ${msg.questName}`);
310|310|      break;
311|311|
312|312|    case 'joined':
313|313|      // Spawn existing monsters
314|314|      if (msg.monsters) msg.monsters.forEach(m => spawnMonsterClient(m));
315|315|      break;
316|316|
317|317|    case 'monster_spawn':
318|318|      spawnMonsterClient(msg.monster);
319|319|      break;
320|320|
321|321|    case 'monster_move':
322|322|      if (state.monsters[msg.monsterId]) {
323|323|        state.monsters[msg.monsterId].position.set(msg.x, 0, msg.z);
324|324|      }
325|325|      break;
326|326|
327|327|    case 'monster_hit': {
328|328|      const mob = state.monsters[msg.monsterId];
329|329|      if (mob) updateMonsterHPBar(mob, msg.hp, msg.maxHp);
330|330|      showDamageNumber(msg.monsterId, msg.damage, msg.isCrit);
331|331|      break;
332|332|    }
333|333|
334|334|    case 'monster_died': {
335|335|      const mob = state.monsters[msg.monsterId];
336|336|      if (mob) {
337|337|        state.scene.remove(mob);
338|338|        delete state.monsters[msg.monsterId];
339|339|      }
340|340|      break;
341|341|    }
342|342|
343|343|    case 'monster_attack': {
344|344|      showDamageNumber(null, msg.damage, false, msg.targetId);
345|345|      break;
346|346|    }
347|347|
348|348|    case 'player_hit': {
349|349|      updatePlayerHP(msg.hp, msg.maxHp);
350|350|      break;
351|351|    }
352|352|
353|353|    case 'player_died': {
354|354|      updatePlayerHP(msg.hp, msg.hp);
355|355|      addChatMessage('System', 'You died! Respawning at village...');
356|356|      break;
357|357|    }
358|358|
359|359|    case 'monster_killed': {
360|360|      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP, +${msg.zen} Zen`);
361|361|      updatePlayerHP(msg.hp, msg.maxHp);
362|362|      updatePlayerMP(msg.mp, msg.maxMp);
363|363|      break;
364|364|    }
365|365|
366|366|    case 'level_up': {
367|367|      addChatMessage('System', `🎉 Level Up! You are now Level ${msg.level}!`);
368|368|      updatePlayerHP(msg.maxHp, msg.maxHp);
369|369|      updatePlayerMP(msg.maxMp, msg.maxMp);
370|370|      break;
371|371|    }
372|372|
373|373|    case 'party_update': {
374|374|      state.partyUI.updateParty(msg.party);
375|375|      break;
376|376|    }
377|377|    case 'party_invite': {
378|378|      if (confirm(`${msg.from} invites you to a party. Accept?`)) {
379|379|        state.ws.send(JSON.stringify({ type: 'party_accept', inviterId: msg.fromId }));
380|380|      }
381|381|      break;
382|382|    }
383|383|    case 'online_list': {
384|384|      state.partyUI.updateOnline(msg.players);
385|385|      break;
386|386|    }
387|387|    case 'quest_started': {
388|388|      state.questUI.startQuest(msg.quest);
389|389|      addChatMessage('Quest', `Started: ${msg.quest.name}`);
390|390|      break;
391|391|    }
392|392|    case 'quest_completed': {
393|393|      state.questUI.completeQuest(msg.questId);
394|394|      addChatMessage('Quest', `✅ Completed: ${msg.questName}! +${msg.xp} XP`);
395|395|      if (msg.items) {
396|396|        msg.items.forEach(l => {
397|397|          if (!state.player.inventory) state.player.inventory = [];
398|398|          const existing = state.player.inventory.find(i => i.id === l.id);
399|399|          if (existing) existing.quantity = (existing.quantity || 1) + (l.quantity || 1);
400|400|          else state.player.inventory.push({ ...l });
401|401|        });
402|402|        state.inventoryUI.player = state.player;
403|403|      }
404|404|      state.player.hp = msg.hp;
405|405|      state.player.maxHp = msg.maxHp;
406|406|      state.player.mp = msg.mp;
407|407|      state.player.maxMp = msg.maxMp;
408|408|      updatePlayerHP(msg.hp, msg.maxHp);
409|409|      updatePlayerMP(msg.mp, msg.maxMp);
410|410|      break;
411|411|    }
412|412|    case 'quest_progress': {
413|413|      state.questUI.updateObjective(msg.questId, msg.objectiveId, 1);
414|414|      break;
415|415|    }
416|416|    case 'combat_message': {
417|417|      addChatMessage('Combat', msg.text);
418|418|      break;
419|419|    }
420|420|  }
421|421|}
422|422|
423|423|// ============================
424|424|// PLAYER MODELS
425|425|// ============================
426|426|function createPlayerModelInWorld(player) {
427|427|  const c = state.customization;
428|428|  const model = createPlayerModel({
429|429|    skinColor: PALETTES.skin[c.skinIdx],
430|430|    hairColor: PALETTES.hair[c.hairColorIdx],
431|431|    hairStyle: c.hairStyle,
432|432|    bodyColor: PALETTES.body[c.bodyIdx],
433|433|  });
434|434|  model.position.set(player.x, player.y, player.z);
435|435|  model.userData = { id: player.id, name: player.name, type: 'player' };
436|436|  state.scene.add(model);
437|437|  state.players[player.id] = model;
438|438|}
439|439|
440|440|function createOtherPlayer(player) {
441|441|  const model = createPlayerModel({});
442|442|  model.position.set(player.x, player.y, player.z);
443|443|  model.userData = { id: player.id, name: player.name, type: 'player' };
444|444|  state.scene.add(model);
445|445|  state.players[player.id] = model;
446|446|}
447|447|
448|448|// ============================
449|449|// HUD
450|450|// ============================
451|451|function showHUD() {
452|452|  loadingScreen.style.display = 'none';
453|453|  loginScreen.style.display = 'none';
454|454|  hud.style.display = 'block';
455|455|}
456|456|
457|457|// ============================
458|458|// CHAT
459|459|// ============================
460|460|function addChatMessage(name, message) {
461|461|  const el = document.getElementById('chat-messages');
462|462|  const div = document.createElement('div');
463|463|  div.innerHTML = `<strong>${name}:</strong> ${message}`;
464|464|  el.appendChild(div);
465|465|  el.scrollTop = el.scrollHeight;
466|466|}
467|467|// ============================
468|468|// COMBAT HELPERS
469|469|// ============================
470|470|const MONSTER_DATA = {
471|471|  moss_beetle: { name: 'Moss Beetle', color: 0x4CAF50, size: 0.6 },
472|472|  dust_mouse: { name: 'Dust Mouse', color: 0xBCAAA4, size: 0.35 },
473|473|  thorn_lizard: { name: 'Thorn Lizard', color: 0x689F38, size: 0.7 },
474|474|  puddle_frog: { name: 'Puddle Frog', color: 0x00BCD4, size: 0.55 },
475|475|  wind_sprite: { name: 'Wind Sprite', color: 0x81D4FA, size: 0.4 },
476|476|  rock_crawler: { name: 'Rock Crawler', color: 0x9E9E9E, size: 0.45 },
477|477|  bramble_boar: { name: 'Bramble Boar', color: 0x5D4037, size: 1.2 },
478|478|};
479|479|
480|480|function spawnMonsterClient(m) {
481|481|  const data = MONSTER_DATA[m.type] || { name: m.name, color: 0x999999, size: 0.5 };
482|482|  const model = createMonsterModel(m.type, { ...data, name: m.name, size: data.size });
483|483|  model.position.set(m.x, 0, m.z);
484|484|  model.userData = { id: m.id, type: 'monster', monsterType: m.type };
485|485|  state.scene.add(model);
486|486|  state.monsters[m.id] = model;
487|487|}
488|488|
489|489|function showDamageNumber(monsterId, damage, isCrit, targetId) {
490|490|  let pos;
491|491|  if (monsterId && state.monsters[monsterId]) {
492|492|    pos = state.monsters[monsterId].position.clone();
493|493|    pos.y += 1.5;
494|494|  } else if (targetId && state.players[targetId]) {
495|495|    pos = state.players[targetId].position.clone();
496|496|    pos.y += 1.5;
497|497|  } else {
498|498|    return;
499|499|  }
500|500|
501|501|  // Create floating text sprite
502|502|  const canvas = document.createElement('canvas');
503|503|  canvas.width = 128;
504|504|  canvas.height = 64;
505|505|  const ctx = canvas.getContext('2d');
506|506|  ctx.fillStyle = isCrit ? '#FFD700' : '#FF5252';
507|507|  ctx.font = isCrit ? 'bold 36px Courier New' : '28px Courier New';
508|508|  ctx.textAlign = 'center';
509|509|  ctx.fillText(isCrit ? `${damage}!` : `-${damage}`, 64, 40);
510|510|
511|511|  const texture = new THREE.CanvasTexture(canvas);
512|512|  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
513|513|  sprite.position.copy(pos);
514|514|  sprite.scale.set(0.8, 0.4, 1);
515|515|  state.scene.add(sprite);
516|516|
517|517|  // Animate up and fade
518|518|  const startTime = Date.now();
519|519|  const animate = () => {
520|520|    const elapsed = (Date.now() - startTime) / 1000;
521|521|    if (elapsed > 1) {
522|522|      state.scene.remove(sprite);
523|523|      return;
524|524|    }
525|525|    sprite.position.y += 0.02;
526|526|    sprite.material.opacity = 1 - elapsed;
527|527|    requestAnimationFrame(animate);
528|528|  };
529|529|  animate();
530|530|}
531|531|
532|532|function updatePlayerHP(hp, maxHp) {
533|533|  const fill = document.getElementById('hp-fill');
534|534|  const text = document.getElementById('hp-text');
535|535|  if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
536|536|  if (text) text.textContent = `${Math.round(hp)}/${maxHp}`;
537|537|}
538|538|
539|539|function updatePlayerMP(mp, maxMp) {
540|540|  const fill = document.getElementById('mp-fill');
541|541|  const text = document.getElementById('mp-text');
542|542|  if (fill) fill.style.width = `${(mp / maxMp) * 100}%`;
543|543|  if (text) text.textContent = `${Math.round(mp)}/${maxMp}`;
544|544|}
545|545|
546|546|// ============================
547|547|// CLICK TO MOVE
548|548|// ============================
549|549|canvas.addEventListener('click', (e) => {
550|550|  if (!state.connected || !state.player) return;
551|551|  // Don't move if dialogue is open
552|552|  if (state.dialogue.container.style.display === 'block') return;
553|553|
554|554|  const mouse = new THREE.Vector2(
555|555|    (e.clientX / window.innerWidth) * 2 - 1,
556|556|    -(e.clientY / window.innerHeight) * 2 + 1
557|557|  );
558|558|
559|559|  const raycaster = new THREE.Raycaster();
560|560|  raycaster.setFromCamera(mouse, state.camera);
561|561|
562|562|  const ground = state.scene.getObjectByName('ground');
563|563|  if (!ground) return;
564|564|
565|565|  const intersects = raycaster.intersectObject(ground);
566|566|  if (intersects.length === 0) return;
567|567|
568|568|  const point = intersects[0].point;
569|569|
570|570|  // Check NPC proximity
571|571|  for (const npc of Object.values(state.npcs)) {
572|572|    if (npc.position.distanceTo(point) < 2) {
573|573|      state.ws.send(JSON.stringify({ type: 'interact_npc', npcId: npc.userData.id }));
574|574|      return;
575|575|    }
576|576|  }
577|577|
578|578|  // Check Monster proximity — attack
579|579|  for (const mob of Object.values(state.monsters)) {
580|580|    if (mob.position.distanceTo(point) < 2) {
581|581|      state.ws.send(JSON.stringify({ type: 'attack', monsterId: mob.userData.id }));
582|582|      // Face the monster
583|583|      const model = state.players[state.playerId];
584|584|      if (model) model.lookAt(mob.position);
585|585|      return;
586|586|    }
587|587|  }
588|588|
589|589|  state.targetPos = new THREE.Vector3(point.x, 0, point.z);
590|590|});
591|591|
592|592|// ============================
593|593|// SMOOTH MOVEMENT
594|594|// ============================
595|595|function updateMovement() {
596|596|  if (!state.targetPos) return;
597|597|  const model = state.players[state.playerId];
598|598|  if (!model) return;
599|599|
600|600|  const dir = new THREE.Vector3().subVectors(state.targetPos, model.position);
601|601|  if (dir.length() < 0.1) {
602|602|    model.position.copy(state.targetPos);
603|603|    state.ws.send(JSON.stringify({ type: 'move', x: state.targetPos.x, y: 0, z: state.targetPos.z }));
604|604|    state.targetPos = null;
605|605|    return;
606|606|  }
607|607|
608|608|  dir.normalize().multiplyScalar(0.15);
609|609|  model.position.add(dir);
610|610|  model.lookAt(state.targetPos);
611|611|
612|612|  state.ws.send(JSON.stringify({
613|613|    type: 'move',
614|614|    x: model.position.x,
615|615|    y: 0,
616|616|    z: model.position.z,
617|617|  }));
618|618|}
619|619|
620|620|// ============================
621|621|// CHAT INPUT
622|622|// ============================
623|623|document.getElementById('chat-input').addEventListener('keydown', (e) => {
624|624|  if (e.key === 'Enter') {
625|625|    const msg = e.target.value.trim();
626|626|    if (msg && state.connected) {
627|627|      state.ws.send(JSON.stringify({ type: 'chat', message: msg }));
628|628|      addChatMessage(state.player?.name || 'You', msg);
629|629|      e.target.value = '';
630|630|    }
631|631|  }
632|632|});
633|633|
634|634|// ============================
635|635|// START GAME
636|636|// ============================
637|637|document.getElementById('start-game').addEventListener('click', () => {
638|638|  const name = document.getElementById('name-input').value.trim();
639|639|  if (name) connectWebSocket(name, null);
640|640|});
641|641|
642|642|// ============================
643|643|// GAME LOOP
644|644|// ============================
645|645|function gameLoop() {
646|646|  requestAnimationFrame(gameLoop);
647|647|  updateMovement();
648|648|
649|649|  const playerModel = state.players[state.playerId];
650|650|  if (state.targetPos) animateWalk(playerModel, 1);
651|651|  else stopWalk(playerModel);
652|652|
653|653|  if (state.previewModel) {
654|654|    state.previewModel.rotation.y += 0.01;
655|655|    state.previewRenderer.render(state.previewScene, state.previewCamera);
656|656|  }
657|657|
658|658|  if (playerModel) {
659|659|    const t = playerModel.position;
660|660|    state.camera.position.x += (t.x - state.camera.position.x) * 0.05;
661|661|    state.camera.position.z += (t.z + 20 - state.camera.position.z) * 0.05;
662|662|    state.camera.lookAt(t.x, t.y + 1, t.z);
663|663|  }
664|664|
665|665|  // Monster animation
666|666|  const time = Date.now() * 0.001;
667|667|  Object.values(state.monsters).forEach(m => animateMonster(m, time));
668|668|
669|669|  if (state.scene && state.camera && state.renderer) {
670|670|    state.renderer.render(state.scene, state.camera);
671|671|  }
672|672|}
673|673|
674|674|// ============================
675|675|// BOOT
676|676|// ============================
677|677|function boot() {
678|678|  initScene();
679|679|  initPreview();
680|680|  initCustomization();
681|681|  gameLoop();
682|682|  setTimeout(() => {
683|683|    loadingScreen.style.display = 'none';
684|684|    loginScreen.style.display = 'flex';
685|685|  }, 1500);
686|686|}
687|687|
688|688|boot();
689|689|