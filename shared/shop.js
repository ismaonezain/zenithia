// Zenithia — Shop Inventories per NPC

const SHOPS = {
  sir_gendut: {
    name: "Sir Gendut's Supply",
    type: 'general',
    inventory: [
      // Consumables
      { itemId: 'potion_small',     stock: -1 },
      { itemId: 'potion_medium',    stock: -1 },
      { itemId: 'mp_potion_small',  stock: -1 },
      { itemId: 'antidote',         stock: -1 },
      // Weapons — Guardian
      { itemId: 'village_blade',    stock: -1 },
      { itemId: 'ironclad_edge',    stock: 3 },
      // Weapons — Blade Dancer
      { itemId: 'wind_cutter',      stock: -1 },
      { itemId: 'plains_slicer',    stock: 3 },
      // Weapons — Sage
      { itemId: 'willow_staff',     stock: -1 },
      { itemId: 'deepwood_rod',     stock: 3 },
      // Weapons — Cleric
      { itemId: 'pilgrim_staff',    stock: -1 },
      { itemId: 'shrine_scepter',   stock: 3 },
      // Weapons — Shadow
      { itemId: 'rusty_dagger',     stock: -1 },
      { itemId: 'nightfang',        stock: 3 },
      // Armor (tier 1 for each class)
      { itemId: 'guard_wrappings',  stock: -1 },
      { itemId: 'dancer_wrap',      stock: -1 },
      { itemId: 'sage_robe',        stock: -1 },
      { itemId: 'healer_wraps',     stock: -1 },
      { itemId: 'shadow_wraps',     stock: -1 },
      // Shields
      { itemId: 'wooden_buckler',   stock: -1 },
      { itemId: 'holy_buckler',     stock: 3 },
    ],
    buyMultiplier: 1.0,
    sellMultiplier: 0.4,
  },

  mrs_ningsih: {
    name: "Mrs. Ningsih's Kitchen",
    type: 'food',
    inventory: [
      { itemId: 'willow_rice',      stock: -1 },
      { itemId: 'chicken_stew',     stock: -1 },
      { itemId: 'potion_small',     stock: -1 },
      { itemId: 'herb_bundle',      stock: -1 },
      { itemId: 'smoked_fish',      stock: -1 },
      { itemId: 'honey_bread',      stock: -1 },
    ],
    buyMultiplier: 1.0,
    sellMultiplier: 0.35,
  },

  herbalist_sari: {
    name: "Herbalist Sari's Apothecary",
    type: 'herbal',
    inventory: [
      { itemId: 'potion_small',     stock: -1 },
      { itemId: 'potion_medium',    stock: -1 },
      { itemId: 'mp_potion_small',  stock: -1 },
      { itemId: 'antidote',         stock: -1 },
      { itemId: 'herb_bundle',      stock: -1 },
      { itemId: 'venom_extract',    stock: 10 },
      { itemId: 'healing_salve',    stock: -1 },
    ],
    buyMultiplier: 0.9,
    sellMultiplier: 0.5,
  },
};

if (typeof module !== 'undefined') {
  module.exports = { SHOPS };
}
