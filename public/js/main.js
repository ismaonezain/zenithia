1|1|1|1|1|// Zenithia — Client Entry Point
2|2|2|2|2|import * as THREE from 'three';
3|3|3|3|3|import { buildTerrain } from './terrain.js';
4|4|4|4|4|import { createPlayerModel, createNPCModel, PALETTES, animateWalk, stopWalk, applyEquipment } from './character.js';
5|5|5|5|5|import { DialogueSystem } from './dialogue_ui.js';
6|6|6|import { InventoryUI } from './inventory.js';
7|import { QuestUI } from './quest_ui.js';
import { PartyUI } from './party_ui.js';
8|7|7|6|6|import { createMonsterModel, updateMonsterHPBar, animateMonster } from './monsters.js';
9|8|8|7|7|
10|9|9|8|8|// --- State ---
11|10|10|9|9|const state = {
12|11|11|10|10|  playerId: null,
13|12|12|11|11|  player: null,
14|13|13|12|12|  ws: null,
15|14|14|13|13|  scene: null,
16|15|15|14|14|  camera: null,
17|16|16|15|15|  renderer: null,
18|17|17|16|16|  clock: null,
19|18|18|17|17|  players: {},
20|19|19|18|18|  npcs: {},
21|20|20|19|19|  connected: false,
22|21|21|20|20|  targetPos: null,
23|22|22|21|21|  customization: {
24|23|23|22|22|    skinIdx: 0,
25|24|24|23|23|    hairColorIdx: 0,
26|25|25|24|24|    hairStyle: 'short',
27|26|26|25|25|    bodyIdx: 0,
28|27|27|26|26|  },
29|28|28|27|27|  previewScene: null,
30|29|29|28|28|  previewCamera: null,
31|30|30|29|29|  previewRenderer: null,
32|31|31|30|30|  previewModel: null,
33|32|32|31|31|  dialogue: null,
34|33|33|  inventoryUI: null,
35|  questUI: null,
  partyUI: null,
36|34|34|32|32|  monsters: {},
37|35|35|33|33|  damageNumbers: [],
38|36|36|34|34|};
39|37|37|35|35|
40|38|38|36|36|const canvas = document.getElementById('game-canvas');
41|39|39|37|37|const loadingScreen = document.getElementById('loading-screen');
42|40|40|38|38|const loginScreen = document.getElementById('login-screen');
43|41|41|39|39|const hud = document.getElementById('hud');
44|42|42|40|40|
45|43|43|41|41|// ============================
46|44|44|42|42|// THREE.JS SCENE
47|45|45|43|43|// ============================
48|46|46|44|44|function initScene() {
49|47|47|45|45|  state.scene = new THREE.Scene();
50|48|48|46|46|  state.scene.background = new THREE.Color(0x87CEEB);
51|49|49|47|47|  state.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
52|50|50|48|48|
53|51|51|49|49|  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
54|52|52|50|50|  state.camera.position.set(0, 15, 20);
55|53|53|51|51|
56|54|54|52|52|  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
57|55|55|53|53|  state.renderer.setSize(window.innerWidth, window.innerHeight);
58|56|56|54|54|  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
59|57|57|55|55|  state.renderer.shadowMap.enabled = true;
60|58|58|56|56|  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
61|59|59|57|57|
62|60|60|58|58|  state.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
63|61|61|59|59|  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
64|62|62|60|60|  sun.position.set(50, 100, 50);
65|63|63|61|61|  sun.castShadow = true;
66|64|64|62|62|  sun.shadow.mapSize.set(2048, 2048);
67|65|65|63|63|  state.scene.add(sun);
68|66|66|64|64|
69|67|67|65|65|  buildTerrain(state.scene);
70|68|68|66|66|  state.clock = new THREE.Clock();
71|69|69|67|67|
72|70|70|68|68|  // Init dialogue system
73|71|71|69|69|  state.dialogue = new DialogueSystem(null, { name: 'Adventurer' });
74|72|72|  state.inventoryUI = new InventoryUI(null, { name: 'Adventurer', inventory: [], equipment: {}, zen: 50, atk: 10, def: 5, spd: 10, crit: 0.05 });
75|  state.questUI = new QuestUI(null, { name: 'Adventurer' });
  state.partyUI = new PartyUI(null, { name: 'Adventurer' });
76|73|73|70|70|
77|74|74|71|71|  window.addEventListener('resize', () => {
78|75|75|72|72|    state.camera.aspect = window.innerWidth / window.innerHeight;
79|76|76|73|73|    state.camera.updateProjectionMatrix();
80|77|77|74|74|    state.renderer.setSize(window.innerWidth, window.innerHeight);
81|78|78|75|75|  });
82|79|79|76|76|}
83|80|80|77|77|
84|81|81|78|78|// ============================
85|82|82|79|79|// PREVIEW SCENE
86|83|83|80|80|// ============================
87|84|84|81|81|function initPreview() {
88|85|85|82|82|  const pCanvas = document.getElementById('preview-canvas');
89|86|86|83|83|  state.previewScene = new THREE.Scene();
90|87|87|84|84|  state.previewScene.background = new THREE.Color(0x2a2a3e);
91|88|88|85|85|
92|89|89|86|86|  state.previewCamera = new THREE.PerspectiveCamera(50, 200 / 250, 0.1, 10);
93|90|90|87|87|  state.previewCamera.position.set(0, 1.2, 3);
94|91|91|88|88|  state.previewCamera.lookAt(0, 0.8, 0);
95|92|92|89|89|
96|93|93|90|90|  state.previewRenderer = new THREE.WebGLRenderer({ canvas: pCanvas, antialias: true });
97|94|94|91|91|  state.previewRenderer.setSize(200, 250);
98|95|95|92|92|
99|96|96|93|93|  state.previewScene.add(new THREE.AmbientLight(0xffffff, 0.8));
100|97|97|94|94|  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
101|98|98|95|95|  dir.position.set(2, 3, 2);
102|99|99|96|96|  state.previewScene.add(dir);
103|100|100|97|97|
104|101|101|98|98|  updatePreviewModel();
105|102|102|99|99|}
106|103|103|100|100|
107|104|104|101|101|function updatePreviewModel() {
108|105|105|102|102|  if (state.previewModel) state.previewScene.remove(state.previewModel);
109|106|106|103|103|  const c = state.customization;
110|107|107|104|104|  state.previewModel = createPlayerModel({
111|108|108|105|105|    skinColor: PALETTES.skin[c.skinIdx],
112|109|109|106|106|    hairColor: PALETTES.hair[c.hairColorIdx],
113|110|110|107|107|    hairStyle: c.hairStyle,
114|111|111|108|108|    bodyColor: PALETTES.body[c.bodyIdx],
115|112|112|109|109|  });
116|113|113|110|110|  state.previewScene.add(state.previewModel);
117|114|114|111|111|}
118|115|115|112|112|
119|116|116|113|113|// ============================
120|117|117|114|114|// CUSTOMIZATION UI
121|118|118|115|115|// ============================
122|119|119|116|116|function initCustomization() {
123|120|120|117|117|  const skinPicker = document.getElementById('skin-picker');
124|121|121|118|118|  PALETTES.skin.forEach((color, i) => {
125|122|122|119|119|    const s = document.createElement('div');
126|123|123|120|120|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
127|124|124|121|121|    s.style.background = '#' + color.toString(16).padStart(6, '0');
128|125|125|122|122|    s.onclick = () => {
129|126|126|123|123|      skinPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
130|127|127|124|124|      s.classList.add('selected');
131|128|128|125|125|      state.customization.skinIdx = i;
132|129|129|126|126|      updatePreviewModel();
133|130|130|127|127|    };
134|131|131|128|128|    skinPicker.appendChild(s);
135|132|132|129|129|  });
136|133|133|130|130|
137|134|134|131|131|  const hairPicker = document.getElementById('hair-color-picker');
138|135|135|132|132|  PALETTES.hair.forEach((color, i) => {
139|136|136|133|133|    const s = document.createElement('div');
140|137|137|134|134|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
141|138|138|135|135|    s.style.background = '#' + color.toString(16).padStart(6, '0');
142|139|139|136|136|    s.onclick = () => {
143|140|140|137|137|      hairPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
144|141|141|138|138|      s.classList.add('selected');
145|142|142|139|139|      state.customization.hairColorIdx = i;
146|143|143|140|140|      updatePreviewModel();
147|144|144|141|141|    };
148|145|145|142|142|    hairPicker.appendChild(s);
149|146|146|143|143|  });
150|147|147|144|144|
151|148|148|145|145|  const stylePicker = document.getElementById('hair-style-picker');
152|149|149|146|146|  ['short', 'medium', 'long', 'spiky', 'ponytail'].forEach(style => {
153|150|150|147|147|    const o = document.createElement('div');
154|151|151|148|148|    o.className = 'option' + (style === 'short' ? ' selected' : '');
155|152|152|149|149|    o.textContent = style;
156|153|153|150|150|    o.onclick = () => {
157|154|154|151|151|      stylePicker.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
158|155|155|152|152|      o.classList.add('selected');
159|156|156|153|153|      state.customization.hairStyle = style;
160|157|157|154|154|      updatePreviewModel();
161|158|158|155|155|    };
162|159|159|156|156|    stylePicker.appendChild(o);
163|160|160|157|157|  });
164|161|161|158|158|
165|162|162|159|159|  const bodyPicker = document.getElementById('body-picker');
166|163|163|160|160|  PALETTES.body.forEach((color, i) => {
167|164|164|161|161|    const s = document.createElement('div');
168|165|165|162|162|    s.className = 'swatch' + (i === 0 ? ' selected' : '');
169|166|166|163|163|    s.style.background = '#' + color.toString(16).padStart(6, '0');
170|167|167|164|164|    s.onclick = () => {
171|168|168|165|165|      bodyPicker.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
172|169|169|166|166|      s.classList.add('selected');
173|170|170|167|167|      state.customization.bodyIdx = i;
174|171|171|168|168|      updatePreviewModel();
175|172|172|169|169|    };
176|173|173|170|170|    bodyPicker.appendChild(s);
177|174|174|171|171|  });
178|175|175|172|172|}
179|176|176|173|173|
180|177|177|174|174|// ============================
181|178|178|175|175|// WEBSOCKET
182|179|179|176|176|// ============================
183|180|180|177|177|function connectWebSocket(playerName, wallet) {
184|181|181|178|178|  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
185|182|182|179|179|  state.ws = new WebSocket(`${protocol}//${location.host}`);
186|183|183|180|180|
187|184|184|181|181|  state.ws.onopen = () => {
188|185|185|182|182|    console.log('[WS] Connected');
189|186|186|183|183|    state.connected = true;
190|187|187|184|184|  };
191|188|188|185|185|  state.ws.onmessage = (event) => {
192|189|189|186|186|    handleServerMessage(JSON.parse(event.data));
193|190|190|187|187|  };
194|191|191|188|188|  state.ws.onclose = () => {
195|192|192|189|189|    console.log('[WS] Disconnected');
196|193|193|190|190|    state.connected = false;
197|194|194|191|191|  };
198|195|195|192|192|}
199|196|196|193|193|
200|197|197|194|194|// ============================
201|198|198|195|195|// SERVER MESSAGES
202|199|199|196|196|// ============================
203|200|200|197|197|function handleServerMessage(msg) {
204|201|201|198|198|  switch (msg.type) {
205|202|202|199|199|    case 'welcome':
206|203|203|200|200|      state.playerId = msg.playerId;
207|204|204|201|201|      state.ws.send(JSON.stringify({
208|205|205|202|202|        type: 'join',
209|206|206|203|203|        name: document.getElementById('name-input').value || 'Adventurer',
210|207|207|204|204|        wallet: null,
211|208|208|205|205|      }));
212|209|209|206|206|      break;
213|210|210|207|207|
214|211|211|208|208|    case 'joined':
215|212|212|209|209|      state.player = msg.player;
216|213|213|210|210|      state.dialogue.ws = state.ws;
217|214|214|211|211|      state.dialogue.playerState = state.player;
218|215|215|212|212|
219|216|216|213|213|      if (msg.npcs) Object.values(msg.npcs).forEach(npc => {
220|217|217|214|214|        const model = createNPCModel(npc);
221|218|218|215|215|        state.scene.add(model);
222|219|219|216|216|        state.npcs[npc.id] = model;
223|220|220|217|217|      });
224|221|221|218|218|      if (msg.onlinePlayers) msg.onlinePlayers.forEach(p => createOtherPlayer(p));
225|222|222|219|219|      showHUD();
226|223|223|220|220|      createPlayerModelInWorld(state.player);
227|224|224|221|221|      break;
228|225|225|222|222|
229|226|226|223|223|    case 'player_joined':
230|227|227|224|224|      createOtherPlayer(msg.player);
231|228|228|225|225|      break;
232|229|229|226|226|
233|230|230|227|227|    case 'player_moved':
234|231|231|228|228|      if (state.players[msg.playerId]) {
235|232|232|229|229|        state.players[msg.playerId].position.set(msg.x, msg.y, msg.z);
236|233|233|230|230|      }
237|234|234|231|231|      break;
238|235|235|232|232|
239|236|236|233|233|    case 'player_left':
240|237|237|234|234|      if (state.players[msg.playerId]) {
241|238|238|235|235|        state.scene.remove(state.players[msg.playerId]);
242|239|239|236|236|        delete state.players[msg.playerId];
243|240|240|237|237|      }
244|241|241|238|238|      break;
245|242|242|239|239|
246|243|243|240|240|    case 'chat':
247|244|244|241|241|      addChatMessage(msg.name, msg.message);
248|245|245|242|242|      break;
249|246|246|243|243|
250|247|247|244|244|    case 'npc_dialogue':
251|248|248|245|245|      state.dialogue.open(msg.npcId, msg.name, msg.title);
252|249|249|246|246|      break;
253|250|250|247|247|
254|251|251|248|248|    case 'monster_killed': {
255|252|252|      const lootText = msg.loot?.length > 0 ? msg.loot.map(l => `${l.name} x${l.quantity}`).join(', ') : 'Nothing';
256|253|253|      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP | Loot: ${lootText}`);
257|254|254|      updatePlayerHP(msg.hp, msg.maxHp);
258|255|255|      updatePlayerMP(msg.mp, msg.maxMp);
259|256|256|      if (msg.loot) {
260|257|257|        msg.loot.forEach(l => {
261|258|258|          if (!state.player.inventory) state.player.inventory = [];
262|259|259|          const existing = state.player.inventory.find(i => i.id === l.id);
263|260|260|          if (existing) existing.quantity = (existing.quantity || 1) + l.quantity;
264|261|261|          else state.player.inventory.push({ ...l });
265|262|262|        });
266|263|263|        state.inventoryUI.player = state.player;
267|264|264|      }
268|265|265|      break;
269|266|266|    }
270|267|267|
271|268|268|    case 'item_used': {
272|269|269|      state.player.hp = msg.hp;
273|270|270|      state.player.mp = msg.mp;
274|271|271|      state.player.inventory = msg.inventory;
275|272|272|      state.inventoryUI.player = state.player;
276|273|273|      updatePlayerHP(msg.hp, msg.maxHp);
277|274|274|      updatePlayerMP(msg.mp, msg.maxMp);
278|275|275|      break;
279|276|276|    }
280|277|277|
281|278|278|    case 'item_equipped':
282|279|279|    case 'item_unequipped': {
283|280|280|      state.player.equipment = msg.equipment;
284|281|281|      state.player.inventory = msg.inventory;
285|282|282|      state.player.atk = msg.atk;
286|283|283|      state.player.def = msg.def;
287|284|284|      state.inventoryUI.player = state.player;
288|285|285|      break;
289|286|286|    }
290|287|287|
291|288|288|    case 'party_update': {
      state.partyUI.updateParty(msg.party);
      break;
    }
    case 'party_invite': {
      if (confirm(`${msg.from} invites you to a party. Accept?`)) {
        state.ws.send(JSON.stringify({ type: 'party_accept', inviterId: msg.fromId }));
      }
      break;
    }
    case 'online_list': {
      state.partyUI.updateOnline(msg.players);
      break;
    }
    case 'quest_started':
292|289|289|249|249|      addChatMessage('System', `Quest started: ${msg.questName}`);
293|290|290|250|250|      break;
294|291|291|251|251|
295|292|292|252|252|    case 'joined':
296|293|293|253|253|      // Spawn existing monsters
297|294|294|254|254|      if (msg.monsters) msg.monsters.forEach(m => spawnMonsterClient(m));
298|295|295|255|255|      break;
299|296|296|256|256|
300|297|297|257|257|    case 'monster_spawn':
301|298|298|258|258|      spawnMonsterClient(msg.monster);
302|299|299|259|259|      break;
303|300|300|260|260|
304|301|301|261|261|    case 'monster_move':
305|302|302|262|262|      if (state.monsters[msg.monsterId]) {
306|303|303|263|263|        state.monsters[msg.monsterId].position.set(msg.x, 0, msg.z);
307|304|304|264|264|      }
308|305|305|265|265|      break;
309|306|306|266|266|
310|307|307|267|267|    case 'monster_hit': {
311|308|308|268|268|      const mob = state.monsters[msg.monsterId];
312|309|309|269|269|      if (mob) updateMonsterHPBar(mob, msg.hp, msg.maxHp);
313|310|310|270|270|      showDamageNumber(msg.monsterId, msg.damage, msg.isCrit);
314|311|311|271|271|      break;
315|312|312|272|272|    }
316|313|313|273|273|
317|314|314|274|274|    case 'monster_died': {
318|315|315|275|275|      const mob = state.monsters[msg.monsterId];
319|316|316|276|276|      if (mob) {
320|317|317|277|277|        state.scene.remove(mob);
321|318|318|278|278|        delete state.monsters[msg.monsterId];
322|319|319|279|279|      }
323|320|320|280|280|      break;
324|321|321|281|281|    }
325|322|322|282|282|
326|323|323|283|283|    case 'monster_attack': {
327|324|324|284|284|      showDamageNumber(null, msg.damage, false, msg.targetId);
328|325|325|285|285|      break;
329|326|326|286|286|    }
330|327|327|287|287|
331|328|328|288|288|    case 'player_hit': {
332|329|329|289|289|      updatePlayerHP(msg.hp, msg.maxHp);
333|330|330|290|290|      break;
334|331|331|291|291|    }
335|332|332|292|292|
336|333|333|293|293|    case 'player_died': {
337|334|334|294|294|      updatePlayerHP(msg.hp, msg.hp);
338|335|335|295|295|      addChatMessage('System', 'You died! Respawning at village...');
339|336|336|296|296|      break;
340|337|337|297|297|    }
341|338|338|298|298|
342|339|339|299|299|    case 'monster_killed': {
343|340|340|300|300|      addChatMessage('System', `Defeated ${msg.monsterName}! +${msg.xp} XP, +${msg.zen} Zen`);
344|341|341|301|301|      updatePlayerHP(msg.hp, msg.maxHp);
345|342|342|302|302|      updatePlayerMP(msg.mp, msg.maxMp);
346|343|343|303|303|      break;
347|344|344|304|304|    }
348|345|345|305|305|
349|346|346|306|306|    case 'level_up': {
350|347|347|307|307|      addChatMessage('System', `🎉 Level Up! You are now Level ${msg.level}!`);
351|348|348|308|308|      updatePlayerHP(msg.maxHp, msg.maxHp);
352|349|349|309|309|      updatePlayerMP(msg.maxMp, msg.maxMp);
353|350|350|310|310|      break;
354|351|351|311|311|    }
355|352|352|312|312|
356|353|353|313|313|    case 'party_update': {
      state.partyUI.updateParty(msg.party);
      break;
    }
    case 'party_invite': {
      if (confirm(`${msg.from} invites you to a party. Accept?`)) {
        state.ws.send(JSON.stringify({ type: 'party_accept', inviterId: msg.fromId }));
      }
      break;
    }
    case 'online_list': {
      state.partyUI.updateOnline(msg.players);
      break;
    }
    case 'quest_started': {
357|      state.questUI.startQuest(msg.quest);
358|      addChatMessage('Quest', `Started: ${msg.quest.name}`);
359|      break;
360|    }
361|    case 'quest_completed': {
362|      state.questUI.completeQuest(msg.questId);
363|      addChatMessage('Quest', `✅ Completed: ${msg.questName}! +${msg.xp} XP`);
364|      if (msg.items) {
365|        msg.items.forEach(l => {
366|          if (!state.player.inventory) state.player.inventory = [];
367|          const existing = state.player.inventory.find(i => i.id === l.id);
368|          if (existing) existing.quantity = (existing.quantity || 1) + (l.quantity || 1);
369|          else state.player.inventory.push({ ...l });
370|        });
371|        state.inventoryUI.player = state.player;
372|      }
373|      state.player.hp = msg.hp;
374|      state.player.maxHp = msg.maxHp;
375|      state.player.mp = msg.mp;
376|      state.player.maxMp = msg.maxMp;
377|      updatePlayerHP(msg.hp, msg.maxHp);
378|      updatePlayerMP(msg.mp, msg.maxMp);
379|      break;
380|    }
381|    case 'quest_progress': {
382|      state.questUI.updateObjective(msg.questId, msg.objectiveId, 1);
383|      break;
384|    }
385|    case 'combat_message': {
386|354|354|314|314|      addChatMessage('Combat', msg.text);
387|355|355|315|315|      break;
388|356|356|316|316|    }
389|357|357|317|317|  }
390|358|358|318|318|}
391|359|359|319|319|
392|360|360|320|320|// ============================
393|361|361|321|321|// PLAYER MODELS
394|362|362|322|322|// ============================
395|363|363|323|323|function createPlayerModelInWorld(player) {
396|364|364|324|324|  const c = state.customization;
397|365|365|325|325|  const model = createPlayerModel({
398|366|366|326|326|    skinColor: PALETTES.skin[c.skinIdx],
399|367|367|327|327|    hairColor: PALETTES.hair[c.hairColorIdx],
400|368|368|328|328|    hairStyle: c.hairStyle,
401|369|369|329|329|    bodyColor: PALETTES.body[c.bodyIdx],
402|370|370|330|330|  });
403|371|371|331|331|  model.position.set(player.x, player.y, player.z);
404|372|372|332|332|  model.userData = { id: player.id, name: player.name, type: 'player' };
405|373|373|333|333|  state.scene.add(model);
406|374|374|334|334|  state.players[player.id] = model;
407|375|375|335|335|}
408|376|376|336|336|
409|377|377|337|337|function createOtherPlayer(player) {
410|378|378|338|338|  const model = createPlayerModel({});
411|379|379|339|339|  model.position.set(player.x, player.y, player.z);
412|380|380|340|340|  model.userData = { id: player.id, name: player.name, type: 'player' };
413|381|381|341|341|  state.scene.add(model);
414|382|382|342|342|  state.players[player.id] = model;
415|383|383|343|343|}
416|384|384|344|344|
417|385|385|345|345|// ============================
418|386|386|346|346|// HUD
419|387|387|347|347|// ============================
420|388|388|348|348|function showHUD() {
421|389|389|349|349|  loadingScreen.style.display = 'none';
422|390|390|350|350|  loginScreen.style.display = 'none';
423|391|391|351|351|  hud.style.display = 'block';
424|392|392|352|352|}
425|393|393|353|353|
426|394|394|354|354|// ============================
427|395|395|355|355|// CHAT
428|396|396|356|356|// ============================
429|397|397|357|357|function addChatMessage(name, message) {
430|398|398|358|358|  const el = document.getElementById('chat-messages');
431|399|399|359|359|  const div = document.createElement('div');
432|400|400|360|360|  div.innerHTML = `<strong>${name}:</strong> ${message}`;
433|401|401|361|361|  el.appendChild(div);
434|402|402|362|362|  el.scrollTop = el.scrollHeight;
435|403|403|363|363|}
436|404|404|364|364|// ============================
437|405|405|365|365|// COMBAT HELPERS
438|406|406|366|366|// ============================
439|407|407|367|367|const MONSTER_DATA = {
440|408|408|368|368|  moss_beetle: { name: 'Moss Beetle', color: 0x4CAF50, size: 0.6 },
441|409|409|369|369|  dust_mouse: { name: 'Dust Mouse', color: 0xBCAAA4, size: 0.35 },
442|410|410|370|370|  thorn_lizard: { name: 'Thorn Lizard', color: 0x689F38, size: 0.7 },
443|411|411|371|371|  puddle_frog: { name: 'Puddle Frog', color: 0x00BCD4, size: 0.55 },
444|412|412|372|372|  wind_sprite: { name: 'Wind Sprite', color: 0x81D4FA, size: 0.4 },
445|413|413|373|373|  rock_crawler: { name: 'Rock Crawler', color: 0x9E9E9E, size: 0.45 },
446|414|414|374|374|  bramble_boar: { name: 'Bramble Boar', color: 0x5D4037, size: 1.2 },
447|415|415|375|375|};
448|416|416|376|376|
449|417|417|377|377|function spawnMonsterClient(m) {
450|418|418|378|378|  const data = MONSTER_DATA[m.type] || { name: m.name, color: 0x999999, size: 0.5 };
451|419|419|379|379|  const model = createMonsterModel(m.type, { ...data, name: m.name, size: data.size });
452|420|420|380|380|  model.position.set(m.x, 0, m.z);
453|421|421|381|381|  model.userData = { id: m.id, type: 'monster', monsterType: m.type };
454|422|422|382|382|  state.scene.add(model);
455|423|423|383|383|  state.monsters[m.id] = model;
456|424|424|384|384|}
457|425|425|385|385|
458|426|426|386|386|function showDamageNumber(monsterId, damage, isCrit, targetId) {
459|427|427|387|387|  let pos;
460|428|428|388|388|  if (monsterId && state.monsters[monsterId]) {
461|429|429|389|389|    pos = state.monsters[monsterId].position.clone();
462|430|430|390|390|    pos.y += 1.5;
463|431|431|391|391|  } else if (targetId && state.players[targetId]) {
464|432|432|392|392|    pos = state.players[targetId].position.clone();
465|433|433|393|393|    pos.y += 1.5;
466|434|434|394|394|  } else {
467|435|435|395|395|    return;
468|436|436|396|396|  }
469|437|437|397|397|
470|438|438|398|398|  // Create floating text sprite
471|439|439|399|399|  const canvas = document.createElement('canvas');
472|440|440|400|400|  canvas.width = 128;
473|441|441|401|401|  canvas.height = 64;
474|442|442|402|402|  const ctx = canvas.getContext('2d');
475|443|443|403|403|  ctx.fillStyle = isCrit ? '#FFD700' : '#FF5252';
476|444|444|404|404|  ctx.font = isCrit ? 'bold 36px Courier New' : '28px Courier New';
477|445|445|405|405|  ctx.textAlign = 'center';
478|446|446|406|406|  ctx.fillText(isCrit ? `${damage}!` : `-${damage}`, 64, 40);
479|447|447|407|407|
480|448|448|408|408|  const texture = new THREE.CanvasTexture(canvas);
481|449|449|409|409|  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
482|450|450|410|410|  sprite.position.copy(pos);
483|451|451|411|411|  sprite.scale.set(0.8, 0.4, 1);
484|452|452|412|412|  state.scene.add(sprite);
485|453|453|413|413|
486|454|454|414|414|  // Animate up and fade
487|455|455|415|415|  const startTime = Date.now();
488|456|456|416|416|  const animate = () => {
489|457|457|417|417|    const elapsed = (Date.now() - startTime) / 1000;
490|458|458|418|418|    if (elapsed > 1) {
491|459|459|419|419|      state.scene.remove(sprite);
492|460|460|420|420|      return;
493|461|461|421|421|    }
494|462|462|422|422|    sprite.position.y += 0.02;
495|463|463|423|423|    sprite.material.opacity = 1 - elapsed;
496|464|464|424|424|    requestAnimationFrame(animate);
497|465|465|425|425|  };
498|466|466|426|426|  animate();
499|467|467|427|427|}
500|468|468|428|428|
501|469|469|429|429|function updatePlayerHP(hp, maxHp) {
502|470|470|430|430|  const fill = document.getElementById('hp-fill');
503|471|471|431|431|  const text = document.getElementById('hp-text');
504|472|472|432|432|  if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
505|473|473|433|433|  if (text) text.textContent = `${Math.round(hp)}/${maxHp}`;
506|474|474|434|434|}
507|475|475|435|435|
508|476|476|436|436|function updatePlayerMP(mp, maxMp) {
509|477|477|437|437|  const fill = document.getElementById('mp-fill');
510|478|478|438|438|  const text = document.getElementById('mp-text');
511|479|479|439|439|  if (fill) fill.style.width = `${(mp / maxMp) * 100}%`;
512|480|480|440|440|  if (text) text.textContent = `${Math.round(mp)}/${maxMp}`;
513|481|481|441|441|}
514|482|482|442|442|
515|483|483|443|443|// ============================
516|484|484|444|444|// CLICK TO MOVE
517|485|485|445|445|// ============================
518|486|486|446|446|canvas.addEventListener('click', (e) => {
519|487|487|447|447|  if (!state.connected || !state.player) return;
520|488|488|448|448|  // Don't move if dialogue is open
521|489|489|449|449|  if (state.dialogue.container.style.display === 'block') return;
522|490|490|450|450|
523|491|491|451|451|  const mouse = new THREE.Vector2(
524|492|492|452|452|    (e.clientX / window.innerWidth) * 2 - 1,
525|493|493|453|453|    -(e.clientY / window.innerHeight) * 2 + 1
526|494|494|454|454|  );
527|495|495|455|455|
528|496|496|456|456|  const raycaster = new THREE.Raycaster();
529|497|497|457|457|  raycaster.setFromCamera(mouse, state.camera);
530|498|498|458|458|
531|499|499|459|459|  const ground = state.scene.getObjectByName('ground');
532|500|500|460|460|  if (!ground) return;
533|501|501|461|461|
534|502|502|462|462|  const intersects = raycaster.intersectObject(ground);
535|503|503|463|463|  if (intersects.length === 0) return;
536|504|504|464|464|
537|505|505|465|465|  const point = intersects[0].point;
538|506|506|466|466|
539|507|507|467|467|  // Check NPC proximity
540|508|508|468|468|  for (const npc of Object.values(state.npcs)) {
541|509|509|469|469|    if (npc.position.distanceTo(point) < 2) {
542|510|510|470|470|      state.ws.send(JSON.stringify({ type: 'interact_npc', npcId: npc.userData.id }));
543|511|511|471|471|      return;
544|512|512|472|472|    }
545|513|513|473|473|  }
546|514|514|474|474|
547|515|515|475|475|  // Check Monster proximity — attack
548|516|516|476|476|  for (const mob of Object.values(state.monsters)) {
549|517|517|477|477|    if (mob.position.distanceTo(point) < 2) {
550|518|518|478|478|      state.ws.send(JSON.stringify({ type: 'attack', monsterId: mob.userData.id }));
551|519|519|479|479|      // Face the monster
552|520|520|480|480|      const model = state.players[state.playerId];
553|521|521|481|481|      if (model) model.lookAt(mob.position);
554|522|522|482|482|      return;
555|523|523|483|483|    }
556|524|524|484|484|  }
557|525|525|485|485|
558|526|526|486|486|  state.targetPos = new THREE.Vector3(point.x, 0, point.z);
559|527|527|487|487|});
560|528|528|488|488|
561|529|529|489|489|// ============================
562|530|530|490|490|// SMOOTH MOVEMENT
563|531|531|491|491|// ============================
564|532|532|492|492|function updateMovement() {
565|533|533|493|493|  if (!state.targetPos) return;
566|534|534|494|494|  const model = state.players[state.playerId];
567|535|535|495|495|  if (!model) return;
568|536|536|496|496|
569|537|537|497|497|  const dir = new THREE.Vector3().subVectors(state.targetPos, model.position);
570|538|538|498|498|  if (dir.length() < 0.1) {
571|539|539|499|499|    model.position.copy(state.targetPos);
572|540|540|500|500|    state.ws.send(JSON.stringify({ type: 'move', x: state.targetPos.x, y: 0, z: state.targetPos.z }));
573|541|541|501|501|    state.targetPos = null;
574|542|542|502|502|    return;
575|543|543|503|503|  }
576|544|544|504|504|
577|545|545|505|505|  dir.normalize().multiplyScalar(0.15);
578|546|546|506|506|  model.position.add(dir);
579|547|547|507|507|  model.lookAt(state.targetPos);
580|548|548|508|508|
581|549|549|509|509|  state.ws.send(JSON.stringify({
582|550|550|510|510|    type: 'move',
583|551|551|511|511|    x: model.position.x,
584|552|552|512|512|    y: 0,
585|553|553|513|513|    z: model.position.z,
586|554|554|514|514|  }));
587|555|555|515|515|}
588|556|556|516|516|
589|557|557|517|517|// ============================
590|558|558|518|518|// CHAT INPUT
591|559|559|519|519|// ============================
592|560|560|520|520|document.getElementById('chat-input').addEventListener('keydown', (e) => {
593|561|561|521|521|  if (e.key === 'Enter') {
594|562|562|522|522|    const msg = e.target.value.trim();
595|563|563|523|523|    if (msg && state.connected) {
596|564|564|524|524|      state.ws.send(JSON.stringify({ type: 'chat', message: msg }));
597|565|565|525|525|      addChatMessage(state.player?.name || 'You', msg);
598|566|566|526|526|      e.target.value = '';
599|567|567|527|527|    }
600|568|568|528|528|  }
601|569|569|529|529|});
602|570|570|530|530|
603|571|571|531|531|// ============================
604|572|572|532|532|// START GAME
605|573|573|533|533|// ============================
606|574|574|534|534|document.getElementById('start-game').addEventListener('click', () => {
607|575|575|535|535|  const name = document.getElementById('name-input').value.trim();
608|576|576|536|536|  if (name) connectWebSocket(name, null);
609|577|577|537|537|});
610|578|578|538|538|
611|579|579|539|539|// ============================
612|580|580|540|540|// GAME LOOP
613|581|581|541|541|// ============================
614|582|582|542|542|function gameLoop() {
615|583|583|543|543|  requestAnimationFrame(gameLoop);
616|584|584|544|544|  updateMovement();
617|585|585|545|545|
618|586|586|546|546|  const playerModel = state.players[state.playerId];
619|587|587|547|547|  if (state.targetPos) animateWalk(playerModel, 1);
620|588|588|548|548|  else stopWalk(playerModel);
621|589|589|549|549|
622|590|590|550|550|  if (state.previewModel) {
623|591|591|551|551|    state.previewModel.rotation.y += 0.01;
624|592|592|552|552|    state.previewRenderer.render(state.previewScene, state.previewCamera);
625|593|593|553|553|  }
626|594|594|554|554|
627|595|595|555|555|  if (playerModel) {
628|596|596|556|556|    const t = playerModel.position;
629|597|597|557|557|    state.camera.position.x += (t.x - state.camera.position.x) * 0.05;
630|598|598|558|558|    state.camera.position.z += (t.z + 20 - state.camera.position.z) * 0.05;
631|599|599|559|559|    state.camera.lookAt(t.x, t.y + 1, t.z);
632|600|600|560|560|  }
633|601|601|561|561|
634|602|602|562|562|  // Monster animation
635|603|603|563|563|  const time = Date.now() * 0.001;
636|604|604|564|564|  Object.values(state.monsters).forEach(m => animateMonster(m, time));
637|605|605|565|565|
638|606|606|566|566|  if (state.scene && state.camera && state.renderer) {
639|607|607|567|567|    state.renderer.render(state.scene, state.camera);
640|608|608|568|568|  }
641|609|609|569|569|}
642|610|610|570|570|
643|611|611|571|571|// ============================
644|612|612|572|572|// BOOT
645|613|613|573|573|// ============================
646|614|614|574|574|function boot() {
647|615|615|575|575|  initScene();
648|616|616|576|576|  initPreview();
649|617|617|577|577|  initCustomization();
650|618|618|578|578|  gameLoop();
651|619|619|579|579|  setTimeout(() => {
652|620|620|580|580|    loadingScreen.style.display = 'none';
653|621|621|581|581|    loginScreen.style.display = 'flex';
654|622|622|582|582|  }, 1500);
655|623|623|583|583|}
656|624|624|584|584|
657|625|625|585|585|boot();
658|626|626|586|586|