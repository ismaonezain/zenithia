// Zenithia — Shop Inventories per NPC

const SHOPS = {
  sir_gendut: {
    name: "Sir Gendut's Supply",
    type: 'general', // general goods
    inventory: [
      { itemId: 'potion_small',  stock: -1 },  // -1 = infinite
      { itemId: 'potion_medium', stock: -1 },
      { itemId: 'mp_potion_small', stock: -1 },
      { itemId: 'antidote',      stock: -1 },
    ],
    buyMultiplier: 1.0,  // buy at full price
    sellMultiplier: 0.4, // sell at 40%
  },

  mrs_ningsih: {
    name: "Mrs. Ningsih's Kitchen",
    type: 'food',
    inventory: [
      { itemId: 'willow_rice',  stock: -1 },
      { itemId: 'chicken_stew', stock: -1 },
    ],
    buyMultiplier: 1.0,
    sellMultiplier: 0.3,
  },

  herbalist_sari: {
    name: "Herbalist Sari's Apothecary",
    type: 'herbal',
    inventory: [
      { itemId: 'potion_small',   stock: -1 },
      { itemId: 'potion_medium',  stock: -1 },
      { itemId: 'mp_potion_small', stock: -1 },
      { itemId: 'antidote',       stock: -1 },
    ],
    buyMultiplier: 0.9,  // herbalist slightly cheaper
    sellMultiplier: 0.5,
  },
};

if (typeof module !== 'undefined') {
  module.exports = { SHOPS };
}
