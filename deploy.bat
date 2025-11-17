@echo off
echo.
echo ========================================
echo   Kelime Ogrenme Uygulamasi - Deploy
echo ========================================
echo.

REM Proje ID al
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

if "%PROJECT_ID%"=="" (
    echo [HATA] Google Cloud projesi secilmemis!
    echo Lutfen once: gcloud config set project PROJE_ID
    pause
    exit /b 1
)

echo [OK] Proje: %PROJECT_ID%
echo.

echo Hangi veritabani ile deploy etmek istersiniz?
echo 1^) SQLite ^(Ucretsiz, gecici veriler^)
echo 2^) Cloud SQL PostgreSQL ^(Ucretli ~$7/ay, kalici veriler^)
echo.
set /p choice="Seciminiz (1 veya 2): "

if "%choice%"=="2" (
    echo.
    echo [INFO] Cloud SQL ile deploy ediliyor...
    
    REM Cloud SQL instance var mi kontrol et
    gcloud sql instances describe kelime-db >nul 2>&1
    if errorlevel 1 (
        echo [INFO] Cloud SQL instance olusturuluyor...
        gcloud sql instances create kelime-db --database-version=POSTGRES_14 --tier=db-f1-micro --region=us-central1 --root-password=YourStrongPassword123
        gcloud sql databases create kelime_app --instance=kelime-db
        gcloud sql users create kelime_user --instance=kelime-db --password=UserPassword123
    ) else (
        echo [OK] Cloud SQL instance mevcut
    )
    
    REM Deploy
    gcloud run deploy kelime-ogrenme --source . --platform managed --region us-central1 --allow-unauthenticated --memory 512Mi --add-cloudsql-instances=%PROJECT_ID%:us-central1:kelime-db --set-env-vars="USE_POSTGRES=true,DB_HOST=/cloudsql/%PROJECT_ID%:us-central1:kelime-db,DB_NAME=kelime_app,DB_USER=kelime_user,DB_PASSWORD=UserPassword123"
) else (
    echo.
    echo [INFO] SQLite ile deploy ediliyor...
    
    gcloud run deploy kelime-ogrenme --source . --platform managed --region us-central1 --allow-unauthenticated --memory 512Mi
)

echo.
echo [OK] Deploy tamamlandi!
echo.
echo URL'nizi almak icin:
echo gcloud run services describe kelime-ogrenme --region us-central1 --format="value(status.url)"
echo.
pause
