// Zenithia — Item Data
// 1 name = 1 item (patent). Weapon/Armor/Shield/Pants/Boots = per job per tier. Ring/Accessory = universal.

const ITEMS = {
  // ═══════════════════════════════════════
  // CONSUMABLES
  // ═══════════════════════════════════════
  potion_small:      { name: 'Herb Potion',     type: 'consumable', description: 'Ramuan herbal sederhana dari Willowmere. Memulihkan 30 HP.',  healAmount: 30,  price: 50,  icon: { bg: 0xF44336, fg: 0xFFFFFF, symbol: '+', image: '/assets/icons/potion_small.png' } },
  potion_medium:     { name: 'Healing Tonic',    type: 'consumable', description: 'Tonik penyembuh dari resep Herbalist Sari. Memulihkan 80 HP.',  healAmount: 80,  price: 200, icon: { bg: 0xE53935, fg: 0xFFFFFF, symbol: '++', image: '/assets/icons/potion_medium.png' } },
  mp_potion_small:   { name: 'Aether Dew',       type: 'consumable', description: 'Embun yang mengandung sedikit Aether. Memulihkan 20 MP.',  manaAmount: 20,  price: 60,  icon: { bg: 0x2196F3, fg: 0xFFFFFF, symbol: '+', image: '/assets/icons/mp_potion_small.png' } },
  antidote:          { name: 'Antidote',         type: 'consumable', description: 'Obat racun dari campuran herbal. Menawarkan racun.',    curePoison: true, price: 40, icon: { bg: 0x4CAF50, fg: 0xFFFFFF, symbol: '!', image: '/assets/icons/antidote.png' } },
  willow_rice:       { name: 'Willowmere Rice',  type: 'consumable', description: 'Nasi goreng khas Willowmere. HP+25, ATK+5% selama 60 detik.', healAmount: 25, buff: { stat: 'atk', value: 0.05, duration: 60 }, price: 30, icon: { bg: 0xFF9800, fg: 0xFFF9C4, symbol: '~', image: '/assets/icons/willow_rice.png' } },
  chicken_stew:      { name: 'Chicken Stew',     type: 'consumable', description: 'Sup ayam hangat buatan Mrs Ningsih. HP+40, DEF+5% selama 60 detik.', healAmount: 40, buff: { stat: 'def', value: 0.05, duration: 60 }, price: 50, icon: { bg: 0xFFC107, fg: 0xFFFFFF, symbol: '~', image: '/assets/icons/chicken_stew.png' } },
  herb_bundle:       { name: 'Herb Bundle',      type: 'consumable', description: 'Kumpulan herbal segar. Memulihkan 15 HP secara perlahan selama 10 detik.', healAmount: 15, price: 20, icon: { bg: 0x66BB6A, fg: 0xE8F5E9, symbol: '~', image: '/assets/icons/herb_bundle.png' } },
  smoked_fish:       { name: 'Smoked Fish',      type: 'consumable', description: 'Ikan asap dari danau Willowmere. HP+30, ATK+3% selama 60 detik.', healAmount: 30, buff: { stat: 'atk', value: 0.03, duration: 60 }, price: 35, icon: { bg: 0x795548, fg: 0xD7CCC8, symbol: '~', image: '/assets/icons/smoked_fish.png' } },
  honey_bread:       { name: 'Honey Bread',      type: 'consumable', description: 'Roti madu manis. HP+20, MP+10.', healAmount: 20, manaAmount: 10, price: 25, icon: { bg: 0xFFA726, fg: 0xFFF3E0, symbol: '~', image: '/assets/icons/honey_bread.png' } },
  healing_salve:     { name: 'Healing Salve',    type: 'consumable', description: 'Salep penyembuh dari Sari. Memulihkan 50 HP.', healAmount: 50, price: 120, icon: { bg: 0x00897B, fg: 0xB2DFDB, symbol: '+', image: '/assets/icons/healing_salve.png' } },
  venom_extract:     { name: 'Venom Extract',    type: 'consumable', description: 'Ekstrak racun yang sudah dimurnikan. ATK+8% selama 30 detik.', buff: { stat: 'atk', value: 0.08, duration: 30 }, price: 90, icon: { bg: 0x7B1FA2, fg: 0xCE93D8, symbol: '!', image: '/assets/icons/venom_extract.png' } },

  // ═══════════════════════════════════════
  // MATERIALS
  // ═══════════════════════════════════════
  moss_shell:      { name: 'Moss Shell',      type: 'material', description: 'Cangkang keras dari Moss Beetle. Bisa dipakai buat crafting armor awal.',     price: 4,  icon: { bg: 0x4CAF50, fg: 0x81C784, symbol: '◆', image: '/assets/icons/moss_shell.png' } },
  thorn:           { name: 'Thorn',            type: 'material', description: 'Duri tajam dari punggung Thorn Lizard. Bahan crafting weapon tier awal.',    price: 5, icon: { bg: 0x689F38, fg: 0xCDDC39, symbol: '▲', image: '/assets/icons/thorn.png' } },
  dust_pouch:      { name: 'Dust Pouch',       type: 'material', description: 'Kantung debu dari Dust Mouse. Kadang meledak kalau dipegang kasar.',   price: 2,  icon: { bg: 0xBCAAA4, fg: 0xEFEBE9, symbol: '○', image: '/assets/icons/dust_pouch.png' } },
  frog_leg:        { name: 'Frog Leg',         type: 'material', description: 'Kaki Puddle Frog. Bisa dimasak jadi makanan buff.',            price: 3, icon: { bg: 0x00BCD4, fg: 0xE0F7FA, symbol: '▬', image: '/assets/icons/frog_leg.png' } },
  wind_essence:    { name: 'Wind Essence',     type: 'material', description: 'Esensi angin dari Wind Sprite. Mengandung Aether terkristalisasi. Tidak bisa didapat dari serangan melee.', price: 12, icon: { bg: 0x81D4FA, fg: 0xFFFFFF, symbol: '✦', image: '/assets/icons/wind_essence.png' } },
  stone_fragment:  { name: 'Stone Fragment',   type: 'material', description: 'Pecahan batu dari Rock Crawler. Mereka berpura-pura jadi batu tapi isinya mineral berharga.',       price: 6, icon: { bg: 0x9E9E9E, fg: 0xE0E0E0, symbol: '■', image: '/assets/icons/stone_fragment.png' } },
  boar_tusk:       { name: 'Boar Tusk',        type: 'material', description: 'Taring besar dari Bramble Boar. Cukup kuat buat jadi weapon.',     price: 8, icon: { bg: 0x5D4037, fg: 0xFFF9C4, symbol: '◄', image: '/assets/icons/boar_tusk.png' } },
  ancient_heart:   { name: 'Ancient Heart',    type: 'material', description: 'Jantung kuno dari World Boss. Mengandung kekuatan Aether murni. Sangat langka.', price: 100, icon: { bg: 0xFFD700, fg: 0xFFF8E1, symbol: '♥', image: '/assets/icons/ancient_heart.png' } },
  bramble_core:    { name: 'Bramble Core',     type: 'material', description: 'Inti langka dari Bramble Boar. Mengandung Aether yang sudah terkristalisasi.',      price: 25, icon: { bg: 0x33691E, fg: 0x76FF03, symbol: '◆', image: '/assets/icons/bramble_core.png' } },
  turtle_shell:    { name: 'Turtle Shell',     type: 'material', description: 'Cangkang kura-kura raksasa dari Marsh Snapper. Sangat keras, cocok buat crafting shield.', price: 18, icon: { bg: 0x2E7D32, fg: 0xA5D6A7, symbol: '◎', image: '/assets/icons/turtle_shell.png' } },

  // ═══════════════════════════════════════
  // WEAPONS — Per job, 3 tiers
  // ═══════════════════════════════════════
  village_blade:    { name: 'Oath of the Valley',    type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 1, stats: { atk: 3 },                price: 80,  icon: { bg: 0x8D6E63, fg: 0xBCAAA4, symbol: '/', image: '/assets/icons/village_blade.png' } },
  ironclad_edge:    { name: 'Sundered Edge',    type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 2, stats: { atk: 6, def: 2 },         price: 250, icon: { bg: 0x607D8B, fg: 0xB0BEC5, symbol: '/', image: '/assets/icons/ironclad_edge.png' } },
  guardian_cleaver: { name: 'Aegis Breaker', type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 3, stats: { atk: 10, def: 4, hp: 20 }, price: 600, icon: { bg: 0x455A64, fg: 0xE0E0E0, symbol: '/', image: '/assets/icons/guardian_cleaver.png' } },

  wind_cutter:      { name: 'Whisper of the Plains',      type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 1, stats: { atk: 4, spd: 2 },          price: 120, icon: { bg: 0x00BCD4, fg: 0x80DEEA, symbol: '/', image: '/assets/icons/wind_cutter.png' } },
  plains_slicer:    { name: 'Stormveil Blade',    type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 2, stats: { atk: 7, spd: 3, crit: 0.05 }, price: 350, icon: { bg: 0x00897B, fg: 0xB2DFDB, symbol: '/', image: '/assets/icons/plains_slicer.png' } },
  tempest_dual:     { name: 'Twin Fangs of the Fracture',     type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 3, stats: { atk: 11, spd: 5, crit: 0.08, def: 1 }, price: 750, icon: { bg: 0x006064, fg: 0x84FFFF, symbol: '//', image: '/assets/icons/tempest_dual.png' } },

  willow_staff:     { name: 'Staff of Whispered Roots',     type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 1, stats: { atk: 2, mp: 15 },          price: 90,  icon: { bg: 0x795548, fg: 0xD7CCC8, symbol: '|', image: '/assets/icons/willow_staff.png' } },
  deepwood_rod:     { name: 'Rod of the Forgotten Shrine',     type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 2, stats: { atk: 5, mp: 30, spd: 2 },  price: 300, icon: { bg: 0x2E7D32, fg: 0xA5D6A7, symbol: '|', image: '/assets/icons/deepwood_rod.png' } },
  arcane_focus:     { name: 'The Conduit Focus',     type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 3, stats: { atk: 9, mp: 50, spd: 3, crit: 0.05 }, price: 700, icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '|', image: '/assets/icons/arcane_focus.png' } },

  pilgrim_staff:    { name: 'Staff of the Wandering Light',    type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 1, stats: { atk: 2, mp: 10, hp: 10 },  price: 100, icon: { bg: 0xA1887F, fg: 0xEFEBE9, symbol: '|', image: '/assets/icons/pilgrim_staff.png' } },
  shrine_scepter:   { name: 'Blessing of the First Shrine',   type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 2, stats: { atk: 4, mp: 25, hp: 20 },  price: 320, icon: { bg: 0xF5F5F5, fg: 0xFFD600, symbol: '|', image: '/assets/icons/shrine_scepter.png' } },
  lightbringer_rod: { name: 'The Last Light', type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 3, stats: { atk: 7, mp: 45, hp: 35, def: 2 }, price: 680, icon: { bg: 0xFFF9C4, fg: 0xFFD600, symbol: '|', image: '/assets/icons/lightbringer_rod.png' } },

  rusty_dagger:     { name: 'Whispering Fang',     type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 1, stats: { atk: 4, crit: 0.05 },      price: 80,  icon: { bg: 0x616161, fg: 0xBDBDBD, symbol: '\\', image: '/assets/icons/rusty_dagger.png' } },
  nightfang:        { name: 'Fang of the Hollow King',        type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 2, stats: { atk: 8, crit: 0.10, spd: 3 }, price: 450, icon: { bg: 0x212121, fg: 0xCE93D8, symbol: '\\', image: '/assets/icons/nightfang.png' } },
  void_edge:        { name: 'Edge of the Fracture',        type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 3, stats: { atk: 12, crit: 0.15, spd: 5, def: 1 }, price: 800, icon: { bg: 0x0D0D0D, fg: 0x7B1FA2, symbol: '\\', image: '/assets/icons/void_edge.png' } },

  // ═══════════════════════════════════════
  // ARMOR (body) — Per job, 3 tiers
  // ═══════════════════════════════════════
  guard_wrappings:     { name: 'Wrappings of the First Oath',     type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 1, stats: { def: 3, hp: 10 },                price: 60,  icon: { bg: 0x78909C, fg: 0xCFD8DC, symbol: '□' } },
  moss_plate:          { name: 'Plates of the Emerald Guardian',          type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 2, stats: { def: 6, hp: 25, spd: -1 },       price: 280, icon: { bg: 0x33691E, fg: 0x81C784, symbol: '□' } },
  bramble_mail:        { name: 'Mail of the Thornwall Guardian',        type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 3, stats: { def: 10, hp: 50, spd: -2, atk: 2 }, price: 650, icon: { bg: 0x5D4037, fg: 0xA1887F, symbol: '□' } },

  dancer_wrap:         { name: 'Veil of the First Step',         type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 1, stats: { def: 2, spd: 2 },                 price: 70,  icon: { bg: 0xE91E63, fg: 0xF8BBD0, symbol: '□' } },
  plains_leather:      { name: 'Hide of the Storm Runner',      type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 2, stats: { def: 4, spd: 3, atk: 1 },         price: 300, icon: { bg: 0xC62828, fg: 0xEF9A9A, symbol: '□' } },
  storm_shroud:        { name: 'Shroud of the Tempest Dancer',        type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 3, stats: { def: 7, spd: 5, atk: 3, crit: 0.03 }, price: 700, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '□' } },

  sage_robe:           { name: 'Robe of the First Reading',           type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 1, stats: { def: 2, mp: 15 },                 price: 80,  icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '□' } },
  deepwood_vestment:   { name: 'Vestment of the Deepwood Oracle',   type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 2, stats: { def: 3, mp: 30, spd: 2 },         price: 320, icon: { bg: 0x1B5E20, fg: 0x81C784, symbol: '□' } },
  arcane_mantle:       { name: 'Mantle of the Aether Scholar',       type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 3, stats: { def: 5, mp: 50, spd: 3, atk: 2 }, price: 720, icon: { bg: 0x311B92, fg: 0xB39DDB, symbol: '□' } },

  healer_wraps:        { name: 'Wraps of the Mending Light',        type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 1, stats: { def: 2, hp: 15, mp: 10 },         price: 75,  icon: { bg: 0xF5F5F5, fg: 0xFFECB3, symbol: '□' } },
  shrine_vestment:     { name: 'Vestment of the Holy Pilgrim',     type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 2, stats: { def: 4, hp: 30, mp: 25 },         price: 340, icon: { bg: 0xFFD600, fg: 0xFFF9C4, symbol: '□' } },
  lightweave_raiment:  { name: 'Raiment of the Archangel',  type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 3, stats: { def: 6, hp: 50, mp: 40, spd: 1 }, price: 750, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '□' } },

  shadow_wraps:        { name: 'Wraps of the Silent Oath',        type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 1, stats: { def: 2, spd: 3, crit: 0.02 },     price: 85,  icon: { bg: 0x212121, fg: 0x616161, symbol: '□' } },
  nightstalker_gear:   { name: 'Gear of the Hollow Watch',   type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 2, stats: { def: 4, spd: 4, crit: 0.05, atk: 2 }, price: 400, icon: { bg: 0x1A1A1A, fg: 0x424242, symbol: '□' } },
  void_cloak:          { name: 'Cloak of the Fracture Walker',          type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 3, stats: { def: 6, spd: 6, crit: 0.08, atk: 4, hp: 15 }, price: 820, icon: { bg: 0x0D0D0D, fg: 0x4A148C, symbol: '□' } },

  // ═══════════════════════════════════════
  // PANTS — Per job, 3 tiers
  // ═══════════════════════════════════════
  guard_leggings:     { name: 'Legguards of the Valley Watch',     type: 'equipment', slot: 'pants', classReq: ['guardian'],     tier: 1, stats: { def: 2 },                      price: 40,  icon: { bg: 0x78909C, fg: 0xCFD8DC, symbol: '▽' } },
  iron_greaves:       { name: 'Greaves of the Sundered Wall',       type: 'equipment', slot: 'pants', classReq: ['guardian'],     tier: 2, stats: { def: 5, hp: 15 },               price: 200, icon: { bg: 0x546E7A, fg: 0xB0BEC5, symbol: '▽' } },
  bramble_legplates:  { name: 'Legplates of the Thornwall Sentinel',  type: 'equipment', slot: 'pants', classReq: ['guardian'],     tier: 3, stats: { def: 8, hp: 30, atk: 1 },       price: 450, icon: { bg: 0x5D4037, fg: 0xA1887F, symbol: '▽' } },

  dancer_pants:       { name: 'Legwraps of the First Dance',       type: 'equipment', slot: 'pants', classReq: ['blade_dancer'], tier: 1, stats: { def: 1, spd: 2 },                price: 50,  icon: { bg: 0xE91E63, fg: 0xF8BBD0, symbol: '▽' } },
  plains_legguards:   { name: 'Legguards of the Stormchaser',   type: 'equipment', slot: 'pants', classReq: ['blade_dancer'], tier: 2, stats: { def: 3, spd: 3, atk: 1 },        price: 220, icon: { bg: 0xC62828, fg: 0xEF9A9A, symbol: '▽' } },
  storm_legplates:    { name: 'Legplates of the Gale Dancer',    type: 'equipment', slot: 'pants', classReq: ['blade_dancer'], tier: 3, stats: { def: 5, spd: 4, atk: 2, crit: 0.02 }, price: 480, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '▽' } },

  sage_slacks:        { name: 'Legwraps of the Aether Reader',        type: 'equipment', slot: 'pants', classReq: ['sage'],         tier: 1, stats: { def: 1, mp: 8 },                 price: 45,  icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '▽' } },
  deepwood_legwraps:  { name: 'Legwraps of the Root Walker',  type: 'equipment', slot: 'pants', classReq: ['sage'],         tier: 2, stats: { def: 2, mp: 20, spd: 1 },        price: 230, icon: { bg: 0x1B5E20, fg: 0x81C784, symbol: '▽' } },
  arcane_legguards:   { name: 'Legguards of the Shrine Scholar',   type: 'equipment', slot: 'pants', classReq: ['sage'],         tier: 3, stats: { def: 4, mp: 35, spd: 2, atk: 1 }, price: 500, icon: { bg: 0x311B92, fg: 0xB39DDB, symbol: '▽' } },

  healer_legwraps:    { name: 'Legwraps of the Mending Path',    type: 'equipment', slot: 'pants', classReq: ['cleric'],       tier: 1, stats: { def: 1, hp: 8, mp: 5 },          price: 50,  icon: { bg: 0xF5F5F5, fg: 0xFFECB3, symbol: '▽' } },
  shrine_legguards:   { name: 'Legguards of the Holy Sentinel',   type: 'equipment', slot: 'pants', classReq: ['cleric'],       tier: 2, stats: { def: 3, hp: 18, mp: 12 },        price: 240, icon: { bg: 0xFFD600, fg: 0xFFF9C4, symbol: '▽' } },
  lightweave_legs:    { name: 'Legguards of the Archangel',    type: 'equipment', slot: 'pants', classReq: ['cleric'],       tier: 3, stats: { def: 5, hp: 30, mp: 25, spd: 1 }, price: 520, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '▽' } },

  shadow_leggings:    { name: 'Leggings of the Nightveil',    type: 'equipment', slot: 'pants', classReq: ['shadow'],       tier: 1, stats: { def: 1, spd: 3, crit: 0.01 },    price: 55,  icon: { bg: 0x212121, fg: 0x616161, symbol: '▽' } },
  nightstalker_legs:  { name: 'Leggings of the Fracture Spy',  type: 'equipment', slot: 'pants', classReq: ['shadow'],       tier: 2, stats: { def: 2, spd: 4, crit: 0.03, atk: 1 }, price: 260, icon: { bg: 0x1A1A1A, fg: 0x424242, symbol: '▽' } },
  void_legguards:     { name: 'Legguards of the Void Walker',     type: 'equipment', slot: 'pants', classReq: ['shadow'],       tier: 3, stats: { def: 4, spd: 5, crit: 0.05, atk: 3 }, price: 550, icon: { bg: 0x0D0D0D, fg: 0x4A148C, symbol: '▽' } },

  // ═══════════════════════════════════════
  // BOOTS — Generic (all classes) + Per job, 3 tiers
  // ═══════════════════════════════════════
  straw_sandals:     { name: 'Straw Sandals',    type: 'equipment', slot: 'boots', classReq: ['laborer','miner','gardener','herbalist','watchman'], tier: 1, stats: { spd: 1 },                          price: 15,  icon: { bg: 0x8D6E63, fg: 0xD7CCC8, symbol: '=' } },
  leather_boots:     { name: 'Leather Boots',    type: 'equipment', slot: 'boots', classReq: ['laborer','miner','gardener','herbalist','watchman'], tier: 1, stats: { def: 1, spd: 1 },                    price: 30,  icon: { bg: 0x5D4037, fg: 0xBCAAA4, symbol: '=' } },
  guard_boots:        { name: 'Boots of the Valley Trek',        type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 1, stats: { def: 1, spd: 1 },                price: 35,  icon: { bg: 0x5D4037, fg: 0xA1887F, symbol: '=' } },
  iron_sabatons:      { name: 'Sabatons of the Ironclad Guardian',      type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 2, stats: { def: 3, spd: 1, hp: 10 },        price: 180, icon: { bg: 0x455A64, fg: 0xB0BEC5, symbol: '=' } },
  guardian_treads:    { name: 'Treads of the Last Guardian',    type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 3, stats: { def: 5, spd: 2, hp: 20, atk: 1 }, price: 420, icon: { bg: 0x37474F, fg: 0xCFD8DC, symbol: '=' } },

  dancer_shoes:       { name: 'Sandals of the First Step',       type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 1, stats: { spd: 3 },                         price: 45,  icon: { bg: 0xE91E63, fg: 0xF8BBD0, symbol: '=' } },
  plains_treads:      { name: 'Treads of the Stormrunner',      type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 2, stats: { spd: 5, def: 1, atk: 1 },         price: 210, icon: { bg: 0xC62828, fg: 0xEF9A9A, symbol: '=' } },
  storm_stride:       { name: 'Stride of the Tempest',       type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 3, stats: { spd: 7, def: 2, atk: 2, crit: 0.02 }, price: 460, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '=' } },

  sage_sandals:       { name: 'Sandals of the Whispering Path',       type: 'equipment', slot: 'boots', classReq: ['sage'],         tier: 1, stats: { spd: 2, mp: 5 },                  price: 40,  icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '=' } },
  deepwood_walkers:   { name: 'Walkers of the Rooted Trail',   type: 'equipment', slot: 'boots', classReq: ['sage'],         tier: 2, stats: { spd: 3, mp: 12, def: 1 },         price: 220, icon: { bg: 0x1B5E20, fg: 0x81C784, symbol: '=' } },
  arcane_treads:      { name: 'Treads of the Shrine Pilgrim',      type: 'equipment', slot: 'boots', classReq: ['sage'],         tier: 3, stats: { spd: 5, mp: 20, def: 2, atk: 1 }, price: 480, icon: { bg: 0x311B92, fg: 0xB39DDB, symbol: '=' } },

  healer_sandals:     { name: 'Sandals of the Mending Light',     type: 'equipment', slot: 'boots', classReq: ['cleric'],       tier: 1, stats: { spd: 1, hp: 5, mp: 5 },           price: 45,  icon: { bg: 0xF5F5F5, fg: 0xFFECB3, symbol: '=' } },
  shrine_treads:      { name: 'Treads of the Holy Pilgrim',      type: 'equipment', slot: 'boots', classReq: ['cleric'],       tier: 2, stats: { spd: 2, hp: 12, mp: 10, def: 1 }, price: 230, icon: { bg: 0xFFD600, fg: 0xFFF9C4, symbol: '=' } },
  lightweave_step:    { name: 'Step of the Archangel',    type: 'equipment', slot: 'boots', classReq: ['cleric'],       tier: 3, stats: { spd: 3, hp: 20, mp: 18, def: 2 }, price: 500, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '=' } },

  shadow_boots:       { name: 'Boots of the Nightveil',       type: 'equipment', slot: 'boots', classReq: ['shadow'],       tier: 1, stats: { spd: 3, crit: 0.01 },             price: 50,  icon: { bg: 0x212121, fg: 0x616161, symbol: '=' } },
  nightstalker_step:  { name: 'Step of the Fracture Shadow',  type: 'equipment', slot: 'boots', classReq: ['shadow'],       tier: 2, stats: { spd: 5, crit: 0.03, def: 1 },     price: 250, icon: { bg: 0x1A1A1A, fg: 0x424242, symbol: '=' } },
  void_stride:        { name: 'Stride of the Void',        type: 'equipment', slot: 'boots', classReq: ['shadow'],       tier: 3, stats: { spd: 7, crit: 0.05, def: 2, atk: 1 }, price: 530, icon: { bg: 0x0D0D0D, fg: 0x4A148C, symbol: '=' } },

  // ═══════════════════════════════════════
  // SHIELD — Guardian & Cleric, 3 tiers
  // ═══════════════════════════════════════
  wooden_buckler:     { name: 'Buckler of the Valley Guard',     type: 'equipment', slot: 'shield', classReq: ['guardian', 'cleric'], tier: 1, stats: { def: 3 },                    price: 60,  icon: { bg: 0x6D4C41, fg: 0xA1887F, symbol: '◎' } },
  iron_wall:          { name: 'Wall of the Sundered Pass',          type: 'equipment', slot: 'shield', classReq: ['guardian'],             tier: 2, stats: { def: 8, hp: 30 },           price: 400, icon: { bg: 0x455A64, fg: 0xCFD8DC, symbol: '◎' } },
  guardian_aegis:     { name: 'Aegis of the Last Stand',     type: 'equipment', slot: 'shield', classReq: ['guardian'],             tier: 3, stats: { def: 14, hp: 60, atk: 2 },  price: 800, icon: { bg: 0x1565C0, fg: 0x90CAF9, symbol: '◎' } },
  holy_buckler:       { name: 'Buckler of the Shrine Keeper',       type: 'equipment', slot: 'shield', classReq: ['cleric'],               tier: 2, stats: { def: 6, hp: 20, mp: 10 },   price: 350, icon: { bg: 0xFFD600, fg: 0xFFF9C4, symbol: '◎' } },
  lightward_aegis:    { name: 'Aegis of the Holy Guardian',    type: 'equipment', slot: 'shield', classReq: ['cleric'],               tier: 3, stats: { def: 10, hp: 40, mp: 20 },  price: 720, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '◎' } },

  // ═══════════════════════════════════════
  // RINGS — Universal (all jobs)
  // ═══════════════════════════════════════
  copper_band:        { name: 'Band of the First Adventurer',        type: 'equipment', slot: 'ring', stats: { hp: 10 },                        price: 50,  icon: { bg: 0xBF360C, fg: 0xFF8A65, symbol: '○' } },
  wind_charm:         { name: 'Charm of the Plains Wind',         type: 'equipment', slot: 'ring', stats: { spd: 3, atk: 1 },                 price: 120, icon: { bg: 0x00ACC1, fg: 0x80DEEA, symbol: '○' } },
  moonstone_ring:     { name: 'Ring of the Moonlit Shrine',     type: 'equipment', slot: 'ring', stats: { mp: 20, hp: 10 },                 price: 180, icon: { bg: 0x7B1FA2, fg: 0xCE93D8, symbol: '○' } },
  aether_pendant:     { name: 'Pendant of the Conduit',     type: 'equipment', slot: 'ring', stats: { mp: 25, hp: 15, atk: 2 },         price: 350, icon: { bg: 0x7B1FA2, fg: 0xCE93D8, symbol: '○' } },
  guardian_signet:    { name: 'Signet of the Elder Guardian',    type: 'equipment', slot: 'ring', stats: { def: 3, hp: 25, atk: 2, spd: 1 }, price: 500, icon: { bg: 0x1565C0, fg: 0x90CAF9, symbol: '○' } },

  // ═══════════════════════════════════════
  // ACCESSORIES (Back) — Universal (all jobs)
  // ═══════════════════════════════════════
  travel_pack:        { name: 'Pack of the Wandering Guardian',        type: 'equipment', slot: 'accessory', stats: { hp: 10 },                  price: 60,  icon: { bg: 0x795548, fg: 0xBCAAA4, symbol: '◯' } },
  wind_cloak:         { name: 'Cloak of the Gale Runner',         type: 'equipment', slot: 'accessory', stats: { spd: 3, def: 1 },           price: 200, icon: { bg: 0x00BCD4, fg: 0x80DEEA, symbol: '◯' } },
  bramble_cape:       { name: 'Cape of the Thornwall Guardian',       type: 'equipment', slot: 'accessory', stats: { def: 4, hp: 20, atk: 1 },   price: 400, icon: { bg: 0x33691E, fg: 0x81C784, symbol: '◯' } },
};

// ═══════════════════════════════════════
// LOOT TABLES — Fixed drops per monster
// ═══════════════════════════════════════
const LOOT_TABLES = {
  moss_beetle: [
    { itemId: 'moss_shell', chance: 0.8, quantity: [1, 2] },
    { itemId: 'potion_small', chance: 0.2, quantity: [1, 1] },
    { itemId: 'village_blade', chance: 0.03, quantity: [1, 1] },
    { itemId: 'wind_cutter', chance: 0.02, quantity: [1, 1] },
    { itemId: 'guard_wrappings', chance: 0.03, quantity: [1, 1] },
    { itemId: 'dancer_wrap', chance: 0.02, quantity: [1, 1] },
  ],
  dust_mouse: [
    { itemId: 'dust_pouch', chance: 0.9, quantity: [1, 3] },
    { itemId: 'potion_small', chance: 0.15, quantity: [1, 1] },
    { itemId: 'rusty_dagger', chance: 0.02, quantity: [1, 1] },
    { itemId: 'shadow_wraps', chance: 0.02, quantity: [1, 1] },
    { itemId: 'guard_leggings', chance: 0.03, quantity: [1, 1] },
    { itemId: 'dancer_pants', chance: 0.02, quantity: [1, 1] },
    { itemId: 'straw_sandals', chance: 0.03, quantity: [1, 1] },
  ],
  thorn_lizard: [
    { itemId: 'thorn', chance: 0.75, quantity: [1, 2] },
    { itemId: 'potion_small', chance: 0.25, quantity: [1, 1] },
    { itemId: 'willow_staff', chance: 0.02, quantity: [1, 1] },
    { itemId: 'pilgrim_staff', chance: 0.02, quantity: [1, 1] },
    { itemId: 'sage_robe', chance: 0.02, quantity: [1, 1] },
    { itemId: 'healer_wraps', chance: 0.02, quantity: [1, 1] },
    { itemId: 'sage_slacks', chance: 0.02, quantity: [1, 1] },
    { itemId: 'healer_legwraps', chance: 0.02, quantity: [1, 1] },
  ],
  puddle_frog: [
    { itemId: 'frog_leg', chance: 0.8, quantity: [1, 2] },
    { itemId: 'mp_potion_small', chance: 0.2, quantity: [1, 1] },
    { itemId: 'wooden_buckler', chance: 0.02, quantity: [1, 1] },
    { itemId: 'iron_greaves', chance: 0.02, quantity: [1, 1] },
    { itemId: 'plains_legguards', chance: 0.02, quantity: [1, 1] },
    { itemId: 'leather_boots', chance: 0.03, quantity: [1, 1] },
    { itemId: 'travel_pack', chance: 0.02, quantity: [1, 1] },
  ],
  wind_sprite: [
    { itemId: 'wind_essence', chance: 0.6, quantity: [1, 1] },
    { itemId: 'potion_medium', chance: 0.1, quantity: [1, 1] },
    { itemId: 'copper_band', chance: 0.03, quantity: [1, 1] },
    { itemId: 'wind_charm', chance: 0.02, quantity: [1, 1] },
    { itemId: 'dancer_shoes', chance: 0.03, quantity: [1, 1] },
    { itemId: 'shadow_boots', chance: 0.02, quantity: [1, 1] },
    { itemId: 'wind_cloak', chance: 0.015, quantity: [1, 1] },
  ],
  rock_crawler: [
    { itemId: 'stone_fragment', chance: 0.8, quantity: [1, 2] },
    { itemId: 'moonstone_ring', chance: 0.015, quantity: [1, 1] },
    { itemId: 'ironclad_edge', chance: 0.01, quantity: [1, 1] },
    { itemId: 'plains_slicer', chance: 0.01, quantity: [1, 1] },
    { itemId: 'nightfang', chance: 0.008, quantity: [1, 1] },
    { itemId: 'deepwood_rod', chance: 0.008, quantity: [1, 1] },
    { itemId: 'shrine_scepter', chance: 0.008, quantity: [1, 1] },
    { itemId: 'iron_sabatons', chance: 0.01, quantity: [1, 1] },
    { itemId: 'plains_treads', chance: 0.01, quantity: [1, 1] },
    { itemId: 'deepwood_walkers', chance: 0.01, quantity: [1, 1] },
  ],
  bramble_boar: [
    { itemId: 'boar_tusk', chance: 0.7, quantity: [1, 2] },
    { itemId: 'bramble_core', chance: 0.1, quantity: [1, 1] },
    { itemId: 'potion_medium', chance: 0.3, quantity: [1, 1] },
    // Tier 2 equipment
    { itemId: 'moss_plate', chance: 0.015, quantity: [1, 1] },
    { itemId: 'plains_leather', chance: 0.012, quantity: [1, 1] },
    { itemId: 'deepwood_vestment', chance: 0.01, quantity: [1, 1] },
    { itemId: 'shrine_vestment', chance: 0.01, quantity: [1, 1] },
    { itemId: 'nightstalker_gear', chance: 0.008, quantity: [1, 1] },
    { itemId: 'iron_wall', chance: 0.008, quantity: [1, 1] },
    { itemId: 'holy_buckler', chance: 0.008, quantity: [1, 1] },
    { itemId: 'aether_pendant', chance: 0.005, quantity: [1, 1] },
    { itemId: 'bramble_cape', chance: 0.005, quantity: [1, 1] },
    // Tier 3 legendaries
    { itemId: 'guardian_cleaver', chance: 0.003, quantity: [1, 1] },
    { itemId: 'tempest_dual', chance: 0.002, quantity: [1, 1] },
    { itemId: 'arcane_focus', chance: 0.002, quantity: [1, 1] },
    { itemId: 'lightbringer_rod', chance: 0.002, quantity: [1, 1] },
    { itemId: 'void_edge', chance: 0.002, quantity: [1, 1] },
    { itemId: 'bramble_mail', chance: 0.003, quantity: [1, 1] },
    { itemId: 'storm_shroud', chance: 0.002, quantity: [1, 1] },
    { itemId: 'arcane_mantle', chance: 0.002, quantity: [1, 1] },
    { itemId: 'lightweave_raiment', chance: 0.002, quantity: [1, 1] },
    { itemId: 'void_cloak', chance: 0.002, quantity: [1, 1] },
    { itemId: 'guardian_aegis', chance: 0.002, quantity: [1, 1] },
    { itemId: 'lightward_aegis', chance: 0.002, quantity: [1, 1] },
    { itemId: 'guardian_signet', chance: 0.003, quantity: [1, 1] },
    { itemId: 'bramble_legplates', chance: 0.003, quantity: [1, 1] },
    { itemId: 'storm_legplates', chance: 0.002, quantity: [1, 1] },
    { itemId: 'arcane_legguards', chance: 0.002, quantity: [1, 1] },
    { itemId: 'lightweave_legs', chance: 0.002, quantity: [1, 1] },
    { itemId: 'void_legguards', chance: 0.002, quantity: [1, 1] },
    { itemId: 'guardian_treads', chance: 0.003, quantity: [1, 1] },
    { itemId: 'storm_stride', chance: 0.002, quantity: [1, 1] },
    { itemId: 'arcane_treads', chance: 0.002, quantity: [1, 1] },
    { itemId: 'lightweave_step', chance: 0.002, quantity: [1, 1] },
    { itemId: 'void_stride', chance: 0.002, quantity: [1, 1] },
  ],
};

module.exports = { ITEMS, LOOT_TABLES };
