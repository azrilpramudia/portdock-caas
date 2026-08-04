const express = require('express');
const router = express.Router();
const db = require('../config/database');
const requireAdminAuth = require('../middlewares/auth');

// GET all destinations with optional search and category filter (PUBLIC)
router.get('/', (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      query += ' AND (name LIKE ? OR location LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category && category.trim() !== '' && category !== 'Semua') {
      query += ' AND category = ?';
      params.push(category.trim());
    }

    if (sort === 'price-low') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY id DESC';
    }

    const destinations = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data destinasi', error: error.message });
  }
});

// GET single destination by ID (PUBLIC)
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const destination = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id);

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error fetching destination by id:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail destinasi', error: error.message });
  }
});

// POST create new destination (ADMIN PROTECTED)
router.post('/', requireAdminAuth, (req, res) => {
  try {
    const { name, location, price, quota, description, image, category } = req.body;

    if (!name || !location || !price || quota === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nama, lokasi, harga, dan kuota wajib diisi'
      });
    }

    const parsedPrice = parseInt(price, 10);
    const parsedQuota = parseInt(quota, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: 'Harga harus berupa angka valid >= 0' });
    }
    if (isNaN(parsedQuota) || parsedQuota < 0) {
      return res.status(400).json({ success: false, message: 'Kuota harus berupa angka valid >= 0' });
    }

    const defaultImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';
    const stmt = db.prepare(`
      INSERT INTO destinations (name, location, price, quota, description, image, category, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      location.trim(),
      parsedPrice,
      parsedQuota,
      description ? description.trim() : '',
      image && image.trim() !== '' ? image.trim() : defaultImage,
      category && category.trim() !== '' ? category.trim() : 'Alam & Petualangan',
      4.8
    );

    const newDest = db.prepare('SELECT * FROM destinations WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Destinasi berhasil ditambahkan',
      data: newDest
    });
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan destinasi', error: error.message });
  }
});

// PUT update destination (ADMIN PROTECTED)
router.put('/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, price, quota, description, image, category } = req.body;

    const existing = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    if (!name || !location || !price || quota === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nama, lokasi, harga, dan kuota wajib diisi'
      });
    }

    const parsedPrice = parseInt(price, 10);
    const parsedQuota = parseInt(quota, 10);

    const stmt = db.prepare(`
      UPDATE destinations
      SET name = ?, location = ?, price = ?, quota = ?, description = ?, image = ?, category = ?
      WHERE id = ?
    `);

    stmt.run(
      name.trim(),
      location.trim(),
      parsedPrice,
      parsedQuota,
      description !== undefined ? description.trim() : existing.description,
      image !== undefined && image.trim() !== '' ? image.trim() : existing.image,
      category !== undefined ? category.trim() : existing.category,
      id
    );

    const updated = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Destinasi berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui destinasi', error: error.message });
  }
});

// DELETE destination (ADMIN PROTECTED)
router.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    db.prepare('DELETE FROM destinations WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Destinasi "${existing.name}" berhasil dihapus`
    });
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus destinasi', error: error.message });
  }
});

module.exports = router;
