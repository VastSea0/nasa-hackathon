# NASA Hackathon - Hava Durumu Analizi

NASA'nın Dünya bilimi veri setlerini kullanarak meteorolojik analiz yapan proje.

## Kurulum (Linux)

```bash
# Virtual environment oluştur
python3 -m venv hackathon
source hackathon/bin/activate

# Gerekli paketleri yükle
pip install -r requirements.txt

# NASA EarthData hesabı oluştur (gerekli)
# https://urs.earthdata.nasa.gov/
```

## Çalıştırma

```bash
python main.py
```

Program başlangıç ve bitiş tarihlerini soracak (YYYY-MM-DD formatında).

## Çıktılar

- `output/` klasöründe harita görselleri
- Konsola analiz özetleri
- Yağış, sıcaklık, rüzgar ve kuraklık verileri

## Bölge

Varsayılan: Türkiye ve çevresi (26°N-45°N, 36°E-42°E)
