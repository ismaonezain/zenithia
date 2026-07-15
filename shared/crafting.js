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

  // ═══════════════════════════════════════
  // TIER 4 RECIPES — Lv.20
  // ═══════════════════════════════════════
  {
    id: 'craft_titan_breaker',
    name: 'Titan Breaker',
    description: 'Palu raksasa dari inti magma dan skala salamander. ATK+22, DEF+8.',
    category: 'weapon',
    ingredients: [
      { itemId: 'magma_core', qty: 3 },
      { itemId: 'salamander_scale', qty: 2 },
    ],
    result: { itemId: 'titan_breaker', qty: 1 },
  },
  {
    id: 'craft_void_blade',
    name: 'Void Blade',
    description: 'Pedang dari kristal murni dan debu permata. ATK+20, SPD+5.',
    category: 'weapon',
    ingredients: [
      { itemId: 'crystal_shard', qty: 3 },
      { itemId: 'gem_dust', qty: 2 },
    ],
    result: { itemId: 'void_blade', qty: 1 },
  },
  {
    id: 'craft_ancient_staff',
    name: 'Ancient Staff',
    description: 'Tongkat kuno dari inti prism dan kristal. ATK+18, MP+40.',
    category: 'weapon',
    ingredients: [
      { itemId: 'prism_core', qty: 2 },
      { itemId: 'crystal_shard', qty: 2 },
    ],
    result: { itemId: 'ancient_staff', qty: 1 },
  },
  {
    id: 'craft_titan_plate',
    name: 'Titan Plate',
    description: 'Armor plate dari inti magma dan esensi lava. DEF+18, HP+60.',
    category: 'armor',
    ingredients: [
      { itemId: 'magma_core', qty: 4 },
      { itemId: 'lava_essence', qty: 3 },
    ],
    result: { itemId: 'titan_plate', qty: 1 },
  },
  {
    id: 'craft_void_weave',
    name: 'Void Weave',
    description: 'Armor tenun dari debu permata dan kristal. DEF+15, SPD+4.',
    category: 'armor',
    ingredients: [
      { itemId: 'gem_dust', qty: 3 },
      { itemId: 'crystal_shard', qty: 3 },
    ],
    result: { itemId: 'void_weave', qty: 1 },
  },
  {
    id: 'craft_titan_treads',
    name: 'Titan Treads',
    description: 'Sepatu berat dari skala salamander dan esensi lava. DEF+8, HP+30, SPD+3.',
    category: 'boots',
    ingredients: [
      { itemId: 'salamander_scale', qty: 2 },
      { itemId: 'lava_essence', qty: 2 },
    ],
    result: { itemId: 'titan_treads', qty: 1 },
  },

  // ═══════════════════════════════════════
  // TIER 5 RECIPES — Lv.35
  // ═══════════════════════════════════════
  {
    id: 'craft_chaos_breaker',
    name: 'Chaos Breaker',
    description: 'Palu penghancur dari esensi badai, bulu langit, dan inti magma. ATK+35, DEF+12.',
    category: 'weapon',
    ingredients: [
      { itemId: 'storm_essence', qty: 3 },
      { itemId: 'sky_feather', qty: 2 },
      { itemId: 'magma_core', qty: 2 },
    ],
    result: { itemId: 'chaos_breaker', qty: 1 },
  },
  {
    id: 'craft_eternity_blade',
    name: 'Eternity Blade',
    description: 'Pedang keabadian dari esensi badai dan kristal. ATK+32, SPD+8.',
    category: 'weapon',
    ingredients: [
      { itemId: 'storm_essence', qty: 4 },
      { itemId: 'crystal_shard', qty: 3 },
    ],
    result: { itemId: 'eternity_blade', qty: 1 },
  },
  {
    id: 'craft_cosmos_staff',
    name: 'Cosmos Staff',
    description: 'Tongkat kosmis dari bulu langit dan inti prism. ATK+28, MP+80.',
    category: 'weapon',
    ingredients: [
      { itemId: 'sky_feather', qty: 3 },
      { itemId: 'prism_core', qty: 3 },
    ],
    result: { itemId: 'cosmos_staff', qty: 1 },
  },
  {
    id: 'craft_chaos_mail',
    name: 'Chaos Mail',
    description: 'Armor kekacauan dari esensi badai dan bulu langit. DEF+28, HP+100.',
    category: 'armor',
    ingredients: [
      { itemId: 'storm_essence', qty: 5 },
      { itemId: 'sky_feather', qty: 3 },
    ],
    result: { itemId: 'chaos_mail', qty: 1 },
  },
  {
    id: 'craft_eternity_weave',
    name: 'Eternity Weave',
    description: 'Armor tenun keabadian dari bulu langit dan debu permata. DEF+24, SPD+6, HP+50.',
    category: 'armor',
    ingredients: [
      { itemId: 'sky_feather', qty: 4 },
      { itemId: 'gem_dust', qty: 3 },
    ],
    result: { itemId: 'eternity_weave', qty: 1 },
  },
  {
    id: 'craft_chaos_treads',
    name: 'Chaos Treads',
    description: 'Sepatu kekacauan dari esensi badai dan bulu langit. SPD+8, DEF+12, HP+40.',
    category: 'boots',
    ingredients: [
      { itemId: 'storm_essence', qty: 3 },
      { itemId: 'sky_feather', qty: 2 },
    ],
    result: { itemId: 'chaos_treads', qty: 1 },
  },

  // ═══════════════════════════════════════
  // TIER 6 RECIPES — Lv.50
  // ═══════════════════════════════════════
  {
    id: 'craft_worldsplitter',
    name: 'Worldsplitter',
    description: 'Senjata pembelah dunia dari esensi void, inti chaos, dan inti magma. ATK+50, DEF+18, HP+40.',
    category: 'weapon',
    ingredients: [
      { itemId: 'void_essence', qty: 4 },
      { itemId: 'chaos_core', qty: 2 },
      { itemId: 'magma_core', qty: 3 },
    ],
    result: { itemId: 'worldsplitter', qty: 1 },
  },
  {
    id: 'craft_infinity_edge',
    name: 'Infinity Edge',
    description: 'Pedang tanpa batas dari esensi void dan inti chaos. ATK+48, SPD+12, AGI+5.',
    category: 'weapon',
    ingredients: [
      { itemId: 'void_essence', qty: 5 },
      { itemId: 'chaos_core', qty: 3 },
    ],
    result: { itemId: 'infinity_edge', qty: 1 },
  },
  {
    id: 'craft_omniscient_staff',
    name: 'Omniscient Staff',
    description: 'Tongkat mahatahu dari debu bayangan, inti chaos, dan inti prism. ATK+42, MP+150, SPD+4.',
    category: 'weapon',
    ingredients: [
      { itemId: 'shadow_dust', qty: 4 },
      { itemId: 'chaos_core', qty: 2 },
      { itemId: 'prism_core', qty: 3 },
    ],
    result: { itemId: 'omniscient_staff', qty: 1 },
  },
  {
    id: 'craft_worldplate',
    name: 'Worldplate',
    description: 'Armor pelindung dunia dari esensi void, inti chaos, dan bulu langit. DEF+42, HP+200, SPD+3.',
    category: 'armor',
    ingredients: [
      { itemId: 'void_essence', qty: 6 },
      { itemId: 'chaos_core', qty: 3 },
      { itemId: 'sky_feather', qty: 3 },
    ],
    result: { itemId: 'worldplate', qty: 1 },
  },
  {
    id: 'craft_infinity_weave',
    name: 'Infinity Weave',
    description: 'Armor tenun keabadian absolut dari debu bayangan, inti chaos, dan kristal. DEF+38, SPD+10, HP+120.',
    category: 'armor',
    ingredients: [
      { itemId: 'shadow_dust', qty: 5 },
      { itemId: 'chaos_core', qty: 2 },
      { itemId: 'crystal_shard', qty: 3 },
    ],
    result: { itemId: 'infinity_weave', qty: 1 },
  },
  {
    id: 'craft_world_treads',
    name: 'World Treads',
    description: 'Sepatu penjelajah dunia dari esensi void dan debu bayangan. SPD+15, DEF+16, HP+60.',
    category: 'boots',
    ingredients: [
      { itemId: 'void_essence', qty: 3 },
      { itemId: 'shadow_dust', qty: 3 },
    ],
    result: { itemId: 'world_treads', qty: 1 },
  },
];

module.exports = { CRAFTING_RECIPES };
