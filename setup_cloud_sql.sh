#!/bin/bash

echo "🚀 Cloud SQL PostgreSQL Kurulumu Başlıyor..."
echo ""

# Değişkenler
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
INSTANCE_NAME="kelime-db"
DB_NAME="kelime_app"
DB_USER="kelime_user"
DB_PASSWORD="KelimeApp2024!"
ROOT_PASSWORD="RootPass2024!"

echo "📋 Proje: $PROJECT_ID"
echo "📍 Bölge: $REGION"
echo ""

# Adım 1: Cloud SQL Instance Oluştur
echo "⏳ Adım 1/5: Cloud SQL Instance oluşturuluyor (5-10 dakika)..."
gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password=$ROOT_PASSWORD \
  --no-backup

if [ $? -eq 0 ]; then
    echo "✅ Instance oluşturuldu!"
else
    echo "❌ Instance oluşturulamadı. Zaten var olabilir."
fi

# Adım 2: Veritabanı Oluştur
echo ""
echo "⏳ Adım 2/5: Veritabanı oluşturuluyor..."
gcloud sql databases create $DB_NAME --instance=$INSTANCE_NAME

if [ $? -eq 0 ]; then
    echo "✅ Veritabanı oluşturuldu!"
else
    echo "❌ Veritabanı oluşturulamadı. Zaten var olabilir."
fi

# Adım 3: Kullanıcı Oluştur
echo ""
echo "⏳ Adım 3/5: Kullanıcı oluşturuluyor..."
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password=$DB_PASSWORD

if [ $? -eq 0 ]; then
    echo "✅ Kullanıcı oluşturuldu!"
else
    echo "❌ Kullanıcı oluşturulamadı. Zaten var olabilir."
fi

# Adım 4: Connection Name Al
echo ""
echo "⏳ Adım 4/5: Connection bilgileri alınıyor..."
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)")
echo "✅ Connection Name: $CONNECTION_NAME"

# Adım 5: Deploy Komutu Hazırla
echo ""
echo "⏳ Adım 5/5: Deploy komutu hazırlanıyor..."
echo ""
echo "🎉 Kurulum tamamlandı!"
echo ""
echo "📝 Şimdi şu komutu çalıştır:"
echo ""
echo "gcloud run deploy kelime-ogrenme \\"
echo "  --source . \\"
echo "  --region $REGION \\"
echo "  --allow-unauthenticated \\"
echo "  --add-cloudsql-instances=$CONNECTION_NAME \\"
echo "  --set-env-vars=\"USE_POSTGRES=true,DB_HOST=/cloudsql/$CONNECTION_NAME,DB_NAME=$DB_NAME,DB_USER=$DB_USER,DB_PASSWORD=$DB_PASSWORD\""
echo ""
echo "💾 Bilgiler:"
echo "  - Instance: $INSTANCE_NAME"
echo "  - Database: $DB_NAME"
echo "  - User: $DB_USER"
echo "  - Password: $DB_PASSWORD"
echo "  - Connection: $CONNECTION_NAME"
echo ""
