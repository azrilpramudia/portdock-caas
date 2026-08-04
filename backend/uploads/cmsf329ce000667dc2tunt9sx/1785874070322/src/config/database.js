const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database file location
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize tables
function initDatabase() {
  // Destination Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      price INTEGER NOT NULL,
      quota INTEGER NOT NULL,
      description TEXT,
      image TEXT,
      category TEXT DEFAULT 'Alam & Petualangan',
      rating REAL DEFAULT 4.9,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Booking Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      destination_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      quantity INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    );
  `);

  // Seed Destinations if table is empty
  const count = db.prepare('SELECT COUNT(*) as count FROM destinations').get().count;
  if (count === 0) {
    const seedDestinations = [
      {
        name: 'Kepulauan Raja Ampat',
        location: 'Papua Barat Daya',
        price: 1250000,
        quota: 40,
        category: 'Bahari & Pulau',
        rating: 4.9,
        description: 'Surga bawah laut dunia dengan gugusan pulau karang eksotis, air laut toska sebening kristal, dan keanekaragaman biota laut terlengkap di bumi.',
        image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Candi Borobudur',
        location: 'Magelang, Jawa Tengah',
        price: 75000,
        quota: 150,
        category: 'Budaya & Sejarah',
        rating: 4.8,
        description: 'Mahakarya candi Buddha terbesar di dunia peninggalan abad ke-9, menawarkan pesona relief kuno, stupa megah, serta momen sunrise berkabut magis.',
        image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Taman Nasional Komodo',
        location: 'Labuan Bajo, Nusa Tenggara Timur',
        price: 850000,
        quota: 60,
        category: 'Bahari & Satwa',
        rating: 4.9,
        description: 'Habitat asli kadal purba raksasa Komodo Dragon, dipadu keindahan spektakuler Pink Beach dan panorama bukit Pulau Padar dari ketinggian.',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Gunung Bromo & Tengger',
        location: 'Probolinggo, Jawa Timur',
        price: 220000,
        quota: 100,
        category: 'Gunung & Alam',
        rating: 4.8,
        description: 'Lautan pasir berbisik nan mistis, kawah aktif yang menakjubkan, serta pemandangan matahari terbit legendaris berlatar siluet Gunung Batok dan Semeru.',
        image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Nusa Penida & Kelingking Beach',
        location: 'Klungkung, Bali',
        price: 350000,
        quota: 80,
        category: 'Bahari & Pulau',
        rating: 4.9,
        description: 'Tebing ikonik menyerupai dinosaurus T-Rex yang menjulang tinggi di atas samudra biru, spot snorkeling manta ray, dan pantai berpasir putih alami.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Danau Toba & Pulau Samosir',
        location: 'Sumatera Utara',
        price: 150000,
        quota: 120,
        category: 'Danau & Budaya',
        rating: 4.7,
        description: 'Danau vulkanik terbesar di Asia Tenggara dengan pulau Samosir di tengahnya, kaya akan warisan budaya Batak, udara sejuk pegunungan, dan air terjun alami.',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Kawah Ijen & Blue Fire',
        location: 'Banyuwangi, Jawa Timur',
        price: 180000,
        quota: 75,
        category: 'Gunung & Alam',
        rating: 4.8,
        description: 'Fenomena langka api biru alami yang hanya ada dua di dunia, danau kawah asam berwarna toska menawan, serta pemandangan para penambang belerang tangguh.',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Taman Nasional Wakatobi',
        location: 'Sulawesi Tenggara',
        price: 900000,
        quota: 50,
        category: 'Bahari & Pulau',
        rating: 4.9,
        description: 'Cagar biosfer dunia UNESCO dengan 750 dari 850 spesies karang dunia, surga penyelaman tropis dengan visibilitas air yang luar biasa jernih.',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80'
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO destinations (name, location, price, quota, category, rating, description, image)
      VALUES (@name, @location, @price, @quota, @category, @rating, @description, @image)
    `);

    const insertMany = db.transaction((destinations) => {
      for (const dest of destinations) insertStmt.run(dest);
    });

    insertMany(seedDestinations);
    console.log('✅ Seed destinations initialized successfully.');

    // Seed sample bookings for realistic initial dashboard stats
    const sampleBookings = [
      {
        customer_name: 'Budi Santoso',
        email: 'budi.santoso@email.com',
        phone: '081234567890',
        destination_id: 1,
        booking_date: '2026-08-15',
        quantity: 2,
        total_price: 2500000,
        status: 'Confirmed'
      },
      {
        customer_name: 'Siti Rahmawati',
        email: 'siti.rahma@email.com',
        phone: '085712345678',
        destination_id: 2,
        booking_date: '2026-08-20',
        quantity: 4,
        total_price: 300000,
        status: 'Confirmed'
      },
      {
        customer_name: 'Ahmad Fauzi',
        email: 'ahmad.fauzi@email.com',
        phone: '081398765432',
        destination_id: 3,
        booking_date: '2026-08-18',
        quantity: 1,
        total_price: 850000,
        status: 'Confirmed'
      },
      {
        customer_name: 'Jessica Tan',
        email: 'jessica.tan@email.com',
        phone: '087811223344',
        destination_id: 5,
        booking_date: '2026-08-25',
        quantity: 3,
        total_price: 1050000,
        status: 'Confirmed'
      }
    ];

    const insertBookingStmt = db.prepare(`
      INSERT INTO bookings (customer_name, email, phone, destination_id, booking_date, quantity, total_price, status)
      VALUES (@customer_name, @email, @phone, @destination_id, @booking_date, @quantity, @total_price, @status)
    `);

    const insertBookings = db.transaction((bookings) => {
      for (const b of bookings) insertBookingStmt.run(b);
    });

    insertBookings(sampleBookings);
    console.log('✅ Seed sample bookings initialized successfully.');
  }
}

// Call initialization
initDatabase();

module.exports = db;
