// Zenithia — Crafting Recipes
// Format: { id, name, description, ingredients: [{itemId, qty}], result: {itemId, qty}, category }

const CRAFTING_RECIPES = [
  // ═══════════════════════════════════════
  // CONSUMABLES (bahan mentah → item siap pakai)
  // ═══════════════════════════════════════
  {
    id: 'craft_healing_salve',
    name: 'Healing Salve',
    description: 'Salep penyembuh dari campuran duri dan lumut.',
    category: 'consumable',
    ingredients: [
      { itemId: 'thorn', qty: 2 },
      { itemId: 'moss_shell', qty: 1 },
    ],
    result: { itemId: 'healing_salve', qty: 1 },
  },
  {
    id: 'craft_venom_extract',
    name: 'Venom Extract',
    description: 'Ekstrak racun yang meningkatkan serangan.',
    category: 'consumable',
    ingredients: [
      { itemId: 'thorn', qty: 2 },
      { itemId: 'dust_pouch', qty: 1 },
    ],
    result: { itemId: 'venom_extract', qty: 1 },
  },
  {
    id: 'craft_honey_bread',
    name: 'Honey Bread',
    description: 'Roti madu dari kaki katak dan debu aether.',
    category: 'consumable',
    ingredients: [
      { itemId: 'frog_leg', qty: 1 },
      { itemId: 'dust_pouch', qty: 2 },
    ],
    result: { itemId: 'honey_bread', qty: 1 },
  },
  {
    id: 'craft_smoked_fish',
    name: 'Smoked Fish',
    description: 'Ikan asap yang memulihkan HP dan meningkatkan serangan.',
    category: 'consumable',
    ingredients: [
      { itemId: 'frog_leg', qty: 2 },
      { itemId: 'thorn', qty: 1 },
    ],
    result: { itemId: 'smoked_fish', qty: 1 },
  },
  {
    id: 'craft_chicken_stew',
    name: 'Chicken Stew',
    description: 'Sup ayam hangat yang memulihkan HP dan meningkatkan pertahanan.',
    category: 'consumable',
    ingredients: [
      { itemId: 'frog_leg', qty: 1 },
      { itemId: 'moss_shell', qty: 1 },
      { itemId: 'stone_fragment', qty: 1 },
    ],
    result: { itemId: 'chicken_stew', qty: 1 },
  },

  // ═══════════════════════════════════════
  // WEAPONS (material → weapon baru)
  // ═══════════════════════════════════════
  {
    id: 'craft_village_blade',
    name: 'Oath of the Valley',
    description: 'Pedang sederhana dari duri dan batu. ATK+3.',
    category: 'weapon',
    ingredients: [
      { itemId: 'thorn', qty: 3 },
      { itemId: 'stone_fragment', qty: 2 },
    ],
    result: { itemId: 'village_blade', qty: 1 },
  },
  {
    id: 'craft_wind_cutter',
    name: 'Whisper of the Plains',
    description: 'Pedang angin dari esensi angin dan duri. ATK+4, SPD+2.',
    category: 'weapon',
    ingredients: [
      { itemId: 'wind_essence', qty: 2 },
      { itemId: 'thorn', qty: 2 },
    ],
    result: { itemId: 'wind_cutter', qty: 1 },
  },
  {
    id: 'craft_ironclad_edge',
    name: 'Sundered Edge',
    description: 'Pedang berat dari batu dan taring babi. ATK+6, DEF+2.',
    category: 'weapon',
    ingredients: [
      { itemId: 'stone_fragment', qty: 3 },
      { itemId: 'boar_tusk', qty: 2 },
    ],
    result: { itemId: 'ironclad_edge', qty: 1 },
  },
  {
    id: 'craft_guardian_cleaver',
    name: 'Aegis Breaker',
    description: 'Kapak besar dari inti bramble. ATK+10, DEF+4, HP+20.',
    category: 'weapon',
    ingredients: [
      { itemId: 'bramble_core', qty: 3 },
      { itemId: 'boar_tusk', qty: 2 },
      { itemId: 'stone_fragment', qty: 2 },
    ],
    result: { itemId: 'guardian_cleaver', qty: 1 },
  },

  // ═══════════════════════════════════════
  // ARMOR (material → armor)
  // ═══════════════════════════════════════
  {
    id: 'craft_guard_wrappings',
    name: 'Wrappings of the First Oath',
    description: 'Balutan pelindung dari cangkang lumut. DEF+3.',
    category: 'armor',
    ingredients: [
      { itemId: 'moss_shell', qty: 4 },
      { itemId: 'stone_fragment', qty: 2 },
    ],
    result: { itemId: 'guard_wrappings', qty: 1 },
  },
  {
    id: 'craft_moss_plate',
    name: 'Plates of the Emerald Guardian',
    description: 'Plat armor dari cangkang lumut yang diperkuat. DEF+5, HP+15.',
    category: 'armor',
    ingredients: [
      { itemId: 'moss_shell', qty: 4 },
      { itemId: 'stone_fragment', qty: 3 },
      { itemId: 'bramble_core', qty: 1 },
    ],
    result: { itemId: 'moss_plate', qty: 1 },
  },

  // ═══════════════════════════════════════
  // BOOTS (material → boots)
  // ═══════════════════════════════════════
  {
    id: 'craft_straw_sandals',
    name: 'Straw Sandals',
    description: 'Sandal jerami ringan. SPD+1.',
    category: 'boots',
    ingredients: [
      { itemId: 'dust_pouch', qty: 3 },
      { itemId: 'thorn', qty: 1 },
    ],
    result: { itemId: 'straw_sandals', qty: 1 },
  },
  {
    id: 'craft_leather_boots',
    name: 'Leather Boots',
    description: 'Sepatu kulit yang kokoh. SPD+2, DEF+1.',
    category: 'boots',
    ingredients: [
      { itemId: 'boar_tusk', qty: 2 },
      { itemId: 'moss_shell', qty: 2 },
    ],
    result: { itemId: 'leather_boots', qty: 1 },
  },

  // ═══════════════════════════════════════
  // SHIELDS (material → shield)
  // ═══════════════════════════════════════
  {
    id: 'craft_wooden_buckler',
    name: 'Buckler of the Valley Guard',
    description: 'Perisai kayu yang diperkuat batu. DEF+2, HP+10.',
    category: 'shield',
    ingredients: [
      { itemId: 'stone_fragment', qty: 3 },
      { itemId: 'moss_shell', qty: 2 },
    ],
    result: { itemId: 'wooden_buckler', qty: 1 },
  },

  // ═══════════════════════════════════════
  // STORMCREST RECIPES — Lv.5-8
  // ═══════════════════════════════════════
  {
    id: 'craft_storm_wings',
    name: 'Storm Wings',
    description: 'Sepatu bersayap dari bulu hawk. SPD+4, AGI+2.',
    category: 'boots',
    ingredients: [
      { itemId: 'hawk_feather', qty: 3 },
      { itemId: 'wind_essence', qty: 2 },
    ],
    result: { itemId: 'iron_sabatons', qty: 1 },
  },
  {
    id: 'craft_golem_fist',
    name: 'Golem Fist',
    description: 'Palu dari inti golem. ATK+8, DEF+3, slow tapi powerful.',
    category: 'weapon',
    ingredients: [
      { itemId: 'golem_core', qty: 2 },
      { itemId: 'stone_fragment', qty: 4 },
    ],
    result: { itemId: 'guardian_cleaver', qty: 1 },
  },
  {
    id: 'craft_mountain_plate',
    name: 'Mountain Plate',
    description: 'Armor dari inti golem dan bulu hawk. DEF+7, HP+25.',
    category: 'armor',
    ingredients: [
      { itemId: 'golem_core', qty: 2 },
      { itemId: 'hawk_feather', qty: 2 },
      { itemId: 'stone_fragment', qty: 3 },
    ],
    result: { itemId: 'bramble_mail', qty: 1 },
  },

  // ═══════════════════════════════════════
  // MISTMARSH RECIPES — Lv.8-10
  // ═══════════════════════════════════════
  {
    id: 'craft_venom_fang',
    name: 'Venom Fang',
    description: 'Pedang beracun dari taring lurker. ATK+9, bisa apply DoT.',
    category: 'weapon',
    ingredients: [
      { itemId: 'lurker_fang', qty: 3 },
      { itemId: 'toxic_slime', qty: 2 },
    ],
    result: { itemId: 'void_edge', qty: 1 },
  },
  {
    id: 'craft_swamp_shield',
    name: 'Swamp Shield',
    description: 'Perisai dari cangkang kura-kura raksasa. DEF+6, HP+30.',
    category: 'shield',
    ingredients: [
      { itemId: 'turtle_shell', qty: 3 },
      { itemId: 'lurker_fang', qty: 2 },
    ],
    result: { itemId: 'guardian_aegis', qty: 1 },
  },
  {
    id: 'craft_toxic_brew',
    name: 'Toxic Brew',
    description: 'Minuman beracun yang meningkatkan ATK+5 dan SPD+3 selama 30 detik.',
    category: 'consumable',
    ingredients: [
      { itemId: 'toxic_slime', qty: 2 },
      { itemId: 'hawk_feather', qty: 1 },
      { itemId: 'wind_essence', qty: 1 },
    ],
    result: { itemId: 'potion_large', qty: 2 },
  },
];

module.exports = { CRAFTING_RECIPES };
