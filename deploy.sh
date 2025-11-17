#!/bin/bash

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Kelime Öğrenme Uygulaması - Deploy${NC}"
echo ""

# Proje ID al
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Google Cloud projesi seçilmemiş!${NC}"
    echo "Lütfen önce: gcloud config set project PROJE_ID"
    exit 1
fi

echo -e "${GREEN}✓ Proje: $PROJECT_ID${NC}"
echo ""

# Seçenek sun
echo "Hangi veritabanı ile deploy etmek istersiniz?"
echo "1) SQLite (Ücretsiz, geçici veriler)"
echo "2) Cloud SQL PostgreSQL (Ücretli ~$7/ay, kalıcı veriler)"
echo ""
read -p "Seçiminiz (1 veya 2): " choice

if [ "$choice" = "2" ]; then
    echo ""
    echo -e "${BLUE}📊 Cloud SQL ile deploy ediliyor...${NC}"
    
    # Cloud SQL instance var mı kontrol et
    if gcloud sql instances describe kelime-db &>/dev/null; then
        echo -e "${GREEN}✓ Cloud SQL instance mevcut${NC}"
    else
        echo -e "${BLUE}Cloud SQL instance oluşturuluyor...${NC}"
        gcloud sql instances create kelime-db \
          --database-version=POSTGRES_14 \
          --tier=db-f1-micro \
          --region=us-central1 \
          --root-password=YourStrongPassword123
        
        gcloud sql databases create kelime_app --instance=kelime-db
        gcloud sql users create kelime_user --instance=kelime-db --password=UserPassword123
    fi
    
    # Deploy
    gcloud run deploy kelime-ogrenme \
      --source . \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --memory 512Mi \
      --add-cloudsql-instances=$PROJECT_ID:us-central1:kelime-db \
      --set-env-vars="USE_POSTGRES=true,DB_HOST=/cloudsql/$PROJECT_ID:us-central1:kelime-db,DB_NAME=kelime_app,DB_USER=kelime_user,DB_PASSWORD=UserPassword123"
else
    echo ""
    echo -e "${BLUE}💾 SQLite ile deploy ediliyor...${NC}"
    
    gcloud run deploy kelime-ogrenme \
      --source . \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --memory 512Mi
fi

echo ""
echo -e "${GREEN}✓ Deploy tamamlandı!${NC}"
echo ""
echo "URL'nizi almak için:"
echo "gcloud run services describe kelime-ogrenme --region us-central1 --format='value(status.url)'"
