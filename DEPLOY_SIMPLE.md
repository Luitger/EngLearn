# 🚀 Basit Kullanıcı Yönetimi - Deploy Rehberi

## Hazırlık

1. Bu dosyaları kullan:
   - `simple_app.py` → `app.py` olarak yeniden adlandır
   - `requirements_simple.txt` → `requirements.txt` olarak yeniden adlandır
   - `Procfile_simple` → `Procfile` olarak yeniden adlandır

2. Veya komutla:
```bash
copy simple_app.py app.py
copy requirements_simple.txt requirements.txt
copy Procfile_simple Procfile
```

## Google Cloud Run'a Deploy

```bash
# 1. Google Cloud'a giriş yap
gcloud auth login

# 2. Proje seç
gcloud config set project PROJE_ID

# 3. API'leri aktifleştir
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 4. Deploy et
gcloud run deploy kullanici-yonetim ^
  --source . ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --memory 512Mi

# 5. URL'yi al
gcloud run services describe kullanici-yonetim --region us-central1 --format="value(status.url)"
```

## Özellikler

✅ Otomatik veritabanı oluşturma
✅ Kullanıcı ekleme
✅ Kullanıcı silme
✅ Kullanıcı listesi
✅ Giriş sistemi
✅ Şifre hashleme
✅ Modern arayüz

## API Endpoints

- `GET /` - Ana sayfa (kullanıcı yönetim arayüzü)
- `GET /api/users` - Tüm kullanıcıları listele
- `POST /api/users` - Yeni kullanıcı ekle
- `DELETE /api/users/<id>` - Kullanıcı sil
- `POST /api/login` - Kullanıcı girişi

## Test

Lokal test:
```bash
python simple_app.py
```

Tarayıcıda aç: http://localhost:8080

## Notlar

⚠️ SQLite `/tmp` klasöründe çalışır - her yeniden başlatmada veriler sıfırlanır
⚠️ Üretim için Cloud SQL kullanmanız önerilir
✅ Ama test ve demo için mükemmel çalışır!
