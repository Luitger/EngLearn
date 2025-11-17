# 🚀 Deployment Rehberi

## Google Cloud Run

### Gereksinimler
- Google Cloud hesabı
- gcloud CLI kurulu

### Adım 1: Proje Hazırlığı

```bash
# Google Cloud'a giriş
gcloud auth login

# Proje seç veya oluştur
gcloud config set project YOUR_PROJECT_ID

# Cloud Run API'yi aktifleştir
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Adım 2: Deploy

```bash
# Cloud Run'a deploy et
gcloud run deploy kelime-ogrenme \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars="SECRET_KEY=$(openssl rand -hex 32)"
```

### Adım 3: URL'yi Al

Deploy tamamlandıktan sonra URL'yi alın:
```bash
gcloud run services describe kelime-ogrenme --region us-central1 --format='value(status.url)'
```

### ⚠️ Önemli Notlar

#### SQLite Sınırlamaları
- Cloud Run'da SQLite `/tmp` klasöründe çalışır
- Her yeniden başlatmada veriler sıfırlanır
- **Üretim için önerilmez!**

#### Üretim İçin Öneriler

**1. Cloud SQL (PostgreSQL) Kullanın:**
```bash
# Cloud SQL instance oluştur
gcloud sql instances create kelime-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Veritabanı oluştur
gcloud sql databases create kelime_app --instance=kelime-db

# Cloud Run'a bağla
gcloud run services update kelime-ogrenme \
  --add-cloudsql-instances=YOUR_PROJECT_ID:us-central1:kelime-db \
  --set-env-vars="DATABASE_URL=postgresql://user:pass@/kelime_app?host=/cloudsql/YOUR_PROJECT_ID:us-central1:kelime-db"
```

**2. Firestore Kullanın:**
- NoSQL veritabanı
- Otomatik ölçeklendirme
- Gerçek zamanlı senkronizasyon

### Environment Variables

Cloud Run'da ayarlanabilir:

```bash
gcloud run services update kelime-ogrenme \
  --set-env-vars="SECRET_KEY=your-secret-key" \
  --set-env-vars="DB_PATH=/tmp/kelime_app.db"
```

### Logs

```bash
# Logları görüntüle
gcloud run services logs read kelime-ogrenme --region us-central1

# Canlı loglar
gcloud run services logs tail kelime-ogrenme --region us-central1
```

### Güncelleme

```bash
# Yeni versiyon deploy et
gcloud run deploy kelime-ogrenme --source .
```

### Silme

```bash
# Service'i sil
gcloud run services delete kelime-ogrenme --region us-central1
```

## Docker ile Lokal Test

```bash
# Docker image oluştur
docker build -t kelime-ogrenme .

# Çalıştır
docker run -p 8080:8080 kelime-ogrenme

# Test et
curl http://localhost:8080
```

## Heroku

### Deploy

```bash
# Heroku'ya giriş
heroku login

# Uygulama oluştur
heroku create kelime-ogrenme

# PostgreSQL ekle
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main

# Açık
heroku open
```

## Vercel (Serverless)

Vercel için `vercel.json` oluşturun:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
```

Deploy:
```bash
vercel --prod
```

## Railway

```bash
# Railway CLI kur
npm install -g @railway/cli

# Giriş
railway login

# Deploy
railway up
```

## Sorun Giderme

### Veritabanı Sıfırlanıyor
- Cloud Run her yeniden başlatmada `/tmp` klasörünü temizler
- Çözüm: Cloud SQL veya Firestore kullanın

### CORS Hatası
- `CORS(app, supports_credentials=True)` eklenmiş
- Frontend URL'sini whitelist'e ekleyin

### Session Çalışmıyor
- `SECRET_KEY` environment variable'ı ayarlayın
- Cookie ayarlarını kontrol edin

### Port Hatası
- Cloud Run `PORT` environment variable'ını kullanır
- Kod otomatik olarak `PORT`u algılar

## Güvenlik

### Üretim Checklist
- [ ] `DEBUG=False` ayarlandı
- [ ] `SECRET_KEY` güvenli ve unique
- [ ] HTTPS kullanılıyor
- [ ] CORS doğru yapılandırılmış
- [ ] Rate limiting eklendi
- [ ] SQL injection koruması var
- [ ] XSS koruması var
- [ ] CSRF koruması var

### Environment Variables
```bash
SECRET_KEY=your-secret-key-here
DATABASE_URL=your-database-url
FLASK_ENV=production
```

## Monitoring

### Cloud Run Metrics
- CPU kullanımı
- Memory kullanımı
- Request sayısı
- Latency
- Error rate

### Logging
```python
import logging
logging.basicConfig(level=logging.INFO)
```

## Maliyet Optimizasyonu

### Cloud Run
- İlk 2 milyon istek ücretsiz
- Minimum instance: 0 (cold start)
- Maximum instance: 10 (ayarlanabilir)
- Memory: 512Mi (yeterli)

### Cloud SQL
- db-f1-micro: ~$7/ay
- Otomatik backup: +$0.08/GB/ay

## Destek

Sorunlar için:
- GitHub Issues
- Cloud Run Docs: https://cloud.google.com/run/docs
- Stack Overflow: `google-cloud-run` tag
