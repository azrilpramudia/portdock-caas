/**
 * Admin Dashboard JavaScript Logic with Lucide Icons
 * Protected by Admin Authentication
 */

let allDestinations = [];
let allBookings = [];
let deleteTargetId = null;
let deleteTargetType = null; // 'destination' or 'booking'

// Get stored admin auth token
function getAdminToken() {
  return localStorage.getItem('adminToken') || '';
}

// Get standard auth headers
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAdminToken()}`
  };
}

// Verify Authentication on Dashboard Load
async function checkAdminAuth() {
  const token = getAdminToken();
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }

  try {
    const res = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await res.json();
    if (!res.ok || !result.success || !result.authenticated) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login.html';
      return false;
    }

    // Display admin username
    const userBadge = document.getElementById('admin-user-display');
    if (userBadge && result.user) {
      userBadge.innerHTML = `<i data-lucide="shield-check"></i> ${result.user.username} (${result.user.role})`;
      refreshIcons();
    }

    return true;
  } catch (err) {
    console.error('Auth verification error:', err);
    window.location.href = '/login.html';
    return false;
  }
}

// Admin Logout
function handleAdminLogout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  showToast('Anda telah berhasil logout', 'info');
  setTimeout(() => {
    window.location.href = '/login.html';
  }, 400);
}

// Switch active dashboard tabs
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabId}-tab`);
  });
}

// Load KPI Statistics
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/stats', {
      headers: getAuthHeaders()
    });

    if (res.status === 401) {
      handleAdminLogout();
      return;
    }

    const result = await res.json();

    if (result.success && result.data) {
      const stats = result.data;
      document.getElementById('stat-total-dest').textContent = stats.totalDestinations || 0;
      document.getElementById('stat-total-bookings').textContent = stats.totalBookings || 0;
      document.getElementById('stat-total-revenue').textContent = formatRupiah(stats.totalRevenue || 0);
      document.getElementById('stat-total-tickets').textContent = `${stats.totalTicketsSold || 0} Tiket`;
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

// Load and Render Destinations Table
async function loadDestinationsTable() {
  const tbody = document.getElementById('destinations-table-body');
  if (!tbody) return;

  try {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);"><i data-lucide="loader-2" style="animation: spin 1s linear infinite;"></i> Memuat data destinasi...</td></tr>`;
    refreshIcons();

    const res = await fetch('/api/destination');
    const result = await res.json();

    if (result.success) {
      allDestinations = result.data;
      renderDestinationsTable(allDestinations);
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 2rem;">Gagal memuat data: ${escapeHTML(result.message)}</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading destinations table:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 2rem;">Gagal terhubung ke server.</td></tr>`;
  }
}

function renderDestinationsTable(data) {
  const tbody = document.getElementById('destinations-table-body');
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">Belum ada data destinasi wisata.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((d, index) => `
    <tr>
      <td style="font-weight: 600; color: var(--text-muted);">${index + 1}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <img src="${escapeHTML(d.image)}" alt="${escapeHTML(d.name)}" class="table-img" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'">
          <div>
            <strong style="color: var(--secondary); font-size: 0.95rem;">${escapeHTML(d.name)}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">ID: #${d.id}</div>
          </div>
        </div>
      </td>
      <td><i data-lucide="map-pin" style="color: var(--primary);"></i> ${escapeHTML(d.location)}</td>
      <td><span class="badge badge-primary">${escapeHTML(d.category || 'Wisata Alam')}</span></td>
      <td style="font-weight: 700; color: var(--primary);">${formatRupiah(d.price)}</td>
      <td>
        <span style="font-weight: 600; color: ${d.quota <= 10 ? 'var(--danger)' : 'var(--success)'};">
          <i data-lucide="ticket"></i> ${d.quota} tiket
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-outline btn-sm" onclick="openEditDestinationModal(${d.id})" title="Edit Destinasi"><i data-lucide="edit-3"></i> Edit</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteDestination(${d.id}, '${escapeHTML(d.name)}')" title="Hapus Destinasi"><i data-lucide="trash-2"></i> Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  refreshIcons();
}

// Load and Render Bookings Table
async function loadBookingsTable() {
  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;

  try {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);"><i data-lucide="loader-2" style="animation: spin 1s linear infinite;"></i> Memuat data pemesanan...</td></tr>`;
    refreshIcons();

    const res = await fetch('/api/booking', {
      headers: getAuthHeaders()
    });

    if (res.status === 401) {
      handleAdminLogout();
      return;
    }

    const result = await res.json();

    if (result.success) {
      allBookings = result.data;
      renderBookingsTable(allBookings);
    } else {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger); padding: 2rem;">Gagal memuat data: ${escapeHTML(result.message)}</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading bookings table:', err);
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger); padding: 2rem;">Gagal terhubung ke server.</td></tr>`;
  }
}

function renderBookingsTable(data) {
  const tbody = document.getElementById('bookings-table-body');
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">Belum ada riwayat pemesanan tiket.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((b, index) => `
    <tr>
      <td style="font-weight: 600; color: var(--text-muted);">${index + 1}</td>
      <td>
        <strong>${escapeHTML(b.customer_name)}</strong>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(b.email)} | ${escapeHTML(b.phone)}</div>
      </td>
      <td>
        <strong>${escapeHTML(b.destination_name || 'Destinasi Terhapus')}</strong>
        <div style="font-size: 0.8rem; color: var(--text-muted);"><i data-lucide="map-pin"></i> ${escapeHTML(b.destination_location || '-')}</div>
      </td>
      <td><i data-lucide="calendar"></i> ${formatDate(b.booking_date)}</td>
      <td><span class="badge badge-info"><i data-lucide="ticket"></i> ${b.quantity} Tiket</span></td>
      <td style="font-weight: 700; color: var(--primary);">${formatRupiah(b.total_price)}</td>
      <td><span class="badge badge-success"><i data-lucide="check"></i> ${escapeHTML(b.status || 'Confirmed')}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteBooking(${b.id}, '${escapeHTML(b.customer_name)}')" title="Batalkan / Hapus"><i data-lucide="x-circle"></i> Batal</button>
      </td>
    </tr>
  `).join('');

  refreshIcons();
}

// Modal: Open Create Destination Modal
function openCreateDestinationModal() {
  document.getElementById('dest-modal-title').textContent = 'Tambah Destinasi Wisata Baru';
  document.getElementById('destination-form').reset();
  document.getElementById('dest-id').value = '';
  openModal('destination-crud-modal');
  refreshIcons();
}

// Modal: Open Edit Destination Modal
function openEditDestinationModal(id) {
  const dest = allDestinations.find(d => d.id === id);
  if (!dest) {
    showToast('Data destinasi tidak ditemukan', 'error');
    return;
  }

  document.getElementById('dest-modal-title').textContent = `Edit Destinasi: ${dest.name}`;
  document.getElementById('dest-id').value = dest.id;
  document.getElementById('dest-name').value = dest.name;
  document.getElementById('dest-location').value = dest.location;
  document.getElementById('dest-price').value = dest.price;
  document.getElementById('dest-quota').value = dest.quota;
  document.getElementById('dest-category').value = dest.category || 'Bahari & Pulau';
  document.getElementById('dest-image').value = dest.image;
  document.getElementById('dest-description').value = dest.description;

  openModal('destination-crud-modal');
  refreshIcons();
}

// Handle Form Submit: Create or Update Destination
async function handleDestinationFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('dest-id').value;
  const name = document.getElementById('dest-name').value.trim();
  const location = document.getElementById('dest-location').value.trim();
  const price = parseInt(document.getElementById('dest-price').value, 10);
  const quota = parseInt(document.getElementById('dest-quota').value, 10);
  const category = document.getElementById('dest-category').value;
  const image = document.getElementById('dest-image').value.trim();
  const description = document.getElementById('dest-description').value.trim();
  const saveBtn = document.getElementById('save-dest-btn');

  if (!name || !location || isNaN(price) || isNaN(quota)) {
    showToast('Mohon lengkapi field wajib', 'warning');
    return;
  }

  const isEdit = Boolean(id);
  const url = isEdit ? `/api/destination/${id}` : '/api/destination';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite;"></i> Menyimpan...';
    refreshIcons();

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        location,
        price,
        quota,
        category,
        image,
        description
      })
    });

    if (res.status === 401) {
      handleAdminLogout();
      return;
    }

    const result = await res.json();

    if (res.ok && result.success) {
      showToast(result.message || 'Destinasi berhasil disimpan!', 'success');
      closeModal('destination-crud-modal');
      loadDestinationsTable();
      loadDashboardStats();
    } else {
      showToast(result.message || 'Gagal menyimpan destinasi', 'error');
    }
  } catch (err) {
    console.error('Error saving destination:', err);
    showToast('Terjadi kesalahan saat menyimpan data', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i data-lucide="save"></i> Simpan Destinasi';
    refreshIcons();
  }
}

// Confirmation Modals for Delete
function confirmDeleteDestination(id, name) {
  deleteTargetId = id;
  deleteTargetType = 'destination';
  document.getElementById('delete-modal-msg').innerHTML = `Apakah Anda yakin ingin menghapus destinasi <strong>"${escapeHTML(name)}"</strong>? Tindakan ini tidak dapat dibatalkan.`;
  openModal('delete-confirm-modal');
}

function confirmDeleteBooking(id, customerName) {
  deleteTargetId = id;
  deleteTargetType = 'booking';
  document.getElementById('delete-modal-msg').innerHTML = `Apakah Anda yakin ingin membatalkan/menghapus pesanan tiket atas nama <strong>"${escapeHTML(customerName)}"</strong>? Kuota tiket akan dikembalikan ke destinasi terkait.`;
  openModal('delete-confirm-modal');
}

// Execute Delete Request
async function executeDelete() {
  if (!deleteTargetId || !deleteTargetType) return;

  const confirmBtn = document.getElementById('execute-delete-btn');
  try {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite;"></i> Menghapus...';
    refreshIcons();

    const url = deleteTargetType === 'destination' ? `/api/destination/${deleteTargetId}` : `/api/booking/${deleteTargetId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.status === 401) {
      handleAdminLogout();
      return;
    }

    const result = await res.json();

    if (res.ok && result.success) {
      showToast(result.message || 'Data berhasil dihapus', 'success');
      closeModal('delete-confirm-modal');
      if (deleteTargetType === 'destination') {
        loadDestinationsTable();
      } else {
        loadBookingsTable();
      }
      loadDashboardStats();
    } else {
      showToast(result.message || 'Gagal menghapus data', 'error');
    }
  } catch (err) {
    console.error('Error executing delete:', err);
    showToast('Terjadi kesalahan saat menghapus data', 'error');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '<i data-lucide="trash-2"></i> Ya, Hapus Sekarang';
    deleteTargetId = null;
    deleteTargetType = null;
    refreshIcons();
  }
}

// Search Filter for Admin Tables
function setupTableSearch() {
  const destSearchInput = document.getElementById('admin-dest-search');
  if (destSearchInput) {
    destSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = allDestinations.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.location.toLowerCase().includes(q) ||
        (d.category && d.category.toLowerCase().includes(q))
      );
      renderDestinationsTable(filtered);
    });
  }

  const bookingSearchInput = document.getElementById('admin-booking-search');
  if (bookingSearchInput) {
    bookingSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = allBookings.filter(b => 
        b.customer_name.toLowerCase().includes(q) || 
        b.email.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        (b.destination_name && b.destination_name.toLowerCase().includes(q))
      );
      renderBookingsTable(filtered);
    });
  }
}

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) return;

  loadDashboardStats();
  loadDestinationsTable();
  loadBookingsTable();
  setupTableSearch();

  const destForm = document.getElementById('destination-form');
  if (destForm) {
    destForm.addEventListener('submit', handleDestinationFormSubmit);
  }

  const deleteBtn = document.getElementById('execute-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', executeDelete);
  }
});
