// Simple Authentication Middleware for Admin Protection
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'wisata_admin_secret_token_2026';

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  if (!token || token !== ADMIN_SECRET_TOKEN) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Sesi admin tidak valid atau telah berakhir. Silakan login kembali.'
    });
  }

  next();
}

module.exports = requireAdminAuth;
