#!/bin/bash

# Pastikan script ini dijalankan di dalam folder backend
if [ ! -d "certbot-conf" ]; then
    echo "Tolong jalankan script ini dari dalam folder backend portdock!"
    exit 1
fi

DOMAIN="portdock.my.id"

echo "========================================="
echo "🛠️ Menyiapkan SSL Lokal menggunakan Mkcert"
echo "========================================="

# Instal mkcert jika belum ada
if ! command -v mkcert &> /dev/null; then
    echo "Mkcert belum terinstall. Mengunduh binary mkcert..."
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
    chmod +x mkcert-v*-linux-amd64
    sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    echo "✅ Mkcert berhasil diinstall!"
else
    echo "✅ Mkcert sudah terinstall."
fi

# Menginstall Local CA ke OS (membutuhkan otorisasi sudo)
echo "-----------------------------------------"
echo "⚠️ Menginstall Otoritas Sertifikat (CA) ke OS dan Browser."
echo "Anda mungkin akan diminta memasukkan kata sandi (password) sistem Anda."
mkcert -install
echo "✅ Local CA berhasil diinstall."

# Membuat folder dummy let's encrypt
CERT_DIR="certbot-conf/live/$DOMAIN"
mkdir -p "$CERT_DIR"

# Membuat sertifikat
echo "-----------------------------------------"
echo "Membuat Sertifikat SSL untuk $DOMAIN dan *.$DOMAIN..."
mkcert -cert-file "$CERT_DIR/fullchain.pem" -key-file "$CERT_DIR/privkey.pem" "$DOMAIN" "*.$DOMAIN" localhost 127.0.0.1 ::1
echo "✅ Sertifikat berhasil dibuat dan diletakkan di $CERT_DIR"

echo "========================================="
echo "Semua selesai! Nginx Portdock kini akan menggunakan SSL lokal ini."
echo "Silakan coba konfigurasi SSL kembali lewat Dashboard."
echo "========================================="
