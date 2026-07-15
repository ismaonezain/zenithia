const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nacl = require('tweetnacl');
const bs58 = require('bs58').default || require('bs58');

const PORT = process.env.PORT || 2567;
// Use /data volume if mounted (Railway persistent storage), fallback to local
const SAVE_DIR = fs.existsSync('/data') ? '/data' : path.join(__dirname, 'data');
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
    const size = fs.statSync(SAVE_FILE).size;
    console.log(`[SAVE] OK (${size} bytes) players=${Object.keys(world.players).length}`);
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

// --- Ground Loot System ---
let groundLootIdCounter = 0;
const groundLoot = {}; // lootId → { id, items, x, z, killerId, spawnTime }
const GROUND_LOOT_DESPAWN_MS = 30000; // 30 seconds

function spawnGroundLoot(lootItems, x, z, killerId) {
  if (!lootItems || lootItems.length === 0) return;
  const lootId = `gl_${++groundLootIdCounter}`;
  groundLoot[lootId] = { id: lootId, items: lootItems, x, z, killerId, spawnTime: Date.now() };
  broadcast({ type: 'ground_loot_spawn', lootId, items: lootItems, x, z });
  return lootId;
}

// Despawn old ground loot every 5 seconds
setInterval(() => {
  const now = Date.now();
  Object.keys(groundLoot).forEach(id => {
    if (now - groundLoot[id].spawnTime > GROUND_LOOT_DESPAWN_MS) {
      delete groundLoot[id];
      broadcast({ type: 'ground_loot_remove', lootId: id });
    }
  });
}, 5000);


// Startup diagnostics
const playerCount = Object.keys(world.players).length;
console.log(`[BOOT] World loaded: ${playerCount} players saved`);
if (playerCount > 0) {
  Object.values(world.players).forEach(p => {
    console.log(`[BOOT]   - ${p.name} (Lv.${p.level}) inv=${(p.inventory||[]).length} equip=${Object.keys(p.equipment||{}).length} persistentId=${p.persistentId?.slice(0,12)||'none'}`);
  });
} else {
  console.log('[BOOT] WARNING: No saved players found! Data may not persist across deploys.');
  console.log('[BOOT] SAVE_DIR:', SAVE_DIR, 'SAVE_FILE exists:', fs.existsSync(SAVE_FILE));
}

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
      if (persistentId && !existing.persistentId) existing.persistentId = persistentId; // backfill
      // Update name if player provided a new one
      if (name && name !== 'Adventurer' && name !== existing.name) {
        console.log(`[RENAME] ${existing.name} → ${name}`);
        existing.name = name;
      }
      // CRITICAL: if player was killed before server restart, HP is 0 on disk
      // Restore to full so monster AI doesn't skip them
      if ((existing.hp || 0) <= 0) {
        existing.hp = existing.maxHp || CLASS_STATS[existing.class || 'laborer']?.hp || 120;
        existing.mp = existing.maxMp || CLASS_STATS[existing.class || 'laborer']?.mp || 30;
        console.log(`[RECOVER] ${existing.name} had hp=0, restored to ${existing.hp}`);
      }
      // Backfill unlockedSkills for existing players — auto-unlock by level
      if (!existing.unlockedSkills) {
        existing.unlockedSkills = ['tier1'];
      }
      // Auto-unlock tiers based on current level
      if (existing.level >= 3 && !existing.unlockedSkills.includes('tier2b')) {
        existing.unlockedSkills.push('tier2b');
      }
      if (existing.level >= 5 && !existing.unlockedSkills.includes('tier2a')) {
        existing.unlockedSkills.push('tier2a');
      }
      existing.skillPoints = 0; // SP removed — skills auto-unlock by level
      console.log(`[SKILL] ${existing.name} Lv.${existing.level} → unlocked: [${existing.unlockedSkills}]`);
      world.players[playerId] = existing;
      // Remove old entry if different id
      Object.keys(world.players).forEach(k => {
        if (k !== playerId && world.players[k].persistentId === persistentId) delete world.players[k];
      });
      return existing; // reload as-is, NO overwrite
    }
  }
  // 2. Try wallet fallback
  if (wallet) {
    const existing = Object.values(world.players).find(p => p.wallet === wallet);
    if (existing) {
      existing.lastLogin = Date.now();
      existing.id = playerId;
      if (persistentId && !existing.persistentId) existing.persistentId = persistentId; // backfill
      // Update name if player provided a new one
      if (name && name !== 'Adventurer' && name !== existing.name) {
        console.log(`[RENAME] ${existing.name} → ${name} (wallet)`);
        existing.name = name;
      }
      if ((existing.hp || 0) <= 0) {
        existing.hp = existing.maxHp || CLASS_STATS[existing.class || 'laborer']?.hp || 120;
        existing.mp = existing.maxMp || CLASS_STATS[existing.class || 'laborer']?.mp || 30;
        console.log(`[RECOVER] ${existing.name} had hp=0 (wallet), restored to ${existing.hp}`);
      }
      world.players[playerId] = existing;
      Object.keys(world.players).forEach(k => {
        if (k !== playerId && world.players[k].wallet === wallet) delete world.players[k];
      });
      return existing; // reload as-is, NO overwrite
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
    customization: customization || {}, equipment: {}, unlockedSkills: ['tier1'], skillPoints: 0,
    createdAt: Date.now(), lastLogin: Date.now(),
  };
  world.players[playerId] = player;
  return player;
}

// --- Inventory Hydration ---
// Merge latest item definitions (icon.image, description, etc.) into saved inventory
function hydrateInventory(player) {
  if (!player.inventory) return;
  for (const item of player.inventory) {
    const def = ITEMS[item.id];
    if (def) {
      // Merge new fields from definition without overwriting user data
      if (def.icon?.image && !item.icon?.image) {
        item.icon = { ...def.icon, ...(item.icon || {}) };
      }
      if (def.description && !item.description) item.description = def.description;
    }
  }
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
        spawnX: area.x + Math.cos(angle) * dist,
        spawnZ: area.z + Math.sin(angle) * dist,
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
  monster.spawnX = monster.x;
  monster.spawnZ = monster.z;
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

// --- Monster AI (Cahaya v2 pattern) ---
let aiDebugCounter = 0;
setInterval(() => {
  const now = Date.now();
  const playerCount = Object.keys(connectedPlayers).length;
  const aliveMonsters = Object.values(world.monsters).filter(m => m.alive).length;
  aiDebugCounter++;

  // Log EVERY 5 seconds — tells us everything
  if (aiDebugCounter % 25 === 0) {
    const pList = Object.values(connectedPlayers).map(p => `${p.name}(${(p.x||0).toFixed(0)},${(p.z||0).toFixed(0)})hp=${p.hp}`).join(', ');
    console.log(`[AI-TICK] alive_mobs=${aliveMonsters} players=${playerCount} [${pList}]`);
  }

  for (const m of Object.values(world.monsters)) {
    if (!m.alive) continue;
    const data = MONSTERS[m.type];
    if (!data) continue;

    // Dead check
    if (m.hp <= 0) {
      m.alive = false;
      m.state = 'idle';
      continue;
    }

    // Find closest player
    let closestPlayer = null;
    let closestDist = Infinity;
    for (const p of Object.values(connectedPlayers)) {
      if (!p || p.hp <= 0) continue;
      const dx = (p.x || 0) - m.x;
      const dz = (p.z || 0) - m.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < closestDist) { closestDist = d; closestPlayer = p; }
    }

    // Debug log every 2 seconds (10 ticks)
    if (aiDebugCounter % 10 === 0 && closestPlayer) {
      const aggroR = data.aggroRange || 5;
      const atkR = Math.max(data.attackRange || 1.2, 1.5);
      console.log(`[AI-DBG] ${m.id}(${m.type}) state=${m.state} players=${playerCount} closest=${closestPlayer.id} dist=${closestDist.toFixed(1)} aggro=${aggroR} atkRange=${atkR} mpos=(${m.x.toFixed(1)},${m.z.toFixed(1)}) ppos=(${(closestPlayer.x||0).toFixed(1)},${(closestPlayer.z||0).toFixed(1)})`);
    }

    if (closestPlayer && closestDist < (data.aggroRange || 5)) {
      // Chase
      m.targetId = closestPlayer.id;
      if (m.state === 'attack') {
        if (now - m.lastAttack > 800) m.state = 'chase';
      } else {
        m.state = 'chase';
      }

      const dist = closestDist;
      const attackRange = Math.max(data.attackRange || 1.2, 1.5);

      if (dist > attackRange) {
        // Move toward player
        const dx = (closestPlayer.x || 0) - m.x;
        const dz = (closestPlayer.z || 0) - m.z;
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        const speed = data.spd * 0.1;
        m.x += (dx / len) * speed;
        m.z += (dz / len) * speed;
        broadcast({ type: 'monster_move', monsterId: m.id, x: m.x, z: m.z });
      } else if (now - m.lastAttack > 1500) {
        // Attack
        m.lastAttack = now;
        m.state = 'attack';
        const dmg = Math.max(1, m.atk - (closestPlayer.def || 0));
        closestPlayer.hp = Math.max(0, closestPlayer.hp - dmg);
        console.log(`[COMBAT] Monster ${m.id}(${m.type}) HIT player ${closestPlayer.id} dmg=${dmg} hp=${closestPlayer.hp}/${closestPlayer.maxHp} def=${closestPlayer.def} atk=${m.atk}`);
        broadcast({ type: 'monster_attack', monsterId: m.id, targetId: closestPlayer.id, damage: dmg });
        if (closestPlayer.hp <= 0) {
          // XP penalty: lose 10% of current XP (min 0)
          const xpLoss = Math.max(1, Math.floor(closestPlayer.xp * 0.1));
          closestPlayer.xp = Math.max(0, closestPlayer.xp - xpLoss);
          // Find correct ws for dying player
          let dyingWs = null;
          for (const [wsKey, p] of Object.entries(connectedPlayers)) {
            if (p === closestPlayer) { dyingWs = wsKey; break; }
          }
          broadcast({ type: 'player_died', targetId: closestPlayer.id, xpLoss });
          if (dyingWs) {
            dyingWs.send(JSON.stringify({ type: 'xp_penalty', xpLoss, xp: closestPlayer.xp }));
          }
          // Auto-respawn after 5 seconds
          setTimeout(() => {
            closestPlayer.hp = closestPlayer.maxHp;
            closestPlayer.mp = closestPlayer.maxMp;
            closestPlayer.x = 0;
            closestPlayer.z = 0;
            broadcast({ type: 'player_respawn', targetId: closestPlayer.id, hp: closestPlayer.hp, maxHp: closestPlayer.maxHp, mp: closestPlayer.mp, maxMp: closestPlayer.maxMp, x: 0, z: 0 });
            if (dyingWs && dyingWs.readyState === 1) {
              dyingWs.send(JSON.stringify({ type: 'respawned', x: 0, z: 0, hp: closestPlayer.hp, maxHp: closestPlayer.maxHp, mp: closestPlayer.mp, maxMp: closestPlayer.maxMp }));
            }
          }, 5000);
          m.state = 'idle';
        }
      }
    } else {
      // No player in range — return to spawn
      m.state = 'idle';
      if (m.spawnX !== undefined) {
        const dx = m.spawnX - m.x;
        const dz = m.spawnZ - m.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 1) {
          m.x += (dx / dist) * data.spd * 0.05;
          m.z += (dz / dist) * data.spd * 0.05;
          broadcast({ type: 'monster_move', monsterId: m.id, x: m.x, z: m.z });
        }
      }
    }
  }
}, 200);

function handleAttack(ws, playerId, msg) {
  const player = connectedPlayers[ws];
  const monster = world.monsters[msg.monsterId];
  if (!player || !monster || !monster.alive) return;
  if (monster.hp <= 0) return;

  const now = Date.now();
  const spd = player.spd || 7;
  const aspdCooldown = 600 + (10 - spd) * 80;
  if (player._lastAttack && now - player._lastAttack < aspdCooldown) return;
  player._lastAttack = now;

  const data = MONSTERS[monster.type];
  if (!data) return;

  // Distance check
  const dx = player.x - monster.x;
  const dz = player.z - monster.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const attackRange = Math.max(data.attackRange || 1.5, 3) + 1.0; // lag buffer
  if (dist > attackRange) return;

  // Wind Sprite immune to melee
  if (data.immuneToMelee) return;

  // Calculate damage (Cahaya v2: atk - def, with crit)
  const isCrit = Math.random() < player.crit;
  let dmg = Math.max(1, player.atk - (monster.def || 0));
  if (isCrit) dmg = Math.floor(dmg * 1.5);
  monster.hp -= dmg;

  // Broadcast to ALL clients (Cahaya v2 pattern — proven reliable)
  broadcast({
    type: 'monster_hit',
    monsterId: monster.id,
    playerId: playerId,
    damage: dmg,
    isCrit,
    hp: Math.max(0, monster.hp),
    maxHp: monster.maxHp,
  });

  // Monster died
  if (monster.hp <= 0) {
    monster.alive = false;
    monster.hp = 0;

    // XP + Gold reward
    const xpGain = data.xp || 0;
    const zenGain = data.zen ? data.zen[0] + Math.floor(Math.random() * (data.zen[1] - data.zen[0])) : 0;
    player.xp += xpGain;
    player.zen = (player.zen || 0) + zenGain;

    // Level up check
    const xpNeeded = 100 + (player.level - 1) * 200;
    let leveledUp = false;
    if (player.xp >= xpNeeded) {
      player.level++;
      player.xp -= xpNeeded;
      player.maxHp += 10; player.hp = player.maxHp;
      player.maxMp += 5; player.mp = player.maxMp;
      player.atk += 1; player.def += 1;
      leveledUp = true;
    }

    // Loot
      const loot = rollLoot(monster.type);
      trackQuestKills(player, monster.type);
      spawnGroundLoot(loot, monster.x, monster.z, playerId);

      broadcast({
      type: 'monster_killed',
      monsterId: monster.id,
      killerId: playerId,
      xp: xpGain,
      zen: zenGain,
      loot,
      level: player.level,
      expToNext: 100 + (player.level - 1) * 200,
      currentXp: player.xp,
      leveledUp,
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
    });
    broadcast({ type: 'monster_died', monsterId: monster.id });
    saveWorld();
  }
}

// --- Quest Kill Tracking ---
function trackQuestKills(player, monsterType) {
  if (!player.quests) return;
  Object.entries(player.quests).forEach(([questId, qState]) => {
    if (qState.status !== 'active') return;
    const questDef = QUESTS[questId];
    if (!questDef) return;
    questDef.objectives.forEach(obj => {
      if (obj.type === 'kill' && obj.target === monsterType) {
        if (!qState.progress) qState.progress = {};
        qState.progress[obj.id] = (qState.progress[obj.id] || 0) + 1;
        // Notify client
        if (player._ws && player._ws.readyState === 1) {
          player._ws.send(JSON.stringify({
            type: 'quest_progress', questId, objectiveId: obj.id,
            current: qState.progress[obj.id],
          }));
        }
      }
    });
  });
}

// --- Quest Talk Tracking ---
// Increment the FIRST incomplete talk objective for this NPC
function trackQuestTalk(player, npcId) {
  if (!player.quests) return;
  Object.entries(player.quests).forEach(([questId, qState]) => {
    if (qState.status !== 'active') return;
    const questDef = QUESTS[questId];
    if (!questDef) return;
    if (!qState.progress) qState.progress = {};
    // Find first incomplete talk objective targeting this NPC
    const obj = questDef.objectives.find(o =>
      o.type === 'talk' && o.target === npcId && (qState.progress[o.id] || 0) < o.required
    );
    if (obj) {
      qState.progress[obj.id] = (qState.progress[obj.id] || 0) + 1;
      if (player._ws && player._ws.readyState === 1) {
        player._ws.send(JSON.stringify({
          type: 'quest_progress', questId, objectiveId: obj.id,
          current: qState.progress[obj.id],
        }));
      }
    }
  });
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

  ws.send(JSON.stringify({ type: 'welcome', playerId, version: 'v3-combat-rebuild', world: { time: Date.now(), region: 'willowmere' }, dayTime: getGameTime() }));

  ws.on('message', (data) => {
    try { handleMessage(ws, playerId, JSON.parse(data)); }
    catch (e) { console.error('[ERROR]', e.message); }
  });

  ws.on('close', () => {
    console.log(`[DISCONNECT] ${playerId}`);
    saveWorld();
    delete connectedPlayers[ws];
    broadcast({ type: 'player_left', playerId });
  });

  ws.on('error', () => {});
});

function handleMessage(ws, playerId, msg) {
  switch (msg.type) {
    case 'join': {
      const isNew = !world.players[Object.keys(world.players).find(k => world.players[k].wallet === msg.wallet)] && msg.wallet;
      const player = getOrCreatePlayer(playerId, msg.name, msg.wallet, msg.customization, msg.persistentId);
      hydrateInventory(player); // merge latest item defs (icons, descriptions)
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
      if (npc) {
        ws.send(JSON.stringify({ type: 'npc_dialogue', npcId: npc.id, name: npc.name, title: npc.title }));
        // Track talk objectives for quests
        const player = connectedPlayers[ws];
        if (player) trackQuestTalk(player, msg.npcId);
      }
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
          saveWorld();
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
            // Apply stats (use class base stats + equipment bonuses)
            const baseStats = recalcClassStats(player.customization);
            player.atk = baseStats.atk;
            player.def = baseStats.def;
            player.spd = baseStats.spd;
            player.crit = baseStats.crit;
            // Sum all equipped items (stats are in .stats sub-object)
            Object.values(player.equipment).forEach(e => {
              if (e && ITEMS[e.id] && ITEMS[e.id].stats) {
                const s = ITEMS[e.id].stats;
                if (s.atk) player.atk += s.atk;
                if (s.def) player.def += s.def;
                if (s.spd) player.spd += s.spd;
                if (s.crit) player.crit += s.crit;
              }
            });
            saveWorld();
            ws.send(JSON.stringify({ type: 'item_equipped', equipment: player.equipment, inventory: player.inventory, atk: player.atk, def: player.def, spd: player.spd, crit: player.crit }));
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
        // Recalc stats (restore class base, then add equipment bonuses)
        const baseStats = recalcClassStats(player.customization);
        player.atk = baseStats.atk;
        player.def = baseStats.def;
        player.spd = baseStats.spd;
        player.crit = baseStats.crit;
        Object.values(player.equipment).forEach(e => {
          if (e && ITEMS[e.id] && ITEMS[e.id].stats) {
            const s = ITEMS[e.id].stats;
            if (s.atk) player.atk += s.atk;
            if (s.def) player.def += s.def;
            if (s.spd) player.spd += s.spd;
            if (s.crit) player.crit += s.crit;
          }
        });
        saveWorld();
        ws.send(JSON.stringify({ type: 'item_unequipped', equipment: player.equipment, inventory: player.inventory, atk: player.atk, def: player.def, spd: player.spd, crit: player.crit }));
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
            ws.send(JSON.stringify({ type: 'level_up', level: player.level, xp: player.xp, maxHp: player.maxHp, maxMp: player.maxMp }));
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
        // Send via broadcast loop below
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
        const itemPrices = {};
        for (const [id, def] of Object.entries(ITEMS)) {
          if (def && def.price) itemPrices[id] = def.price;
        }
        ws.send(JSON.stringify({ type: 'shop_catalog', shopId: msg.npcId, shopName: shop.name, catalog, itemPrices }));
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
        saveWorld();
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
        saveWorld();
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
        broadcast({ type: 'player_respawn', targetId: playerId, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, x: player.x, z: player.z });
      }
      break;
    }
    case 'unlock_skill': {
      // Skills auto-unlock by level — this is now a no-op
      const player = connectedPlayers[ws];
      if (!player) break;
      ws.send(JSON.stringify({ type: 'skill_unlocked', tier: msg.tier, skillPoints: 0, unlockedSkills: player.unlockedSkills }));
      break;
    }
    case 'use_skill': {
      const player = connectedPlayers[ws];
      if (!player) break;
      // Full skill definitions for all tiers (must match client)
      const ALL_SKILLS = {
        laborer: {
          tier1:  { mpCost: 15, damageMulti: 2.5, healMulti: 0, range: 3.5, name: 'Power Smash' },
          tier2a: { mpCost: 25, damageMulti: 3.5, healMulti: 0, range: 4, name: 'Earthquake' },
          tier2b: { mpCost: 20, damageMulti: 0, healMulti: 0, range: 0, name: 'Iron Wall', buff: { stat: 'def', value: 0.5, duration: 10 } },
        },
        miner: {
          tier1:  { mpCost: 20, damageMulti: 3.0, healMulti: 0, range: 4, name: 'Avalanche' },
          tier2a: { mpCost: 30, damageMulti: 4.0, healMulti: 0, range: 4.5, name: 'Blade Storm' },
          tier2b: { mpCost: 15, damageMulti: 0, healMulti: 0, range: 0, name: 'Shadow Step', buff: { stat: 'spd', value: 0.5, duration: 8 } },
        },
        gardener: {
          tier1:  { mpCost: 12, damageMulti: 2.0, healMulti: 0, range: 5, name: 'Thorn Whip' },
          tier2a: { mpCost: 20, damageMulti: 3.0, healMulti: 0, range: 5, name: "Nature's Wrath" },
          tier2b: { mpCost: 18, damageMulti: 0, healMulti: 0.4, range: 0, name: 'Healing Bloom' },
        },
        herbalist: {
          tier1:  { mpCost: 25, damageMulti: 0, healMulti: 0.4, range: 4, name: 'Mystic Heal' },
          tier2a: { mpCost: 35, damageMulti: 0, healMulti: 0.7, range: 0, name: 'Rejuvenation' },
          tier2b: { mpCost: 20, damageMulti: 0, healMulti: 0, range: 0, name: 'Mana Surge', buff: { stat: 'atk', value: 0.3, duration: 12 } },
        },
        watchman: {
          tier1:  { mpCost: 15, damageMulti: 2.5, healMulti: 0, range: 4.5, name: 'Eagle Eye' },
          tier2a: { mpCost: 25, damageMulti: 4.0, healMulti: 0, range: 5, name: 'Piercing Shot', ignoreDef: true },
          tier2b: { mpCost: 18, damageMulti: 0, healMulti: 0, range: 0, name: "Sentinel's Mark", buff: { stat: 'dmgTaken', value: 0.5, duration: 10 } },
        },
      };
      const skillTier = msg.skillTier || 'tier1';
      const classSkills = ALL_SKILLS[player.class];
      if (!classSkills) break;
      const skill = classSkills[skillTier];
      if (!skill) break;
      // Check if unlocked
      if (!player.unlockedSkills || !player.unlockedSkills.includes(skillTier)) {
        ws.send(JSON.stringify({ type: 'combat_message', text: `Skill not unlocked! Reach the required level.` }));
        break;
      }
      if (player.mp < skill.mpCost) {
        ws.send(JSON.stringify({ type: 'combat_message', text: 'Not enough MP!' }));
        break;
      }
      player.mp -= skill.mpCost;

      // Buff skill (no damage/heal, just applies buff)
      if (skill.buff && skill.range === 0) {
        // Apply buff to player (simplified: just notify client)
        ws.send(JSON.stringify({ type: 'skill_used', skillId: skillTier, skillName: skill.name, mp: player.mp, buff: skill.buff }));
        break;
      }

      // Heal skill
      if (skill.healMulti > 0) {
        const healAmt = Math.floor(player.maxHp * skill.healMulti);
        player.hp = Math.min(player.maxHp, player.hp + healAmt);
        ws.send(JSON.stringify({ type: 'skill_used', skillId: skillTier, skillName: skill.name, hp: player.hp, mp: player.mp, heal: healAmt }));
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
      if (dist > skill.range + 1.5) { // generous range
        ws.send(JSON.stringify({ type: 'combat_message', text: 'Too far!' }));
        player.mp += skill.mpCost; // refund
        break;
      }

      const isCrit = Math.random() < player.crit;
      let dmg;
      if (skill.ignoreDef) {
        dmg = Math.max(1, Math.floor(player.atk * skill.damageMulti));
      } else {
        dmg = Math.max(1, Math.floor(player.atk * skill.damageMulti) - Math.floor(monster.def * 0.4));
      }
      if (isCrit) dmg = Math.floor(dmg * 1.5);

      monster.hp -= dmg;
      const skillDisplayHp = Math.max(0, monster.hp);
      if (monster.state === 'idle') { monster.state = 'chase'; monster.target = playerId; }

      broadcast({ type: 'monster_hit', monsterId: monster.id, damage: dmg, isCrit, hp: skillDisplayHp, maxHp: monster.maxHp });
      ws.send(JSON.stringify({ type: 'skill_used', skillId: skillTier, skillName: skill.name, mp: player.mp }));

      if (monster.hp <= 0) {
        monster.alive = false;
        monster.hp = 0;
        const xpGain = data.xp;
        const zenGain = data.zen ? data.zen[0] + Math.floor(Math.random() * (data.zen[1] - data.zen[0])) : 0;
        player.xp += xpGain;
        player.zen = (player.zen || 0) + zenGain;
        const xpNeeded = 100 + (player.level - 1) * 200;
        let leveledUp = false;
        if (player.xp >= xpNeeded) {
          player.level++;
          player.xp -= xpNeeded;
          player.maxHp += 10; player.hp = player.maxHp;
          player.maxMp += 5; player.mp = player.maxMp;
          player.atk += 1; player.def += 1;
          leveledUp = true;
          // Unlock skill tree tiers on level up
          if (!player.unlockedSkills) player.unlockedSkills = ['tier1'];
          if (player.level >= 3 && !player.unlockedSkills.includes('tier2b')) {
            player.unlockedSkills.push('tier2b');
          }
          if (player.level >= 5 && !player.unlockedSkills.includes('tier2a')) {
            player.unlockedSkills.push('tier2a');
          }
          ws.send(JSON.stringify({ type: 'level_up', level: player.level, xp: player.xp, maxHp: player.maxHp, maxMp: player.maxMp, unlockedSkills: player.unlockedSkills }));
        }
        const loot = rollLoot(monster.type);
        trackQuestKills(player, monster.type);
        spawnGroundLoot(loot, monster.x, monster.z, playerId);
        broadcast({
          type: 'monster_killed', monsterId: monster.id, killerId: playerId,
          xp: xpGain, zen: zenGain, loot, level: player.level,
          expToNext: 100 + (player.level - 1) * 200, currentXp: player.xp, leveledUp,
          hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp,
        });
        broadcast({ type: 'monster_died', monsterId: monster.id });
        saveWorld();
        }
        break;
    }
    case 'pickup_loot': {
      const player = connectedPlayers[ws];
      if (player && msg.lootId && groundLoot[msg.lootId]) {
        const lootEntry = groundLoot[msg.lootId];
        addLootToPlayer(player, lootEntry.items);
        delete groundLoot[msg.lootId];
        broadcast({ type: 'ground_loot_remove', lootId: msg.lootId });
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
