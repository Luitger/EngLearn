# 🗄️ Google Cloud SQL Kurulum Rehberi

## Adım 1: Cloud SQL Instance Oluştur

```bash
# Cloud SQL API'yi aktifleştir
gcloud services enable sqladmin.googleapis.com

# PostgreSQL instance oluştur (db-f1-micro = ücretsiz tier)
gcloud sql instances create kelime-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YourStrongPassword123

# Veritabanı oluştur
gcloud sql databases create kelime_app --instance=kelime-db

# Kullanıcı oluştur
gcloud sql users create kelime_user \
  --instance=kelime-db \
  --password=UserPassword123
```

## Adım 2: Cloud Run'a Deploy Et

```bash
# Cloud Run'a deploy et ve Cloud SQL'e bağla
gcloud run deploy kelime-ogrenme \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --add-cloudsql-instances=PROJE_ID:us-central1:kelime-db \
  --set-env-vars="USE_POSTGRES=true" \
  --set-env-vars="DB_HOST=/cloudsql/PROJE_ID:us-central1:kelime-db" \
  --set-env-vars="DB_NAME=kelime_app" \
  --set-env-vars="DB_USER=kelime_user" \
  --set-env-vars="DB_PASSWORD=UserPassword123" \
  --set-env-vars="SECRET_KEY=$(openssl rand -hex 32)"
```

**ÖNEMLİ:** `PROJE_ID` yerine kendi Google Cloud proje ID'nizi yazın!

Proje ID'nizi öğrenmek için:
```bash
gcloud config get-value project
```

## Adım 3: Test Et

Deploy tamamlandıktan sonra URL'yi al:
```bash
gcloud run services describe kelime-ogrenme --region us-central1 --format='value(status.url)'
```

Tarayıcıda aç ve test et!

## Maliyet

- **Cloud SQL (db-f1-micro):** ~$7/ay
- **Cloud Run:** İlk 2 milyon istek ücretsiz
- **Toplam:** ~$7-10/ay

## Alternatif: SQLite ile Başla (Ücretsiz)

Eğer Cloud SQL maliyetinden kaçınmak istiyorsan, SQLite ile başla:

```bash
gcloud run deploy kelime-ogrenme \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi
```

**Not:** SQLite `/tmp` klasöründe çalışır, her yeniden başlatmada veriler sıfırlanır. Test için iyidir.

## Güncelleme

Kod değişikliği yaptıktan sonra:
```bash
gcloud run deploy kelime-ogrenme --source .
```

## Logs

```bash
# Logları görüntüle
gcloud run services logs read kelime-ogrenme --region us-central1 --limit 50

# Canlı loglar
gcloud run services logs tail kelime-ogrenme --region us-central1
```

## Sorun Giderme

### Cloud SQL bağlantı hatası:
```bash
# Instance durumunu kontrol et
gcloud sql instances describe kelime-db

# Bağlantı adını kontrol et
gcloud sql instances describe kelime-db --format='value(connectionName)'
```

### Environment variables kontrol:
```bash
gcloud run services describe kelime-ogrenme --region us-central1 --format='value(spec.template.spec.containers[0].env)'
```

## Silme

Servisleri silmek için:
```bash
# Cloud Run servisini sil
gcloud run services delete kelime-ogrenme --region us-central1

# Cloud SQL instance'ı sil
gcloud sql instances delete kelime-db
```
