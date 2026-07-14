// item-icons.js — Canvas-rendered inventory icons
// System-based: maps item name patterns → visual themes per slot type

// ── Theme colors by item prefix ──
const THEMES = {
  guard:      { primary: '#8D6E63', secondary: '#5D4037', accent: '#A1887F', tier: 1 },
  moss:       { primary: '#66BB6A', secondary: '#388E3C', accent: '#A5D6A7', tier: 2 },
  bramble:    { primary: '#4CAF50', secondary: '#2E7D32', accent: '#81C784', tier: 3 },
  dancer:     { primary: '#E91E63', secondary: '#AD1457', accent: '#F48FB1', tier: 1 },
  plains:     { primary: '#8D6E63', secondary: '#5D4037', accent: '#BCAAA4', tier: 2 },
  storm:      { primary: '#42A5F5', secondary: '#1565C0', accent: '#90CAF9', tier: 3 },
  sage:       { primary: '#7E57C2', secondary: '#4527A0', accent: '#B39DDB', tier: 1 },
  deepwood:   { primary: '#2E7D32', secondary: '#1B5E20', accent: '#66BB6A', tier: 2 },
  arcane:     { primary: '#9C27B0', secondary: '#6A1B9A', accent: '#CE93D8', tier: 3 },
  healer:     { primary: '#E0E0E0', secondary: '#9E9E9E', accent: '#F5F5F5', tier: 1 },
  shrine:     { primary: '#FFD54F', secondary: '#FFC107', accent: '#FFF9C4', tier: 2 },
  lightweave: { primary: '#FFF8E1', secondary: '#FFD54F', accent: '#FFFFFF', tier: 3 },
  shadow:     { primary: '#424242', secondary: '#212121', accent: '#757575', tier: 1 },
  nightstalker: { primary: '#212121', secondary: '#000000', accent: '#616161', tier: 2 },
  void:       { primary: '#1A1A2E', secondary: '#16213E', accent: '#7B1FA2', tier: 3 },
  iron:       { primary: '#78909C', secondary: '#546E7A', accent: '#B0BEC5', tier: 2 },
  wooden:     { primary: '#8D6E63', secondary: '#5D4037', accent: '#BCAAA4', tier: 1 },
  copper:     { primary: '#E67E22', secondary: '#D35400', accent: '#F0B27A', tier: 0 },
  moonstone:  { primary: '#B3E5FC', secondary: '#81D4FA', accent: '#E1F5FE', tier: 0 },
  aether:     { primary: '#CE93D8', secondary: '#AB47BC', accent: '#E1BEE7', tier: 0 },
  holy:       { primary: '#FFF9C4', secondary: '#FFD54F', accent: '#FFFFFF', tier: 2 },
  lightward:  { primary: '#FFF8E1', secondary: '#FFECB3', accent: '#FFFFFF', tier: 3 },
  wind:       { primary: '#81D4FA', secondary: '#4FC3F7', accent: '#B3E5FC', tier: 0 },
  travel:     { primary: '#8D6E63', secondary: '#5D4037', accent: '#BCAAA4', tier: 0 },
  ironclad:   { primary: '#607D8B', secondary: '#455A64', accent: '#90A4AE', tier: 1 },
  guardian:   { primary: '#FFD54F', secondary: '#FFC107', accent: '#FFF9C4', tier: 3 },
  nightfang:  { primary: '#37474F', secondary: '#263238', accent: '#546E7A', tier: 2 },
  village:    { primary: '#BDBDBD', secondary: '#9E9E9E', accent: '#E0E0E0', tier: 1 },
};

// Fallback theme for unknown items
const DEFAULT_THEME = { primary: '#607D8B', secondary: '#455A64', accent: '#90A4AE', tier: 1 };

function getTheme(itemId) {
  // Try longest prefix match
  const parts = itemId.split('_');
  for (let len = parts.length; len >= 1; len--) {
    const prefix = parts.slice(0, len).join('_');
    if (THEMES[prefix]) return THEMES[prefix];
  }
  return DEFAULT_THEME;
}

// ── Drawing functions per slot type ──

function drawArmor(ctx, s, theme) {
  const cx = s / 2, cy = s / 2;
  // Body plate
  ctx.fillStyle = theme.primary;
  roundRect(ctx, cx - s*0.22, cy - s*0.25, s*0.44, s*0.45, s*0.04);
  ctx.fill();
  // Shoulder plates
  ctx.fillStyle = theme.secondary;
  roundRect(ctx, cx - s*0.3, cy - s*0.28, s*0.15, s*0.12, s*0.03);
  ctx.fill();
  roundRect(ctx, cx + s*0.15, cy - s*0.28, s*0.15, s*0.12, s*0.03);
  ctx.fill();
  // Belt
  ctx.fillStyle = theme.accent;
  ctx.fillRect(cx - s*0.22, cy + s*0.08, s*0.44, s*0.04);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, cx - s*0.18, cy - s*0.22, s*0.12, s*0.3, s*0.02);
  ctx.fill();
  // Tier indicator dots
  for (let i = 0; i < theme.tier; i++) {
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(cx - s*0.08 + i * s*0.08, cy + s*0.18, s*0.02, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPants(ctx, s, theme) {
  const cx = s / 2, cy = s / 2;
  // Waist
  ctx.fillStyle = theme.secondary;
  roundRect(ctx, cx - s*0.22, cy - s*0.28, s*0.44, s*0.1, s*0.02);
  ctx.fill();
  // Left leg
  ctx.fillStyle = theme.primary;
  roundRect(ctx, cx - s*0.22, cy - s*0.18, s*0.2, s*0.4, s*0.03);
  ctx.fill();
  // Right leg
  roundRect(ctx, cx + s*0.02, cy - s*0.18, s*0.2, s*0.4, s*0.03);
  ctx.fill();
  // Belt buckle
  ctx.fillStyle = theme.accent;
  ctx.fillRect(cx - s*0.04, cy - s*0.26, s*0.08, s*0.06);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(cx - s*0.18, cy - s*0.1, s*0.06, s*0.25);
  ctx.fillRect(cx + s*0.06, cy - s*0.1, s*0.06, s*0.25);
  // Tier dots
  for (let i = 0; i < theme.tier; i++) {
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(cx - s*0.08 + i * s*0.08, cy + s*0.28, s*0.015, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBoots(ctx, s, theme) {
  const cx = s / 2, cy = s / 2;
  // Left boot
  ctx.fillStyle = theme.primary;
  roundRect(ctx, cx - s*0.28, cy - s*0.15, s*0.18, s*0.3, s*0.03);
  ctx.fill();
  // Sole
  ctx.fillStyle = theme.secondary;
  roundRect(ctx, cx - s*0.3, cy + s*0.12, s*0.22, s*0.06, s*0.02);
  ctx.fill();
  // Right boot
  ctx.fillStyle = theme.primary;
  roundRect(ctx, cx + s*0.1, cy - s*0.15, s*0.18, s*0.3, s*0.03);
  ctx.fill();
  // Sole
  ctx.fillStyle = theme.secondary;
  roundRect(ctx, cx + s*0.08, cy + s*0.12, s*0.22, s*0.06, s*0.02);
  ctx.fill();
  // Accents
  ctx.fillStyle = theme.accent;
  ctx.fillRect(cx - s*0.26, cy - s*0.1, s*0.14, s*0.03);
  ctx.fillRect(cx + s*0.12, cy - s*0.1, s*0.14, s*0.03);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(cx - s*0.26, cy - s*0.12, s*0.04, s*0.2);
  ctx.fillRect(cx + s*0.12, cy - s*0.12, s*0.04, s*0.2);
}

function drawShield(ctx, s, theme) {
  const cx = s / 2, cy = s / 2;
  ctx.save();
  ctx.translate(cx, cy);
  // Shield body
  ctx.fillStyle = theme.primary;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.3);
  ctx.lineTo(s * 0.28, -s * 0.15);
  ctx.lineTo(s * 0.25, s * 0.15);
  ctx.lineTo(0, s * 0.28);
  ctx.lineTo(-s * 0.25, s * 0.15);
  ctx.lineTo(-s * 0.28, -s * 0.15);
  ctx.closePath();
  ctx.fill();
  // Rim
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Emblem
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(-s*0.2, -s*0.2);
  ctx.lineTo(0, -s*0.28);
  ctx.lineTo(s*0.05, -s*0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Tier dots
  for (let i = 0; i < theme.tier; i++) {
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(cx - s*0.06 + i * s*0.06, cy + s*0.3, s*0.015, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRing(ctx, s, theme) {
  const cx = s / 2, cy = s / 2;
  ctx.save();
  ctx.translate(cx, cy);
  // Band (ellipse)
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.2, s * 0.15, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Gem on top
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(0, -s * 0.1, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Gem highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(-s*0.02, -s*0.12, s*0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAccessory(ctx, s, theme) {
  const cx = s / 2, cy = s / 2;
  ctx.save();
  ctx.translate(cx, cy);
  // Chain/cord
  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = s * 0.025;
  ctx.beginPath();
  ctx.moveTo(-s*0.15, -s*0.25);
  ctx.quadraticCurveTo(-s*0.05, -s*0.15, 0, -s*0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s*0.15, -s*0.25);
  ctx.quadraticCurveTo(s*0.05, -s*0.15, 0, -s*0.05);
  ctx.stroke();
  // Pendant/gem
  ctx.fillStyle = theme.primary;
  ctx.beginPath();
  ctx.arc(0, s * 0.05, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Gem highlight
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(-s*0.02, s*0.02, s*0.04, 0, Math.PI * 2);
  ctx.fill();
  // Glow
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.arc(0, s*0.05, s*0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── Item-specific overrides for existing weapons/consumables/materials ──
const ITEM_OVERRIDES = {
  // Weapons (from old system, kept for compatibility)
  village_blade:    { type: 'weapon', blade: '#BDBDBD', handle: '#5D4037', style: 'short' },
  ironclad_edge:    { type: 'weapon', blade: '#78909C', handle: '#4E342E', style: 'short', notched: true },
  guardian_cleaver: { type: 'weapon', blade: '#90A4AE', handle: '#5D4037', style: 'cleaver', guard: '#FFD54F' },
  nightfang:        { type: 'weapon', blade: '#37474F', handle: '#4A148C', style: 'dagger', glow: '#7B1FA2' },
  void_edge:        { type: 'weapon', blade: '#1A1A2E', handle: '#6A1B9A', style: 'dagger', glow: '#9C27B0', lightning: true },
  wind_cutter:      { type: 'weapon', blade: '#81D4FA', handle: '#5D4037', style: 'curved', tint: '#B3E5FC' },
  plains_slicer:    { type: 'weapon', blade: '#26A69A', handle: '#5D4037', style: 'dual', crack: true },
  tempest_dual:     { type: 'weapon', blade: '#00BCD4', handle: '#37474F', style: 'twin', spark: true },
  willow_staff:     { type: 'weapon', blade: '#4CAF50', handle: '#795548', style: 'staff', crystal: '#66BB6A' },
  deepwood_rod:     { type: 'weapon', blade: '#2E7D32', handle: '#5D4037', style: 'staff', crystal: '#81C784' },
  arcane_focus:     { type: 'weapon', blade: '#7B1FA2', handle: '#5D4037', style: 'staff', crystal: '#CE93D8', runes: true },
  pilgrim_staff:    { type: 'weapon', blade: '#FFD54F', handle: '#8D6E63', style: 'staff', crystal: '#FFEB3B' },
  shrine_scepter:   { type: 'weapon', blade: '#F5F5F5', handle: '#FFD54F', style: 'scepter', glow: '#FFF9C4' },
  lightbringer_rod: { type: 'weapon', blade: '#FFD54F', handle: '#F5F5F5', style: 'staff', crystal: '#FFEB3B', rays: true },
  rusty_dagger:     { type: 'weapon', blade: '#8D6E63', handle: '#5D4037', style: 'dagger', rusty: true },
  // Shields (override auto-draw)
  moss_shell:      { type: 'shield', body: '#4CAF50', bodyHi: '#81C784', emblem: '#FFEB3B', style: 'round' },
  turtle_shell:    { type: 'shield', body: '#2E7D32', bodyHi: '#4CAF50', emblem: '#A5D6A7', style: 'hex' },
  wooden_buckler:  { type: 'shield', body: '#8D6E63', bodyHi: '#BCAAA4', emblem: '#A1887F', style: 'round' },
  iron_wall:       { type: 'shield', body: '#78909C', bodyHi: '#B0BEC5', emblem: '#90A4AE', style: 'hex' },
  guardian_aegis:  { type: 'shield', body: '#FFD54F', bodyHi: '#FFF9C4', emblem: '#FF8F00', style: 'round' },
  holy_buckler:    { type: 'shield', body: '#FFF9C4', bodyHi: '#FFFFFF', emblem: '#FFD54F', style: 'round' },
  lightward_aegis: { type: 'shield', body: '#FFF8E1', bodyHi: '#FFFFFF', emblem: '#FFECB3', style: 'hex' },
  // Materials
  thorn:           { type: 'material', body: '#5D4037', sparkle: '#FF8A65', style: 'thorn' },
  dust_pouch:      { type: 'material', body: '#8D6E63', sparkle: '#D7CCC8', style: 'pouch' },
  frog_leg:        { type: 'material', body: '#26A69A', bodyHi: '#4DB6AC', style: 'organ' },
  wind_essence:    { type: 'material', body: '#29B6F6', bodyHi: '#81D4FA', sparkle: '#B3E5FC', style: 'crystal' },
  stone_fragment:  { type: 'material', body: '#78909C', bodyHi: '#B0BEC5', sparkle: '#E0E0E0', style: 'stone' },
  boar_tusk:       { type: 'material', body: '#EFEBE9', bodyHi: '#FFFFFF', bodySh: '#D7CCC8', style: 'tusk' },
  bramble_core:    { type: 'material', body: '#4CAF50', bodyHi: '#81C784', sparkle: '#A5D6A7', style: 'core' },
  // Consumables
  potion_small:     { type: 'consumable', potion: '#E53935', liquid: '#EF5350', style: 'bottle' },
  potion_medium:    { type: 'consumable', potion: '#D32F2F', liquid: '#F44336', style: 'flask' },
  mp_potion_small:  { type: 'consumable', potion: '#1565C0', liquid: '#42A5F5', style: 'teardrop' },
  antidote:         { type: 'consumable', potion: '#2E7D32', liquid: '#66BB6A', style: 'vial' },
  willow_rice:      { type: 'consumable', body: '#FF9800', bodyHi: '#FFB74D', style: 'bowl' },
  chicken_stew:     { type: 'consumable', body: '#8D6E63', bodyHi: '#BCAAA4', style: 'stew' },
  // Rings (override)
  copper_band:     { type: 'ring', band: '#E67E22', gem: '#D35400' },
  wind_charm:      { type: 'ring', band: '#81D4FA', gem: '#29B6F6' },
  moonstone_ring:  { type: 'ring', band: '#B3E5FC', gem: '#E1F5FE' },
  aether_pendant:  { type: 'ring', band: '#CE93D8', gem: '#AB47BC' },
  guardian_signet: { type: 'ring', band: '#FFD54F', gem: '#FF8F00' },
  // Accessories (override)
  travel_pack:     { type: 'accessory', gem: '#8D6E63', chain: '#5D4037' },
  wind_cloak:      { type: 'accessory', gem: '#81D4FA', chain: '#4FC3F7' },
  bramble_cape:    { type: 'accessory', gem: '#4CAF50', chain: '#2E7D32' },
};

// ── Resolve item type from ID ──
function resolveType(itemId, override) {
  if (override?.type) return override.type;
  if (['potion_small','potion_medium','mp_potion_small','antidote','willow_rice','chicken_stew'].includes(itemId)) return 'consumable';
  if (['thorn','dust_pouch','frog_leg','wind_essence','stone_fragment','boar_tusk','bramble_core'].includes(itemId)) return 'material';
  if (['moss_shell','turtle_shell','wooden_buckler','iron_wall','guardian_aegis','holy_buckler','lightward_aegis'].includes(itemId)) return 'shield';
  if (itemId.includes('blade') || itemId.includes('edge') || itemId.includes('cleaver') || itemId.includes('fang') || itemId.includes('cutter') || itemId.includes('slicer') || itemId.includes('dual') || itemId.includes('staff') || itemId.includes('rod') || itemId.includes('focus') || itemId.includes('scepter') || itemId.includes('dagger')) return 'weapon';
  if (itemId.includes('legging') || itemId.includes('greave') || itemId.includes('legplate') || itemId.includes('pants') || itemId.includes('slacks') || itemId.includes('legwrap') || itemId.includes('legguard') || itemId.includes('legs')) return 'pants';
  if (itemId.includes('boot') || itemId.includes('sandal') || itemId.includes('sabaton') || itemId.includes('tread') || itemId.includes('shoe') || itemId.includes('stride') || itemId.includes('walker') || itemId.includes('step')) return 'boots';
  if (itemId.includes('band') || itemId.includes('ring') || itemId.includes('pendant') || itemId.includes('signet') || itemId.includes('charm')) return 'ring';
  if (itemId.includes('pack') || itemId.includes('cloak') || itemId.includes('cape')) return 'accessory';
  return 'armor'; // default for equipment
}

// ── Main draw function ──
export function drawItemIcon(ctx, itemId, size) {
  const s = size;
  ctx.clearRect(0, 0, s, s);
  
  const override = ITEM_OVERRIDES[itemId];
  const type = resolveType(itemId, override);
  const theme = getTheme(itemId);
  
  // Apply override colors to theme if present
  const t = override ? { ...theme, ...override } : theme;
  
  switch (type) {
    case 'weapon': drawWeaponIcon(ctx, s, t); break;
    case 'armor': drawArmor(ctx, s, t); break;
    case 'pants': drawPants(ctx, s, t); break;
    case 'boots': drawBoots(ctx, s, t); break;
    case 'shield': drawShieldAuto(ctx, s, t, override); break;
    case 'ring': drawRing(ctx, s, t); break;
    case 'accessory': drawAccessory(ctx, s, t); break;
    case 'consumable': drawConsumableAuto(ctx, s, t); break;
    case 'material': drawMaterialAuto(ctx, s, t); break;
    default: drawFallback(ctx, s);
  }
}

// ── Weapon drawing (kept from old system) ──
function drawWeaponIcon(ctx, s, v) {
  const cx = s/2, cy = s/2;
  if (v.style === 'staff' || v.style === 'scepter') {
    ctx.fillStyle = v.handle || '#5D4037';
    ctx.fillRect(cx - s*0.04, cy - s*0.3, s*0.08, s*0.6);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(cx - s*0.06, cy + s*0.15, s*0.12, s*0.08);
    ctx.beginPath();
    ctx.arc(cx, cy - s*0.3, s*0.1, 0, Math.PI * 2);
    ctx.fillStyle = v.crystal || v.blade;
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(cx - s*0.03, cy - s*0.33, s*0.04, 0, Math.PI * 2);
    ctx.fill();
    if (v.glow || v.rays) {
      ctx.fillStyle = v.glow || 'rgba(255,235,59,0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy - s*0.3, s*0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  ctx.save();
  ctx.translate(cx, cy);
  const angle = v.style === 'curved' ? 0.2 : v.style === 'dagger' ? -0.15 : -0.3;
  ctx.rotate(angle);
  // Blade
  const bw = s*0.07, bl = s*0.4;
  ctx.fillStyle = v.blade || '#BDBDBD';
  ctx.beginPath();
  ctx.moveTo(-bw/2, bl/2); ctx.lineTo(bw/2, bl/2);
  ctx.lineTo(bw/4, -bl/2); ctx.lineTo(-bw/4, -bl/2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = v.tint || '#D5D5D5';
  ctx.beginPath();
  ctx.moveTo(-bw/2, bl/2); ctx.lineTo(-bw/4, -bl/2);
  ctx.lineTo(-bw/6, -bl/2); ctx.lineTo(-bw/3, bl/2);
  ctx.closePath(); ctx.fill();
  // Handle
  ctx.fillStyle = v.handle || '#5D4037';
  ctx.fillRect(-s*0.025, s*0.08, s*0.05, s*0.22);
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.arc(0, s*0.32, s*0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (v.glow) {
    ctx.fillStyle = v.glow + '33';
    ctx.beginPath();
    ctx.arc(cx, cy, s*0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Auto-draw shield (from override) ──
function drawShieldAuto(ctx, s, t, override) {
  if (override?.style === 'hex') {
    const cx = s/2, cy = s/2;
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = override.body;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI/3)*i - Math.PI/6;
      const r = s*0.3;
      if (i===0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
      else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = override.bodyHi || '#B0BEC5';
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = override.emblem || '#FFD54F';
    ctx.beginPath(); ctx.arc(0, 0, s*0.06, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  } else {
    drawShield(ctx, s, t);
  }
}

// ── Auto-draw consumable ──
function drawConsumableAuto(ctx, s, t) {
  const cx = s/2, cy = s/2;
  ctx.save(); ctx.translate(cx, cy);
  if (t.style === 'bowl' || t.style === 'stew') {
    ctx.fillStyle = t.body || '#8D6E63';
    ctx.beginPath(); ctx.ellipse(0, s*0.05, s*0.25, s*0.15, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = t.bodyHi || '#FFCC80';
    ctx.beginPath(); ctx.ellipse(0, s*0.02, s*0.22, s*0.1, 0, 0, Math.PI); ctx.fill();
    ctx.restore(); return;
  }
  const bw = t.style === 'teardrop' ? s*0.08 : s*0.1;
  const bh = t.style === 'teardrop' ? s*0.22 : s*0.2;
  const by = s*0.05;
  ctx.fillStyle = t.potion || '#90CAF9';
  if (t.style === 'teardrop') {
    ctx.beginPath();
    ctx.moveTo(0, -bh+by); ctx.quadraticCurveTo(bw*1.5, -bh*0.3+by, bw, by);
    ctx.quadraticCurveTo(bw, s*0.15+by, 0, s*0.15+by);
    ctx.quadraticCurveTo(-bw, s*0.15+by, -bw, by);
    ctx.quadraticCurveTo(-bw*1.5, -bh*0.3+by, 0, -bh+by);
    ctx.fill();
  } else {
    ctx.fillRect(-bw, by, bw*2, bh);
    ctx.fillRect(-bw*0.4, by-s*0.08, bw*0.8, s*0.08);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(-bw*0.35, by-s*0.12, bw*0.7, s*0.04);
  }
  ctx.fillStyle = t.liquid || '#EF5350';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(-bw*0.8, by+s*0.06, bw*1.6, bh*0.7);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(-bw*0.6, by+s*0.02, bw*0.3, bh*0.5);
  ctx.restore();
}

// ── Auto-draw material ──
function drawMaterialAuto(ctx, s, t) {
  const cx = s/2, cy = s/2;
  ctx.save(); ctx.translate(cx, cy);
  switch (t.style) {
    case 'thorn':
      ctx.fillStyle = t.body;
      ctx.beginPath();
      ctx.moveTo(0,-s*0.3); ctx.lineTo(s*0.15,s*0.1); ctx.lineTo(s*0.05,s*0.3);
      ctx.lineTo(-s*0.05,s*0.3); ctx.lineTo(-s*0.15,s*0.1);
      ctx.closePath(); ctx.fill(); break;
    case 'pouch':
      ctx.fillStyle = t.body;
      ctx.beginPath(); ctx.ellipse(0,s*0.05,s*0.2,s*0.18,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = t.body; ctx.fillRect(-s*0.04,-s*0.13,s*0.08,s*0.06); break;
    case 'organ':
      ctx.fillStyle = t.body;
      ctx.beginPath(); ctx.ellipse(-s*0.05,0,s*0.12,s*0.2,-0.2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = t.bodyHi||t.body;
      ctx.beginPath(); ctx.ellipse(s*0.05,s*0.05,s*0.1,s*0.15,0.2,0,Math.PI*2); ctx.fill(); break;
    case 'crystal':
      ctx.fillStyle = t.body;
      ctx.beginPath();
      ctx.moveTo(0,-s*0.3); ctx.lineTo(s*0.15,-s*0.05); ctx.lineTo(s*0.1,s*0.25);
      ctx.lineTo(-s*0.1,s*0.25); ctx.lineTo(-s*0.15,-s*0.05);
      ctx.closePath(); ctx.fill(); break;
    case 'stone':
      ctx.fillStyle = t.body;
      ctx.beginPath();
      ctx.moveTo(-s*0.2,-s*0.15); ctx.lineTo(s*0.1,-s*0.2); ctx.lineTo(s*0.25,0);
      ctx.lineTo(s*0.15,s*0.2); ctx.lineTo(-s*0.1,s*0.18);
      ctx.closePath(); ctx.fill(); break;
    case 'tusk':
      ctx.fillStyle = t.body;
      ctx.beginPath();
      ctx.moveTo(-s*0.02,-s*0.3); ctx.quadraticCurveTo(s*0.25,-s*0.1,s*0.15,s*0.25);
      ctx.quadraticCurveTo(s*0.05,s*0.3,-s*0.02,s*0.25);
      ctx.quadraticCurveTo(-s*0.1,0,-s*0.02,-s*0.3);
      ctx.fill(); break;
    case 'core':
      ctx.fillStyle = '#3E2723';
      for (let i=0;i<5;i++) { ctx.save(); ctx.rotate((Math.PI*2/5)*i); ctx.fillRect(-1,-s*0.05,2,s*0.25); ctx.restore(); }
      ctx.fillStyle = t.body;
      ctx.beginPath(); ctx.arc(0,0,s*0.1,0,Math.PI*2); ctx.fill(); break;
    default:
      ctx.fillStyle = t.primary;
      ctx.beginPath(); ctx.arc(0,0,s*0.2,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
  if (t.sparkle) {
    ctx.fillStyle = t.sparkle;
    for (let i=0;i<3;i++) {
      ctx.beginPath(); ctx.arc((Math.random()-0.5)*s*0.4,(Math.random()-0.5)*s*0.4,s*0.015,0,Math.PI*2); ctx.fill();
    }
  }
}

function drawFallback(ctx, s) {
  ctx.fillStyle = '#424242'; ctx.fillRect(0,0,s,s);
  ctx.fillStyle = '#9E9E9E'; ctx.font = `bold ${s*0.4}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('?', s/2, s/2);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function getItemVisual(itemId) {
  return ITEM_OVERRIDES[itemId] || null;
}

export function generateIconDataURL(itemId, size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  drawItemIcon(canvas.getContext('2d'), itemId, size);
  return canvas.toDataURL('image/png');
}
