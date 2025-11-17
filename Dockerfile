# Python 3.11 slim image kullan
FROM python:3.11-slim

# Çalışma dizini
WORKDIR /app

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıkları
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyala
COPY . .

# /tmp klasörünü oluştur (SQLite için)
RUN mkdir -p /tmp

# Port
ENV PORT=8080
EXPOSE 8080

# Gunicorn ile çalıştır
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
