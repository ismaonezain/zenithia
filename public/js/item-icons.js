// item-icons.js — Canvas-rendered inventory icons matching in-game equipment visuals
// Each item type draws its 2D version of the 3D model appearance

const ICON_COLORS = {
  weapon: {
    blade: '#BDBDBD', bladeHi: '#D5D5D5', bladeSh: '#9E9E9E',
    handle: '#5D4037', handleHi: '#795548', guard: '#8D6E63',
  },
  shield: {
    body: '#795548', bodyHi: '#8D6E63', bodySh: '#5D4037',
    rim: '#A1887F', emblem: '#FFD54F',
  },
  helmet: {
    body: '#78909C', bodyHi: '#90A4AE', bodySh: '#546E7A',
    visor: '#455A64', accent: '#B0BEC5',
  },
  armor: {
    body: '#607D8B', bodyHi: '#78909C', bodySh: '#455A64',
    belt: '#5D4037', accent: '#90A4AE',
  },
  pants: {
    body: '#5D4037', bodyHi: '#6D4C41', bodySh: '#4E342E',
    accent: '#795548',
  },
  boots: {
    body: '#4E342E', bodyHi: '#5D4037', bodySh: '#3E2723',
    sole: '#3E2723', accent: '#8D6E63',
  },
  ring: {
    band: '#FFD54F', bandHi: '#FFE082', bandSh: '#FFC107',
    gem: '#E53935', gemHi: '#EF5350',
  },
  accessory: {
    gem: '#7B1FA2', gemHi: '#9C27B0', gemSh: '#6A1B9A',
    chain: '#BDBDBD', glow: 'rgba(123,31,162,0.3)',
  },
  consumable: {
    potion: '#E53935', bottle: '#90CAF9', cork: '#8D6E63',
    liquid: '#EF5350', highlight: 'rgba(255,255,255,0.4)',
  },
  material: {
    body: '#78909C', bodyHi: '#B0BEC5', bodySh: '#546E7A',
    sparkle: '#FFD54F',
  },
};

// Per-item visual overrides (colors that distinguish items within a type)
const ITEM_VISUALS = {
  // Weapons
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
  
  // Shields
  moss_shell:      { type: 'shield', body: '#4CAF50', bodyHi: '#81C784', emblem: '#FFEB3B', style: 'round' },
  turtle_shell:    { type: 'shield', body: '#2E7D32', bodyHi: '#4CAF50', emblem: '#A5D6A7', style: 'hex' },
  
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
};

export function getItemVisual(itemId) {
  return ITEM_VISUALS[itemId] || null;
}

// Draw a 2D icon on a canvas context
export function drawItemIcon(ctx, itemId, size) {
  const vis = ITEM_VISUALS[itemId];
  if (!vis) {
    // Fallback: draw generic question mark
    drawFallback(ctx, size);
    return;
  }
  
  const s = size;
  const cx = s / 2, cy = s / 2;
  ctx.clearRect(0, 0, s, s);
  
  switch (vis.type) {
    case 'weapon': drawWeapon(ctx, s, vis); break;
    case 'shield': drawShield(ctx, s, vis); break;
    case 'consumable': drawConsumable(ctx, s, vis); break;
    case 'material': drawMaterial(ctx, s, vis); break;
    default: drawFallback(ctx, s);
  }
}

function drawWeapon(ctx, s, v) {
  const cx = s / 2, cy = s / 2;
  const C = ICON_COLORS.weapon;
  
  if (v.style === 'staff' || v.style === 'scepter') {
    // Staff/scepter — vertical rod with orb on top
    // Rod
    ctx.fillStyle = v.handle || C.handle;
    ctx.fillRect(cx - s*0.04, cy - s*0.3, s*0.08, s*0.6);
    // Handle grip
    ctx.fillStyle = C.guard;
    ctx.fillRect(cx - s*0.06, cy + s*0.15, s*0.12, s*0.08);
    // Crystal/orb on top
    ctx.beginPath();
    ctx.arc(cx, cy - s*0.3, s*0.1, 0, Math.PI * 2);
    ctx.fillStyle = v.crystal || v.blade;
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(cx - s*0.03, cy - s*0.33, s*0.04, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    if (v.glow || v.rays) {
      ctx.fillStyle = v.glow || 'rgba(255,235,59,0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy - s*0.3, s*0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    if (v.runes) {
      ctx.fillStyle = 'rgba(206,147,216,0.4)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx + (Math.random()-0.5)*s*0.12, cy - s*0.15 + i*s*0.1, s*0.015, 0, Math.PI*2);
        ctx.fill();
      }
    }
    return;
  }
  
  // Blade types
  const bladeAngle = v.style === 'curved' ? 0.2 : v.style === 'dagger' ? -0.15 : -0.3;
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(bladeAngle);
  
  if (v.style === 'twin') {
    // Twin daggers
    for (let side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.translate(side * s * 0.12, 0);
      ctx.rotate(side * 0.2);
      drawBlade(ctx, s * 0.35, s * 0.06, v, C);
      ctx.restore();
    }
  } else if (v.style === 'cleaver') {
    // Wide cleaver blade
    ctx.fillStyle = v.blade;
    ctx.beginPath();
    ctx.moveTo(-s*0.02, -s*0.32);
    ctx.lineTo(s*0.12, -s*0.28);
    ctx.lineTo(s*0.14, s*0.05);
    ctx.lineTo(-s*0.02, s*0.05);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.bladeHi;
    ctx.fillRect(-s*0.01, -s*0.3, s*0.04, s*0.3);
    // Guard
    ctx.fillStyle = v.guard || C.guard;
    ctx.fillRect(-s*0.08, s*0.04, s*0.18, s*0.04);
  } else {
    // Standard blade
    drawBlade(ctx, s * 0.4, s * 0.07, v, C);
  }
  
  // Handle
  ctx.fillStyle = v.handle || C.handle;
  ctx.fillRect(-s*0.025, s*0.08, s*0.05, s*0.22);
  // Pommel
  ctx.fillStyle = C.guard;
  ctx.beginPath();
  ctx.arc(0, s*0.32, s*0.03, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  
  // Glow effects
  if (v.glow) {
    ctx.fillStyle = v.glow + '33';
    ctx.beginPath();
    ctx.arc(cx, cy, s*0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  if (v.lightning) {
    ctx.strokeStyle = '#CE93D8';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const sx = cx - s*0.15 + Math.random()*s*0.3;
      const sy = cy - s*0.2;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random()-0.5)*s*0.15, sy + s*0.15);
      ctx.stroke();
    }
  }
  if (v.crack) {
    ctx.strokeStyle = '#26A69A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - s*0.02, cy - s*0.15);
    ctx.lineTo(cx + s*0.05, cy - s*0.05);
    ctx.lineTo(cx - s*0.03, cy + s*0.05);
    ctx.stroke();
  }
  if (v.spark) {
    ctx.fillStyle = '#00E5FF';
    for (let i = 0; i < 4; i++) {
      const sx = cx + (Math.random()-0.5)*s*0.3;
      const sy = cy + (Math.random()-0.5)*s*0.4;
      ctx.beginPath();
      ctx.arc(sx, sy, s*0.012, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

function drawBlade(ctx, len, width, v, C) {
  // Blade body
  ctx.fillStyle = v.blade || C.blade;
  ctx.beginPath();
  ctx.moveTo(-width/2, len/2);
  ctx.lineTo(width/2, len/2);
  ctx.lineTo(width/4, -len/2);
  ctx.lineTo(-width/4, -len/2);
  ctx.closePath();
  ctx.fill();
  // Highlight edge
  ctx.fillStyle = v.tint || C.bladeHi;
  ctx.beginPath();
  ctx.moveTo(-width/2, len/2);
  ctx.lineTo(-width/4, -len/2);
  ctx.lineTo(-width/6, -len/2);
  ctx.lineTo(-width/3, len/2);
  ctx.closePath();
  ctx.fill();
  // Notch
  if (v.notched) {
    ctx.fillStyle = v.blade || C.bladeSh;
    ctx.fillRect(width/4 - 1, -len*0.1, 3, 4);
  }
}

function drawShield(ctx, s, v) {
  const cx = s/2, cy = s/2;
  const C = ICON_COLORS.shield;
  
  ctx.save();
  ctx.translate(cx, cy);
  
  if (v.style === 'hex') {
    // Hexagonal turtle shell
    ctx.fillStyle = v.body;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const r = s * 0.3;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    // Hex pattern
    ctx.strokeStyle = v.bodyHi || C.bodyHi;
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * s * 0.28, Math.sin(a) * s * 0.28);
      ctx.stroke();
    }
  } else {
    // Round shield
    ctx.fillStyle = v.body;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Rim
    ctx.strokeStyle = v.bodyHi || C.rim;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Emblem
    ctx.fillStyle = v.emblem || C.emblem;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function drawConsumable(ctx, s, v) {
  const cx = s/2, cy = s/2;
  const C = ICON_COLORS.consumable;
  
  ctx.save();
  ctx.translate(cx, cy);
  
  if (v.style === 'bowl' || v.style === 'stew') {
    // Bowl
    ctx.fillStyle = v.body || '#8D6E63';
    ctx.beginPath();
    ctx.ellipse(0, s*0.05, s*0.25, s*0.15, 0, 0, Math.PI);
    ctx.fill();
    // Liquid
    ctx.fillStyle = v.bodyHi || '#FFCC80';
    ctx.beginPath();
    ctx.ellipse(0, s*0.02, s*0.22, s*0.1, 0, 0, Math.PI);
    ctx.fill();
    // Steam
    if (v.style === 'stew') {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const sx = -s*0.1 + i*s*0.1;
        ctx.moveTo(sx, -s*0.05);
        ctx.quadraticCurveTo(sx + s*0.03, -s*0.15, sx - s*0.02, -s*0.25);
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }
  
  // Bottle/flask/vial/teardrop
  const bottleW = v.style === 'teardrop' ? s*0.08 : s*0.1;
  const bottleH = v.style === 'teardrop' ? s*0.22 : s*0.2;
  const bodyY = s*0.05;
  
  // Bottle body
  ctx.fillStyle = v.potion || C.bottle;
  if (v.style === 'teardrop') {
    ctx.beginPath();
    ctx.moveTo(0, -bottleH + bodyY);
    ctx.quadraticCurveTo(bottleW*1.5, -bottleH*0.3 + bodyY, bottleW, bodyY);
    ctx.quadraticCurveTo(bottleW, s*0.15 + bodyY, 0, s*0.15 + bodyY);
    ctx.quadraticCurveTo(-bottleW, s*0.15 + bodyY, -bottleW, bodyY);
    ctx.quadraticCurveTo(-bottleW*1.5, -bottleH*0.3 + bodyY, 0, -bottleH + bodyY);
    ctx.fill();
  } else {
    // Standard bottle
    ctx.fillRect(-bottleW, bodyY, bottleW*2, bottleH);
    // Neck
    ctx.fillRect(-bottleW*0.4, bodyY - s*0.08, bottleW*0.8, s*0.08);
    // Cork
    ctx.fillStyle = C.cork;
    ctx.fillRect(-bottleW*0.35, bodyY - s*0.12, bottleW*0.7, s*0.04);
  }
  
  // Liquid fill
  ctx.fillStyle = v.liquid || C.liquid;
  ctx.globalAlpha = 0.7;
  if (v.style === 'teardrop') {
    ctx.beginPath();
    ctx.ellipse(0, bodyY + s*0.06, bottleW*0.7, s*0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-bottleW*0.8, bodyY + s*0.06, bottleW*1.6, bottleH * 0.7);
  }
  ctx.globalAlpha = 1;
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(-bottleW*0.6, bodyY + s*0.02, bottleW*0.3, bottleH*0.5);
  
  ctx.restore();
}

function drawMaterial(ctx, s, v) {
  const cx = s/2, cy = s/2;
  const C = ICON_COLORS.material;
  
  ctx.save();
  ctx.translate(cx, cy);
  
  switch (v.style) {
    case 'thorn':
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.moveTo(0, -s*0.3);
      ctx.lineTo(s*0.15, s*0.1);
      ctx.lineTo(s*0.05, s*0.3);
      ctx.lineTo(-s*0.05, s*0.3);
      ctx.lineTo(-s*0.15, s*0.1);
      ctx.closePath();
      ctx.fill();
      break;
    case 'pouch':
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.ellipse(0, s*0.05, s*0.2, s*0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = C.bodySh;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Tie
      ctx.fillStyle = v.body;
      ctx.fillRect(-s*0.04, -s*0.13, s*0.08, s*0.06);
      break;
    case 'organ':
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.ellipse(-s*0.05, 0, s*0.12, s*0.2, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = v.bodyHi || v.body;
      ctx.beginPath();
      ctx.ellipse(s*0.05, s*0.05, s*0.1, s*0.15, 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'crystal':
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.moveTo(0, -s*0.3);
      ctx.lineTo(s*0.15, -s*0.05);
      ctx.lineTo(s*0.1, s*0.25);
      ctx.lineTo(-s*0.1, s*0.25);
      ctx.lineTo(-s*0.15, -s*0.05);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = v.bodyHi || C.bodyHi;
      ctx.beginPath();
      ctx.moveTo(0, -s*0.3);
      ctx.lineTo(-s*0.15, -s*0.05);
      ctx.lineTo(-s*0.05, -s*0.05);
      ctx.closePath();
      ctx.fill();
      break;
    case 'stone':
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.moveTo(-s*0.2, -s*0.15);
      ctx.lineTo(s*0.1, -s*0.2);
      ctx.lineTo(s*0.25, 0);
      ctx.lineTo(s*0.15, s*0.2);
      ctx.lineTo(-s*0.1, s*0.18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = v.bodyHi;
      ctx.fillRect(-s*0.05, -s*0.1, s*0.1, s*0.1);
      break;
    case 'tusk':
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.moveTo(-s*0.02, -s*0.3);
      ctx.quadraticCurveTo(s*0.25, -s*0.1, s*0.15, s*0.25);
      ctx.quadraticCurveTo(s*0.05, s*0.3, -s*0.02, s*0.25);
      ctx.quadraticCurveTo(-s*0.1, 0, -s*0.02, -s*0.3);
      ctx.fill();
      ctx.fillStyle = v.bodyHi;
      ctx.beginPath();
      ctx.moveTo(-s*0.01, -s*0.28);
      ctx.quadraticCurveTo(s*0.15, -s*0.1, s*0.08, s*0.1);
      ctx.quadraticCurveTo(s*0.05, 0, -s*0.01, -s*0.28);
      ctx.fill();
      break;
    case 'core':
      // Glowing crystal in thorns
      ctx.fillStyle = '#3E2723';
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI*2/5)*i;
        ctx.save();
        ctx.rotate(a);
        ctx.fillRect(-1, -s*0.05, 2, s*0.25);
        ctx.restore();
      }
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.arc(0, 0, s*0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = v.bodyHi;
      ctx.beginPath();
      ctx.arc(-s*0.02, -s*0.02, s*0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  
  // Sparkle
  if (v.sparkle) {
    ctx.fillStyle = v.sparkle;
    for (let i = 0; i < 3; i++) {
      const sx = (Math.random()-0.5)*s*0.4;
      const sy = (Math.random()-0.5)*s*0.4;
      ctx.beginPath();
      ctx.arc(sx, sy, s*0.015, 0, Math.PI*2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

function drawFallback(ctx, s) {
  ctx.fillStyle = '#424242';
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#9E9E9E';
  ctx.font = `bold ${s*0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', s/2, s/2);
}

// Generate a data URL for an item icon (for <img> src)
export function generateIconDataURL(itemId, size = 64) {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    drawItemIcon(ctx, itemId, size);
    return canvas.convertToBlob ? null : null; // Can't easily get URL from Offscreen
  }
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawItemIcon(ctx, itemId, size);
  return canvas.toDataURL('image/png');
}
