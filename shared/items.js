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
  turtle_shell:    { name: 'Turtle Shell',    type: 'material', description: 'Cangkang kura-kura raksasa dari Marsh Snapper. Sangat keras, cocok buat crafting shield.', price: 18, icon: { bg: 0x2E7D32, fg: 0xA5D6A7, symbol: '◎', image: '/assets/icons/turtle_shell.png' } },

  // ═══════════════════════════════════════
  // STORMCREST MOUNTAINS — Lv.5-8 materials
  // ═══════════════════════════════════════
  hawk_feather:    { name: 'Hawk Feather',     type: 'material', description: 'Bulu Storm Hawk yang charged dengan listrik statis. Bergetar saat dipegang.', price: 15, icon: { bg: 0x78909C, fg: 0xE3F2FD, symbol: '❧', image: '/assets/icons/hawk_feather.png' } },
  golem_core:      { name: 'Golem Core',       type: 'material', description: 'Inti kristal dari Stone Golem. Mengandung kekuatan gunung yang sudah terkristalisasi.', price: 30, icon: { bg: 0x616161, fg: 0xFFD54F, symbol: '⬡', image: '/assets/icons/golem_core.png' } },

  // ═══════════════════════════════════════
  // MISTMARSH SWAMP — Lv.8-10 materials
  // ═══════════════════════════════════════
  lurker_fang:      { name: 'Lurker Fang',      type: 'material', description: 'Taring Swamp Lurker. Berbisa dan tajam — bisa dipake buat weapon tier tinggi.', price: 22, icon: { bg: 0x1B5E20, fg: 0xE8F5E9, symbol: '🦷', image: '/assets/icons/lurker_fang.png' } },
  toxic_slime:     { name: 'Toxic Slime',      type: 'material', description: 'Lendir beracun dari Toxic Toad. Mengandung Aether tercemar yang powerful tapi berbahaya.', price: 20, icon: { bg: 0x7B1FA2, fg: 0xF3E5F5, symbol: '◉', image: '/assets/icons/toxic_slime.png' } },

  // ═══════════════════════════════════════
  // VOLCANIC WASTES — Lv.15-25 materials
  // ═══════════════════════════════════════
  lava_essence:    { name: 'Lava Essence',     type: 'material', description: 'Esensi lava cair dari kedalaman gunung berapi. Sangat panas — bahkan bisa membakar tangan.',       price: 30, icon: { bg: 0xD32F2F, fg: 0xFFCDD2, symbol: '◈', image: '/assets/icons/lava_essence.png' } },
  salamander_scale:{ name: 'Salamander Scale', type: 'material', description: 'Sisik api dari Fire Salamander. Tahan panas ekstrem dan berkilau seperti bara.',              price: 35, icon: { bg: 0xE65100, fg: 0xFFE0B2, symbol: '⬡', image: '/assets/icons/salamander_scale.png' } },
  magma_core:      { name: 'Magma Core',       type: 'material', description: 'Inti magma dari Magma Golem. Terkristalisasi dan mengandung kekuatan vulkanik yang luar biasa.', price: 40, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '◆', image: '/assets/icons/magma_core.png' } },

  // ═══════════════════════════════════════
  // CRYSTAL CAVERNS — Lv.25-35 materials
  // ═══════════════════════════════════════
  crystal_shard:   { name: 'Crystal Shard',    type: 'material', description: 'Pecahan kristal bercahaya dari Crystal Caverns. Memantulkan cahaya Aether.',                   price: 50, icon: { bg: 0x6A1B9A, fg: 0xCE93D8, symbol: '✦', image: '/assets/icons/crystal_shard.png' } },
  gem_dust:        { name: 'Gem Dust',         type: 'material', description: 'Debu permata halus dari Gem Scorpion. Bisa digunakan untuk enchanting equipment.',            price: 55, icon: { bg: 0xAD1457, fg: 0xF8BBD0, symbol: '✧', image: '/assets/icons/gem_dust.png' } },
  prism_core:      { name: 'Prism Core',       type: 'material', description: 'Inti prisma dari Prism Wraith. Memecah cahaya menjadi spektrum warna yang memukau.',          price: 60, icon: { bg: 0xEEEEEE, fg: 0xFFFFFF, symbol: '☆', image: '/assets/icons/prism_core.png' } },

  // ═══════════════════════════════════════
  // SKY RUINS — Lv.35-45 materials
  // ═══════════════════════════════════════
  storm_essence:   { name: 'Storm Essence',    type: 'material', description: 'Esensi badai dari Storm Elemental. Mengandung kekuatan petir yang sudah terkristalisasi.',     price: 80, icon: { bg: 0x1565C0, fg: 0x90CAF9, symbol: '⚡', image: '/assets/icons/storm_essence.png' } },
  sky_feather:     { name: 'Sky Feather',      type: 'material', description: 'Bulu dari Sky Knight. Terasa ringan seperti angin namun lebih kuat dari baja.',              price: 85, icon: { bg: 0x0288D1, fg: 0xB3E5FC, symbol: '❧', image: '/assets/icons/sky_feather.png' } },

  // ═══════════════════════════════════════
  // THE ABYSS — Lv.45-55 materials
  // ═══════════════════════════════════════
  void_essence:    { name: 'Void Essence',     type: 'material', description: 'Esensi kekosongan dari Void Stalker. Menganga dengan energi gelap yang mengerikan.',           price: 100, icon: { bg: 0x311B92, fg: 0xB388FF, symbol: '◉', image: '/assets/icons/void_essence.png' } },
  shadow_dust:     { name: 'Shadow Dust',      type: 'material', description: 'Debu bayangan dari Shadow Beast. Melekat pada kulit dan menghilang jika terkena cahaya.',      price: 110, icon: { bg: 0x212121, fg: 0x9E9E9E, symbol: '·', image: '/assets/icons/shadow_dust.png' } },
  chaos_core:      { name: 'Chaos Core',       type: 'material', description: 'Inti kekacauan dari Chaos Lord. Berubah warna terus-menerus dan mengeluarkan energi murni.',    price: 150, icon: { bg: 0x7B1FA2, fg: 0xFF80AB, symbol: '✴', image: '/assets/icons/chaos_core.png' } },

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

  // ═══════════════════════════════════════
  // TIER 4 WEAPONS — Lv.20
  // ═══════════════════════════════════════
  titan_breaker:    { name: 'Titan Breaker',    type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 4, stats: { atk: 15, def: 6, hp: 40 },      price: 1500, icon: { bg: 0x37474F, fg: 0xECEFF1, symbol: '/', image: '/assets/icons/titan_breaker.png' } },
  void_blade:       { name: 'Void Blade',       type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 4, stats: { atk: 16, spd: 7, crit: 0.12 },  price: 1600, icon: { bg: 0x1A237E, fg: 0x7C4DFF, symbol: '/', image: '/assets/icons/void_blade.png' } },
  ancient_staff:    { name: 'Ancient Staff',    type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 4, stats: { atk: 12, mp: 80, spd: 4 },      price: 1400, icon: { bg: 0x4A148C, fg: 0xEA80FC, symbol: '|', image: '/assets/icons/ancient_staff.png' } },
  divine_rod:       { name: 'Divine Rod',       type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 4, stats: { atk: 10, mp: 70, hp: 50, def: 4 }, price: 1350, icon: { bg: 0xFFD600, fg: 0xFFFF8D, symbol: '|', image: '/assets/icons/divine_rod.png' } },
  shadow_fang:      { name: 'Shadow Fang',      type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 4, stats: { atk: 18, crit: 0.18, spd: 6 },  price: 1700, icon: { bg: 0x0D0D0D, fg: 0xE040FB, symbol: '\\', image: '/assets/icons/shadow_fang.png' } },

  // ═══════════════════════════════════════
  // TIER 4 ARMOR — Lv.20
  // ═══════════════════════════════════════
  titan_plate:      { name: 'Titan Plate',      type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 4, stats: { def: 14, hp: 80, spd: -1 },     price: 1200, icon: { bg: 0x37474F, fg: 0xB0BEC5, symbol: '□' } },
  void_weave:       { name: 'Void Weave',       type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 4, stats: { def: 8, spd: 5, atk: 3 },        price: 1300, icon: { bg: 0x1A237E, fg: 0x7C4DFF, symbol: '□' } },
  ancient_robe:     { name: 'Ancient Robe',     type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 4, stats: { def: 6, mp: 40, hp: 30, atk: 2 }, price: 1100, icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '□' } },
  divine_vestment:  { name: 'Divine Vestment',  type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 4, stats: { def: 10, hp: 60, mp: 30 },      price: 1150, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '□' } },
  shadow_cloak:     { name: 'Shadow Cloak',     type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 4, stats: { def: 7, spd: 6, crit: 0.08 },   price: 1350, icon: { bg: 0x0D0D0D, fg: 0x7B1FA2, symbol: '□' } },

  // ═══════════════════════════════════════
  // TIER 5 WEAPONS — Lv.35
  // ═══════════════════════════════════════
  chaos_breaker:    { name: 'Chaos Breaker',    type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 5, stats: { atk: 22, def: 10, hp: 80 },     price: 4000, icon: { bg: 0xB71C1C, fg: 0xFF8A80, symbol: '/', image: '/assets/icons/chaos_breaker.png' } },
  eternity_blade:   { name: 'Eternity Blade',   type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 5, stats: { atk: 24, spd: 10, crit: 0.18 }, price: 4200, icon: { bg: 0x00BCD4, fg: 0x84FFFF, symbol: '/', image: '/assets/icons/eternity_blade.png' } },
  cosmos_staff:     { name: 'Cosmos Staff',     type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 5, stats: { atk: 18, mp: 120, spd: 6 },     price: 3800, icon: { bg: 0x0D47A1, fg: 0x448AFF, symbol: '|', image: '/assets/icons/cosmos_staff.png' } },
  celestial_rod:    { name: 'Celestial Rod',    type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 5, stats: { atk: 15, mp: 100, hp: 80, def: 6 }, price: 3600, icon: { bg: 0xFFD600, fg: 0xFFFF00, symbol: '|', image: '/assets/icons/celestial_rod.png' } },
  abyssal_edge:     { name: 'Abyssal Edge',     type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 5, stats: { atk: 26, crit: 0.22, spd: 9 },  price: 4500, icon: { bg: 0x1A0033, fg: 0xD500F9, symbol: '\\', image: '/assets/icons/abyssal_edge.png' } },

  // ═══════════════════════════════════════
  // TIER 5 ARMOR — Lv.35
  // ═══════════════════════════════════════
  chaos_mail:       { name: 'Chaos Mail',       type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 5, stats: { def: 20, hp: 120, spd: -2 },    price: 3500, icon: { bg: 0xB71C1C, fg: 0xEF9A9A, symbol: '□' } },
  eternity_weave:   { name: 'Eternity Weave',   type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 5, stats: { def: 12, spd: 8, atk: 5 },       price: 3800, icon: { bg: 0x00838F, fg: 0x80DEEA, symbol: '□' } },
  cosmos_robe:      { name: 'Cosmos Robe',      type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 5, stats: { def: 10, mp: 70, hp: 50, atk: 4 }, price: 3200, icon: { bg: 0x0D47A1, fg: 0x82B1FF, symbol: '□' } },
  celestial_mail:   { name: 'Celestial Mail',   type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 5, stats: { def: 15, hp: 100, mp: 50 },     price: 3400, icon: { bg: 0xFFD600, fg: 0xFFFF8D, symbol: '□' } },
  abyssal_shroud:   { name: 'Abyssal Shroud',   type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 5, stats: { def: 11, spd: 10, crit: 0.12 }, price: 3900, icon: { bg: 0x1A0033, fg: 0xEA80FC, symbol: '□' } },

  // ═══════════════════════════════════════
  // TIER 6 WEAPONS — Lv.50 (ENDGAME)
  // ═══════════════════════════════════════
  worldsplitter:    { name: 'Worldsplitter',    type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 6, stats: { atk: 30, def: 14, hp: 120 },    price: 10000, icon: { bg: 0x880E4F, fg: 0xFF80AB, symbol: '/', image: '/assets/icons/worldsplitter.png' } },
  infinity_edge:    { name: 'Infinity Edge',    type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 6, stats: { atk: 32, spd: 14, crit: 0.25 }, price: 11000, icon: { bg: 0x006064, fg: 0x84FFFF, symbol: '/', image: '/assets/icons/infinity_edge.png' } },
  omniscient_staff: { name: 'Omniscient Staff', type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 6, stats: { atk: 25, mp: 180, spd: 8 },     price: 9500, icon: { bg: 0x1A237E, fg: 0x8C9EFF, symbol: '|', image: '/assets/icons/omniscient_staff.png' } },
  eternal_rod:      { name: 'Eternal Rod',      type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 6, stats: { atk: 20, mp: 150, hp: 120, def: 8 }, price: 9000, icon: { bg: 0xF9A825, fg: 0xFFFF00, symbol: '|', image: '/assets/icons/eternal_rod.png' } },
  oblivion_fang:    { name: 'Oblivion Fang',    type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 6, stats: { atk: 35, crit: 0.30, spd: 12 }, price: 12000, icon: { bg: 0x000000, fg: 0xD500F9, symbol: '\\', image: '/assets/icons/oblivion_fang.png' } },

  // ═══════════════════════════════════════
  // TIER 6 ARMOR — Lv.50 (ENDGAME)
  // ═══════════════════════════════════════
  worldplate:       { name: 'Worldplate',       type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 6, stats: { def: 28, hp: 180, spd: -2 },    price: 8000, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '□' } },
  infinity_weave:   { name: 'Infinity Weave',   type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 6, stats: { def: 16, spd: 12, atk: 8 },      price: 8500, icon: { bg: 0x004D40, fg: 0x64FFDA, symbol: '□' } },
  omniscient_robe:  { name: 'Omniscient Robe',  type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 6, stats: { def: 14, mp: 100, hp: 80, atk: 6 }, price: 7500, icon: { bg: 0x1A237E, fg: 0xB388FF, symbol: '□' } },
  eternal_mail:     { name: 'Eternal Mail',     type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 6, stats: { def: 20, hp: 150, mp: 80 },     price: 7800, icon: { bg: 0xF9A825, fg: 0xFFFF8D, symbol: '□' } },
  oblivion_shroud:  { name: 'Oblivion Shroud',  type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 6, stats: { def: 15, spd: 14, crit: 0.18 }, price: 9000, icon: { bg: 0x000000, fg: 0xE040FB, symbol: '□' } },

  // ═══════════════════════════════════════
  // TIER 4-6 BOOTS
  // ═══════════════════════════════════════
  titan_treads:     { name: 'Titan Treads',     type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 4, stats: { spd: 4, def: 3, hp: 20 },       price: 1000, icon: { bg: 0x37474F, fg: 0xB0BEC5, symbol: '=' } },
  void_step:        { name: 'Void Step',        type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 4, stats: { spd: 8, crit: 0.05, atk: 2 },    price: 1100, icon: { bg: 0x1A237E, fg: 0x7C4DFF, symbol: '=' } },
  chaos_treads:     { name: 'Chaos Treads',     type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 5, stats: { spd: 6, def: 5, hp: 40 },       price: 3000, icon: { bg: 0xB71C1C, fg: 0xEF9A9A, symbol: '=' } },
  eternity_step:    { name: 'Eternity Step',    type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 5, stats: { spd: 12, crit: 0.08, atk: 4 },  price: 3200, icon: { bg: 0x00838F, fg: 0x80DEEA, symbol: '=' } },
  world_treads:     { name: 'World Treads',     type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 6, stats: { spd: 8, def: 8, hp: 60 },       price: 7000, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '=' } },
  infinity_step:    { name: 'Infinity Step',    type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 6, stats: { spd: 16, crit: 0.12, atk: 6 },  price: 7500, icon: { bg: 0x006064, fg: 0x84FFFF, symbol: '=' } },

  // ═══════════════════════════════════════
  // TIER 4-6 SHIELDS
  // ═══════════════════════════════════════
  titan_aegis:      { name: 'Titan Aegis',      type: 'equipment', slot: 'shield', classReq: ['guardian', 'cleric'], tier: 4, stats: { def: 18, hp: 80, atk: 3 },   price: 1400, icon: { bg: 0x37474F, fg: 0xECEFF1, symbol: '◎' } },
  chaos_aegis:      { name: 'Chaos Aegis',      type: 'equipment', slot: 'shield', classReq: ['guardian', 'cleric'], tier: 5, stats: { def: 25, hp: 120, atk: 5 },  price: 3500, icon: { bg: 0xB71C1C, fg: 0xFF8A80, symbol: '◎' } },
  world_aegis:      { name: 'World Aegis',      type: 'equipment', slot: 'shield', classReq: ['guardian'],             tier: 6, stats: { def: 35, hp: 200, atk: 8 }, price: 8500, icon: { bg: 0x880E4F, fg: 0xFF80AB, symbol: '◎' } },

  // ═══════════════════════════════════════
  // TIER 4-6 RINGS
  // ═══════════════════════════════════════
  titan_signet:     { name: 'Titan Signet',     type: 'equipment', slot: 'ring', stats: { def: 4, hp: 40, atk: 3 },       price: 1200, icon: { bg: 0x37474F, fg: 0xB0BEC5, symbol: '○' } },
  chaos_signet:     { name: 'Chaos Signet',     type: 'equipment', slot: 'ring', stats: { def: 6, hp: 60, atk: 5, spd: 2 }, price: 3000, icon: { bg: 0xB71C1C, fg: 0xEF9A9A, symbol: '○' } },
  world_signet:     { name: 'World Signet',     type: 'equipment', slot: 'ring', stats: { def: 8, hp: 80, atk: 8, spd: 3 }, price: 7000, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '○' } },

  // ═══════════════════════════════════════
  // BOSS EXCLUSIVE — Ultra rare, best stats
  // ═══════════════════════════════════════
  inferno_blade:     { name: 'Inferno Blade',         type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 5, stats: { atk: 28, def: 8, hp: 60 },                       price: 8000,  icon: { bg: 0xBF360C, fg: 0xFF6E40, symbol: '/', image: '/assets/icons/inferno_blade.png' } },
  titans_gauntlet:   { name: 'Titan Gauntlet',        type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 5, stats: { atk: 30, spd: 12, crit: 0.20 },                 price: 8500,  icon: { bg: 0x37474F, fg: 0xB0BEC5, symbol: '//', image: '/assets/icons/titans_gauntlet.png' } },
  queens_crown:      { name: 'Crystal Queen Crown',   type: 'equipment', slot: 'armor',  classReq: ['sage'],         tier: 5, stats: { def: 18, mp: 100, hp: 80, atk: 6 },              price: 8000,  icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '□', image: '/assets/icons/queens_crown.png' } },
  prismatic_staff:   { name: 'Prismatic Staff',       type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 5, stats: { atk: 22, mp: 150, spd: 8, crit: 0.08 },         price: 8500,  icon: { bg: 0x7B1FA2, fg: 0xEA80FC, symbol: '|', image: '/assets/icons/prismatic_staff.png' } },
  dragons_wing:      { name: 'Dragon Wing Cloak',     type: 'equipment', slot: 'armor',  classReq: ['shadow'],       tier: 5, stats: { def: 14, spd: 12, crit: 0.15, atk: 5 },         price: 9000,  icon: { bg: 0x0D47A1, fg: 0x448AFF, symbol: '□', image: '/assets/icons/dragons_wing.png' } },
  skybreaker_lance:  { name: 'Skybreaker Lance',      type: 'equipment', slot: 'weapon', classReq: ['watchman'],     tier: 5, stats: { atk: 32, spd: 8, crit: 0.18 },                  price: 9500,  icon: { bg: 0x01579B, fg: 0x80D8FF, symbol: '/', image: '/assets/icons/skybreaker_lance.png' } },
  void_shard:        { name: 'Void Shard Blade',      type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 6, stats: { atk: 40, crit: 0.35, spd: 15 },                 price: 15000, icon: { bg: 0x0D0D0D, fg: 0xD500F9, symbol: '\\\\', image: '/assets/icons/void_shard.png' } },
  chaos_heart:       { name: 'Chaos Heart Pendant',   type: 'equipment', slot: 'accessory',                            tier: 6, stats: { hp: 150, mp: 80, atk: 10, def: 10, spd: 5 },     price: 20000, icon: { bg: 0x000000, fg: 0xFF1744, symbol: '◯', image: '/assets/icons/chaos_heart.png' } },

  // ═══════════════════════════════════════
  // MONSTER EXCLUSIVE — Rare drops
  // ═══════════════════════════════════════
  volcanic_fang:     { name: 'Volcanic Fang',         type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 4, stats: { atk: 20, spd: 6, crit: 0.10 },                  price: 3500,  icon: { bg: 0xE65100, fg: 0xFF9800, symbol: '/', image: '/assets/icons/volcanic_fang.png' } },
  crystal_edge:      { name: 'Crystal Edge',          type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 4, stats: { atk: 22, crit: 0.15, spd: 5 },                  price: 3800,  icon: { bg: 0x6A1B9A, fg: 0xCE93D8, symbol: '\\\\', image: '/assets/icons/crystal_edge.png' } },
  sky_talon:         { name: 'Sky Talon',             type: 'equipment', slot: 'weapon', classReq: ['watchman'],     tier: 4, stats: { atk: 24, spd: 8, crit: 0.12 },                  price: 4000,  icon: { bg: 0x0277BD, fg: 0x4FC3F7, symbol: '/', image: '/assets/icons/sky_talon.png' } },
  abyssal_ring:      { name: 'Abyssal Ring',          type: 'equipment', slot: 'ring',                                    tier: 5, stats: { hp: 80, mp: 40, atk: 6, def: 6, spd: 3 },       price: 5000,  icon: { bg: 0x1A0033, fg: 0xD500F9, symbol: '○', image: '/assets/icons/abyssal_ring.png' } },
  lava_heart:        { name: 'Lava Heart Amulet',     type: 'equipment', slot: 'accessory',                              tier: 4, stats: { hp: 60, atk: 4, def: 3 },                       price: 2800,  icon: { bg: 0xBF360C, fg: 0xFF6E40, symbol: '◯', image: '/assets/icons/lava_heart.png' } },
  shadow_cloak_rare: { name: 'Shadow Cloak (Rare)',   type: 'equipment', slot: 'armor',  classReq: ['shadow'],       tier: 4, stats: { def: 12, spd: 8, crit: 0.10, atk: 4 },           price: 4500,  icon: { bg: 0x212121, fg: 0x7C4DFF, symbol: '□', image: '/assets/icons/shadow_cloak_rare.png' } },
  storm_shield:      { name: 'Storm Shield',          type: 'equipment', slot: 'shield', classReq: ['guardian'],     tier: 4, stats: { def: 22, hp: 100, atk: 4 },                      price: 4200,  icon: { bg: 0x1565C0, fg: 0x42A5F5, symbol: '◎', image: '/assets/icons/storm_shield.png' } },
};

// ═══════════════════════════════════════

// ═══════════════════════════════════════
// LOOT TABLES — Fixed drops per monster
// ═══════════════════════════════════════
const LOOT_TABLES = {
  // ═══════════════════════════════════════
  // WILLOWMERE — Lv.1-4 (materials + potions only)
  // ═══════════════════════════════════════
  moss_beetle: [
    { itemId: 'moss_shell', chance: 0.8, quantity: [1, 2] },
    { itemId: 'potion_small', chance: 0.2, quantity: [1, 1] },
  ],
  dust_mouse: [
    { itemId: 'dust_pouch', chance: 0.9, quantity: [1, 3] },
    { itemId: 'potion_small', chance: 0.15, quantity: [1, 1] },
  ],
  thorn_lizard: [
    { itemId: 'thorn', chance: 0.75, quantity: [1, 2] },
    { itemId: 'potion_small', chance: 0.25, quantity: [1, 1] },
  ],
  puddle_frog: [
    { itemId: 'frog_leg', chance: 0.8, quantity: [1, 2] },
    { itemId: 'mp_potion_small', chance: 0.2, quantity: [1, 1] },
  ],

  // ═══════════════════════════════════════
  // THORNWOOD — Lv.4-6 (materials + potions only)
  // ═══════════════════════════════════════
  wind_sprite: [
    { itemId: 'wind_essence', chance: 0.6, quantity: [1, 1] },
    { itemId: 'potion_medium', chance: 0.1, quantity: [1, 1] },
  ],
  rock_crawler: [
    { itemId: 'stone_fragment', chance: 0.8, quantity: [1, 2] },
    { itemId: 'potion_small', chance: 0.15, quantity: [1, 1] },
  ],
  bramble_boar: [
    { itemId: 'boar_tusk', chance: 0.7, quantity: [1, 2] },
    { itemId: 'bramble_core', chance: 0.1, quantity: [1, 1] },
    { itemId: 'potion_medium', chance: 0.3, quantity: [1, 1] },
  ],

  // ═══════════════════════════════════════
  // STORMCREST MOUNTAINS — Lv.5-8 (materials + potions only)
  // ═══════════════════════════════════════
  storm_hawk: [
    { itemId: 'hawk_feather', chance: 0.7, quantity: [1, 2] },
    { itemId: 'wind_essence', chance: 0.15, quantity: [1, 1] },
    { itemId: 'potion_medium', chance: 0.2, quantity: [1, 1] },
  ],
  stone_golem: [
    { itemId: 'stone_fragment', chance: 0.8, quantity: [2, 4] },
    { itemId: 'golem_core', chance: 0.25, quantity: [1, 1] },
    { itemId: 'potion_medium', chance: 0.15, quantity: [1, 1] },
  ],

  // ═══════════════════════════════════════
  // MISTMARSH SWAMP — Lv.8-10 (materials + potions only)
  // ═══════════════════════════════════════
  marsh_snapper: [
    { itemId: 'turtle_shell', chance: 0.6, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.25, quantity: [1, 1] },
    { itemId: 'mp_potion_small', chance: 0.15, quantity: [1, 1] },
  ],
  swamp_lurker: [
    { itemId: 'lurker_fang', chance: 0.65, quantity: [1, 2] },
    { itemId: 'wind_essence', chance: 0.1, quantity: [1, 1] },
    { itemId: 'potion_medium', chance: 0.2, quantity: [1, 1] },
  ],
  toxic_toad: [
    { itemId: 'toxic_slime', chance: 0.7, quantity: [1, 2] },
    { itemId: 'frog_leg', chance: 0.3, quantity: [1, 1] },
    { itemId: 'potion_medium', chance: 0.2, quantity: [1, 1] },
    { itemId: 'mp_potion_small', chance: 0.15, quantity: [1, 1] },
  ],

  // ═══════════════════════════════════════
  // VOLCANIC WASTES — Lv.15-25
  // Materials: 60-80%, Potions: 15-25%, Exclusive: 0.5-1%
  // ═══════════════════════════════════════
  lava_slime: [
    { itemId: 'lava_essence', chance: 0.75, quantity: [1, 3] },
    { itemId: 'potion_medium', chance: 0.25, quantity: [1, 1] },
  ],
  fire_salamander: [
    { itemId: 'salamander_scale', chance: 0.7, quantity: [1, 3] },
    { itemId: 'lava_essence', chance: 0.2, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.3, quantity: [1, 1] },
    { itemId: 'volcanic_fang', chance: 0.01, quantity: [1, 1] },
  ],
  magma_golem: [
    { itemId: 'magma_core', chance: 0.6, quantity: [1, 2] },
    { itemId: 'lava_essence', chance: 0.3, quantity: [1, 2] },
    { itemId: 'salamander_scale', chance: 0.25, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.35, quantity: [1, 1] },
    { itemId: 'lava_heart', chance: 0.008, quantity: [1, 1] },
  ],
  ember_hawk: [
    { itemId: 'lava_essence', chance: 0.65, quantity: [1, 3] },
    { itemId: 'salamander_scale', chance: 0.15, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.2, quantity: [1, 1] },
  ],

  // ═══════════════════════════════════════
  // CRYSTAL CAVERNS — Lv.25-35
  // Materials: 60-80%, Potions: 15-25%, Exclusive: 0.5-1%
  // ═══════════════════════════════════════
  crystal_spider: [
    { itemId: 'crystal_shard', chance: 0.7, quantity: [1, 3] },
    { itemId: 'gem_dust', chance: 0.15, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.2, quantity: [1, 1] },
    { itemId: 'crystal_edge', chance: 0.008, quantity: [1, 1] },
  ],
  gem_scorpion: [
    { itemId: 'gem_dust', chance: 0.75, quantity: [1, 3] },
    { itemId: 'crystal_shard', chance: 0.2, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.25, quantity: [1, 1] },
  ],
  prism_wraith: [
    { itemId: 'prism_core', chance: 0.55, quantity: [1, 2] },
    { itemId: 'crystal_shard', chance: 0.3, quantity: [1, 3] },
    { itemId: 'gem_dust', chance: 0.25, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.25, quantity: [1, 1] },
  ],
  diamond_golem: [
    { itemId: 'crystal_shard', chance: 0.8, quantity: [2, 4] },
    { itemId: 'prism_core', chance: 0.2, quantity: [1, 2] },
    { itemId: 'gem_dust', chance: 0.35, quantity: [1, 3] },
    { itemId: 'potion_medium', chance: 0.3, quantity: [1, 1] },
  ],

  // ═══════════════════════════════════════
  // SKY RUINS — Lv.35-45
  // Materials: 60-80%, Potions: 15-25%, Exclusive: 0.5-1%
  // ═══════════════════════════════════════
  storm_elemental: [
    { itemId: 'storm_essence', chance: 0.7, quantity: [1, 3] },
    { itemId: 'sky_feather', chance: 0.15, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.25, quantity: [1, 1] },
    { itemId: 'storm_shield', chance: 0.008, quantity: [1, 1] },
  ],
  cloud_serpent: [
    { itemId: 'sky_feather', chance: 0.75, quantity: [1, 3] },
    { itemId: 'storm_essence', chance: 0.2, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.3, quantity: [1, 1] },
  ],
  sky_knight: [
    { itemId: 'sky_feather', chance: 0.65, quantity: [1, 3] },
    { itemId: 'storm_essence', chance: 0.3, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.3, quantity: [1, 1] },
    { itemId: 'sky_talon', chance: 0.01, quantity: [1, 1] },
  ],
  thunder_bird: [
    { itemId: 'storm_essence', chance: 0.8, quantity: [1, 3] },
    { itemId: 'sky_feather', chance: 0.35, quantity: [1, 3] },
    { itemId: 'potion_medium', chance: 0.35, quantity: [1, 1] },
  ],

  // ═══════════════════════════════════════
  // THE ABYSS — Lv.45-55
  // Materials: 60-80%, Potions: 15-25%, Exclusive: 0.5-1%
  // ═══════════════════════════════════════
  void_stalker: [
    { itemId: 'void_essence', chance: 0.65, quantity: [1, 3] },
    { itemId: 'shadow_dust', chance: 0.2, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.3, quantity: [1, 1] },
    { itemId: 'abyssal_ring', chance: 0.008, quantity: [1, 1] },
  ],
  shadow_beast: [
    { itemId: 'shadow_dust', chance: 0.75, quantity: [1, 3] },
    { itemId: 'void_essence', chance: 0.25, quantity: [1, 2] },
    { itemId: 'potion_medium', chance: 0.3, quantity: [1, 1] },
    { itemId: 'shadow_cloak_rare', chance: 0.01, quantity: [1, 1] },
  ],
  abyssal_worm: [
    { itemId: 'void_essence', chance: 0.7, quantity: [1, 3] },
    { itemId: 'shadow_dust', chance: 0.3, quantity: [1, 3] },
    { itemId: 'potion_medium', chance: 0.35, quantity: [1, 1] },
  ],
  chaos_lord: [
    { itemId: 'chaos_core', chance: 0.6, quantity: [1, 2] },
    { itemId: 'void_essence', chance: 0.4, quantity: [1, 3] },
    { itemId: 'shadow_dust', chance: 0.35, quantity: [1, 3] },
    { itemId: 'potion_medium', chance: 0.4, quantity: [1, 1] },
  ],
};

module.exports = { ITEMS, LOOT_TABLES };
