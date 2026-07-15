// Zenithia — Dungeon UI
// Handles dungeon list, entry, combat, and leaderboard display

export class DungeonUI {
  constructor(wsSend, state) {
    this.wsSend = wsSend;
    this.state = state;
    this.dungeons = [];
    this.activeDungeon = null;
    this.timeLeft = 0;
    this.currentWave = 0;
    this.totalWaves = 0;
    this.mobs = [];
    this.leaderboard = [];
  }

  // Request dungeon list from server
  requestList() {
    this.wsSend(JSON.stringify({ type: 'dungeon_list' }));
  }

  // Handle dungeon list response
  handleList(dungeons) {
    this.dungeons = dungeons;
    this.showListUI();
  }

  // Show dungeon selection UI
  showListUI() {
    // Remove existing modal
    const existing = document.getElementById('dungeon-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'dungeon-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;';

    let html = `<div style="background:#1a1a2e;border:2px solid #4fc3f7;border-radius:12px;padding:20px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;">
      <h2 style="color:#4fc3f7;margin:0 0 15px 0;font-size:20px;">⚔️ Dungeons</h2>`;

    this.dungeons.forEach(d => {
      const canEnter = this.state.player.level >= d.minLevel && !d.onCooldown && (this.state.player.zen || 0) >= d.entryCost;
      const statusColor = d.onCooldown ? '#f44336' : (this.state.player.level < d.minLevel ? '#9e9e9e' : '#4caf50');
      const statusText = d.onCooldown ? 'Cooldown' : (this.state.player.level < d.minLevel ? `Lv.${d.minLevel}+` : (d.entryCost > 0 ? `${d.entryCost}g` : 'Free'));

      html += `<div style="background:#16213e;border:1px solid #333;border-radius:8px;padding:12px;margin-bottom:8px;${canEnter ? 'cursor:pointer;' : 'opacity:0.6;'}"
        ${canEnter ? `onclick="window.dungeonUI.startDungeon('${d.id}')"` : ''}>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="color:#e0e0e0;font-weight:bold;">${d.name}</div>
            <div style="color:#999;font-size:12px;">${d.description}</div>
            <div style="color:#666;font-size:11px;margin-top:4px;">Lv.${d.minLevel}+ • ${d.maxPlayers}p • ${Math.floor(d.timeLimit/60)}m</div>
          </div>
          <div style="color:${statusColor};font-weight:bold;font-size:13px;text-align:right;">
            ${statusText}
          </div>
        </div>
      </div>`;
    });

    html += `<div style="text-align:center;margin-top:12px;">
      <button onclick="document.getElementById('dungeon-modal').remove()" style="background:#333;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;">Close</button>
    </div></div>`;

    modal.innerHTML = html;
    document.body.appendChild(modal);
  }

  // Start a dungeon
  startDungeon(dungeonId) {
    this.wsSend(JSON.stringify({ type: 'dungeon_start', dungeonId }));
    const existing = document.getElementById('dungeon-modal');
    if (existing) existing.remove();
  }

  // Handle dungeon started
  handleStarted(data) {
    this.activeDungeon = data;
    this.timeLeft = data.timeLimit;
    this.currentWave = 0;
    this.showCombatUI();
  }

  // Show dungeon combat UI
  showCombatUI() {
    let ui = document.getElementById('dungeon-combat-ui');
    if (!ui) {
      ui = document.createElement('div');
      ui.id = 'dungeon-combat-ui';
      ui.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.9);border:2px solid #ff9800;border-radius:10px;padding:15px;z-index:9999;min-width:250px;color:#fff;font-size:13px;';
      document.body.appendChild(ui);
    }
    ui.innerHTML = `<div style="color:#ff9800;font-weight:bold;margin-bottom:8px;">⚔️ ${this.activeDungeon?.name || 'Dungeon'}</div>
      <div id="dungeon-wave" style="color:#4fc3f7;">Wave: 0/0</div>
      <div id="dungeon-time" style="color:#f44336;">Time: 0:00</div>
      <div id="dungeon-mobs" style="margin-top:8px;"></div>
      <button onclick="window.dungeonUI.leaveDungeon()" style="margin-top:8px;background:#f44336;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:11px;">Leave</button>`;
  }

  // Handle wave start
  handleWave(data) {
    this.currentWave = data.wave;
    this.totalWaves = data.totalWaves;
    this.mobs = data.mobs;
    this.updateCombatUI();
  }

  // Handle mob positions update
  handleMobs(data) {
    this.mobs = data.mobs;
    this.timeLeft = data.timeLeft;
    this.updateCombatUI();
  }

  // Update combat UI
  updateCombatUI() {
    const waveEl = document.getElementById('dungeon-wave');
    const timeEl = document.getElementById('dungeon-time');
    const mobsEl = document.getElementById('dungeon-mobs');
    if (waveEl) waveEl.textContent = `Wave: ${this.currentWave}/${this.totalWaves}`;
    if (timeEl) {
      const mins = Math.floor(this.timeLeft / 60);
      const secs = Math.floor(this.timeLeft % 60);
      timeEl.textContent = `Time: ${mins}:${secs.toString().padStart(2, '0')}`;
      timeEl.style.color = this.timeLeft < 30 ? '#f44336' : '#fff';
    }
    if (mobsEl) {
      mobsEl.innerHTML = this.mobs.map(m => {
        const hpPct = Math.max(0, (m.hp / m.maxHp) * 100);
        const hpColor = hpPct > 50 ? '#4caf50' : (hpPct > 25 ? '#ff9800' : '#f44336');
        return `<div style="margin-bottom:4px;cursor:pointer;" onclick="window.dungeonUI.attackMob('${m.id}')">
          <div style="color:#ccc;font-size:11px;">${m.name} (Lv.${m.level || '?'})</div>
          <div style="background:#333;height:6px;border-radius:3px;"><div style="background:${hpColor};height:100%;width:${hpPct}%;border-radius:3px;"></div></div>
        </div>`;
      }).join('');
    }
  }

  // Attack a mob
  attackMob(mobId) {
    this.wsSend(JSON.stringify({ type: 'dungeon_attack', mobId }));
  }

  // Handle mob hit
  handleMobHit(data) {
    const mob = this.mobs.find(m => m.id === data.mobId);
    if (mob) {
      mob.hp = data.hp;
      mob.maxHp = data.maxHp;
      this.updateCombatUI();
      // Show damage number
      this.showDamageNumber(data.damage, data.isCrit);
    }
  }

  // Show floating damage number
  showDamageNumber(damage, isCrit) {
    const el = document.createElement('div');
    el.textContent = isCrit ? `💥 ${damage}!` : `-${damage}`;
    el.style.cssText = `position:fixed;top:50%;left:50%;color:${isCrit ? '#ff5722' : '#ffeb3b'};font-size:${isCrit ? '24px' : '18px'};font-weight:bold;pointer-events:none;z-index:10001;text-shadow:2px 2px 4px #000;transition:all 0.8s;`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.top = '30%'; el.style.opacity = '0'; }, 50);
    setTimeout(() => el.remove(), 900);
  }

  // Handle boss spawn
  handleBoss(data) {
    this.mobs = [{ id: data.bossId, name: data.name, hp: data.hp, maxHp: data.maxHp, level: '?', isBoss: true }];
    this.updateCombatUI();
    // Boss announcement
    const announce = document.createElement('div');
    announce.style.cssText = 'position:fixed;top:40%;left:50%;transform:translateX(-50%);color:#f44336;font-size:28px;font-weight:bold;z-index:10002;text-shadow:3px 3px 6px #000;animation:fadeInOut 3s;';
    announce.textContent = `⚠️ ${data.name} appeared!`;
    document.body.appendChild(announce);
    setTimeout(() => announce.remove(), 3000);
  }

  // Handle dungeon complete
  handleComplete(data) {
    this.activeDungeon = null;
    const ui = document.getElementById('dungeon-combat-ui');
    if (ui) ui.remove();

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;';

    const timeStr = `${Math.floor(data.time/60000)}:${Math.floor((data.time%60000)/1000).toString().padStart(2,'0')}`;
    let lootHtml = data.loot.map(l => `<div style="color:#4caf50;">✓ ${l.name} x${l.quantity}</div>`).join('');

    modal.innerHTML = `<div style="background:#1a1a2e;border:2px solid #4caf50;border-radius:12px;padding:20px;text-align:center;max-width:400px;">
      <h2 style="color:#4caf50;margin:0 0 15px 0;">🎉 Dungeon Complete!</h2>
      <div style="color:#ffeb3b;font-size:18px;">Time: ${timeStr}</div>
      <div style="color:#4caf50;margin:8px 0;">+${data.xp} XP • +${data.gold} Gold</div>
      <div style="margin:10px 0;">${lootHtml || '<div style="color:#999;">No loot</div>'}</div>
      <button onclick="this.closest('div[style*=fixed]').remove()" style="background:#4caf50;color:#fff;border:none;padding:8px 24px;border-radius:6px;cursor:pointer;margin-top:10px;">OK</button>
    </div>`;
    document.body.appendChild(modal);
  }

  // Handle dungeon failed
  handleFailed(data) {
    this.activeDungeon = null;
    const ui = document.getElementById('dungeon-combat-ui');
    if (ui) ui.remove();

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `<div style="background:#1a1a2e;border:2px solid #f44336;border-radius:12px;padding:20px;text-align:center;max-width:400px;">
      <h2 style="color:#f44336;margin:0 0 15px 0;">💀 Dungeon Failed</h2>
      <div style="color:#999;">Time ran out or party wiped.</div>
      <button onclick="this.closest('div[style*=fixed]').remove()" style="background:#f44336;color:#fff;border:none;padding:8px 24px;border-radius:6px;cursor:pointer;margin-top:10px;">OK</button>
    </div>`;
    document.body.appendChild(modal);
  }

  // Leave dungeon
  leaveDungeon() {
    this.wsSend(JSON.stringify({ type: 'dungeon_leave' }));
    this.activeDungeon = null;
    const ui = document.getElementById('dungeon-combat-ui');
    if (ui) ui.remove();
  }

  // Handle dungeon error
  handleError(error) {
    console.log('[DUNGEON] Error:', error);
  }
}
