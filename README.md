# 🎃 Halloween Kelime Öğrenme Uygulaması

İngilizce kelime öğrenme uygulaması - Halloween temalı, eğlenceli hikayelerle öğrenin!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)

## 📸 Ekran Görüntüleri

> Projenizin ekran görüntülerini buraya ekleyebilirsiniz

## ✨ Özellikler

- 🎴 **614 Kelime** - Zengin kelime veritabanı
- 🎃 **10 Halloween Avatar** - Cadı, Hayalet, Vampir, Kedi, Balkabağı, Zombi, İskelet, Kurt Adam, Şeytan, Mumya
- � **Seusli Telaffuz** - Web Speech API ile kadın sesi, yavaş ve net telaffuz
- 📝 **Testler** - İlerlemenizi takip edin
- 🏆 **Canlı Liderlik Tablosu** - Gerçek zamanlı güncellenen liderlik
- 🕸️ **Örümcek Ağı Animasyonu** - İnteraktif örümcek ağı efekti
- 🎨 **Halloween Material Design** - Turuncu-mor renk paleti
- 🌙 **Dark/Light Tema** - Avatar menüsünden tema değiştirme
- 📱 **Responsive** - Mobil ve masaüstü uyumlu
- 🔐 **Kullanıcı Sistemi** - Kayıt, giriş ve profil yönetimi
- 📊 **İstatistikler** - Tamamlanan test ve ortalama başarı takibi

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Python 3.8 veya üzeri
- pip (Python paket yöneticisi)

### Kurulum

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/kullaniciadi/kelime-ogrenme.git
cd kelime-ogrenme
```

2. **Sanal ortam oluşturun (önerilen):**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Gerekli paketleri yükleyin:**
```bash
pip install -r requirements.txt
```

4. **Uygulamayı başlatın:**
```bash
python app.py
```

5. **Tarayıcınızda açın:**
```
http://localhost:5000
```

## 🎮 Kullanım

### Kayıt ve Giriş

1. Ana sayfada **"Hemen Başla"** butonuna tıklayın
2. Kullanıcı adı ve şifre ile kayıt olun
3. 10 farklı Halloween avatar'ından birini seçin

### Kelime Öğrenme

1. **Kartları Çevirin** - Kartlara tıklayarak İngilizce ve Türkçe anlamları görün
2. **Sesli Dinleyin** - 🔊 butonuna tıklayarak kelimenin telaffuzunu dinleyin
3. **Yeni Kelime** - 🎲 butonuna tıklayarak rastgele kelime görün

### Test Çözme

1. **Test Çöz** butonuna tıklayın
2. 10 soruluk testi tamamlayın
3. Sonuçlarınızı görün ve istatistiklerinizi takip edin

### Avatar ve Tema

1. Sağ üstteki avatar'a tıklayın
2. **Avatar Değiştir** - Yeni avatar seçin
3. **Tema Değiştir** - Karanlık/Aydınlık tema arasında geçiş yapın

## 🔊 Sesli Telaffuz

- **Web Speech API** kullanılıyor
- **Platform bazlı kadın sesi** otomatik seçiliyor
- **Yavaş ve net telaffuz** (0.75x hız)
- **Yüksek pitch** (1.3 - kadın sesi için optimize)

### Desteklenen Sesler

- **Windows:** Microsoft Zira, Hazel, Susan
- **macOS/iOS:** Samantha, Victoria, Karen, Moira
- **Android:** Google UK/US English Female

## 🕸️ Örümcek Ağı Animasyonu

- Sol üst köşede gerçekçi örümcek ağı
- Fare veya dokunmatik ile ağları koparabilirsiniz
- Kopan ağlar otomatik olarak yeniden oluşur
- Dark/Light tema desteği
- Canvas API ile optimize edilmiş animasyon

## 📁 Proje Yapısı

```
kelime-ogrenme/
├── app.py                      # Flask backend
├── requirements.txt            # Python bağımlılıkları
├── README.md                   # Proje dokümantasyonu
├── LICENSE                     # MIT lisansı
├── .gitignore                  # Git ignore dosyası
├── static/
│   ├── avatars/               # Avatar resimleri (10 adet)
│   │   ├── girl1.png          # Cadı Luna
│   │   ├── girl2.png          # Hayalet Aria
│   │   ├── girl3.png          # Vampir Nova
│   │   ├── girl4.png          # Kara Kedi Zara
│   │   ├── girl5.png          # Balkabağı Maya
│   │   ├── boy1.png           # Zombi Leo
│   │   ├── boy2.png           # İskelet Max
│   │   ├── boy3.png           # Kurt Adam Alex
│   │   ├── boy4.png           # Şeytan Ryan
│   │   └── boy5.png           # Mumya Jake
│   ├── css/
│   │   └── material.css       # Material Design stilleri
│   └── js/
│       ├── api.js             # API fonksiyonları
│       ├── avatars.js         # Avatar yönetimi
│       ├── speech.js          # Sesli telaffuz
│       ├── leaderboard.js     # Liderlik tablosu
│       └── spider-web.js      # Örümcek ağı animasyonu
└── templates/
    └── index.html             # Ana sayfa (SPA)
```

## 🛠️ Teknolojiler

### Backend
- **Flask 3.0.0** - Web framework
- **SQLite** - Veritabanı
- **Flask-CORS** - CORS desteği

### Frontend
- **Vanilla JavaScript** - Framework kullanılmadan
- **HTML5 Canvas** - Örümcek ağı animasyonu
- **CSS3** - Modern stil ve animasyonlar
- **Web Speech API** - Sesli telaffuz

### Özellikler
- **Material Design** - Halloween temalı
- **Responsive Design** - Mobil uyumlu
- **Dark/Light Theme** - Tema desteği
- **Spaced Repetition** - Akıllı tekrar sistemi
- **Session Management** - Güvenli oturum yönetimi

## 📊 Veritabanı Şeması

### users
- `id` - Kullanıcı ID
- `username` - Kullanıcı adı (unique)
- `password` - Hashlenmiş şifre
- `email` - E-posta (opsiyonel)
- `avatar` - Avatar ID
- `created_at` - Kayıt tarihi

### learned_words
- `id` - Kayıt ID
- `user_id` - Kullanıcı ID
- `word_english` - İngilizce kelime
- `learned_at` - Öğrenme tarihi
- `review_count` - Tekrar sayısı
- `next_review` - Sonraki tekrar tarihi
- `ease_factor` - Spaced Repetition faktörü

### test_results
- `id` - Test ID
- `user_id` - Kullanıcı ID
- `score` - Doğru cevap sayısı
- `total_questions` - Toplam soru sayısı
- `completed_at` - Tamamlanma tarihi

### daily_activity
- `id` - Aktivite ID
- `user_id` - Kullanıcı ID
- `date` - Tarih
- `words_learned` - Öğrenilen kelime sayısı
- `tests_completed` - Tamamlanan test sayısı
- `study_time` - Çalışma süresi

## 🔐 Güvenlik

- Şifreler SHA-256 ile hashlenmiş
- Session tabanlı kimlik doğrulama
- CORS koruması
- SQL injection koruması (parameterized queries)

## 🐛 Sorun Giderme

### Ses Çalmıyor
- Tarayıcı ses iznini kontrol edin
- Sayfayla etkileşime geçtikten sonra deneyin
- F12 > Console'da hata mesajlarını kontrol edin

### Örümcek Ağı Görünmüyor
- Tarayıcınızın Canvas API'yi desteklediğinden emin olun
- Sayfayı yenileyin (Ctrl+F5)
- Donanım hızlandırmasını kontrol edin

### Veritabanı Hatası
- `kelime_app.db` dosyasını silin ve uygulamayı yeniden başlatın
- Veritabanı otomatik olarak yeniden oluşturulacak

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

Luitger tarafından geliştirildi.

## 🙏 Teşekkürler

- Halloween avatar tasarımları için
- Material Design ilham kaynağı için
- Açık kaynak topluluğuna

## 📞 İletişim

Sorularınız veya önerileriniz için:
- GitHub Issues: [Proje Issues](https://github.com/Luitger/kelime-ogrenme/issues)
- E-posta: dev.furkan.omer@gmail.com

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
