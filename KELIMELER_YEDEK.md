# 🔒 Kelime Veritabanı Yedekleme

## Önemli Dosyalar

Bu dosyalar **ASLA SİLİNMEMELİ**:

1. **`static/words.json`** - Ana kelime veritabanı (614 kelime)
2. **`words_backup.json`** - Yedek kopya
3. **`index_backup.html`** - Orijinal kaynak dosya

## Kelime Sayısı

✅ **614 kelime** aktif

## Yedekleme Tarihi

Son yedekleme: 17 Kasım 2025

## Kurtarma

Eğer `static/words.json` silinirse:

```bash
# Yedekten geri yükle
copy words_backup.json static\words.json
```

Veya `index_backup.html` dosyasından çıkar:

```bash
python extract_words.py
```

## Kelime Formatı

```json
{
  "english": "hello",
  "turkish": "merhaba",
  "pronunciation": "he-lou",
  "story": "Hello! How are you today?",
  "story_tr": "Merhaba! Bugün nasılsın?"
}
```

## Güvenlik

- ✅ Git'e commit edildi
- ✅ Yedek dosya oluşturuldu
- ✅ .gitignore'da korunuyor
- ✅ Dokümante edildi

**NOT:** Bu dosyaları silmeden önce iki kez düşün!
