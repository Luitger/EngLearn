# 🚀 Deploy Rehberi - Kelime Öğrenme Uygulaması

## Hızlı Başlangıç

### Windows:
```bash
deploy.bat
```

### Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

Script size 2 seçenek sunacak:
1. **SQLite** - Ücretsiz, test için ideal (veriler geçici)
2. **Cloud SQL** - Ücretli (~$7/ay), üretim için (veriler kalıcı)

## Manuel Deploy

### 1. Proje Hazırlığı

```bash
# Google Cloud'a giriş
gcloud auth login

# Proje seç
gcloud config set project PROJE_ID

# API'leri aktifleştir
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. SQLite ile Deploy (Basit)

```bash
gcloud run deploy kelime-ogrenme \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi
```

**Avantajlar:**
- ✅ Ücretsiz
- ✅ Hızlı kurulum
- ✅ Test için ideal

**Dezavantajlar:**
- ❌ Her yeniden başlatmada veriler sıfırlanır
- ❌ Üretim için uygun değil

### 3. Cloud SQL ile Deploy (Profesyonel)

Detaylı talimatlar için: `CLOUD_SQL_SETUP.md`

```bash
# Cloud SQL oluştur
gcloud sql instances create kelime-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YourStrongPassword123

gcloud sql databases create kelime_app --instance=kelime-db
gcloud sql users create kelime_user --instance=kelime-db --password=UserPassword123

# Deploy et
gcloud run deploy kelime-ogrenme \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --add-cloudsql-instances=PROJE_ID:us-central1:kelime-db \
  --set-env-vars="USE_POSTGRES=true,DB_HOST=/cloudsql/PROJE_ID:us-central1:kelime-db,DB_NAME=kelime_app,DB_USER=kelime_user,DB_PASSWORD=UserPassword123"
```

**Avantajlar:**
- ✅ Kalıcı veriler
- ✅ Yüksek performans
- ✅ Otomatik yedekleme
- ✅ Üretim için hazır

**Maliyet:**
- 💰 ~$7/ay (db-f1-micro)

## URL'yi Alma

```bash
gcloud run services describe kelime-ogrenme --region us-central1 --format='value(status.url)'
```

## Güncelleme

Kod değişikliği yaptıktan sonra:
```bash
gcloud run deploy kelime-ogrenme --source .
```

## Logs

```bash
# Son 50 log
gcloud run services logs read kelime-ogrenme --region us-central1 --limit 50

# Canlı loglar
gcloud run services logs tail kelime-ogrenme --region us-central1
```

## Lokal Test

```bash
# SQLite ile
python app.py

# PostgreSQL ile (Docker gerekli)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=test postgres:14
set USE_POSTGRES=true
set DB_HOST=localhost
set DB_NAME=kelime_app
set DB_USER=postgres
set DB_PASSWORD=test
python app.py
```

## Sorun Giderme

### Build hatası:
- `Procfile` dosyasının olduğundan emin ol
- `requirements.txt` dosyasının olduğundan emin ol

### Veritabanı bağlantı hatası:
```bash
# Cloud SQL durumunu kontrol et
gcloud sql instances describe kelime-db

# Environment variables kontrol et
gcloud run services describe kelime-ogrenme --region us-central1
```

### Port hatası:
- Kod otomatik olarak `PORT` environment variable'ını kullanır
- Cloud Run otomatik ayarlar, değiştirmeye gerek yok

## Silme

```bash
# Cloud Run servisini sil
gcloud run services delete kelime-ogrenme --region us-central1

# Cloud SQL'i sil (opsiyonel)
gcloud sql instances delete kelime-db
```

## Destek

- Cloud Run Docs: https://cloud.google.com/run/docs
- Cloud SQL Docs: https://cloud.google.com/sql/docs
- GitHub Issues: [Proje linki]
