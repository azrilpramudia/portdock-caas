/**
 * Destination Catalog JavaScript Logic with Lucide Icons
 */

let allDestinations = [];
let activeCategory = 'Semua';
let activeSort = 'newest';

// Fetch and render destinations from API
async function loadDestinations() {
  const container = document.getElementById('destinations-container');
  if (!container) return;

  try {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="loader-2" class="icon-lg" style="animation: spin 1s linear infinite; margin-bottom: 0.5rem;"></i>
        <p>Sedang memuat data destinasi terbaik...</p>
      </div>
    `;
    refreshIcons();

    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.trim() : '';

    let url = '/api/destination?';
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
    if (activeCategory && activeCategory !== 'Semua') url += `category=${encodeURIComponent(activeCategory)}&`;
    if (activeSort) url += `sort=${encodeURIComponent(activeSort)}&`;

    const res = await fetch(url);
    const result = await res.json();

    if (result.success) {
      allDestinations = result.data;
      renderDestinations(allDestinations);
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="alert-circle" class="icon-lg" style="color: var(--danger); margin-bottom: 0.5rem;"></i>
          <p style="color: var(--danger);">Gagal memuat data destinasi: ${escapeHTML(result.message)}</p>
        </div>
      `;
      refreshIcons();
    }
  } catch (err) {
    console.error('Error fetching destinations:', err);
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="wifi-off" class="icon-lg" style="color: var(--danger); margin-bottom: 0.5rem;"></i>
        <p style="color: var(--danger);">Terjadi kendala koneksi ke server.</p>
      </div>
    `;
    refreshIcons();
  }
}

// Render destination cards
function renderDestinations(data) {
  const container = document.getElementById('destinations-container');
  const countBadge = document.getElementById('destination-count');

  if (countBadge) {
    countBadge.textContent = `${data.length} Destinasi`;
  }

  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="compass" class="icon-xl" style="color: var(--text-muted); margin-bottom: 0.75rem;"></i>
        <h3 style="margin-bottom: 0.5rem; color: var(--secondary);">Tidak Ada Destinasi Ditemukan</h3>
        <p style="color: var(--text-muted);">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  container.innerHTML = data.map(dest => `
    <div class="dest-card">
      <div class="dest-img-wrap">
        <img src="${escapeHTML(dest.image)}" alt="${escapeHTML(dest.name)}" class="dest-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'">
        <span class="dest-category-badge">${escapeHTML(dest.category || 'Wisata Alam')}</span>
      </div>
      <div class="dest-body">
        <div class="dest-location"><i data-lucide="map-pin"></i> ${escapeHTML(dest.location)}</div>
        <h3 class="dest-title">${escapeHTML(dest.name)}</h3>
        <p class="dest-desc">${escapeHTML(dest.description)}</p>

        <div class="dest-meta-grid">
          <div class="dest-price-box">
            <span class="label">Harga Tiket</span>
            <div class="price">${formatRupiah(dest.price)}</div>
          </div>
          <div class="dest-quota-box" style="text-align: right;">
            <span class="label">Sisa Kuota</span>
            <div class="quota ${dest.quota <= 10 ? 'low' : ''}"><i data-lucide="ticket"></i> ${dest.quota} Tiket</div>
          </div>
        </div>

        <div class="dest-actions">
          <button class="btn btn-outline btn-sm" onclick="openDetailModal(${dest.id})">
            <i data-lucide="info"></i> Detail
          </button>
          <a href="/booking.html?id=${dest.id}" class="btn btn-primary btn-sm">
            <i data-lucide="ticket"></i> Pesan Tiket
          </a>
        </div>
      </div>
    </div>
  `).join('');

  refreshIcons();
}

// Open Quick-View Detail Modal
function openDetailModal(id) {
  const dest = allDestinations.find(d => d.id === id);
  if (!dest) return;

  const modalBody = document.getElementById('detail-modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <img src="${escapeHTML(dest.image)}" alt="${escapeHTML(dest.name)}" style="width: 100%; height: 260px; object-fit: cover; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
    </div>
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
      <div>
        <span class="badge badge-primary" style="margin-bottom: 0.5rem;">${escapeHTML(dest.category || 'Wisata Alam')}</span>
        <h2 style="font-size: 1.5rem; color: var(--secondary); margin-bottom: 0.25rem;">${escapeHTML(dest.name)}</h2>
        <div style="color: var(--text-muted); font-size: 0.95rem;"><i data-lucide="map-pin"></i> ${escapeHTML(dest.location)}</div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Harga Tiket</span>
        <span style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">${formatRupiah(dest.price)}</span>
      </div>
    </div>

    <div style="background: var(--bg-alt); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
      <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">Deskripsi Destinasi</h4>
      <p style="color: var(--text-muted); line-height: 1.7; font-size: 0.95rem;">${escapeHTML(dest.description)}</p>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background: #FEF3C7; color: #92400E; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.9rem; margin-bottom: 1.5rem;">
      <span><strong><i data-lucide="ticket"></i> Kuota Tersedia:</strong> ${dest.quota} tiket tersisa</span>
      <span><strong><i data-lucide="star"></i> Rating:</strong> ${dest.rating || 4.8} / 5.0</span>
    </div>

    <div style="display: flex; gap: 1rem;">
      <button class="btn btn-outline btn-block" onclick="closeModal('destination-detail-modal')">Tutup</button>
      <a href="/booking.html?id=${dest.id}" class="btn btn-primary btn-block"><i data-lucide="ticket"></i> Pesan Tiket Sekarang</a>
    </div>
  `;

  openModal('destination-detail-modal');
  refreshIcons();
}

// Category filter click event
function setupFilterEvents() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      loadDestinations();
    });
  });

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      loadDestinations();
    });
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadDestinations();
      }, 300);
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupFilterEvents();
  loadDestinations();
});
