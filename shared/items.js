// Zenithia — Item Data
// 1 name = 1 item (patent). Weapon/Armor/Shield/Pants/Boots = per job per tier. Ring/Accessory = universal.

const ITEMS = {
  // ═══════════════════════════════════════
  // CONSUMABLES
  // ═══════════════════════════════════════
  potion_small:      { name: 'Herb Potion',     type: 'consumable', description: 'Restores 30 HP',  healAmount: 30,  price: 50,  icon: { bg: 0xF44336, fg: 0xFFFFFF, symbol: '+' } },
  potion_medium:     { name: 'Healing Tonic',    type: 'consumable', description: 'Restores 80 HP',  healAmount: 80,  price: 200, icon: { bg: 0xE53935, fg: 0xFFFFFF, symbol: '++' } },
  mp_potion_small:   { name: 'Aether Dew',       type: 'consumable', description: 'Restores 20 MP',  manaAmount: 20,  price: 60,  icon: { bg: 0x2196F3, fg: 0xFFFFFF, symbol: '+' } },
  antidote:          { name: 'Antidote',         type: 'consumable', description: 'Cures poison',    curePoison: true, price: 40, icon: { bg: 0x4CAF50, fg: 0xFFFFFF, symbol: '!' } },
  willow_rice:       { name: 'Willowmere Rice',  type: 'consumable', description: 'HP+25, ATK+5% 60s', healAmount: 25, buff: { stat: 'atk', value: 0.05, duration: 60 }, price: 30, icon: { bg: 0xFF9800, fg: 0xFFF9C4, symbol: '~' } },
  chicken_stew:      { name: 'Chicken Stew',     type: 'consumable', description: 'HP+40, DEF+5% 60s', healAmount: 40, buff: { stat: 'def', value: 0.05, duration: 60 }, price: 50, icon: { bg: 0xFFC107, fg: 0xFFFFFF, symbol: '~' } },

  // ═══════════════════════════════════════
  // MATERIALS
  // ═══════════════════════════════════════
  moss_shell:      { name: 'Moss Shell',      type: 'material', description: 'Hard shell from Moss Beetle.',     price: 8,  icon: { bg: 0x4CAF50, fg: 0x81C784, symbol: '◆' } },
  thorn:           { name: 'Thorn',            type: 'material', description: 'Sharp thorn from Thorn Lizard.',    price: 12, icon: { bg: 0x689F38, fg: 0xCDDC39, symbol: '▲' } },
  dust_pouch:      { name: 'Dust Pouch',       type: 'material', description: 'Pouch of dust from Dust Mouse.',   price: 5,  icon: { bg: 0xBCAAA4, fg: 0xEFEBE9, symbol: '○' } },
  frog_leg:        { name: 'Frog Leg',         type: 'material', description: 'Leg of a Puddle Frog.',            price: 10, icon: { bg: 0x00BCD4, fg: 0xE0F7FA, symbol: '▬' } },
  wind_essence:    { name: 'Wind Essence',     type: 'material', description: 'Essence of wind from Wind Sprite.', price: 20, icon: { bg: 0x81D4FA, fg: 0xFFFFFF, symbol: '✦' } },
  stone_fragment:  { name: 'Stone Fragment',   type: 'material', description: 'Fragment from Rock Crawler.',       price: 15, icon: { bg: 0x9E9E9E, fg: 0xE0E0E0, symbol: '■' } },
  boar_tusk:       { name: 'Boar Tusk',        type: 'material', description: 'Large tusk from Bramble Boar.',     price: 30, icon: { bg: 0x5D4037, fg: 0xFFF9C4, symbol: '◄' } },
  bramble_core:    { name: 'Bramble Core',     type: 'material', description: 'Rare core from Bramble Boar.',      price: 50, icon: { bg: 0x33691E, fg: 0x76FF03, symbol: '◆' } },

  // ═══════════════════════════════════════
  // WEAPONS — Per job, 3 tiers
  // ═══════════════════════════════════════
  village_blade:    { name: 'Village Blade',    type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 1, stats: { atk: 3 },                price: 80,  icon: { bg: 0x8D6E63, fg: 0xBCAAA4, symbol: '/' } },
  ironclad_edge:    { name: 'Ironclad Edge',    type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 2, stats: { atk: 6, def: 2 },         price: 250, icon: { bg: 0x607D8B, fg: 0xB0BEC5, symbol: '/' } },
  guardian_cleaver: { name: 'Guardian Cleaver', type: 'equipment', slot: 'weapon', classReq: ['guardian'],     tier: 3, stats: { atk: 10, def: 4, hp: 20 }, price: 600, icon: { bg: 0x455A64, fg: 0xE0E0E0, symbol: '/' } },

  wind_cutter:      { name: 'Wind Cutter',      type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 1, stats: { atk: 4, spd: 2 },          price: 120, icon: { bg: 0x00BCD4, fg: 0x80DEEA, symbol: '/' } },
  plains_slicer:    { name: 'Plains Slicer',    type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 2, stats: { atk: 7, spd: 3, crit: 0.05 }, price: 350, icon: { bg: 0x00897B, fg: 0xB2DFDB, symbol: '/' } },
  tempest_dual:     { name: 'Tempest Dual',     type: 'equipment', slot: 'weapon', classReq: ['blade_dancer'], tier: 3, stats: { atk: 11, spd: 5, crit: 0.08, def: 1 }, price: 750, icon: { bg: 0x006064, fg: 0x84FFFF, symbol: '//' } },

  willow_staff:     { name: 'Willow Staff',     type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 1, stats: { atk: 2, mp: 15 },          price: 90,  icon: { bg: 0x795548, fg: 0xD7CCC8, symbol: '|' } },
  deepwood_rod:     { name: 'Deepwood Rod',     type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 2, stats: { atk: 5, mp: 30, spd: 2 },  price: 300, icon: { bg: 0x2E7D32, fg: 0xA5D6A7, symbol: '|' } },
  arcane_focus:     { name: 'Arcane Focus',     type: 'equipment', slot: 'weapon', classReq: ['sage'],         tier: 3, stats: { atk: 9, mp: 50, spd: 3, crit: 0.05 }, price: 700, icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '|' } },

  pilgrim_staff:    { name: 'Pilgrim Staff',    type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 1, stats: { atk: 2, mp: 10, hp: 10 },  price: 100, icon: { bg: 0xA1887F, fg: 0xEFEBE9, symbol: '|' } },
  shrine_scepter:   { name: 'Shrine Scepter',   type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 2, stats: { atk: 4, mp: 25, hp: 20 },  price: 320, icon: { bg: 0xF5F5F5, fg: 0xFFD600, symbol: '|' } },
  lightbringer_rod: { name: 'Lightbringer Rod', type: 'equipment', slot: 'weapon', classReq: ['cleric'],       tier: 3, stats: { atk: 7, mp: 45, hp: 35, def: 2 }, price: 680, icon: { bg: 0xFFF9C4, fg: 0xFFD600, symbol: '|' } },

  rusty_dagger:     { name: 'Rusty Dagger',     type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 1, stats: { atk: 4, crit: 0.05 },      price: 80,  icon: { bg: 0x616161, fg: 0xBDBDBD, symbol: '\\' } },
  nightfang:        { name: 'Nightfang',        type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 2, stats: { atk: 8, crit: 0.10, spd: 3 }, price: 450, icon: { bg: 0x212121, fg: 0xCE93D8, symbol: '\\' } },
  void_edge:        { name: 'Void Edge',        type: 'equipment', slot: 'weapon', classReq: ['shadow'],       tier: 3, stats: { atk: 12, crit: 0.15, spd: 5, def: 1 }, price: 800, icon: { bg: 0x0D0D0D, fg: 0x7B1FA2, symbol: '\\' } },

  // ═══════════════════════════════════════
  // ARMOR (body) — Per job, 3 tiers
  // ═══════════════════════════════════════
  guard_wrappings:     { name: 'Guard Wrappings',     type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 1, stats: { def: 3, hp: 10 },                price: 60,  icon: { bg: 0x78909C, fg: 0xCFD8DC, symbol: '□' } },
  moss_plate:          { name: 'Moss Plate',          type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 2, stats: { def: 6, hp: 25, spd: -1 },       price: 280, icon: { bg: 0x33691E, fg: 0x81C784, symbol: '□' } },
  bramble_mail:        { name: 'Bramble Mail',        type: 'equipment', slot: 'armor', classReq: ['guardian'],     tier: 3, stats: { def: 10, hp: 50, spd: -2, atk: 2 }, price: 650, icon: { bg: 0x5D4037, fg: 0xA1887F, symbol: '□' } },

  dancer_wrap:         { name: 'Dancer Wrap',         type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 1, stats: { def: 2, spd: 2 },                 price: 70,  icon: { bg: 0xE91E63, fg: 0xF8BBD0, symbol: '□' } },
  plains_leather:      { name: 'Plains Leather',      type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 2, stats: { def: 4, spd: 3, atk: 1 },         price: 300, icon: { bg: 0xC62828, fg: 0xEF9A9A, symbol: '□' } },
  storm_shroud:        { name: 'Storm Shroud',        type: 'equipment', slot: 'armor', classReq: ['blade_dancer'], tier: 3, stats: { def: 7, spd: 5, atk: 3, crit: 0.03 }, price: 700, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '□' } },

  sage_robe:           { name: 'Sage Robe',           type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 1, stats: { def: 2, mp: 15 },                 price: 80,  icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '□' } },
  deepwood_vestment:   { name: 'Deepwood Vestment',   type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 2, stats: { def: 3, mp: 30, spd: 2 },         price: 320, icon: { bg: 0x1B5E20, fg: 0x81C784, symbol: '□' } },
  arcane_mantle:       { name: 'Arcane Mantle',       type: 'equipment', slot: 'armor', classReq: ['sage'],         tier: 3, stats: { def: 5, mp: 50, spd: 3, atk: 2 }, price: 720, icon: { bg: 0x311B92, fg: 0xB39DDB, symbol: '□' } },

  healer_wraps:        { name: 'Healer Wraps',        type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 1, stats: { def: 2, hp: 15, mp: 10 },         price: 75,  icon: { bg: 0xF5F5F5, fg: 0xFFECB3, symbol: '□' } },
  shrine_vestment:     { name: 'Shrine Vestment',     type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 2, stats: { def: 4, hp: 30, mp: 25 },         price: 340, icon: { bg: 0xFFD600, fg: 0xFFF9C4, symbol: '□' } },
  lightweave_raiment:  { name: 'Lightweave Raiment',  type: 'equipment', slot: 'armor', classReq: ['cleric'],       tier: 3, stats: { def: 6, hp: 50, mp: 40, spd: 1 }, price: 750, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '□' } },

  shadow_wraps:        { name: 'Shadow Wraps',        type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 1, stats: { def: 2, spd: 3, crit: 0.02 },     price: 85,  icon: { bg: 0x212121, fg: 0x616161, symbol: '□' } },
  nightstalker_gear:   { name: 'Nightstalker Gear',   type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 2, stats: { def: 4, spd: 4, crit: 0.05, atk: 2 }, price: 400, icon: { bg: 0x1A1A1A, fg: 0x424242, symbol: '□' } },
  void_cloak:          { name: 'Void Cloak',          type: 'equipment', slot: 'armor', classReq: ['shadow'],       tier: 3, stats: { def: 6, spd: 6, crit: 0.08, atk: 4, hp: 15 }, price: 820, icon: { bg: 0x0D0D0D, fg: 0x4A148C, symbol: '□' } },

  // ═══════════════════════════════════════
  // PANTS — Per job, 3 tiers
  // ═══════════════════════════════════════
  guard_leggings:     { name: 'Guard Leggings',     type: 'equipment', slot: 'pants', classReq: ['guardian'],     tier: 1, stats: { def: 2 },                      price: 40,  icon: { bg: 0x78909C, fg: 0xCFD8DC, symbol: '▽' } },
  iron_greaves:       { name: 'Iron Greaves',       type: 'equipment', slot: 'pants', classReq: ['guardian'],     tier: 2, stats: { def: 5, hp: 15 },               price: 200, icon: { bg: 0x546E7A, fg: 0xB0BEC5, symbol: '▽' } },
  bramble_legplates:  { name: 'Bramble Legplates',  type: 'equipment', slot: 'pants', classReq: ['guardian'],     tier: 3, stats: { def: 8, hp: 30, atk: 1 },       price: 450, icon: { bg: 0x5D4037, fg: 0xA1887F, symbol: '▽' } },

  dancer_pants:       { name: 'Dancer Pants',       type: 'equipment', slot: 'pants', classReq: ['blade_dancer'], tier: 1, stats: { def: 1, spd: 2 },                price: 50,  icon: { bg: 0xE91E63, fg: 0xF8BBD0, symbol: '▽' } },
  plains_legguards:   { name: 'Plains Legguards',   type: 'equipment', slot: 'pants', classReq: ['blade_dancer'], tier: 2, stats: { def: 3, spd: 3, atk: 1 },        price: 220, icon: { bg: 0xC62828, fg: 0xEF9A9A, symbol: '▽' } },
  storm_legplates:    { name: 'Storm Legplates',    type: 'equipment', slot: 'pants', classReq: ['blade_dancer'], tier: 3, stats: { def: 5, spd: 4, atk: 2, crit: 0.02 }, price: 480, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '▽' } },

  sage_slacks:        { name: 'Sage Slacks',        type: 'equipment', slot: 'pants', classReq: ['sage'],         tier: 1, stats: { def: 1, mp: 8 },                 price: 45,  icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '▽' } },
  deepwood_legwraps:  { name: 'Deepwood Legwraps',  type: 'equipment', slot: 'pants', classReq: ['sage'],         tier: 2, stats: { def: 2, mp: 20, spd: 1 },        price: 230, icon: { bg: 0x1B5E20, fg: 0x81C784, symbol: '▽' } },
  arcane_legguards:   { name: 'Arcane Legguards',   type: 'equipment', slot: 'pants', classReq: ['sage'],         tier: 3, stats: { def: 4, mp: 35, spd: 2, atk: 1 }, price: 500, icon: { bg: 0x311B92, fg: 0xB39DDB, symbol: '▽' } },

  healer_legwraps:    { name: 'Healer Legwraps',    type: 'equipment', slot: 'pants', classReq: ['cleric'],       tier: 1, stats: { def: 1, hp: 8, mp: 5 },          price: 50,  icon: { bg: 0xF5F5F5, fg: 0xFFECB3, symbol: '▽' } },
  shrine_legguards:   { name: 'Shrine Legguards',   type: 'equipment', slot: 'pants', classReq: ['cleric'],       tier: 2, stats: { def: 3, hp: 18, mp: 12 },        price: 240, icon: { bg: 0xFFD600, fg: 0xFFF9C4, symbol: '▽' } },
  lightweave_legs:    { name: 'Lightweave Legs',    type: 'equipment', slot: 'pants', classReq: ['cleric'],       tier: 3, stats: { def: 5, hp: 30, mp: 25, spd: 1 }, price: 520, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '▽' } },

  shadow_leggings:    { name: 'Shadow Leggings',    type: 'equipment', slot: 'pants', classReq: ['shadow'],       tier: 1, stats: { def: 1, spd: 3, crit: 0.01 },    price: 55,  icon: { bg: 0x212121, fg: 0x616161, symbol: '▽' } },
  nightstalker_legs:  { name: 'Nightstalker Legs',  type: 'equipment', slot: 'pants', classReq: ['shadow'],       tier: 2, stats: { def: 2, spd: 4, crit: 0.03, atk: 1 }, price: 260, icon: { bg: 0x1A1A1A, fg: 0x424242, symbol: '▽' } },
  void_legguards:     { name: 'Void Legguards',     type: 'equipment', slot: 'pants', classReq: ['shadow'],       tier: 3, stats: { def: 4, spd: 5, crit: 0.05, atk: 3 }, price: 550, icon: { bg: 0x0D0D0D, fg: 0x4A148C, symbol: '▽' } },

  // ═══════════════════════════════════════
  // BOOTS — Per job, 3 tiers
  // ═══════════════════════════════════════
  guard_boots:        { name: 'Guard Boots',        type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 1, stats: { def: 1, spd: 1 },                price: 35,  icon: { bg: 0x5D4037, fg: 0xA1887F, symbol: '=' } },
  iron_sabatons:      { name: 'Iron Sabatons',      type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 2, stats: { def: 3, spd: 1, hp: 10 },        price: 180, icon: { bg: 0x455A64, fg: 0xB0BEC5, symbol: '=' } },
  guardian_treads:    { name: 'Guardian Treads',    type: 'equipment', slot: 'boots', classReq: ['guardian'],     tier: 3, stats: { def: 5, spd: 2, hp: 20, atk: 1 }, price: 420, icon: { bg: 0x37474F, fg: 0xCFD8DC, symbol: '=' } },

  dancer_shoes:       { name: 'Dancer Shoes',       type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 1, stats: { spd: 3 },                         price: 45,  icon: { bg: 0xE91E63, fg: 0xF8BBD0, symbol: '=' } },
  plains_treads:      { name: 'Plains Treads',      type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 2, stats: { spd: 5, def: 1, atk: 1 },         price: 210, icon: { bg: 0xC62828, fg: 0xEF9A9A, symbol: '=' } },
  storm_stride:       { name: 'Storm Stride',       type: 'equipment', slot: 'boots', classReq: ['blade_dancer'], tier: 3, stats: { spd: 7, def: 2, atk: 2, crit: 0.02 }, price: 460, icon: { bg: 0x880E4F, fg: 0xF48FB1, symbol: '=' } },

  sage_sandals:       { name: 'Sage Sandals',       type: 'equipment', slot: 'boots', classReq: ['sage'],         tier: 1, stats: { spd: 2, mp: 5 },                  price: 40,  icon: { bg: 0x4A148C, fg: 0xCE93D8, symbol: '=' } },
  deepwood_walkers:   { name: 'Deepwood Walkers',   type: 'equipment', slot: 'boots', classReq: ['sage'],         tier: 2, stats: { spd: 3, mp: 12, def: 1 },         price: 220, icon: { bg: 0x1B5E20, fg: 0x81C784, symbol: '=' } },
  arcane_treads:      { name: 'Arcane Treads',      type: 'equipment', slot: 'boots', classReq: ['sage'],         tier: 3, stats: { spd: 5, mp: 20, def: 2, atk: 1 }, price: 480, icon: { bg: 0x311B92, fg: 0xB39DDB, symbol: '=' } },

  healer_sandals:     { name: 'Healer Sandals',     type: 'equipment', slot: 'boots', classReq: ['cleric'],       tier: 1, stats: { spd: 1, hp: 5, mp: 5 },           price: 45,  icon: { bg: 0xF5F5F5, fg: 0xFFECB3, symbol: '=' } },
  shrine_treads:      { name: 'Shrine Treads',      type: 'equipment', slot: 'boots', classReq: ['cleric'],       tier: 2, stats: { spd: 2, hp: 12, mp: 10, def: 1 }, price: 230, icon: { bg: 0xFFD600, fg: 0xFFF9C4, symbol: '=' } },
  lightweave_step:    { name: 'Lightweave Step',    type: 'equipment', slot: 'boots', classReq: ['cleric'],       tier: 3, stats: { spd: 3, hp: 20, mp: 18, def: 2 }, price: 500, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '=' } },

  shadow_boots:       { name: 'Shadow Boots',       type: 'equipment', slot: 'boots', classReq: ['shadow'],       tier: 1, stats: { spd: 3, crit: 0.01 },             price: 50,  icon: { bg: 0x212121, fg: 0x616161, symbol: '=' } },
  nightstalker_step:  { name: 'Nightstalker Step',  type: 'equipment', slot: 'boots', classReq: ['shadow'],       tier: 2, stats: { spd: 5, crit: 0.03, def: 1 },     price: 250, icon: { bg: 0x1A1A1A, fg: 0x424242, symbol: '=' } },
  void_stride:        { name: 'Void Stride',        type: 'equipment', slot: 'boots', classReq: ['shadow'],       tier: 3, stats: { spd: 7, crit: 0.05, def: 2, atk: 1 }, price: 530, icon: { bg: 0x0D0D0D, fg: 0x4A148C, symbol: '=' } },

  // ═══════════════════════════════════════
  // SHIELD — Guardian & Cleric, 3 tiers
  // ═══════════════════════════════════════
  wooden_buckler:     { name: 'Wooden Buckler',     type: 'equipment', slot: 'shield', classReq: ['guardian', 'cleric'], tier: 1, stats: { def: 3 },                    price: 60,  icon: { bg: 0x6D4C41, fg: 0xA1887F, symbol: '◎' } },
  iron_wall:          { name: 'Iron Wall',          type: 'equipment', slot: 'shield', classReq: ['guardian'],             tier: 2, stats: { def: 8, hp: 30 },           price: 400, icon: { bg: 0x455A64, fg: 0xCFD8DC, symbol: '◎' } },
  guardian_aegis:     { name: 'Guardian Aegis',     type: 'equipment', slot: 'shield', classReq: ['guardian'],             tier: 3, stats: { def: 14, hp: 60, atk: 2 },  price: 800, icon: { bg: 0x1565C0, fg: 0x90CAF9, symbol: '◎' } },
  holy_buckler:       { name: 'Holy Buckler',       type: 'equipment', slot: 'shield', classReq: ['cleric'],               tier: 2, stats: { def: 6, hp: 20, mp: 10 },   price: 350, icon: { bg: 0xFFD600, fg: 0xFFF9C4, symbol: '◎' } },
  lightward_aegis:    { name: 'Lightward Aegis',    type: 'equipment', slot: 'shield', classReq: ['cleric'],               tier: 3, stats: { def: 10, hp: 40, mp: 20 },  price: 720, icon: { bg: 0xFFF176, fg: 0xFFFFFF, symbol: '◎' } },

  // ═══════════════════════════════════════
  // RINGS — Universal (all jobs)
  // ═══════════════════════════════════════
  copper_band:        { name: 'Copper Band',        type: 'equipment', slot: 'ring', stats: { hp: 10 },                        price: 50,  icon: { bg: 0xBF360C, fg: 0xFF8A65, symbol: '○' } },
  wind_charm:         { name: 'Wind Charm',         type: 'equipment', slot: 'ring', stats: { spd: 3, atk: 1 },                 price: 120, icon: { bg: 0x00ACC1, fg: 0x80DEEA, symbol: '○' } },
  moonstone_ring:     { name: 'Moonstone Ring',     type: 'equipment', slot: 'ring', stats: { mp: 20, hp: 10 },                 price: 180, icon: { bg: 0x7B1FA2, fg: 0xCE93D8, symbol: '○' } },
  aether_pendant:     { name: 'Aether Pendant',     type: 'equipment', slot: 'ring', stats: { mp: 25, hp: 15, atk: 2 },         price: 350, icon: { bg: 0x7B1FA2, fg: 0xCE93D8, symbol: '○' } },
  guardian_signet:    { name: 'Guardian Signet',    type: 'equipment', slot: 'ring', stats: { def: 3, hp: 25, atk: 2, spd: 1 }, price: 500, icon: { bg: 0x1565C0, fg: 0x90CAF9, symbol: '○' } },

  // ═══════════════════════════════════════
  // ACCESSORIES (Back) — Universal (all jobs)
  // ═══════════════════════════════════════
  travel_pack:        { name: 'Travel Pack',        type: 'equipment', slot: 'accessory', stats: { hp: 10 },                  price: 60,  icon: { bg: 0x795548, fg: 0xBCAAA4, symbol: '◯' } },
  wind_cloak:         { name: 'Wind Cloak',         type: 'equipment', slot: 'accessory', stats: { spd: 3, def: 1 },           price: 200, icon: { bg: 0x00BCD4, fg: 0x80DEEA, symbol: '◯' } },
  bramble_cape:       { name: 'Bramble Cape',       type: 'equipment', slot: 'accessory', stats: { def: 4, hp: 20, atk: 1 },   price: 400, icon: { bg: 0x33691E, fg: 0x81C784, symbol: '◯' } },
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
