const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nacl = require('tweetnacl');
const bs58 = require('bs58').default || require('bs58');

const PORT = process.env.PORT || 2567;
const SAVE_DIR = path.join(__dirname, 'data');
const SAVE_FILE = path.join(SAVE_DIR, 'world.json');
const MONSTERS = require('./shared/monsters');
const { ITEMS, LOOT_TABLES } = require('./shared/items');
const { QUESTS, NPC_QUESTS } = require('./shared/quests');
const { SHOPS } = require('./shared/shop');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

// --- CAPTCHA + SIWS (Sign In with Solana) ---
const nonces = new Map(); // wallet -> { nonce, captcha, expires }
const CAPTCHA_EXPIRY = 5 * 60 * 1000; // 5 min

function genCaptcha() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') { a = rand(1, 20); b = rand(1, 20); answer = a + b; }
  else if (op === '-') { a = rand(5, 30); b = rand(1, a); answer = a - b; }
  else { a = rand(2, 12); b = rand(2, 12); answer = a * b; }
  return { question: `${a} ${op} ${b} = ?`, answer };
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Get captcha challenge
app.get('/api/captcha', (req, res) => {
  const wallet = req.query.wallet;
  if (!wallet) return res.status(400).json({ error: 'wallet required' });

  const cap = genCaptcha();
  const nonce = crypto.randomBytes(16).toString('hex');
  const message = `Zenithia Login\n\nWallet: ${wallet}\nNonce: ${nonce}\nCaptcha: ${cap.answer}\n\nSign this message to verify your identity.`;

  nonces.set(wallet.toLowerCase(), {
    nonce,
    captchaAnswer: cap.answer,
    message,
    expires: Date.now() + CAPTCHA_EXPIRY,
  });

  res.json({ captcha: cap.question, nonce, message });
});

// Verify signature + captcha
app.post('/api/verify', express.json(), (req, res) => {
  const { wallet, signature, captchaAnswer } = req.body;
  console.log('[VERIFY]', { wallet: wallet?.slice(0, 8), sigLen: signature?.length, captchaAnswer });
  if (!wallet || !signature || captchaAnswer === undefined) {
    console.log('[VERIFY] Missing fields');
    return res.status(400).json({ error: 'wallet, signature, captchaAnswer required' });
  }

  const stored = nonces.get(wallet.toLowerCase());
  if (!stored) {
    console.log('[VERIFY] No nonce found for', wallet.slice(0, 8));
    return res.status(400).json({ error: 'No challenge found. Request new captcha.' });
  }
  if (Date.now() > stored.expires) {
    nonces.delete(wallet.toLowerCase());
    console.log('[VERIFY] Nonce expired');
    return res.status(400).json({ error: 'Challenge expired. Request new captcha.' });
  }

  // Verify captcha
  if (String(captchaAnswer).trim() !== String(stored.captchaAnswer).trim()) {
    nonces.delete(wallet.toLowerCase());
    console.log('[VERIFY] Wrong captcha:', captchaAnswer, 'expected:', stored.captchaAnswer);
    return res.status(400).json({ error: 'Wrong captcha answer' });
  }

  // Verify Solana signature
  try {
    const pubkey = bs58.decode(wallet);
    const msgBytes = new TextEncoder().encode(stored.message);
    const sigBytes = bs58.decode(signature);
    console.log('[VERIFY] pubkey len:', pubkey.length, 'sig len:', sigBytes.length);

    if (!nacl.sign.detached.verify(msgBytes, sigBytes, pubkey)) {
      console.log('[VERIFY] Signature invalid');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (e) {
    console.log('[VERIFY] Error:', e.message);
    return res.status(400).json({ error: 'Signature verification failed: ' + e.message });
  }

  nonces.delete(wallet.toLowerCase());
  console.log('[VERIFY] SUCCESS:', wallet.slice(0, 8));
  res.json({ verified: true, wallet });
});

// --- World State ---
function createFreshWorld() {
  return { players: {}, npcs: initNPCs(), monsters: {}, time: Date.now(), region: 'willowmere' };
}

function loadWorld() {
  try {
    if (fs.existsSync(SAVE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
      // Always use fresh NPC positions from code (not saved data)
      saved.npcs = initNPCs();
      return saved;
    }
  } catch (e) { console.error('[WARN] Load failed:', e.message); }
  return createFreshWorld();
}

function saveWorld() {
  try {
    if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
    fs.writeFileSync(SAVE_FILE, JSON.stringify(world, null, 2));
  } catch (e) { console.error('[WARN] Save failed:', e.message); }
}

function initNPCs() {
  // NPC positions: placed IN FRONT of their buildings (outside, visible)
  // rot: rotation in radians. 0 = north (-Z), PI = south, PI/2 = west, -PI/2 = east
  return {
    elder_maren:     { id: 'elder_maren', name: 'Elder Maren', title: 'Village Elder', x: 0, z: -11, rot: Math.PI },
    sir_gendut:      { id: 'sir_gendut', name: 'Sir Gendut', title: 'Merchant', x: 6, z: -2, rot: Math.PI / 2 },
    miss_lira:       { id: 'miss_lira', name: 'Miss Lira', title: 'Aspiring Adventurer', x: -4, z: 5, rot: -Math.PI / 2 },
    mr_tani:         { id: 'mr_tani', name: 'Mr. Tani', title: 'Farmer', x: -15, z: 14, rot: -Math.PI / 2 },
    mrs_ningsih:     { id: 'mrs_ningsih', name: 'Mrs. Ningsih', title: 'Cook', x: 5, z: 12, rot: Math.PI },
    kris:            { id: 'kris', name: 'Kris', title: 'Troublemaker', x: -2, z: -7, rot: -Math.PI / 2 },
    guard_ren:       { id: 'guard_ren', name: 'Guard Ren', title: 'Gate Guard', x: -2, z: 19, rot: Math.PI },
    herbalist_sari:  { id: 'herbalist_sari', name: 'Herbalist Sari', title: 'Herbalist', x: 16, z: -5, rot: Math.PI / 2 },
  };
}

let world = loadWorld();
const connectedPlayers = {};

// --- Player Management ---
function recalcClassStats(customization) {
  const CLASS_STATS = {
    laborer:  { hp: 120, mp: 30, atk: 8,  def: 7,  spd: 6,  crit: 0.05 },
    miner:    { hp: 90,  mp: 40, atk: 12, def: 4,  spd: 10, crit: 0.10 },
    gardener: { hp: 100, mp: 50, atk: 6,  def: 6,  spd: 8,  crit: 0.08 },
    herbalist:{ hp: 85,  mp: 70, atk: 5,  def: 5,  spd: 7,  crit: 0.05 },
    watchman: { hp: 110, mp: 35, atk: 10, def: 8,  spd: 7,  crit: 0.07 },
  };
  const cls = (customization && customization.classType) || 'laborer';
  return CLASS_STATS[cls] || CLASS_STATS.laborer;
}

function getOrCreatePlayer(playerId, name, wallet, customization, persistentId) {
  // 1. Try to load existing player by persistentId (cross-device identity)
  if (persistentId) {
    const existing = Object.values(world.players).find(p => p.persistentId === persistentId);
    if (existing) {
      existing.lastLogin = Date.now();
      existing.id = playerId; // rebind to current session
      if (name && name !== 'Adventurer') existing.name = name; // only update if real name
      if (customization && Object.keys(customization).length > 0) {
        // Server is source of truth — only update cosmetic fields, keep class/stats from server
        const serverClass = existing.customization?.classType;
        const clientClass = customization.classType;
        // Merge cosmetic fields only
        existing.customization = { ...existing.customization, ...customization };
        // If class changed, recalculate stats
        if (clientClass && clientClass !== serverClass) {
          const s = recalcClassStats(customization);
          existing.hp = s.hp; existing.maxHp = s.hp;
          existing.mp = s.mp; existing.maxMp = s.mp;
          existing.atk = s.atk; existing.def = s.def;
          existing.spd = s.spd; existing.crit = s.crit;
          existing.class = clientClass;
        }
      }
      world.players[playerId] = existing;
      // Remove old entry if different id
      Object.keys(world.players).forEach(k => {
        if (k !== playerId && world.players[k].persistentId === persistentId) delete world.players[k];
      });
      return existing;
    }
  }
  // 2. Try wallet fallback
  if (wallet) {
    const existing = Object.values(world.players).find(p => p.wallet === wallet);
    if (existing) {
      existing.lastLogin = Date.now();
      existing.id = playerId;
      if (name && name !== 'Adventurer') existing.name = name;
      if (customization && Object.keys(customization).length > 0) {
        const serverClass = existing.customization?.classType;
        const clientClass = customization.classType;
        existing.customization = { ...existing.customization, ...customization };
        if (clientClass && clientClass !== serverClass) {
          const s = recalcClassStats(customization);
          existing.hp = s.hp; existing.maxHp = s.hp;
          existing.mp = s.mp; existing.maxMp = s.mp;
          existing.atk = s.atk; existing.def = s.def;
          existing.spd = s.spd; existing.crit = s.crit;
          existing.class = clientClass;
        }
      }
      if (persistentId) existing.persistentId = persistentId; // backfill
      world.players[playerId] = existing;
      Object.keys(world.players).forEach(k => {
        if (k !== playerId && world.players[k].wallet === wallet) delete world.players[k];
      });
      return existing;
    }
  }
  // Create new
  // Class base stats
  const CLASS_STATS = {
    laborer:  { hp: 120, mp: 30, atk: 8,  def: 7,  spd: 6,  crit: 0.05 },
    miner:    { hp: 90,  mp: 40, atk: 12, def: 4,  spd: 10, crit: 0.10 },
    gardener: { hp: 100, mp: 50, atk: 6,  def: 6,  spd: 8,  crit: 0.08 },
    herbalist:{ hp: 85,  mp: 70, atk: 5,  def: 5,  spd: 7,  crit: 0.05 },
    watchman: { hp: 110, mp: 35, atk: 10, def: 8,  spd: 7,  crit: 0.07 },
  };
  const cls = (customization && customization.classType) || 'laborer';
  const s = CLASS_STATS[cls] || CLASS_STATS.laborer;
  const player = {
    id: playerId, name: name || 'Adventurer', wallet: wallet || null,
    persistentId: persistentId || null,
    x: 0, y: 0, z: 0, class: cls, className: null, level: 1, xp: 0,
    hp: s.hp, maxHp: s.hp, mp: s.mp, maxMp: s.mp, atk: s.atk, def: s.def, spd: s.spd, crit: s.crit,
    zen: 50, inventory: [], quests: {}, reputation: {}, region: 'willowmere',
    customization: customization || {}, equipment: {},
    createdAt: Date.now(), lastLogin: Date.now(),
  };
  world.players[playerId] = player;
  return player;
}

// --- Monster Spawning ---
let monsterIdCounter = 0;

function spawnMonsters() {
  Object.entries(MONSTERS).forEach(([type, data]) => {
    const existing = Object.values(world.monsters).filter(m => m.type === type);
    const toSpawn = data.maxSpawn - existing.length;
    if (toSpawn <= 0) return;

    for (let i = 0; i < toSpawn; i++) {
      const area = data.spawnAreas[Math.floor(Math.random() * data.spawnAreas.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * area.radius;
      const monster = {
        id: `mob_${++monsterIdCounter}`,
        type,
        name: data.name,
        x: area.x + Math.cos(angle) * dist,
        y: 0,
        z: area.z + Math.sin(angle) * dist,
        hp: data.hp,
        maxHp: data.hp,
        atk: data.atk,
        def: data.def,
        spd: data.spd,
        level: data.level,
        alive: true,
        target: null,
        state: 'idle', // idle, chase, attack, retreat
        lastAttack: 0,
      };
      world.monsters[monster.id] = monster;
    }
  });
}

function respawnMonster(monster) {
  const data = MONSTERS[monster.type];
  if (!data) return;
  const area = data.spawnAreas[Math.floor(Math.random() * data.spawnAreas.length)];
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * area.radius;
  monster.x = area.x + Math.cos(angle) * dist;
  monster.z = area.z + Math.sin(angle) * dist;
  monster.hp = data.hp;
  monster.alive = true;
  monster.target = null;
  monster.state = 'idle';
}

// Spawn initial monsters
spawnMonsters();

// Respawn timer
setInterval(() => {
  Object.values(world.monsters).forEach(m => {
    if (!m.alive && !m.respawnAt) {
      m.respawnAt = Date.now() + (MONSTERS[m.type]?.respawnTime || 30) * 1000;
      console.log(`[RESPAWN] ${m.id}(${m.type}) scheduled respawn in ${MONSTERS[m.type]?.respawnTime || 30}s`);
    }
    if (!m.alive && m.respawnAt && Date.now() >= m.respawnAt) {
      console.log(`[RESPAWN] ${m.id}(${m.type}) respawning NOW`);
      respawnMonster(m);
      delete m.respawnAt;
      broadcast({ type: 'monster_spawn', monster: sanitizeMonster(m) });
    }
  });
}, 5000);

// --- Monster AI (server-side) ---
setInterval(() => {
  const now = Date.now();
  Object.values(world.monsters).forEach(m => {
    if (!m.alive) return;
    const data = MONSTERS[m.type];
    if (!data) return;

    // Find nearest player
    let nearest = null;
    let nearestDist = Infinity;
    Object.values(connectedPlayers).forEach(p => {
      const dx = p.x - m.x;
      const dz = p.z - m.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = p;
      }
    });

    if (!nearest) { m.state = 'idle'; return; }

    // Debug: log AI state periodically
    if (Math.random() < 0.02) {
      console.log(`[AI] ${m.id}(${m.type}) state=${m.state} dist=${nearestDist.toFixed(1)} target=${m.target} hp=${m.hp}/${data.hp}`);
    }

    // Behavior logic
    switch (data.behavior) {
      case 'passive':
        if (m.state === 'idle' && nearestDist < data.aggroRange && m.target) {
          m.state = 'chase';
        }
        break;
      case 'aggressive':
        if (m.state === 'idle' && nearestDist < data.aggroRange) {
          m.state = 'chase';
          m.target = nearest.id;
        }
        break;
      case 'pack':
        if (nearestDist < data.aggroRange) {
          m.state = 'chase';
          m.target = nearest.id;
        }
        break;
      default:
        if (nearestDist < data.aggroRange) {
          m.state = 'chase';
          m.target = nearest.id;
        }
    }

    // Chase
    if (m.state === 'chase' && nearest) {
      const dx = nearest.x - m.x;
      const dz = nearest.z - m.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > data.attackRange) {
        const speed = data.spd * 0.05;
        m.x += (dx / dist) * speed;
        m.z += (dz / dist) * speed;
        broadcast({ type: 'monster_move', monsterId: m.id, x: m.x, z: m.z });
      } else if (now - m.lastAttack > data.attackSpeed * 1000) {
        // Attack player
        m.state = 'attack';
        m.lastAttack = now;
        const playerWs = nearest._ws;
        console.log(`[AI] Monster ${m.id}(${m.type}) attacking ${nearest.id} dist=${nearestDist.toFixed(1)} ws=${!!playerWs} ready=${playerWs?.readyState} monsterState=${m.state}`);
        if (playerWs && playerWs.readyState === 1) {
          const dmg = Math.max(1, m.atk - Math.floor(nearest.def * 0.6));
          nearest.hp = Math.max(0, nearest.hp - dmg);
          playerWs.send(JSON.stringify({ type: 'player_hit', damage: dmg, hp: nearest.hp, maxHp: nearest.maxHp }));
          broadcast({ type: 'monster_attack', monsterId: m.id, targetId: nearest.id, damage: dmg });
          if (nearest.hp <= 0) {
            // Player died — respawn at village
            nearest.hp = nearest.maxHp;
            nearest.x = 0;
            nearest.z = 0;
            playerWs.send(JSON.stringify({ type: 'player_died', hp: nearest.hp, maxHp: nearest.maxHp }));
            m.state = 'idle';
            m.target = null;
          }
        } else {
          console.log(`[AI] SKIP attack — ws unavailable`);
        }
        m.state = 'chase';
      }
    }

    // Retreat check
    if (m.hp / data.hp < data.retreatHp && m.state !== 'retreat') {
      m.state = 'retreat';
      m.target = null;
    }
    if (m.state === 'retreat') {
      const dx = m.x - (nearest?.x || 0);
      const dz = m.z - (nearest?.z || 0);
      const dist = Math.sqrt(dx * dx + dz * dz) || 1;
      m.x += (dx / dist) * data.spd * 0.03;
      m.z += (dz / dist) * data.spd * 0.03;
      if (nearestDist > data.aggroRange * 1.5) {
        m.state = 'idle';
        m.hp = Math.min(m.hp + data.hp * 0.1, data.hp); // Heal when retreated
      }
      broadcast({ type: 'monster_move', monsterId: m.id, x: m.x, z: m.z });
    }
  });
}, 200);

// --- Combat Handler ---
function handleAttack(ws, playerId, msg) {
  const player = connectedPlayers[ws];
  const monster = world.monsters[msg.monsterId];
  if (!player || !monster || !monster.alive) return;

  // Attack cooldown — ASPD-based (higher SPD = faster)
  const now = Date.now();
  const spd = player.spd || 7;
  const aspdCooldown = 600 + (10 - spd) * 80; // SPD 6→1080ms, SPD 10→600ms
  if (player._lastAttack && now - player._lastAttack < aspdCooldown) return;
  player._lastAttack = now;

  const data = MONSTERS[monster.type];
  if (!data) return;

  // Check distance
  const dx = player.x - monster.x;
  const dz = player.z - monster.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist > 3) return; // too far

  // Wind Sprite immune to melee
  if (data.immuneToMelee) {
    ws.send(JSON.stringify({ type: 'combat_message', text: `${monster.name} is immune to melee!` }));
    return;
  }

  // Calculate damage
  const isCrit = Math.random() < player.crit;
  let dmg = Math.max(1, player.atk - Math.floor(monster.def * 0.6));
  if (isCrit) dmg = Math.floor(dmg * 1.5);

  monster.hp -= dmg;
  // Clamp HP to 0 before broadcast so client never sees negative HP
  const displayHp = Math.max(0, monster.hp);

  // Broadcast damage
  console.log(`[COMBAT] monster_hit ${monster.id} dmg=${dmg} hp=${displayHp}/${monster.maxHp} clients=${wss.clients.size}`);
  broadcast({
    type: 'monster_hit',
    monsterId: monster.id,
    damage: dmg,
    isCrit,
    hp: displayHp,
    maxHp: monster.maxHp,
  });

  // Monster aggro
  if (monster.state === 'idle') {
    monster.state = 'chase';
    monster.target = playerId;
    console.log(`[COMBAT] Monster ${monster.id} aggro → chasing ${playerId}`);
  }

  // Monster died
  if (monster.hp <= 0) {
    monster.alive = false;
    monster.hp = 0;
    console.log(`[KILL] Monster ${monster.id} (${monster.name}) killed by ${playerId}`);

    // XP + Gold reward
    const xpGain = data.xp;
    const zenGain = data.zen ? data.zen[0] + Math.floor(Math.random() * (data.zen[1] - data.zen[0])) : 0;
    player.xp += xpGain;

    // Level up check
    const xpNeeded = 100 + (player.level - 1) * 200;
    if (player.xp >= xpNeeded) {
      player.level++;
      player.xp -= xpNeeded;
      player.maxHp += 10;
      player.hp = player.maxHp;
      player.maxMp += 5;
      player.mp = player.maxMp;
      ws.send(JSON.stringify({ type: 'level_up', level: player.level, maxHp: player.maxHp, maxMp: player.maxMp }));
    }

    // Roll loot drops
    const loot = rollLoot(monster.type);
    addLootToPlayer(player, loot);

    ws.send(JSON.stringify({
      type: 'monster_killed',
      monsterId: monster.id,
      monsterName: monster.name,
      xp: xpGain,
      zen: zenGain,
      loot,
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
    }));
    console.log(`[KILL] Sending monster_killed to attacker for ${monster.id}`);

    broadcast({ type: 'monster_died', monsterId: monster.id });
    console.log(`[KILL] Broadcast monster_died for ${monster.id}`);
    // Respawn handled by existing respawn timer at line 300
  }
}


// --- Loot System ---
function rollLoot(monsterType) {
  const table = LOOT_TABLES[monsterType];
  if (!table) return [];
  const drops = [];
  table.forEach(entry => {
    if (Math.random() < entry.chance) {
      const qty = entry.quantity[0] + Math.floor(Math.random() * (entry.quantity[1] - entry.quantity[0] + 1));
      const itemDef = ITEMS[entry.itemId];
      if (itemDef) {
        drops.push({
          id: entry.itemId,
          name: itemDef.name,
          type: itemDef.type,
          tier: itemDef.tier || 0,
          slot: itemDef.slot || null,
          stats: itemDef.stats || null,
          healAmount: itemDef.healAmount || null,
          manaAmount: itemDef.manaAmount || null,
          description: itemDef.description || '',
          quantity: qty,
          icon: itemDef.icon,
          dropChance: entry.chance,
        });
      }
    }
  });
  return drops;
}

function addLootToPlayer(player, loot) {
  if (!player.inventory) player.inventory = [];
  loot.forEach(item => {
    const existing = player.inventory.find(i => i.id === item.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + item.quantity;
    } else {
      player.inventory.push({ ...item });
    }
  });
}

// --- WebSocket ---
wss.on('connection', (ws) => {
  const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  console.log(`[CONNECT] ${playerId}`);
  ws.playerId = playerId;

  ws.send(JSON.stringify({ type: 'welcome', playerId, world: { time: Date.now(), region: 'willowmere' }, dayTime: getGameTime() }));

  ws.on('message', (data) => {
    try { handleMessage(ws, playerId, JSON.parse(data)); }
    catch (e) { console.error('[ERROR]', e.message); }
  });

  ws.on('close', () => {
    console.log(`[DISCONNECT] ${playerId}`);
    delete connectedPlayers[ws];
    broadcast({ type: 'player_left', playerId });
  });
});

function handleMessage(ws, playerId, msg) {
  switch (msg.type) {
    case 'join': {
      const isNew = !world.players[Object.keys(world.players).find(k => world.players[k].wallet === msg.wallet)] && msg.wallet;
      const player = getOrCreatePlayer(playerId, msg.name, msg.wallet, msg.customization, msg.persistentId);
      connectedPlayers[ws] = player;
      player._ws = ws; // back-reference for monster AI to send messages
      ws.playerId = playerId;
      ws.send(JSON.stringify({
        type: 'joined', player, npcs: world.npcs,
        returning: !!msg.wallet && !isNew,
        onlinePlayers: Object.values(connectedPlayers).filter(p => p.id !== playerId),
        monsters: Object.values(world.monsters).filter(m => m.alive).map(sanitizeMonster),
      }));
      broadcast({ type: 'player_joined', player }, ws);
      break;
    }
    case 'move': {
      const player = connectedPlayers[ws];
      if (player) {
        player.x = msg.x; player.y = msg.y; player.z = msg.z;
        broadcast({ type: 'player_moved', playerId, x: msg.x, y: msg.y, z: msg.z }, ws);
      }
      break;
    }
    case 'chat': {
      const player = connectedPlayers[ws];
      if (player) broadcast({ type: 'chat', playerId, name: player.name, message: (msg.message || '').slice(0, 200) }, ws);
      break;
    }
    case 'interact_npc': {
      const npc = world.npcs[msg.npcId];
      if (npc) ws.send(JSON.stringify({ type: 'npc_dialogue', npcId: npc.id, name: npc.name, title: npc.title }));
      break;
    }
    case 'attack': {
      handleAttack(ws, playerId, msg);
      break;
    }
    case 'use_item': {
      const player = connectedPlayers[ws];
      if (player) {
        const itemIdx = player.inventory.findIndex(i => i.id === msg.itemId);
        if (itemIdx >= 0) {
          const item = player.inventory[itemIdx];
          const itemDef = ITEMS[item.id];
          if (itemDef?.healAmount) {
            player.hp = Math.min(player.maxHp, player.hp + itemDef.healAmount);
          }
          if (itemDef?.manaAmount) {
            player.mp = Math.min(player.maxMp, player.mp + itemDef.manaAmount);
          }
          // Remove one quantity
          item.quantity = (item.quantity || 1) - 1;
          if (item.quantity <= 0) player.inventory.splice(itemIdx, 1);
          ws.send(JSON.stringify({ type: 'item_used', itemId: msg.itemId, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, inventory: player.inventory }));
        }
      }
      break;
    }
    case 'equip_item': {
      const player = connectedPlayers[ws];
      if (player) {
        const itemIdx = player.inventory.findIndex(i => i.id === msg.itemId);
        if (itemIdx >= 0) {
          const item = player.inventory[itemIdx];
          const itemDef = ITEMS[item.id];
          if (itemDef?.slot) {
            // Unequip current
            if (player.equipment[itemDef.slot]) {
              player.inventory.push(player.equipment[itemDef.slot]);
            }
            // Equip new
            player.equipment[itemDef.slot] = player.inventory.splice(itemIdx, 1)[0];
            // Apply stats
            if (itemDef.atk) player.atk = 10 + itemDef.atk;
            if (itemDef.def) player.def = 5 + itemDef.def;
            ws.send(JSON.stringify({ type: 'item_equipped', equipment: player.equipment, inventory: player.inventory, atk: player.atk, def: player.def }));
          }
        }
      }
      break;
    }
    case 'unequip_item': {
      const player = connectedPlayers[ws];
      if (player && player.equipment[msg.slot]) {
        player.inventory.push(player.equipment[msg.slot]);
        delete player.equipment[msg.slot];
        // Recalc stats
        player.atk = 10;
        player.def = 5;
        Object.values(player.equipment).forEach(e => {
          if (e && ITEMS[e.id]) {
            if (ITEMS[e.id].atk) player.atk += ITEMS[e.id].atk;
            if (ITEMS[e.id].def) player.def += ITEMS[e.id].def;
          }
        });
        ws.send(JSON.stringify({ type: 'item_unequipped', equipment: player.equipment, inventory: player.inventory, atk: player.atk, def: player.def }));
      }
      break;
    }
    case 'quest_start': {
      const player = connectedPlayers[ws];
      if (player && QUESTS[msg.questId]) {
        if (!player.quests) player.quests = {};
        player.quests[msg.questId] = { status: 'active', progress: {} };
        ws.send(JSON.stringify({ type: 'quest_started', quest: QUESTS[msg.questId] }));
      }
      break;
    }
    case 'quest_complete': {
      const player = connectedPlayers[ws];
      if (player && QUESTS[msg.questId]) {
        const quest = QUESTS[msg.questId];
        const qState = player.quests?.[msg.questId];
        if (!qState || qState.status !== 'active') break;
        // Check all objectives
        const allDone = quest.objectives.every(o => {
          const prog = qState.progress[o.id] || 0;
          return prog >= o.required;
        });
        if (!allDone) break;
        // Give rewards
        qState.status = 'completed';
        if (quest.rewards.xp) {
          player.xp += quest.rewards.xp;
          const xpNeeded = 100 + (player.level - 1) * 200;
          if (player.xp >= xpNeeded) {
            player.level++;
            player.xp -= xpNeeded;
            player.maxHp += 10;
            player.hp = player.maxHp;
            player.maxMp += 5;
            player.mp = player.maxMp;
            ws.send(JSON.stringify({ type: 'level_up', level: player.level, maxHp: player.maxHp, maxMp: player.maxMp }));
          }
        }
        if (quest.rewards.items) {
          quest.rewards.items.forEach(item => {
            if (!player.inventory) player.inventory = [];
            const itemDef = ITEMS[item.id];
            if (itemDef) {
              const existing = player.inventory.find(i => i.id === item.id);
              if (existing) existing.quantity = (existing.quantity || 1) + item.quantity;
              else player.inventory.push({ id: item.id, name: itemDef.name, type: itemDef.type, quantity: item.quantity, icon: itemDef.icon });
            }
          });
        }
        if (quest.rewards.reputation) {
          if (!player.reputation) player.reputation = {};
          Object.entries(quest.rewards.reputation).forEach(([npcId, rep]) => {
            player.reputation[npcId] = (player.reputation[npcId] || 0) + rep;
          });
        }
        ws.send(JSON.stringify({
          type: 'quest_completed',
          questId: msg.questId,
          questName: quest.name,
          xp: quest.rewards.xp || 0,
          items: quest.rewards.items || [],
          hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp,
          inventory: player.inventory,
        }));
      }
      break;
    }
    case 'quest_progress': {
      const player = connectedPlayers[ws];
      if (player && player.quests?.[msg.questId]) {
        const qState = player.quests[msg.questId];
        if (!qState.progress) qState.progress = {};
        qState.progress[msg.objectiveId] = (qState.progress[msg.objectiveId] || 0) + (msg.amount || 1);
        ws.send(JSON.stringify({ type: 'quest_progress', questId: msg.questId, objectiveId: msg.objectiveId, current: qState.progress[msg.objectiveId] }));
      }
      break;
    }
    case 'get_quests': {
      const player = connectedPlayers[ws];
      if (player) ws.send(JSON.stringify({ type: 'quest_list', quests: player.quests || {} }));
      break;
    }
    case 'party_invite': {
      const inviter = connectedPlayers[ws];
      const targetWs = Object.keys(connectedPlayers).find(k => connectedPlayers[k]?.name === msg.targetName);
      if (inviter && targetWs) {
        const target = connectedPlayers[targetWs];
        if (!inviter.party) inviter.party = { leader: inviter.id, members: [inviter.id] };
        JSON.parse(targetWs).send?.(null); // can't send like this
        // Send via ws
        wss.clients.forEach(c => {
          if (connectedPlayers[c] && connectedPlayers[c].name === msg.targetName) {
            c.send(JSON.stringify({ type: 'party_invite', from: inviter.name, fromId: inviter.id }));
          }
        });
      }
      break;
    }
    case 'party_accept': {
      const player = connectedPlayers[ws];
      const inviter = Object.values(connectedPlayers).find(p => p.id === msg.inviterId);
      if (player && inviter) {
        if (!inviter.party) inviter.party = { leader: inviter.id, members: [inviter.id] };
        inviter.party.members.push(player.id);
        player.party = inviter.party;
        // Notify all party members
        inviter.party.members.forEach(mId => {
          wss.clients.forEach(c => {
            if (connectedPlayers[c]?.id === mId) {
              const members = inviter.party.members.map(mid => {
                const p = connectedPlayers[Object.keys(connectedPlayers).find(k => connectedPlayers[k]?.id === mid)];
                return p ? { id: p.id, name: p.name } : null;
              }).filter(Boolean);
              c.send(JSON.stringify({ type: 'party_update', party: { leader: inviter.party.leader, members } }));
            }
          });
        });
      }
      break;
    }
    case 'party_leave': {
      const player = connectedPlayers[ws];
      if (player && player.party) {
        const party = player.party;
        party.members = party.members.filter(id => id !== player.id);
        // Notify remaining members
        party.members.forEach(mId => {
          wss.clients.forEach(c => {
            if (connectedPlayers[c]?.id === mId) {
              const members = party.members.map(mid => {
                const p = connectedPlayers[Object.keys(connectedPlayers).find(k => connectedPlayers[k]?.id === mid)];
                return p ? { id: p.id, name: p.name } : null;
              }).filter(Boolean);
              c.send(JSON.stringify({ type: 'party_update', party: { leader: party.leader, members } }));
            }
          });
        });
        player.party = null;
        ws.send(JSON.stringify({ type: 'party_update', party: null }));
      }
      break;
    }
    case 'get_online': {
      const online = Object.values(connectedPlayers).map(p => ({ id: p.id, name: p.name, level: p.level, region: p.region }));
      ws.send(JSON.stringify({ type: 'online_list', players: online }));
      break;
    }
    case 'save': saveWorld(); ws.send(JSON.stringify({ type: 'saved' })); break;
    case 'shop_open': {
      const player = connectedPlayers[ws];
      const shop = SHOPS[msg.npcId];
      if (player && shop) {
        const catalog = shop.inventory.map(s => {
          const itemDef = ITEMS[s.itemId];
          return itemDef ? {
            itemId: s.itemId, name: itemDef.name, type: itemDef.type,
            description: itemDef.description, icon: itemDef.icon,
            price: Math.ceil((itemDef.price || 10) * shop.buyMultiplier),
            stats: itemDef.stats, slot: itemDef.slot,
            healAmount: itemDef.healAmount, manaAmount: itemDef.manaAmount,
          } : null;
        }).filter(Boolean);
        ws.send(JSON.stringify({ type: 'shop_catalog', shopId: msg.npcId, shopName: shop.name, catalog }));
      }
      break;
    }
    case 'buy_item': {
      const player = connectedPlayers[ws];
      const shop = SHOPS[msg.shopId];
      if (player && shop && msg.itemId) {
        const itemDef = ITEMS[msg.itemId];
        if (!itemDef) return ws.send(JSON.stringify({ type: 'shop_error', error: 'Item not found' }));
        const price = Math.ceil((itemDef.price || 10) * shop.buyMultiplier);
        const qty = Math.max(1, msg.quantity || 1);
        const totalCost = price * qty;
        if (player.zen < totalCost) {
          return ws.send(JSON.stringify({ type: 'shop_error', error: `Not enough Zen. Need ${totalCost}, have ${player.zen}` }));
        }
        player.zen -= totalCost;
        if (!player.inventory) player.inventory = [];
        const existing = player.inventory.find(i => i.id === msg.itemId);
        if (existing) existing.quantity = (existing.quantity || 1) + qty;
        else player.inventory.push({ id: msg.itemId, name: itemDef.name, type: itemDef.type, quantity: qty, icon: itemDef.icon });
        ws.send(JSON.stringify({ type: 'shop_result', action: 'buy', itemId: msg.itemId, quantity: qty, cost: totalCost, zen: player.zen, inventory: player.inventory }));
      }
      break;
    }
    case 'sell_item': {
      const player = connectedPlayers[ws];
      const shop = SHOPS[msg.shopId];
      if (player && shop && msg.itemId) {
        const itemIdx = player.inventory.findIndex(i => i.id === msg.itemId);
        if (itemIdx < 0) return ws.send(JSON.stringify({ type: 'shop_error', error: 'Item not in inventory' }));
        const item = player.inventory[itemIdx];
        const qty = Math.min(msg.quantity || 1, item.quantity || 1);
        const itemDef = ITEMS[item.id];
        const price = Math.ceil((itemDef?.price || 10) * shop.sellMultiplier);
        const totalGold = price * qty;
        item.quantity = (item.quantity || 1) - qty;
        if (item.quantity <= 0) player.inventory.splice(itemIdx, 1);
        player.zen = (player.zen || 0) + totalGold;
        ws.send(JSON.stringify({ type: 'shop_result', action: 'sell', itemId: item.id, quantity: qty, earned: totalGold, zen: player.zen, inventory: player.inventory }));
      }
      break;
    }
    case 'respawn': {
      const player = connectedPlayers[ws];
      if (player) {
        if (msg.location === 'checkpoint' && msg.checkpointId) {
          // TODO: checkpoint system — for now, respawn at city
          player.x = 0; player.z = 0;
        } else {
          // Respawn at city
          player.x = 0; player.z = 0;
        }
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        ws.send(JSON.stringify({ type: 'respawned', x: player.x, z: player.z, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp }));
        broadcast({ type: 'player_moved', playerId, x: player.x, y: 0, z: player.z });
      }
      break;
    }
    case 'use_skill': {
      const player = connectedPlayers[ws];
      if (!player) break;
      // Skill definitions (must match client)
      const SKILL_DATA = {
        laborer: { mpCost: 15, damageMulti: 2.5, healMulti: 0 },
        miner: { mpCost: 20, damageMulti: 3.0, healMulti: 0 },
        gardener: { mpCost: 12, damageMulti: 2.0, healMulti: 0 },
        herbalist: { mpCost: 25, damageMulti: 0, healMulti: 0.4 },
        watchman: { mpCost: 18, damageMulti: 2.0, healMulti: 0 },
      };
      const skill = SKILL_DATA[player.classType];
      if (!skill) break;
      if (player.mp < skill.mpCost) {
        ws.send(JSON.stringify({ type: 'combat_message', text: 'Not enough MP!' }));
        break;
      }
      player.mp -= skill.mpCost;

      // Heal skill
      if (skill.healMulti > 0) {
        const healAmt = Math.floor(player.maxHp * skill.healMulti);
        player.hp = Math.min(player.maxHp, player.hp + healAmt);
        ws.send(JSON.stringify({ type: 'skill_used', skillId: msg.skillId, hp: player.hp, mp: player.mp, heal: healAmt }));
        break;
      }

      // Attack skill
      if (!msg.monsterId) break;
      const monster = world.monsters[msg.monsterId];
      if (!monster || !monster.alive) break;

      const data = MONSTERS[monster.type];
      if (!data) break;

      const dx = player.x - monster.x;
      const dz = player.z - monster.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 5) { // skill range generous
        ws.send(JSON.stringify({ type: 'combat_message', text: 'Too far!' }));
        player.mp += skill.mpCost; // refund
        break;
      }

      const isCrit = Math.random() < player.crit;
      let dmg = Math.max(1, Math.floor(player.atk * skill.damageMulti) - Math.floor(monster.def * 0.4));
      if (isCrit) dmg = Math.floor(dmg * 1.5);

      monster.hp -= dmg;
      const skillDisplayHp = Math.max(0, monster.hp);
      if (monster.state === 'idle') { monster.state = 'chase'; monster.target = playerId; }

      broadcast({ type: 'monster_hit', monsterId: monster.id, damage: dmg, isCrit, hp: skillDisplayHp, maxHp: monster.maxHp });
      ws.send(JSON.stringify({ type: 'skill_used', skillId: msg.skillId, mp: player.mp }));

      if (monster.hp <= 0) {
        monster.alive = false;
        monster.hp = 0;
        const xpGain = data.xp;
        player.xp += xpGain;
        const xpNeeded = 100 + (player.level - 1) * 200;
        if (player.xp >= xpNeeded) {
          player.level++;
          player.xp -= xpNeeded;
          player.maxHp += 10; player.hp = player.maxHp;
          player.maxMp += 5; player.mp = player.maxMp;
          ws.send(JSON.stringify({ type: 'level_up', level: player.level, maxHp: player.maxHp, maxMp: player.maxMp }));
        }
        const loot = rollLoot(monster.type);
        addLootToPlayer(player, loot);
        ws.send(JSON.stringify({ type: 'monster_killed', monsterId: monster.id, monsterName: monster.name, xp: xpGain, loot, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp }));
        broadcast({ type: 'monster_died', monsterId: monster.id });
      }
      break;
    }
    case 'pickup_loot': {
      const player = connectedPlayers[ws];
      if (player) {
        // Loot already added to inventory by addLootToPlayer on kill
        // This just confirms pickup — update inventory UI
        ws.send(JSON.stringify({ type: 'inventory_update', inventory: player.inventory }));
      }
      break;
    }
    default: console.log(`[WARN] Unknown: ${msg.type}`);
  }
}

function sanitizeMonster(m) {
  return { id: m.id, type: m.type, name: m.name, x: m.x, y: m.y, z: m.z, hp: m.hp, maxHp: m.maxHp, level: m.level, alive: m.alive };
}

function broadcast(data, exclude = null) {
  const payload = JSON.stringify(data);
  wss.clients.forEach(c => { if (c !== exclude && c.readyState === 1) c.send(payload); });
}

// --- Game Time (authoritative) ---
// 20 min per full cycle. Epoch = fixed reference point.
const DAY_CYCLE_SECONDS = 20 * 60; // 1200 seconds per cycle
const GAME_EPOCH = 0;
function getGameTime() {
  const elapsed = (Date.now() / 1000 - GAME_EPOCH) % DAY_CYCLE_SECONDS;
  return elapsed / DAY_CYCLE_SECONDS;
}

// Broadcast game time every 30s
setInterval(() => {
  broadcast({ type: 'time_sync', dayTime: getGameTime() });
}, 30000);

// Auto-save
setInterval(() => { saveWorld(); console.log('[SAVE]'); }, 5 * 60 * 1000);
process.on('SIGINT', () => { saveWorld(); process.exit(0); });
process.on('SIGTERM', () => { saveWorld(); process.exit(0); });

server.listen(PORT, () => {
  console.log(`\n⚔️  Zenithia Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket on ws://localhost:${PORT}`);
  console.log(`🐾 ${Object.keys(MONSTERS).length} monster types loaded`);
  console.log(`💾 Auto-save every 5 minutes\n`);
});
