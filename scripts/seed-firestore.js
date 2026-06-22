/**
 * Firestore Database Seeder
 * Seeds default data (products, addons, vouchers, portfolio, testimonials) into your NEW Firebase project.
 * 
 * Instructions:
 * 1. Go to your NEW Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key.
 * 2. Save the downloaded JSON file as `scripts/service-account.json`.
 * 3. Run: `node scripts/seed-firestore.js`
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const KEY_PATH = path.join(__dirname, 'service-account.json');

if (!fs.existsSync(KEY_PATH)) {
  console.error('\n❌ ERROR: File credentials service-account.json tidak ditemukan!');
  console.log('\nSilakan ikuti langkah berikut:');
  console.log(`1. Buka Firebase Console untuk akun BARU Anda.`);
  console.log(`2. Masuk ke Project Settings -> Service Accounts.`);
  console.log(`3. Klik "Generate New Private Key" untuk mengunduh private key JSON.`);
  console.log(`4. Simpan file tersebut dengan nama: service-account.json`);
  console.log(`   di dalam folder: ${path.dirname(KEY_PATH)}`);
  console.log('\nSetelah itu, jalankan kembali script ini dengan:');
  console.log('   node scripts/seed-firestore.js\n');
  process.exit(1);
}

const serviceAccount = require(KEY_PATH);

console.log('🔄 Menghubungkan ke Firebase Baru...');
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = app.firestore();

// 1. Data Dummy Products (Paket Servis Workshop)
const products = [
  {
    name: 'Signature Wash & Wax',
    price: 150000,
    description: 'Cuci premium dengan detailing sela-sela mobil, pembersihan interior ringan, semprot kolong, serta aplikasi wax premium untuk proteksi dan kilap maksimal.',
    hot: false,
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?w=600&auto=format&fit=crop&q=60',
    gallery: [
      'https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop&q=60'
    ],
    slug: 'signature-wash-wax',
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    name: 'Interior Deep Cleaning',
    price: 350000,
    description: 'Pembersihan total kabin mobil mulai dari jok, plafon, karpet dasar, dashboard hingga bagasi menggunakan cairan pembersih khusus anti bakteri dan menghilangkan bau tidak sedap.',
    hot: true,
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=60',
    gallery: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&auto=format&fit=crop&q=60'
    ],
    slug: 'interior-deep-cleaning',
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    name: 'Gold Detailing & Coating',
    price: 1750000,
    description: 'Paket paint correction 3-stage poles untuk menghilangkan baret halus/swirl mark, jamur body, jamur kaca, dilanjutkan dengan aplikasi 1-layer Ceramic Coating 9H tahan hingga 1 tahun.',
    hot: false,
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=60',
    gallery: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&auto=format&fit=crop&q=60'
    ],
    slug: 'gold-detailing-coating',
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    name: 'Platinum Detailing & Coating',
    price: 3200000,
    description: 'Paket perawatan terlengkap: poles body 3-stage, poles kaca, detailing ruang mesin, detailing velg & ban, serta aplikasi 2-layers Ultra Nano Ceramic Coating 9H+ bergaransi resmi.',
    hot: true,
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&auto=format&fit=crop&q=60',
    gallery: [
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=60'
    ],
    slug: 'platinum-detailing-coating',
    createdAt: admin.firestore.Timestamp.now()
  }
];

// 2. Data Dummy Addons
const addons = [
  {
    name: 'Engine Bay Detailing',
    price: 150000,
    type: 'fixed',
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    name: 'Glass Jamur Cleaner (Full Glass)',
    price: 100000,
    type: 'fixed',
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    name: 'Fogging Anti Bakteri (Odor Remover)',
    price: 85000,
    type: 'fixed',
    createdAt: admin.firestore.Timestamp.now()
  }
];

// 3. Data Dummy Vouchers
const vouchers = [
  {
    code: 'WELCOME10',
    percentage: 10,
    active: true,
    description: 'Diskon selamat datang 10% untuk transaksi pertama Anda.',
    maxUsage: 10,
    currentUsage: 0,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    code: 'HYPER15',
    percentage: 15,
    active: true,
    description: 'Diskon promo khusus grand opening Hypermile Bodyworks.',
    maxUsage: 10,
    currentUsage: 0,
    createdAt: admin.firestore.Timestamp.now()
  }
];

// 4. Data Dummy Portfolio
const portfolio = [
  {
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=60',
    title: 'Ceramic Coating Honda Civic Black'
  },
  {
    url: 'https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?w=600&auto=format&fit=crop&q=60',
    title: 'Signature Wash Porsche Carrera'
  },
  {
    url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=60',
    title: 'Interior Deep Cleaning Alphard'
  }
];

// 5. Data Dummy Testimonials
const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'Pemilik Honda HR-V',
    message: 'Sangat puas dengan layanan poles body & coating di Hypermile. Mobil jadi mengkilap seperti baru keluar dari showroom, baret halus hilang semua!',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60',
    rating: 5
  },
  {
    name: 'Rian Hidayat',
    role: 'Pemilik Toyota Avanza',
    message: 'Interior deep cleaning-nya mantap banget. Bau apek karena bekas ketumpahan susu anak langsung hilang total dan harum bersih.',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=60',
    rating: 5
  },
  {
    name: 'Siti Aminah',
    role: 'Pemilik Mazda 2',
    message: 'Pelayanannya ramah, tempatnya bersih dan nyaman buat nunggu. Paket Signature Wash & Wax sangat worth it dengan harga segitu.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60',
    rating: 4
  }
];

async function seedData() {
  try {
    console.log('🚀 Memulai proses seeding data...');

    // Seeding Products
    console.log('📦 Seeding Products...');
    for (const item of products) {
      await db.collection('products').add(item);
    }
    console.log('   ✅ Products selesai.');

    // Seeding Addons
    console.log('➕ Seeding Addons...');
    for (const item of addons) {
      await db.collection('addons').add(item);
    }
    console.log('   ✅ Addons selesai.');

    // Seeding Vouchers
    console.log('🎟 Seeding Vouchers...');
    for (const item of vouchers) {
      await db.collection('vouchers').add(item);
    }
    console.log('   ✅ Vouchers selesai.');

    // Seeding Portfolio
    console.log('📸 Seeding Portfolio...');
    for (const item of portfolio) {
      await db.collection('portfolio').add(item);
    }
    console.log('   ✅ Portfolio selesai.');

    // Seeding Testimonials
    console.log('💬 Seeding Testimonials...');
    for (const item of testimonials) {
      await db.collection('testimonials').add(item);
    }
    console.log('   ✅ Testimonials selesai.');

    console.log('\n✨ SEEDING BERHASIL SELESAI! ✨');
    console.log('Database Firestore baru Anda kini telah terisi dengan data default.');
    console.log('Silakan jalankan aplikasi Anda untuk mengecek hasilnya.');

  } catch (error) {
    console.error('\n❌ Gagal melakukan seeding:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
