/**
 * Booking Page JavaScript Logic with Lucide Icons
 */

let destinationsList = [];
let selectedDestination = null;

// Initialize booking page
async function initBookingPage() {
  await fetchDestinationsDropdown();

  // Check URL query parameters for pre-selected destination ID
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedId = urlParams.get('id');

  if (preSelectedId) {
    const select = document.getElementById('destination-select');
    if (select) {
      select.value = preSelectedId;
      onDestinationChange(preSelectedId);
    }
  }

  // Set default date to tomorrow
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  // Bind change events
  setupBookingEvents();
}

// Fetch list of destinations for dropdown select
async function fetchDestinationsDropdown() {
  const select = document.getElementById('destination-select');
  if (!select) return;

  try {
    const res = await fetch('/api/destination');
    const result = await res.json();

    if (result.success && result.data) {
      destinationsList = result.data;
      select.innerHTML = `
        <option value="">-- Pilih Destinasi Wisata --</option>
        ${destinationsList.map(d => `
          <option value="${d.id}" data-price="${d.price}" data-quota="${d.quota}">
            ${escapeHTML(d.name)} (${formatRupiah(d.price)} | Sisa Kuota: ${d.quota})
          </option>
        `).join('')}
      `;
    }
  } catch (err) {
    console.error('Error fetching destinations dropdown:', err);
    select.innerHTML = '<option value="">Gagal memuat destinasi</option>';
  }
}

// Destination select change handler
function onDestinationChange(destId) {
  selectedDestination = destinationsList.find(d => d.id === parseInt(destId, 10)) || null;
  updateOrderSummary();
}

// Ticket quantity adjustment
function adjustQuantity(delta) {
  const input = document.getElementById('ticket-quantity');
  if (!input) return;

  let current = parseInt(input.value, 10) || 1;
  current += delta;

  if (current < 1) current = 1;

  if (selectedDestination && current > selectedDestination.quota) {
    current = selectedDestination.quota;
    showToast(`Maksimal kuota tersisa adalah ${selectedDestination.quota} tiket`, 'warning');
  }

  input.value = current;
  updateOrderSummary();
}

// Update Order Summary card and calculations
function updateOrderSummary() {
  const destPreview = document.getElementById('dest-preview-box');
  const unitPriceEl = document.getElementById('summary-unit-price');
  const quantityEl = document.getElementById('summary-quantity');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');
  const warningEl = document.getElementById('quota-warning');

  const qtyInput = document.getElementById('ticket-quantity');
  const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

  if (!selectedDestination) {
    if (destPreview) {
      destPreview.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Pilih destinasi untuk melihat ringkasan</p>`;
    }
    if (unitPriceEl) unitPriceEl.textContent = 'Rp 0';
    if (quantityEl) quantityEl.textContent = `${qty} Tiket`;
    if (subtotalEl) subtotalEl.textContent = 'Rp 0';
    if (totalEl) totalEl.textContent = 'Rp 0';
    if (warningEl) warningEl.textContent = '';
    return;
  }

  const unitPrice = selectedDestination.price;
  const totalPrice = unitPrice * qty;

  if (destPreview) {
    destPreview.innerHTML = `
      <img src="${escapeHTML(selectedDestination.image)}" alt="${escapeHTML(selectedDestination.name)}" class="summary-img" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'">
      <div class="summary-info">
        <h4>${escapeHTML(selectedDestination.name)}</h4>
        <p><i data-lucide="map-pin"></i> ${escapeHTML(selectedDestination.location)}</p>
      </div>
    `;
    refreshIcons();
  }

  if (unitPriceEl) unitPriceEl.textContent = formatRupiah(unitPrice);
  if (quantityEl) quantityEl.textContent = `${qty} Tiket`;
  if (subtotalEl) subtotalEl.textContent = formatRupiah(totalPrice);
  if (totalEl) totalEl.textContent = formatRupiah(totalPrice);

  if (warningEl) {
    if (selectedDestination.quota <= 5) {
      warningEl.innerHTML = `<span style="color: var(--danger); font-weight: 600;"><i data-lucide="alert-triangle"></i> Perhatian: Sisa kuota hanya tersisa ${selectedDestination.quota} tiket!</span>`;
      refreshIcons();
    } else {
      warningEl.innerHTML = `<span style="color: var(--success);"><i data-lucide="check-circle-2"></i> Kuota tersedia: ${selectedDestination.quota} tiket</span>`;
      refreshIcons();
    }
  }
}

// Bind UI change events
function setupBookingEvents() {
  const select = document.getElementById('destination-select');
  if (select) {
    select.addEventListener('change', (e) => onDestinationChange(e.target.value));
  }

  const qtyInput = document.getElementById('ticket-quantity');
  if (qtyInput) {
    qtyInput.addEventListener('input', () => updateOrderSummary());
  }

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }
}

// Handle booking submission
async function handleBookingSubmit(e) {
  e.preventDefault();

  const customerName = document.getElementById('customer-name').value.trim();
  const customerEmail = document.getElementById('customer-email').value.trim();
  const customerPhone = document.getElementById('customer-phone').value.trim();
  const destinationId = document.getElementById('destination-select').value;
  const bookingDate = document.getElementById('booking-date').value;
  const quantity = parseInt(document.getElementById('ticket-quantity').value, 10);
  const submitBtn = document.getElementById('submit-booking-btn');

  if (!customerName || !customerEmail || !customerPhone || !destinationId || !bookingDate || !quantity) {
    showToast('Mohon lengkapi semua kolom formulir pemesanan', 'warning');
    return;
  }

  if (selectedDestination && quantity > selectedDestination.quota) {
    showToast(`Jumlah tiket melebihi sisa kuota (${selectedDestination.quota} tiket)`, 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite;"></i> Memproses Pemesanan...';
    refreshIcons();

    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_name: customerName,
        email: customerEmail,
        phone: customerPhone,
        destination_id: parseInt(destinationId, 10),
        booking_date: bookingDate,
        quantity: quantity
      })
    });

    const result = await res.json();

    if (res.ok && result.success) {
      showToast('Pemesanan tiket berhasil dikonfirmasi!', 'success');
      showTicketConfirmationModal(result);
      document.getElementById('booking-form').reset();
      await fetchDestinationsDropdown();
      selectedDestination = null;
      updateOrderSummary();
    } else {
      showToast(result.message || 'Gagal memproses pemesanan', 'error');
    }
  } catch (err) {
    console.error('Error submitting booking:', err);
    showToast('Terjadi kesalahan koneksi saat memproses pemesanan', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="check"></i> Konfirmasi & Pesan Tiket Sekarang';
    refreshIcons();
  }
}

// Show E-Ticket popup modal
function showTicketConfirmationModal(bookingResult) {
  const modalBody = document.getElementById('ticket-modal-body');
  if (!modalBody) return;

  const data = bookingResult.data;
  const ticketCode = bookingResult.ticketCode || `TIKET-${data.id}`;

  modalBody.innerHTML = `
    <div class="ticket-container" id="printable-ticket">
      <div class="ticket-header">
        <div class="ticket-brand">
          <div class="logo-icon" style="background: var(--primary-light); color: var(--primary); width: 36px; height: 36px; font-size: 1.1rem;"><i data-lucide="palmtree"></i></div>
          <span style="font-size: 1.15rem; font-weight: 800; color: var(--secondary);">Wisata<span>Nusantara</span></span>
        </div>
        <div class="ticket-badge">E-TIKET RESMI</div>
      </div>

      <div class="ticket-body">
        <div style="display: flex; gap: 1.25rem; align-items: center; margin-bottom: 1.5rem;">
          <img src="${escapeHTML(data.destination_image || '')}" alt="${escapeHTML(data.destination_name)}" style="width: 80px; height: 80px; border-radius: var(--radius-md); object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'">
          <div>
            <h3 style="font-size: 1.25rem; color: var(--secondary); margin-bottom: 0.25rem;">${escapeHTML(data.destination_name)}</h3>
            <p style="color: var(--text-muted); font-size: 0.875rem;"><i data-lucide="map-pin"></i> ${escapeHTML(data.destination_location || '')}</p>
          </div>
        </div>

        <div class="ticket-details-grid">
          <div class="ticket-col">
            <span class="lbl">Nama Pemesan</span>
            <span class="val">${escapeHTML(data.customer_name)}</span>
          </div>
          <div class="ticket-col">
            <span class="lbl">Tanggal Kunjungan</span>
            <span class="val">${formatDate(data.booking_date)}</span>
          </div>
          <div class="ticket-col">
            <span class="lbl">Jumlah Tiket</span>
            <span class="val">${data.quantity} Orang / Tiket</span>
          </div>
          <div class="ticket-col">
            <span class="lbl">Total Bayar</span>
            <span class="val" style="color: var(--primary); font-weight: 800;">${formatRupiah(data.total_price)}</span>
          </div>
        </div>

        <div class="ticket-barcode-box">
          <div style="font-family: monospace; font-size: 1.5rem; letter-spacing: 4px; font-weight: 800; color: var(--secondary); margin-bottom: 0.25rem;">
            ${ticketCode}
          </div>
          <div style="height: 40px; background: repeating-linear-gradient(90deg, #0F172A, #0F172A 3px, transparent 3px, transparent 6px, #0F172A 6px, #0F172A 10px, transparent 10px, transparent 13px); margin: 0.75rem auto; width: 85%;"></div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Pindai barcode ini di gerbang masuk destinasi wisata</span>
        </div>
      </div>
    </div>
  `;

  openModal('ticket-modal');
  refreshIcons();
}

function printTicket() {
  window.print();
}

// Initialize
document.addEventListener('DOMContentLoaded', initBookingPage);
