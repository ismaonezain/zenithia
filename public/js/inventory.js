// Zenithia — Merged Inventory & Equipment UI

export class InventoryUI {
  constructor(ws, playerState) {
    this.ws = ws;
    this.player = playerState;
    this.isOpen = false;
    this.container = null;
    this.tooltipEl = null;
    this.contextMenu = null;
    this.createUI();
  }

  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'inventory-ui';
    document.body.appendChild(this.container);

    // Tooltip element
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'inv-tooltip';
    this.tooltipEl.style.display = 'none';
    document.body.appendChild(this.tooltipEl);

    // Close context menu on click outside
    document.addEventListener('click', () => this.hideContextMenu());
    document.addEventListener('contextmenu', () => this.hideContextMenu());

    // Toggle with 'I' key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'i' || e.key === 'I') {
        if (e.target.tagName === 'INPUT') return;
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.render();
    this.container.style.display = 'block';
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this.hideContextMenu();
  }

  render() {
    const p = this.player;
    const inv = p.inventory || [];
    const equip = p.equipment || {};

    this.container.innerHTML = `
      <div class="inv-header">
        <h3>⚔️ Inventory & Equipment</h3>
        <button class="inv-close-btn" onclick="document.getElementById('inventory-ui').style.display='none'">✕</button>
      </div>

      <div class="inv-section-label">Equipped</div>
      <div class="inv-equip-grid">
        ${this.renderEquipSlots(equip)}
      </div>

      <div class="inv-section-label">Bag</div>
      <div class="inv-bag-grid">
        ${this.renderBagGrid(inv)}
      </div>

      <div class="inv-stats-bar">
        <div class="inv-stat">
          <div class="inv-stat-label">💰 Zen</div>
          <div class="inv-stat-val inv-zen">${p.zen || 0}</div>
        </div>
        <div class="inv-stat">
          <div class="inv-stat-label">ATK</div>
          <div class="inv-stat-val inv-atk">${p.atk || 10}</div>
        </div>
        <div class="inv-stat">
          <div class="inv-stat-label">DEF</div>
          <div class="inv-stat-val inv-def">${p.def || 5}</div>
        </div>
        <div class="inv-stat">
          <div class="inv-stat-label">SPD</div>
          <div class="inv-stat-val inv-spd">${p.spd || 10}</div>
        </div>
        <div class="inv-stat">
          <div class="inv-stat-label">CRIT</div>
          <div class="inv-stat-val inv-crit">${Math.round((p.crit || 0.05) * 100)}%</div>
        </div>
      </div>
    `;

    // Bind equipment slot clicks
    this.container.querySelectorAll('.inv-equip-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotKey = slot.dataset.slot;
        const item = equip[slotKey];
        if (item) {
          this.showContextMenu(e.clientX, e.clientY, [
            { label: `Unequip ${item.name}`, action: () => this.unequipItem(slotKey) },
          ]);
        }
      });
      slot.addEventListener('mouseenter', (e) => {
        const slotKey = slot.dataset.slot;
        const item = equip[slotKey];
        if (item) this.showTooltip(e, item, true);
      });
      slot.addEventListener('mouseleave', () => this.hideTooltip());
    });

    // Bind bag slot clicks + drag
    this.container.querySelectorAll('.inv-bag-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(slot.dataset.index);
        const item = inv[idx];
        if (!item) return;
        const isConsumable = item.type === 'consumable';
        const isEquipment = item.type === 'equipment';
        const menuItems = [];
        if (isConsumable) {
          menuItems.push({ label: 'Use', action: () => this.useItem(item.id) });
          menuItems.push({ label: 'Assign to Hotbar', action: () => this.assignToHotbar(item.id) });
        }
        if (isEquipment) menuItems.push({ label: 'Equip', action: () => this.equipItem(item.id) });
        menuItems.push({ label: 'Drop', action: () => this.dropItem(item.id) });
        this.showContextMenu(e.clientX, e.clientY, menuItems);
      });
      slot.addEventListener('mouseenter', (e) => {
        const idx = parseInt(slot.dataset.index);
        const item = inv[idx];
        if (item) this.showTooltip(e, item, false);
      });
      slot.addEventListener('mouseleave', () => this.hideTooltip());

      // Drag support — only for consumables
      slot.setAttribute('draggable', 'false');
      const idx = parseInt(slot.dataset.index);
      const item = inv[idx];
      if (item && item.type === 'consumable') {
        slot.setAttribute('draggable', 'true');
        slot.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('application/x-zenithia-potion', item.id);
          e.dataTransfer.effectAllowed = 'copy';
          slot.style.opacity = '0.5';
          window._draggingPotion = item.id;
        });
        slot.addEventListener('dragend', () => {
          slot.style.opacity = '1';
          window._draggingPotion = null;
          // Remove drop-target highlight from all hotbar slots
          document.querySelectorAll('#skill-hotbar .skill-slot.drop-target').forEach(s => s.classList.remove('drop-target'));
        });
      }
    });
  }

  renderEquipSlots(equip) {
    const slots = [
      { key: 'weapon', icon: '⚔️', label: 'Weapon' },
      { key: 'armor', icon: '🛡️', label: 'Armor' },
      { key: 'pants', icon: '👖', label: 'Pants' },
      { key: 'boots', icon: '👢', label: 'Boots' },
      { key: 'shield', icon: '🔰', label: 'Shield' },
      { key: 'ring', icon: '💍', label: 'Ring' },
      { key: 'accessory', icon: '🎒', label: 'Back' },
    ];

    return slots.map(s => {
      const item = equip[s.key];
      const hasItem = !!item;
      return `
        <div class="inv-equip-slot ${hasItem ? 'has-item' : ''}" data-slot="${s.key}" title="${item ? item.name : 'Empty ' + s.label}">
          ${hasItem
            ? `<span class="eq-icon">${item.icon?.symbol || '?'}</span><span class="eq-name">${item.name?.substring(0, 8) || ''}</span>`
            : `<span class="eq-icon" style="opacity:0.2">${s.icon}</span><span class="eq-label">${s.label}</span>`
          }
        </div>
      `;
    }).join('');
  }

  renderBagGrid(items) {
    let html = '';
    items.forEach((item, idx) => {
      const icon = item.icon?.symbol || '?';
      const qty = item.quantity || 1;
      html += `
        <div class="inv-bag-slot has-item" data-index="${idx}" title="${item.name}${qty > 1 ? ' x' + qty : ''}">
          <span class="bag-icon">${icon}</span>
          ${qty > 1 ? `<span class="bag-qty">x${qty}</span>` : ''}
        </div>
      `;
    });
    // Fill empty slots
    const emptyCount = Math.max(0, 24 - items.length);
    for (let i = 0; i < emptyCount; i++) {
      html += `<div class="inv-bag-slot"></div>`;
    }
    return html;
  }

  showContextMenu(x, y, items) {
    this.hideContextMenu();
    const menu = document.createElement('div');
    menu.className = 'inv-context-menu';
    menu.style.left = Math.min(x, window.innerWidth - 150) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - items.length * 30 - 10) + 'px';
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'ctx-item';
      btn.textContent = item.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideContextMenu();
        item.action();
      });
      menu.appendChild(btn);
    });
    document.body.appendChild(menu);
    this.contextMenu = menu;
  }

  hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.remove();
      this.contextMenu = null;
    }
  }

  showTooltip(e, item, isEquipped) {
    const tt = this.tooltipEl;
    let statsText = '';
    if (item.type === 'equipment' && item.stats) {
      const parts = [];
      if (item.stats.atk) parts.push(`ATK +${item.stats.atk}`);
      if (item.stats.def) parts.push(`DEF +${item.stats.def}`);
      if (item.stats.hp) parts.push(`HP +${item.stats.hp}`);
      if (item.stats.mp) parts.push(`MP +${item.stats.mp}`);
      if (item.stats.spd) parts.push(`SPD +${item.stats.spd}`);
      if (item.stats.crit) parts.push(`CRIT +${Math.round(item.stats.crit * 100)}%`);
      statsText = parts.join(' ');
    } else if (item.healAmount) {
      statsText = `Heals ${item.healAmount} HP`;
    } else if (item.manaAmount) {
      statsText = `Restores ${item.manaAmount} MP`;
    }

    tt.innerHTML = `
      <div class="tt-name">${item.name || item.id}</div>
      <div class="tt-type">${item.type || 'item'}${item.slot ? ' • ' + item.slot : ''}${isEquipped ? ' • Equipped' : ''}</div>
      ${item.description ? `<div class="tt-desc">${item.description}</div>` : ''}
      ${statsText ? `<div class="tt-stats">${statsText}</div>` : ''}
    `;
    tt.style.left = Math.min(e.clientX + 12, window.innerWidth - 220) + 'px';
    tt.style.top = Math.min(e.clientY + 12, window.innerHeight - 120) + 'px';
    tt.style.display = 'block';
  }

  hideTooltip() {
    this.tooltipEl.style.display = 'none';
  }

  useItem(itemId) {
    if (this.ws) this.ws.send(JSON.stringify({ type: 'use_item', itemId }));
  }

  equipItem(itemId) {
    if (this.ws) this.ws.send(JSON.stringify({ type: 'equip_item', itemId }));
  }

  unequipItem(slot) {
    if (this.ws) this.ws.send(JSON.stringify({ type: 'unequip_item', slot }));
  }

  assignToHotbar(itemId) {
    // Find first empty hotbar slot, or slot 1 (default potion slot)
    if (typeof state === 'undefined' || !state.hotbar) return;
    let targetIdx = -1;
    // Check if already assigned — if so, just flash it
    for (let i = 0; i < 10; i++) {
      const s = state.hotbar[i];
      if (s && s.type === 'potion' && s.id === itemId) {
        targetIdx = i;
        break;
      }
    }
    if (targetIdx === -1) {
      // Find first empty slot
      for (let i = 0; i < 10; i++) {
        if (!state.hotbar[i] || !state.hotbar[i].type) { targetIdx = i; break; }
      }
    }
    if (targetIdx === -1) {
      // All full — use slot index 1 (key "2")
      targetIdx = 1;
    }
    state.hotbar[targetIdx] = { type: 'potion', id: itemId };
    if (typeof saveHotbar === 'function') saveHotbar();
    if (typeof renderHotbar === 'function') renderHotbar();
    const keyLabel = targetIdx + 1 === 10 ? '0' : targetIdx + 1;
    if (typeof addChatMessage === 'function') addChatMessage('Hotbar', `🧪 Assigned to slot ${keyLabel}`);
  }

  dropItem(itemId) {
    // TODO: implement drop
  }

  // Update player data
  updatePlayer(player) {
    this.player = player;
    if (this.isOpen) this.render();
  }
}
