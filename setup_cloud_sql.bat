@echo off
echo 🚀 Cloud SQL PostgreSQL Kurulumu Başlıyor...
echo.

REM Değişkenler
set REGION=us-central1
set INSTANCE_NAME=kelime-db
set DB_NAME=kelime_app
set DB_USER=kelime_user
set DB_PASSWORD=KelimeApp2024!
set ROOT_PASSWORD=RootPass2024!

echo 📋 Bölge: %REGION%
echo.

REM Adım 1: Cloud SQL Instance Oluştur
echo ⏳ Adım 1/5: Cloud SQL Instance oluşturuluyor (5-10 dakika)...
gcloud sql instances create %INSTANCE_NAME% --database-version=POSTGRES_14 --tier=db-f1-micro --region=%REGION% --root-password=%ROOT_PASSWORD% --no-backup

if %errorlevel% equ 0 (
    echo ✅ Instance oluşturuldu!
) else (
    echo ❌ Instance oluşturulamadı. Zaten var olabilir.
)

REM Adım 2: Veritabanı Oluştur
echo.
echo ⏳ Adım 2/5: Veritabanı oluşturuluyor...
gcloud sql databases create %DB_NAME% --instance=%INSTANCE_NAME%

if %errorlevel% equ 0 (
    echo ✅ Veritabanı oluşturuldu!
) else (
    echo ❌ Veritabanı oluşturulamadı. Zaten var olabilir.
)

REM Adım 3: Kullanıcı Oluştur
echo.
echo ⏳ Adım 3/5: Kullanıcı oluşturuluyor...
gcloud sql users create %DB_USER% --instance=%INSTANCE_NAME% --password=%DB_PASSWORD%

if %errorlevel% equ 0 (
    echo ✅ Kullanıcı oluşturuldu!
) else (
    echo ❌ Kullanıcı oluşturulamadı. Zaten var olabilir.
)

REM Adım 4: Connection Name Al
echo.
echo ⏳ Adım 4/5: Connection bilgileri alınıyor...
for /f %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(connectionName)"') do set CONNECTION_NAME=%%i
echo ✅ Connection Name: %CONNECTION_NAME%

REM Adım 5: Deploy Komutu Göster
echo.
echo ⏳ Adım 5/5: Deploy komutu hazırlanıyor...
echo.
echo 🎉 Kurulum tamamlandı!
echo.
echo 📝 Şimdi şu komutu çalıştır:
echo.
echo gcloud run deploy kelime-ogrenme --source . --region %REGION% --allow-unauthenticated --add-cloudsql-instances=%CONNECTION_NAME% --set-env-vars="USE_POSTGRES=true,DB_HOST=/cloudsql/%CONNECTION_NAME%,DB_NAME=%DB_NAME%,DB_USER=%DB_USER%,DB_PASSWORD=%DB_PASSWORD%"
echo.
echo 💾 Bilgiler:
echo   - Instance: %INSTANCE_NAME%
echo   - Database: %DB_NAME%
echo   - User: %DB_USER%
echo   - Password: %DB_PASSWORD%
echo   - Connection: %CONNECTION_NAME%
echo.
pause
