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
const { CRAFTING_RECIPES } = require('./shared/crafting');
const { FISHING_SPOTS, FISHING_LOOT, GATHERING_NODES, GATHERING_LOOT } = require('./shared/gathering');
const { WORLD_BOSSES } = require('./shared/bosses');
const { ZONES } = require('./shared/zones');
const { DUNGEONS } = require('./shared/dungeons');

// Module-level CLASS_STATS (used by getOrCreatePlayer + recalcClassStats)
const CLASS_STATS = {
  laborer:  { hp: 120, mp: 30, atk: 8,  def: 7,  spd: 6,  crit: 0.05 },
  miner:    { hp: 90,  mp: 40, atk: 12, def: 4,  spd: 10, crit: 0.10 },
  gardener: { hp: 100, mp: 50, atk: 6,  def: 6,  spd: 8,  crit: 0.08 },
  herbalist:{ hp: 85,  mp: 70, atk: 5,  def: 5,  spd: 7,  crit: 0.05 },
  watchman: { hp: 110, mp: 35, atk: 10, def: 8,  spd: 7,  crit: 0.07 },
};

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
    // Deep copy to avoid mutating live player objects
    const snapshot = JSON.parse(JSON.stringify(world));
    for (const p of Object.values(snapshot.players)) {
      if (p) { delete p._lastAttack; delete p.party; }
    }
    fs.writeFileSync(SAVE_FILE, JSON.stringify(snapshot, null, 2));
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
const connectedPlayers = {}; // keyed by playerId (string), NOT ws object
const playerWs = new Map(); // playerId → ws (kept off player objects to avoid JSON.stringify issues)

// --- Ground Loot System ---
let groundLootIdCounter = 0;
const groundLoot = {}; // lootId → { id, items, x, z, killerId, spawnTime }
const GROUND_LOOT_DESPAWN_MS = 30000; // 30 seconds

// Gathering node state (tracks cooldowns per node per player)
const gatherCooldowns = {}; // nodeId → Date.now() when available again
const fishingCooldowns = {}; // playerId → Date.now() when available again
const FISHING_CAST_MS = 3000; // 3 seconds auto-fishing
const FISHING_COOLDOWN_MS = 8000; // 8 seconds cooldown
const GATHERING_CAST_MS = 2000; // 2 seconds gathering

// World Boss state
const bossState = {}; // bossId → { alive, hp, maxHp, target, lastAbility, nextSpawn, adds }

// Player Trading state
const tradeSessions = {}; // tradeId -> { playerA, playerB, itemsA, itemsB, confirmedA, confirmedB, createdAt }

// Player Kiosk state (free placement anywhere in city)
const KIOSK_CITY_BOUNDS = { minX: -25, maxX: 25, minZ: -25, maxZ: 25 };
const KIOSK_MIN_DISTANCE = 3; // min distance between kiosks
const activeKiosks = {}; // kioskId -> { ownerId, ownerName, x, z, items: [{itemId, name, type, price, quantity, icon}], createdAt }

function spawnGroundLoot(lootItems, x, z, killerId) {
  if (!lootItems || lootItems.length === 0) return;
  const lootId = `gl_${++groundLootIdCounter}`;
  groundLoot[lootId] = { id: lootId, items: lootItems, x, z, killerId, spawnTime: Date.now() };
  broadcast({ type: 'ground_loot_spawn', lootId, items: lootItems, x, z });
  return lootId;
}

// Despawn old ground loot every 5 seconds
setInterval(() => { try {
  const now = Date.now();
  Object.keys(groundLoot).forEach(id => {
    if (now - groundLoot[id].spawnTime > GROUND_LOOT_DESPAWN_MS) {
      delete groundLoot[id];
      broadcast({ type: 'ground_loot_remove', lootId: id });
    }
  });
} catch(e) { console.error('[LOOT-DESPAWN ERROR]', e.message); } }, 5000);


// Startup diagnostics
const playerCount = Object.keys(world.players).length;
console.log(`[BOOT] World loaded: ${playerCount} players saved`);
console.log(`[BOOT] SAVE_DIR=${SAVE_DIR} SAVE_FILE exists=${fs.existsSync(SAVE_FILE)}`);
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
      if (existing.level >= 15 && !existing.unlockedSkills.includes('tier3')) {
        existing.unlockedSkills.push('tier3');
      }
      if (existing.level >= 25 && !existing.unlockedSkills.includes('tier4')) {
        existing.unlockedSkills.push('tier4');
      }
      if (existing.level >= 40 && !existing.unlockedSkills.includes('tier5')) {
        existing.unlockedSkills.push('tier5');
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



// ═══════════════════════════════════════
// WORLD BOSS SYSTEM
// ═══════════════════════════════════════
function spawnWorldBoss(bossId) {
  const data = WORLD_BOSSES[bossId];
  if (!data) return;
  const area = data.spawnAreas[Math.floor(Math.random() * data.spawnAreas.length)];
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * area.radius;
  const boss = {
    id: `boss_${bossId}`,
    type: bossId,
    name: data.name,
    title: data.title,
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
    targetId: null,
    state: 'idle',
    lastAttack: 0,
    lastAbility: {},
    isBoss: true,
    zone: data.zone || null,
    adds: [],
  };
  world.monsters[boss.id] = boss;
  bossState[bossId] = { alive: true, hp: data.hp, nextSpawn: Date.now() + data.spawnInterval };
  broadcast({ type: 'boss_spawn', boss: { id: boss.id, name: data.name, title: data.title, level: data.level, hp: data.hp, maxHp: data.hp, x: boss.x, z: boss.z } });
  broadcast({ type: 'monster_spawn', monster: sanitizeMonster(boss) });
  broadcast({ type: 'system_message', message: '⚠️ ' + data.name + ' (' + data.title + ') telah muncul! Level ' + data.level + ' — kumpulkan party!' });
  console.log('[BOSS] ' + data.name + ' spawned at (' + boss.x.toFixed(0) + ',' + boss.z.toFixed(0) + ')');
}

function bossUseAbility(boss, data, target, abilityDef) {
  const now = Date.now();
  if (boss.lastAbility[abilityDef.name] && now - boss.lastAbility[abilityDef.name] < abilityDef.cooldown) return;
  if (Math.random() > abilityDef.chance) return;
  boss.lastAbility[abilityDef.name] = now;

  if (abilityDef.name === 'slam') {
    // AoE damage to all nearby players
    broadcast({ type: 'boss_ability', bossId: boss.id, ability: 'slam', x: boss.x, z: boss.z, radius: abilityDef.radius });
    for (const p of Object.values(connectedPlayers)) {
      if (!p || p.hp <= 0) continue;
      const dx = (p.x || 0) - boss.x;
      const dz = (p.z || 0) - boss.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d <= abilityDef.radius) {
        const dmg = Math.max(1, abilityDef.damage - (p.def || 0));
        p.hp = Math.max(0, p.hp - dmg);
        const pWs = playerWs.get(p.id);
        if (pWs && pWs.readyState === 1) {
          pWs.send(JSON.stringify({ type: 'boss_hit_you', bossId: boss.id, ability: 'slam', damage: dmg }));
        }
        if (p.hp <= 0) {
          const xpLoss = Math.max(1, Math.floor(p.xp * 0.1));
          p.xp = Math.max(0, p.xp - xpLoss);
          broadcast({ type: 'player_died', targetId: p.id, xpLoss });
          if (pWs && pWs.readyState === 1) {
            pWs.send(JSON.stringify({ type: 'xp_penalty', xpLoss, xp: p.xp }));
            setTimeout(() => {
              p.hp = p.maxHp; p.mp = p.maxMp; p.x = 0; p.z = 0;
              const freshWs = playerWs.get(p.id);
              if (freshWs && freshWs.readyState === 1) {
                freshWs.send(JSON.stringify({ type: 'respawned', x: 0, z: 0, hp: p.hp, maxHp: p.maxHp, mp: p.mp, maxMp: p.maxMp }));
              }
              broadcast({ type: 'player_respawn', targetId: p.id, hp: p.hp, maxHp: p.maxHp, x: 0, z: 0 });
            }, 5000);
          }
          m.state = 'idle';
        }
      }
    }
    console.log('[BOSS] ' + boss.id + ' used SLAM — radius ' + abilityDef.radius);
  } else if (abilityDef.name === 'summon') {
    // Spawn minions
    for (let i = 0; i < abilityDef.count; i++) {
      const addType = abilityDef.type;
      const addData = MONSTERS[addType];
      if (!addData) continue;
      const addAngle = Math.random() * Math.PI * 2;
      const addDist = 2 + Math.random() * 2;
      const add = {
        id: `boss_add_${boss.id}_${Date.now()}_${i}`,
        type: addType,
        name: addData.name + ' (Minion)',
        x: boss.x + Math.cos(addAngle) * addDist,
        y: 0,
        z: boss.z + Math.sin(addAngle) * addDist,
        spawnX: boss.x + Math.cos(addAngle) * addDist,
        spawnZ: boss.z + Math.sin(addAngle) * addDist,
        hp: Math.floor(addData.hp * 0.5),
        maxHp: Math.floor(addData.hp * 0.5),
        atk: addData.atk,
        def: addData.def,
        spd: addData.spd,
        level: addData.level,
        alive: true,
        targetId: null,
        state: 'idle',
        lastAttack: 0,
      };
      world.monsters[add.id] = add;
      boss.adds.push(add.id);
      broadcast({ type: 'monster_spawn', monster: sanitizeMonster(add) });
    }
    broadcast({ type: 'boss_ability', bossId: boss.id, ability: 'summon', count: abilityDef.count });
    console.log('[BOSS] ' + boss.id + ' summoned ' + abilityDef.count + ' adds');
  } else if (abilityDef.name === 'charge') {
    // High single-target damage
    if (!target) return;
    const dx = (target.x || 0) - boss.x;
    const dz = (target.z || 0) - boss.z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d > abilityDef.range) return;
    const dmg = Math.max(1, abilityDef.damage - (target.def || 0));
    target.hp = Math.max(0, target.hp - dmg);
    const tWs = playerWs.get(target.id);
    if (tWs && tWs.readyState === 1) {
      tWs.send(JSON.stringify({ type: 'boss_hit_you', bossId: boss.id, ability: 'charge', damage: dmg }));
    }
    broadcast({ type: 'boss_ability', bossId: boss.id, ability: 'charge', targetId: target.id, damage: dmg });
    if (target.hp <= 0) {
      const xpLoss = Math.max(1, Math.floor(target.xp * 0.1));
      target.xp = Math.max(0, target.xp - xpLoss);
      broadcast({ type: 'player_died', targetId: target.id, xpLoss });
      if (tWs && tWs.readyState === 1) {
        tWs.send(JSON.stringify({ type: 'xp_penalty', xpLoss, xp: target.xp }));
        setTimeout(() => {
          target.hp = target.maxHp; target.mp = target.maxMp; target.x = 0; target.z = 0;
          const freshWs = playerWs.get(target.id);
          if (freshWs && freshWs.readyState === 1) {
            freshWs.send(JSON.stringify({ type: 'respawned', x: 0, z: 0, hp: target.hp, maxHp: target.maxHp, mp: target.mp, maxMp: target.maxMp }));
          }
          broadcast({ type: 'player_respawn', targetId: target.id, hp: target.hp, maxHp: target.maxHp, x: 0, z: 0 });
        }, 5000);
      }
      boss.targetId = null;
    }
    console.log('[BOSS] ' + boss.id + ' CHARGED ' + target.id + ' for ' + dmg + ' damage');
  }
}

// Boss spawn timer
setInterval(() => { try {
  for (const [bossId, data] of Object.entries(WORLD_BOSSES)) {
    const state = bossState[bossId];
    // Check if boss needs to spawn
    if (!state || (!state.alive && Date.now() >= (state.nextSpawn || 0))) {
      // Clean up dead boss
      if (state && state.alive) continue;
      spawnWorldBoss(bossId);
    }
  }
} catch(e) { console.error('[BOSS-TIMER ERROR]', e.message); } }, 10000);



// ═══════════════════════════════════════
// DUNGEON SYSTEM
// ═══════════════════════════════════════
const dungeonInstances = {}; // instanceId → { dungeon, players, wave, startTime, mobs, bossActive }
const dungeonLeaderboard = {}; // dungeonId → [{ playerId, name, time, level }]
const dungeonCooldowns = {}; // playerId:dungeonId → lastCompletionTime

function createDungeonInstance(dungeonId, leaderId) {
  const dungeon = DUNGEONS[dungeonId];
  if (!dungeon) return null;
  const instanceId = `dungeon_${dungeonId}_${Date.now()}`;
  dungeonInstances[instanceId] = {
    dungeon,
    dungeonId,
    players: [leaderId],
    wave: 0,
    startTime: Date.now(),
    mobs: {},
    bossActive: false,
    completed: false,
    failed: false,
  };
  return instanceId;
}

function spawnDungeonWave(instanceId) {
  const inst = dungeonInstances[instanceId];
  if (!inst || inst.completed || inst.failed) return;
  const dungeon = inst.dungeon;
  if (inst.wave >= dungeon.waves.length) {
    // All waves cleared — dungeon complete!
    completeDungeon(instanceId);
    return;
  }
  const wave = dungeon.waves[inst.wave];
  inst.wave++;
  console.log(`[DUNGEON] ${inst.dungeonId} wave ${inst.wave}/${dungeon.waves.length}`);

  if (wave.boss) {
    // Spawn boss
    const bossData = WORLD_BOSSES[wave.boss];
    if (bossData) {
      const boss = {
        id: `dmob_${instanceId}_boss`,
        type: wave.boss,
        name: bossData.name,
        x: 0, y: 0, z: -15,
        spawnX: 0, spawnZ: -15,
        hp: bossData.hp,
        maxHp: bossData.hp,
        atk: bossData.atk,
        def: bossData.def,
        spd: bossData.spd,
        level: bossData.level,
        alive: true,
        targetId: null,
        state: 'idle',
        lastAttack: 0,
        lastAbility: {},
        isBoss: true,
        adds: [],
      };
      inst.mobs[boss.id] = boss;
      inst.bossActive = true;
      // Notify players
      inst.players.forEach(pId => {
        const pWs = playerWs.get(pId);
        if (pWs && pWs.readyState === 1) {
          pWs.send(JSON.stringify({ type: 'dungeon_boss', bossId: boss.id, name: boss.name, hp: boss.hp, maxHp: boss.hp }));
        }
      });
    }
  } else if (wave.mobs) {
    // Spawn regular mobs
    wave.mobs.forEach(({ type, count }) => {
      const mdata = MONSTERS[type] || WORLD_BOSSES[type];
      if (!mdata) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 10;
        const mob = {
          id: `dmob_${instanceId}_${++monsterIdCounter}`,
          type,
          name: mdata.name,
          x: Math.cos(angle) * dist,
          y: 0,
          z: Math.sin(angle) * dist - 10,
          spawnX: Math.cos(angle) * dist,
          spawnZ: Math.sin(angle) * dist - 10,
          hp: mdata.hp,
          maxHp: mdata.hp,
          atk: mdata.atk,
          def: mdata.def,
          spd: mdata.spd,
          level: mdata.level,
          alive: true,
          targetId: null,
          state: 'idle',
          lastAttack: 0,
        };
        inst.mobs[mob.id] = mob;
      }
    });
  }

  // Send wave start to players
  inst.players.forEach(pId => {
    const pWs = playerWs.get(pId);
    if (pWs && pWs.readyState === 1) {
      const mobList = Object.values(inst.mobs).filter(m => m.alive).map(m => ({ id: m.id, name: m.name, hp: m.hp, maxHp: m.maxHp, x: m.x, z: m.z, level: m.level }));
      pWs.send(JSON.stringify({ type: 'dungeon_wave', wave: inst.wave, totalWaves: dungeon.waves.length, mobs: mobList }));
    }
  });
}

function completeDungeon(instanceId) {
  const inst = dungeonInstances[instanceId];
  if (!inst || inst.completed) return;
  inst.completed = true;
  const elapsed = Date.now() - inst.startTime;
  const dungeon = inst.dungeon;

  inst.players.forEach(pId => {
    const p = connectedPlayers[pId];
    const pWs = playerWs.get(pId);
    if (!p || !pWs || pWs.readyState !== 1) return;

    // Give rewards
    p.xp = (p.xp || 0) + dungeon.rewards.xp;
    p.zen = (p.zen || 0) + dungeon.rewards.gold;
    const loot = [];
    dungeon.rewards.items.forEach(entry => {
      if (Math.random() < entry.chance) {
        const qty = entry.qty || 1;
        const itemDef = ITEMS[entry.itemId];
        if (itemDef) {
          const existing = p.inventory ? p.inventory.find(i => i.id === entry.itemId) : null;
          if (existing) existing.quantity = (existing.quantity || 1) + qty;
          else { if (!p.inventory) p.inventory = []; p.inventory.push({ id: entry.itemId, name: itemDef.name, type: itemDef.type, quantity: qty, icon: itemDef.icon }); }
          loot.push({ id: entry.itemId, name: itemDef.name, quantity: qty });
        }
      }
    });

    // Update leaderboard
    if (!dungeonLeaderboard[dungeon.id]) dungeonLeaderboard[dungeon.id] = [];
    dungeonLeaderboard[dungeon.id].push({ playerId: pId, name: p.name, time: elapsed, level: p.level, date: Date.now() });
    dungeonLeaderboard[dungeon.id].sort((a, b) => a.time - b.time);
    dungeonLeaderboard[dungeon.id] = dungeonLeaderboard[dungeon.id].slice(0, 10); // top 10

    // Set cooldown
    if (dungeon.cooldown > 0) {
      dungeonCooldowns[`${pId}:${dungeon.id}`] = Date.now();
    }

    pWs.send(JSON.stringify({ type: 'dungeon_complete', dungeonId: dungeon.id, xp: dungeon.rewards.xp, gold: dungeon.rewards.gold, loot, time: elapsed }));
    saveWorld();
  });

  // Cleanup instance after 30 seconds
  setTimeout(() => { delete dungeonInstances[instanceId]; }, 30000);
}

function failDungeon(instanceId) {
  const inst = dungeonInstances[instanceId];
  if (!inst || inst.completed || inst.failed) return;
  inst.failed = true;
  inst.players.forEach(pId => {
    const pWs = playerWs.get(pId);
    if (pWs && pWs.readyState === 1) {
      pWs.send(JSON.stringify({ type: 'dungeon_failed', dungeonId: inst.dungeonId }));
    }
  });
  setTimeout(() => { delete dungeonInstances[instanceId]; }, 10000);
}

// Dungeon tick — check timers, spawn waves, AI
setInterval(() => { try {
  Object.entries(dungeonInstances).forEach(([instId, inst]) => {
    if (inst.completed || inst.failed) return;
    const dungeon = inst.dungeon;
    const elapsed = (Date.now() - inst.startTime) / 1000;

    // Check time limit
    if (elapsed > dungeon.timeLimit) {
      failDungeon(instId);
      return;
    }

    // Check if all mobs dead → next wave
    const aliveMobs = Object.values(inst.mobs).filter(m => m.alive);
    if (aliveMobs.length === 0 && inst.wave < dungeon.waves.length) {
      const lastWave = dungeon.waves[inst.wave - 1];
      const delay = lastWave ? (lastWave.delay || 3000) : 3000;
      // Wait delay then spawn next wave
      setTimeout(() => spawnDungeonWave(instId), delay);
      return;
    }

    // Simple AI for dungeon mobs
    aliveMobs.forEach(mob => {
      if (mob.isBoss) return; // boss AI handled separately
      const data = MONSTERS[mob.type] || WORLD_BOSSES[mob.type];
      if (!data) return;

      // Find closest player in instance
      let closest = null, closestDist = Infinity;
      inst.players.forEach(pId => {
        const p = connectedPlayers[pId];
        if (!p) return;
        const dx = (p.x || 0) - mob.x;
        const dz = (p.z || 0) - mob.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < closestDist) { closestDist = dist; closest = p; }
      });

      if (closest && closestDist < (data.aggroRange || 8)) {
        // Chase
        const dx = (closest.x || 0) - mob.x;
        const dz = (closest.z || 0) - mob.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > (data.attackRange || 1.5)) {
          const speed = data.spd * 0.15;
          mob.x += (dx / dist) * speed;
          mob.z += (dz / dist) * speed;
        } else if (Date.now() - mob.lastAttack > (data.attackSpeed || 1.5) * 1000) {
          // Attack
          const dmg = Math.max(1, mob.atk - (closest.def || 0));
          closest.hp = Math.max(0, (closest.hp || 0) - dmg);
          mob.lastAttack = Date.now();
          inst.players.forEach(pId => {
            const pWs = playerWs.get(pId);
            if (pWs && pWs.readyState === 1) {
              pWs.send(JSON.stringify({ type: 'dungeon_damage', targetId: closest.id, damage: dmg, hp: closest.hp, maxHp: closest.maxHp, attackerId: mob.id }));
            }
          });
          if (closest.hp <= 0) {
            // Player died in dungeon — fail
            failDungeon(instId);
          }
        }
      }
    });

    // Send mob positions to players
    const mobPositions = Object.values(inst.mobs).filter(m => m.alive).map(m => ({ id: m.id, x: m.x, z: m.z, hp: m.hp, maxHp: m.maxHp }));
    inst.players.forEach(pId => {
      const pWs = playerWs.get(pId);
      if (pWs && pWs.readyState === 1) {
        pWs.send(JSON.stringify({ type: 'dungeon_mobs', mobs: mobPositions, timeLeft: Math.max(0, dungeon.timeLimit - elapsed) }));
      }
    });
  });
} catch(e) { console.error('[DUNGEON-TICK ERROR]', e.message); } }, 1000);


// ═══════════════════════════════════════
// ZONE-BASED MOB SPAWNING
// ═══════════════════════════════════════
function spawnZoneMobs(zoneId) {
  const zone = ZONES[zoneId];
  if (!zone) return;
  // Count existing mobs in this zone
  const existing = Object.values(world.monsters).filter(m => m.alive && m.zone === zoneId);
  const toSpawn = (zone.maxMobs || 10) - existing.length;
  if (toSpawn <= 0) return;
  for (let i = 0; i < toSpawn; i++) {
    const mobType = zone.mobTypes[Math.floor(Math.random() * zone.mobTypes.length)];
    const data = MONSTERS[mobType];
    if (!data) continue;
    const area = zone.spawnAreas[Math.floor(Math.random() * zone.spawnAreas.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * area.radius;
    const monster = {
      id: `zmob_${zoneId}_${++monsterIdCounter}`,
      type: mobType,
      zone: zoneId,
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
      targetId: null,
      state: 'idle',
      lastAttack: 0,
    };
    world.monsters[monster.id] = monster;
  }
  console.log('[ZONE-SPAWN] ' + zoneId + ': spawned ' + Math.min(toSpawn, zone.mobTypes.length) + ' mobs');
}

// Spawn initial zone mobs
for (const zoneId of Object.keys(ZONES)) {
  spawnZoneMobs(zoneId);
}

// Legacy spawnMonsters() removed — zone system handles all spawning

// Respawn timer
setInterval(() => { try {
  Object.values(world.monsters).forEach(m => {
    if (m.isBoss) return; // bosses use their own spawn timer
    // Respawn zone mobs that are dead
    if (!m.alive && m.zone && m.respawnAt && Date.now() >= m.respawnAt) {
      const zDef = ZONES[m.zone];
      const data = MONSTERS[m.type];
      if (zDef && data) {
        const area = zDef.spawnAreas[Math.floor(Math.random() * zDef.spawnAreas.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * area.radius;
        m.x = area.x + Math.cos(angle) * dist;
        m.z = area.z + Math.sin(angle) * dist;
        m.spawnX = m.x; m.spawnZ = m.z;
        m.hp = data.hp; m.alive = true; m.targetId = null; m.state = 'idle';
        delete m.respawnAt;
        broadcast({ type: 'monster_spawn', monster: sanitizeMonster(m) });
      }
      return;
    }
    if (m.isBoss) return; // bosses use their own spawn timer
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
} catch(e) { console.error('[RESPAWN-LOOP ERROR]', e.message); } }, 5000);

// --- Monster AI (Cahaya v2 pattern) ---
let aiDebugCounter = 0;
setInterval(() => {
  try {
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
      // Boss cleanup in AI loop
      if (m.isBoss) {
        const bd = WORLD_BOSSES[m.type];
        if (bd && bossState[m.type]) {
          bossState[m.type].alive = false;
          bossState[m.type].nextSpawn = Date.now() + bd.spawnInterval;
        }
        if (m.adds) {
          for (const addId of m.adds) {
            if (world.monsters[addId] && world.monsters[addId].alive) {
              world.monsters[addId].alive = false;
              broadcast({ type: 'monster_killed', monsterId: addId, killerId: 'system' });
            }
          }
          m.adds = [];
        }
        broadcast({ type: 'boss_killed', bossId: m.id, bossType: m.type });
        broadcast({ type: 'system_message', message: '💀 ' + (bd?.name || 'Boss') + ' telah dikalahkan!' });
      }
      m.alive = false;
      m.state = 'idle';
      continue;
    }

    // Boss AI — use abilities
    if (m.isBoss) {
      const bossData = WORLD_BOSSES[m.type];
      if (bossData && m.targetId) {
        const targetPlayer = connectedPlayers[m.targetId];
        if (targetPlayer && targetPlayer.hp > 0) {
          for (const ability of bossData.abilities) {
            bossUseAbility(m, bossData, targetPlayer, ability);
          }
        }
      }
    }

    // Find closest player (same zone only)
    let closestPlayer = null;
    let closestDist = Infinity;
    for (const p of Object.values(connectedPlayers)) {
      if (!p || p.hp <= 0) continue;
      if (m.zone && p.region !== m.zone) continue; // zone filter
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
          // Gold penalty: lose 10% of gold (capped at 50z)
          const goldLoss = Math.min(50, Math.max(1, Math.floor((closestPlayer.zen || 0) * 0.1)));
          closestPlayer.zen = Math.max(0, (closestPlayer.zen || 0) - goldLoss);
          // Use playerWs Map — _ws on player objects breaks JSON.stringify
          const dyingWs = playerWs.get(closestPlayer.id);
          broadcast({ type: 'player_died', targetId: closestPlayer.id, xpLoss, goldLoss });
          if (dyingWs && dyingWs.readyState === 1) {
            dyingWs.send(JSON.stringify({ type: 'xp_penalty', xpLoss, xp: closestPlayer.xp, goldLoss, zen: closestPlayer.zen }));
          }
          // Auto-respawn after 5 seconds
          setTimeout(() => {
            closestPlayer.hp = closestPlayer.maxHp;
            closestPlayer.mp = closestPlayer.maxMp;
            closestPlayer.x = 0;
            closestPlayer.z = 0;
            broadcast({ type: 'player_respawn', targetId: closestPlayer.id, hp: closestPlayer.hp, maxHp: closestPlayer.maxHp, mp: closestPlayer.mp, maxMp: closestPlayer.maxMp, x: 0, z: 0 });
            const freshWs = playerWs.get(closestPlayer.id);
            if (freshWs && freshWs.readyState === 1) {
              freshWs.send(JSON.stringify({ type: 'respawned', x: 0, z: 0, hp: closestPlayer.hp, maxHp: closestPlayer.maxHp, mp: closestPlayer.mp, maxMp: closestPlayer.maxMp }));
            }
          }, 5000);
          m.state = 'idle';
          saveWorld(); // persist death state
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
  } catch(e) { console.error('[AI-LOOP ERROR]', e.message); }
}, 200);

function handleAttack(ws, playerId, msg) {
  const player = connectedPlayers[playerId];
  const monster = world.monsters[msg.monsterId];
  if (!player || !monster || !monster.alive) return;
  if (monster.hp <= 0) return;
  if (player.hp <= 0) return; // dead players can't attack

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

  // Boss HP update to all clients
  if (monster.isBoss) {
    broadcast({
      type: 'boss_hp_update',
      bossId: monster.id,
      hp: Math.max(0, monster.hp),
      maxHp: monster.maxHp,
    });
  }

  // Monster died
  if (monster.hp <= 0) {
    monster.alive = false;
    monster.hp = 0;

    // Boss death — special handling
    if (monster.isBoss) {
      const bossData = WORLD_BOSSES[monster.type];
      if (bossData) {
        // Remove adds
        if (monster.adds) {
          for (const addId of monster.adds) {
            if (world.monsters[addId]) {
              world.monsters[addId].alive = false;
              broadcast({ type: 'monster_killed', monsterId: addId, killerId: playerId });
            }
          }
          monster.adds = [];
        }
        // Boss loot
        const bossLoot = [];
        for (const entry of bossData.loot) {
          if (Math.random() <= entry.chance) {
            const qty = entry.qty[0] + Math.floor(Math.random() * (entry.qty[1] - entry.qty[0] + 1));
            const def = ITEMS[entry.itemId];
            bossLoot.push({ id: entry.itemId, name: def?.name || entry.itemId, type: def?.type || 'material', quantity: qty, icon: def?.icon });
          }
        }
        spawnGroundLoot(bossLoot, monster.x, monster.z, playerId);
        player.xp += bossData.xpReward;
        // Level up check
        const xpNeeded = 50 * Math.min(player.level, 49) + 5 * Math.pow(Math.min(player.level, 49), 2);
        let leveledUp = false;
        if (player.xp >= xpNeeded) {
          player.level++;
          player.xp -= xpNeeded;
          player.maxHp += 10; player.hp = player.maxHp;
          player.maxMp += 5; player.mp = player.maxMp;
          player.atk += 1; player.def += 1;
          leveledUp = true;
        }
        // Mark boss dead + schedule next spawn
        if (bossState[monster.type]) {
          bossState[monster.type].alive = false;
          bossState[monster.type].nextSpawn = Date.now() + bossData.spawnInterval;
        }
        broadcast({ type: 'boss_killed', bossId: monster.id, bossType: monster.type, killerId: playerId, killerName: player.name });
        broadcast({ type: 'system_message', message: '🏆 ' + player.name + ' telah mengalahkan ' + bossData.name + '! +500 XP!' });
        saveWorld();
        return; // skip normal monster loot (boss handled)
      }
    }

    // XP + Gold reward (normal mobs)
    const xpGain = data.xp || 0;
    const zenGain = data.zen ? data.zen[0] + Math.floor(Math.random() * (data.zen[1] - data.zen[0])) : 0;
    player.xp += xpGain;
    player.zen = (player.zen || 0) + zenGain;

    // Party XP share — nearby party members get 30% XP each
    if (player.party && player.party.members.length > 1) {
      const partyShare = Math.floor(xpGain * 0.3);
      player.party.members.forEach(mId => {
        if (mId === playerId) return; // skip killer
        const memberWs = playerWs.get(mId);
        if (!memberWs || memberWs.readyState !== 1) return;
        const member = connectedPlayers[mId];
        if (!member) return;
        // Check distance (must be within 15 units)
        const dx = (member.x || 0) - monster.x;
        const dz = (member.z || 0) - monster.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 15) return; // too far
        member.xp = (member.xp || 0) + partyShare;
        memberWs.send(JSON.stringify({
          type: 'party_xp',
          xp: partyShare,
          xpGain: partyShare,
          from: player.name,
          monster: monster.name,
          currentXp: member.xp,
          level: member.level,
          expToNext: 50 * Math.min(member.level || 1, 49) + 5 * Math.pow(Math.min(member.level || 1, 49), 2),
        }));
      });
    }

    // Level up check
    const xpNeeded = 50 * Math.min(player.level, 49) + 5 * Math.pow(Math.min(player.level, 49), 2);
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
      expToNext: 50 * Math.min(player.level, 49) + 5 * Math.pow(Math.min(player.level, 49), 2),
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
        const qWs = playerWs.get(player.id);
        if (qWs && qWs.readyState === 1) {
          qWs.send(JSON.stringify({
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
      const qWs = playerWs.get(player.id);
      if (qWs && qWs.readyState === 1) {
        qWs.send(JSON.stringify({
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
  // Zone data is sent AFTER join (when player object exists with region)

  ws.on('message', (data) => {
    try { handleMessage(ws, playerId, JSON.parse(data)); }
    catch (e) { console.error('[ERROR]', e.message); }
  });

  ws.on('close', () => {
    console.log(`[DISCONNECT] ${playerId}`);
    // Clean up trade sessions
    for (const [tid, sess] of Object.entries(tradeSessions)) {
      if (sess.playerA === playerId || sess.playerB === playerId) {
        const otherId = sess.playerA === playerId ? sess.playerB : sess.playerA;
        const otherWs = playerWs.get(otherId);
        if (otherWs && otherWs.readyState === 1) otherWs.send(JSON.stringify({ type: 'trade_cancelled', tradeId: tid }));
        delete tradeSessions[tid];
      }
    }
    playerWs.delete(playerId);
    saveWorld();
    delete connectedPlayers[playerId];
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
      connectedPlayers[playerId] = player;
      playerWs.set(playerId, ws);
      ws.playerId = playerId;
      ws.send(JSON.stringify({
        type: 'joined', player, npcs: world.npcs,
        returning: !!msg.wallet && !isNew,
        onlinePlayers: Object.values(connectedPlayers).filter(p => p.id !== playerId),
        monsters: Object.values(world.monsters).filter(m => m.alive).map(sanitizeMonster),
      }));
      // Send zone data AFTER join (player.region now exists)
      const playerZone = player.region || 'willowmere';
      const zoneDef = ZONES[playerZone];
      console.log(`[JOIN] ${player.name} zone=${playerZone} zoneDef=${!!zoneDef} portals=${zoneDef?.portals?.length || 0}`);
      if (zoneDef) {
        const zonePayload = { id: zoneDef.id, name: zoneDef.name, subtitle: zoneDef.subtitle, level: zoneDef.level, groundColor: zoneDef.groundColor, portals: zoneDef.portals || [], decorations: zoneDef.decorations || [] };
        console.log(`[ZONE] Sending zone_enter to ${player.name}: ${zonePayload.id} with ${zonePayload.portals.length} portals`);
        ws.send(JSON.stringify({ type: 'zone_enter', zone: zonePayload }));
      }
      broadcast({ type: 'player_joined', player }, ws);
      break;
    }
    case 'move': {
      const player = connectedPlayers[playerId];
      if (player) {
        player.x = msg.x; player.y = msg.y; player.z = msg.z;
        broadcast({ type: 'player_moved', playerId, x: msg.x, y: msg.y, z: msg.z }, ws);
      }
      break;
    }
    case 'chat': {
      const player = connectedPlayers[playerId];
      if (player) broadcast({ type: 'chat', playerId, name: player.name, message: (msg.message || '').slice(0, 200) }, ws);
      break;
    }
    case 'interact_npc': {
      const npc = world.npcs[msg.npcId];
      if (npc) {
        ws.send(JSON.stringify({ type: 'npc_dialogue', npcId: npc.id, name: npc.name, title: npc.title }));
        // Track talk objectives for quests
        const player = connectedPlayers[playerId];
        if (player) trackQuestTalk(player, msg.npcId);
      }
      break;
    }
    case 'attack': {
      handleAttack(ws, playerId, msg);
      break;
    }
    case 'use_item': {
      const player = connectedPlayers[playerId];
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
      const player = connectedPlayers[playerId];
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
            // Apply stats (use class base stats + level bonus + equipment)
            const baseStats = recalcClassStats(player.customization);
            const lvlBonus = (player.level - 1);
            player.atk = baseStats.atk + lvlBonus;
            player.def = baseStats.def + lvlBonus;
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
      const player = connectedPlayers[playerId];
      if (player && player.equipment[msg.slot]) {
        player.inventory.push(player.equipment[msg.slot]);
        delete player.equipment[msg.slot];
        // Recalc stats (restore class base + level bonus, then add equipment)
        const baseStats = recalcClassStats(player.customization);
        const lvlBonus = (player.level - 1);
        player.atk = baseStats.atk + lvlBonus;
        player.def = baseStats.def + lvlBonus;
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
      const player = connectedPlayers[playerId];
      if (player && QUESTS[msg.questId]) {
        const quest = QUESTS[msg.questId];
        if (!player.quests) player.quests = {};
        // Check cooldown for repeatable quests
        if (quest.repeatable && quest.cooldown) {
          const lastComplete = player.quests[msg.questId]?.lastCompleted || 0;
          if (Date.now() - lastComplete < quest.cooldown) {
            const remaining = Math.ceil((quest.cooldown - (Date.now() - lastComplete)) / 60000);
            ws.send(JSON.stringify({ type: 'quest_error', error: `Cooldown: ${remaining} menit lagi` }));
            break;
          }
        }
        // Check if already active
        if (player.quests[msg.questId]?.status === 'active') break;
        // Reset progress for repeatable
        player.quests[msg.questId] = { status: 'active', progress: {} };
        saveWorld();
        ws.send(JSON.stringify({ type: 'quest_started', quest }));
      }
      break;
    }
    case 'quest_complete': {
      const player = connectedPlayers[playerId];
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
          const xpNeeded = 50 * Math.min(player.level, 49) + 5 * Math.pow(Math.min(player.level, 49), 2);
          if (player.xp >= xpNeeded) {
            if (player.level < 50) {
              player.level++;
              player.xp -= xpNeeded;
              const hpGain = 15 + player.level * 2;
              const mpGain = 8 + player.level;
              const statGain = 1 + Math.floor(player.level / 5);
              player.maxHp += hpGain; player.hp = player.maxHp;
              player.maxMp += mpGain; player.mp = player.maxMp;
              player.atk += statGain; player.def += statGain;
              if (!player.unlockedSkills) player.unlockedSkills = ['tier1'];
            }
            if (player.level >= 3 && !player.unlockedSkills.includes('tier2b')) player.unlockedSkills.push('tier2b');
            if (player.level >= 5 && !player.unlockedSkills.includes('tier2a')) player.unlockedSkills.push('tier2a');
            if (player.level >= 15 && !player.unlockedSkills.includes('tier3')) player.unlockedSkills.push('tier3');
            if (player.level >= 25 && !player.unlockedSkills.includes('tier4')) player.unlockedSkills.push('tier4');
            if (player.level >= 40 && !player.unlockedSkills.includes('tier5')) player.unlockedSkills.push('tier5');
            ws.send(JSON.stringify({ type: 'level_up', level: player.level, xp: player.xp, maxHp: player.maxHp, maxMp: player.maxMp, unlockedSkills: player.unlockedSkills }));
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
        // Track last completion for repeatable quests
        if (quest.repeatable) {
          qState.lastCompleted = Date.now();
          qState.status = 'completed';
        }
        saveWorld();
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
      const player = connectedPlayers[playerId];
      if (player && player.quests?.[msg.questId]) {
        const qState = player.quests[msg.questId];
        if (!qState.progress) qState.progress = {};
        qState.progress[msg.objectiveId] = (qState.progress[msg.objectiveId] || 0) + (msg.amount || 1);
        ws.send(JSON.stringify({ type: 'quest_progress', questId: msg.questId, objectiveId: msg.objectiveId, current: qState.progress[msg.objectiveId] }));
      }
      break;
    }
    case 'get_quests': {
      const player = connectedPlayers[playerId];
      if (player) ws.send(JSON.stringify({ type: 'quest_list', quests: player.quests || {} }));
      break;
    }
    case 'party_invite': {
      const inviter = connectedPlayers[playerId];
      if (inviter) {
        if (!inviter.party) inviter.party = { leader: inviter.id, members: [inviter.id] };
        const targetPlayer = Object.values(connectedPlayers).find(p => p.name === msg.targetName);
        if (targetPlayer) {
          const targetWs = playerWs.get(targetPlayer.id);
          if (targetWs && targetWs.readyState === 1) {
            targetWs.send(JSON.stringify({ type: 'party_invite', from: inviter.name, fromId: inviter.id }));
          }
        }
      }
      break;
    }
    case 'party_accept': {
      const player = connectedPlayers[playerId];
      const inviter = connectedPlayers[msg.inviterId];
      if (player && inviter) {
        if (!inviter.party) inviter.party = { leader: inviter.id, members: [inviter.id] };
        inviter.party.members.push(player.id);
        player.party = inviter.party;
        // Notify all party members
        inviter.party.members.forEach(mId => {
          const p = connectedPlayers[mId];
          if (p) {
            const mWs = playerWs.get(mId);
            const members = inviter.party.members.map(mid => {
              const mp = connectedPlayers[mid];
                return mp ? { id: mp.id, name: mp.name } : null;
              }).filter(Boolean);
              if (mWs && mWs.readyState === 1) mWs.send(JSON.stringify({ type: 'party_update', party: { leader: inviter.party.leader, members } }));
          }
        });
      }
      break;
    }
    case 'party_leave': {
      const player = connectedPlayers[playerId];
      if (player && player.party) {
        const party = player.party;
        party.members = party.members.filter(id => id !== player.id);
        // Notify remaining members
        party.members.forEach(mId => {
          const p = connectedPlayers[mId];
          if (p) {
            const mWs = playerWs.get(mId);
            const members = party.members.map(mid => {
              const mp = connectedPlayers[mid];
                return mp ? { id: mp.id, name: mp.name } : null;
              }).filter(Boolean);
              if (mWs && mWs.readyState === 1) mWs.send(JSON.stringify({ type: 'party_update', party: { leader: party.leader, members } }));
          }
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
      const player = connectedPlayers[playerId];
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
      const player = connectedPlayers[playerId];
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
        saveWorld(); // save AFTER inventory + zen updated
        ws.send(JSON.stringify({ type: 'shop_result', action: 'buy', itemId: msg.itemId, quantity: qty, cost: totalCost, zen: player.zen, inventory: player.inventory }));
      }
      break;
    }
    case 'sell_item': {
      const player = connectedPlayers[playerId];
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
        // Fishing handlers
    case 'fish_cast': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const spot = FISHING_SPOTS.find(s => s.id === msg.spotId);
      if (!spot) { ws.send(JSON.stringify({ type: 'fish_error', error: 'Fishing spot not found' })); break; }
      // Check fishing cooldown
      if (fishingCooldowns[playerId] && Date.now() < fishingCooldowns[playerId]) {
        const waitSec = Math.ceil((fishingCooldowns[playerId] - Date.now()) / 1000);
        ws.send(JSON.stringify({ type: 'fish_error', error: 'Tunggu ' + waitSec + 's lagi!' }));
        break;
      }
      // Check distance
      const fdx = (player.x || 0) - spot.x;
      const fdz = (player.z || 0) - spot.z;
      if (Math.sqrt(fdx*fdx + fdz*fdz) > 5) { ws.send(JSON.stringify({ type: 'fish_error', error: 'Terlalu jauh! Dekati fishing spot.' })); break; }
      // Set cooldown + start auto-fishing
      fishingCooldowns[playerId] = Date.now() + FISHING_COOLDOWN_MS;
      ws.send(JSON.stringify({ type: 'fish_started', spotId: spot.id, duration: FISHING_CAST_MS }));
      // Auto-complete after timer
      setTimeout(() => {
        const p = connectedPlayers[playerId];
        if (!p) return;
        const roll = Math.random();
        let caught = null;
        let cumulative = 0;
        for (const entry of FISHING_LOOT) {
          cumulative += entry.chance;
          if (roll <= cumulative) {
            const qty = entry.qty[0] + Math.floor(Math.random() * (entry.qty[1] - entry.qty[0] + 1));
            caught = { itemId: entry.itemId, name: entry.name, qty };
            break;
          }
        }
        if (!caught) { ws.send(JSON.stringify({ type: 'fish_result', success: false, message: 'Ikan lepas! Coba lagi...' })); return; }
        if (!p.inventory) p.inventory = [];
        const existing = p.inventory.find(i => i.id === caught.itemId);
        if (existing) existing.quantity = (existing.quantity || 1) + caught.qty;
        else {
          const def = ITEMS[caught.itemId];
          p.inventory.push({ id: caught.itemId, name: caught.name, type: def?.type || 'material', quantity: caught.qty, icon: def?.icon });
        }
        saveWorld();
        ws.send(JSON.stringify({ type: 'fish_result', success: true, item: caught, inventory: p.inventory }));
      }, FISHING_CAST_MS);
      break;
    }
    // Gathering handlers
    case 'gather_node': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const node = GATHERING_NODES.find(n => n.id === msg.nodeId);
      if (!node) { ws.send(JSON.stringify({ type: 'gather_error', error: 'Node not found' })); break; }
      // Check cooldown
      if (gatherCooldowns[node.id] && Date.now() < gatherCooldowns[node.id]) {
        const waitSec = Math.ceil((gatherCooldowns[node.id] - Date.now()) / 1000);
        ws.send(JSON.stringify({ type: 'gather_error', error: 'Node ini cooldown ' + waitSec + 's lagi' }));
        break;
      }
      // Check distance
      const gdx = (player.x || 0) - node.x;
      const gdz = (player.z || 0) - node.z;
      if (Math.sqrt(gdx*gdx + gdz*gdz) > 5) { ws.send(JSON.stringify({ type: 'gather_error', error: 'Terlalu jauh! Dekati node.' })); break; }
      // Set cooldown + send gather_started
      gatherCooldowns[node.id] = Date.now() + (node.respawnTime || 60) * 1000;
      ws.send(JSON.stringify({ type: 'gather_started', nodeId: node.id, nodeType: node.type, duration: GATHERING_CAST_MS, respawnTime: (node.respawnTime || 60) * 1000 }));
      // Auto-complete after timer
      setTimeout(() => {
        const p = connectedPlayers[playerId];
        if (!p) return;
        const table = GATHERING_LOOT[node.type];
        if (!table) return;
        const gRoll = Math.random();
        let gCaught = null;
        let gCum = 0;
        for (const entry of table) {
          gCum += entry.chance;
          if (gRoll <= gCum) {
            const qty = entry.qty[0] + Math.floor(Math.random() * (entry.qty[1] - entry.qty[0] + 1));
            gCaught = { itemId: entry.itemId, name: entry.name, qty };
            break;
          }
        }
        if (!gCaught) { ws.send(JSON.stringify({ type: 'gather_result', success: false, message: 'Tidak ada yang didapat...' })); return; }
        if (!p.inventory) p.inventory = [];
        const gExisting = p.inventory.find(i => i.id === gCaught.itemId);
        if (gExisting) gExisting.quantity = (gExisting.quantity || 1) + gCaught.qty;
        else {
          const def = ITEMS[gCaught.itemId];
          p.inventory.push({ id: gCaught.itemId, name: gCaught.name, type: def?.type || 'material', quantity: gCaught.qty, icon: def?.icon });
        }
        saveWorld();
        ws.send(JSON.stringify({ type: 'gather_result', success: true, item: gCaught, inventory: p.inventory }));
      }, GATHERING_CAST_MS);
      break;
    }
    // Crafting handlers
    case 'crafting_open': {
      const player = connectedPlayers[playerId];
      if (player) {
        // Send available recipes with player's material counts
        const recipes = CRAFTING_RECIPES.map(r => {
          const canCraft = r.ingredients.every(ing => {
            const invItem = player.inventory?.find(i => i.id === ing.itemId);
            return invItem && (invItem.quantity || 1) >= ing.qty;
          });
          return {
            id: r.id, name: r.name, description: r.description, category: r.category,
            ingredients: r.ingredients.map(ing => {
              const invItem = player.inventory?.find(i => i.id === ing.itemId);
              const def = ITEMS[ing.itemId];
              return { itemId: ing.itemId, name: def?.name || ing.itemId, qty: ing.qty, have: invItem ? (invItem.quantity || 1) : 0 };
            }),
            result: { ...r.result, name: ITEMS[r.result.itemId]?.name || r.result.itemId },
            canCraft,
          };
        });
        ws.send(JSON.stringify({ type: 'crafting_recipes', recipes }));
      }
      break;
    }
    case 'craft_item': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const recipe = CRAFTING_RECIPES.find(r => r.id === msg.recipeId);
      if (!recipe) { ws.send(JSON.stringify({ type: 'craft_error', error: 'Recipe not found' })); break; }
      // Check ingredients
      for (const ing of recipe.ingredients) {
        const idx = player.inventory?.findIndex(i => i.id === ing.itemId);
        if (idx < 0) { ws.send(JSON.stringify({ type: 'craft_error', error: `Missing ${ITEMS[ing.itemId]?.name || ing.itemId}` })); return; }
        const item = player.inventory[idx];
        if ((item.quantity || 1) < ing.qty) { ws.send(JSON.stringify({ type: 'craft_error', error: `Need ${ing.qty}x ${ITEMS[ing.itemId]?.name || ing.itemId}, have ${item.quantity || 1}` })); return; }
      }
      // Consume ingredients
      for (const ing of recipe.ingredients) {
        const idx = player.inventory.findIndex(i => i.id === ing.itemId);
        const item = player.inventory[idx];
        item.quantity = (item.quantity || 1) - ing.qty;
        if (item.quantity <= 0) player.inventory.splice(idx, 1);
      }
      // Give result
      const resultDef = ITEMS[recipe.result.itemId];
      if (!resultDef) { ws.send(JSON.stringify({ type: 'craft_error', error: 'Result item not found' })); break; }
      const existing = player.inventory.find(i => i.id === recipe.result.itemId);
      if (existing) existing.quantity = (existing.quantity || 1) + recipe.result.qty;
      else player.inventory.push({ id: recipe.result.itemId, name: resultDef.name, type: resultDef.type, quantity: recipe.result.qty, icon: resultDef.icon });
      saveWorld();
      ws.send(JSON.stringify({ type: 'craft_success', recipeId: recipe.id, name: recipe.name, inventory: player.inventory }));
      break;
    }

    // ═══════════════════════════════════════
    // PLAYER TRADING
    // ═══════════════════════════════════════
    case 'trade_invite': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const targetId = msg.targetId;
      const target = connectedPlayers[targetId];
      if (!target) { ws.send(JSON.stringify({ type: 'trade_error', error: 'Player not found' })); break; }
      if (targetId === playerId) { ws.send(JSON.stringify({ type: 'trade_error', error: 'Cannot trade with yourself' })); break; }
      // Check distance
      const tdx = (player.x || 0) - (target.x || 0);
      const tdz = (player.z || 0) - (target.z || 0);
      if (Math.sqrt(tdx*tdx + tdz*tdz) > 5) { ws.send(JSON.stringify({ type: 'trade_error', error: 'Terlalu jauh! Dekati player dulu.' })); break; }
      // Check if either is already in a trade
      for (const sess of Object.values(tradeSessions)) {
        if (sess.playerA === playerId || sess.playerB === playerId || sess.playerA === targetId || sess.playerB === targetId) {
          ws.send(JSON.stringify({ type: 'trade_error', error: 'Salah satu player sedang dalam trade' })); break;
        }
      }
      // Create trade session
      const tradeId = 'trade_' + Date.now() + '_' + playerId;
      tradeSessions[tradeId] = { playerA: playerId, playerB: targetId, itemsA: [], itemsB: [], confirmedA: false, confirmedB: false, createdAt: Date.now() };
      // Notify target
      const targetWs = playerWs.get(targetId);
      if (targetWs && targetWs.readyState === 1) {
        targetWs.send(JSON.stringify({ type: 'trade_invite', tradeId, fromId: playerId, fromName: player.name }));
      }
      ws.send(JSON.stringify({ type: 'trade_invite_sent', tradeId, targetId, targetName: target.name }));
      break;
    }
    case 'trade_accept': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const sess = tradeSessions[msg.tradeId];
      if (!sess || sess.playerB !== playerId) { ws.send(JSON.stringify({ type: 'trade_error', error: 'Invalid trade session' })); break; }
      sess.confirmedB = false; sess.confirmedA = false;
      // Open trade window for both
      const aWs = playerWs.get(sess.playerA);
      const bWs = playerWs.get(sess.playerB);
      const playerA = connectedPlayers[sess.playerA];
      const playerB = connectedPlayers[sess.playerB];
      const tradeData = { tradeId: msg.tradeId, playerA: { id: sess.playerA, name: playerA?.name, inventory: playerA?.inventory || [] }, playerB: { id: sess.playerB, name: playerB?.name, inventory: playerB?.inventory || [] } };
      if (aWs && aWs.readyState === 1) aWs.send(JSON.stringify({ type: 'trade_open', ...tradeData }));
      if (bWs && bWs.readyState === 1) bWs.send(JSON.stringify({ type: 'trade_open', ...tradeData }));
      break;
    }
    case 'trade_add_item': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const sess = tradeSessions[msg.tradeId];
      if (!sess) { ws.send(JSON.stringify({ type: 'trade_error', error: 'Trade not found' })); break; }
      // Reset confirmations when items change
      sess.confirmedA = false;
      sess.confirmedB = false;
      const isA = sess.playerA === playerId;
      const slot = isA ? 'itemsA' : 'itemsB';
      // Find item in player inventory
      const invItem = player.inventory?.find(i => i.id === msg.itemId);
      if (!invItem) { ws.send(JSON.stringify({ type: 'trade_error', error: 'Item not in inventory' })); break; }
      const qty = Math.min(msg.qty || 1, invItem.quantity || 1);
      // Check if already in trade
      const existing = sess[slot].find(i => i.itemId === msg.itemId);
      if (existing) {
        existing.qty += qty;
      } else {
        sess[slot].push({ itemId: msg.itemId, name: invItem.name, type: invItem.type, qty, icon: invItem.icon });
      }
      // Update both clients
      const aWs = playerWs.get(sess.playerA);
      const bWs = playerWs.get(sess.playerB);
      const update = { type: 'trade_update', tradeId: msg.tradeId, itemsA: sess.itemsA, itemsB: sess.itemsB, confirmedA: false, confirmedB: false };
      if (aWs && aWs.readyState === 1) aWs.send(JSON.stringify(update));
      if (bWs && bWs.readyState === 1) bWs.send(JSON.stringify(update));
      break;
    }
    case 'trade_remove_item': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const sess = tradeSessions[msg.tradeId];
      if (!sess) break;
      sess.confirmedA = false;
      sess.confirmedB = false;
      const isA = sess.playerA === playerId;
      const slot = isA ? 'itemsA' : 'itemsB';
      sess[slot] = sess[slot].filter(i => i.itemId !== msg.itemId);
      const aWs = playerWs.get(sess.playerA);
      const bWs = playerWs.get(sess.playerB);
      const update = { type: 'trade_update', tradeId: msg.tradeId, itemsA: sess.itemsA, itemsB: sess.itemsB, confirmedA: false, confirmedB: false };
      if (aWs && aWs.readyState === 1) aWs.send(JSON.stringify(update));
      if (bWs && bWs.readyState === 1) bWs.send(JSON.stringify(update));
      break;
    }
    case 'trade_confirm': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const sess = tradeSessions[msg.tradeId];
      if (!sess) break;
      const isA = sess.playerA === playerId;
      if (isA) sess.confirmedA = true; else sess.confirmedB = true;
      // Notify both
      const aWs = playerWs.get(sess.playerA);
      const bWs = playerWs.get(sess.playerB);
      const update = { type: 'trade_update', tradeId: msg.tradeId, itemsA: sess.itemsA, itemsB: sess.itemsB, confirmedA: sess.confirmedA, confirmedB: sess.confirmedB };
      if (aWs && aWs.readyState === 1) aWs.send(JSON.stringify(update));
      if (bWs && bWs.readyState === 1) bWs.send(JSON.stringify(update));
      // Both confirmed → execute trade
      if (sess.confirmedA && sess.confirmedB) {
        const pA = connectedPlayers[sess.playerA];
        const pB = connectedPlayers[sess.playerB];
        if (!pA || !pB) { ws.send(JSON.stringify({ type: 'trade_error', error: 'Player disconnected' })); break; }
        // Validate & execute: remove from A, give to B
        for (const item of sess.itemsA) {
          const idx = pA.inventory?.findIndex(i => i.id === item.itemId);
          if (idx < 0) continue;
          const inv = pA.inventory[idx];
          if ((inv.quantity || 1) < item.qty) continue;
          inv.quantity = (inv.quantity || 1) - item.qty;
          if (inv.quantity <= 0) pA.inventory.splice(idx, 1);
          const existing = pB.inventory?.find(i => i.id === item.itemId);
          if (existing) existing.quantity = (existing.quantity || 1) + item.qty;
          else pB.inventory.push({ id: item.itemId, name: item.name, type: item.type, quantity: item.qty, icon: item.icon });
        }
        // Validate & execute: remove from B, give to A
        for (const item of sess.itemsB) {
          const idx = pB.inventory?.findIndex(i => i.id === item.itemId);
          if (idx < 0) continue;
          const inv = pB.inventory[idx];
          if ((inv.quantity || 1) < item.qty) continue;
          inv.quantity = (inv.quantity || 1) - item.qty;
          if (inv.quantity <= 0) pB.inventory.splice(idx, 1);
          const existing = pA.inventory?.find(i => i.id === item.itemId);
          if (existing) existing.quantity = (existing.quantity || 1) + item.qty;
          else pA.inventory.push({ id: item.itemId, name: item.name, type: item.type, quantity: item.qty, icon: item.icon });
        }
        saveWorld();
        // Notify both
        const complete = { type: 'trade_complete', tradeId: msg.tradeId };
        if (aWs && aWs.readyState === 1) { aWs.send(JSON.stringify(complete)); aWs.send(JSON.stringify({ type: 'inventory_update', inventory: pA.inventory })); }
        if (bWs && bWs.readyState === 1) { bWs.send(JSON.stringify(complete)); bWs.send(JSON.stringify({ type: 'inventory_update', inventory: pB.inventory })); }
        delete tradeSessions[msg.tradeId];
        console.log('[TRADE] Completed: ' + sess.playerA + ' ↔ ' + sess.playerB);
      }
      break;
    }
    case 'trade_cancel': {
      const sess = tradeSessions[msg.tradeId];
      if (!sess) break;
      const aWs = playerWs.get(sess.playerA);
      const bWs = playerWs.get(sess.playerB);
      const cancel = { type: 'trade_cancelled', tradeId: msg.tradeId };
      if (aWs && aWs.readyState === 1) aWs.send(JSON.stringify(cancel));
      if (bWs && bWs.readyState === 1) bWs.send(JSON.stringify(cancel));
      delete tradeSessions[msg.tradeId];
      break;
    }

    // ═══════════════════════════════════════
    // PLAYER KIOSKS (free placement in city)
    // ═══════════════════════════════════════
    case 'kiosk_list': {
      const kioskData = Object.entries(activeKiosks).map(([kid, k]) => ({
        id: kid, x: k.x, z: k.z, owner: { id: k.ownerId, name: k.ownerName }, itemCount: k.items.length,
      }));
      ws.send(JSON.stringify({ type: 'kiosk_list', kiosks: kioskData }));
      break;
    }
    case 'kiosk_place': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      // Check if player already has a kiosk
      if (activeKiosks['kiosk_' + playerId]) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Kamu sudah punya kios! Cabut dulu.' })); break; }
      // Use player's current position
      const kx = Math.round(player.x || 0);
      const kz = Math.round(player.z || 0);
      // Check city bounds
      if (kx < KIOSK_CITY_BOUNDS.minX || kx > KIOSK_CITY_BOUNDS.maxX || kz < KIOSK_CITY_BOUNDS.minZ || kz > KIOSK_CITY_BOUNDS.maxZ) {
        ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Di luar kota! Pasang di dalam kota.' })); break;
      }
      // Check distance from other kiosks
      for (const k of Object.values(activeKiosks)) {
        const dx = kx - k.x; const dz = kz - k.z;
        if (Math.sqrt(dx*dx + dz*dz) < KIOSK_MIN_DISTANCE) {
          ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Terlalu dekat kios lain! Min ' + KIOSK_MIN_DISTANCE + ' unit.' })); break;
        }
      }
      // Check distance from NPCs
      for (const npc of Object.values(world.npcs || {})) {
        const dx = kx - (npc.x || 0); const dz = kz - (npc.z || 0);
        if (Math.sqrt(dx*dx + dz*dz) < 2) {
          ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Terlalu dekat NPC!' })); break;
        }
      }
      // Place kiosk with items
      const items = msg.items || [];
      const kioskItems = [];
      for (const item of items) {
        const invItem = player.inventory?.find(i => i.id === item.itemId);
        if (!invItem) continue;
        const qty = Math.min(item.quantity || 999, invItem.quantity || 1);
        if (qty <= 0) continue;
        invItem.quantity = (invItem.quantity || 1) - qty;
        if (invItem.quantity <= 0) {
          const idx = player.inventory.indexOf(invItem);
          if (idx >= 0) player.inventory.splice(idx, 1);
        }
        const def = ITEMS[item.itemId];
        kioskItems.push({ itemId: item.itemId, name: def?.name || invItem.name, type: def?.type || 'material', price: item.price || def?.price || 1, quantity: qty, icon: def?.icon });
      }
      if (kioskItems.length === 0) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Tidak ada item untuk dijual!' })); break; }
      const kioskId = 'kiosk_' + playerId;
      activeKiosks[kioskId] = { ownerId: playerId, ownerName: player.name, x: kx, z: kz, items: kioskItems, createdAt: Date.now() };
      saveWorld();
      broadcast({ type: 'kiosk_placed', id: kioskId, x: kx, z: kz, owner: { id: playerId, name: player.name }, itemCount: kioskItems.length });
      ws.send(JSON.stringify({ type: 'kiosk_placed_ok', kioskId, inventory: player.inventory }));
      console.log('[KIOSK] ' + player.name + ' placed kiosk at (' + kx + ',' + kz + ')');
      break;
    }
    case 'kiosk_update_item': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const kioskId = 'kiosk_' + playerId;
      const kiosk = activeKiosks[kioskId];
      if (!kiosk) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Kamu tidak punya kios' })); break; }
      const item = kiosk.items.find(i => i.itemId === msg.itemId);
      if (!item) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Item tidak ada di kios' })); break; }
      if (msg.price !== undefined) item.price = Math.max(1, msg.price);
      if (msg.quantity !== undefined) {
        const diff = msg.quantity - item.quantity;
        if (diff > 0) {
          const invItem = player.inventory?.find(i => i.id === msg.itemId);
          if (!invItem || (invItem.quantity || 0) < diff) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Inventory tidak cukup' })); break; }
          invItem.quantity = (invItem.quantity || 1) - diff;
          if (invItem.quantity <= 0) { const idx = player.inventory.indexOf(invItem); if (idx >= 0) player.inventory.splice(idx, 1); }
          item.quantity = msg.quantity;
        } else if (diff < 0) {
          const returnQty = -diff;
          const existing = player.inventory?.find(i => i.id === item.itemId);
          if (existing) existing.quantity = (existing.quantity || 1) + returnQty;
          else player.inventory.push({ id: item.itemId, name: item.name, type: item.type, quantity: returnQty, icon: item.icon });
          item.quantity = msg.quantity;
        }
      }
      if (item.quantity <= 0) kiosk.items = kiosk.items.filter(i => i.itemId !== msg.itemId);
      saveWorld();
      broadcast({ type: 'kiosk_item_updated', id: kioskId, items: kiosk.items });
      ws.send(JSON.stringify({ type: 'kiosk_updated', inventory: player.inventory }));
      break;
    }
    case 'kiosk_remove': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const kioskId = 'kiosk_' + playerId;
      const kiosk = activeKiosks[kioskId];
      if (!kiosk) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Kamu tidak punya kios' })); break; }
      // Return all items to inventory
      for (const item of kiosk.items) {
        const existing = player.inventory?.find(i => i.id === item.itemId);
        if (existing) existing.quantity = (existing.quantity || 1) + item.quantity;
        else player.inventory.push({ id: item.itemId, name: item.name, type: item.type, quantity: item.quantity, icon: item.icon });
      }
      delete activeKiosks[kioskId];
      saveWorld();
      broadcast({ type: 'kiosk_removed', id: kioskId });
      ws.send(JSON.stringify({ type: 'kiosk_removed_ok', inventory: player.inventory }));
      console.log('[KIOSK] ' + player.name + ' removed kiosk');
      break;
    }
    case 'kiosk_browse': {
      const kiosk = activeKiosks[msg.kioskId];
      if (!kiosk) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Kios tidak ditemukan' })); break; }
      ws.send(JSON.stringify({ type: 'kiosk_browse', kioskId: msg.kioskId, owner: { id: kiosk.ownerId, name: kiosk.ownerName }, items: kiosk.items, x: kiosk.x, z: kiosk.z }));
      break;
    }
    case 'kiosk_buy': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const kiosk = activeKiosks[msg.kioskId];
      if (!kiosk) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Kios tidak ditemukan' })); break; }
      if (kiosk.ownerId === playerId) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Gak bisa beli dari kios sendiri' })); break; }
      const item = kiosk.items.find(i => i.itemId === msg.itemId);
      if (!item) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Item habis' })); break; }
      const qty = Math.min(msg.quantity || 1, item.quantity);
      const totalCost = item.price * qty;
      if ((player.zen || 0) < totalCost) { ws.send(JSON.stringify({ type: 'kiosk_error', error: 'Zen tidak cukup! Butuh ' + totalCost + 'z' })); break; }
      player.zen = (player.zen || 0) - totalCost;
      const existing = player.inventory?.find(i => i.id === item.itemId);
      if (existing) existing.quantity = (existing.quantity || 1) + qty;
      else player.inventory.push({ id: item.itemId, name: item.name, type: item.type, quantity: qty, icon: item.icon });
      item.quantity -= qty;
      if (item.quantity <= 0) kiosk.items = kiosk.items.filter(i => i.itemId !== item.itemId);
      const owner = connectedPlayers[kiosk.ownerId];
      if (owner) {
        owner.zen = (owner.zen || 0) + totalCost;
        const ownerWs = playerWs.get(kiosk.ownerId);
        if (ownerWs && ownerWs.readyState === 1) {
          ownerWs.send(JSON.stringify({ type: 'kiosk_sale', buyerName: player.name, itemName: item.name, qty, total: totalCost, zen: owner.zen }));
        }
      }
      saveWorld();
      ws.send(JSON.stringify({ type: 'kiosk_bought', itemId: item.itemId, qty, cost: totalCost, zen: player.zen, inventory: player.inventory }));
      broadcast({ type: 'kiosk_item_updated', id: msg.kioskId, items: kiosk.items });
      console.log('[KIOSK] ' + player.name + ' bought ' + qty + 'x ' + item.name + ' from ' + kiosk.ownerName);
      break;
    }

    // ═══════════════════════════════════════
    // ZONE CHANGE (portals)
    // ═══════════════════════════════════════
    case 'zone_change': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const targetZone = msg.targetZone;
      const zoneDef = ZONES[targetZone];
      if (!zoneDef) { ws.send(JSON.stringify({ type: 'zone_error', error: 'Zone tidak ditemukan' })); break; }
      // Change player zone
      player.region = targetZone;
      player.x = msg.targetX || 0;
      player.z = msg.targetZ || 0;
      // Send zone data to player
      ws.send(JSON.stringify({ type: 'zone_enter', zone: { id: zoneDef.id, name: zoneDef.name, subtitle: zoneDef.subtitle, level: zoneDef.level, groundColor: zoneDef.groundColor, portals: zoneDef.portals || [], decorations: zoneDef.decorations || [] } }));
      // Notify other players in OLD zone
      broadcast({ type: 'player_left_zone', playerId, name: player.name }, ws);
      // Send updated player position to all
      broadcast({ type: 'player_moved', playerId, x: player.x, z: player.z });
      // Spawn zone mobs for this player
      spawnZoneMobs(targetZone);
      saveWorld();
      console.log('[ZONE] ' + player.name + ' → ' + zoneDef.name);
      break;
    }
    case 'zone_sync': {
      // Client requests current zone data (e.g. on reconnect)
      const player = connectedPlayers[playerId];
      if (!player) break;
      const z = ZONES[player.region || 'willowmere'];
      if (z) {
        ws.send(JSON.stringify({ type: 'zone_enter', zone: { id: z.id, name: z.name, subtitle: z.subtitle, level: z.level, groundColor: z.groundColor, portals: z.portals || [], decorations: z.decorations || [] } }));
      }
      break;
    }
    case 'dungeon_list': {
      // List available dungeons
      const player = connectedPlayers[playerId];
      if (!player) break;
      const list = Object.values(DUNGEONS).map(d => {
        const onCooldown = dungeonCooldowns[`${playerId}:${d.id}`] && (Date.now() - dungeonCooldowns[`${playerId}:${d.id}`]) < d.cooldown;
        return { id: d.id, name: d.name, description: d.description, minLevel: d.minLevel, maxPlayers: d.maxPlayers, timeLimit: d.timeLimit, entryCost: d.entryCost, cooldown: d.cooldown, onCooldown };
      });
      ws.send(JSON.stringify({ type: 'dungeon_list', dungeons: list }));
      break;
    }
    case 'dungeon_start': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      const dungeon = DUNGEONS[msg.dungeonId];
      if (!dungeon) { ws.send(JSON.stringify({ type: 'dungeon_error', error: 'Dungeon tidak ditemukan' })); break; }
      if (player.level < dungeon.minLevel) { ws.send(JSON.stringify({ type: 'dungeon_error', error: `Minimal Level ${dungeon.minLevel}` })); break; }
      if (dungeon.entryCost > 0 && (player.zen || 0) < dungeon.entryCost) { ws.send(JSON.stringify({ type: 'dungeon_error', error: `Butuh ${dungeon.entryCost} gold` })); break; }
      const onCooldown = dungeonCooldowns[`${playerId}:${dungeon.id}`] && (Date.now() - dungeonCooldowns[`${playerId}:${dungeon.id}`]) < dungeon.cooldown;
      if (onCooldown) { ws.send(JSON.stringify({ type: 'dungeon_error', error: 'Masih cooldown' })); break; }
      // Deduct entry cost
      if (dungeon.entryCost > 0) player.zen -= dungeon.entryCost;
      // Create instance
      const instId = createDungeonInstance(dungeon.id, playerId);
      if (!instId) { ws.send(JSON.stringify({ type: 'dungeon_error', error: 'Gagal membuat instance' })); break; }
      const inst = dungeonInstances[instId];
      inst.instanceId = instId;
      ws.send(JSON.stringify({ type: 'dungeon_started', instanceId: instId, dungeonId: dungeon.id, name: dungeon.name, timeLimit: dungeon.timeLimit }));
      // Start first wave after short delay
      setTimeout(() => spawnDungeonWave(instId), 2000);
      saveWorld();
      break;
    }
    case 'dungeon_attack': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      // Find which dungeon instance this player is in
      const inst = Object.values(dungeonInstances).find(i => i.players.includes(playerId) && !i.completed && !i.failed);
      if (!inst) break;
      const mob = inst.mobs[msg.mobId];
      if (!mob || !mob.alive) break;
      // Calculate damage
      const playerAtk = (player.atk || 0) + (player.equipmentBonusAtk || 0);
      const mobDef = mob.def || 0;
      const isCrit = Math.random() < (player.crit || 0.05);
      let dmg = Math.max(1, playerAtk - mobDef);
      if (isCrit) dmg = Math.floor(dmg * 1.5);
      mob.hp -= dmg;
      const xpGain = isCrit ? 0 : 0; // no XP from dungeon mobs directly
      if (mob.hp <= 0) {
        mob.alive = false;
        // Check if wave complete
        const aliveMobs = Object.values(inst.mobs).filter(m => m.alive);
        if (aliveMobs.length === 0 && inst.wave >= inst.dungeon.waves.length) {
          completeDungeon(inst.instanceId);
        }
      }
      inst.players.forEach(pId => {
        const pWs = playerWs.get(pId);
        if (pWs && pWs.readyState === 1) {
          pWs.send(JSON.stringify({ type: 'dungeon_mob_hit', mobId: mob.id, hp: mob.hp, maxHp: mob.maxHp, damage: dmg, isCrit }));
        }
      });
      break;
    }
    case 'dungeon_leave': {
      const inst = Object.values(dungeonInstances).find(i => i.players.includes(playerId));
      if (!inst) break;
      inst.players = inst.players.filter(id => id !== playerId);
      ws.send(JSON.stringify({ type: 'dungeon_left' }));
      if (inst.players.length === 0) failDungeon(inst.instanceId);
      break;
    }
    case 'dungeon_leaderboard': {
      const board = dungeonLeaderboard[msg.dungeonId] || [];
      ws.send(JSON.stringify({ type: 'dungeon_leaderboard', dungeonId: msg.dungeonId, entries: board }));
      break;
    }
    case 'respawn': {
      const player = connectedPlayers[playerId];
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
      const player = connectedPlayers[playerId];
      if (!player) break;
      ws.send(JSON.stringify({ type: 'skill_unlocked', tier: msg.tier, skillPoints: 0, unlockedSkills: player.unlockedSkills }));
      break;
    }
    case 'use_skill': {
      const player = connectedPlayers[playerId];
      if (!player) break;
      // Full skill definitions for all tiers (must match client)
      const ALL_SKILLS = {
        laborer: {
          tier1:  { mpCost: 15, damageMulti: 2.5, healMulti: 0, range: 3.5, name: 'Power Smash' },
          tier2a: { mpCost: 25, damageMulti: 3.5, healMulti: 0, range: 4, name: 'Earthquake' },
          tier2b: { mpCost: 20, damageMulti: 0, healMulti: 0, range: 0, name: 'Iron Wall', buff: { stat: 'def', value: 0.5, duration: 10 } },
          tier3:  { mpCost: 35, damageMulti: 0, healMulti: 0, range: 0, name: 'War Cry', buff: { stat: 'def', value: 0.8, duration: 15 } },
          tier4:  { mpCost: 45, damageMulti: 5.0, healMulti: 0, range: 3, name: 'Titan Strike' },
          tier5:  { mpCost: 50, damageMulti: 0, healMulti: 0, range: 0, name: 'Berserker Rage', buff: { stat: 'atk', value: 1.0, duration: 20 } },
        },
        miner: {
          tier1:  { mpCost: 20, damageMulti: 3.0, healMulti: 0, range: 4, name: 'Avalanche' },
          tier2a: { mpCost: 30, damageMulti: 4.0, healMulti: 0, range: 4.5, name: 'Blade Storm' },
          tier2b: { mpCost: 15, damageMulti: 0, healMulti: 0, range: 0, name: 'Shadow Step', buff: { stat: 'spd', value: 0.5, duration: 8 } },
          tier3:  { mpCost: 35, damageMulti: 4.5, healMulti: 0, range: 4, name: 'Shadow Strike' },
          tier4:  { mpCost: 45, damageMulti: 5.5, healMulti: 0, range: 5, name: 'Blade Dance', multiHit: 3 },
          tier5:  { mpCost: 55, damageMulti: 6.0, healMulti: 0, range: 4, name: 'Phantom Edge', ignoreDef: true },
        },
        gardener: {
          tier1:  { mpCost: 12, damageMulti: 2.0, healMulti: 0, range: 5, name: 'Thorn Whip' },
          tier2a: { mpCost: 20, damageMulti: 3.0, healMulti: 0, range: 5, name: "Nature's Wrath" },
          tier2b: { mpCost: 18, damageMulti: 0, healMulti: 0.4, range: 0, name: 'Healing Bloom' },
          tier3:  { mpCost: 30, damageMulti: 3.5, healMulti: 0, range: 6, name: 'Vine Snare', root: true },
          tier4:  { mpCost: 40, damageMulti: 4.5, healMulti: 0, range: 5, name: 'Entangle', root: true, multiTarget: 3 },
          tier5:  { mpCost: 50, damageMulti: 6.0, healMulti: 0, range: 7, name: "Nature's Fury" },
        },
        herbalist: {
          tier1:  { mpCost: 25, damageMulti: 0, healMulti: 0.4, range: 4, name: 'Mystic Heal' },
          tier2a: { mpCost: 35, damageMulti: 0, healMulti: 0.7, range: 0, name: 'Rejuvenation' },
          tier2b: { mpCost: 20, damageMulti: 0, healMulti: 0, range: 0, name: 'Mana Surge', buff: { stat: 'atk', value: 0.3, duration: 12 } },
          tier3:  { mpCost: 40, damageMulti: 0, healMulti: 0.5, range: 0, name: 'Group Heal', healAll: true },
          tier4:  { mpCost: 50, damageMulti: 0, healMulti: 0, range: 0, name: 'Divine Shield', buff: { stat: 'invuln', value: 1, duration: 3 } },
          tier5:  { mpCost: 60, damageMulti: 0, healMulti: 0.8, range: 0, name: 'Revive', revive: true },
        },
        watchman: {
          tier1:  { mpCost: 15, damageMulti: 2.5, healMulti: 0, range: 4.5, name: 'Eagle Eye' },
          tier2a: { mpCost: 25, damageMulti: 4.0, healMulti: 0, range: 5, name: 'Piercing Shot', ignoreDef: true },
          tier2b: { mpCost: 18, damageMulti: 0, healMulti: 0, range: 0, name: "Sentinel's Mark", buff: { stat: 'dmgTaken', value: 0.5, duration: 10 } },
          tier3:  { mpCost: 35, damageMulti: 3.0, healMulti: 0, range: 6, name: 'Multi Shot', multiTarget: 3 },
          tier4:  { mpCost: 45, damageMulti: 6.0, healMulti: 0, range: 7, name: 'Headshot', guaranteedCrit: true },
          tier5:  { mpCost: 55, damageMulti: 4.0, healMulti: 0, range: 6, name: 'Rain of Arrows', multiTarget: 5 },
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
        saveWorld();
        ws.send(JSON.stringify({ type: 'skill_used', skillId: skillTier, skillName: skill.name, mp: player.mp, buff: skill.buff }));
        break;
      }

      // Heal skill
      if (skill.healMulti > 0) {
        const healAmt = Math.floor(player.maxHp * skill.healMulti);
        player.hp = Math.min(player.maxHp, player.hp + healAmt);
        saveWorld();
        ws.send(JSON.stringify({ type: 'skill_used', skillId: skillTier, skillName: skill.name, hp: player.hp, mp: player.mp, heal: healAmt }));
        break;
      }

      // Attack skill
      if (!msg.monsterId) { player.mp += skill.mpCost; break; }
      const monster = world.monsters[msg.monsterId];
      if (!monster || !monster.alive) { player.mp += skill.mpCost; break; }

      const data = MONSTERS[monster.type];
      if (!data) { player.mp += skill.mpCost; break; }

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
        const xpGain = data.xp || 0;
        const zenGain = data.zen ? data.zen[0] + Math.floor(Math.random() * (data.zen[1] - data.zen[0])) : 0;
        player.xp += xpGain;
        player.zen = (player.zen || 0) + zenGain;
        const xpNeeded = 50 * Math.min(player.level, 49) + 5 * Math.pow(Math.min(player.level, 49), 2);
        let leveledUp = false;
        if (player.xp >= xpNeeded) {
          if (player.level < 50) {
            player.level++;
            player.xp -= xpNeeded;
            const hpGain = 15 + player.level * 2;
            const mpGain = 8 + player.level;
            const statGain = 1 + Math.floor(player.level / 5);
            player.maxHp += hpGain; player.hp = player.maxHp;
            player.maxMp += mpGain; player.mp = player.maxMp;
            player.atk += statGain; player.def += statGain;
            leveledUp = true;
            // Unlock skill tree tiers on level up
            if (!player.unlockedSkills) player.unlockedSkills = ['tier1'];
            if (player.level >= 3 && !player.unlockedSkills.includes('tier2b')) player.unlockedSkills.push('tier2b');
            if (player.level >= 5 && !player.unlockedSkills.includes('tier2a')) player.unlockedSkills.push('tier2a');
            if (player.level >= 15 && !player.unlockedSkills.includes('tier3')) player.unlockedSkills.push('tier3');
            if (player.level >= 25 && !player.unlockedSkills.includes('tier4')) player.unlockedSkills.push('tier4');
            if (player.level >= 40 && !player.unlockedSkills.includes('tier5')) player.unlockedSkills.push('tier5');
          }
          ws.send(JSON.stringify({ type: 'level_up', level: player.level, xp: player.xp, maxHp: player.maxHp, maxMp: player.maxMp, unlockedSkills: player.unlockedSkills }));
        }
        const loot = rollLoot(monster.type);
        trackQuestKills(player, monster.type);
        spawnGroundLoot(loot, monster.x, monster.z, playerId);
        broadcast({
          type: 'monster_killed', monsterId: monster.id, killerId: playerId,
          xp: xpGain, zen: zenGain, loot, level: player.level,
          expToNext: 50 * Math.min(player.level, 49) + 5 * Math.pow(Math.min(player.level, 49), 2), currentXp: player.xp, leveledUp,
          hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp,
        });
        broadcast({ type: 'monster_died', monsterId: monster.id });
        saveWorld();
        }
        break;
    }
    case 'pickup_loot': {
      const player = connectedPlayers[playerId];
      if (player && msg.lootId && groundLoot[msg.lootId]) {
        const lootEntry = groundLoot[msg.lootId];
        addLootToPlayer(player, lootEntry.items);
        delete groundLoot[msg.lootId];
        saveWorld();
        broadcast({ type: 'ground_loot_remove', lootId: msg.lootId });
        ws.send(JSON.stringify({ type: 'inventory_update', inventory: player.inventory }));
      }
      break;
    }
    default: console.log(`[WARN] Unknown: ${msg.type}`);
  }
}

function sanitizeMonster(m) {
  return { id: m.id, type: m.type, name: m.name, x: m.x, y: m.y, z: m.z, hp: m.hp, maxHp: m.maxHp, level: m.level, alive: m.alive, isBoss: m.isBoss || false };
}

function broadcast(data, exclude = null) {
  try {
    const payload = JSON.stringify(data);
    wss.clients.forEach(c => { try { if (c !== exclude && c.readyState === 1) c.send(payload); } catch(_) {} });
  } catch(_) {}
}
// Broadcast only to players in a specific zone
function zoneBroadcast(zoneId, data, exclude = null) {
  try {
    const payload = JSON.stringify(data);
    wss.clients.forEach(c => {
      try {
        if (c === exclude || c.readyState !== 1) return;
        const pid = c.playerId;
        const p = connectedPlayers[pid];
        if (p && (p.region || 'willowmere') === zoneId) c.send(payload);
      } catch(_) {}
    });
  } catch(_) {}
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
process.on('unhandledRejection', (reason) => { console.error('[UNHANDLED REJECTION]', reason); });

server.listen(PORT, () => {
  console.log(`\n⚔️  Zenithia Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket on ws://localhost:${PORT}`);
  console.log(`🐾 ${Object.keys(MONSTERS).length} monster types loaded`);
  console.log(`💾 Auto-save every 5 minutes\n`);
});
