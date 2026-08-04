const express = require('express');
const router = express.Router();
const db = require('../config/database');
const requireAdminAuth = require('../middlewares/auth');

// GET dashboard statistics (ADMIN PROTECTED)
router.get('/', requireAdminAuth, (req, res) => {
  try {
    const totalDestinations = db.prepare('SELECT COUNT(*) as count FROM destinations').get().count;
    
    const bookingStats = db.prepare(`
      SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COALESCE(SUM(quantity), 0) as total_tickets_sold
      FROM bookings
    `).get();

    const recentBookings = db.prepare(`
      SELECT 
        b.id,
        b.customer_name,
        b.booking_date,
        b.quantity,
        b.total_price,
        b.status,
        b.created_at,
        d.name as destination_name
      FROM bookings b
      LEFT JOIN destinations d ON b.destination_id = d.id
      ORDER BY b.id DESC
      LIMIT 5
    `).all();

    const topDestinations = db.prepare(`
      SELECT 
        d.id,
        d.name,
        d.location,
        d.price,
        d.quota,
        d.image,
        COUNT(b.id) as booking_count,
        COALESCE(SUM(b.quantity), 0) as tickets_sold,
        COALESCE(SUM(b.total_price), 0) as revenue_generated
      FROM destinations d
      LEFT JOIN bookings b ON d.id = b.destination_id
      GROUP BY d.id
      ORDER BY tickets_sold DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        totalDestinations,
        totalBookings: bookingStats.total_bookings,
        totalRevenue: bookingStats.total_revenue,
        totalTicketsSold: bookingStats.total_tickets_sold,
        recentBookings,
        topDestinations
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data statistik', error: error.message });
  }
});

module.exports = router;
