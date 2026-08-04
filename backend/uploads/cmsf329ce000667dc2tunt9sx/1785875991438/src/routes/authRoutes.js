const express = require('express');
const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'wisata_admin_secret_token_2026';

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi'
      });
    }

    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return res.json({
        success: true,
        message: 'Login berhasil! Selamat datang Admin.',
        token: ADMIN_SECRET_TOKEN,
        user: {
          username: ADMIN_USERNAME,
          role: 'Administrator'
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Username atau password yang Anda masukkan salah'
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses login', error: error.message });
  }
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  if (token && token === ADMIN_SECRET_TOKEN) {
    return res.json({
      success: true,
      authenticated: true,
      user: {
        username: ADMIN_USERNAME,
        role: 'Administrator'
      }
    });
  }

  return res.status(401).json({
    success: false,
    authenticated: false,
    message: 'Token tidak valid'
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout berhasil'
  });
});

module.exports = router;
