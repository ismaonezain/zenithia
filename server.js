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
11|
12|const app = express();
13|const server = http.createServer(app);
14|const wss = new WebSocketServer({ server });
15|
16|app.use(express.static(path.join(__dirname, 'public')));
17|
18|// --- World State ---
19|function createFreshWorld() {
20|  return { players: {}, npcs: initNPCs(), monsters: {}, time: Date.now(), region: 'willowmere' };
21|}
22|
23|function loadWorld() {
24|  try {
25|    if (fs.existsSync(SAVE_FILE)) return JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
26|  } catch (e) { console.error('[WARN] Load failed:', e.message); }
27|  return createFreshWorld();
28|}
29|
30|function saveWorld() {
31|  try {
32|    if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
33|    const toSave = { ...world, players: {} };
34|    fs.writeFileSync(SAVE_FILE, JSON.stringify(toSave, null, 2));
35|  } catch (e) { console.error('[WARN] Save failed:', e.message); }
36|}
37|
38|function initNPCs() {
39|  return {
40|    elder_maren:     { id: 'elder_maren', name: 'Elder Maren', title: 'Village Elder', x: 0, z: -15 },
41|    sir_gendut:      { id: 'sir_gendut', name: 'Sir Gendut', title: 'Merchant', x: 8, z: 0 },
42|    miss_lira:       { id: 'miss_lira', name: 'Miss Lira', title: 'Aspiring Adventurer', x: -8, z: 3 },
43|    mr_tani:         { id: 'mr_tani', name: 'Mr. Tani', title: 'Farmer', x: -18, z: 12 },
44|    mrs_ningsih:     { id: 'mrs_ningsih', name: 'Mrs. Ningsih', title: 'Cook', x: 8, z: 8 },
45|    kris:            { id: 'kris', name: 'Kris', title: 'Troublemaker', x: -3, z: -10 },
46|    guard_ren:       { id: 'guard_ren', name: 'Guard Ren', title: 'Gate Guard', x: 0, z: 22 },
47|    herbalist_sari:  { id: 'herbalist_sari', name: 'Herbalist Sari', title: 'Herbalist', x: 18, z: -8 },
48|  };
49|}
50|
51|let world = loadWorld();
52|const connectedPlayers = {};
53|
54|// --- Player Management ---
55|function createPlayer(playerId, name, wallet) {
56|  if (world.players[playerId]) return world.players[playerId];
57|  const player = {
58|    id: playerId, name: name || 'Adventurer', wallet: wallet || null,
59|    x: 0, y: 0, z: 0, class: null, className: null, level: 1, xp: 0,
60|    hp: 100, maxHp: 100, mp: 50, maxMp: 50, atk: 10, def: 5, spd: 10, crit: 0.05,
61|    zen: 50, inventory: [], quests: {}, reputation: {}, region: 'willowmere',
62|    createdAt: Date.now(), lastLogin: Date.now(),
63|  };
64|  world.players[playerId] = player;
65|  return player;
66|}
67|
68|// --- Monster Spawning ---
69|let monsterIdCounter = 0;
70|
71|function spawnMonsters() {
72|  Object.entries(MONSTERS).forEach(([type, data]) => {
73|    const existing = Object.values(world.monsters).filter(m => m.type === type);
74|    const toSpawn = data.maxSpawn - existing.length;
75|    if (toSpawn <= 0) return;
76|
77|    for (let i = 0; i < toSpawn; i++) {
78|      const area = data.spawnAreas[Math.floor(Math.random() * data.spawnAreas.length)];
79|      const angle = Math.random() * Math.PI * 2;
80|      const dist = Math.random() * area.radius;
81|      const monster = {
82|        id: `mob_${++monsterIdCounter}`,
83|        type,
84|        name: data.name,
85|        x: area.x + Math.cos(angle) * dist,
86|        y: 0,
87|        z: area.z + Math.sin(angle) * dist,
88|        hp: data.hp,
89|        maxHp: data.hp,
90|        atk: data.atk,
91|        def: data.def,
92|        spd: data.spd,
93|        level: data.level,
94|        alive: true,
95|        target: null,
96|        state: 'idle', // idle, chase, attack, retreat
97|        lastAttack: 0,
98|      };
99|      world.monsters[monster.id] = monster;
100|    }
101|  });
102|}
103|
104|function respawnMonster(monster) {
105|  const data = MONSTERS[monster.type];
106|  if (!data) return;
107|  const area = data.spawnAreas[Math.floor(Math.random() * data.spawnAreas.length)];
108|  const angle = Math.random() * Math.PI * 2;
109|  const dist = Math.random() * area.radius;
110|  monster.x = area.x + Math.cos(angle) * dist;
111|  monster.z = area.z + Math.sin(angle) * dist;
112|  monster.hp = data.hp;
113|  monster.alive = true;
114|  monster.target = null;
115|  monster.state = 'idle';
116|}
117|
118|// Spawn initial monsters
119|spawnMonsters();
120|
121|// Respawn timer
122|setInterval(() => {
123|  Object.values(world.monsters).forEach(m => {
124|    if (!m.alive && !m.respawnAt) {
125|      m.respawnAt = Date.now() + (MONSTERS[m.type]?.respawnTime || 30) * 1000;
126|    }
127|    if (!m.alive && m.respawnAt && Date.now() >= m.respawnAt) {
128|      respawnMonster(m);
129|      delete m.respawnAt;
130|      broadcast({ type: 'monster_spawn', monster: sanitizeMonster(m) });
131|    }
132|  });
133|}, 5000);
134|
135|// --- Monster AI (server-side) ---
136|setInterval(() => {
137|  const now = Date.now();
138|  Object.values(world.monsters).forEach(m => {
139|    if (!m.alive) return;
140|    const data = MONSTERS[m.type];
141|    if (!data) return;
142|
143|    // Find nearest player
144|    let nearest = null;
145|    let nearestDist = Infinity;
146|    Object.values(connectedPlayers).forEach(p => {
147|      const dx = p.x - m.x;
148|      const dz = p.z - m.z;
149|      const dist = Math.sqrt(dx * dx + dz * dz);
150|      if (dist < nearestDist) {
151|        nearestDist = dist;
152|        nearest = p;
153|      }
154|    });
155|
156|    if (!nearest) { m.state = 'idle'; return; }
157|
158|    // Behavior logic
159|    switch (data.behavior) {
160|      case 'passive':
161|        if (m.state === 'idle' && nearestDist < data.aggroRange && m.target) {
162|          m.state = 'chase';
163|        }
164|        break;
165|      case 'aggressive':
166|        if (m.state === 'idle' && nearestDist < data.aggroRange) {
167|          m.state = 'chase';
168|          m.target = nearest.id;
169|        }
170|        break;
171|      case 'pack':
172|        if (nearestDist < data.aggroRange) {
173|          m.state = 'chase';
174|          m.target = nearest.id;
175|        }
176|        break;
177|      default:
178|        if (nearestDist < data.aggroRange) {
179|          m.state = 'chase';
180|          m.target = nearest.id;
181|        }
182|    }
183|
184|    // Chase
185|    if (m.state === 'chase' && nearest) {
186|      const dx = nearest.x - m.x;
187|      const dz = nearest.z - m.z;
188|      const dist = Math.sqrt(dx * dx + dz * dz);
189|      if (dist > data.attackRange) {
190|        const speed = data.spd * 0.05;
191|        m.x += (dx / dist) * speed;
192|        m.z += (dz / dist) * speed;
193|        broadcast({ type: 'monster_move', monsterId: m.id, x: m.x, z: m.z });
194|      } else if (now - m.lastAttack > data.attackSpeed * 1000) {
195|        // Attack player
196|        m.state = 'attack';
197|        m.lastAttack = now;
198|        const player = connectedPlayers[nearest.ws];
199|        if (player) {
200|          const dmg = Math.max(1, m.atk - Math.floor(player.def * 0.6));
201|          player.hp = Math.max(0, player.hp - dmg);
202|          nearest.ws.send(JSON.stringify({ type: 'player_hit', damage: dmg, hp: player.hp, maxHp: player.maxHp }));
203|          broadcast({ type: 'monster_attack', monsterId: m.id, targetId: nearest.id, damage: dmg });
204|          if (player.hp <= 0) {
205|            // Player died — respawn at village
206|            player.hp = player.maxHp;
207|            player.x = 0;
208|            player.z = 0;
209|            nearest.ws.send(JSON.stringify({ type: 'player_died', hp: player.hp }));
210|            m.state = 'idle';
211|            m.target = null;
212|          }
213|        }
214|        m.state = 'chase';
215|      }
216|    }
217|
218|    // Retreat check
219|    if (m.hp / data.hp < data.retreatHp && m.state !== 'retreat') {
220|      m.state = 'retreat';
221|      m.target = null;
222|    }
223|    if (m.state === 'retreat') {
224|      const dx = m.x - (nearest?.x || 0);
225|      const dz = m.z - (nearest?.z || 0);
226|      const dist = Math.sqrt(dx * dx + dz * dz) || 1;
227|      m.x += (dx / dist) * data.spd * 0.03;
228|      m.z += (dz / dist) * data.spd * 0.03;
229|      if (nearestDist > data.aggroRange * 1.5) {
230|        m.state = 'idle';
231|        m.hp = Math.min(m.hp + data.hp * 0.1, data.hp); // Heal when retreated
232|      }
233|      broadcast({ type: 'monster_move', monsterId: m.id, x: m.x, z: m.z });
234|    }
235|  });
236|}, 200);
237|
238|// --- Combat Handler ---
239|function handleAttack(ws, playerId, msg) {
240|  const player = connectedPlayers[ws];
241|  const monster = world.monsters[msg.monsterId];
242|  if (!player || !monster || !monster.alive) return;
243|
244|  const data = MONSTERS[monster.type];
245|  if (!data) return;
246|
247|  // Check distance
248|  const dx = player.x - monster.x;
249|  const dz = player.z - monster.z;
250|  const dist = Math.sqrt(dx * dx + dz * dz);
251|  if (dist > 3) return; // too far
252|
253|  // Wind Sprite immune to melee
254|  if (data.immuneToMelee) {
255|    ws.send(JSON.stringify({ type: 'combat_message', text: `${monster.name} is immune to melee!` }));
256|    return;
257|  }
258|
259|  // Calculate damage
260|  const isCrit = Math.random() < player.crit;
261|  let dmg = Math.max(1, player.atk - Math.floor(monster.def * 0.6));
262|  if (isCrit) dmg = Math.floor(dmg * 1.5);
263|
264|  monster.hp -= dmg;
265|
266|  // Broadcast damage
267|  broadcast({
268|    type: 'monster_hit',
269|    monsterId: monster.id,
270|    damage: dmg,
271|    isCrit,
272|    hp: monster.hp,
273|    maxHp: monster.maxHp,
274|  });
275|
276|  // Monster aggro
277|  if (monster.state === 'idle') {
278|    monster.state = 'chase';
279|    monster.target = playerId;
280|  }
281|
282|  // Monster died
283|  if (monster.hp <= 0) {
284|    monster.alive = false;
285|    monster.hp = 0;
286|
287|    // XP + Gold reward
288|    const xpGain = data.xp;
289|    const zenGain = data.gold[0] + Math.floor(Math.random() * (data.gold[1] - data.gold[0]));
290|    player.xp += xpGain;
291|    // Zen only from item drops, not monster kills
292|
293|    // Level up check
294|    const xpNeeded = 100 + (player.level - 1) * 200;
295|    if (player.xp >= xpNeeded) {
296|      player.level++;
297|      player.xp -= xpNeeded;
298|      player.maxHp += 10;
299|      player.hp = player.maxHp;
300|      player.maxMp += 5;
301|      player.mp = player.maxMp;
302|      ws.send(JSON.stringify({ type: 'level_up', level: player.level, maxHp: player.maxHp, maxMp: player.maxMp }));
303|    }
304|
305|    ws.send(JSON.stringify({
306|      type: 'monster_killed',
307|      monsterId: monster.id,
308|      monsterName: monster.name,
309|      xp: xpGain,
310|      zen: zenGain,
311|      hp: player.hp,
312|      maxHp: player.maxHp,
313|      mp: player.mp,
314|      maxMp: player.maxMp,
315|    }));
316|
317|    broadcast({ type: 'monster_died', monsterId: monster.id });
318|  }
319|}
320|
321|// --- WebSocket ---
322|wss.on('connection', (ws) => {
323|  const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
324|  console.log(`[CONNECT] ${playerId}`);
325|  ws.playerId = playerId;
326|
327|  ws.send(JSON.stringify({ type: 'welcome', playerId, world: { time: Date.now(), region: 'willowmere' } }));
328|
329|  ws.on('message', (data) => {
330|    try { handleMessage(ws, playerId, JSON.parse(data)); }
331|    catch (e) { console.error('[ERROR]', e.message); }
332|  });
333|
334|  ws.on('close', () => {
335|    console.log(`[DISCONNECT] ${playerId}`);
336|    delete connectedPlayers[ws];
337|    broadcast({ type: 'player_left', playerId });
338|  });
339|});
340|
341|function handleMessage(ws, playerId, msg) {
342|  switch (msg.type) {
343|    case 'join': {
344|      const player = createPlayer(playerId, msg.name, msg.wallet);
345|      connectedPlayers[ws] = player;
346|      ws.playerId = playerId;
347|      ws.send(JSON.stringify({
348|        type: 'joined', player, npcs: world.npcs,
349|        onlinePlayers: Object.values(connectedPlayers).filter(p => p.id !== playerId),
350|        monsters: Object.values(world.monsters).filter(m => m.alive).map(sanitizeMonster),
351|      }));
352|      broadcast({ type: 'player_joined', player }, ws);
353|      break;
354|    }
355|    case 'move': {
356|      const player = connectedPlayers[ws];
357|      if (player) {
358|        player.x = msg.x; player.y = msg.y; player.z = msg.z;
359|        broadcast({ type: 'player_moved', playerId, x: msg.x, y: msg.y, z: msg.z }, ws);
360|      }
361|      break;
362|    }
363|    case 'chat': {
364|      const player = connectedPlayers[ws];
365|      if (player) broadcast({ type: 'chat', playerId, name: player.name, message: (msg.message || '').slice(0, 200) });
366|      break;
367|    }
368|    case 'interact_npc': {
369|      const npc = world.npcs[msg.npcId];
370|      if (npc) ws.send(JSON.stringify({ type: 'npc_dialogue', npcId: npc.id, name: npc.name, title: npc.title }));
371|      break;
372|    }
373|    case 'attack': {
374|      handleAttack(ws, playerId, msg);
375|      break;
376|    }
377|    case 'save': saveWorld(); ws.send(JSON.stringify({ type: 'saved' })); break;
378|    default: console.log(`[WARN] Unknown: ${msg.type}`);
379|  }
380|}
381|
382|function sanitizeMonster(m) {
383|  return { id: m.id, type: m.type, name: m.name, x: m.x, y: m.y, z: m.z, hp: m.hp, maxHp: m.maxHp, level: m.level, alive: m.alive };
384|}
385|
386|function broadcast(data, exclude = null) {
387|  const payload = JSON.stringify(data);
388|  wss.clients.forEach(c => { if (c !== exclude && c.readyState === 1) c.send(payload); });
389|}
390|
391|// Auto-save
392|setInterval(() => { saveWorld(); console.log('[SAVE]'); }, 5 * 60 * 1000);
393|process.on('SIGINT', () => { saveWorld(); process.exit(0); });
394|process.on('SIGTERM', () => { saveWorld(); process.exit(0); });
395|
396|server.listen(PORT, () => {
397|  console.log(`\n⚔️  Zenithia Server running on http://localhost:${PORT}`);
398|  console.log(`📡 WebSocket on ws://localhost:${PORT}`);
399|  console.log(`🐾 ${Object.keys(MONSTERS).length} monster types loaded`);
400|  console.log(`💾 Auto-save every 5 minutes\n`);
401|});
402|