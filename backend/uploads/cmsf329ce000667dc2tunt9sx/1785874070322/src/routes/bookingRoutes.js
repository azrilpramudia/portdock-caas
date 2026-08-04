const express = require('express');
const router = express.Router();
const db = require('../config/database');
const requireAdminAuth = require('../middlewares/auth');

// GET all bookings (ADMIN PROTECTED)
router.get('/', requireAdminAuth, (req, res) => {
  try {
    const query = `
      SELECT 
        b.id,
        b.customer_name,
        b.email,
        b.phone,
        b.destination_id,
        b.booking_date,
        b.quantity,
        b.total_price,
        b.status,
        b.created_at,
        d.name as destination_name,
        d.location as destination_location,
        d.image as destination_image,
        d.price as ticket_price
      FROM bookings b
      LEFT JOIN destinations d ON b.destination_id = d.id
      ORDER BY b.id DESC
    `;

    const bookings = db.prepare(query).all();

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pemesanan', error: error.message });
  }
});

// GET single booking by ID (PUBLIC for ticket verification)
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        b.*,
        d.name as destination_name,
        d.location as destination_location,
        d.image as destination_image,
        d.price as ticket_price
      FROM bookings b
      LEFT JOIN destinations d ON b.destination_id = d.id
      WHERE b.id = ?
    `;
    const booking = db.prepare(query).get(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Data pemesanan tidak ditemukan' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking by id:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail pemesanan', error: error.message });
  }
});

// POST create booking (PUBLIC)
router.post('/', (req, res) => {
  try {
    const { customer_name, email, phone, destination_id, booking_date, quantity } = req.body;

    if (!customer_name || !email || !phone || !destination_id || !booking_date || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi (Nama, Email, Nomor HP, Destinasi, Tanggal Kunjungan, Jumlah Tiket)'
      });
    }

    const parsedDestId = parseInt(destination_id, 10);
    const parsedQty = parseInt(quantity, 10);

    if (isNaN(parsedDestId)) {
      return res.status(400).json({ success: false, message: 'ID Destinasi tidak valid' });
    }

    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Jumlah tiket minimal 1' });
    }

    // Check destination existence & quota
    const destination = db.prepare('SELECT * FROM destinations WHERE id = ?').get(parsedDestId);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destinasi yang dipilih tidak ditemukan' });
    }

    if (destination.quota < parsedQty) {
      return res.status(400).json({
        success: false,
        message: `Maaf, sisa kuota tiket untuk ${destination.name} hanya tersisa ${destination.quota} tiket.`
      });
    }

    const totalPrice = destination.price * parsedQty;

    // Transaction to insert booking and update destination quota
    const createBookingTx = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO bookings (customer_name, email, phone, destination_id, booking_date, quantity, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed')
      `);

      const result = stmt.run(
        customer_name.trim(),
        email.trim(),
        phone.trim(),
        parsedDestId,
        booking_date,
        parsedQty,
        totalPrice
      );

      // Decrement quota
      db.prepare('UPDATE destinations SET quota = quota - ? WHERE id = ?').run(parsedQty, parsedDestId);

      return result.lastInsertRowid;
    });

    const bookingId = createBookingTx();

    const createdBooking = db.prepare(`
      SELECT 
        b.*,
        d.name as destination_name,
        d.location as destination_location,
        d.image as destination_image,
        d.price as ticket_price
      FROM bookings b
      LEFT JOIN destinations d ON b.destination_id = d.id
      WHERE b.id = ?
    `).get(bookingId);

    // Format booking reference code e.g. TIKET-202608-0001
    const ticketCode = `TIKET-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(bookingId).padStart(4, '0')}`;

    res.status(201).json({
      success: true,
      message: 'Pemesanan tiket berhasil dikonfirmasi!',
      ticketCode,
      data: createdBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses pemesanan tiket', error: error.message });
  }
});

// DELETE booking (ADMIN PROTECTED)
router.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data pemesanan tidak ditemukan' });
    }

    // Restore destination quota when booking is deleted
    const deleteBookingTx = db.transaction(() => {
      db.prepare('UPDATE destinations SET quota = quota + ? WHERE id = ?').run(existing.quantity, existing.destination_id);
      db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    });

    deleteBookingTx();

    res.json({
      success: true,
      message: `Pemesanan #${id} atas nama "${existing.customer_name}" berhasil dibatalkan`
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, message: 'Gagal membatalkan pemesanan', error: error.message });
  }
});

module.exports = router;
