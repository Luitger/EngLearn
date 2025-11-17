#!/bin/bash

echo "========================================"
echo "  Kelime Öğrenme Uygulaması"
echo "========================================"
echo ""

echo "[1/3] Bağımlılıklar kontrol ediliyor..."
if ! pip show Flask > /dev/null 2>&1; then
    echo "Flask bulunamadı. Yükleniyor..."
    pip install -r requirements.txt
else
    echo "Tüm bağımlılıklar mevcut."
fi

echo ""
echo "[2/3] Veritabanı hazırlanıyor..."
echo "Veritabanı otomatik oluşturulacak."

echo ""
echo "[3/3] Uygulama başlatılıyor..."
echo ""
echo "========================================"
echo "  Uygulama çalışıyor!"
echo "  URL: http://localhost:5000"
echo "  Durdurmak için: Ctrl+C"
echo "========================================"
echo ""

python3 app.py
