// Zenithia — NPC Dialogue Data
// Full dialogue trees with conditions, reputation, quests

export const DIALOGUES = {
  elder_maren: {
    greeting: {
      stranger: 'Selamat datang, pemuda. Willowmere adalah rumah yang aman — setidaknya untuk sekarang.',
      friendly: 'Ah, {player_name}. Ada yang bisa kubantu hari ini?',
      trusted: 'Kamu sudah banyak membantu desa ini. Aku mulai percaya padamu.',
      honored: 'Kamu adalah salah satu yang terbaik yang pernah dimiliki Willowmere.',
    },
    topics: [
      {
        id: 'about_village',
        label: 'Tentang desa',
        requiredRep: 0,
        responses: {
          stranger: {
            text: 'Willowmere sudah damai selama 200 tahun. Kami hidup dari pertanian dan ikan dari Mist Creek. Tapi belakangan... ada yang aneh.',
            options: [
              { text: 'Aneh bagaimana?', next: 'village_anomaly' },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
      {
        id: 'about_adventurers',
        label: 'Tentang adventurer',
        requiredRep: 0,
        responses: {
          stranger: {
            text: 'Adventurer adalah kehormatan di sini. Setiap anak bermimpi menjadi Guardian suatu hari nanti. Tapi Guardian sudah menghilang 100 tahun lalu.',
            options: [
              { text: 'Kamu pernah jadi adventurer?', next: 'elder_past' },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
      {
        id: 'ask_for_quest',
        label: 'Ada yang perlu dibantu?',
        requiredRep: 0,
        responses: {
          stranger: {
            text: 'Pak Tani butuh bantuan di sawah. Bisakah kamu membantunya?',
            options: [
              { text: 'Tentu!', next: null, quest: 'harvest_help' },
              { text: 'Nanti aja', next: null },
            ],
          },
          friendly: {
            text: 'Ada beberapa hal yang perlu dilakukan. Miss Lira butuh latihan, dan Guard Ren butuh bantuan jaga gerbang.',
            options: [
              { text: 'Latihan Lira', next: null, quest: 'train_lira' },
              { text: 'Bantu Ren', next: null, quest: 'guard_patrol' },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
    ],
    subDialogues: {
      village_anomaly: {
        text: 'Beberapa petani melaporkan tanah mereka menjadi lebih subur dari biasanya. Tapi ada yang bilang melihat cahaya aneh di hutan malam-malam.',
        options: [
          { text: 'Mungkin cuma khayalan?', next: 'village_anomaly_2' },
          { text: 'Kembali', next: null },
        ],
      },
      village_anomaly_2: {
        text: 'Mungkin. Tapi aku sudah tua, dan aku tahu... ada sesuatu yang berubah. Hati-hati di hutan.',
        options: [
          { text: 'Aku akan hati-hati', next: null, reputation: 1 },
        ],
      },
      elder_past: {
        text: '*tersenyum pahit* Dulu. Tapi itu sudah lama. Sekarang tugasku hanya menjaga desa ini.',
        options: [
          { text: 'Kamu hebat, Elder.', next: null, reputation: 1 },
        ],
      },
    },
  },

  miss_lira: {
    greeting: {
      stranger: 'Hei! Kamu adventurer baru ya? Aku Lira! Aku belum pernah keluar desa, tapi suatu hari aku mau jadi adventurer juga!',
      friendly: 'Hei {player_name}! Mau latihan bareng hari ini?',
      trusted: 'Kamu... mengingatkan aku pada sesuatu yang baik.',
    },
    topics: [
      {
        id: 'train_lira',
        label: 'Latihan bareng',
        requiredRep: 0,
        responses: {
          stranger: {
            text: 'Serius?! Ayo! Tapi jangan sakitin aku ya, hehe!',
            options: [
              { text: 'Siap!', next: null, quest: 'train_lira' },
              { text: 'Nanti aja', next: null },
            ],
          },
        },
      },
      {
        id: 'about_her_dream',
        label: 'Impianmu',
        requiredRep: 5,
        responses: {
          friendly: {
            text: 'Aku ingin melihat dunia di luar Willowmere. Tapi Elder bilang aku harus lebih kuat dulu.',
            options: [
              { text: 'Kamu pasti bisa!', next: 'lira_dream_2', reputation: 1 },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
    ],
    subDialogues: {
      lira_dream_2: {
        text: 'Makasih... *pipi merah* Kamu orang pertama yang benar-benar mendengarkanku.',
        options: [
          { text: 'Sama-sama, Lira.', next: null, reputation: 1 },
        ],
      },
    },
  },

  sir_gendut: {
    greeting: {
      stranger: 'Halo! Butuh obat atau alat? Sir Gendut punya semua!',
      friendly: 'Kembali lagi! Mau lihat barang baru?',
    },
    topics: [
      {
        id: 'buy_potions',
        label: 'Beli potion',
        requiredRep: 0,
        responses: {
          stranger: {
            text: 'Potion kecil 50 gold, potion besar 200 gold. Murah meriah!',
            options: [
              { text: 'Beli potion kecil', next: null, buy: 'potion_small' },
              { text: 'Beli potion besar', next: null, buy: 'potion_large' },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
      {
        id: 'news',
        label: 'Ada berita?',
        requiredRep: 3,
        responses: {
          friendly: {
            text: 'Katanya di Emerald Plains ada caravan yang diserang Bramble Boar. Hati-hati kalau ke sana.',
            options: [
              { text: 'Terima kasih infonya', next: null },
            ],
          },
        },
      },
    ],
  },

  guard_ren: {
    greeting: {
      stranger: '*menguap* Hari yang tenang. Semoga terus begini.',
      friendly: 'Kamu lagi, {player_name}. Hari ini lebih tenang dari kemarin.',
    },
    topics: [
      {
        id: 'training',
        label: 'Latihan combat',
        requiredRep: 3,
        responses: {
          friendly: {
            text: 'Kamu mau belajar? Oke. Tapi ingat — kekuatan tanpa perlindungan itu bunuh diri.',
            options: [
              { text: 'Ajarin aku!', next: null, quest: 'guard_training' },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
      {
        id: 'about_corruption',
        label: 'Tentang corruption',
        requiredRep: 10,
        responses: {
          trusted: {
            text: 'Kamu... mengingatkan aku pada seseorang. Dia juga seorang Guardian. Tapi dia pergi dan tidak pernah kembali.',
            options: [
              { text: 'Siapa dia?', next: 'ren_mystery' },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
    ],
    subDialogues: {
      ren_mystery: {
        text: '...Aku tidak bisa ceritakan sekarang. Tapi kalau kamu terus menjadi seperti ini, suatu hari aku akan memberitahumu.',
        options: [
          { text: 'Aku tunggu.', next: null, reputation: 2 },
        ],
      },
    },
  },

  mr_tani: {
    greeting: {
      stranger: 'Hari yang panas untuk panen. Kamu mau bantu?',
      friendly: 'Anak muda! Sawah hari ini subur sekali.',
    },
    topics: [
      {
        id: 'harvest',
        label: 'Bantu panen',
        requiredRep: 0,
        responses: {
          stranger: {
            text: 'Bagus! Kumpulkan 10 sayur dari sawah. Hati-hati ada Moss Beetle.',
            options: [
              { text: 'Siap!', next: null, quest: 'harvest_help' },
              { text: 'Nanti aja', next: null },
            ],
          },
        },
      },
      {
        id: 'about_aether',
        label: 'Tentang tanah',
        requiredRep: 5,
        responses: {
          friendly: {
            text: 'Aku gak tahu namanya, tapi belakangan tanah ini... hidup. Sayur tumbuh lebih cepat, lebih besar.',
            options: [
              { text: 'Menarik...', next: null, reputation: 1 },
            ],
          },
        },
      },
    ],
  },

  mrs_ningsih: {
    greeting: {
      stranger: 'Mau makan? Mrs. Ningsih masak nasi goreng spesial hari ini!',
      friendly: '{player_name}! Sudah makan hari ini?',
    },
    topics: [
      {
        id: 'buy_food',
        label: 'Beli makanan',
        requiredRep: 0,
        responses: {
          stranger: {
            text: 'Nasi goreng 30 gold, sup ayam 50 gold, kue 20 gold. Semuanya bikin semangat!',
            options: [
              { text: 'Nasi goreng', next: null, buy: 'nasi_goreng' },
              { text: 'Sup ayam', next: null, buy: 'sup_ayam' },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
    ],
  },

  kris: {
    greeting: {
      stranger: 'Hehe, kamu kelihatan baru di sini. Hati-hati ya...',
      friendly: '{player_name}! Mau lihat sesuatu yang keren?',
    },
    topics: [
      {
        id: 'prank',
        label: 'Lihat prank',
        requiredRep: 0,
        responses: {
          stranger: {
            text: 'Aku tadi naruh lumut di kursi Elder. Jangan bilang siapa-siapa ya!',
            options: [
              { text: 'Hehe, berani juga', next: null, reputation: 1 },
              { text: 'Jahat ah', next: 'kris_scolded' },
            ],
          },
        },
      },
    ],
    subDialogues: {
      kris_scolded: {
        text: 'Eh, bercanda kok... *nunduk*',
        options: [
          { text: 'Iya, bercanda juga', next: null },
        ],
      },
    },
  },

  herbalist_sari: {
    greeting: {
      stranger: 'Kamu... berbeda. Aku bisa merasakan sesuatu darimu.',
      friendly: 'Kembali, {player_name}. Aku punya sesuatu untukmu.',
    },
    topics: [
      {
        id: 'about_aether',
        label: 'Tentang Aether',
        requiredRep: 5,
        responses: {
          friendly: {
            text: 'Aether adalah napas dunia. Mengalir di bawah tanah, di dalam air, di udara. Kebanyakan orang gak bisa merasakannya.',
            options: [
              { text: 'Tapi kamu bisa?', next: 'sari_secret' },
              { text: 'Kembali', next: null },
            ],
          },
        },
      },
    ],
    subDialogues: {
      sari_secret: {
        text: '*terdiam sebentar* ...Ya. Aku bisa. Tapi jangan beritahu siapa pun.',
        options: [
          { text: 'Rahasia kita berdua', next: null, reputation: 2 },
        ],
      },
    },
  },
};
