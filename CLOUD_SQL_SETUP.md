# Cloud SQL PostgreSQL Kurulum Rehberi

## Adım 1: Cloud SQL Instance Oluştur (5-10 dakika)

```bash
gcloud sql instances create kelime-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YourStrongPassword123
```

## Adım 2: Veritabanı Oluştur

```bash
gcloud sql databases create kelime_app --instance=kelime-db
```

## Adım 3: Kullanıcı Oluştur

```bash
gcloud sql users create kelime_user \
  --instance=kelime-db \
  --password=UserPassword123
```

## Adım 4: Connection Name Al

```bash
gcloud sql instances describe kelime-db --format="value(connectionName)"
```

Çıktı: `YOUR_PROJECT:us-central1:kelime-db`

## Adım 5: Cloud Run'a Deploy

```bash
gcloud run deploy kelime-ogrenme \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances=YOUR_PROJECT:us-central1:kelime-db \
  --set-env-vars="USE_POSTGRES=true,DB_HOST=/cloudsql/YOUR_PROJECT:us-central1:kelime-db,DB_NAME=kelime_app,DB_USER=kelime_user,DB_PASSWORD=UserPassword123,SECRET_KEY=$(openssl rand -hex 32)"
```

## Alternatif: Basit Yol (SQLite ile)

Eğer Cloud SQL çok karmaşıksa, şimdilik SQLite ile deploy et:

```bash
gcloud run deploy kelime-ogrenme \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

**Not:** SQLite ile veriler geçici olacak ama uygulama çalışacak!

## Maliyet

- **Cloud SQL db-f1-micro:** ~$7/ay
- **Cloud Run:** İlk 2M istek ücretsiz
- **Toplam:** ~$7-10/ay

## Sorun Giderme

### Build Hatası
```bash
# Dockerfile ile deploy et
gcloud run deploy kelime-ogrenme \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --use-http2
```

### Connection Hatası
- Cloud SQL instance'ın çalıştığından emin ol
- Connection name'i doğru yazdığından emin ol
- Cloud Run service account'a Cloud SQL Client rolü ver

## Hızlı Test

Lokal test (SQLite):
```bash
python app.py
```

Lokal test (PostgreSQL):
```bash
export USE_POSTGRES=true
export DB_HOST=localhost
export DB_NAME=kelime_app
export DB_USER=kelime_user
export DB_PASSWORD=UserPassword123
python app_postgres.py
```
