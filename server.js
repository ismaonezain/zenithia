1|const express = require('express');
2|const http = require('http');
3|const { WebSocketServer } = require('ws');
4|const path = require('path');
5|const fs = require('fs');
6|
7|const PORT = 2567;
8|const SAVE_DIR = path.join(__dirname, 'data');
9|const SAVE_FILE = path.join(SAVE_DIR, 'world.json');
10|const MONSTERS = require('./shared/monsters');
11|const { ITEMS, LOOT_TABLES } = require('./shared/items');
12|
13|const app = express();
14|const server = http.createServer(app);
15|const wss = new WebSocketServer({ server });
16|
17|app.use(express.static(path.join(__dirname, 'public')));
18|
19|// --- World State ---
20|function createFreshWorld() {
21|  return { players: {}, npcs: initNPCs(), monsters: {}, time: Date.now(), region: 'willowmere' };
22|}
23|
24|function loadWorld() {
25|  try {
26|    if (fs.existsSync(SAVE_FILE)) return JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
27|  } catch (e) { console.error('[WARN] Load failed:', e.message); }
28|  return createFreshWorld();
29|}
30|
31|function saveWorld() {
32|  try {
33|    if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
34|    const toSave = { ...world, players: {} };
35|    fs.writeFileSync(SAVE_FILE, JSON.stringify(toSave, null, 2));
36|  } catch (e) { console.error('[WARN] Save failed:', e.message); }
37|}
38|
39|function initNPCs() {
40|  return {
41|    elder_maren:     { id: 'elder_maren', name: 'Elder Maren', title: 'Village Elder', x: 0, z: -15 },
42|    sir_gendut:      { id: 'sir_gendut', name: 'Sir Gendut', title: 'Merchant', x: 8, z: 0 },
43|    miss_lira:       { id: 'miss_lira', name: 'Miss Lira', title: 'Aspiring Adventurer', x: -8, z: 3 },
44|    mr_tani:         { id: 'mr_tani', name: 'Mr. Tani', title: 'Farmer', x: -18, z: 12 },
45|    mrs_ningsih:     { id: 'mrs_ningsih', name: 'Mrs. Ningsih', title: 'Cook', x: 8, z: 8 },
46|    kris:            { id: 'kris', name: 'Kris', title: 'Troublemaker', x: -3, z: -10 },
47|    guard_ren:       { id: 'guard_ren', name: 'Guard Ren', title: 'Gate Guard', x: 0, z: 22 },
48|    herbalist_sari:  { id: 'herbalist_sari', name: 'Herbalist Sari', title: 'Herbalist', x: 18, z: -8 },
49|  };
50|}
51|
52|let world = loadWorld();
53|const connectedPlayers = {};
54|
55|// --- Player Management ---
56|function createPlayer(playerId, name, wallet) {
57|  if (world.players[playerId]) return world.players[playerId];
58|  const player = {
59|    id: playerId, name: name || 'Adventurer', wallet: wallet || null,
60|    x: 0, y: 0, z: 0, class: null, className: null, level: 1, xp: 0,
61|    hp: 100, maxHp: 100, mp: 50, maxMp: 50, atk: 10, def: 5, spd: 10, crit: 0.05,
62|    zen: 50, inventory: [], quests: {}, reputation: {}, region: 'willowmere',
63|    createdAt: Date.now(), lastLogin: Date.now(),
64|  };
65|  world.players[playerId] = player;
66|  return player;
67|}
68|
69|// --- Monster Spawning ---
70|let monsterIdCounter = 0;
71|
72|function spawnMonsters() {
73|  Object.entries(MONSTERS).forEach(([type, data]) => {
74|    const existing = Object.values(world.monsters).filter(m => m.type === type);
75|    const toSpawn = data.maxSpawn - existing.length;
76|    if (toSpawn <= 0) return;
77|
78|    for (let i = 0; i < toSpawn; i++) {
79|      const area = data.spawnAreas[Math.floor(Math.random() * data.spawnAreas.length)];
80|      const angle = Math.random() * Math.PI * 2;
81|      const dist = Math.random() * area.radius;
82|      const monster = {
83|        id: `mob_${++monsterIdCounter}`,
84|        type,
85|        name: data.name,
86|        x: area.x + Math.cos(angle) * dist,
87|        y: 0,
88|        z: area.z + Math.sin(angle) * dist,
89|        hp: data.hp,
90|        maxHp: data.hp,
91|        atk: data.atk,
92|        def: data.def,
93|        spd: data.spd,
94|        level: data.level,
95|        alive: true,
96|        target: null,
97|        state: 'idle', // idle, chase, attack, retreat
98|        lastAttack: 0,
99|      };
100|      world.monsters[monster.id] = monster;
101|    }
102|  });
103|}
104|
105|function respawnMonster(monster) {
106|  const data = MONSTERS[monster.type];
107|  if (!data) return;
108|  const area = data.spawnAreas[Math.floor(Math.random() * data.spawnAreas.length)];
109|  const angle = Math.random() * Math.PI * 2;
110|  const dist = Math.random() * area.radius;
111|  monster.x = area.x + Math.cos(angle) * dist;
112|  monster.z = area.z + Math.sin(angle) * dist;
113|  monster.hp = data.hp;
114|  monster.alive = true;
115|  monster.target = null;
116|  monster.state = 'idle';
117|}
118|
119|// Spawn initial monsters
120|spawnMonsters();
121|
122|// Respawn timer
123|setInterval(() => {
124|  Object.values(world.monsters).forEach(m => {
125|    if (!m.alive && !m.respawnAt) {
126|      m.respawnAt = Date.now() + (MONSTERS[m.type]?.respawnTime || 30) * 1000;
127|    }
128|    if (!m.alive && m.respawnAt && Date.now() >= m.respawnAt) {
129|      respawnMonster(m);
130|      delete m.respawnAt;
131|      broadcast({ type: 'monster_spawn', monster: sanitizeMonster(m) });
132|    }
133|  });
134|}, 5000);
135|
136|// --- Monster AI (server-side) ---
137|setInterval(() => {
138|  const now = Date.now();
139|  Object.values(world.monsters).forEach(m => {
140|    if (!m.alive) return;
141|    const data = MONSTERS[m.type];
142|    if (!data) return;
143|
144|    // Find nearest player
145|    let nearest = null;
146|    let nearestDist = Infinity;
147|    Object.values(connectedPlayers).forEach(p => {
148|      const dx = p.x - m.x;
149|      const dz = p.z - m.z;
150|      const dist = Math.sqrt(dx * dx + dz * dz);
151|      if (dist < nearestDist) {
152|        nearestDist = dist;
153|        nearest = p;
154|      }
155|    });
156|
157|    if (!nearest) { m.state = 'idle'; return; }
158|
159|    // Behavior logic
160|    switch (data.behavior) {
161|      case 'passive':
162|        if (m.state === 'idle' && nearestDist < data.aggroRange && m.target) {
163|          m.state = 'chase';
164|        }
165|        break;
166|      case 'aggressive':
167|        if (m.state === 'idle' && nearestDist < data.aggroRange) {
168|          m.state = 'chase';
169|          m.target = nearest.id;
170|        }
171|        break;
172|      case 'pack':
173|        if (nearestDist < data.aggroRange) {
174|          m.state = 'chase';
175|          m.target = nearest.id;
176|        }
177|        break;
178|      default:
179|        if (nearestDist < data.aggroRange) {
180|          m.state = 'chase';
181|          m.target = nearest.id;
182|        }
183|    }
184|
185|    // Chase
186|    if (m.state === 'chase' && nearest) {
187|      const dx = nearest.x - m.x;
188|      const dz = nearest.z - m.z;
189|      const dist = Math.sqrt(dx * dx + dz * dz);
190|      if (dist > data.attackRange) {
191|        const speed = data.spd * 0.05;
192|        m.x += (dx / dist) * speed;
193|        m.z += (dz / dist) * speed;
194|        broadcast({ type: 'monster_move', monsterId: m.id, x: m.x, z: m.z });
195|      } else if (now - m.lastAttack > data.attackSpeed * 1000) {
196|        // Attack player
197|        m.state = 'attack';
198|        m.lastAttack = now;
199|        const player = connectedPlayers[nearest.ws];
200|        if (player) {
201|          const dmg = Math.max(1, m.atk - Math.floor(player.def * 0.6));
202|          player.hp = Math.max(0, player.hp - dmg);
203|          nearest.ws.send(JSON.stringify({ type: 'player_hit', damage: dmg, hp: player.hp, maxHp: player.maxHp }));
204|          broadcast({ type: 'monster_attack', monsterId: m.id, targetId: nearest.id, damage: dmg });
205|          if (player.hp <= 0) {
206|            // Player died — respawn at village
207|            player.hp = player.maxHp;
208|            player.x = 0;
209|            player.z = 0;
210|            nearest.ws.send(JSON.stringify({ type: 'player_died', hp: player.hp }));
211|            m.state = 'idle';
212|            m.target = null;
213|          }
214|        }
215|        m.state = 'chase';
216|      }
217|    }
218|
219|    // Retreat check
220|    if (m.hp / data.hp < data.retreatHp && m.state !== 'retreat') {
221|      m.state = 'retreat';
222|      m.target = null;
223|    }
224|    if (m.state === 'retreat') {
225|      const dx = m.x - (nearest?.x || 0);
226|      const dz = m.z - (nearest?.z || 0);
227|      const dist = Math.sqrt(dx * dx + dz * dz) || 1;
228|      m.x += (dx / dist) * data.spd * 0.03;
229|      m.z += (dz / dist) * data.spd * 0.03;
230|      if (nearestDist > data.aggroRange * 1.5) {
231|        m.state = 'idle';
232|        m.hp = Math.min(m.hp + data.hp * 0.1, data.hp); // Heal when retreated
233|      }
234|      broadcast({ type: 'monster_move', monsterId: m.id, x: m.x, z: m.z });
235|    }
236|  });
237|}, 200);
238|
239|// --- Combat Handler ---
240|function handleAttack(ws, playerId, msg) {
241|  const player = connectedPlayers[ws];
242|  const monster = world.monsters[msg.monsterId];
243|  if (!player || !monster || !monster.alive) return;
244|
245|  const data = MONSTERS[monster.type];
246|  if (!data) return;
247|
248|  // Check distance
249|  const dx = player.x - monster.x;
250|  const dz = player.z - monster.z;
251|  const dist = Math.sqrt(dx * dx + dz * dz);
252|  if (dist > 3) return; // too far
253|
254|  // Wind Sprite immune to melee
255|  if (data.immuneToMelee) {
256|    ws.send(JSON.stringify({ type: 'combat_message', text: `${monster.name} is immune to melee!` }));
257|    return;
258|  }
259|
260|  // Calculate damage
261|  const isCrit = Math.random() < player.crit;
262|  let dmg = Math.max(1, player.atk - Math.floor(monster.def * 0.6));
263|  if (isCrit) dmg = Math.floor(dmg * 1.5);
264|
265|  monster.hp -= dmg;
266|
267|  // Broadcast damage
268|  broadcast({
269|    type: 'monster_hit',
270|    monsterId: monster.id,
271|    damage: dmg,
272|    isCrit,
273|    hp: monster.hp,
274|    maxHp: monster.maxHp,
275|  });
276|
277|  // Monster aggro
278|  if (monster.state === 'idle') {
279|    monster.state = 'chase';
280|    monster.target = playerId;
281|  }
282|
283|  // Monster died
284|  if (monster.hp <= 0) {
285|    monster.alive = false;
286|    monster.hp = 0;
287|
288|    // XP + Gold reward
289|    const xpGain = data.xp;
290|    const zenGain = data.gold[0] + Math.floor(Math.random() * (data.gold[1] - data.gold[0]));
291|    player.xp += xpGain;
292|    // Zen only from item drops, not monster kills
293|
294|    // Level up check
295|    const xpNeeded = 100 + (player.level - 1) * 200;
296|    if (player.xp >= xpNeeded) {
297|      player.level++;
298|      player.xp -= xpNeeded;
299|      player.maxHp += 10;
300|      player.hp = player.maxHp;
301|      player.maxMp += 5;
302|      player.mp = player.maxMp;
303|      ws.send(JSON.stringify({ type: 'level_up', level: player.level, maxHp: player.maxHp, maxMp: player.maxMp }));
304|    }
305|
306|    ws.send(JSON.stringify({
307|      type: 'monster_killed',
308|      monsterId: monster.id,
309|      monsterName: monster.name,
310|      xp: xpGain,
311|      zen: zenGain,
312|      hp: player.hp,
313|      maxHp: player.maxHp,
314|      mp: player.mp,
315|      maxMp: player.maxMp,
316|    }));
317|
318|    broadcast({ type: 'monster_died', monsterId: monster.id });
319|  }
320|}
321|
322|
323|// --- Loot System ---
324|function rollLoot(monsterType) {
325|  const table = LOOT_TABLES[monsterType];
326|  if (!table) return [];
327|  const drops = [];
328|  table.forEach(entry => {
329|    if (Math.random() < entry.chance) {
330|      const qty = entry.quantity[0] + Math.floor(Math.random() * (entry.quantity[1] - entry.quantity[0] + 1));
331|      const itemDef = ITEMS[entry.itemId];
332|      if (itemDef) {
333|        drops.push({
334|          id: entry.itemId,
335|          name: itemDef.name,
336|          type: itemDef.type,
337|          rarity: itemDef.rarity,
338|          quantity: qty,
339|          icon: itemDef.icon,
340|        });
341|      }
342|    }
343|  });
344|  return drops;
345|}
346|
347|function addLootToPlayer(player, loot) {
348|  if (!player.inventory) player.inventory = [];
349|  loot.forEach(item => {
350|    const existing = player.inventory.find(i => i.id === item.id);
351|    if (existing) {
352|      existing.quantity = (existing.quantity || 1) + item.quantity;
353|    } else {
354|      player.inventory.push({ ...item });
355|    }
356|  });
357|}
358|
359|// --- WebSocket ---
360|wss.on('connection', (ws) => {
361|  const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
362|  console.log(`[CONNECT] ${playerId}`);
363|  ws.playerId = playerId;
364|
365|  ws.send(JSON.stringify({ type: 'welcome', playerId, world: { time: Date.now(), region: 'willowmere' } }));
366|
367|  ws.on('message', (data) => {
368|    try { handleMessage(ws, playerId, JSON.parse(data)); }
369|    catch (e) { console.error('[ERROR]', e.message); }
370|  });
371|
372|  ws.on('close', () => {
373|    console.log(`[DISCONNECT] ${playerId}`);
374|    delete connectedPlayers[ws];
375|    broadcast({ type: 'player_left', playerId });
376|  });
377|});
378|
379|function handleMessage(ws, playerId, msg) {
380|  switch (msg.type) {
381|    case 'join': {
382|      const player = createPlayer(playerId, msg.name, msg.wallet);
383|      connectedPlayers[ws] = player;
384|      ws.playerId = playerId;
385|      ws.send(JSON.stringify({
386|        type: 'joined', player, npcs: world.npcs,
387|        onlinePlayers: Object.values(connectedPlayers).filter(p => p.id !== playerId),
388|        monsters: Object.values(world.monsters).filter(m => m.alive).map(sanitizeMonster),
389|      }));
390|      broadcast({ type: 'player_joined', player }, ws);
391|      break;
392|    }
393|    case 'move': {
394|      const player = connectedPlayers[ws];
395|      if (player) {
396|        player.x = msg.x; player.y = msg.y; player.z = msg.z;
397|        broadcast({ type: 'player_moved', playerId, x: msg.x, y: msg.y, z: msg.z }, ws);
398|      }
399|      break;
400|    }
401|    case 'chat': {
402|      const player = connectedPlayers[ws];
403|      if (player) broadcast({ type: 'chat', playerId, name: player.name, message: (msg.message || '').slice(0, 200) });
404|      break;
405|    }
406|    case 'interact_npc': {
407|      const npc = world.npcs[msg.npcId];
408|      if (npc) ws.send(JSON.stringify({ type: 'npc_dialogue', npcId: npc.id, name: npc.name, title: npc.title }));
409|      break;
410|    }
411|    case 'attack': {
412|      handleAttack(ws, playerId, msg);
413|      break;
414|    }
415|    case 'use_item': {
416|      const player = connectedPlayers[ws];
417|      if (player) {
418|        const itemIdx = player.inventory.findIndex(i => i.id === msg.itemId);
419|        if (itemIdx >= 0) {
420|          const item = player.inventory[itemIdx];
421|          const itemDef = ITEMS[item.id];
422|          if (itemDef?.healAmount) {
423|            player.hp = Math.min(player.maxHp, player.hp + itemDef.healAmount);
424|          }
425|          if (itemDef?.manaAmount) {
426|            player.mp = Math.min(player.maxMp, player.mp + itemDef.manaAmount);
427|          }
428|          // Remove one quantity
429|          item.quantity = (item.quantity || 1) - 1;
430|          if (item.quantity <= 0) player.inventory.splice(itemIdx, 1);
431|          ws.send(JSON.stringify({ type: 'item_used', itemId: msg.itemId, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, inventory: player.inventory }));
432|        }
433|      }
434|      break;
435|    }
436|    case 'equip_item': {
437|      const player = connectedPlayers[ws];
438|      if (player) {
439|        const itemIdx = player.inventory.findIndex(i => i.id === msg.itemId);
440|        if (itemIdx >= 0) {
441|          const item = player.inventory[itemIdx];
442|          const itemDef = ITEMS[item.id];
443|          if (itemDef?.slot) {
444|            // Unequip current
445|            if (player.equipment[itemDef.slot]) {
446|              player.inventory.push(player.equipment[itemDef.slot]);
447|            }
448|            // Equip new
449|            player.equipment[itemDef.slot] = player.inventory.splice(itemIdx, 1)[0];
450|            // Apply stats
451|            if (itemDef.atk) player.atk = 10 + itemDef.atk;
452|            if (itemDef.def) player.def = 5 + itemDef.def;
453|            ws.send(JSON.stringify({ type: 'item_equipped', equipment: player.equipment, inventory: player.inventory, atk: player.atk, def: player.def }));
454|          }
455|        }
456|      }
457|      break;
458|    }
459|    case 'unequip_item': {
460|      const player = connectedPlayers[ws];
461|      if (player && player.equipment[msg.slot]) {
462|        player.inventory.push(player.equipment[msg.slot]);
463|        delete player.equipment[msg.slot];
464|        // Recalc stats
465|        player.atk = 10;
466|        player.def = 5;
467|        Object.values(player.equipment).forEach(e => {
468|          if (e && ITEMS[e.id]) {
469|            if (ITEMS[e.id].atk) player.atk += ITEMS[e.id].atk;
470|            if (ITEMS[e.id].def) player.def += ITEMS[e.id].def;
471|          }
472|        });
473|        ws.send(JSON.stringify({ type: 'item_unequipped', equipment: player.equipment, inventory: player.inventory, atk: player.atk, def: player.def }));
474|      }
475|      break;
476|    }
477|    case 'save': saveWorld(); ws.send(JSON.stringify({ type: 'saved' })); break;
478|    default: console.log(`[WARN] Unknown: ${msg.type}`);
479|  }
480|}
481|
482|function sanitizeMonster(m) {
483|  return { id: m.id, type: m.type, name: m.name, x: m.x, y: m.y, z: m.z, hp: m.hp, maxHp: m.maxHp, level: m.level, alive: m.alive };
484|}
485|
486|function broadcast(data, exclude = null) {
487|  const payload = JSON.stringify(data);
488|  wss.clients.forEach(c => { if (c !== exclude && c.readyState === 1) c.send(payload); });
489|}
490|
491|// Auto-save
492|setInterval(() => { saveWorld(); console.log('[SAVE]'); }, 5 * 60 * 1000);
493|process.on('SIGINT', () => { saveWorld(); process.exit(0); });
494|process.on('SIGTERM', () => { saveWorld(); process.exit(0); });
495|
496|server.listen(PORT, () => {
497|  console.log(`\n⚔️  Zenithia Server running on http://localhost:${PORT}`);
498|  console.log(`📡 WebSocket on ws://localhost:${PORT}`);
499|  console.log(`🐾 ${Object.keys(MONSTERS).length} monster types loaded`);
500|  console.log(`💾 Auto-save every 5 minutes\n`);
501|});
502|