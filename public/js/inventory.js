1|// Zenithia — Inventory & Equipment UI
2|
3|export class InventoryUI {
4|  constructor(ws, playerState) {
5|    this.ws = ws;
6|    this.player = playerState;
7|    this.isOpen = false;
8|    this.activeTab = 'inventory';
9|    this.container = null;
10|    this.createUI();
11|  }
12|
13|  createUI() {
14|    this.container = document.createElement('div');
15|    this.container.id = 'inventory-ui';
16|    this.container.style.cssText = `
17|      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
18|      background:rgba(10,10,20,0.95); color:white; border-radius:16px;
19|      border:2px solid #4CAF50; z-index:25; display:none;
20|      font-family:'Courier New',monospace; width:500px;
21|    `;
22|    document.body.appendChild(this.container);
23|
24|    // Toggle with 'I' key
25|    document.addEventListener('keydown', (e) => {
26|      if (e.key === 'i' || e.key === 'I') {
27|        if (e.target.tagName === 'INPUT') return;
28|        this.toggle();
29|      }
30|      if (e.key === 'Escape' && this.isOpen) this.close();
31|    });
32|  }
33|
34|  toggle() {
35|    if (this.isOpen) this.close();
36|    else this.open();
37|  }
38|
39|  open() {
40|    this.isOpen = true;
41|    this.render();
42|    this.container.style.display = 'block';
43|  }
44|
45|  close() {
46|    this.isOpen = false;
47|    this.container.style.display = 'none';
48|  }
49|
50|  render() {
51|    const p = this.player;
52|    const inv = p.inventory || [];
53|    const equip = p.equipment || {};
54|
55|    this.container.innerHTML = `
56|      <div style="padding:20px;">
57|        <!-- Header -->
58|        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
59|          <h3 style="margin:0; color:#4CAF50;">Inventory</h3>
60|          <div style="display:flex; gap:8px;">
61|            <button class="inv-tab ${this.activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory"
62|              style="padding:4px 12px; border:1px solid #4CAF50; background:${this.activeTab === 'inventory' ? '#4CAF50' : 'transparent'}; color:white; border-radius:6px; cursor:pointer; font-family:inherit;">
63|              Items
64|            </button>
65|            <button class="inv-tab ${this.activeTab === 'equipment' ? 'active' : ''}" data-tab="equipment"
66|              style="padding:4px 12px; border:1px solid #4CAF50; background:${this.activeTab === 'equipment' ? '#4CAF50' : 'transparent'}; color:white; border-radius:6px; cursor:pointer; font-family:inherit;">
67|              Equipment
68|            </button>
69|            <button onclick="document.getElementById('inventory-ui').style.display='none'"
70|              style="padding:4px 12px; border:1px solid #F44336; background:transparent; color:#F44336; border-radius:6px; cursor:pointer; font-family:inherit;">
71|              ✕
72|            </button>
73|          </div>
74|        </div>
75|
76|        <!-- Zen display -->
77|        <div style="margin-bottom:12px; color:#FFD54F; font-size:0.9rem;">
78|          💰 ${p.zen || 0} Zen
79|        </div>
80|
81|        ${this.activeTab === 'inventory' ? this.renderInventory(inv) : this.renderEquipment(equip)}
82|      </div>
83|    `;
84|
85|    // Bind tab buttons
86|    this.container.querySelectorAll('.inv-tab').forEach(btn => {
87|      btn.addEventListener('click', () => {
88|        this.activeTab = btn.dataset.tab;
89|        this.render();
90|      });
91|    });
92|
93|    // Bind item use buttons
94|    this.container.querySelectorAll('.item-use').forEach(btn => {
95|      btn.addEventListener('click', () => {
96|        const itemId = btn.dataset.itemId;
97|        this.ws.send(JSON.stringify({ type: 'use_item', itemId }));
98|      });
99|    });
100|
101|    // Bind equip buttons
102|    this.container.querySelectorAll('.item-equip').forEach(btn => {
103|      btn.addEventListener('click', () => {
104|        const itemId = btn.dataset.itemId;
105|        this.ws.send(JSON.stringify({ type: 'equip_item', itemId }));
106|      });
107|    });
108|
109|    // Bind unequip buttons
110|    this.container.querySelectorAll('.item-unequip').forEach(btn => {
111|      btn.addEventListener('click', () => {
112|        const slot = btn.dataset.slot;
113|        this.ws.send(JSON.stringify({ type: 'unequip_item', slot }));
114|      });
115|    });
116|  }
117|
118|  renderInventory(items) {
119|    if (items.length === 0) {
120|      return '<div style="color:#888; text-align:center; padding:20px;">Inventory kosong</div>';
121|    }
122|
123|    let html = '<div style="display:grid; grid-template-columns:repeat(6,1fr); gap:6px;">';
124|    items.forEach((item, idx) => {
125|      const rarityColors = { common: '#9E9E9E', uncommon: '#4CAF50', rare: '#2196F3', epic: '#9C27B0', legendary: '#FF9800' };
126|      const borderColor = rarityColors[item.rarity] || '#666';
127|      const canUse = item.type === 'consumable';
128|      const canEquip = item.type === 'equipment';
129|
130|      html += `
131|        <div class="inv-slot" style="
132|          width:64px; height:64px; border:2px solid ${borderColor}; border-radius:8px;
133|          background:rgba(255,255,255,0.05); cursor:pointer; position:relative;
134|          display:flex; flex-direction:column; align-items:center; justify-content:center;
135|        " title="${item.name}\n${item.description}">
136|          <div style="font-size:1.2rem;">${item.icon?.symbol || '?'}</div>
137|          ${item.quantity > 1 ? `<div style="position:absolute; bottom:2px; right:4px; font-size:0.65rem; color:#fff;">x${item.quantity}</div>` : ''}
138|        </div>
139|        ${canUse ? `<button class="item-use" data-item-id="${item.id}" style="
140|          margin-top:2px; padding:2px 6px; font-size:0.6rem; background:#4CAF50; border:none;
141|          color:white; border-radius:4px; cursor:pointer;">Use</button>` : ''}
142|        ${canEquip ? `<button class="item-equip" data-item-id="${item.id}" style="
143|          margin-top:2px; padding:2px 6px; font-size:0.6rem; background:#2196F3; border:none;
144|          color:white; border-radius:4px; cursor:pointer;">Equip</button>` : ''}
145|      `;
146|    });
147|    // Fill empty slots
148|    for (let i = items.length; i < 24; i++) {
149|      html += `
150|        <div style="width:64px; height:64px; border:2px solid #333; border-radius:8px;
151|          background:rgba(255,255,255,0.02);"></div>
152|      `;
153|    }
154|    html += '</div>';
155|    return html;
156|  }
157|
158|  renderEquipment(equip) {
159|    const slots = [
160|      { key: 'weapon', label: 'Weapon', x: '50%', y: '25%' },
161|      { key: 'armor', label: 'Armor', x: '50%', y: '50%' },
162|      { key: 'helmet', label: 'Helmet', x: '50%', y: '10%' },
163|      { key: 'shield', label: 'Shield', x: '25%', y: '50%' },
164|      { key: 'accessory', label: 'Accessory', x: '75%', y: '75%' },
165|    ];
166|
167|    let html = '<div style="position:relative; height:280px;">';
168|
169|    // Character silhouette
170|    html += `<div style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
171|      width:70px; height:160px; border:2px dashed #333; border-radius:8px;"></div>`;
172|
173|    slots.forEach(slot => {
174|      const item = equip[slot.key];
175|      const rarityColors = { common: '#9E9E9E', uncommon: '#4CAF50', rare: '#2196F3', epic: '#9C27B0', legendary: '#FF9800' };
176|      const borderColor = item ? (rarityColors[item.rarity] || '#666') : '#333';
177|
178|      html += `
179|        <div style="position:absolute; left:${slot.x}; top:${slot.y}; transform:translate(-50%,-50%); text-align:center;">
180|          <div style="
181|            width:56px; height:56px; border:2px solid ${borderColor}; border-radius:8px;
182|            background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center;
183|            font-size:1.2rem; margin:0 auto;
184|          " title="${item ? item.name : slot.label}">
185|            ${item ? (item.icon?.symbol || '?') : ''}
186|          </div>
187|          <div style="font-size:0.65rem; color:#888; margin-top:4px;">${slot.label}</div>
188|          ${item ? `<button class="item-unequip" data-slot="${slot.key}" style="
189|            margin-top:2px; padding:2px 6px; font-size:0.6rem; background:#F44336; border:none;
190|            color:white; border-radius:4px; cursor:pointer;">Remove</button>` : ''}
191|        </div>
192|      `;
193|    });
194|
195|    // Stats summary
196|    html += `
197|      <div style="position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:center; gap:16px;
198|        font-size:0.75rem; color:#aaa; padding:8px; border-top:1px solid #333;">
199|        <span>ATK: ${this.player.atk || 10}</span>
200|        <span>DEF: ${this.player.def || 5}</span>
201|        <span>SPD: ${this.player.spd || 10}</span>
202|        <span>CRIT: ${Math.round((this.player.crit || 0.05) * 100)}%</span>
203|      </div>
204|    `;
205|
206|    html += '</div>';
207|    return html;
208|  }
209|
210|  // Update player data
211|  updatePlayer(player) {
212|    this.player = player;
213|    if (this.isOpen) this.render();
214|  }
215|}
216|