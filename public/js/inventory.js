// Zenithia — Inventory & Equipment UI

export class InventoryUI {
  constructor(ws, playerState) {
    this.ws = ws;
    this.player = playerState;
    this.isOpen = false;
    this.activeTab = 'inventory';
    this.container = null;
    this.createUI();
  }

  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'inventory-ui';
    this.container.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:rgba(10,10,20,0.95); color:white; border-radius:16px;
      border:2px solid #4CAF50; z-index:25; display:none;
      font-family:'Courier New',monospace; width:500px;
    `;
    document.body.appendChild(this.container);

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
  }

  render() {
    const p = this.player;
    const inv = p.inventory || [];
    const equip = p.equipment || {};

    this.container.innerHTML = `
      <div style="padding:20px;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0; color:#4CAF50;">Inventory</h3>
          <div style="display:flex; gap:8px;">
            <button class="inv-tab ${this.activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory"
              style="padding:4px 12px; border:1px solid #4CAF50; background:${this.activeTab === 'inventory' ? '#4CAF50' : 'transparent'}; color:white; border-radius:6px; cursor:pointer; font-family:inherit;">
              Items
            </button>
            <button class="inv-tab ${this.activeTab === 'equipment' ? 'active' : ''}" data-tab="equipment"
              style="padding:4px 12px; border:1px solid #4CAF50; background:${this.activeTab === 'equipment' ? '#4CAF50' : 'transparent'}; color:white; border-radius:6px; cursor:pointer; font-family:inherit;">
              Equipment
            </button>
            <button onclick="document.getElementById('inventory-ui').style.display='none'"
              style="padding:4px 12px; border:1px solid #F44336; background:transparent; color:#F44336; border-radius:6px; cursor:pointer; font-family:inherit;">
              ✕
            </button>
          </div>
        </div>

        <!-- Zen display -->
        <div style="margin-bottom:12px; color:#FFD54F; font-size:0.9rem;">
          💰 ${p.zen || 0} Zen
        </div>

        ${this.activeTab === 'inventory' ? this.renderInventory(inv) : this.renderEquipment(equip)}
      </div>
    `;

    // Bind tab buttons
    this.container.querySelectorAll('.inv-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    // Bind item use buttons
    this.container.querySelectorAll('.item-use').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.itemId;
        this.ws.send(JSON.stringify({ type: 'use_item', itemId }));
      });
    });

    // Bind equip buttons
    this.container.querySelectorAll('.item-equip').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.itemId;
        this.ws.send(JSON.stringify({ type: 'equip_item', itemId }));
      });
    });

    // Bind unequip buttons
    this.container.querySelectorAll('.item-unequip').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.dataset.slot;
        this.ws.send(JSON.stringify({ type: 'unequip_item', slot }));
      });
    });
  }

  renderInventory(items) {
    if (items.length === 0) {
      return '<div style="color:#888; text-align:center; padding:20px;">Inventory kosong</div>';
    }

    let html = '<div style="display:grid; grid-template-columns:repeat(6,1fr); gap:6px;">';
    items.forEach((item, idx) => {
      const rarityColors = { common: '#9E9E9E', uncommon: '#4CAF50', rare: '#2196F3', epic: '#9C27B0', legendary: '#FF9800' };
      const borderColor = rarityColors[item.rarity] || '#666';
      const canUse = item.type === 'consumable';
      const canEquip = item.type === 'equipment';

      html += `
        <div class="inv-slot" style="
          width:64px; height:64px; border:2px solid ${borderColor}; border-radius:8px;
          background:rgba(255,255,255,0.05); cursor:pointer; position:relative;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
        " title="${item.name}\n${item.description}">
          <div style="font-size:1.2rem;">${item.icon?.symbol || '?'}</div>
          ${item.quantity > 1 ? `<div style="position:absolute; bottom:2px; right:4px; font-size:0.65rem; color:#fff;">x${item.quantity}</div>` : ''}
        </div>
        ${canUse ? `<button class="item-use" data-item-id="${item.id}" style="
          margin-top:2px; padding:2px 6px; font-size:0.6rem; background:#4CAF50; border:none;
          color:white; border-radius:4px; cursor:pointer;">Use</button>` : ''}
        ${canEquip ? `<button class="item-equip" data-item-id="${item.id}" style="
          margin-top:2px; padding:2px 6px; font-size:0.6rem; background:#2196F3; border:none;
          color:white; border-radius:4px; cursor:pointer;">Equip</button>` : ''}
      `;
    });
    // Fill empty slots
    for (let i = items.length; i < 24; i++) {
      html += `
        <div style="width:64px; height:64px; border:2px solid #333; border-radius:8px;
          background:rgba(255,255,255,0.02);"></div>
      `;
    }
    html += '</div>';
    return html;
  }

  renderEquipment(equip) {
    const slots = [
      { key: 'weapon', label: 'Weapon', x: '50%', y: '25%' },
      { key: 'armor', label: 'Armor', x: '50%', y: '50%' },
      { key: 'helmet', label: 'Helmet', x: '50%', y: '10%' },
      { key: 'shield', label: 'Shield', x: '25%', y: '50%' },
      { key: 'accessory', label: 'Accessory', x: '75%', y: '75%' },
    ];

    let html = '<div style="position:relative; height:280px;">';

    // Character silhouette
    html += `<div style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
      width:80px; height:140px; border:2px dashed #333; border-radius:8px;"></div>`;

    slots.forEach(slot => {
      const item = equip[slot.key];
      const rarityColors = { common: '#9E9E9E', uncommon: '#4CAF50', rare: '#2196F3', epic: '#9C27B0', legendary: '#FF9800' };
      const borderColor = item ? (rarityColors[item.rarity] || '#666') : '#333';

      html += `
        <div style="position:absolute; left:${slot.x}; top:${slot.y}; transform:translate(-50%,-50%); text-align:center;">
          <div style="
            width:56px; height:56px; border:2px solid ${borderColor}; border-radius:8px;
            background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center;
            font-size:1.2rem; margin:0 auto;
          " title="${item ? item.name : slot.label}">
            ${item ? (item.icon?.symbol || '?') : ''}
          </div>
          <div style="font-size:0.65rem; color:#888; margin-top:4px;">${slot.label}</div>
          ${item ? `<button class="item-unequip" data-slot="${slot.key}" style="
            margin-top:2px; padding:2px 6px; font-size:0.6rem; background:#F44336; border:none;
            color:white; border-radius:4px; cursor:pointer;">Remove</button>` : ''}
        </div>
      `;
    });

    // Stats summary
    html += `
      <div style="position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:center; gap:16px;
        font-size:0.75rem; color:#aaa; padding:8px; border-top:1px solid #333;">
        <span>ATK: ${this.player.atk || 10}</span>
        <span>DEF: ${this.player.def || 5}</span>
        <span>SPD: ${this.player.spd || 10}</span>
        <span>CRIT: ${Math.round((this.player.crit || 0.05) * 100)}%</span>
      </div>
    `;

    html += '</div>';
    return html;
  }

  // Update player data
  updatePlayer(player) {
    this.player = player;
    if (this.isOpen) this.render();
  }
}
