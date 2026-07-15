#!/usr/bin/env node
// generate-items-client.js
// Reads shared/items.js → writes public/js/items_client.js
// Run: node scripts/generate-items-client.js

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'shared', 'items.js');
const DST = path.join(__dirname, '..', 'public', 'js', 'items_client.js');

// Import ITEMS from shared (CommonJS)
const { ITEMS } = require(SRC);

let out = '// Zenithia — Client-side item prices\n';
out += '// AUTO-GENERATED from shared/items.js — DO NOT EDIT\n';
out += '// Run: node scripts/generate-items-client.js\n\n';
out += 'export const ITEM_PRICES = {\n';

const sorted = Object.entries(ITEMS)
  .filter(([_, def]) => def && def.price)
  .sort(([a], [b]) => a.localeCompare(b));

for (const [id, def] of sorted) {
  out += `  ${id}: ${def.price},\n`;
}

out += '};\n';

fs.writeFileSync(DST, out, 'utf8');
console.log(`✅ Generated items_client.js — ${sorted.length} items synced`);
