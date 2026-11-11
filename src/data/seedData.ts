import {
  CampusLocation,
  Category,
  MasterProduct,
  Store,
  StoreProduct,
  Reservation,
  Review,
  Report,
  SearchLog,
  ActivityLog,
  User,
} from '../types';

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'device_gps',
    name: 'Lokasi GPS Saya Saat Ini (Akurat)',
    campus: 'Titik GPS Perangkat',
    city: 'Bandung',
    lat: -6.9110,
    lng: 107.6177,
    description: 'Titik koordinat GPS akurat perangkat Anda'
  },
  {
    id: 'tembalang',
    name: 'Tembalang (Banjarsari / Sirojudin)',
    campus: 'Universitas Diponegoro',
    city: 'Semarang',
    lat: -7.0505,
    lng: 110.4372,
    description: 'Pusat kos mahasiswa Undip & Polines'
  },
  {
    id: 'pogung',
    name: 'Pogung Kidul & Baru',
    campus: 'Universitas Gadjah Mada',
    city: 'Yogyakarta',
    lat: -7.7681,
    lng: 110.3778,
    description: 'Kawasan kos padat mahasiswa UGM & UNY'
  },
  {
    id: 'jatinangor',
    name: 'Jatinangor (Sayang / Ciseke)',
    campus: 'UNPAD & ITB Jatinangor',
    city: 'Sumedang',
    lat: -6.9272,
    lng: 107.7735,
    description: 'Sentra kos mahasiswa Unpad & ITB'
  },
  {
    id: 'kukusan',
    name: 'Kukusan Kelurahan & Margonda',
    campus: 'Universitas Indonesia',
    city: 'Depok',
    lat: -6.3683,
    lng: 106.8286,
    description: 'Akses gerbang kukel & margonda UI'
  },
  {
    id: 'cisitu',
    name: 'Cisitu & Dipatiukur',
    campus: 'ITB & UNPAD Dipatiukur',
    city: 'Bandung',
    lat: -6.8915,
    lng: 107.6106,
    description: 'Pusat kos mahasiswa ITB'
  }
];

export const CATEGORIES: Category[] = [
  { id: 'cat_instant', name: 'Mie & Makanan Cepat', icon: 'Soup' },
  { id: 'cat_sembako', name: 'Beras, Telur & Minyak', icon: 'Egg' },
  { id: 'cat_minuman', name: 'Minuman Dingin & Kopi', icon: 'Coffee' },
  { id: 'cat_snack', name: 'Snack & Camilan Begadang', icon: 'Cookie' },
  { id: 'cat_mandi', name: 'Sabun & Kebersihan Kos', icon: 'Sparkles' },
  { id: 'cat_obat', name: 'Obat Ringan & P3K', icon: 'HeartPulse' }
];

export const USERS: User[] = [
  {
    id: 'usr_customer_1',
    name: 'Dimas Wicaksono',
    email: 'dimas@student.ac.id',
    role: 'customer',
    phone: '0812-9876-5432',
    address: 'Kos Pondok Asri No. 14, Tembalang'
  },
  {
    id: 'usr_merchant_1',
    name: 'Pak Slamet Riyadi',
    email: 'slamet@warungmadura.com',
    role: 'merchant',
    phone: '0857-1122-3344',
    address: 'Jl. Banjarsari Raya No. 42'
  },
  {
    id: 'usr_admin_1',
    name: 'Admin WarLok Pusat',
    email: 'admin@warlok.id',
    role: 'admin',
    phone: '0800-1-WARLOK'
  }
];

export const MASTER_PRODUCTS: MasterProduct[] = [
  {
    id: 'mp_indomie_goreng',
    category_id: 'cat_instant',
    name: 'Indomie Goreng Spesial',
    brand: 'Indofood',
    unit: 'Bungkus (85g)',
    description: 'Mie instan goreng legendaris nomor satu anak kos.',
    suggested_price: 3500
  },
  {
    id: 'mp_indomie_kari',
    category_id: 'cat_instant',
    name: 'Indomie Kuah Kari Ayam',
    brand: 'Indofood',
    unit: 'Bungkus (72g)',
    description: 'Kuah kari kental gurih, cocok saat hujan atau lapar malam.',
    suggested_price: 3500
  },
  {
    id: 'mp_sedaap_goreng',
    category_id: 'cat_instant',
    name: 'Mie Sedaap Goreng Kriuk',
    brand: 'Wings Food',
    unit: 'Bungkus (90g)',
    description: 'Dilengkapi kriuk-kriuk bawang goreng gurih renyah.',
    suggested_price: 3300
  },
  {
    id: 'mp_popmie_pedas',
    category_id: 'cat_instant',
    name: 'Pop Mie Pedas Dower',
    brand: 'Indofood',
    unit: 'Cup (75g)',
    description: 'Tinggal seduh air panas di kos, pedas nampol.',
    suggested_price: 6000
  },
  {
    id: 'mp_telur_kg',
    category_id: 'cat_sembako',
    name: 'Telur Ayam Negeri Segar',
    brand: 'Lokal Peternak',
    unit: '1 Kilogram (isi 16 butir)',
    description: 'Telur segar pilihan, kaya protein untuk stok harian.',
    suggested_price: 28000
  },
  {
    id: 'mp_telur_setengah',
    category_id: 'cat_sembako',
    name: 'Telur Ayam Negeri',
    brand: 'Lokal Peternak',
    unit: '1/2 Kilogram (isi 8 butir)',
    description: 'Porsi hemat pas buat persediaan 3-4 hari di kos.',
    suggested_price: 14500
  },
  {
    id: 'mp_beras_1kg',
    category_id: 'cat_sembako',
    name: 'Beras Ramos Setra Pulen',
    brand: 'Ramos Super',
    unit: '1 Kilogram',
    description: 'Beras putih bersih pulen tanpa pemutih & pengawet.',
    suggested_price: 15000
  },
  {
    id: 'mp_minyak_goreng_1l',
    category_id: 'cat_sembako',
    name: 'Minyak Goreng Minyakita Pouch',
    brand: 'Minyakita',
    unit: 'Pouch 1 Liter',
    description: 'Minyak goreng kelapa sawit higienis subsidi pemerintah.',
    suggested_price: 16500
  },
  {
    id: 'mp_le_minerale_600',
    category_id: 'cat_minuman',
    name: 'Le Minerale Botol Dingin',
    brand: 'Mayora',
    unit: 'Botol 600ml',
    description: 'Air mineral alami dengan rasa manis khas pegunungan.',
    suggested_price: 3500
  },
  {
    id: 'mp_aqua_600',
    category_id: 'cat_minuman',
    name: 'AQUA Air Mineral Dingin',
    brand: 'Danone AQUA',
    unit: 'Botol 600ml',
    description: 'Air mineral murni pegunungan sejuk dari kulkas warung.',
    suggested_price: 4000
  },
  {
    id: 'mp_teh_pucuk',
    category_id: 'cat_minuman',
    name: 'Teh Pucuk Harum Dingin',
    brand: 'Mayora',
    unit: 'Botol 350ml',
    description: 'Teh melati manis segar dingin peneman makan siang.',
    suggested_price: 4000
  },
  {
    id: 'mp_kopi_kapal_api',
    category_id: 'cat_minuman',
    name: 'Kopi Kapal Api Special Mix',
    brand: 'Kapal Api',
    unit: 'Renceng (10 Sachet)',
    description: 'Kopi hitam plus gula mantap untuk begadang nugas.',
    suggested_price: 15000
  },
  {
    id: 'mp_chitato_lite',
    category_id: 'cat_snack',
    name: 'Chitato Lite Rumput Laut',
    brand: 'Indofood',
    unit: 'Bungkus (68g)',
    description: 'Keripik kentang tipis renyah rasa nori.',
    suggested_price: 11000
  },
  {
    id: 'mp_nabati_wafer',
    category_id: 'cat_snack',
    name: 'Nabati Wafer Keju Richeese',
    brand: 'Nabati',
    unit: 'Bungkus (132g)',
    description: 'Wafer renyah dengan krim keju gurih melimpah.',
    suggested_price: 8500
  },
  {
    id: 'mp_sabun_lifebuoy',
    category_id: 'cat_mandi',
    name: 'Sabun Batang Lifebuoy Total 10',
    brand: 'Unilever',
    unit: 'Batang (110g)',
    description: 'Perlindungan kuman antibakteri harian.',
    suggested_price: 5000
  },
  {
    id: 'mp_daia_deterjen',
    category_id: 'cat_mandi',
    name: 'Daia Deterjen Bubuk Bunga',
    brand: 'Wings',
    unit: 'Bungkus (250g)',
    description: 'Deterjen wangi semerbak, cuci baju manual di kosan.',
    suggested_price: 6500
  },
  {
    id: 'mp_tolak_angin',
    category_id: 'cat_obat',
    name: 'Tolak Angin Cair Herbal',
    brand: 'Sido Muncul',
    unit: 'Sachet (15ml)',
    description: 'Penyelamat anak kos saat masuk angin, meriang & capek.',
    suggested_price: 4500
  },
  {
    id: 'mp_panadol_extra',
    category_id: 'cat_obat',
    name: 'Panadol Extra Merah',
    brand: 'GSK',
    unit: 'Strip (10 Kaplet)',
    description: 'Meredakan sakit kepala tegang saat skripsi atau ujian.',
    suggested_price: 14000
  }
];

// Stores around User GPS Center (-6.9110, 107.6177)
export const STORES: Store[] = [
  {
    id: 'str_madura_berkah',
    owner_id: 'usr_merchant_1',
    owner_name: 'Pak Slamet Riyadi',
    name: 'Warung Madura Berkah 24 Jam',
    description: 'Buka nonstop 24 jam! Sedia sembako lengkap, rokok, minuman dingin, es batu kristal, gas 3kg, dan bensin eceran.',
    address: 'Jl. Sekitar Lokasi GPS No. 42 (115m dari titik Anda)',
    lat: -6.9102,
    lng: 107.6184,
    status: 'active',
    verified_at: '2026-01-15T10:00:00.000Z',
    phone: '0857-1122-3344',
    opening_hours: '24 Jam Nonstop',
    rating: 4.8,
    total_reviews: 42
  },
  {
    id: 'str_kelontong_bu_sri',
    owner_id: 'usr_sri_wati',
    owner_name: 'Ibu Sri Watiningsih',
    name: 'Toko Kelontong Barokah Bu Sri',
    description: 'Spesialis telur segar langsung peternak, beras pulen Delanggu, minyak curah & kemasan, bumbu dapur dan sabun murah.',
    address: 'Gang Melati No. 8 (125m dari titik Anda)',
    lat: -6.9118,
    lng: 107.6169,
    status: 'active',
    verified_at: '2026-01-20T14:30:00.000Z',
    phone: '0813-8877-6655',
    opening_hours: '06.00 - 22.00 WIB',
    rating: 4.7,
    total_reviews: 29
  },
  {
    id: 'str_sembako_makmur',
    owner_id: 'usr_makmur_adi',
    owner_name: 'H. Makmur Subagyo',
    name: 'Warung Sembako Kos Makmur',
    description: 'Pusat belanja sembako hemat mahasiswa. Ada mie instan lengkap semua varian, biskuit, tolak angin, dan air galon AQUA.',
    address: 'Jl. Raya Kosan No. 19B (205m dari titik Anda)',
    lat: -6.9096,
    lng: 107.6165,
    status: 'active',
    verified_at: '2026-02-01T09:15:00.000Z',
    phone: '0819-2233-4455',
    opening_hours: '06.30 - 23.30 WIB',
    rating: 4.6,
    total_reviews: 35
  },
  {
    id: 'str_pojok_mahasiswa',
    owner_id: 'usr_anton_wijaya',
    owner_name: 'Mas Anton',
    name: 'Toko Pojok Mahasiswa',
    description: 'Warung serba ada dekat gerbang kos putri. Tersedia ATK ringan, cemilan impor, minuman boba sachet, deterjen, dan pembalut.',
    address: 'Jl. Pojok Asri I No. 12 (220m dari titik Anda)',
    lat: -6.9124,
    lng: 107.6191,
    status: 'active',
    verified_at: '2026-02-10T11:00:00.000Z',
    phone: '0878-3344-9900',
    opening_hours: '07.00 - 23.00 WIB',
    rating: 4.5,
    total_reviews: 18
  },
  {
    id: 'str_alfalah_24',
    owner_id: 'usr_hasan_bisri',
    owner_name: 'Cak Hasan',
    name: 'Warung Madura Al-Falah',
    description: 'Warung Madura dekat persimpangan jalan. Es kristal siap banyak, token listrik, pulsa, Indomie, sabun cuci.',
    address: 'Jl. Raya Utama No. 101 (320m dari titik Anda)',
    lat: -6.9088,
    lng: 107.6196,
    status: 'active',
    verified_at: '2026-02-18T16:20:00.000Z',
    phone: '0822-4455-6677',
    opening_hours: '24 Jam Nonstop',
    rating: 4.9,
    total_reviews: 51
  },
  // PENDING STORE FOR ADMIN VERIFICATION WORKFLOW DEMO
  {
    id: 'str_berkah_mandiri_pending',
    owner_id: 'usr_joko_santoso',
    owner_name: 'Pak Joko Santoso',
    name: 'Toko Berkah Mandiri (Menunggu Verifikasi)',
    description: 'Baru buka dekat lokasi Anda! Sedia gas LPG 3kg, aqua galon, galon Le Minerale, dan frozen food ringan.',
    address: 'Jl. Seberang Kos No. 88 (325m dari titik Anda)',
    lat: -6.9132,
    lng: 107.6158,
    status: 'pending',
    phone: '0812-7788-9900',
    opening_hours: '07.00 - 22.00 WIB',
    rating: 0,
    total_reviews: 0,
    documents: [
      {
        id: 'doc_1',
        store_id: 'str_berkah_mandiri_pending',
        file_name: 'KTP_Joko_Santoso.jpg',
        file_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        type: 'ktp',
        review_note: 'Foto KTP sesuai identitas pemilik'
      },
      {
        id: 'doc_2',
        store_id: 'str_berkah_mandiri_pending',
        file_name: 'Foto_Plang_Toko.jpg',
        file_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
        type: 'foto_toko',
        review_note: 'Plang toko terlihat jelas di pinggir jalan raya'
      }
    ]
  }
];

export const STORE_PRODUCTS: StoreProduct[] = [
  // Store 1: Warung Madura Berkah 24 Jam
  {
    id: 'sp_mb_1',
    store_id: 'str_madura_berkah',
    master_product_id: 'mp_indomie_goreng',
    name: 'Indomie Goreng Spesial',
    brand: 'Indofood',
    category_id: 'cat_instant',
    unit: 'Bungkus',
    variant: 'Original',
    price: 3500,
    stock: 48,
    low_stock_threshold: 10,
    is_available: true,
    votes_available: 14,
    votes_empty: 1,
    confidence_score: 93,
    last_voted_at: '2026-11-08T05:30:00Z',
    is_doubtful: false
  },
  {
    id: 'sp_mb_2',
    store_id: 'str_madura_berkah',
    master_product_id: 'mp_indomie_kari',
    name: 'Indomie Kuah Kari Ayam',
    brand: 'Indofood',
    category_id: 'cat_instant',
    unit: 'Bungkus',
    variant: 'Kari Ayam',
    price: 3500,
    stock: 30,
    low_stock_threshold: 10,
    is_available: true,
    votes_available: 8,
    votes_empty: 0,
    confidence_score: 100,
    last_voted_at: '2026-11-08T04:15:00Z',
    is_doubtful: false
  },
  {
    id: 'sp_mb_3',
    store_id: 'str_madura_berkah',
    master_product_id: 'mp_telur_kg',
    name: 'Telur Ayam Negeri Segar',
    brand: 'Lokal Peternak',
    category_id: 'cat_sembako',
    unit: '1 Kg (isi 16)',
    price: 27500, // cheap!
    stock: 12,
    low_stock_threshold: 5,
    is_available: true,
    votes_available: 12,
    votes_empty: 2,
    confidence_score: 86,
    last_voted_at: '2026-11-08T03:45:00Z',
    is_doubtful: false
  },
  {
    id: 'sp_mb_4',
    store_id: 'str_madura_berkah',
    master_product_id: 'mp_le_minerale_600',
    name: 'Le Minerale Botol Dingin',
    brand: 'Mayora',
    category_id: 'cat_minuman',
    unit: 'Botol 600ml',
    price: 3500,
    stock: 24,
    low_stock_threshold: 8,
    is_available: true,
    votes_available: 19,
    votes_empty: 0,
    confidence_score: 100,
    last_voted_at: '2026-11-08T05:50:00Z',
    is_doubtful: false
  },
  {
    id: 'sp_mb_5',
    store_id: 'str_madura_berkah',
    master_product_id: 'mp_tolak_angin',
    name: 'Tolak Angin Cair Herbal',
    brand: 'Sido Muncul',
    category_id: 'cat_obat',
    unit: 'Sachet',
    price: 4500,
    stock: 3, // LOW STOCK TRIGGER!
    low_stock_threshold: 5,
    is_available: true,
    votes_available: 5,
    votes_empty: 1,
    confidence_score: 83,
    last_voted_at: '2026-11-08T02:10:00Z',
    is_doubtful: false
  },
  {
    id: 'sp_mb_6',
    store_id: 'str_madura_berkah',
    master_product_id: 'mp_kopi_kapal_api',
    name: 'Kopi Kapal Api Special Mix',
    brand: 'Kapal Api',
    category_id: 'cat_minuman',
    unit: 'Renceng (10 sachet)',
    price: 15000,
    stock: 7,
    low_stock_threshold: 3,
    is_available: true,
    votes_available: 6,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },

  // Store 2: Toko Kelontong Bu Sri
  {
    id: 'sp_bs_1',
    store_id: 'str_kelontong_bu_sri',
    master_product_id: 'mp_indomie_goreng',
    name: 'Indomie Goreng Spesial',
    brand: 'Indofood',
    category_id: 'cat_instant',
    unit: 'Bungkus',
    variant: 'Original',
    price: 3400, // Cheapest Indomie!
    stock: 65,
    low_stock_threshold: 15,
    is_available: true,
    votes_available: 18,
    votes_empty: 1,
    confidence_score: 95,
    last_voted_at: '2026-11-08T05:00:00Z',
    is_doubtful: false
  },
  {
    id: 'sp_bs_2',
    store_id: 'str_kelontong_bu_sri',
    master_product_id: 'mp_telur_kg',
    name: 'Telur Ayam Negeri Segar',
    brand: 'Lokal Peternak',
    category_id: 'cat_sembako',
    unit: '1 Kg',
    price: 27000, // Cheapest eggs!
    stock: 35,
    low_stock_threshold: 10,
    is_available: true,
    votes_available: 22,
    votes_empty: 1,
    confidence_score: 96,
    last_voted_at: '2026-11-08T05:10:00Z',
    is_doubtful: false
  },
  {
    id: 'sp_bs_3',
    store_id: 'str_kelontong_bu_sri',
    master_product_id: 'mp_beras_1kg',
    name: 'Beras Ramos Setra Pulen',
    brand: 'Ramos Super',
    category_id: 'cat_sembako',
    unit: '1 Kg',
    price: 14800,
    stock: 50,
    low_stock_threshold: 15,
    is_available: true,
    votes_available: 10,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_bs_4',
    store_id: 'str_kelontong_bu_sri',
    master_product_id: 'mp_minyak_goreng_1l',
    name: 'Minyak Goreng Minyakita Pouch',
    brand: 'Minyakita',
    category_id: 'cat_sembako',
    unit: 'Pouch 1L',
    price: 16500,
    stock: 2, // low stock!
    low_stock_threshold: 5,
    is_available: true,
    votes_available: 3,
    votes_empty: 4, // COMMUNITY VOTES SAY EMPTY! Flagged as doubtful!
    confidence_score: 42,
    last_voted_at: '2026-11-08T04:20:00Z',
    is_doubtful: true
  },
  {
    id: 'sp_bs_5',
    store_id: 'str_kelontong_bu_sri',
    master_product_id: 'mp_sabun_lifebuoy',
    name: 'Sabun Batang Lifebuoy Total 10',
    brand: 'Unilever',
    category_id: 'cat_mandi',
    unit: 'Batang',
    price: 4800,
    stock: 20,
    low_stock_threshold: 5,
    is_available: true,
    votes_available: 6,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },

  // Store 3: Warung Sembako Kos Makmur
  {
    id: 'sp_sm_1',
    store_id: 'str_sembako_makmur',
    master_product_id: 'mp_indomie_goreng',
    name: 'Indomie Goreng Spesial',
    brand: 'Indofood',
    category_id: 'cat_instant',
    unit: 'Bungkus',
    price: 3500,
    stock: 40,
    low_stock_threshold: 10,
    is_available: true,
    votes_available: 11,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_sm_2',
    store_id: 'str_sembako_makmur',
    master_product_id: 'mp_sedaap_goreng',
    name: 'Mie Sedaap Goreng Kriuk',
    brand: 'Wings Food',
    category_id: 'cat_instant',
    unit: 'Bungkus',
    price: 3300,
    stock: 35,
    low_stock_threshold: 8,
    is_available: true,
    votes_available: 9,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_sm_3',
    store_id: 'str_sembako_makmur',
    master_product_id: 'mp_le_minerale_600',
    name: 'Le Minerale Botol Dingin',
    brand: 'Mayora',
    category_id: 'cat_minuman',
    unit: 'Botol 600ml',
    price: 3300, // Cheapest Le Minerale!
    stock: 30,
    low_stock_threshold: 6,
    is_available: true,
    votes_available: 14,
    votes_empty: 1,
    confidence_score: 93,
    is_doubtful: false
  },
  {
    id: 'sp_sm_4',
    store_id: 'str_sembako_makmur',
    master_product_id: 'mp_tolak_angin',
    name: 'Tolak Angin Cair Herbal',
    brand: 'Sido Muncul',
    category_id: 'cat_obat',
    unit: 'Sachet',
    price: 4300, // Cheaper Tolak Angin!
    stock: 18,
    low_stock_threshold: 5,
    is_available: true,
    votes_available: 8,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_sm_5',
    store_id: 'str_sembako_makmur',
    master_product_id: 'mp_panadol_extra',
    name: 'Panadol Extra Merah',
    brand: 'GSK',
    category_id: 'cat_obat',
    unit: 'Strip (10 kaplet)',
    price: 13500,
    stock: 8,
    low_stock_threshold: 3,
    is_available: true,
    votes_available: 7,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },

  // Store 4: Toko Pojok Mahasiswa
  {
    id: 'sp_pm_1',
    store_id: 'str_pojok_mahasiswa',
    master_product_id: 'mp_popmie_pedas',
    name: 'Pop Mie Pedas Dower',
    brand: 'Indofood',
    category_id: 'cat_instant',
    unit: 'Cup',
    price: 6000,
    stock: 15,
    low_stock_threshold: 4,
    is_available: true,
    votes_available: 12,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_pm_2',
    store_id: 'str_pojok_mahasiswa',
    master_product_id: 'mp_teh_pucuk',
    name: 'Teh Pucuk Harum Dingin',
    brand: 'Mayora',
    category_id: 'cat_minuman',
    unit: 'Botol 350ml',
    price: 4000,
    stock: 25,
    low_stock_threshold: 6,
    is_available: true,
    votes_available: 10,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_pm_3',
    store_id: 'str_pojok_mahasiswa',
    master_product_id: 'mp_chitato_lite',
    name: 'Chitato Lite Rumput Laut',
    brand: 'Indofood',
    category_id: 'cat_snack',
    unit: 'Bungkus',
    price: 11000,
    stock: 12,
    low_stock_threshold: 4,
    is_available: true,
    votes_available: 5,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_pm_4',
    store_id: 'str_pojok_mahasiswa',
    master_product_id: 'mp_daia_deterjen',
    name: 'Daia Deterjen Bubuk Bunga',
    brand: 'Wings',
    category_id: 'cat_mandi',
    unit: 'Bungkus 250g',
    price: 6500,
    stock: 14,
    low_stock_threshold: 4,
    is_available: true,
    votes_available: 6,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },

  // Store 5: Warung Madura Al-Falah
  {
    id: 'sp_af_1',
    store_id: 'str_alfalah_24',
    master_product_id: 'mp_indomie_goreng',
    name: 'Indomie Goreng Spesial',
    brand: 'Indofood',
    category_id: 'cat_instant',
    unit: 'Bungkus',
    price: 3500,
    stock: 60,
    low_stock_threshold: 15,
    is_available: true,
    votes_available: 25,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_af_2',
    store_id: 'str_alfalah_24',
    master_product_id: 'mp_aqua_600',
    name: 'AQUA Air Mineral Dingin',
    brand: 'Danone AQUA',
    category_id: 'cat_minuman',
    unit: 'Botol 600ml',
    price: 4000,
    stock: 35,
    low_stock_threshold: 8,
    is_available: true,
    votes_available: 15,
    votes_empty: 0,
    confidence_score: 100,
    is_doubtful: false
  },
  {
    id: 'sp_af_3',
    store_id: 'str_alfalah_24',
    master_product_id: 'mp_telur_kg',
    name: 'Telur Ayam Negeri Segar',
    brand: 'Lokal Peternak',
    category_id: 'cat_sembako',
    unit: '1 Kg',
    price: 28500,
    stock: 18,
    low_stock_threshold: 5,
    is_available: true,
    votes_available: 14,
    votes_empty: 1,
    confidence_score: 93,
    is_doubtful: false
  }
];

// Initial Reservations to demonstrate real-time status & stock logic
const now = new Date();
const inOneHour = new Date(now.getTime() + 65 * 60 * 1000).toISOString();
const inTwoHours = new Date(now.getTime() + 110 * 60 * 1000).toISOString();
const pastDate = new Date(now.getTime() - 3 * 3600 * 1000).toISOString();

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res_001',
    code: 'WL-8821',
    customer_id: 'usr_customer_1',
    customer_name: 'Dimas Wicaksono',
    customer_phone: '0812-9876-5432',
    store_id: 'str_madura_berkah',
    store_name: 'Warung Madura Berkah 24 Jam',
    status: 'accepted',
    created_at: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
    expires_at: inOneHour,
    note: 'Tolong plastikin rapi ya Pak, nanti saya mampir habis ashar sekitar jam 15.30.',
    total_amount: 38000,
    pickup_estimated_time: '15:30 WIB',
    items: [
      {
        id: 'ri_1',
        reservation_id: 'res_001',
        store_product_id: 'sp_mb_3',
        product_name: 'Telur Ayam Negeri Segar',
        unit: '1 Kg (isi 16)',
        qty: 1,
        price_snapshot: 27500
      },
      {
        id: 'ri_2',
        reservation_id: 'res_001',
        store_product_id: 'sp_mb_1',
        product_name: 'Indomie Goreng Spesial',
        unit: 'Bungkus',
        qty: 3,
        price_snapshot: 3500
      }
    ]
  },
  {
    id: 'res_002',
    code: 'WL-9104',
    customer_id: 'usr_customer_2',
    customer_name: 'Siti Nurhaliza',
    customer_phone: '0852-7711-2299',
    store_id: 'str_madura_berkah',
    store_name: 'Warung Madura Berkah 24 Jam',
    status: 'pending',
    created_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    expires_at: inTwoHours,
    note: 'Ambil sehabis kuliah jam 17.00. Tolong disiapkan ya Pak.',
    total_amount: 21500,
    pickup_estimated_time: '17.00 WIB',
    items: [
      {
        id: 'ri_3',
        reservation_id: 'res_002',
        store_product_id: 'sp_mb_4',
        product_name: 'Le Minerale Botol Dingin',
        unit: 'Botol 600ml',
        qty: 2,
        price_snapshot: 3500
      },
      {
        id: 'ri_4',
        reservation_id: 'res_002',
        store_product_id: 'sp_mb_5',
        product_name: 'Tolak Angin Cair Herbal',
        unit: 'Sachet',
        qty: 2,
        price_snapshot: 4500
      },
      {
        id: 'ri_5',
        reservation_id: 'res_002',
        store_product_id: 'sp_mb_2',
        product_name: 'Indomie Kuah Kari Ayam',
        unit: 'Bungkus',
        qty: 1,
        price_snapshot: 3500
      }
    ]
  },
  {
    id: 'res_003',
    code: 'WL-7612',
    customer_id: 'usr_customer_1',
    customer_name: 'Dimas Wicaksono',
    customer_phone: '0812-9876-5432',
    store_id: 'str_kelontong_bu_sri',
    store_name: 'Toko Kelontong Barokah Bu Sri',
    status: 'picked_up',
    created_at: pastDate,
    expires_at: pastDate,
    note: 'Terima kasih Bu Sri sudah disiapkan pas jam pulang kuliah!',
    total_amount: 41800,
    pickup_estimated_time: 'Sudah Diambil',
    items: [
      {
        id: 'ri_6',
        reservation_id: 'res_003',
        store_product_id: 'sp_bs_2',
        product_name: 'Telur Ayam Negeri Segar',
        unit: '1 Kg',
        qty: 1,
        price_snapshot: 27000
      },
      {
        id: 'ri_7',
        reservation_id: 'res_003',
        store_product_id: 'sp_bs_3',
        product_name: 'Beras Ramos Setra Pulen',
        unit: '1 Kg',
        qty: 1,
        price_snapshot: 14800
      }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    store_id: 'str_madura_berkah',
    customer_id: 'usr_customer_1',
    customer_name: 'Dimas Wicaksono',
    rating: 5,
    comment: 'Penyelamat pas lapar jam 2 dini hari! Stok Indomie dan es batu selalu siap, Pak Slamet ramah banget.',
    created_at: '2026-02-14T02:30:00Z'
  },
  {
    id: 'rev_2',
    store_id: 'str_kelontong_bu_sri',
    customer_id: 'usr_customer_2',
    customer_name: 'Rian Prasetya',
    rating: 5,
    comment: 'Telur di Bu Sri selalu fresh, jarang sekali yang retak/busuk. Harga paling murah se-Banjarsari.',
    created_at: '2026-02-18T10:15:00Z'
  },
  {
    id: 'rev_3',
    store_id: 'str_sembako_makmur',
    customer_id: 'usr_customer_3',
    customer_name: 'Nabila Zahra',
    rating: 4,
    comment: 'Bagus bisa reservasi dulu jadi nggak perlu antre atau kecele stok abis pas buru-buru berangkat praktikum.',
    created_at: '2026-02-20T16:45:00Z'
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep_1',
    store_id: 'str_kelontong_bu_sri',
    store_name: 'Toko Kelontong Barokah Bu Sri',
    reporter_id: 'usr_customer_3',
    reporter_name: 'Fajar Nugraha',
    type: 'stock_inaccurate',
    description: 'Di katalog tertera Minyakita Pouch masih ada, tapi tadi pas mampir ke toko katanya sudah habis dari kemarin sore.',
    status: 'open',
    created_at: '2026-11-08T04:30:00Z'
  },
  {
    id: 'rep_2',
    store_id: 'str_madura_berkah',
    store_name: 'Warung Madura Berkah 24 Jam',
    reporter_id: 'usr_customer_4',
    reporter_name: 'Bima Sakti',
    type: 'wrong_price',
    description: 'Harga Telur di etalase toko Rp 28.000, di sistem tertera Rp 27.500. Selisih 500 rupiah.',
    status: 'resolved',
    admin_note: 'Sudah dikonfirmasi ke Pak Slamet, penyesuaian harga promo mingguan telah disinkronkan.',
    created_at: '2026-11-07T14:10:00Z'
  }
];

export const INITIAL_SEARCH_LOGS: SearchLog[] = [
  { id: 'sl_1', keyword: 'Indomie Goreng', lat: -7.0505, lng: 110.4372, created_at: '2026-11-08T05:00:00Z' },
  { id: 'sl_2', keyword: 'Es Batu', lat: -7.0505, lng: 110.4372, created_at: '2026-11-08T04:45:00Z' },
  { id: 'sl_3', keyword: 'Aqua Galon', lat: -7.0505, lng: 110.4372, created_at: '2026-11-08T04:20:00Z' },
  { id: 'sl_4', keyword: 'Telur 1kg', lat: -7.0505, lng: 110.4372, created_at: '2026-11-08T03:55:00Z' },
  { id: 'sl_5', keyword: 'Tolak Angin', lat: -7.0505, lng: 110.4372, created_at: '2026-11-08T03:10:00Z' },
  { id: 'sl_6', keyword: 'Indomie Kari', lat: -7.0505, lng: 110.4372, created_at: '2026-11-08T02:40:00Z' },
  { id: 'sl_7', keyword: 'Beras Pulen', lat: -7.0505, lng: 110.4372, created_at: '2026-11-07T22:15:00Z' },
  { id: 'sl_8', keyword: 'Es Batu', lat: -7.0505, lng: 110.4372, created_at: '2026-11-07T21:05:00Z' },
  { id: 'sl_9', keyword: 'Pembalut Charm', lat: -7.0505, lng: 110.4372, created_at: '2026-11-07T20:30:00Z' },
  { id: 'sl_10', keyword: 'Kopi Kapal Api', lat: -7.0505, lng: 110.4372, created_at: '2026-11-07T19:50:00Z' }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'act_1', user_id: 'usr_admin_1', user_name: 'Admin WarLok', action: 'Memverifikasi Toko Warung Madura Berkah 24 Jam', created_at: '2026-01-15T10:00:00Z' },
  { id: 'act_2', user_id: 'usr_merchant_1', user_name: 'Pak Slamet', action: 'Menerima Reservasi #WL-8821 (Dimas Wicaksono)', created_at: '2026-11-08T05:15:00Z' },
  { id: 'act_3', user_id: 'usr_customer_1', user_name: 'Dimas Wicaksono', action: 'Melakukan voting stok: Indomie Goreng Tersedia', created_at: '2026-11-08T05:30:00Z' },
  { id: 'act_4', user_id: 'usr_customer_3', user_name: 'Fajar Nugraha', action: 'Melaporkan ketidaksesuaian stok di Toko Bu Sri', created_at: '2026-11-08T04:30:00Z' }
];
