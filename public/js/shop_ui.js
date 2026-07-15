// Zenithia — Shop UI System
// Buy/Sell items with NPC merchants

import { ITEM_PRICES } from './items_client.js';

export class ShopUI {
  constructor(ws, playerState) {
    this.ws = ws;
    this.playerState = playerState;
    this.shopId = null;
    this.shopName = '';
    this.catalog = [];
    this.tab = 'buy'; // 'buy' or 'sell'
    this.container = null;
    this.createUI();
  }

  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'shop-ui';
    this.container.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:rgba(10,10,20,0.97); color:#eee; border-radius:16px;
      border:2px solid #d4ac0d; width:420px; max-width:94vw; max-height:80vh;
      z-index:40; display:none; font-family:'Courier New',monospace;
      box-shadow:0 0 40px rgba(212,172,13,0.3);
      display:none; flex-direction:column; overflow:hidden;
    `;
    document.body.appendChild(this.container);
  }

  open(shopId, shopName, catalog, itemPrices) {
    this.shopId = shopId;
    this.shopName = shopName;
    this.catalog = catalog;
    this.itemPrices = itemPrices || {};
    this.tab = 'buy';
    this.render();
    this.container.style.display = 'flex';
  }

  close() {
    this.container.style.display = 'none';
    this.shopId = null;
  }

  render() {
    const zen = this.playerState?.zen || 0;
    const inventory = this.playerState?.inventory || [];

    this.container.innerHTML = `
      <div style="padding:16px 20px 12px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:15px; font-weight:bold; color:#d4ac0d;">${this.shopName}</span>
        <div style="display:flex; gap:8px; align-items:center;">
          <span style="color:#ffd700; font-size:12px;">💰 ${zen} Zen</span>
          <button id="shop-close" style="background:none; border:none; color:#888; font-size:18px; cursor:pointer;">✕</button>
        </div>
      </div>

      <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.1);">
        <button id="tab-buy" class="shop-tab ${this.tab === 'buy' ? 'active' : ''}" style="flex:1; padding:8px; background:${this.tab === 'buy' ? 'rgba(76,175,80,0.2)' : 'transparent'}; border:none; color:${this.tab === 'buy' ? '#4CAF50' : '#888'}; font-size:12px; cursor:pointer; border-bottom:2px solid ${this.tab === 'buy' ? '#4CAF50' : 'transparent'};">🛒 Buy</button>
        <button id="tab-sell" class="shop-tab ${this.tab === 'sell' ? 'active' : ''}" style="flex:1; padding:8px; background:${this.tab === 'sell' ? 'rgba(255,152,0,0.2)' : 'transparent'}; border:none; color:${this.tab === 'sell' ? '#FF9800' : '#888'}; font-size:12px; cursor:pointer; border-bottom:2px solid ${this.tab === 'sell' ? '#FF9800' : 'transparent'};">💰 Sell</button>
      </div>

      <div id="shop-items" style="flex:1; overflow-y:auto; max-height:55vh; padding:8px;">
        ${this.tab === 'buy' ? this.renderBuyItems(zen) : this.renderSellItems(zen)}
      </div>

      <div id="shop-msg" style="padding:8px 16px; font-size:11px; color:#888; min-height:28px; border-top:1px solid rgba(255,255,255,0.06);"></div>
    `;

    // Events
    this.container.querySelector('#shop-close')?.addEventListener('click', () => this.close());
    this.container.querySelector('#tab-buy')?.addEventListener('click', () => { this.tab = 'buy'; this.render(); });
    this.container.querySelector('#tab-sell')?.addEventListener('click', () => { this.tab = 'sell'; this.render(); });

    // Buy buttons
    this.container.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.item;
        const price = parseInt(btn.dataset.price);
        if (zen >= price) {
          this.ws.send(JSON.stringify({ type: 'buy_item', shopId: this.shopId, itemId, quantity: 1 }));
        } else {
          this.showMsg('❌ Not enough Zen!', '#e74c3c');
        }
      });
    });

    // Sell buttons
    this.container.querySelectorAll('.sell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.item;
        const row = btn.closest('.sell-row');
        const input = row?.querySelector('.sell-qty-input');
        const qty = Math.max(1, parseInt(input?.value) || 1);
        this.ws.send(JSON.stringify({ type: 'sell_item', shopId: this.shopId, itemId, quantity: qty }));
      });
    });
    // Sell qty +/- buttons
    this.container.querySelectorAll('.sell-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.closest('.sell-row')?.querySelector('.sell-qty-input');
        if (input) { input.value = Math.min(parseInt(input.max), parseInt(input.value) + 1); }
      });
    });
    this.container.querySelectorAll('.sell-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.closest('.sell-row')?.querySelector('.sell-qty-input');
        if (input) { input.value = Math.max(1, parseInt(input.value) - 1); }
      });
    });

    // Click outside to close
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });
  }

  renderBuyItems(zen) {
    if (!this.catalog.length) return '<div style="padding:20px; text-align:center; color:#666;">No items available</div>';

    return this.catalog.map(item => {
      const iconBg = item.icon ? `#${item.icon.bg.toString(16).padStart(6, '0')}` : '#555';
      const iconFg = item.icon ? `#${item.icon.fg.toString(16).padStart(6, '0')}` : '#fff';
      const symbol = item.icon?.symbol || '?';
      const affordable = zen >= item.price;
      const statsText = item.stats ? Object.entries(item.stats).map(([k, v]) => `${k.toUpperCase()}+${v}`).join(' ') : '';
      const effectText = item.healAmount ? `Heal ${item.healAmount} HP` : item.manaAmount ? `Restore ${item.manaAmount} MP` : '';

      return `
        <div style="display:flex; align-items:center; padding:10px 12px; margin:4px 0; border-radius:8px; background:rgba(255,255,255,0.04); gap:12px;">
          <div style="width:36px; height:36px; border-radius:6px; background:${iconBg}; display:flex; align-items:center; justify-content:center; color:${iconFg}; font-size:14px; font-weight:bold; flex-shrink:0;">
            ${symbol}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:12px; font-weight:bold; color:#eee;">${item.name}</div>
            <div style="font-size:10px; color:#999;">${item.description || ''}</div>
            ${statsText ? `<div style="font-size:10px; color:#7ec8e3;">${statsText}</div>` : ''}
            ${effectText ? `<div style="font-size:10px; color:#4CAF50;">${effectText}</div>` : ''}
          </div>
          <button class="buy-btn" data-item="${item.itemId}" data-price="${item.price}"
            style="background:${affordable ? 'rgba(76,175,80,0.2)' : 'rgba(100,100,100,0.2)'};
            border:1px solid ${affordable ? '#4CAF50' : '#555'};
            color:${affordable ? '#4CAF50' : '#666'};
            padding:5px 12px; border-radius:6px; font-size:11px; cursor:${affordable ? 'pointer' : 'not-allowed'}; white-space:nowrap;">
            💰 ${item.price}
          </button>
        </div>
      `;
    }).join('');
  }

  renderSellItems(zen) {
    const sellable = (this.playerState?.inventory || []).filter(i => i.type !== 'quest');

    if (!sellable.length) return '<div style="padding:20px; text-align:center; color:#666;">No items to sell</div>';

    return sellable.map(item => {
      const iconBg = item.icon ? `#${item.icon.bg.toString(16).padStart(6, '0')}` : '#555';
      const iconFg = item.icon ? `#${item.icon.fg.toString(16).padStart(6, '0')}` : '#fff';
      const symbol = item.icon?.symbol || '?';
      const itemPrice = ITEM_PRICES[item.id] || this.itemPrices?.[item.id] || this.catalog.find(c => c.itemId === item.id)?.price || 10;
      const shop = this.getShopDef();
      const sellPrice = Math.ceil(itemPrice * (shop?.sellMultiplier || 0.4));
      const qty = item.quantity || 1;

      return `
        <div class="sell-row" style="display:flex; align-items:center; padding:10px 12px; margin:4px 0; border-radius:8px; background:rgba(255,255,255,0.04); gap:8px;">
          <div style="width:36px; height:36px; border-radius:6px; background:${iconBg}; display:flex; align-items:center; justify-content:center; color:${iconFg}; font-size:14px; font-weight:bold; flex-shrink:0;">
            ${symbol}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:12px; font-weight:bold; color:#eee;">${item.name} <span style="color:#666; font-size:10px;">x${qty}</span></div>
            <div style="font-size:10px; color:#999;">${item.description || ''}</div>
          </div>
          <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
            <button class="sell-qty-minus" style="width:20px; height:20px; border-radius:4px; border:1px solid #555; background:rgba(255,255,255,0.06); color:#aaa; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center;">−</button>
            <input class="sell-qty-input" type="number" min="1" max="${qty}" value="1" style="width:36px; height:20px; text-align:center; border-radius:4px; border:1px solid #555; background:rgba(0,0,0,0.3); color:#eee; font-size:11px; padding:0;">
            <button class="sell-qty-plus" style="width:20px; height:20px; border-radius:4px; border:1px solid #555; background:rgba(255,255,255,0.06); color:#aaa; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center;">+</button>
          </div>
          <button class="sell-btn" data-item="${item.id}"
            style="background:rgba(255,152,0,0.2); border:1px solid #FF9800;
            color:#FF9800; padding:5px 10px; border-radius:6px; font-size:11px; cursor:pointer; white-space:nowrap;">
            💰 ${sellPrice}
          </button>
        </div>
      `;
    }).join('');
  }

  getShopDef() {
    // Import inline to avoid circular deps — just match by id
    const shops = {
      sir_gendut: { sellMultiplier: 0.4 },
      mrs_ningsih: { sellMultiplier: 0.3 },
      herbalist_sari: { sellMultiplier: 0.5 },
    };
    return shops[this.shopId] || { sellMultiplier: 0.4 };
  }

  showMsg(text, color = '#ccc') {
    const el = this.container.querySelector('#shop-msg');
    if (el) { el.textContent = text; el.style.color = color; }
  }

  // Handle server responses
  handleMsg(msg) {
    if (msg.type === 'shop_catalog') {
      this.open(msg.shopId, msg.shopName, msg.catalog, msg.itemPrices);
    } else if (msg.type === 'shop_result') {
      if (msg.action === 'buy') {
        this.showMsg(`✅ Bought ${msg.quantity}x ${msg.itemId} for ${msg.cost} Zen`, '#4CAF50');
      } else if (msg.action === 'sell') {
        this.showMsg(`✅ Sold ${msg.quantity}x for ${msg.earned} Zen`, '#FF9800');
      }
      // Update player state
      if (this.playerState) {
        this.playerState.zen = msg.zen;
        this.playerState.inventory = msg.inventory;
      }
      // Re-render after short delay (server confirms)
      setTimeout(() => this.render(), 100);
    } else if (msg.type === 'shop_error') {
      this.showMsg(`❌ ${msg.error}`, '#e74c3c');
    }
  }
}
