@echo off
echo ========================================
echo   Kelime Ogrenme Uygulamasi
echo ========================================
echo.

echo [1/3] Bagimliliklari kontrol ediliyor...
pip show Flask >nul 2>&1
if errorlevel 1 (
    echo Flask bulunamadi. Yukleniyor...
    pip install -r requirements.txt
) else (
    echo Tum bagimlilklar mevcut.
)

echo.
echo [2/3] Veritabani hazirlaniyor...
echo Veritabani otomatik olusturulacak.

echo.
echo [3/3] Uygulama baslatiliyor...
echo.
echo ========================================
echo   Uygulama calisiyor!
echo   URL: http://localhost:5000
echo   Durdurmak icin: Ctrl+C
echo ========================================
echo.

python app.py
