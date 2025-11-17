# 🚀 Google Cloud Run Deploy Rehberi

## Hazırlık

Dosyalar hazır! Şimdi deploy edebilirsin.

## Deploy Adımları

### 1. Google Cloud'a Giriş
```bash
gcloud auth login
```

### 2. Proje Seç
```bash
gcloud config set project PROJE_ID
```
`PROJE_ID` yerine kendi Google Cloud proje ID'nizi yazın.

### 3. API'leri Aktifleştir
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 4. Deploy Et
```bash
gcloud run deploy kullanici-yonetim --source . --platform managed --region us-central1 --allow-unauthenticated --memory 512Mi
```

### 5. URL'yi Al
Deploy tamamlandıktan sonra URL'yi göreceksin. Veya şu komutla al:
```bash
gcloud run services describe kullanici-yonetim --region us-central1 --format="value(status.url)"
```

## Özellikler

✅ Otomatik veritabanı oluşturma
✅ Kullanıcı ekleme
✅ Kullanıcı silme  
✅ Kullanıcı listesi
✅ Giriş sistemi
✅ Şifre hashleme (SHA-256)
✅ Modern, responsive arayüz

## API Endpoints

- `GET /` - Ana sayfa (kullanıcı yönetim arayüzü)
- `GET /api/users` - Tüm kullanıcıları listele
- `POST /api/users` - Yeni kullanıcı ekle
  ```json
  {
    "username": "kullanici",
    "email": "email@example.com",
    "password": "sifre123"
  }
  ```
- `DELETE /api/users/<id>` - Kullanıcı sil
- `POST /api/login` - Kullanıcı girişi
  ```json
  {
    "username": "kullanici",
    "password": "sifre123"
  }
  ```

## Lokal Test

```bash
python app.py
```

Tarayıcıda aç: http://localhost:8080

## Notlar

⚠️ **Önemli:** SQLite `/tmp` klasöründe çalışır - Cloud Run her yeniden başlatmada verileri sıfırlar.

💡 **Üretim için:** Cloud SQL (PostgreSQL) kullanmanız önerilir. Ama test ve demo için mükemmel çalışır!

## Güncelleme

Değişiklik yaptıktan sonra tekrar deploy et:
```bash
gcloud run deploy kullanici-yonetim --source .
```

## Silme

Servisi silmek için:
```bash
gcloud run services delete kullanici-yonetim --region us-central1
```

## Sorun Giderme

### Build hatası alıyorsan:
- `Procfile` dosyasının olduğundan emin ol
- `requirements.txt` dosyasının olduğundan emin ol

### Port hatası:
- Kod otomatik olarak `PORT` environment variable'ını kullanır
- Cloud Run otomatik olarak ayarlar

### Veritabanı hatası:
- `/tmp` klasörü otomatik oluşturulur
- Her deploy'da veriler sıfırlanır (normal)

## Destek

Sorun yaşarsan:
- Cloud Run logs: `gcloud run services logs read kullanici-yonetim --region us-central1`
- Cloud Run docs: https://cloud.google.com/run/docs
