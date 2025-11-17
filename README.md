# 🕷️ Kelime Öğrenme Uygulaması

Eğlenceli hikayelerle İngilizce kelime öğrenme uygulaması.

## ✨ Özellikler

- 📚 614 kelime
- 🎴 Flashcard sistemi
- � Seslin telaffuz
- 🌙 Karanlık/Aydınlık tema
- 🔍 Kelime arama
- 📱 Responsive tasarım

## 🚀 Lokal Çalıştırma

```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Uygulamayı başlat
python app.py
```

Tarayıcıda aç: http://localhost:8080

## ☁️ Google Cloud Run'a Deploy

```bash
# Proje seç
gcloud config set project PROJE_ID

# Deploy et
gcloud run deploy kelime-ogrenme \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Veya Windows'ta:
```bash
deploy.bat
```

## 📁 Proje Yapısı

```
Project02/
├── app.py              # Flask uygulaması
├── requirements.txt    # Python bağımlılıkları
├── Procfile           # Gunicorn config
├── deploy.bat         # Deploy script
├── templates/
│   └── index.html     # Ana sayfa
└── static/
    ├── css/           # Stiller
    ├── js/            # JavaScript
    ├── avatars/       # Avatar resimleri
    └── words.json     # Kelime veritabanı
```

## 🎨 Kullanım

1. **Kelime Öğren:** Kartı çevirmek için tıkla
2. **Yeni Kelime:** 🎲 butonuna tıkla
3. **Arama:** Türkçe veya İngilizce kelime ara
4. **Tema:** Sağ üstteki 🌙/☀️ butonuna tıkla

## 📝 Lisans

MIT License
