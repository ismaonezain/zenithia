const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

const PORT = 2567;
const SAVE_DIR = path.join(__dirname, 'data');
const SAVE_FILE = path.join(SAVE_DIR, 'world.json');
const MONSTERS = require('./shared/monsters');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

// --- World State ---
function createFreshWorld() {
  return { players: {}, npcs: initNPCs(), monsters: {}, time: Date.now(), region: 'willowmere' };
}

function loadWorld() {
  try {
    if (fs.existsSync(SAVE_FILE)) return JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
  } catch (e) { console.error('[WARN] Load failed:', e.message); }
  return createFreshWorld();
}

function saveWorld() {
  try {
    if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
    const toSave = { ...world, players: {} };
    fs.writeFileSync(SAVE_FILE, JSON.stringify(toSave, null, 2));
  } catch (e) { console.error('[WARN] Save failed:', e.message); }
}

function initNPCs() {
  return {
    elder_maren:     { id: 'elder_maren', name: 'Elder Maren', title: 'Village Elder', x: 0, z: -15 },
    sir_gendut:      { id: 'sir_gendut', name: 'Sir Gendut', title: 'Merchant', x: 8, z: 0 },
    miss_lira:       { id: 'miss_lira', name: 'Miss Lira', title: 'Aspiring Adventurer', x: -8, z: 3 },
    mr_tani:         { id: 'mr_tani', name: 'Mr. Tani', title: 'Farmer', x: -18, z: 12 },
    mrs_ningsih:     { id: 'mrs_ningsih', name: 'Mrs. Ningsih', title: 'Cook', x: 8, z: 8 },
    kris:            { id: 'kris', name: 'Kris', title: 'Troublemaker', x: -3, z: -10 },
    guard_ren:       { id: 'guard_ren', name: 'Guard Ren', title: 'Gate Guard', x: 0, z: 22 },
    herbalist_sari:  { id: 'herbalist_sari', name: 'Herbalist Sari', title: 'Herbalist', x: 18, z: -8 },
  };
}

let world = loadWorld();
const connectedPlayers = {};

// --- Player Management ---
function createPlayer(playerId, name, wallet) {
  if (world.players[playerId]) return world.players[playerId];
  const player = {
    id: playerId, name: name || 'Adventurer', wallet: wallet || null,
    x: 0, y: 0, z: 0, class: null, className: null, level: 1, xp: 0,
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, atk: 10, def: 5, spd: 10, crit: 0.05,
    gold: 50, inventory: [], quests: {}, reputation: {}, region: 'willowmere',
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
    }
    if (!m.alive && m.respawnAt && Date.now() >= m.respawnAt) {
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
        const player = connectedPlayers[nearest.ws];
        if (player) {
          const dmg = Math.max(1, m.atk - Math.floor(player.def * 0.6));
          player.hp = Math.max(0, player.hp - dmg);
          nearest.ws.send(JSON.stringify({ type: 'player_hit', damage: dmg, hp: player.hp, maxHp: player.maxHp }));
          broadcast({ type: 'monster_attack', monsterId: m.id, targetId: nearest.id, damage: dmg });
          if (player.hp <= 0) {
            // Player died — respawn at village
            player.hp = player.maxHp;
            player.x = 0;
            player.z = 0;
            nearest.ws.send(JSON.stringify({ type: 'player_died', hp: player.hp }));
            m.state = 'idle';
            m.target = null;
          }
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

  // Broadcast damage
  broadcast({
    type: 'monster_hit',
    monsterId: monster.id,
    damage: dmg,
    isCrit,
    hp: monster.hp,
    maxHp: monster.maxHp,
  });

  // Monster aggro
  if (monster.state === 'idle') {
    monster.state = 'chase';
    monster.target = playerId;
  }

  // Monster died
  if (monster.hp <= 0) {
    monster.alive = false;
    monster.hp = 0;

    // XP + Gold reward
    const xpGain = data.xp;
    const goldGain = data.gold[0] + Math.floor(Math.random() * (data.gold[1] - data.gold[0]));
    player.xp += xpGain;
    player.gold += goldGain;

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

    ws.send(JSON.stringify({
      type: 'monster_killed',
      monsterId: monster.id,
      monsterName: monster.name,
      xp: xpGain,
      gold: goldGain,
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
    }));

    broadcast({ type: 'monster_died', monsterId: monster.id });
  }
}

// --- WebSocket ---
wss.on('connection', (ws) => {
  const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  console.log(`[CONNECT] ${playerId}`);
  ws.playerId = playerId;

  ws.send(JSON.stringify({ type: 'welcome', playerId, world: { time: Date.now(), region: 'willowmere' } }));

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
      const player = createPlayer(playerId, msg.name, msg.wallet);
      connectedPlayers[ws] = player;
      ws.playerId = playerId;
      ws.send(JSON.stringify({
        type: 'joined', player, npcs: world.npcs,
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
      if (player) broadcast({ type: 'chat', playerId, name: player.name, message: (msg.message || '').slice(0, 200) });
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
    case 'save': saveWorld(); ws.send(JSON.stringify({ type: 'saved' })); break;
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
