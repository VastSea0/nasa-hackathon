# NASA Hackathon - Hava Durumu Analizi

NASA'nın Dünya bilimi veri setlerini kullanarak meteorolojik analiz yapan modüler proje.

## Kurulum (Linux)

```bash
# Virtual environment oluştur
python3 -m venv venv
source venv/bin/activate

# Gerekli paketleri yükle
pip install -r requirements.txt

# NASA EarthData hesabı oluştur (gerekli)
# https://urs.earthdata.nasa.gov/
```

## Çalıştırma

```bash
# Ana uygulamayı çalıştır (modüler)
python app.py

# Veya eski monolitik versiyon
python main.py
```

## Özellikler

- ✅ **Modüler yapı**: Fonksiyonlar ayrı dosyalarda
- 🛰️ **NASA veri entegrasyonu**: EarthAccess API
- 🗺️ **Harita görselleştirme**: Cartopy ile profesyonel haritalar
- 🤖 **AI analizi**: Google Gemini ile akıllı yorumlar
- 💾 **Otomatik kaydetme**: JSON ve PNG formatlarında

## Dosya Yapısı

- `app.py` - Ana uygulama (modüler)
- `weather_utils.py` - Veri çekme ve işleme
- `plotting_utils.py` - Harita ve görselleştirme
- `ai_analysis.py` - AI analizi (Gemini)
- `main.py` - Eski monolitik versiyon

## Çıktılar

- `output/` klasöründe harita görselleri
- JSON analiz dosyaları
- Konsola anlık sonuçlar

## AI Analizi (İsteğe Bağlı)

```bash
# Gemini API anahtarını ayarla
export GEMINI_API_KEY=your_api_key_here
```

## Bölge

Varsayılan: Türkiye ve çevresi (26°N-45°N, 36°E-42°E)
